/*
  # Create gallery table for media management

  1. New Tables
    - `gallery`
      - `id` (uuid, primary key)
      - `title` (text, optional title for the media)
      - `description` (text, optional description)
      - `media_url` (text, URL to the media file)
      - `media_type` (text, 'image' or 'video')
      - `upload_type` (text, 'upload' or 'url')
      - `category` (text, for filtering - chrome, floral, abstract, etc.)
      - `shape` (text, nail shape - almond, stiletto, coffin)
      - `style` (text, style type - geometric, french, marble, etc.)
      - `is_featured` (boolean, for highlighting special pieces)
      - `display_order` (integer, for custom ordering)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `gallery` table
    - Add policy for public read access
    - Add policy for admin-only write access

  3. Storage
    - Create storage bucket for uploaded media
    - Set up storage policies for public access
*/

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  upload_type text NOT NULL DEFAULT 'url' CHECK (upload_type IN ('upload', 'url')),
  category text DEFAULT 'general',
  shape text DEFAULT 'almond',
  style text DEFAULT 'classic',
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Public can read gallery items
CREATE POLICY "Anyone can view gallery"
  ON gallery
  FOR SELECT
  TO public
  USING (true);

-- Only admins can manage gallery
CREATE POLICY "Admins can manage gallery"
  ON gallery
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

-- Create updated_at trigger
CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for gallery uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery bucket
CREATE POLICY "Public can view gallery files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update gallery files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete gallery files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gallery' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );