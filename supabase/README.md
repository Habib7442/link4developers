# Supabase Database Setup for Link4Coders

This directory contains the database schema and migration files for the Link4Coders profile builder feature.

## Quick Setup

### 1. Run the Migration

You can run the migration in your Supabase dashboard SQL editor or using the Supabase CLI:

**Option A: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/001_profile_builder_schema.sql`
4. Click "Run"

**Option B: Supabase CLI** (if you have it set up)
```bash
supabase db push
```

### 2. Verify the Setup

After running the migration, you should have:

- **users table** with additional columns:
  - `profile_title` (TEXT)
  - `theme_id` (TEXT, default: 'developer-dark')
  - `custom_domain` (TEXT)
  - `is_public` (BOOLEAN, default: true)

- **user_links table** with columns:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to users)
  - `title` (TEXT, required)
  - `url` (TEXT, required)
  - `description` (TEXT, optional)
  - `icon_type` (TEXT, enum values)
  - `position` (INTEGER)
  - `is_active` (BOOLEAN)
  - `click_count` (INTEGER)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- **RLS Policies** for secure access
- **Database Functions** for link management
- **Indexes** for performance

## Database Schema Overview

### Tables

#### users (extended)
The existing users table is extended with profile-specific fields:
- `profile_title`: Custom title for the user's profile
- `theme_id`: Selected theme for the profile page
- `custom_domain`: Custom domain for premium users
- `is_public`: Whether the profile is publicly accessible

#### user_links (new)
Stores all links for user profiles:
- Supports different link types (GitHub, LinkedIn, Twitter, etc.)
- Drag-and-drop ordering with position field
- Click tracking for analytics
- Active/inactive status for link management

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Public profiles are viewable by anonymous users
- All database functions use `SECURITY DEFINER` for safe execution

### Functions

- `reorder_user_links()`: Safely reorder user links
- `increment_link_clicks()`: Track link clicks for analytics
- `update_updated_at_column()`: Auto-update timestamps

## Environment Variables

Make sure you have these environment variables set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing the Setup

You can test the database setup by:

1. Creating a user account through the app
2. Checking that the user appears in the `users` table
3. Creating a test link through the profile builder
4. Verifying the link appears in the `user_links` table

## Troubleshooting

### Common Issues

1. **Migration fails**: Check that you have the necessary permissions in Supabase
2. **RLS errors**: Ensure you're authenticated when testing database operations
3. **Function errors**: Verify that all functions were created successfully

### Checking Setup

Run these queries in the Supabase SQL editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_links');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('reorder_user_links', 'increment_link_clicks');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE tablename = 'user_links';
```

## Next Steps

After setting up the database:

1. Test the database service functions in `lib/database.ts`
2. Build the dashboard components
3. Create the public profile pages
4. Implement the link management UI

For any issues, check the Supabase logs in your dashboard or contact the development team.
