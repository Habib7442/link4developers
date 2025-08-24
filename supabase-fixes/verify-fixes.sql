-- Verification script for Supabase security fixes

-- 1. Check that functions now have explicit search_path
SELECT 
  proname AS function_name,
  prosecdef AS is_definer,
  (SELECT array_agg(unnest) FROM unnest(proconfig) WHERE unnest LIKE 'search_path%') AS search_path_config
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
  AND proname IN (
    'update_updated_at_column',
    'create_default_appearance_settings',
    'reorder_user_links',
    'increment_link_clicks',
    'detect_social_platform',
    'update_link_preview',
    'mark_preview_failed',
    'needs_preview_refresh',
    'update_appearance_settings_updated_at',
    'get_category_icon',
    'get_user_appearance_settings',
    'update_category_icon',
    'reset_category_icon',
    'update_category_settings_updated_at',
    'validate_blog_metadata',
    'get_default_category_order',
    'validate_category_order',
    'get_user_blog_stats',
    'update_user_category_order',
    'reset_user_category_order',
    'handle_new_user'
  )
ORDER BY proname;

-- 2. Test a few key functions to ensure they still work
-- Test update_updated_at_column trigger function
SELECT public.update_updated_at_column();

-- Test get_default_category_order function
SELECT public.get_default_category_order();

-- Test validate_category_order function with valid input
SELECT public.validate_category_order('["personal", "projects", "blogs", "achievements", "contact", "social", "custom"]'::jsonb);

-- Test validate_category_order function with invalid input
SELECT public.validate_category_order('["personal", "projects"]'::jsonb);

-- 3. Check current search_path setting
SHOW search_path;

-- 4. Check for any remaining functions without explicit search_path
SELECT 
  proname AS function_name,
  prosecdef AS is_definer
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
  AND proconfig IS NULL 
  AND proname IN (
    'update_updated_at_column',
    'create_default_appearance_settings',
    'reorder_user_links',
    'increment_link_clicks',
    'detect_social_platform',
    'update_link_preview',
    'mark_preview_failed',
    'needs_preview_refresh',
    'update_appearance_settings_updated_at',
    'get_category_icon',
    'get_user_appearance_settings',
    'update_category_icon',
    'reset_category_icon',
    'update_category_settings_updated_at',
    'validate_blog_metadata',
    'get_default_category_order',
    'validate_category_order',
    'get_user_blog_stats',
    'update_user_category_order',
    'reset_user_category_order',
    'handle_new_user'
  )
ORDER BY proname;