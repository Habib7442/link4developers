-- Category Icons Storage Setup
-- This migration creates the storage bucket and policies for category icon uploads

-- Create storage bucket for category icons
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-icons',
  'category-icons',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all category icons (public bucket)
CREATE POLICY "Public can view category icons" ON storage.objects
  FOR SELECT USING (bucket_id = 'category-icons');

-- Policy: Authenticated users can upload their own category icons
CREATE POLICY "Users can upload their own category icons" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'category-icons' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own category icons
CREATE POLICY "Users can update their own category icons" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'category-icons' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own category icons
CREATE POLICY "Users can delete their own category icons" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'category-icons' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to clean up orphaned category icon files
CREATE OR REPLACE FUNCTION cleanup_orphaned_category_icons()
RETURNS void AS $$
DECLARE
  file_record RECORD;
BEGIN
  -- Find files in storage that don't have corresponding category settings
  FOR file_record IN
    SELECT name, id
    FROM storage.objects
    WHERE bucket_id = 'category-icons'
    AND NOT EXISTS (
      SELECT 1 
      FROM user_category_settings ucs
      WHERE ucs.custom_icon_url LIKE '%' || storage.objects.name || '%'
    )
    AND created_at < NOW() - INTERVAL '7 days' -- Only clean up files older than 7 days
  LOOP
    -- Delete the orphaned file
    DELETE FROM storage.objects 
    WHERE id = file_record.id;
    
    RAISE NOTICE 'Cleaned up orphaned category icon: %', file_record.name;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup weekly (if pg_cron is available)
-- Note: This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-category-icons', '0 2 * * 0', 'SELECT cleanup_orphaned_category_icons();');

-- Add comments for documentation
COMMENT ON FUNCTION cleanup_orphaned_category_icons() IS 'Cleans up category icon files that are no longer referenced by any category settings';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
