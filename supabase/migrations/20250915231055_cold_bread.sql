/*
  # Create services table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `name` (text, service name)
      - `description` (text, service description)
      - `price` (numeric, service price)
      - `duration` (integer, duration in minutes)
      - `category` (text, service category)
      - `is_active` (boolean, whether service is available)
      - `display_order` (integer, for ordering services)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `services` table
    - Add policy for public to read active services
    - Add policy for admins to manage all services

  3. Initial Data
    - Insert existing services from the booking form
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  duration integer NOT NULL CHECK (duration > 0),
  category text NOT NULL DEFAULT 'general',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public can read active services
CREATE POLICY "Anyone can view active services"
  ON services
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage all services
CREATE POLICY "Admins can manage services"
  ON services
  FOR ALL
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

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial services data
INSERT INTO services (name, description, price, duration, category, display_order) VALUES
  ('Classic Manicure', 'Traditional nail care with cuticle work, shaping, and polish', 45, 45, 'manicures', 1),
  ('Luxury Spa Manicure', 'Premium service with exfoliation, massage, and hydrating treatment', 65, 60, 'manicures', 2),
  ('Classic Pedicure', 'Complete foot care with callus removal, massage, and polish', 55, 60, 'pedicures', 3),
  ('Luxury Spa Pedicure', 'Ultimate pampering with advanced treatments and extended massage', 75, 75, 'pedicures', 4),
  ('Gel-X Extensions', 'Lightweight, durable extensions with natural look and feel', 85, 90, 'extensions', 5),
  ('Acrylic Extensions', 'Strong, long-lasting extensions perfect for dramatic length', 75, 90, 'extensions', 6),
  ('Dip Powder System', 'Chip-resistant color system for natural or short extensions', 65, 75, 'systems', 7),
  ('Builder Gel Overlay', 'Strengthening overlay for natural nails with added durability', 55, 60, 'systems', 8),
  ('Simple Nail Art', 'Accent nails, French variations, basic patterns, and solid colors', 25, 30, 'nail-art', 9),
  ('Detailed Nail Art', 'Hand-painted designs, florals, geometric patterns, and chrome finishes', 45, 45, 'nail-art', 10),
  ('Intricate Nail Art', 'Complex 3D art, encapsulated designs, foils, and custom masterpieces', 75, 60, 'nail-art', 11);