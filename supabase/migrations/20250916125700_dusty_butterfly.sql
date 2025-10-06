/*
  # Update homepage content data

  1. Changes
    - Remove unused content from hero section
    - Update CTA section with proper content
    - Clean up database to match actual website usage

  2. Data Updates
    - Hero section: Remove unused content field
    - CTA section: Update with actual displayed content
*/

-- Update hero section to remove unused content
UPDATE homepage_content 
SET content = NULL
WHERE section = 'hero';

-- Update CTA section with the actual content displayed on the website
UPDATE homepage_content 
SET 
  title = 'Ready to Transform Your Nails?',
  subtitle = 'Don''t wait—my calendar fills up quickly! Book your appointment today and experience the difference of truly personalized nail artistry.',
  button_text = 'Book Now',
  button_link = '/booking'
WHERE section = 'cta';