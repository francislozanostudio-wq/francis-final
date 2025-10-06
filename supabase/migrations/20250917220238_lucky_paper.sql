/*
# Translation System for Francis Lozano Studio

1. New Tables
   - `translations`
     - `id` (uuid, primary key)
     - `key` (text, unique identifier for translation)
     - `category` (text, grouping translations by page/section)
     - `english_text` (text, original English text)
     - `spanish_text` (text, Spanish translation)
     - `context` (text, additional context for translators)
     - `is_active` (boolean, whether translation is active)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

2. Security
   - Enable RLS on `translations` table
   - Add policy for public read access to active translations
   - Add policy for admin management of translations

3. Initial Data
   - Populate with all existing website text content
   - Organize by categories (navigation, homepage, services, etc.)
*/

CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'general',
  english_text text NOT NULL,
  spanish_text text,
  context text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active translations"
  ON translations
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage translations"
  ON translations
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

CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial translation data for all website content
INSERT INTO translations (key, category, english_text, spanish_text, context) VALUES

-- Navigation
('nav.home', 'navigation', 'Home', 'Inicio', 'Main navigation menu'),
('nav.services', 'navigation', 'Services', 'Servicios', 'Main navigation menu'),
('nav.gallery', 'navigation', 'Gallery', 'Galería', 'Main navigation menu'),
('nav.about', 'navigation', 'About', 'Acerca de', 'Main navigation menu'),
('nav.testimonials', 'navigation', 'Testimonials', 'Testimonios', 'Main navigation menu'),
('nav.contact', 'navigation', 'Contact', 'Contacto', 'Main navigation menu'),
('nav.book_now', 'navigation', 'Book Now', 'Reservar Ahora', 'Main navigation CTA button'),

-- Homepage Hero
('homepage.hero.title', 'homepage', 'Francis Lozano Studio', 'Francis Lozano Studio', 'Main hero title'),
('homepage.hero.subtitle', 'homepage', 'Exquisite nail artistry by appointment in Nashville. Where craftsmanship meets elegance in an intimate studio setting.', 'Arte exquisito de uñas con cita previa en Nashville. Donde la artesanía se encuentra con la elegancia en un ambiente íntimo de estudio.', 'Hero section subtitle'),

-- Homepage About Section
('homepage.about.title', 'homepage', 'Artistry Redefined', 'Arte Redefinido', 'About section title'),
('homepage.about.subtitle', 'homepage', 'At Francis Lozano Studio, every appointment is a personalized experience. We specialize in creating bespoke nail designs that elevate your natural beauty through precision, artistry, and the finest materials.', 'En Francis Lozano Studio, cada cita es una experiencia personalizada. Nos especializamos en crear diseños de uñas únicos que realzan tu belleza natural a través de la precisión, el arte y los mejores materiales.', 'About section description'),

-- Homepage Services
('homepage.services.title', 'homepage', 'Our Services', 'Nuestros Servicios', 'Services section title'),
('homepage.services.subtitle', 'homepage', 'Discover our curated selection of premium nail services', 'Descubre nuestra selección curada de servicios premium para uñas', 'Services section subtitle'),
('homepage.services.luxury_manicures', 'homepage', 'Luxury Manicures', 'Manicuras de Lujo', 'Service type'),
('homepage.services.luxury_manicures_desc', 'homepage', 'Premium manicure services with meticulous attention to detail and lasting results.', 'Servicios de manicura premium con atención meticulosa al detalle y resultados duraderos.', 'Service description'),
('homepage.services.custom_nail_art', 'homepage', 'Custom Nail Art', 'Arte de Uñas Personalizado', 'Service type'),
('homepage.services.custom_nail_art_desc', 'homepage', 'Bespoke nail designs crafted to reflect your unique style and personality.', 'Diseños de uñas únicos creados para reflejar tu estilo y personalidad únicos.', 'Service description'),
('homepage.services.premium_extensions', 'homepage', 'Premium Extensions', 'Extensiones Premium', 'Service type'),
('homepage.services.premium_extensions_desc', 'homepage', 'Professional gel, acrylic, and dip powder systems for enduring beauty.', 'Sistemas profesionales de gel, acrílico y polvo de inmersión para una belleza duradera.', 'Service description'),

