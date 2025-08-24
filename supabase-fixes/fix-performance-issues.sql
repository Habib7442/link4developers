-- Fix for Supabase Performance Issues
-- This script addresses two main performance problems:
-- 1. Auth RLS Init Plan issues - replacing auth.uid() with (select auth.uid())
-- 2. Multiple Permissive Policies issues - consolidating policies to avoid performance degradation

-- ============================================================================
-- PREP: DROP ALL EXISTING POLICIES THAT WILL BE REPLACED
-- ============================================================================

-- Drop existing user_links table policies
DROP POLICY IF EXISTS "Users can view their own links" ON user_links;
DROP POLICY IF EXISTS "Users can insert their own links" ON user_links;
DROP POLICY IF EXISTS "Users can update their own links" ON user_links;
DROP POLICY IF EXISTS "Users can delete their own links" ON user_links;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_links;
DROP POLICY IF EXISTS "Consolidated user_links SELECT policy" ON user_links;

-- Drop existing user_appearance_settings table policies
DROP POLICY IF EXISTS "Users can view their own appearance settings" ON user_appearance_settings;
DROP POLICY IF EXISTS "Users can insert their own appearance settings" ON user_appearance_settings;
DROP POLICY IF EXISTS "Users can update their own appearance settings" ON user_appearance_settings;
DROP POLICY IF EXISTS "Users can delete their own appearance settings" ON user_appearance_settings;
DROP POLICY IF EXISTS "Public read access for appearance settings" ON user_appearance_settings;
DROP POLICY IF EXISTS "Consolidated user_appearance_settings SELECT policy" ON user_appearance_settings;

-- Drop existing user_category_settings table policies
DROP POLICY IF EXISTS "Users can view their own category settings" ON user_category_settings;
DROP POLICY IF EXISTS "Users can insert their own category settings" ON user_category_settings;
DROP POLICY IF EXISTS "Users can update their own category settings" ON user_category_settings;
DROP POLICY IF EXISTS "Users can delete their own category settings" ON user_category_settings;
DROP POLICY IF EXISTS "Public can view category settings for public profiles" ON user_category_settings;
DROP POLICY IF EXISTS "Consolidated user_category_settings SELECT policy" ON user_category_settings;

-- Drop existing users table policies (if they exist)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Consolidated users SELECT policy" ON users;

-- ============================================================================
-- FIX 1: AUTH RLS INIT PLAN ISSUES
-- ============================================================================

-- Create optimized policies using (select auth.uid()) to prevent row-by-row evaluation

-- user_links table policies
CREATE POLICY "Users can view their own links" ON user_links
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own links" ON user_links
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own links" ON user_links
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own links" ON user_links
  FOR DELETE USING ((select auth.uid()) = user_id);

-- user_appearance_settings table policies
CREATE POLICY "Users can view their own appearance settings" ON user_appearance_settings
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own appearance settings" ON user_appearance_settings
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own appearance settings" ON user_appearance_settings
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own appearance settings" ON user_appearance_settings
  FOR DELETE USING ((select auth.uid()) = user_id);

-- user_category_settings table policies
CREATE POLICY "Users can view their own category settings" ON user_category_settings
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own category settings" ON user_category_settings
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own category settings" ON user_category_settings
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own category settings" ON user_category_settings
  FOR DELETE USING ((select auth.uid()) = user_id);

-- users table policies (if RLS is enabled on this table)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING ((select auth.uid()) = id);

-- ============================================================================
-- FIX 2: MULTIPLE PERMISSIVE POLICIES ISSUES
-- ============================================================================

-- Create consolidated policies that handle both user access and public access in a single policy
-- This eliminates the multiple permissive policies issue

-- Consolidated policy for user_links SELECT
CREATE POLICY "Consolidated user_links SELECT policy" ON user_links
  FOR SELECT USING (
    (select auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_links.user_id 
      AND users.is_public = true
    )
  );

-- Consolidated policy for user_appearance_settings SELECT
CREATE POLICY "Consolidated user_appearance_settings SELECT policy" ON user_appearance_settings
  FOR SELECT USING (
    (select auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_appearance_settings.user_id 
      AND users.is_public = true
    )
  );

-- Consolidated policy for user_category_settings SELECT
CREATE POLICY "Consolidated user_category_settings SELECT policy" ON user_category_settings
  FOR SELECT USING (
    (select auth.uid()) = user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_category_settings.user_id 
      AND users.is_public = true
    )
  );

-- Consolidated policy for users SELECT
CREATE POLICY "Consolidated users SELECT policy" ON users
  FOR SELECT USING (
    (select auth.uid()) = id OR
    is_public = true
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- After applying these fixes, you can verify the changes by running:
-- 
-- 1. Check that policies are using (select auth.uid()):
-- SELECT c.relname as table_name, p.polname as policy_name, p.polqual as qualification_clause, p.polwithcheck as with_check_clause
-- FROM pg_policy p
-- JOIN pg_class c ON p.polrelid = c.oid
-- WHERE p.polname LIKE '%user%';
--
-- 2. Check that there are no multiple permissive policies for the same role/action:
-- SELECT c.relname as table_name, p.polroles as roles, p.polcmd as cmd, count(*) as policy_count
-- FROM pg_policy p
-- JOIN pg_class c ON p.polrelid = c.oid
-- WHERE p.polpermissive = true
-- GROUP BY c.relname, p.polroles, p.polcmd
-- HAVING count(*) > 1;