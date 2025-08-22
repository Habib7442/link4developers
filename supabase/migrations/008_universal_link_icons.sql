-- Universal Link Icons Migration
-- Extends icon customization to all link categories

-- Add new columns to user_links table for universal icon support
ALTER TABLE user_links 
ADD COLUMN IF NOT EXISTS uploaded_icon_url TEXT,
ADD COLUMN IF NOT EXISTS icon_selection_type TEXT DEFAULT 'default' CHECK (icon_selection_type IN ('default', 'platform', 'upload', 'url'));

-- Update existing social media links to use the new icon_selection_type
UPDATE user_links 
SET icon_selection_type = CASE 
  WHEN use_custom_icon = true AND custom_icon_url IS NOT NULL THEN 'url'
  WHEN platform_detected IS NOT NULL THEN 'platform'
  ELSE 'default'
END
WHERE category = 'social';

-- Create index for better performance on icon queries
CREATE INDEX IF NOT EXISTS idx_user_links_icon_selection ON user_links(icon_selection_type);

-- Update the social_media_links view to include new fields
DROP VIEW IF EXISTS social_media_links;
CREATE OR REPLACE VIEW social_media_links AS
SELECT 
  ul.*,
  CASE 
    WHEN ul.icon_selection_type = 'upload' AND ul.uploaded_icon_url IS NOT NULL THEN ul.uploaded_icon_url
    WHEN ul.icon_selection_type = 'url' AND ul.custom_icon_url IS NOT NULL THEN ul.custom_icon_url
    WHEN ul.icon_selection_type = 'platform' AND ul.platform_detected IS NOT NULL THEN 
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

-- Create a new view for all links with resolved icons
CREATE OR REPLACE VIEW user_links_with_icons AS
SELECT 
  ul.*,
  CASE 
    WHEN ul.icon_selection_type = 'upload' AND ul.uploaded_icon_url IS NOT NULL THEN ul.uploaded_icon_url
    WHEN ul.icon_selection_type = 'url' AND ul.custom_icon_url IS NOT NULL THEN ul.custom_icon_url
    WHEN ul.icon_selection_type = 'platform' AND ul.category = 'social' AND ul.platform_detected IS NOT NULL THEN 
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

-- Grant appropriate permissions
GRANT SELECT ON user_links_with_icons TO authenticated;
GRANT SELECT ON user_links_with_icons TO anon;

-- Add comment for documentation
COMMENT ON COLUMN user_links.uploaded_icon_url IS 'URL of uploaded custom icon stored in Supabase Storage';
COMMENT ON COLUMN user_links.icon_selection_type IS 'Type of icon selection: default, platform, upload, or url';
COMMENT ON VIEW user_links_with_icons IS 'View that resolves icon URLs for all link categories based on selection type';

-- Create storage bucket for link icons if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for link icons
CREATE POLICY IF NOT EXISTS "Users can upload their own link icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'link-icons'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY IF NOT EXISTS "Users can view their own link icons"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'link-icons'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own link icons"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'link-icons'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public access to view uploaded icons
CREATE POLICY IF NOT EXISTS "Public can view link icons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = 'link-icons');
