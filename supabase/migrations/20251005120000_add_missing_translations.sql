/*
# Add Missing Translation Keys for Gallery and About Pages

This migration adds the missing translation keys that were hardcoded in English
and not connected to the translation system.

1. Gallery page translations
2. About page translations (all sections)
3. Hero section additional text
*/

-- Insert missing translation keys
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active) VALUES

-- Gallery Page - Additional translations
('gallery.book_cta', 'gallery', 'Love what you see? Book your appointment today and let''s create your perfect nail design together.', '¿Te gusta lo que ves? Reserva tu cita hoy y creemos juntos tu diseño de uñas perfecto.', 'Gallery CTA text'),
('gallery.book_appointment', 'gallery', 'Book Appointment', 'Reservar Cita', 'Gallery book button'),
('gallery.view_services', 'gallery', 'View Services', 'Ver Servicios', 'Gallery services button'),
('gallery.custom_design_title', 'gallery', 'Bring Your Vision to Life', 'Dale Vida a tu Visión', 'Custom design section title'),
('gallery.custom_design_description', 'gallery', 'Have a specific design in mind? Our custom consultation process ensures your unique vision becomes a stunning reality. From concept sketches to the final masterpiece, we work together to create nail art that''s uniquely yours.', '¿Tienes un diseño específico en mente? Nuestro proceso de consulta personalizado garantiza que tu visión única se convierta en una realidad impresionante. Desde bocetos conceptuales hasta la obra maestra final, trabajamos juntos para crear arte de uñas que es únicamente tuyo.', 'Custom design section description'),
('gallery.discuss_custom', 'gallery', 'Discuss Custom Design', 'Discutir Diseño Personalizado', 'Custom design CTA button'),
('gallery.showing_designs', 'gallery', 'Showing {count} designs', 'Mostrando {count} diseños', 'Results count text'),

-- About Page - All sections
('about.values.passion_title', 'about', 'Passion-Driven Artistry', 'Arte Impulsado por la Pasión', 'Value card title'),
('about.values.passion_desc', 'about', 'Every nail is a canvas where creativity meets technical excellence, resulting in wearable art that tells your unique story.', 'Cada uña es un lienzo donde la creatividad se encuentra con la excelencia técnica, resultando en arte portátil que cuenta tu historia única.', 'Value card description'),
('about.values.quality_title', 'about', 'Uncompromising Quality', 'Calidad Sin Compromisos', 'Value card title'),
('about.values.quality_desc', 'about', 'Using only premium products and proven techniques to ensure your nails not only look stunning but remain healthy and strong.', 'Usando solo productos premium y técnicas probadas para garantizar que tus uñas no solo se vean impresionantes sino que permanezcan saludables y fuertes.', 'Value card description'),
('about.values.personalized_title', 'about', 'Personalized Experience', 'Experiencia Personalizada', 'Value card title'),
('about.values.personalized_desc', 'about', 'Each appointment is tailored to your individual style, lifestyle, and preferences in an intimate, private setting.', 'Cada cita está adaptada a tu estilo individual, estilo de vida y preferencias en un ambiente íntimo y privado.', 'Value card description'),
('about.values.client_title', 'about', 'Client-Centered Care', 'Cuidado Centrado en el Cliente', 'Value card title'),
('about.values.client_desc', 'about', 'Building lasting relationships through exceptional service, attention to detail, and genuine care for your satisfaction.', 'Construyendo relaciones duraderas a través de un servicio excepcional, atención al detalle y un cuidado genuino por tu satisfacción.', 'Value card description'),

-- About Page - Journey Timeline
('about.journey.2019_title', 'about', 'Discovered My Passion', 'Descubrí mi Pasión', 'Journey milestone title'),
('about.journey.2019_desc', 'about', 'Fell in love with nail artistry during my first professional training course in Nashville.', 'Me enamoré del arte de uñas durante mi primer curso de entrenamiento profesional en Nashville.', 'Journey milestone description'),
('about.journey.2020_title', 'about', 'Advanced Training', 'Entrenamiento Avanzado', 'Journey milestone title'),
('about.journey.2020_desc', 'about', 'Completed specialized certifications in advanced nail systems, art techniques, and salon safety protocols.', 'Completé certificaciones especializadas en sistemas avanzados de uñas, técnicas de arte y protocolos de seguridad de salón.', 'Journey milestone description'),
('about.journey.2021_title', 'about', 'Building Experience', 'Construyendo Experiencia', 'Journey milestone title'),
('about.journey.2021_desc', 'about', 'Honed my skills working with diverse clients, developing my signature style and artistic approach.', 'Perfeccioné mis habilidades trabajando con clientes diversos, desarrollando mi estilo característico y enfoque artístico.', 'Journey milestone description'),
('about.journey.2023_title', 'about', 'Francis Lozano Studio', 'Francis Lozano Studio', 'Journey milestone title'),
('about.journey.2023_desc', 'about', 'Opened my private, appointment-only studio to provide the intimate, luxury experience I envisioned.', 'Abrí mi estudio privado, solo con cita, para proporcionar la experiencia íntima y de lujo que imaginé.', 'Journey milestone description'),

