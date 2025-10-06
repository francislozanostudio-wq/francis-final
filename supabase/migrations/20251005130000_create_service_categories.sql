-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Public can read active categories
CREATE POLICY "Anyone can view active service categories"
  ON service_categories
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage service categories"
  ON service_categories
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

-- Insert default categories
INSERT INTO service_categories (name, slug, display_order) VALUES
  ('Manicures', 'manicures', 1),
  ('Pedicures', 'pedicures', 2),
  ('Extensions', 'extensions', 3),
  ('Nail Systems', 'systems', 4),
  ('Nail Art', 'nail-art', 5),
  ('Add-Ons', 'add-ons', 6),
  ('General', 'general', 7)
ON CONFLICT (slug) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_is_active ON service_categories(is_active);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_service_categories_updated_at();
