-- ============================================
-- ADD MISSING ABOUT PAGE AND FOOTER TRANSLATIONS
-- ============================================
-- Copy and paste this SQL into your Supabase SQL Editor
-- This will add the missing translations for:
-- 1. About page - Journey timeline and Values section
-- 2. Footer - Services section
-- ============================================

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active) VALUES

-- About Page - Values Section (Philosophy)
('about.values.passion_title', 'about', 'Passion-Driven Artistry', 'Arte Impulsado por la Pasión', 'Value card title', true),
('about.values.passion_desc', 'about', 'Every nail is a canvas where creativity meets technical excellence, resulting in wearable art that tells your unique story.', 'Cada uña es un lienzo donde la creatividad se encuentra con la excelencia técnica, resultando en arte portátil que cuenta tu historia única.', 'Value card description', true),
('about.values.quality_title', 'about', 'Uncompromising Quality', 'Calidad Sin Compromisos', 'Value card title', true),
('about.values.quality_desc', 'about', 'Using only premium products and proven techniques to ensure your nails not only look stunning but remain healthy and strong.', 'Usando solo productos premium y técnicas probadas para garantizar que tus uñas no solo se vean impresionantes sino que permanezcan saludables y fuertes.', 'Value card description', true),
('about.values.personalized_title', 'about', 'Personalized Experience', 'Experiencia Personalizada', 'Value card title', true),
('about.values.personalized_desc', 'about', 'Each appointment is tailored to your individual style, lifestyle, and preferences in an intimate, private setting.', 'Cada cita está adaptada a tu estilo individual, estilo de vida y preferencias en un ambiente íntimo y privado.', 'Value card description', true),
('about.values.client_title', 'about', 'Client-Centered Care', 'Cuidado Centrado en el Cliente', 'Value card title', true),
('about.values.client_desc', 'about', 'Building lasting relationships through exceptional service, attention to detail, and genuine care for your satisfaction.', 'Construyendo relaciones duraderas a través de un servicio excepcional, atención al detalle y un cuidado genuino por tu satisfacción.', 'Value card description', true),

-- About Page - Journey Timeline
('about.journey.2019_title', 'about', 'Discovered My Passion', 'Descubrí mi Pasión', 'Journey milestone title', true),
('about.journey.2019_desc', 'about', 'Fell in love with nail artistry during my first professional training course in Nashville.', 'Me enamoré del arte de uñas durante mi primer curso de entrenamiento profesional en Nashville.', 'Journey milestone description', true),
('about.journey.2020_title', 'about', 'Advanced Training', 'Entrenamiento Avanzado', 'Journey milestone title', true),
('about.journey.2020_desc', 'about', 'Completed specialized certifications in advanced nail systems, art techniques, and salon safety protocols.', 'Completé certificaciones especializadas en sistemas avanzados de uñas, técnicas de arte y protocolos de seguridad de salón.', 'Journey milestone description', true),
('about.journey.2021_title', 'about', 'Building Experience', 'Construyendo Experiencia', 'Journey milestone title', true),
('about.journey.2021_desc', 'about', 'Honed my skills working with diverse clients, developing my signature style and artistic approach.', 'Perfeccioné mis habilidades trabajando con clientes diversos, desarrollando mi estilo característico y enfoque artístico.', 'Journey milestone description', true),
('about.journey.2023_title', 'about', 'Francis Lozano Studio', 'Francis Lozano Studio', 'Journey milestone title', true),
('about.journey.2023_desc', 'about', 'Opened my private, appointment-only studio to provide the intimate, luxury experience I envisioned.', 'Abrí mi estudio privado, solo con cita, para proporcionar la experiencia íntima y de lujo que imaginé.', 'Journey milestone description', true),

-- Footer - Service Fallback Translations (used when services aren't loaded from database)
('footer.service_manicure', 'footer', 'Manicure with Natural Nail Overlay', 'Manicura con Recubrimiento Natural', 'Footer service fallback', true),
('footer.service_pedicure', 'footer', 'Classic Pedicure', 'Pedicura Clásica', 'Footer service fallback', true),
('footer.service_soft_gel', 'footer', 'Soft Gel Nails', 'Uñas de Gel Suave', 'Footer service fallback', true),
('footer.service_acrylic', 'footer', 'Acrylic Nails', 'Uñas Acrílicas', 'Footer service fallback', true),
('footer.service_luxury_pedi', 'footer', 'Luxury Pedi-Spa', 'Pedi-Spa de Lujo', 'Footer service fallback', true)

ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- ============================================
-- DONE! 
-- ============================================
-- After running this SQL:
-- 1. Go to your website
-- 2. Navigate to the About page
-- 3. Switch to Spanish language
-- 4. You should now see:
--    - Journey timeline in Spanish
--    - Values section in Spanish
--    - Footer services in Spanish
-- 5. You can edit these translations in the admin panel under Translations
-- 
-- NOTE: The footer will show services from your database if available.
-- If you add/edit services in the admin panel, make sure to add Spanish
-- translations for the service names so they appear in Spanish.
-- ============================================
