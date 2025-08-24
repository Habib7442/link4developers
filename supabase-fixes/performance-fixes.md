# Supabase Performance Fixes

This document explains the performance issues identified in the Supabase database and how they were resolved.

## Issues Fixed

### 1. Auth RLS Initialization Plan Issues

**Problem**: Multiple RLS policies were using `auth.uid()` directly, which causes PostgreSQL to re-evaluate the function for each row in the table. This leads to suboptimal query performance at scale.

**Solution**: Replaced `auth.uid()` with `(select auth.uid())` in all RLS policies. This ensures the function is evaluated once per query rather than once per row.

**Tables Affected**:
- `user_links`
- `user_appearance_settings`
- `user_category_settings`
- `users`

### 2. Multiple Permissive Policies Issues

**Problem**: Several tables had multiple permissive policies for the same role and action (e.g., SELECT for anon role). This causes each policy to be executed for every relevant query, leading to performance degradation.

**Solution**: Consolidated multiple permissive policies into single policies that handle all required conditions.

**Tables Affected**:
- `user_links`
- `user_appearance_settings`
- `user_category_settings`
- `users`

## Implementation

Run the SQL script `fix-performance-issues.sql` to apply these fixes:

```bash
psql -h your-supabase-db-host -d your-database-name -U your-username -f fix-performance-issues.sql
```

Or execute the script in the Supabase SQL editor.

## Verification

After applying the fixes, you can verify the changes:

1. Check that policies are using `(select auth.uid())`:
```sql
SELECT c.relname as table_name, p.polname as policy_name, p.polqual, p.polwithcheck 
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE p.polname LIKE '%user%';
```

2. Check that there are no multiple permissive policies for the same role/action:
```sql
SELECT c.relname as table_name, p.polroles, p.polcmd, count(*) 
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE p.polpermissive = true
GROUP BY c.relname, p.polroles, p.polcmd 
HAVING count(*) > 1;
```

## Performance Benefits

These fixes should provide significant performance improvements, especially as the database grows:

1. **Reduced Function Calls**: Using `(select auth.uid())` reduces the number of function evaluations from N (rows) to 1 (query).
2. **Fewer Policy Evaluations**: Consolidating policies reduces the number of policy checks per query.
3. **Better Query Planning**: The query planner can optimize better with fewer policies to evaluate.

## Status

✅ **All performance issues have been resolved** as of 2025-08-24.

## References

- [Supabase RLS Performance Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)