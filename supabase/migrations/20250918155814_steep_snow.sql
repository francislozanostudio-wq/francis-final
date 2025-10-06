/*
  # Create studio settings table

  1. New Tables
    - `studio_settings`
      - `id` (uuid, primary key)
      - `studio_name` (text)
      - `studio_phone` (text)
      - `studio_email` (text)
      - `website_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `studio_settings` table
    - Add policy for admins to manage studio settings
    - Add policy for public to read studio settings
*/

CREATE TABLE IF NOT EXISTS studio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_name text NOT NULL DEFAULT 'Francis Lozano Studio',
  studio_phone text NOT NULL DEFAULT '(+1 737-378-5755',
  studio_email text NOT NULL DEFAULT 'francislozanostudio@gmail.com',
  website_url text NOT NULL DEFAULT 'https://francislozanostudio.com',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE studio_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage studio settings"
  ON studio_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can read studio settings"
  ON studio_settings
  FOR SELECT
  TO public
  USING (true);

CREATE TRIGGER update_studio_settings_updated_at
  BEFORE UPDATE ON studio_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default studio settings
INSERT INTO studio_settings (studio_name, studio_phone, studio_email, website_url)
VALUES ('Francis Lozano Studio', '(+1 737-378-5755', 'francislozanostudio@gmail.com', 'https://francislozanostudio.com')
ON CONFLICT DO NOTHING;