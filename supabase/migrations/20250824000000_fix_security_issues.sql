-- Fix for Function Search Path Mutable security issues
-- Drop and recreate functions to fix parameter default issues
-- Handle dependencies properly by dropping and recreating triggers and constraints
-- Using correct table name: user_links instead of links
-- Using correct column names based on schema
-- Using correct trigger names based on database inspection

-- Fix for update_updated_at_column function
-- First drop dependent triggers
DROP TRIGGER IF EXISTS update_user_links_updated_at ON user_links;
DROP TRIGGER IF EXISTS trigger_update_appearance_settings_updated_at ON user_appearance_settings;
DROP TRIGGER IF EXISTS trigger_update_category_settings_updated_at ON user_category_settings;
DROP TRIGGER IF EXISTS trigger_update_settings_updated_at ON user_settings;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Recreate triggers
CREATE TRIGGER update_user_links_updated_at 
    BEFORE UPDATE ON user_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_appearance_settings_updated_at 
    BEFORE UPDATE ON user_appearance_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_category_settings_updated_at 
    BEFORE UPDATE ON user_category_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_settings_updated_at 
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fix for create_default_appearance_settings function
DROP FUNCTION IF EXISTS create_default_appearance_settings(uuid);

CREATE OR REPLACE FUNCTION create_default_appearance_settings(user_id_param uuid)
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO user_appearance_settings (user_id)
    VALUES (user_id_param)
    ON CONFLICT (user_id) DO NOTHING;
END;
$function$;

-- Fix for reorder_user_links function
DROP FUNCTION IF EXISTS reorder_user_links(uuid, uuid[]);

CREATE OR REPLACE FUNCTION reorder_user_links(p_user_id uuid, p_link_ids uuid[])
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
DECLARE
    i INTEGER := 0;
    link_id UUID;  -- Declare the loop variable
BEGIN
    -- Update the order of links for the user
    FOREACH link_id IN ARRAY p_link_ids LOOP
        UPDATE user_links 
        SET "position" = i, updated_at = NOW()
        WHERE id = link_id AND user_id = p_user_id;
        i := i + 1;
    END LOOP;
END;
$function$;

-- Fix for increment_link_clicks function
DROP FUNCTION IF EXISTS increment_link_clicks(uuid);

CREATE OR REPLACE FUNCTION increment_link_clicks(p_link_id uuid)
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE user_links 
    SET 
        click_count = click_count + 1,
        updated_at = NOW()
    WHERE id = p_link_id;
END;
$function$;

-- Fix for detect_social_platform function
-- First drop dependent triggers
DROP TRIGGER IF EXISTS trigger_detect_social_platform ON user_links;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS detect_social_platform();

CREATE OR REPLACE FUNCTION detect_social_platform()
RETURNS TRIGGER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    -- If category is not already set to social, try to detect social platform
    IF NEW.category IS DISTINCT FROM 'social' THEN
        CASE 
            WHEN NEW.url ILIKE '%youtube.com/%' OR NEW.url ILIKE '%youtu.be/%' THEN
                NEW.category := 'social';
                NEW.icon_type := 'youtube';
            WHEN NEW.url ILIKE '%github.com/%' THEN
                NEW.category := 'social';
                NEW.icon_type := 'github';
            WHEN NEW.url ILIKE '%twitter.com/%' OR NEW.url ILIKE '%x.com/%' THEN
                NEW.category := 'social';
                NEW.icon_type := 'twitter';
            WHEN NEW.url ILIKE '%linkedin.com/%' THEN
                NEW.category := 'social';
                NEW.icon_type := 'linkedin';
            WHEN NEW.url ILIKE '%instagram.com/%' THEN
                NEW.category := 'social';
                NEW.icon_type := 'instagram';
            WHEN NEW.url ILIKE '%facebook.com/%' THEN
                NEW.category := 'social';
                NEW.icon_type := 'facebook';
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recreate trigger
CREATE TRIGGER trigger_detect_social_platform
    BEFORE INSERT OR UPDATE ON user_links
    FOR EACH ROW
    EXECUTE FUNCTION detect_social_platform();

-- Fix for update_link_preview function
DROP FUNCTION IF EXISTS update_link_preview(uuid, jsonb, text);

