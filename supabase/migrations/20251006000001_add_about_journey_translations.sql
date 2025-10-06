-- Add About Page - My Journey Section Translations
-- Created: 2025-10-06

-- Journey Section Label
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.label',
  'about',
  'My Path',
  'Mi Camino',
  'Section label badge for My Journey section',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Journey Section Title
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey',
  'about',
  'My Professional Journey in the World of Manicures',
  'Mi Trayectoria Profesional en el Mundo de las Manicuras',
  'Journey section main title',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Journey Section Subtitle
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey_subtitle',
  'about',
  'From early passion to international training — the path that shapes my work today.',
  'Desde mi pasión temprana hasta la formación internacional — el camino que moldea mi trabajo hoy.',
  'Journey section subtitle description',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Milestone 1: Early Years
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.early_year',
  'about',
  'Early',
  'Temprano',
  'Timeline badge for early years',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.early_title',
  'about',
  'A Passion Begins',
  'Nace una Pasión',
  'Early years milestone title',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.early_desc',
  'about',
  'My passion for nail care and beauty began at a young age, inspiring me to pursue it professionally.',
  'Mi pasión por el cuidado de uñas y la belleza comenzó a temprana edad, motivándome años después a dedicarme profesionalmente a ello.',
  'Early years milestone description',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Milestone 2: 2019 Venezuela Training
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.2019_title_new',
  'about',
  'Formal Training — Venezuela',
  'Formación Formal — Venezuela',
  '2019 Venezuela training milestone title',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.2019_desc_new',
  'about',
  'I began my formal training in Venezuela with the renowned brand JH Nails, widely recognized internationally. This marked the start of my technical and artistic development in professional manicures.',
  'En el año 2019, inicié mi formación formal en Venezuela con la reconocida marca JH Nails, ampliamente reconocida a nivel internacional. Esta etapa marcó el inicio de mi desarrollo técnico y artístico dentro del mundo de las manicuras profesionales.',
  '2019 Venezuela training milestone description',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Milestone 3: 2020-2021 Chile Refinement
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.2020_2021_year',
  'about',
  '2020–2021',
  '2020–2021',
  'Timeline badge for Chile years',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.2020_2021_title',
  'about',
  'Technique Refinement — Chile',
  'Perfeccionamiento de Técnicas — Chile',
  'Chile years milestone title',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.2020_2021_desc',
  'about',
  'During my time in Chile, especially throughout the pandemic, I strengthened my knowledge and perfected my techniques—deepening my understanding of service quality and client care.',
  'Posteriormente, durante mi estadía en Chile, continué fortaleciendo mis conocimientos y perfeccionando mis técnicas, especialmente durante el período de pandemia. Esta experiencia me permitió adquirir una comprensión más integral sobre la calidad del servicio y la atención al cliente.',
  'Chile years milestone description',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Milestone 4: Current - Barby Nails Academy
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.now_year',
  'about',
  'Now',
  'Ahora',
  'Timeline badge for current period',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.now_title',
  'about',
  'International Master Path — Barby Nails Academy',
  'Camino a Maestra Internacional — Barby Nails Academy',
  'Current training milestone title',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.now_desc',
  'about',
  'I am currently pursuing the International Master Instructor Online Program with Barby Nails Academy, an internationally recognized institution, to elevate my professional level and prepare to train future nail technicians.',
  'Actualmente, me encuentro cursando el Programa Internacional de Maestría de Instructores en Línea con la prestigiosa Barby Nails Academy, institución reconocida a nivel internacional. Este programa me permite elevar mi nivel profesional y prepararme para trabajar como Maestra Internacional, capaz de formar y guiar a nuevas generaciones de técnicos de uñas.',
  'Current training milestone description',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Milestone 5: Always - Excellence Commitment
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.always_year',
  'about',
  'Always',
  'Siempre',
  'Timeline badge for ongoing commitment',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.always_title',
  'about',
  'Commitment to Excellence',
  'Compromiso con la Excelencia',
  'Excellence commitment milestone title',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.always_desc',
  'about',
  'Each stage of my journey reflects commitment, discipline, and a constant pursuit of excellence in every work I do.',
  'Cada etapa de mi trayectoria refleja compromiso, disciplina y una búsqueda constante de la excelencia en cada trabajo que realizo.',
  'Excellence commitment milestone description',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Journey Tags
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.tag.passion',
  'about',
  'Passion',
  'Pasión',
  'Journey tag',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.tag.artistry',
  'about',
  'Artistry',
  'Arte',
  'Journey tag',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.tag.client_care',
  'about',
  'Client Care',
  'Cuidado del Cliente',
  'Journey tag',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.tag.master_instructor',
  'about',
  'Master Instructor',
  'Maestra Instructora',
  'Journey tag',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.tag.excellence',
  'about',
  'Excellence',
  'Excelencia',
  'Journey tag',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.tag.discipline',
  'about',
  'Discipline',
  'Disciplina',
  'Journey tag',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();

-- Journey Bottom Motto
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES (
  'about.journey.motto',
  'about',
  'Every stage reflects commitment, discipline, and excellence',
  'Cada etapa refleja compromiso, disciplina y excelencia',
  'Journey section bottom motto',
  true
) ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  updated_at = now();
