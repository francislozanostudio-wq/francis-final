/*
  # Add hero dedication translations

  1. Changes
    - Add translation entries for the hero dedication text
    - This allows the dedication to be displayed in both English and Spanish
*/

-- Insert translation for the hero dedication text
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'homepage.hero.dedication',
  'homepage',
  'First and foremost, God 🙏🏼
Thank you, God, for allowing me to transform my passion into art and for every woman and man who trusts me. May your hands and mine always work guided by faith, love, and the desire to reflect the true beauty that comes from the soul.',
  'Primero que nada, Dios 🙏🏼
Gracias, Dios, por permitirme transformar mi pasión en arte y por cada mujer y hombre que confía en mí. Que tus manos y las mías siempre trabajen guiadas por la fe, el amor y el deseo de reflejar la verdadera belleza que viene del alma.',
  'Dedication text displayed in the hero section of the homepage',
  true
)
ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  is_active = EXCLUDED.is_active;
