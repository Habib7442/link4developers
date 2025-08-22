-- Category Order Schema Migration
-- This migration adds support for custom category section ordering in the Link Manager

-- Add category_order column to users table to store custom section order
ALTER TABLE users ADD COLUMN IF NOT EXISTS category_order JSONB DEFAULT '["personal", "projects", "blogs", "achievements", "contact", "social", "custom"]'::jsonb;

-- Add index for better performance on category_order queries
CREATE INDEX IF NOT EXISTS idx_users_category_order ON users USING GIN (category_order);

-- Create function to get default category order
CREATE OR REPLACE FUNCTION get_default_category_order()
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT '["personal", "projects", "blogs", "achievements", "contact", "social", "custom"]'::jsonb;
$$;

-- Create function to validate category order
CREATE OR REPLACE FUNCTION validate_category_order(order_array jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  valid_categories text[] := ARRAY['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom'];
  category text;
  category_count int;
BEGIN
  -- Check if it's an array
  IF jsonb_typeof(order_array) != 'array' THEN
    RETURN false;
  END IF;
  
  -- Check if all elements are valid categories
  FOR category IN SELECT jsonb_array_elements_text(order_array)
  LOOP
    IF NOT (category = ANY(valid_categories)) THEN
      RETURN false;
    END IF;
  END LOOP;
  
  -- Check if we have exactly 7 categories (no duplicates, no missing)
  SELECT jsonb_array_length(order_array) INTO category_count;
  IF category_count != 7 THEN
    RETURN false;
  END IF;
  
  -- Check for duplicates by comparing array length with distinct count
  IF (
    SELECT COUNT(DISTINCT value)
    FROM jsonb_array_elements_text(order_array) AS value
  ) != 7 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add constraint to ensure category_order is valid
ALTER TABLE users ADD CONSTRAINT check_category_order_valid 
  CHECK (validate_category_order(category_order));

-- Create function to update category order
CREATE OR REPLACE FUNCTION update_user_category_order(
  user_id_param uuid,
  new_order jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Validate the new order
  IF NOT validate_category_order(new_order) THEN
    RAISE EXCEPTION 'Invalid category order provided';
  END IF;
  
  -- Update the user's category order
  UPDATE users 
  SET 
    category_order = new_order,
    updated_at = NOW()
  WHERE id = user_id_param
  RETURNING category_order INTO result;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'User not found or update failed';
  END IF;
  
  RETURN result;
END;
$$;

-- Create function to reset category order to default
CREATE OR REPLACE FUNCTION reset_user_category_order(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  UPDATE users 
  SET 
    category_order = get_default_category_order(),
    updated_at = NOW()
  WHERE id = user_id_param
  RETURNING category_order INTO result;
  
  IF result IS NULL THEN
    RAISE EXCEPTION 'User not found or update failed';
  END IF;
  
  RETURN result;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_default_category_order() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_category_order(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_category_order(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_category_order(uuid) TO authenticated;

-- Update existing users to have the default category order if they don't have one
UPDATE users 
SET category_order = get_default_category_order()
WHERE category_order IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.category_order IS 'Custom order of category sections in Link Manager, stored as JSON array of category keys';
COMMENT ON FUNCTION get_default_category_order() IS 'Returns the default category order as a JSON array';
COMMENT ON FUNCTION validate_category_order(jsonb) IS 'Validates that a category order array contains all required categories without duplicates';
COMMENT ON FUNCTION update_user_category_order(uuid, jsonb) IS 'Updates a user''s category order with validation';
COMMENT ON FUNCTION reset_user_category_order(uuid) IS 'Resets a user''s category order to the default';
