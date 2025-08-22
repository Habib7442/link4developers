-- Category Icon Customization Schema
-- This migration adds support for custom category icons per user

-- Create user_category_settings table for category-level customizations
CREATE TABLE IF NOT EXISTS user_category_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom')),
  
  -- Icon customization options
  icon_type TEXT DEFAULT 'default' CHECK (icon_type IN ('default', 'upload', 'url', 'library')),
  custom_icon_url TEXT, -- For uploaded files or external URLs
  library_icon_id TEXT, -- Reference to default icon library
  
  -- Icon display settings
  icon_size INTEGER DEFAULT 20 CHECK (icon_size >= 12 AND icon_size <= 48),
  icon_color TEXT, -- Custom color override (hex format)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints and indexes
ALTER TABLE user_category_settings ADD CONSTRAINT unique_user_category 
  UNIQUE (user_id, category);

-- Add check constraint for custom icon URLs (supports common image formats)
ALTER TABLE user_category_settings ADD CONSTRAINT check_custom_icon_url 
  CHECK (
    custom_icon_url IS NULL OR 
    custom_icon_url ~ '^https?://.*\.(png|jpg|jpeg|svg|webp|gif|ico)(\?.*)?$'
  );

-- Add check constraint for hex color format
ALTER TABLE user_category_settings ADD CONSTRAINT check_icon_color 
  CHECK (
    icon_color IS NULL OR 
    icon_color ~ '^#[0-9A-Fa-f]{6}$'
  );

-- Add check constraint for library icon IDs
ALTER TABLE user_category_settings ADD CONSTRAINT check_library_icon_id 
  CHECK (
    library_icon_id IS NULL OR 
    library_icon_id ~ '^[a-z0-9_-]+$'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_category_settings_user_id ON user_category_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_settings_category ON user_category_settings(category);
CREATE INDEX IF NOT EXISTS idx_user_category_settings_icon_type ON user_category_settings(icon_type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_category_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_category_settings table

-- Users can view their own category settings
CREATE POLICY "Users can view their own category settings" ON user_category_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own category settings
CREATE POLICY "Users can insert their own category settings" ON user_category_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own category settings
CREATE POLICY "Users can update their own category settings" ON user_category_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own category settings
CREATE POLICY "Users can delete their own category settings" ON user_category_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Public users can view category settings for public profiles
CREATE POLICY "Public can view category settings for public profiles" ON user_category_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_category_settings.user_id 
      AND users.is_public = true
    )
  );

-- Create function to get category icon with fallback
CREATE OR REPLACE FUNCTION get_category_icon(
  p_user_id UUID,
  p_category TEXT
) RETURNS JSONB AS $$
DECLARE
  category_setting RECORD;
  default_icon TEXT;
BEGIN
  -- Get user's custom category setting
  SELECT * INTO category_setting
  FROM user_category_settings
  WHERE user_id = p_user_id AND category = p_category;
  
  -- Get default icon from LINK_CATEGORIES
  default_icon := CASE p_category
    WHEN 'personal' THEN 'User'
    WHEN 'projects' THEN 'Github'
    WHEN 'blogs' THEN 'BookOpen'
    WHEN 'achievements' THEN 'Award'
    WHEN 'contact' THEN 'Mail'
    WHEN 'social' THEN 'Share2'
    WHEN 'custom' THEN 'Link'
    ELSE 'Link'
  END;
  
  -- Return icon configuration
  IF category_setting IS NULL THEN
    -- No custom setting, return default
    RETURN jsonb_build_object(
      'type', 'default',
      'icon', default_icon,
      'size', 20,
      'color', null
    );
  ELSE
    -- Return custom setting with fallback
    RETURN jsonb_build_object(
      'type', category_setting.icon_type,
      'icon', COALESCE(
        CASE 
          WHEN category_setting.icon_type = 'url' OR category_setting.icon_type = 'upload' 
          THEN category_setting.custom_icon_url
          WHEN category_setting.icon_type = 'library' 
          THEN category_setting.library_icon_id
          ELSE default_icon
        END,
        default_icon
      ),
      'size', COALESCE(category_setting.icon_size, 20),
      'color', category_setting.icon_color
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update category icon setting
CREATE OR REPLACE FUNCTION update_category_icon(
  p_user_id UUID,
  p_category TEXT,
  p_icon_type TEXT,
  p_custom_icon_url TEXT DEFAULT NULL,
  p_library_icon_id TEXT DEFAULT NULL,
  p_icon_size INTEGER DEFAULT NULL,
  p_icon_color TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result RECORD;
BEGIN
  -- Validate inputs
  IF p_icon_type NOT IN ('default', 'upload', 'url', 'library') THEN
    RAISE EXCEPTION 'Invalid icon_type. Must be one of: default, upload, url, library';
  END IF;
  
  IF p_category NOT IN ('personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom') THEN
    RAISE EXCEPTION 'Invalid category';
  END IF;
  
  -- Insert or update category setting
  INSERT INTO user_category_settings (
    user_id, category, icon_type, custom_icon_url, library_icon_id, icon_size, icon_color, updated_at
  ) VALUES (
    p_user_id, p_category, p_icon_type, p_custom_icon_url, p_library_icon_id, p_icon_size, p_icon_color, NOW()
  )
  ON CONFLICT (user_id, category) 
  DO UPDATE SET
    icon_type = EXCLUDED.icon_type,
    custom_icon_url = EXCLUDED.custom_icon_url,
    library_icon_id = EXCLUDED.library_icon_id,
    icon_size = EXCLUDED.icon_size,
    icon_color = EXCLUDED.icon_color,
    updated_at = NOW()
  RETURNING *;
  
  GET DIAGNOSTICS result = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Category icon updated successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset category icon to default
CREATE OR REPLACE FUNCTION reset_category_icon(
  p_user_id UUID,
  p_category TEXT
) RETURNS JSONB AS $$
BEGIN
  DELETE FROM user_category_settings
  WHERE user_id = p_user_id AND category = p_category;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Category icon reset to default'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_category_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_settings_updated_at
  BEFORE UPDATE ON user_category_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_category_settings_updated_at();

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_category_settings TO authenticated;
GRANT USAGE ON SEQUENCE user_category_settings_id_seq TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE user_category_settings IS 'Stores user customizations for category icons and display settings';
COMMENT ON COLUMN user_category_settings.icon_type IS 'Type of icon: default (use system default), upload (uploaded file), url (external URL), library (from default library)';
COMMENT ON COLUMN user_category_settings.custom_icon_url IS 'URL for uploaded or external icon images';
COMMENT ON COLUMN user_category_settings.library_icon_id IS 'ID reference to icon in the default library';
COMMENT ON COLUMN user_category_settings.icon_size IS 'Custom size for the category icon in pixels (12-48)';
COMMENT ON COLUMN user_category_settings.icon_color IS 'Custom color override for the icon in hex format (#RRGGBB)';

-- Create view for easy category icon resolution
CREATE OR REPLACE VIEW user_category_icons AS
SELECT 
  u.id as user_id,
  u.github_username,
  u.profile_slug,
  c.category,
  get_category_icon(u.id, c.category) as icon_config
FROM users u
CROSS JOIN (
  VALUES 
    ('personal'),
    ('projects'), 
    ('blogs'),
    ('achievements'),
    ('contact'),
    ('social'),
    ('custom')
) AS c(category)
WHERE u.is_public = true;

-- Grant permissions on the view
GRANT SELECT ON user_category_icons TO authenticated;
GRANT SELECT ON user_category_icons TO anon;
