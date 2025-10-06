/*
  # Create About Content Management Table

  1. New Tables
    - `about_content`
      - `id` (uuid, primary key)
      - `section` (text, unique) - identifies which section (hero, main, philosophy, journey, experience)
      - `title` (text) - section title
      - `subtitle` (text) - section subtitle
      - `content` (text) - main content/description
      - `image_url` (text) - image URL for the section
      - `display_order` (integer) - order of display
      - `is_active` (boolean) - whether section is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `about_content` table
    - Add policy for public read access
    - Add policy for admin write access

  3. Initial Data
    - Insert default content for all About page sections
*/

CREATE TABLE IF NOT EXISTS about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text UNIQUE NOT NULL,
  title text,
  subtitle text,
  content text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Public can read about content
CREATE POLICY "Anyone can view about content"
  ON about_content
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage about content
CREATE POLICY "Admins can manage about content"
  ON about_content
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
CREATE TRIGGER update_about_content_updated_at
  BEFORE UPDATE ON about_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default content
INSERT INTO about_content (section, title, subtitle, content, image_url, display_order) VALUES
('hero', 'Meet Francis', null, 'The artist behind the artistry. Discover the passion, training, and philosophy that drives every beautiful creation at Francis Lozano Studio.', '/src/assets/francis-portrait.jpg', 1),
('main', 'Hello, I''m Francis', null, 'Welcome to my world of nail artistry! I''m Francis Lozano, the creative force behind Francis Lozano Studio. What started as a fascination with intricate designs has evolved into a passionate career dedicated to transforming nails into personalized works of art.

In my private Nashville studio, I''ve created a sanctuary where luxury meets artistry. Every appointment is an intimate collaboration where your vision comes to life through meticulous attention to detail, premium products, and techniques refined through years of dedicated practice.

I believe that beautiful nails are more than just an aesthetic choice—they''re a form of self-expression that should make you feel confident and radiant every day. That''s why I take the time to understand not just what you want, but who you are, ensuring every design reflects your unique personality and style.', '/src/assets/francis-portrait.jpg', 2),
('philosophy', 'My Philosophy', 'The principles that guide every interaction, every design, and every detail of your experience', null, null, 3),
('journey', 'My Journey', 'The path that led me to create Francis Lozano Studio and serve Nashville''s most discerning clients', null, null, 4),
('experience', 'The Studio Experience', null, 'Step into my private home studio, where every detail has been carefully curated to provide a luxurious, relaxing experience. From the moment you arrive, you''ll feel the difference that comes with truly personalized service.

Unlike traditional salons, my appointment-only approach means you receive my undivided attention in a peaceful, intimate setting. No crowds, no rushing—just you, me, and the time needed to create something truly beautiful.

This is more than a nail appointment; it''s your personal sanctuary for self-care and artistic expression.', null, 5)
ON CONFLICT (section) DO NOTHING;