-- Homepage Portfolio
('homepage.portfolio.title', 'homepage', 'Portfolio', 'Portafolio', 'Portfolio section title'),
('homepage.portfolio.subtitle', 'homepage', 'A showcase of our finest nail artistry creations', 'Una muestra de nuestras mejores creaciones de arte de uñas', 'Portfolio section subtitle'),
('homepage.portfolio.view_full_gallery', 'homepage', 'View Full Gallery', 'Ver Galería Completa', 'Portfolio CTA button'),

-- Homepage CTA
('homepage.cta.title', 'homepage', 'Ready to Transform Your Nails?', '¿Lista para Transformar tus Uñas?', 'Final CTA section title'),
('homepage.cta.subtitle', 'homepage', 'Don''t wait—my calendar fills up quickly! Book your appointment today and experience the difference of truly personalized nail artistry.', 'No esperes: ¡mi calendario se llena rápidamente! Reserva tu cita hoy y experimenta la diferencia del arte de uñas verdaderamente personalizado.', 'Final CTA description'),
('homepage.cta.book_now', 'homepage', 'Book Now', 'Reservar Ahora', 'CTA button text'),
('homepage.cta.view_services', 'homepage', 'View Services', 'Ver Servicios', 'Secondary CTA button'),

-- Services Page
('services.title', 'services', 'Services & Pricing', 'Servicios y Precios', 'Services page main title'),
('services.subtitle', 'services', 'Discover our comprehensive menu of luxury nail services, each crafted to deliver exceptional quality and artistry. All services include consultation and aftercare guidance.', 'Descubre nuestro menú completo de servicios de lujo para uñas, cada uno diseñado para ofrecer calidad excepcional y arte. Todos los servicios incluyen consulta y orientación de cuidado posterior.', 'Services page subtitle'),
('services.booking_policies', 'services', 'Booking Policies', 'Políticas de Reserva', 'Booking policies section title'),
('services.ready_to_book', 'services', 'Ready to Book Your Appointment?', '¿Lista para Reservar tu Cita?', 'Services page CTA title'),

-- Gallery Page
('gallery.title', 'gallery', 'Design Gallery', 'Galería de Diseños', 'Gallery page title'),
('gallery.subtitle', 'gallery', 'Explore our portfolio of stunning nail artistry. Each design is a unique masterpiece crafted with precision, creativity, and passion. Find inspiration for your next appointment.', 'Explora nuestro portafolio de arte de uñas impresionante. Cada diseño es una obra maestra única creada con precisión, creatividad y pasión. Encuentra inspiración para tu próxima cita.', 'Gallery page subtitle'),
('gallery.filter_by_style', 'gallery', 'Filter by Style', 'Filtrar por Estilo', 'Filter section title'),
('gallery.all_designs', 'gallery', 'All Designs', 'Todos los Diseños', 'Filter option'),
('gallery.featured', 'gallery', 'Featured', 'Destacados', 'Filter option'),

-- About Page
('about.title', 'about', 'Meet Francis', 'Conoce a Francis', 'About page main title'),
('about.subtitle', 'about', 'The artist behind the artistry. Discover the passion, training, and philosophy that drives every beautiful creation at Francis Lozano Studio.', 'El artista detrás del arte. Descubre la pasión, entrenamiento y filosofía que impulsa cada hermosa creación en Francis Lozano Studio.', 'About page subtitle'),
('about.hello_francis', 'about', 'Hello, I''m Francis', 'Hola, soy Francis', 'About section greeting'),
('about.philosophy', 'about', 'My Philosophy', 'Mi Filosofía', 'Philosophy section title'),
('about.journey', 'about', 'My Journey', 'Mi Trayectoria', 'Journey section title'),
('about.studio_experience', 'about', 'The Studio Experience', 'La Experiencia del Estudio', 'Studio experience section title'),

-- Contact Page
('contact.title', 'contact', 'Get in Touch', 'Ponte en Contacto', 'Contact page title'),
('contact.subtitle', 'contact', 'Have questions about services, want to discuss a custom design, or ready to book? I''d love to hear from you and help bring your nail vision to life.', '¿Tienes preguntas sobre servicios, quieres discutir un diseño personalizado, o estás lista para reservar? Me encantaría escucharte y ayudar a hacer realidad tu visión de uñas.', 'Contact page subtitle'),
('contact.how_to_reach', 'contact', 'How to Reach Me', 'Cómo Contactarme', 'Contact methods section title'),
('contact.send_message', 'contact', 'Send a Message', 'Enviar un Mensaje', 'Contact form section title'),