CREATE OR REPLACE FUNCTION update_link_preview(p_link_id uuid, p_metadata jsonb, p_status text)
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update the link with the new preview metadata and status
    UPDATE user_links 
    SET 
        metadata = p_metadata,
        preview_status = p_status,
        preview_fetched_at = NOW(),
        updated_at = NOW()
    WHERE id = p_link_id;
    
    -- Set expiration time based on metadata type
    UPDATE user_links 
    SET preview_expires_at = CASE 
      WHEN p_metadata->>'type' = 'github_repo' THEN NOW() + INTERVAL '24 hours'
      WHEN p_metadata->>'type' = 'webpage' THEN NOW() + INTERVAL '7 days'
      ELSE NOW() + INTERVAL '24 hours'
    END
    WHERE id = p_link_id;
END;
$function$;

-- Fix for mark_preview_failed function
DROP FUNCTION IF EXISTS mark_preview_failed(uuid, text);

CREATE OR REPLACE FUNCTION mark_preview_failed(p_link_id uuid, p_error_message text)
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE user_links 
    SET 
        preview_status = 'failed',
        preview_fetched_at = NOW(),
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('error', p_error_message),
        updated_at = NOW()
    WHERE id = p_link_id;
END;
$function$;

-- Fix for needs_preview_refresh function
DROP FUNCTION IF EXISTS needs_preview_refresh(uuid);

CREATE OR REPLACE FUNCTION needs_preview_refresh(link_id uuid)
RETURNS boolean
SET search_path = public, pg_temp
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
$function$;

-- Fix for update_appearance_settings_updated_at function
-- First drop dependent triggers
DROP TRIGGER IF EXISTS trigger_update_appearance_settings_updated_at ON user_appearance_settings;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS update_appearance_settings_updated_at();

CREATE OR REPLACE FUNCTION update_appearance_settings_updated_at()
RETURNS TRIGGER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Recreate trigger
CREATE TRIGGER trigger_update_appearance_settings_updated_at
    BEFORE UPDATE ON user_appearance_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_appearance_settings_updated_at();

-- Fix for get_category_icon function
DROP FUNCTION IF EXISTS get_category_icon(uuid, text);

CREATE OR REPLACE FUNCTION get_category_icon(p_user_id uuid, p_category text)
RETURNS text
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
DECLARE
    icon_name TEXT;
BEGIN
    SELECT icon INTO icon_name
    FROM user_category_settings
    WHERE user_id = p_user_id AND category = p_category;
    
    -- Return the custom icon if found, otherwise return NULL
    RETURN icon_name;
END;
$function$;

-- Fix for get_user_appearance_settings function
DROP FUNCTION IF EXISTS get_user_appearance_settings(uuid);

CREATE OR REPLACE FUNCTION get_user_appearance_settings(user_id_param uuid)
RETURNS TABLE (
    user_id uuid,
    theme text,
    font text,
    custom_css text,
    updated_at timestamp with time zone
)
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        uas.user_id,
        uas.theme,
        uas.font,
        uas.custom_css,
        uas.updated_at
    FROM user_appearance_settings uas
    WHERE uas.user_id = user_id_param;
END;
$function$;

-- Fix for update_category_icon function
-- First drop dependent triggers
DROP TRIGGER IF EXISTS update_category_icon_trigger ON user_category_settings;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS update_category_icon();

CREATE OR REPLACE FUNCTION update_category_icon()
RETURNS TRIGGER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    -- If this is an update and the icon has changed, update the updated_at timestamp
    IF TG_OP = 'UPDATE' AND OLD.icon IS DISTINCT FROM NEW.icon THEN
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recreate trigger
CREATE TRIGGER update_category_icon_trigger
    BEFORE UPDATE ON user_category_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_category_icon();

-- Fix for reset_category_icon function
DROP FUNCTION IF EXISTS reset_category_icon(uuid, text);

CREATE OR REPLACE FUNCTION reset_category_icon(p_user_id uuid, p_category text)
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE user_category_settings
    SET icon = NULL, updated_at = NOW()
    WHERE user_id = p_user_id AND category = p_category;
END;
$function$;

-- Fix for update_category_settings_updated_at function
-- First drop dependent triggers
DROP TRIGGER IF EXISTS trigger_update_category_settings_updated_at ON user_category_settings;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS update_category_settings_updated_at();

CREATE OR REPLACE FUNCTION update_category_settings_updated_at()
RETURNS TRIGGER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Recreate trigger
CREATE TRIGGER trigger_update_category_settings_updated_at
    BEFORE UPDATE ON user_category_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_category_settings_updated_at();

