-- Appearance Customization Schema Migration
-- This migration adds support for comprehensive appearance customization as a premium feature

-- Create user_appearance_settings table
CREATE TABLE IF NOT EXISTS user_appearance_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Background Settings
  background_type TEXT DEFAULT 'color' CHECK (background_type IN ('color', 'gradient', 'image')),
  background_color TEXT DEFAULT '#18181a',
  background_gradient JSONB, -- {type: 'linear', colors: ['#color1', '#color2'], direction: '45deg'}
  background_image_url TEXT,
  background_image_position TEXT DEFAULT 'center',
  background_image_size TEXT DEFAULT 'cover',
  
  -- Typography Settings
  primary_font TEXT DEFAULT 'Sharp Grotesk',
  secondary_font TEXT DEFAULT 'Inter',
  font_size_base INTEGER DEFAULT 16,
  font_size_heading INTEGER DEFAULT 32,
  font_size_subheading INTEGER DEFAULT 24,
  line_height_base DECIMAL DEFAULT 1.5,
  line_height_heading DECIMAL DEFAULT 1.2,
  
  -- Color Scheme
  text_primary_color TEXT DEFAULT '#ffffff',
  text_secondary_color TEXT DEFAULT '#7a7a83',
  text_accent_color TEXT DEFAULT '#54E0FF',
  link_color TEXT DEFAULT '#54E0FF',
  link_hover_color TEXT DEFAULT '#29ADFF',
  border_color TEXT DEFAULT '#33373b',
  
  -- Card Styling
  card_background_color TEXT DEFAULT 'rgba(0, 0, 0, 0.20)',
  card_border_radius INTEGER DEFAULT 20,
  card_border_width INTEGER DEFAULT 1,
  card_shadow TEXT DEFAULT '0px 16px 30.7px rgba(0,0,0,0.30)',
  card_backdrop_blur INTEGER DEFAULT 10,
  
  -- Visual Settings (not layout structure)
  profile_avatar_size INTEGER DEFAULT 120,
  
  -- Social Media Icons
  social_icon_size INTEGER DEFAULT 24,
  social_icon_style TEXT DEFAULT 'rounded' CHECK (social_icon_style IN ('rounded', 'square', 'circle')),
  social_icon_color TEXT DEFAULT '#ffffff',
  social_icon_background TEXT DEFAULT 'transparent',
  
  -- Link Button Styling
  button_style TEXT DEFAULT 'glassmorphic' CHECK (button_style IN ('glassmorphic', 'solid', 'outline', 'minimal')),
  button_border_radius INTEGER DEFAULT 12,
  button_padding_x INTEGER DEFAULT 24,
  button_padding_y INTEGER DEFAULT 12,
  
  -- Advanced Settings
  custom_css TEXT, -- For advanced users to add custom CSS
  animation_enabled BOOLEAN DEFAULT true,
  glassmorphic_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_appearance_settings_user_id ON user_appearance_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_appearance_settings_updated_at ON user_appearance_settings(updated_at);

-- Create unique constraint to ensure one settings record per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_appearance_settings_unique_user ON user_appearance_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_appearance_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_appearance_settings
CREATE POLICY "Users can view their own appearance settings" ON user_appearance_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appearance settings" ON user_appearance_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appearance settings" ON user_appearance_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appearance settings" ON user_appearance_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for appearance settings (for public profiles)
CREATE POLICY "Public read access for appearance settings" ON user_appearance_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_appearance_settings.user_id 
      AND users.is_public = true
    )
  );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_appearance_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER trigger_update_appearance_settings_updated_at
  BEFORE UPDATE ON user_appearance_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_appearance_settings_updated_at();

-- Function to create default appearance settings for new users
CREATE OR REPLACE FUNCTION create_default_appearance_settings(user_id_param UUID)
RETURNS UUID AS $$
DECLARE
  settings_id UUID;
BEGIN
  INSERT INTO user_appearance_settings (user_id)
  VALUES (user_id_param)
  RETURNING id INTO settings_id;
  
  RETURN settings_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get appearance settings with fallback to defaults
CREATE OR REPLACE FUNCTION get_user_appearance_settings(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  background_type TEXT,
  background_color TEXT,
  background_gradient JSONB,
  background_image_url TEXT,
  background_image_position TEXT,
  background_image_size TEXT,
  primary_font TEXT,
  secondary_font TEXT,
  font_size_base INTEGER,
  font_size_heading INTEGER,
  font_size_subheading INTEGER,
  line_height_base DECIMAL,
  line_height_heading DECIMAL,
  text_primary_color TEXT,
  text_secondary_color TEXT,
  text_accent_color TEXT,
  link_color TEXT,
  link_hover_color TEXT,
  border_color TEXT,
  card_background_color TEXT,
  card_border_radius INTEGER,
  card_border_width INTEGER,
  card_shadow TEXT,
  card_backdrop_blur INTEGER,
  container_max_width INTEGER,
  section_spacing INTEGER,
  element_spacing INTEGER,
  profile_avatar_size INTEGER,
  social_icon_size INTEGER,
  social_icon_style TEXT,
  social_icon_color TEXT,
  social_icon_background TEXT,
  button_style TEXT,
  button_border_radius INTEGER,
  button_padding_x INTEGER,
  button_padding_y INTEGER,
  custom_css TEXT,
  animation_enabled BOOLEAN,
  glassmorphic_enabled BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Try to get existing settings
  RETURN QUERY
  SELECT * FROM user_appearance_settings uas
  WHERE uas.user_id = user_id_param;
  
  -- If no settings found, create default ones
  IF NOT FOUND THEN
    PERFORM create_default_appearance_settings(user_id_param);
    RETURN QUERY
    SELECT * FROM user_appearance_settings uas
    WHERE uas.user_id = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_appearance_settings TO authenticated;
GRANT EXECUTE ON FUNCTION create_default_appearance_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_appearance_settings(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE user_appearance_settings IS 'Stores comprehensive appearance customization settings for user profiles as a premium feature';
