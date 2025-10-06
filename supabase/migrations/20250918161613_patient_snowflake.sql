/*
  # Fix Studio Settings Duplicates

  1. Database Changes
    - Remove duplicate studio_settings entries
    - Keep only the most recent entry
    - Add unique constraint to prevent future duplicates
  
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- First, let's see what we have and clean up duplicates
-- Keep only the most recent studio_settings record
DELETE FROM studio_settings 
WHERE id NOT IN (
  SELECT id FROM studio_settings 
  ORDER BY updated_at DESC 
  LIMIT 1
);

-- If no records exist, insert a default one
INSERT INTO studio_settings (
  studio_name,
  studio_phone, 
  studio_email,
  website_url
)
SELECT 
  'Francis Lozano Studio',
  '(+1 737-378-5755',
  'francislozanostudio@gmail.com',
  'https://francislozanostudio.com'
WHERE NOT EXISTS (SELECT 1 FROM studio_settings);

-- Add a unique constraint to prevent multiple records
-- Since we want only one studio settings record, we'll add a check constraint
ALTER TABLE studio_settings 
ADD CONSTRAINT single_studio_settings 
CHECK (id IS NOT NULL);

-- Create a unique partial index to ensure only one record exists
CREATE UNIQUE INDEX IF NOT EXISTS studio_settings_singleton 
ON studio_settings ((true));