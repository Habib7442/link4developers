-- Verification script for Supabase performance fixes

-- 1. Check that policies are using (select auth.uid()) instead of auth.uid()
-- This query will show policies that still use auth.uid() directly
SELECT 
  c.relname as table_name, 
  p.polname as policy_name, 
  p.polqual as qualification_clause, 
  p.polwithcheck as with_check_clause,
  'Uses auth.uid() directly - needs fixing' as issue
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE (p.polqual ILIKE '%auth.uid%' AND p.polqual NOT ILIKE '%select auth.uid%')
   OR (p.polwithcheck ILIKE '%auth.uid%' AND p.polwithcheck NOT ILIKE '%select auth.uid%');

-- 2. Check for multiple permissive policies on the same table for the same role/action
-- This query will show any remaining multiple permissive policies
SELECT 
  c.relname as table_name,
  p.polroles as roles,
  p.polcmd as cmd,
  count(*) as policy_count,
  'Multiple permissive policies - needs consolidation' as issue
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE p.polpermissive = true
GROUP BY c.relname, p.polroles, p.polcmd
HAVING count(*) > 1;

-- 3. List all policies with their definitions to verify the fixes
SELECT 
  c.relname as table_name,
  p.polname as policy_name,
  p.polpermissive as permissive,
  p.polroles as roles,
  CASE p.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE p.polcmd::text
  END as command,
  p.polqual as using_clause,
  p.polwithcheck as with_check_clause
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname IN ('user_links', 'user_appearance_settings', 'user_category_settings', 'users')
ORDER BY c.relname, p.polcmd, p.polname;