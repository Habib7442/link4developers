-- Blog Preview Enhancements Schema
-- This migration extends the rich preview system to support blog-specific metadata

-- Update the category check constraint to include 'blogs' category
ALTER TABLE user_links DROP CONSTRAINT IF EXISTS user_links_category_check;
ALTER TABLE user_links ADD CONSTRAINT user_links_category_check 
  CHECK (category IN ('personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom'));

-- The metadata JSONB column already exists and will now also store:
-- For blog posts:
-- {
--   "type": "blog_post",
--   "title": "Blog Post Title",
--   "description": "Meta description",
--   "excerpt": "First few lines of the blog post content",
--   "featured_image": "https://example.com/featured-image.jpg",
--   "author": {
--     "name": "Author Name",
--     "username": "author_username",
--     "avatar": "https://example.com/avatar.jpg",
--     "profile_url": "https://platform.com/author"
--   },
--   "published_at": "2024-01-15T10:30:00Z",
--   "reading_time_minutes": 5,
--   "tags": ["javascript", "react", "tutorial"],
--   "platform": "dev.to", // or "hashnode", "medium", "substack", etc.
--   "platform_logo": "https://dev.to/favicon.ico",
--   "reactions_count": 42,
--   "comments_count": 8,
--   "canonical_url": "https://original-blog-url.com/post",
--   "url": "https://platform.com/post-url",
--   "fetched_at": "2024-01-15T10:30:00Z",
--   "expires_at": "2024-01-22T10:30:00Z"
-- }

-- Create an index on the metadata->>'type' field for better query performance
CREATE INDEX IF NOT EXISTS idx_user_links_metadata_type 
ON user_links USING GIN ((metadata->>'type'));

-- Create an index on the metadata->>'platform' field for blog posts
CREATE INDEX IF NOT EXISTS idx_user_links_blog_platform 
ON user_links USING GIN ((metadata->>'platform')) 
WHERE metadata->>'type' = 'blog_post';

-- Create a function to validate blog metadata structure
CREATE OR REPLACE FUNCTION validate_blog_metadata(metadata_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- If it's not a blog post, skip validation
  IF metadata_json->>'type' != 'blog_post' THEN
    RETURN TRUE;
  END IF;
  
  -- Check required fields for blog posts
  IF metadata_json->>'title' IS NULL OR 
     metadata_json->>'platform' IS NULL OR
     metadata_json->>'published_at' IS NULL OR
     metadata_json->'author'->>'name' IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check platform is valid
  IF metadata_json->>'platform' NOT IN ('dev.to', 'hashnode', 'medium', 'substack', 'ghost', 'wordpress', 'other') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint to validate blog metadata
ALTER TABLE user_links ADD CONSTRAINT valid_blog_metadata 
CHECK (validate_blog_metadata(metadata));

-- Create a view for blog links with extracted metadata
CREATE OR REPLACE VIEW blog_links_view AS
SELECT 
  id,
  user_id,
  title,
  url,
  description,
  category,
  position,
  is_active,
  click_count,
  created_at,
  updated_at,
  preview_status,
  preview_fetched_at,
  preview_expires_at,
  metadata->>'title' as blog_title,
  metadata->>'platform' as blog_platform,
  metadata->>'published_at' as blog_published_at,
  metadata->'author'->>'name' as blog_author_name,
  metadata->'author'->>'username' as blog_author_username,
  metadata->>'reading_time_minutes' as reading_time,
  metadata->>'reactions_count' as reactions_count,
  metadata->>'comments_count' as comments_count,
  metadata->>'featured_image' as featured_image,
  metadata->>'excerpt' as excerpt,
  metadata->'tags' as tags,
  metadata
FROM user_links 
WHERE metadata->>'type' = 'blog_post' 
  AND category = 'blogs';

-- Create RLS policies for the blog view (inherits from user_links policies)
ALTER VIEW blog_links_view SET (security_invoker = true);

-- Function to get blog statistics for a user
CREATE OR REPLACE FUNCTION get_user_blog_stats(user_uuid UUID)
RETURNS TABLE (
  total_blogs BIGINT,
  platforms_count BIGINT,
  total_reactions BIGINT,
  total_comments BIGINT,
  avg_reading_time NUMERIC,
  most_used_platform TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_blogs,
    COUNT(DISTINCT metadata->>'platform') as platforms_count,
    COALESCE(SUM((metadata->>'reactions_count')::INTEGER), 0) as total_reactions,
    COALESCE(SUM((metadata->>'comments_count')::INTEGER), 0) as total_comments,
    ROUND(AVG((metadata->>'reading_time_minutes')::NUMERIC), 1) as avg_reading_time,
    (
      SELECT metadata->>'platform' 
      FROM user_links 
      WHERE user_id = user_uuid 
        AND metadata->>'type' = 'blog_post' 
        AND category = 'blogs'
      GROUP BY metadata->>'platform' 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as most_used_platform
  FROM user_links 
  WHERE user_id = user_uuid 
    AND metadata->>'type' = 'blog_post' 
    AND category = 'blogs'
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_user_blog_stats(UUID) TO authenticated;

-- Create a function to refresh expired blog previews
CREATE OR REPLACE FUNCTION refresh_expired_blog_previews()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Count expired blog previews
  SELECT COUNT(*) INTO expired_count
  FROM user_links 
  WHERE metadata->>'type' = 'blog_post'
    AND category = 'blogs'
    AND preview_expires_at < NOW()
    AND preview_status = 'success';
  
  -- Mark expired previews for refresh
  UPDATE user_links 
  SET preview_status = 'expired'
  WHERE metadata->>'type' = 'blog_post'
    AND category = 'blogs'
    AND preview_expires_at < NOW()
    AND preview_status = 'success';
    
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the refresh function
GRANT EXECUTE ON FUNCTION refresh_expired_blog_previews() TO authenticated;

-- Add comments for documentation
COMMENT ON INDEX idx_user_links_metadata_type IS 'Index for filtering links by metadata type (github_repo, webpage, blog_post)';
COMMENT ON INDEX idx_user_links_blog_platform IS 'Index for filtering blog posts by platform (dev.to, hashnode, medium, etc.)';
COMMENT ON FUNCTION validate_blog_metadata(JSONB) IS 'Validates the structure and required fields for blog post metadata';
COMMENT ON VIEW blog_links_view IS 'Convenient view for querying blog links with extracted metadata fields';
COMMENT ON FUNCTION get_user_blog_stats(UUID) IS 'Returns aggregated statistics for a user''s blog posts';
COMMENT ON FUNCTION refresh_expired_blog_previews() IS 'Marks expired blog previews for refresh and returns count of affected rows';
