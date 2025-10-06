-- Add service notes fields to studio_settings
-- These notes will appear on the services page with translation support

-- Add new columns to studio_settings
ALTER TABLE studio_settings
ADD COLUMN IF NOT EXISTS service_note_pricing text DEFAULT '💫 Important Note: Final prices may vary depending on nail length, complexity level, and type of design requested.',
ADD COLUMN IF NOT EXISTS service_note_hand_treatment text DEFAULT '🌸 Note: All our hand services include a free paraffin treatment to hydrate and soften the skin. 💆‍♀';

-- Update existing record if exists
UPDATE studio_settings
SET 
  service_note_pricing = COALESCE(service_note_pricing, '💫 Important Note: Final prices may vary depending on nail length, complexity level, and type of design requested.'),
  service_note_hand_treatment = COALESCE(service_note_hand_treatment, '🌸 Note: All our hand services include a free paraffin treatment to hydrate and soften the skin. 💆‍♀')
WHERE service_note_pricing IS NULL OR service_note_hand_treatment IS NULL;
