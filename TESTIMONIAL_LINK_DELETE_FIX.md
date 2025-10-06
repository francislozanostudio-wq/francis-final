# Fix for Testimonial Link Deletion Error

## Problem
When trying to delete a testimonial link in the admin dashboard, an error occurs. This is caused by:

1. **Foreign Key Constraint Issue**: The `testimonials` table has a foreign key reference to `testimonial_links`, but without a proper `ON DELETE` action. When testimonials exist that were created using a link, the link cannot be deleted.

2. **RLS Policy Issue**: The Row Level Security policies were using `USING (true)` which doesn't properly verify admin permissions.

## Solution

### What Was Fixed

1. **Foreign Key Constraint**: Updated to use `ON DELETE SET NULL`
   - When a testimonial link is deleted, any testimonials created with that link will have their `link_id` set to `NULL`
   - This preserves the testimonials while allowing the link to be deleted
   - This is the correct behavior since testimonials should remain even after their creation link is removed

2. **RLS Policies**: Updated to properly check admin role
   - All operations (SELECT, INSERT, UPDATE, DELETE) now verify the user is an admin
   - Checks against the `profiles` table to confirm `role = 'admin'`

3. **Better Error Handling**: Updated the `TestimonialLinkGenerator` component
   - Now shows detailed error messages from the database
   - Better feedback to help diagnose permission or constraint issues

### Files Modified

1. **New Migration**: `supabase/migrations/20251006000000_fix_testimonial_links_rls.sql`
   - Drops and recreates the foreign key constraint with `ON DELETE SET NULL`
   - Updates all RLS policies with proper admin checks

2. **Component Update**: `src/components/admin/TestimonialLinkGenerator.tsx`
   - Enhanced error handling in the `deleteLink` function
   - Shows detailed error messages to help troubleshoot issues

## How to Deploy

### Step 1: Apply the Database Migration

Run the following command to apply the migration to your Supabase database:

```bash
# If using Supabase CLI locally
npx supabase db push

# OR manually apply via Supabase Dashboard
# 1. Go to your Supabase project dashboard
# 2. Navigate to SQL Editor
# 3. Copy the contents of supabase/migrations/20251006000000_fix_testimonial_links_rls.sql
# 4. Paste and run the SQL
```

### Step 2: Verify the Fix

1. **Log in to Admin Dashboard**
   - Navigate to the Testimonials section
   - Go to the "Review Generator" tab

2. **Test Deletion**
   - Try deleting a testimonial link
   - If there are testimonials created with this link, they will be preserved
   - The link should delete successfully

3. **Check Testimonials**
   - Go to the "Testimonials" tab
   - Verify that testimonials created via the deleted link still exist
   - Their `link_id` will be null (which is fine - they're independent records now)

## Technical Details

### Foreign Key Behavior

**Before:**
```sql
ALTER TABLE testimonials 
  ADD COLUMN link_id uuid REFERENCES testimonial_links(id);
-- No ON DELETE action means RESTRICT by default
```

**After:**
```sql
ALTER TABLE testimonials 
  ADD CONSTRAINT testimonials_link_id_fkey 
  FOREIGN KEY (link_id) 
  REFERENCES testimonial_links(id) 
  ON DELETE SET NULL;
-- ON DELETE SET NULL allows deletion while preserving testimonials
```

### RLS Policy Example

**Before:**
```sql
CREATE POLICY "Admins can delete testimonial links"
  ON testimonial_links FOR DELETE
  TO authenticated
  USING (true);  -- Too permissive!
```

**After:**
```sql
CREATE POLICY "Admins can delete testimonial links"
  ON testimonial_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );  -- Properly checks admin role
```

## Troubleshooting

### Still Getting Errors After Migration?

1. **Check if you're logged in as admin**
   ```sql
   -- Run this in Supabase SQL Editor to check your role
   SELECT * FROM profiles WHERE id = auth.uid();
   ```
   - Make sure `role = 'admin'`

2. **Verify the migration was applied**
   ```sql
   -- Check if the constraint exists with ON DELETE SET NULL
   SELECT 
     conname AS constraint_name,
     confdeltype AS on_delete_action
   FROM pg_constraint
   WHERE conname = 'testimonials_link_id_fkey';
   ```
   - `on_delete_action` should be 'n' (SET NULL)

3. **Check RLS policies**
   ```sql
   -- View all policies on testimonial_links
   SELECT * FROM pg_policies WHERE tablename = 'testimonial_links';
   ```

### Common Errors and Solutions

**Error: "new row violates row-level security policy"**
- Solution: Make sure you're logged in as an admin user

**Error: "permission denied for table testimonial_links"**
- Solution: The RLS policies might not be applied. Re-run the migration

**Error: "update or delete on table violates foreign key constraint"**
- Solution: The foreign key constraint wasn't updated. Re-run the migration

## Testing Checklist

- [ ] Migration applied successfully
- [ ] Can view testimonial links in admin dashboard
- [ ] Can create new testimonial links
- [ ] Can toggle link status (active/inactive)
- [ ] **Can delete links (even those with testimonials)**
- [ ] Testimonials remain after their creation link is deleted
- [ ] Non-admin users cannot access testimonial links

## Additional Notes

- Deleting a link does not delete testimonials created through it
- This is the correct behavior - testimonials are independent records
- The `link_id` field is primarily for tracking and analytics
- Setting it to NULL when the link is deleted maintains data integrity