-- Fix for validate_blog_metadata function
-- First drop dependent constraints
ALTER TABLE user_links DROP CONSTRAINT IF EXISTS valid_blog_metadata;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS validate_blog_metadata(jsonb);

CREATE OR REPLACE FUNCTION validate_blog_metadata(metadata_json jsonb)
RETURNS boolean
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Allow NULL metadata
    IF metadata_json IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Allow empty metadata
    IF jsonb_typeof(metadata_json) = 'object' AND metadata_json = '{}' THEN
        RETURN TRUE;
    END IF;
    
    -- For GitHub repos, we don't require title, description, or content
    IF metadata_json->>'type' = 'github_repo' THEN
        RETURN TRUE;
    END IF;
    
    -- For blog posts, check for required fields
    IF metadata_json->>'type' = 'webpage' THEN
        -- Check for title (required for blog posts)
        IF NOT (metadata_json ? 'title') THEN
            RETURN FALSE;
        END IF;
        
        -- Check for either description or content (at least one required for blog posts)
        IF NOT (metadata_json ? 'description' OR metadata_json ? 'content') THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$function$;

-- Recreate constraint
ALTER TABLE user_links ADD CONSTRAINT valid_blog_metadata 
CHECK (validate_blog_metadata(metadata));

-- Fix for get_default_category_order function
DROP FUNCTION IF EXISTS get_default_category_order();

CREATE OR REPLACE FUNCTION get_default_category_order()
RETURNS jsonb
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN '[
        "portfolio",
        "blog",
        "projects",
        "social",
        "other"
    ]'::jsonb;
END;
$function$;

-- Fix for validate_category_order function
-- First drop dependent constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_category_order_valid;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS validate_category_order(jsonb);

CREATE OR REPLACE FUNCTION validate_category_order(order_array jsonb)
RETURNS boolean
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Allow NULL category order
    IF order_array IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check if the input is a valid JSON array
    IF jsonb_typeof(order_array) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if array is not empty
    IF jsonb_array_length(order_array) = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Check if all elements are strings
    -- We'll check this by ensuring no element is of a different type
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(order_array) AS elem 
        WHERE jsonb_typeof(elem) != 'string'
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$function$;

-- Recreate constraint
ALTER TABLE users ADD CONSTRAINT check_category_order_valid 
CHECK (validate_category_order(category_order));

-- Fix for get_user_blog_stats function
DROP FUNCTION IF EXISTS get_user_blog_stats(uuid);

CREATE OR REPLACE FUNCTION get_user_blog_stats(user_uuid uuid)
RETURNS TABLE (
    total_blogs INTEGER,
    published_blogs INTEGER,
    draft_blogs INTEGER,
    last_published TIMESTAMP WITH TIME ZONE
)
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER AS total_blogs,
        COUNT(CASE WHEN status = 'published' THEN 1 END)::INTEGER AS published_blogs,
        COUNT(CASE WHEN status = 'draft' THEN 1 END)::INTEGER AS draft_blogs,
        MAX(CASE WHEN status = 'published' THEN updated_at END) AS last_published
    FROM user_blogs
    WHERE user_id = user_uuid;
END;
$function$;

-- Fix for update_user_category_order function
DROP FUNCTION IF EXISTS update_user_category_order(uuid, jsonb);

CREATE OR REPLACE FUNCTION update_user_category_order(user_id_param uuid, new_order jsonb)
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO user_category_order (user_id, category_order)
    VALUES (user_id_param, new_order)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        category_order = EXCLUDED.category_order,
        updated_at = NOW();
END;
$function$;

-- Fix for reset_user_category_order function
DROP FUNCTION IF EXISTS reset_user_category_order(uuid);

CREATE OR REPLACE FUNCTION reset_user_category_order(user_id_param uuid)
RETURNS void
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM user_category_order 
    WHERE user_id = user_id_param;
END;
$function$;

-- Fix for handle_new_user function
-- First drop dependent triggers
DROP TRIGGER IF EXISTS handle_new_user_trigger ON users;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Create default appearance settings for the new user
    INSERT INTO user_appearance_settings (user_id)
    VALUES (NEW.id);
    
    -- Create default category order for the new user
    INSERT INTO user_category_order (user_id, category_order)
    VALUES (NEW.id, get_default_category_order());
    
    RETURN NEW;
END;
$function$;

-- Recreate trigger
CREATE TRIGGER handle_new_user_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();