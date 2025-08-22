-- Profile Builder Schema Migration
-- This migration sets up the database schema for the Link4Coders profile builder feature

-- First, ensure the users table exists with all required fields
-- (This may already exist from Supabase auth, but we'll add missing columns)

-- Add profile-related columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_id TEXT DEFAULT 'developer-dark';
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create user_links table for managing user's links
CREATE TABLE IF NOT EXISTS user_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon_type TEXT DEFAULT 'link' CHECK (icon_type IN ('github', 'linkedin', 'twitter', 'website', 'email', 'custom', 'link')),
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_links_position ON user_links(user_id, position);
CREATE INDEX IF NOT EXISTS idx_user_links_active ON user_links(user_id, is_active);

-- Enable Row Level Security (RLS) on user_links table
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_links table

-- Users can view their own links
CREATE POLICY "Users can view their own links" ON user_links
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own links
CREATE POLICY "Users can insert their own links" ON user_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own links
CREATE POLICY "Users can update their own links" ON user_links
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own links
CREATE POLICY "Users can delete their own links" ON user_links
  FOR DELETE USING (auth.uid() = user_id);

-- Public profiles are viewable by everyone (for public profile pages)
CREATE POLICY "Public profiles are viewable by everyone" ON user_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_links.user_id 
      AND users.is_public = true
    )
  );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on user_links
CREATE TRIGGER update_user_links_updated_at 
  BEFORE UPDATE ON user_links 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to reorder user links
CREATE OR REPLACE FUNCTION reorder_user_links(
  p_user_id UUID,
  p_link_ids UUID[]
)
RETURNS void AS $$
DECLARE
  link_id UUID;
  pos INTEGER := 0;
BEGIN
  -- Validate that all links belong to the user
  IF EXISTS (
    SELECT 1 FROM user_links 
    WHERE id = ANY(p_link_ids) 
    AND user_id != p_user_id
  ) THEN
    RAISE EXCEPTION 'Cannot reorder links that do not belong to the user';
  END IF;

  -- Update positions
  FOREACH link_id IN ARRAY p_link_ids
  LOOP
    UPDATE user_links 
    SET position = pos, updated_at = NOW()
    WHERE id = link_id AND user_id = p_user_id;
    pos := pos + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment click count for a link
CREATE OR REPLACE FUNCTION increment_link_clicks(p_link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_links 
  SET click_count = click_count + 1, updated_at = NOW()
  WHERE id = p_link_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_links TO authenticated;
GRANT SELECT ON user_links TO anon;
GRANT EXECUTE ON FUNCTION reorder_user_links TO authenticated;
GRANT EXECUTE ON FUNCTION increment_link_clicks TO anon, authenticated;
