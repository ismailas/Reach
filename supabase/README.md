# Supabase Database Setup

## Migration Instructions

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. **Run migration 1:** Copy and paste `001_initial_schema.sql` → Click "Run"
4. **Run migration 2:** Copy and paste `002_rls_policies.sql` → Click "Run"
   - ⚠️ **IMPORTANT:** This fixes the 403 (Forbidden) error after login!
   - This sets up Row Level Security (RLS) policies so users can access their own data

## Environment Variables

After setting up Supabase, add these to your `.env` file:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

You can find these values in your Supabase project settings under API.

## Row Level Security

**✅ Already included in `002_rls_policies.sql` - Just run that file!**

The RLS policies ensure:
- Users can only see their own data
- Users can only create/update/delete their own data
- Prevents unauthorized access to other users' data

If you see a **403 Forbidden error** after logging in, it means RLS policies are not set up. Run `002_rls_policies.sql` to fix this.

