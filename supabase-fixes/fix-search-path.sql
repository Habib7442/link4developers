-- Fix for mutable search_path in Supabase functions
-- This script sets the search_path explicitly for all functions to prevent security vulnerabilities

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 2. Fix create_default_appearance_settings function
CREATE OR REPLACE FUNCTION public.create_default_appearance_settings(user_id_param uuid)
RETURNS uuid
SET search_path = public
LANGUAGE plpgsql
AS $function$
DECLARE
  settings_id UUID;
BEGIN
  INSERT INTO user_appearance_settings (user_id)
  VALUES (user_id_param)
  RETURNING id INTO settings_id;
  
  RETURN settings_id;
END;
$function$;

-- 3. Fix reorder_user_links function
CREATE OR REPLACE FUNCTION public.reorder_user_links(p_user_id uuid, p_link_ids uuid[])
RETURNS void
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
$function$;

-- 4. Fix increment_link_clicks function
CREATE OR REPLACE FUNCTION public.increment_link_clicks(p_link_id uuid)
RETURNS void
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE user_links 
  SET click_count = click_count + 1, updated_at = NOW()
  WHERE id = p_link_id AND is_active = true;
END;
$function$;

-- 5. Fix detect_social_platform function
CREATE OR REPLACE FUNCTION public.detect_social_platform()
RETURNS trigger
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only process social media category links
  IF NEW.category = 'social' THEN
    NEW.platform_detected := CASE 
      WHEN LOWER(NEW.url) LIKE '%twitter.com%' OR LOWER(NEW.url) LIKE '%x.com%' THEN 'twitter'
      WHEN LOWER(NEW.url) LIKE '%linkedin.com%' THEN 'linkedin'
      WHEN LOWER(NEW.url) LIKE '%instagram.com%' THEN 'instagram'
      WHEN LOWER(NEW.url) LIKE '%github.com%' THEN 'github'
      WHEN LOWER(NEW.url) LIKE '%discord.com%' OR LOWER(NEW.url) LIKE '%discord.gg%' THEN 'discord'
      WHEN LOWER(NEW.url) LIKE '%youtube.com%' OR LOWER(NEW.url) LIKE '%youtu.be%' THEN 'youtube'
      WHEN LOWER(NEW.url) LIKE '%tiktok.com%' THEN 'tiktok'
      WHEN LOWER(NEW.url) LIKE '%facebook.com%' OR LOWER(NEW.url) LIKE '%fb.com%' THEN 'facebook'
      WHEN LOWER(NEW.url) LIKE '%mastodon%' THEN 'mastodon'
      WHEN LOWER(NEW.url) LIKE '%reddit.com%' THEN 'reddit'
      WHEN LOWER(NEW.url) LIKE '%twitch.tv%' THEN 'twitch'
      WHEN LOWER(NEW.url) LIKE '%snapchat.com%' THEN 'snapchat'
      ELSE NULL
    END;
    
    -- Set default icon variant if not specified
    IF NEW.icon_variant IS NULL THEN
      NEW.icon_variant := 'default';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 6. Fix update_link_preview function
DROP FUNCTION IF EXISTS public.update_link_preview(uuid, jsonb, text);
CREATE OR REPLACE FUNCTION public.update_link_preview(p_link_id uuid, p_metadata jsonb, p_status text)
RETURNS void
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE user_links 
  SET 
    metadata = p_metadata,
    preview_status = p_status,
    preview_fetched_at = NOW(),
    preview_expires_at = NOW() + INTERVAL '24 hours',
    updated_at = NOW()
  WHERE id = p_link_id;
END;
$function$;

-- 7. Fix mark_preview_failed function
DROP FUNCTION IF EXISTS public.mark_preview_failed(uuid, text);
CREATE OR REPLACE FUNCTION public.mark_preview_failed(p_link_id uuid, p_error_message text)
RETURNS void
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE user_links 
  SET 
    preview_status = 'failed',
    preview_fetched_at = NOW(),
    preview_expires_at = NOW() + INTERVAL '1 hour',
    metadata = jsonb_build_object('error', p_error_message),
    updated_at = NOW()
  WHERE id = p_link_id;
END;
$function$;

-- 8. Fix needs_preview_refresh function
CREATE OR REPLACE FUNCTION public.needs_preview_refresh(link_id uuid)
RETURNS boolean
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
  
  -- Otherwise, no refresh needed
  RETURN FALSE;
END;
$function$;

-- 9. Fix update_appearance_settings_updated_at function
CREATE OR REPLACE FUNCTION public.update_appearance_settings_updated_at()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 10. Fix get_category_icon function
CREATE OR REPLACE FUNCTION public.get_category_icon(p_user_id uuid, p_category text)
RETURNS jsonb
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
$function$;

-- 11. Fix get_user_appearance_settings function
CREATE OR REPLACE FUNCTION public.get_user_appearance_settings(user_id_param uuid)
RETURNS SETOF user_appearance_settings
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
$function$;

-- 12. Fix update_category_icon function
CREATE OR REPLACE FUNCTION public.update_category_icon(
  p_user_id uuid, 
  p_category text, 
  p_icon_type text, 
  p_custom_icon_url text DEFAULT NULL, 
  p_library_icon_id text DEFAULT NULL, 
  p_icon_size integer DEFAULT 20, 
  p_icon_color text DEFAULT NULL
)
RETURNS jsonb
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Category icon updated successfully'
  );
END;
$function$;

-- 13. Fix reset_category_icon function
CREATE OR REPLACE FUNCTION public.reset_category_icon(p_user_id uuid, p_category text)
RETURNS jsonb
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  DELETE FROM user_category_settings
  WHERE user_id = p_user_id AND category = p_category;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Category icon reset to default'
  );
END;
$function$;

-- 14. Fix update_category_settings_updated_at function
CREATE OR REPLACE FUNCTION public.update_category_settings_updated_at()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 15. Fix validate_blog_metadata function
CREATE OR REPLACE FUNCTION public.validate_blog_metadata(metadata_json jsonb)
RETURNS boolean
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  -- If metadata is null or empty, it's valid (not processed yet)
  IF metadata_json IS NULL OR metadata_json = '{}' THEN
    RETURN TRUE;
  END IF;
  
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
$function$;

-- 16. Fix get_default_category_order function
CREATE OR REPLACE FUNCTION public.get_default_category_order()
RETURNS jsonb
SET search_path = public
LANGUAGE sql
AS $function$
  SELECT '["personal", "projects", "blogs", "achievements", "contact", "social", "custom"]'::jsonb;
$function$;

-- 17. Fix validate_category_order function
CREATE OR REPLACE FUNCTION public.validate_category_order(order_array jsonb)
RETURNS boolean
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
$function$;

-- 18. Fix get_user_blog_stats function
CREATE OR REPLACE FUNCTION public.get_user_blog_stats(user_uuid uuid)
RETURNS TABLE(
  total_blogs bigint,
  platforms_count bigint,
  total_reactions bigint,
  total_comments bigint,
  avg_reading_time numeric,
  most_used_platform text
)
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
$function$;

-- 19. Fix update_user_category_order function
CREATE OR REPLACE FUNCTION public.update_user_category_order(user_id_param uuid, new_order jsonb)
RETURNS jsonb
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
$function$;

-- 20. Fix reset_user_category_order function
CREATE OR REPLACE FUNCTION public.reset_user_category_order(user_id_param uuid)
RETURNS jsonb
SET search_path = public
LANGUAGE plpgsql
AS $function$
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
$function$;

-- 21. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SET search_path = public
LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, github_username, github_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'html_url'
  );
  RETURN NEW;
END;
$function$;