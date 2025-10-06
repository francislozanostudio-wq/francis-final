/*
  # Add dedication text to hero section

  1. Changes
    - Add the dedication text to the hero section content field
    - This text will be displayed on the homepage and can be edited via admin panel
*/

-- Update hero section to include the dedication text
UPDATE homepage_content 
SET content = 'First and foremost, God 🙏🏼
Thank you, God, for allowing me to transform my passion into art and for every woman and man who trusts me. May your hands and mine always work guided by faith, love, and the desire to reflect the true beauty that comes from the soul.'
WHERE section = 'hero';
