/*
  # Fix Testimonial Links RLS Policies and Foreign Key Constraints
  
  This migration fixes:
  1. Row Level Security policies for testimonial_links to properly check admin permissions
  2. Foreign key constraint to allow deletion with ON DELETE SET NULL
*/

-- Step 1: Drop the existing foreign key constraint if it exists
DO $$
BEGIN
  -- Drop the foreign key constraint
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'testimonials_link_id_fkey'
    AND table_name = 'testimonials'
  ) THEN
    ALTER TABLE testimonials DROP CONSTRAINT testimonials_link_id_fkey;
  END IF;
END $$;

-- Step 2: Re-add the foreign key with ON DELETE SET NULL
-- This allows deleting links while preserving associated testimonials
ALTER TABLE testimonials 
  ADD CONSTRAINT testimonials_link_id_fkey 
  FOREIGN KEY (link_id) 
  REFERENCES testimonial_links(id) 
  ON DELETE SET NULL;

-- Step 3: Drop existing RLS policies
DROP POLICY IF EXISTS "Admins can view all testimonial links" ON testimonial_links;
DROP POLICY IF EXISTS "Admins can create testimonial links" ON testimonial_links;
DROP POLICY IF EXISTS "Admins can update testimonial links" ON testimonial_links;
DROP POLICY IF EXISTS "Admins can delete testimonial links" ON testimonial_links;

-- Step 4: Recreate policies with proper admin checks
CREATE POLICY "Admins can view all testimonial links"
  ON testimonial_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create testimonial links"
  ON testimonial_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update testimonial links"
  ON testimonial_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete testimonial links"
  ON testimonial_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
