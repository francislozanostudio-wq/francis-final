/*
  # Fix booking RLS policies to allow public submissions

  1. Security Changes
    - Allow anonymous users to insert bookings (for public booking form)
    - Keep admin-only policies for reading, updating, and deleting
    - Ensure booking submissions work from the public website

  2. Changes Made
    - Drop existing restrictive insert policy
    - Create new policy allowing public booking submissions
    - Maintain admin-only access for management operations
*/

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Admins can insert bookings" ON bookings;

-- Allow anyone to insert bookings (for public booking form submissions)
CREATE POLICY "Anyone can submit bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Keep existing admin-only policies for reading, updating, and deleting
-- These ensure only admins can manage bookings in the dashboard

-- Ensure the admin read policy exists
DROP POLICY IF EXISTS "Admins can read all bookings" ON bookings;
CREATE POLICY "Admins can read all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure the admin update policy exists
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
CREATE POLICY "Admins can update bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure the admin delete policy exists
DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;
CREATE POLICY "Admins can delete bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );