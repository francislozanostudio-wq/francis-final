/*
  # Create homepage content table

  1. New Tables
    - `homepage_content`
      - `id` (uuid, primary key)
      - `section` (text, unique) - identifies the section (hero, about, services, etc.)
      - `title` (text) - main heading
      - `subtitle` (text) - subheading
      - `content` (text) - main content/description
      - `image_url` (text) - background or section image
      - `button_text` (text) - CTA button text
      - `button_link` (text) - CTA button link
      - `is_active` (boolean) - whether section is visible
      - `display_order` (integer) - section ordering
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `homepage_content` table
    - Add policy for public read access to active content
    - Add policy for admin full access

  3. Initial Data
    - Insert default content for existing sections
</head>

CREATE TABLE IF NOT EXISTS homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text UNIQUE NOT NULL,
  title text,
  subtitle text,
  content text,
  image_url text,
  button_text text,
  button_link text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

-- Public can read active content
CREATE POLICY "Anyone can view active homepage content"
  ON homepage_content
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins can manage all content
CREATE POLICY "Admins can manage homepage content"
  ON homepage_content
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

-- Add updated_at trigger
CREATE TRIGGER update_homepage_content_updated_at
  BEFORE UPDATE ON homepage_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default content for existing sections
INSERT INTO homepage_content (section, title, subtitle, content, image_url, button_text, button_link, display_order) VALUES
(
  'hero',
  'Francis Lozano Studio',
  'Exquisite nail artistry by appointment in Nashville. Where craftsmanship meets elegance in an intimate studio setting.',
  'Ready to experience luxury nail artistry? Schedule your private appointment and let''s create something beautiful together in my Nashville studio.',
  'https://btartboxnails.com/cdn/shop/articles/img-1725960594240.png?v=1726038916',
  'Book Consultation',
  '/booking',
  1
),
(
  'about',
  'Artistry Redefined',
  'At Francis Lozano Studio, every appointment is a personalized experience. We specialize in creating bespoke nail designs that elevate your natural beauty through precision, artistry, and the finest materials.',
  '',
  '',
  'Experience the Difference',
  '/booking',
  2
),
(
  'services',
  'Our Services',
  'Discover our curated selection of premium nail services',
  '',
  '',
  'View Services & Pricing',
  '/services',
  3
),
(
  'testimonial',
  'Client Testimonial',
  'Francis transformed my nails into absolute works of art. The attention to detail, quality of work, and luxurious experience exceeded all expectations.',
  'Sarah M., Nashville',
  '',
  '',
  '',
  4
),
(
  'cta',
  'Ready to Transform Your Nails?',
  'Don''t wait—my calendar fills up quickly! Book your appointment today and experience the difference of truly personalized nail artistry.',
  '',
  '',
  'Book Now',
  '/booking',
  5
);