# How to Apply the Service Categories Migration

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content of `supabase/migrations/20251005130000_create_service_categories.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. You should see "Success. No rows returned" message

## Option 2: Using Supabase CLI (If installed)

```bash
# Make sure you're in the project directory
cd c:/Users/asus/OneDrive/Desktop/FRANCIS-main

# Link your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations
npx supabase db push

# Or push this specific migration
npx supabase db push --include-all
```

## Verification Steps

After running the migration, verify it worked:

1. In Supabase Dashboard → **Table Editor**
2. Look for a new table called `service_categories`
3. You should see 7 default categories already inserted:
   - Manicures
   - Pedicures
   - Extensions
   - Nail Systems
   - Nail Art
   - Add-Ons
   - General

4. Test in your app:
   - Go to Admin → Services
   - Click "Add Service"
   - Open the Category dropdown
   - You should see all categories plus "Add New Category" at the bottom

## Troubleshooting

### If the table already exists:
The migration uses `CREATE TABLE IF NOT EXISTS` so it won't fail.

### If you get a unique constraint error:
The migration uses `ON CONFLICT DO NOTHING` for default categories, so duplicates are ignored.

### If RLS policies fail:
Make sure you have a `profiles` table with a `role` column that contains 'admin' values.

## Need Help?

If you encounter any issues:
1. Check the Supabase Dashboard → **Logs** for error messages
2. Ensure you're logged in as an admin user
3. Verify your database connection is working
