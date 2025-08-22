-- Add background_image_path column to user_appearance_settings table
-- This column will store the file path for uploaded background images

ALTER TABLE user_appearance_settings 
ADD COLUMN background_image_path TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN user_appearance_settings.background_image_path IS 'File path for uploaded background images in Supabase Storage';

-- Update existing records to have NULL for this field (which is the default)
-- No action needed as new column defaults to NULL