-- Booking Page
('booking.title', 'booking', 'Book Your Appointment', 'Reserva tu Cita', 'Booking page title'),
('booking.subtitle', 'booking', 'Ready to experience luxury nail artistry? Schedule your private appointment and let''s create something beautiful together in my Nashville studio.', '¿Lista para experimentar el arte de lujo de uñas? Programa tu cita privada y creemos algo hermoso juntos en mi estudio de Nashville.', 'Booking page subtitle'),
('booking.how_booking_works', 'booking', 'How Booking Works', 'Cómo Funciona la Reserva', 'Booking process section title'),
('booking.select_service', 'booking', 'Select Your Service', 'Selecciona tu Servicio', 'Booking step 1'),
('booking.pick_time', 'booking', 'Pick Your Time', 'Elige tu Hora', 'Booking step 2'),
('booking.secure_deposit', 'booking', 'Secure with Deposit', 'Asegurar con Depósito', 'Booking step 3'),
('booking.confirmation', 'booking', 'Confirmation & Prep', 'Confirmación y Preparación', 'Booking step 4'),

-- Testimonials Page
('testimonials.title', 'testimonials', 'Client Testimonials', 'Testimonios de Clientes', 'Testimonials page title'),
('testimonials.subtitle', 'testimonials', 'Don''t just take our word for it. Read what our valued clients have to say about their transformative experiences at Francis Lozano Studio.', 'No solo tomes nuestra palabra. Lee lo que nuestros valiosos clientes tienen que decir sobre sus experiencias transformadoras en Francis Lozano Studio.', 'Testimonials page subtitle'),

-- Common UI Elements
('common.loading', 'common', 'Loading...', 'Cargando...', 'Loading state text'),
('common.save', 'common', 'Save', 'Guardar', 'Save button'),
('common.cancel', 'common', 'Cancel', 'Cancelar', 'Cancel button'),
('common.edit', 'common', 'Edit', 'Editar', 'Edit button'),
('common.delete', 'common', 'Delete', 'Eliminar', 'Delete button'),
('common.add', 'common', 'Add', 'Agregar', 'Add button'),
('common.search', 'common', 'Search', 'Buscar', 'Search placeholder'),
('common.filter', 'common', 'Filter', 'Filtrar', 'Filter label'),
('common.view_all', 'common', 'View All', 'Ver Todo', 'View all link'),
('common.read_more', 'common', 'Read More', 'Leer Más', 'Read more link'),
('common.learn_more', 'common', 'Learn More', 'Aprender Más', 'Learn more button'),

-- Form Labels
('form.first_name', 'forms', 'First Name', 'Nombre', 'Form field label'),
('form.last_name', 'forms', 'Last Name', 'Apellido', 'Form field label'),
('form.email', 'forms', 'Email Address', 'Dirección de Correo', 'Form field label'),
('form.phone', 'forms', 'Phone Number', 'Número de Teléfono', 'Form field label'),
('form.message', 'forms', 'Message', 'Mensaje', 'Form field label'),
('form.subject', 'forms', 'Subject', 'Asunto', 'Form field label'),
('form.send_message', 'forms', 'Send Message', 'Enviar Mensaje', 'Form submit button'),

-- Error Messages
('error.required_field', 'errors', 'This field is required', 'Este campo es obligatorio', 'Required field validation'),
('error.invalid_email', 'errors', 'Please enter a valid email address', 'Por favor ingresa una dirección de correo válida', 'Email validation'),
('error.invalid_phone', 'errors', 'Please enter a valid phone number', 'Por favor ingresa un número de teléfono válido', 'Phone validation'),

-- Success Messages
('success.message_sent', 'success', 'Message sent successfully!', '¡Mensaje enviado exitosamente!', 'Contact form success'),
('success.booking_confirmed', 'success', 'Booking confirmed!', '¡Reserva confirmada!', 'Booking success'),

-- Admin Navigation
('admin.dashboard', 'admin', 'Dashboard', 'Panel de Control', 'Admin navigation'),
('admin.bookings', 'admin', 'Bookings', 'Reservas', 'Admin navigation'),
('admin.gallery', 'admin', 'Gallery', 'Galería', 'Admin navigation'),
('admin.messages', 'admin', 'Messages', 'Mensajes', 'Admin navigation'),
('admin.services', 'admin', 'Services', 'Servicios', 'Admin navigation'),
('admin.translations', 'admin', 'Translations', 'Traducciones', 'Admin navigation'),

-- Language Names
('language.english', 'languages', 'English', 'Inglés', 'Language name'),
('language.spanish', 'languages', 'Spanish', 'Español', 'Language name');