-- GitHub Project Live URL Extension
-- This migration adds a live_project_url field for GitHub projects

-- Add live_project_url column to user_links table
ALTER TABLE user_links 
ADD COLUMN IF NOT EXISTS live_project_url TEXT;

-- Add constraint to validate URLs (optional but recommended)
-- Drop constraint if it exists, then add it
ALTER TABLE user_links DROP CONSTRAINT IF EXISTS check_live_project_url;
ALTER TABLE user_links 
ADD CONSTRAINT check_live_project_url 
CHECK (
  live_project_url IS NULL OR 
  live_project_url ~ '^https?://.*'
);

-- Create index for better performance on live project URL queries
CREATE INDEX IF NOT EXISTS idx_user_links_live_project_url 
ON user_links(live_project_url) 
WHERE live_project_url IS NOT NULL AND category = 'projects';

-- Add comment for documentation
COMMENT ON COLUMN user_links.live_project_url IS 'Optional live project URL for GitHub projects (e.g., deployed app, demo site)';

-- Update the existing view if it exists to include the new field
DROP VIEW IF EXISTS user_links_with_icons;
CREATE OR REPLACE VIEW user_links_with_icons AS
SELECT 
  ul.*,
  CASE 
    WHEN ul.icon_selection_type = 'upload' AND ul.uploaded_icon_url IS NOT NULL THEN ul.uploaded_icon_url
    WHEN ul.icon_selection_type = 'url' AND ul.custom_icon_url IS NOT NULL THEN ul.custom_icon_url
    WHEN ul.icon_selection_type = 'platform' AND ul.platform_detected IS NOT NULL THEN 
      CONCAT('/icons/', ul.platform_detected, '/', 
             COALESCE(ul.icon_variant, 'default'), '.png')
    ELSE 
      CASE ul.category
        WHEN 'personal' THEN '/icons/default/external-link.png'
        WHEN 'projects' THEN '/icons/default/github.png'
        WHEN 'blogs' THEN '/icons/default/book-open.png'
        WHEN 'achievements' THEN '/icons/default/award.png'
        WHEN 'contact' THEN '/icons/default/mail.png'
        WHEN 'social' THEN '/icons/default/globe.png'
        ELSE '/icons/default/link.png'
      END
  END AS resolved_icon_url,
  CASE 
    WHEN ul.category = 'social' AND ul.platform_detected IS NOT NULL THEN 
      INITCAP(ul.platform_detected)
    ELSE ul.title
  END AS display_name
FROM user_links ul
WHERE ul.is_active = true;

-- Grant permissions on the updated view
GRANT SELECT ON user_links_with_icons TO authenticated;
GRANT SELECT ON user_links_with_icons TO anon;