-- About Page - Main Content (default fallback text)
('about.main_content_p1', 'about', 'Welcome to my world of nail artistry! I''m Francis Lozano, the creative force behind Francis Lozano Studio. What started as a fascination with intricate designs has evolved into a passionate career dedicated to transforming nails into personalized works of art.', '¡Bienvenido a mi mundo del arte de uñas! Soy Francis Lozano, la fuerza creativa detrás de Francis Lozano Studio. Lo que comenzó como una fascinación con diseños intrincados ha evolucionado en una carrera apasionada dedicada a transformar uñas en obras de arte personalizadas.', 'About main content paragraph 1'),
('about.main_content_p2', 'about', 'In my private Nashville studio, I''ve created a sanctuary where luxury meets artistry. Every appointment is an intimate collaboration where your vision comes to life through meticulous attention to detail, premium products, and techniques refined through years of dedicated practice.', 'En mi estudio privado de Nashville, he creado un santuario donde el lujo se encuentra con el arte. Cada cita es una colaboración íntima donde tu visión cobra vida a través de una meticulosa atención al detalle, productos premium y técnicas refinadas a través de años de práctica dedicada.', 'About main content paragraph 2'),
('about.main_content_p3', 'about', 'I believe that beautiful nails are more than just an aesthetic choice—they''re a form of self-expression that should make you feel confident and radiant every day. That''s why I take the time to understand not just what you want, but who you are, ensuring every design reflects your unique personality and style.', 'Creo que las uñas hermosas son más que solo una elección estética: son una forma de autoexpresión que debería hacerte sentir segura y radiante cada día. Por eso me tomo el tiempo para entender no solo lo que quieres, sino quién eres, asegurando que cada diseño refleje tu personalidad y estilo únicos.', 'About main content paragraph 3'),
('about.book_with_francis', 'about', 'Book with Francis', 'Reservar con Francis', 'About CTA button'),

-- About Page - Philosophy section default text
('about.philosophy_subtitle', 'about', 'The principles that guide every interaction, every design, and every detail of your experience', 'Los principios que guían cada interacción, cada diseño y cada detalle de tu experiencia', 'Philosophy section subtitle'),

-- About Page - Journey section default text
('about.journey_subtitle', 'about', 'The path that led me to create Francis Lozano Studio and serve Nashville''s most discerning clients', 'El camino que me llevó a crear Francis Lozano Studio y servir a los clientes más exigentes de Nashville', 'Journey section subtitle'),

-- About Page - Studio Experience section default text
('about.experience_p1', 'about', 'Step into my private home studio, where every detail has been carefully curated to provide a luxurious, relaxing experience. From the moment you arrive, you''ll feel the difference that comes with truly personalized service.', 'Entra en mi estudio privado en casa, donde cada detalle ha sido cuidadosamente curado para proporcionar una experiencia lujosa y relajante. Desde el momento en que llegas, sentirás la diferencia que viene con un servicio verdaderamente personalizado.', 'Studio experience paragraph 1'),
('about.experience_p2', 'about', 'Unlike traditional salons, my appointment-only approach means you receive my undivided attention in a peaceful, intimate setting. No crowds, no rushing—just you, me, and the time needed to create something truly beautiful.', 'A diferencia de los salones tradicionales, mi enfoque de solo citas significa que recibes mi atención completa en un ambiente pacífico e íntimo. Sin multitudes, sin prisas, solo tú, yo y el tiempo necesario para crear algo verdaderamente hermoso.', 'Studio experience paragraph 2'),
('about.experience_p3', 'about', 'This is more than a nail appointment; it''s your personal sanctuary for self-care and artistic expression.', 'Esto es más que una cita de uñas; es tu santuario personal para el autocuidado y la expresión artística.', 'Studio experience paragraph 3'),
('about.experience_difference', 'about', 'Experience the Difference', 'Experimenta la Diferencia', 'Studio experience CTA button'),
('about.view_work', 'about', 'View My Work', 'Ver mi Trabajo', 'Studio experience secondary CTA button'),

-- Homepage - Additional hero text variations
('homepage.hero.subtitle_alt', 'homepage', 'francis nails', 'uñas francis', 'Alternative hero text/keywords'),
('homepage.hero.subtitle_alt2', 'homepage', 'nails francis', 'francis uñas', 'Alternative hero text/keywords')

ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();
