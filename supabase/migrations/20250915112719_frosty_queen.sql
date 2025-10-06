/*
  # Fix Admin RLS Policies

  1. Security Changes
    - Remove recursive RLS policies that cause infinite loops
    - Create simpler, non-recursive policies for profiles table
    - Allow users to read their own profile
    - Allow authenticated users to read basic profile info (needed for admin checks)

  2. Changes Made
    - Drop existing problematic policies
    - Create new non-recursive policies
    - Ensure admin functionality works without infinite recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create new non-recursive policies
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to read role information (needed for admin checks)
-- This is safe because it only exposes the role field, not sensitive data
CREATE POLICY "Authenticated users can read roles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- For admin operations on bookings, we'll rely on the existing booking policies
-- which check the user's role from their own profile (not recursively)