/*
  # Create testimonials management system

  1. New Tables
    - `testimonials`
      - `id` (uuid, primary key)
      - `client_name` (text, required)
      - `client_location` (text, optional)
      - `rating` (integer, 1-5)
      - `testimonial_text` (text, required)
      - `service_name` (text, optional)
      - `client_image_url` (text, optional)
      - `is_featured` (boolean, default false)
      - `display_order` (integer, default 0)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `review_links`
      - `id` (uuid, primary key)
      - `platform` (text, e.g., 'google', 'instagram', 'facebook')
      - `platform_name` (text, display name)
      - `url` (text, review link)
      - `is_active` (boolean, default true)
      - `display_order` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin management
*/

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_location text,
  rating integer NOT NULL DEFAULT 5,
  testimonial_text text NOT NULL,
  service_name text,
  client_image_url text,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints for testimonials
ALTER TABLE testimonials ADD CONSTRAINT testimonials_rating_check 
  CHECK (rating >= 1 AND rating <= 5);

-- Create review_links table
CREATE TABLE IF NOT EXISTS review_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  platform_name text NOT NULL,
  url text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints for review_links
ALTER TABLE review_links ADD CONSTRAINT review_links_platform_unique 
  UNIQUE (platform);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_links ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Anyone can view active testimonials"
  ON testimonials
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
  ON testimonials
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

-- Create policies for review_links
CREATE POLICY "Anyone can view active review links"
  ON review_links
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage review links"
  ON review_links
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

-- Create updated_at triggers
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_links_updated_at
  BEFORE UPDATE ON review_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default review links
INSERT INTO review_links (platform, platform_name, url, display_order) VALUES
  ('google', 'Google Reviews', 'https://www.google.com/search?q=francis+lozano+studio+reviews', 1),
  ('instagram', 'Instagram', 'https://www.instagram.com/francis_lozano_studio', 2)
ON CONFLICT (platform) DO NOTHING;

-- Insert sample testimonials (preserving existing ones from the static data)
INSERT INTO testimonials (client_name, client_location, rating, testimonial_text, service_name, is_featured, display_order, is_active) VALUES
  ('Sarah M.', 'Nashville, TN', 5, 'Francis transformed my nails into absolute works of art. The attention to detail, the quality of work, and the luxurious experience exceeded all my expectations. I''ll never go anywhere else!', 'Custom Chrome Art', true, 1, true),
  ('Emma Rodriguez', 'Franklin, TN', 5, 'The private studio experience is incredible. Francis takes the time to understand exactly what you want and creates magic. My gel-X extensions have lasted 4 weeks and still look perfect!', 'Gel-X Extensions', true, 2, true),
  ('Jessica Chen', 'Brentwood, TN', 5, 'I''ve been to many nail salons, but Francis Lozano Studio is in a league of its own. The artistry, professionalism, and overall experience is worth every penny. Absolutely obsessed!', 'Marble Nail Art', true, 3, true),
  ('Amanda K.', 'Nashville, TN', 5, 'Francis has this amazing ability to take a vague idea and turn it into something stunning. The consultation process is thorough, and the final result always exceeds my expectations.', 'Minimalist Design', false, 4, true),
  ('Lauren Thompson', 'Green Hills, TN', 5, 'The luxury spa pedicure was divine! Francis'' attention to detail and the relaxing atmosphere made it the perfect self-care experience. I left feeling completely pampered.', 'Luxury Spa Pedicure', false, 5, true),
  ('Megan Walsh', 'Belle Meade, TN', 5, 'For my wedding, Francis created the most beautiful romantic design with pearls and ombré. The photos turned out incredible, and my nails stayed perfect through the entire celebration!', 'Bridal Nail Art', false, 6, true),
  ('Rachel Davis', 'Music Row, TN', 5, 'As someone in the entertainment industry, my nails are always on display. Francis understands this and creates designs that photograph beautifully and last through demanding schedules.', 'Performance Ready Nails', false, 7, true),
  ('Taylor Brown', 'The Gulch, TN', 5, 'The booking process is seamless, the studio is gorgeous, and Francis is incredibly talented. I drive from an hour away because the quality is unmatched. Worth every mile!', 'Chrome & Foil Art', false, 8, true)
ON CONFLICT DO NOTHING;