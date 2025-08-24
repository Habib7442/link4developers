# Storage Bucket Setup Instructions

## Issue: Custom Icon Uploads Not Working

If you're seeing the error message "Failed to load resource: the server responded with a status of 400 ()" when trying to upload custom icons, it means the required Supabase storage bucket is not properly configured.

## Solution

The application requires a `user-uploads` bucket in Supabase Storage for icon uploads. Follow these steps to create it:

1. Apply the included migration script:

```bash
# From the project root directory
npx supabase migration up
```

This will create the `user-uploads` bucket with the necessary permissions.

## Manual Setup (if migration doesn't work)

If the migration doesn't work for any reason, you can manually create the bucket:

1. Go to your Supabase project dashboard
2. Navigate to "Storage"
3. Click "Create Bucket"
4. Enter the name "user-uploads"
5. Check "Public bucket" (enable public read access)
6. Create the following RLS (Row Level Security) policies:

For `user-uploads` bucket:

- **INSERT Policy**:
  - Name: "Users can upload their own link icons"
  - Target roles: authenticated
  - Using expression: `bucket_id = 'user-uploads' AND storage.foldername(name)[1] = 'link-icons'`

- **SELECT Policy**:
  - Name: "Users can view their own link icons"
  - Target roles: authenticated
  - Using expression: `bucket_id = 'user-uploads' AND storage.foldername(name)[1] = 'link-icons'`

- **DELETE Policy**:
  - Name: "Users can delete their own link icons"
  - Target roles: authenticated
  - Using expression: `bucket_id = 'user-uploads' AND storage.foldername(name)[1] = 'link-icons'`

- **SELECT Policy (for public access)**:
  - Name: "Public can view link icons"
  - Target roles: public
  - Using expression: `bucket_id = 'user-uploads' AND storage.foldername(name)[1] = 'link-icons'`

## Set File Size Limit

In the bucket settings, set the file size limit to 2MB (2097152 bytes) and restrict allowed mime types to:
```
image/jpeg, image/png, image/svg+xml, image/webp, image/gif
```

After completing these steps, restart your application and the icon upload feature should work correctly.