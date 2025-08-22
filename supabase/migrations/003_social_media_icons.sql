-- Social Media Icons Schema Extension
-- This migration extends the user_links table to support custom icon URLs and icon preferences

-- Add new columns to user_links table for social media icon functionality
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS custom_icon_url TEXT;
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS icon_variant TEXT DEFAULT 'default';
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS use_custom_icon BOOLEAN DEFAULT false;
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS platform_detected TEXT;

-- Add check constraint for custom icon URLs (basic validation)
ALTER TABLE user_links ADD CONSTRAINT check_custom_icon_url 
  CHECK (custom_icon_url IS NULL OR custom_icon_url ~ '^https?://.*\.(png|jpg|jpeg|svg|webp|gif)(\?.*)?$');

-- Add check constraint for icon variants
ALTER TABLE user_links ADD CONSTRAINT check_icon_variant 
  CHECK (icon_variant IN ('default', 'variant1', 'variant2', 'variant3', 'custom'));

-- Add check constraint for platform detection
ALTER TABLE user_links ADD CONSTRAINT check_platform_detected 
  CHECK (platform_detected IS NULL OR platform_detected IN (
    'twitter', 'linkedin', 'instagram', 'github', 'discord', 'youtube', 
    'tiktok', 'facebook', 'mastodon', 'reddit', 'twitch', 'snapchat'
  ));

-- Create index for platform detection queries
CREATE INDEX IF NOT EXISTS idx_user_links_platform_detected ON user_links(platform_detected);
CREATE INDEX IF NOT EXISTS idx_user_links_category_platform ON user_links(category, platform_detected);

-- Update existing social media links to have proper platform detection
-- This is a one-time update for existing data
UPDATE user_links 
SET platform_detected = CASE 
  WHEN LOWER(url) LIKE '%twitter.com%' OR LOWER(url) LIKE '%x.com%' THEN 'twitter'
  WHEN LOWER(url) LIKE '%linkedin.com%' THEN 'linkedin'
  WHEN LOWER(url) LIKE '%instagram.com%' THEN 'instagram'
  WHEN LOWER(url) LIKE '%github.com%' THEN 'github'
  WHEN LOWER(url) LIKE '%discord.com%' OR LOWER(url) LIKE '%discord.gg%' THEN 'discord'
  WHEN LOWER(url) LIKE '%youtube.com%' OR LOWER(url) LIKE '%youtu.be%' THEN 'youtube'
  WHEN LOWER(url) LIKE '%tiktok.com%' THEN 'tiktok'
  WHEN LOWER(url) LIKE '%facebook.com%' OR LOWER(url) LIKE '%fb.com%' THEN 'facebook'
  WHEN LOWER(url) LIKE '%mastodon%' THEN 'mastodon'
  WHEN LOWER(url) LIKE '%reddit.com%' THEN 'reddit'
  WHEN LOWER(url) LIKE '%twitch.tv%' THEN 'twitch'
  WHEN LOWER(url) LIKE '%snapchat.com%' THEN 'snapchat'
  ELSE NULL
END
WHERE category = 'social' AND platform_detected IS NULL;

-- Function to automatically detect platform when inserting/updating social media links
CREATE OR REPLACE FUNCTION detect_social_platform()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process social media category links
  IF NEW.category = 'social' THEN
    NEW.platform_detected := CASE 
      WHEN LOWER(NEW.url) LIKE '%twitter.com%' OR LOWER(NEW.url) LIKE '%x.com%' THEN 'twitter'
      WHEN LOWER(NEW.url) LIKE '%linkedin.com%' THEN 'linkedin'
      WHEN LOWER(NEW.url) LIKE '%instagram.com%' THEN 'instagram'
      WHEN LOWER(NEW.url) LIKE '%github.com%' THEN 'github'
      WHEN LOWER(NEW.url) LIKE '%discord.com%' OR LOWER(NEW.url) LIKE '%discord.gg%' THEN 'discord'
      WHEN LOWER(NEW.url) LIKE '%youtube.com%' OR LOWER(NEW.url) LIKE '%youtu.be%' THEN 'youtube'
      WHEN LOWER(NEW.url) LIKE '%tiktok.com%' THEN 'tiktok'
      WHEN LOWER(NEW.url) LIKE '%facebook.com%' OR LOWER(NEW.url) LIKE '%fb.com%' THEN 'facebook'
      WHEN LOWER(NEW.url) LIKE '%mastodon%' THEN 'mastodon'
      WHEN LOWER(NEW.url) LIKE '%reddit.com%' THEN 'reddit'
      WHEN LOWER(NEW.url) LIKE '%twitch.tv%' THEN 'twitch'
      WHEN LOWER(NEW.url) LIKE '%snapchat.com%' THEN 'snapchat'
      ELSE NULL
    END;
    
    -- Set default icon variant if not specified
    IF NEW.icon_variant IS NULL THEN
      NEW.icon_variant := 'default';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically detect platform
DROP TRIGGER IF EXISTS trigger_detect_social_platform ON user_links;
CREATE TRIGGER trigger_detect_social_platform
  BEFORE INSERT OR UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION detect_social_platform();

-- Add comments for documentation
COMMENT ON COLUMN user_links.custom_icon_url IS 'Custom icon URL for social media links (must be a valid image URL)';
COMMENT ON COLUMN user_links.icon_variant IS 'Icon variant selection (default, variant1, variant2, variant3, custom)';
COMMENT ON COLUMN user_links.use_custom_icon IS 'Whether to use custom icon URL instead of platform default';
COMMENT ON COLUMN user_links.platform_detected IS 'Automatically detected social media platform from URL';

-- Create a view for social media links with icon information
CREATE OR REPLACE VIEW social_media_links AS
SELECT 
  ul.*,
  CASE 
    WHEN ul.use_custom_icon AND ul.custom_icon_url IS NOT NULL THEN ul.custom_icon_url
    WHEN ul.platform_detected IS NOT NULL THEN 
      CONCAT('/icons/', ul.platform_detected, '/', 
             COALESCE(ul.icon_variant, 'default'), '.png')
    ELSE '/icons/default/link.png'
  END AS resolved_icon_url,
  CASE 
    WHEN ul.platform_detected IS NOT NULL THEN 
      INITCAP(ul.platform_detected)
    ELSE ul.title
  END AS display_name
FROM user_links ul
WHERE ul.category = 'social' AND ul.is_active = true;

-- Grant appropriate permissions
GRANT SELECT ON social_media_links TO authenticated;
GRANT SELECT ON social_media_links TO anon;
