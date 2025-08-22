-- Rich Link Previews Schema Extension
-- This migration extends the user_links table to support rich previews

-- Add new columns to user_links table for rich preview functionality
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'contact' 
  CHECK (category IN ('personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom'));

-- Add preview metadata columns
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS preview_fetched_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS preview_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_links ADD COLUMN IF NOT EXISTS preview_status TEXT DEFAULT 'pending' 
  CHECK (preview_status IN ('pending', 'success', 'failed', 'expired'));

-- The metadata column already exists and will store:
-- For GitHub repositories:
-- {
--   "type": "github_repo",
--   "repo_name": "username/repository",
--   "description": "Repository description",
--   "language": "JavaScript",
--   "topics": ["react", "nextjs"],
--   "stars": 123,
--   "forks": 45,
--   "updated_at": "2024-01-15T10:30:00Z",
--   "avatar_url": "https://avatars.githubusercontent.com/u/...",
--   "is_private": false,
--   "default_branch": "main"
-- }
--
-- For general links (Open Graph):
-- {
--   "type": "webpage",
--   "title": "Page Title",
--   "description": "Meta description",
--   "image": "https://example.com/og-image.jpg",
--   "favicon": "https://example.com/favicon.ico",
--   "site_name": "Site Name",
--   "domain": "example.com"
-- }

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_user_links_category ON user_links(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_links_preview_status ON user_links(preview_status);
CREATE INDEX IF NOT EXISTS idx_user_links_preview_expires ON user_links(preview_expires_at) WHERE preview_expires_at IS NOT NULL;

-- Function to check if preview needs refresh
CREATE OR REPLACE FUNCTION needs_preview_refresh(link_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  link_record user_links%ROWTYPE;
BEGIN
  SELECT * INTO link_record FROM user_links WHERE id = link_id;
  
  -- If no preview data exists, needs refresh
  IF link_record.preview_fetched_at IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- If preview failed, needs refresh (but not too frequently)
  IF link_record.preview_status = 'failed' AND 
     link_record.preview_fetched_at < NOW() - INTERVAL '1 hour' THEN
    RETURN TRUE;
  END IF;
  
  -- If preview expired, needs refresh
  IF link_record.preview_expires_at IS NOT NULL AND 
     link_record.preview_expires_at < NOW() THEN
    RETURN TRUE;
  END IF;
  
  -- If preview is older than 24 hours for GitHub repos, needs refresh
  IF link_record.metadata->>'type' = 'github_repo' AND
     link_record.preview_fetched_at < NOW() - INTERVAL '24 hours' THEN
    RETURN TRUE;
  END IF;
  
  -- If preview is older than 7 days for general links, needs refresh
  IF link_record.metadata->>'type' = 'webpage' AND
     link_record.preview_fetched_at < NOW() - INTERVAL '7 days' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update preview metadata
CREATE OR REPLACE FUNCTION update_link_preview(
  p_link_id UUID,
  p_metadata JSONB,
  p_status TEXT DEFAULT 'success'
)
RETURNS void AS $$
BEGIN
  UPDATE user_links 
  SET 
    metadata = p_metadata,
    preview_status = p_status,
    preview_fetched_at = NOW(),
    preview_expires_at = CASE 
      WHEN p_metadata->>'type' = 'github_repo' THEN NOW() + INTERVAL '24 hours'
      WHEN p_metadata->>'type' = 'webpage' THEN NOW() + INTERVAL '7 days'
      ELSE NOW() + INTERVAL '24 hours'
    END,
    updated_at = NOW()
  WHERE id = p_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark preview as failed
CREATE OR REPLACE FUNCTION mark_preview_failed(
  p_link_id UUID,
  p_error_message TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE user_links 
  SET 
    preview_status = 'failed',
    preview_fetched_at = NOW(),
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('error', p_error_message),
    updated_at = NOW()
  WHERE id = p_link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION needs_preview_refresh TO authenticated;
GRANT EXECUTE ON FUNCTION update_link_preview TO authenticated;
GRANT EXECUTE ON FUNCTION mark_preview_failed TO authenticated;

-- Update the trigger to handle category if not provided
CREATE OR REPLACE FUNCTION set_default_category()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default category based on icon_type if category is not provided
  IF NEW.category IS NULL OR NEW.category = '' THEN
    NEW.category = CASE 
      WHEN NEW.icon_type = 'github' THEN 'projects'
      WHEN NEW.icon_type IN ('linkedin', 'twitter') THEN 'social'
      WHEN NEW.icon_type = 'email' THEN 'contact'
      WHEN NEW.icon_type = 'website' THEN 'personal'
      ELSE 'contact'
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for setting default category
DROP TRIGGER IF EXISTS set_default_category_trigger ON user_links;
CREATE TRIGGER set_default_category_trigger
  BEFORE INSERT OR UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION set_default_category();
