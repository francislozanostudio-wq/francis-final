/*
  # Add Testimonial Link System

  1. New Tables
    - `testimonial_links`
      - `id` (uuid, primary key)
      - `short_code` (text, unique) - Short code for the link
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, optional)
      - `is_active` (boolean) - Whether the link can still be used
      - `max_uses` (integer, optional) - Maximum number of uses
      - `use_count` (integer) - Current number of uses
  
  2. Changes to existing tables
    - `testimonials`
      - Add `link_id` (uuid, foreign key) - Reference to the link used

  3. Security
    - Enable RLS on testimonial_links table
    - Add policies for public testimonial submission
    - Update existing policies
*/

-- Create testimonial_links table
CREATE TABLE IF NOT EXISTS testimonial_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  max_uses integer,
  use_count integer DEFAULT 0
);

-- Add link_id to testimonials table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'link_id'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN link_id uuid REFERENCES testimonial_links(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE testimonial_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can view all testimonial links" ON testimonial_links;
  DROP POLICY IF EXISTS "Admins can create testimonial links" ON testimonial_links;
  DROP POLICY IF EXISTS "Admins can update testimonial links" ON testimonial_links;
  DROP POLICY IF EXISTS "Admins can delete testimonial links" ON testimonial_links;
  DROP POLICY IF EXISTS "Anyone can insert testimonials via valid link" ON testimonials;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policies for testimonial_links (admin only)
CREATE POLICY "Admins can view all testimonial links"
  ON testimonial_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create testimonial links"
  ON testimonial_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update testimonial links"
  ON testimonial_links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete testimonial links"
  ON testimonial_links FOR DELETE
  TO authenticated
  USING (true);

-- Policy for public testimonial submission via link
CREATE POLICY "Anyone can insert testimonials via valid link"
  ON testimonials FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM testimonial_links
      WHERE testimonial_links.id = link_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (max_uses IS NULL OR use_count < max_uses)
    )
  );

-- Function to increment use count when testimonial is created
CREATE OR REPLACE FUNCTION increment_link_use_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.link_id IS NOT NULL THEN
    UPDATE testimonial_links
    SET use_count = use_count + 1
    WHERE id = NEW.link_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically increment use count
DROP TRIGGER IF EXISTS increment_use_count_trigger ON testimonials;
CREATE TRIGGER increment_use_count_trigger
  AFTER INSERT ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION increment_link_use_count();
