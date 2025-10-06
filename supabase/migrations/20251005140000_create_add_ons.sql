/*
  # Create Add-Ons System

  1. New Tables
    - `add_ons`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the add-on service
      - `description` (text, optional) - Description
      - `price` (numeric) - Additional price
      - `is_active` (boolean) - Whether available for booking
      - `display_order` (integer) - For ordering in UI
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to bookings table
    - Add `selected_add_ons` (jsonb) - Array of selected add-on IDs with details
    - Add `add_ons_total` (numeric) - Total price of add-ons

  3. Security
    - Enable RLS on `add_ons` table
    - Add policies for public read, admin manage
*/

-- Create add_ons table
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on add_ons
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to read active add-ons
CREATE POLICY "Anyone can read active add-ons"
  ON add_ons
  FOR SELECT
  USING (is_active = true);

-- Policy for admins to read all add-ons
CREATE POLICY "Admins can read all add-ons"
  ON add_ons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to insert add-ons
CREATE POLICY "Admins can insert add-ons"
  ON add_ons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update add-ons
CREATE POLICY "Admins can update add-ons"
  ON add_ons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to delete add-ons
CREATE POLICY "Admins can delete add-ons"
  ON add_ons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_add_ons_updated_at
  BEFORE UPDATE ON add_ons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add columns to bookings table for add-ons
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS selected_add_ons jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS add_ons_total numeric DEFAULT 0 CHECK (add_ons_total >= 0);

-- Insert default add-ons
INSERT INTO add_ons (name, description, price, display_order, is_active) VALUES
  ('Cuticle Oil Treatment', 'Nourishing treatment for healthy cuticles and nail beds', 5.00, 1, true),
  ('Paraffin Hand Treatment', 'Luxurious hand treatment for soft, moisturized skin', 15.00, 2, true),
  ('Extended Hand Massage', 'Relaxing 10-minute hand and arm massage', 10.00, 3, true),
  ('Nail Repair (per nail)', 'Professional repair for damaged or broken nails', 5.00, 4, true),
  ('Shape Change', 'Change nail shape (square, round, almond, coffin, etc.)', 10.00, 5, true),
  ('Rush Service (48hr notice)', 'Priority booking for last-minute appointments', 25.00, 6, true)
ON CONFLICT DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_add_ons_active ON add_ons(is_active);
CREATE INDEX IF NOT EXISTS idx_add_ons_display_order ON add_ons(display_order);
