# Setup Guide - Card Creation Not Working

## ⚠️ IMPORTANT: 403 Error After Login

If you see a **403 (Forbidden) error** after logging in, this means Row Level Security (RLS) policies are not set up. This is the most common issue!

**Quick Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the file: `supabase/migrations/002_rls_policies.sql`
3. This will set up all the necessary permissions

---

If card creation is not working, check these common issues:

## 1. Database Tables Not Created

**Problem:** The `cards` table doesn't exist in your Supabase database.

**Solution:**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click "Run" to execute the migration

## 2. User Not Authenticated

**Problem:** The app requires a signed-in user to create cards.

**Solution:**
You have two options:

### Option A: Set up Authentication
1. In Supabase dashboard, go to Authentication
2. Enable Email authentication
3. Create a sign-in/sign-up page in your app
4. Sign in before creating cards

### Option B: Temporary Testing (Disable Auth Check)
For development/testing, you can temporarily modify the code to work without auth. However, this is NOT recommended for production.

## 3. Row Level Security (RLS) Policies

**Problem:** RLS is blocking inserts even if you're authenticated.

**Solution:**
Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS on cards table
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own cards
CREATE POLICY "Users can insert own cards" ON cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own cards
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own cards
CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own cards
CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (auth.uid() = user_id);
```

Repeat similar policies for all tables:
- `projects`
- `decks`
- `playtimes`
- `playtime_cards`
- `card_sessions`
- `user_stats`
- `user_achievements`

## 4. Check Browser Console

Open your browser's developer console (F12) and look for error messages. The error will tell you exactly what's wrong:
- "User not authenticated" → Need to sign in
- "relation does not exist" → Tables not created
- "permission denied" → RLS policies need to be set up
- "violates foreign key" → Invalid reference (e.g., deck_id doesn't exist)

## Quick Test

1. Open browser console (F12)
2. Try to create a card
3. Check the error message in the console
4. The error message will guide you to the solution

