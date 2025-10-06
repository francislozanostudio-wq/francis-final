-- Add Contact Page Translations
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active) VALUES
-- Contact Page Hero Section
('contact.title', 'contact', 'Get in Touch', 'Contacta Conmigo', 'Contact page main title', true),
('contact.subtitle', 'contact', 'Have questions about services, want to discuss a custom design, or ready to book? I''d love to hear from you and help bring your nail vision to life.', '¿Tienes preguntas sobre los servicios, quieres discutir un diseño personalizado o estás lista para reservar? Me encantaría saber de ti y ayudarte a hacer realidad tu visión de uñas.', 'Contact page hero subtitle', true),

-- Contact Methods Section
('contact.how_to_reach', 'contact', 'How to Reach Me', 'Cómo Contactarme', 'Contact methods section title', true),
('contact.reach_description', 'contact', 'Choose the method that works best for you. I typically respond within 24 hours.', 'Elige el método que mejor te funcione. Normalmente respondo dentro de 24 horas.', 'Contact methods description', true),

-- Contact Method Cards
('contact.method.call_text', 'contact', 'Call or Text', 'Llamar o Enviar Mensaje', 'Call/Text contact method title', true),
('contact.method.call_description', 'contact', 'Quickest way to reach me for urgent questions or booking', 'La forma más rápida de contactarme para preguntas urgentes o reservas', 'Call/Text method description', true),

('contact.method.email', 'contact', 'Email', 'Correo Electrónico', 'Email contact method title', true),
('contact.method.email_description', 'contact', 'Best for detailed inquiries, custom design consultations', 'Mejor para consultas detalladas y diseños personalizados', 'Email method description', true),

('contact.method.instagram', 'contact', 'Instagram DM', 'Mensaje de Instagram', 'Instagram contact method title', true),
('contact.method.instagram_description', 'contact', 'Follow for daily inspiration and behind-the-scenes content', 'Sígueme para inspiración diaria y contenido detrás de escena', 'Instagram method description', true),

('contact.method.whatsapp', 'contact', 'WhatsApp', 'WhatsApp', 'WhatsApp contact method title', true),
('contact.method.whatsapp_description', 'contact', 'Quick questions, appointment confirmations, or last-minute changes', 'Preguntas rápidas, confirmaciones de citas o cambios de último momento', 'WhatsApp method description', true),

('contact.contact_now', 'contact', 'Contact Now', 'Contactar Ahora', 'Contact button text', true),

-- Contact Form Section
('contact.send_message', 'contact', 'Send a Message', 'Enviar un Mensaje', 'Contact form section title', true),
('contact.form_description', 'contact', 'Prefer to write? Use the form below for detailed inquiries or custom project discussions.', '¿Prefieres escribir? Usa el formulario a continuación para consultas detalladas o discusiones de proyectos personalizados.', 'Contact form description', true),
('contact.form_title', 'contact', 'Contact Form', 'Formulario de Contacto', 'Contact form card title', true),

-- Form Fields
('contact.form.first_name', 'contact', 'First Name', 'Nombre', 'First name field label', true),
('contact.form.first_name_placeholder', 'contact', 'Your first name', 'Tu nombre', 'First name placeholder', true),
('contact.form.last_name', 'contact', 'Last Name', 'Apellido', 'Last name field label', true),
('contact.form.last_name_placeholder', 'contact', 'Your last name', 'Tu apellido', 'Last name placeholder', true),
('contact.form.email', 'contact', 'Email Address', 'Correo Electrónico', 'Email field label', true),
('contact.form.email_placeholder', 'contact', 'your@email.com', 'tucorreo@email.com', 'Email placeholder', true),
('contact.form.phone', 'contact', 'Phone Number', 'Número de Teléfono', 'Phone field label', true),
('contact.form.phone_placeholder', 'contact', '+1 737-378-5755', '+1 737-378-5755', 'Phone placeholder', true),
('contact.form.inquiry_type', 'contact', 'Inquiry Type', 'Tipo de Consulta', 'Inquiry type field label', true),
('contact.form.inquiry_type_placeholder', 'contact', 'Select inquiry type', 'Selecciona el tipo de consulta', 'Inquiry type placeholder', true),
('contact.form.subject', 'contact', 'Subject', 'Asunto', 'Subject field label', true),
('contact.form.subject_placeholder', 'contact', 'Brief description of your inquiry', 'Breve descripción de tu consulta', 'Subject placeholder', true),
('contact.form.message', 'contact', 'Message', 'Mensaje', 'Message field label', true),
('contact.form.message_placeholder', 'contact', 'Tell me about your vision, questions, or how I can help you...', 'Cuéntame sobre tu visión, preguntas o cómo puedo ayudarte...', 'Message placeholder', true),

-- Inquiry Types
('contact.inquiry.new_client', 'contact', 'New Client Consultation', 'Consulta de Nuevo Cliente', 'Inquiry type option', true),
('contact.inquiry.custom_design', 'contact', 'Custom Design Project', 'Proyecto de Diseño Personalizado', 'Inquiry type option', true),
('contact.inquiry.wedding_event', 'contact', 'Wedding/Event Services', 'Servicios para Bodas/Eventos', 'Inquiry type option', true),
('contact.inquiry.collaboration', 'contact', 'Collaboration Inquiry', 'Consulta de Colaboración', 'Inquiry type option', true),
('contact.inquiry.media_press', 'contact', 'Media/Press Request', 'Solicitud de Medios/Prensa', 'Inquiry type option', true),
('contact.inquiry.general', 'contact', 'General Question', 'Pregunta General', 'Inquiry type option', true),
('contact.inquiry.other', 'contact', 'Other', 'Otro', 'Inquiry type option', true),

-- Form Buttons
('contact.form.sending', 'contact', 'Sending...', 'Enviando...', 'Form sending state', true),
('contact.form.send_message', 'contact', 'Send Message', 'Enviar Mensaje', 'Send message button', true),

-- Business Hours Section
('contact.studio_hours', 'contact', 'Studio Hours', 'Horario del Estudio', 'Studio hours section title', true),
('contact.days.monday', 'contact', 'Monday', 'Lunes', 'Day of week', true),
('contact.days.tuesday', 'contact', 'Tuesday', 'Martes', 'Day of week', true),
('contact.days.wednesday', 'contact', 'Wednesday', 'Miércoles', 'Day of week', true),
('contact.days.thursday', 'contact', 'Thursday', 'Jueves', 'Day of week', true),
('contact.days.friday', 'contact', 'Friday', 'Viernes', 'Day of week', true),
('contact.days.saturday', 'contact', 'Saturday', 'Sábado', 'Day of week', true),
('contact.days.sunday', 'contact', 'Sunday', 'Domingo', 'Day of week', true),
('contact.closed', 'contact', 'Closed', 'Cerrado', 'Closed status', true),
('contact.hours_note', 'contact', 'Note:', 'Nota:', 'Hours note label', true),
('contact.hours_note_text', 'contact', 'Lunch break from 1:00 PM - 2:00 PM daily. All appointments are by reservation only to ensure each client receives dedicated attention.', 'Hora de almuerzo de 1:00 PM - 2:00 PM diariamente. Todas las citas son solo con reserva para asegurar que cada cliente reciba atención dedicada.', 'Business hours note', true),

-- Location Section
('contact.studio_location', 'contact', 'Studio Location', 'Ubicación del Estudio', 'Location section title', true),
('contact.location.city', 'contact', 'Nashville, Tennessee', 'Nashville, Tennessee', 'City location', true),
('contact.location.description', 'contact', 'Private home studio in a convenient Nashville location. Full address provided upon booking confirmation for privacy and security.', 'Estudio privado en casa en una ubicación conveniente de Nashville. La dirección completa se proporciona al confirmar la reserva por privacidad y seguridad.', 'Location description', true),
('contact.location.getting_here', 'contact', 'Getting Here', 'Cómo Llegar', 'Getting here section title', true),
('contact.location.accessible', 'contact', 'Easily accessible from downtown Nashville', 'Fácilmente accesible desde el centro de Nashville', 'Location bullet point', true),
('contact.location.parking', 'contact', 'Free parking available on-site', 'Estacionamiento gratuito disponible en el lugar', 'Location bullet point', true),
('contact.location.directions', 'contact', 'Detailed directions sent with confirmation', 'Direcciones detalladas enviadas con la confirmación', 'Location bullet point', true),
('contact.location.arrive_early', 'contact', 'Please arrive 5 minutes early for check-in', 'Por favor llega 5 minutos antes para el registro', 'Location bullet point', true),
('contact.location.book_address', 'contact', 'Book to Get Address', 'Reserva para Obtener la Dirección', 'Book button text', true),

-- FAQ Section
('contact.faq.title', 'contact', 'Looking for Something Specific?', '¿Buscas Algo Específico?', 'FAQ section title', true),
('contact.faq.description', 'contact', 'Need quick answers? Check out these helpful resources or reach out directly.', '¿Necesitas respuestas rápidas? Consulta estos recursos útiles o contáctame directamente.', 'FAQ section description', true),
('contact.faq.services_pricing', 'contact', 'Services & Pricing', 'Servicios y Precios', 'FAQ link text', true),
('contact.faq.booking_policies', 'contact', 'Booking Policies', 'Políticas de Reserva', 'FAQ link text', true),
('contact.faq.view_portfolio', 'contact', 'View Portfolio', 'Ver Portafolio', 'FAQ link text', true),

-- Toast Messages
('contact.toast.error', 'contact', 'Error', 'Error', 'Toast error title', true),
('contact.toast.failed_send', 'contact', 'Failed to send your message. Please try again or contact us directly.', 'No se pudo enviar tu mensaje. Por favor intenta de nuevo o contáctanos directamente.', 'Toast error message', true),
('contact.toast.success', 'contact', 'Message Sent!', '¡Mensaje Enviado!', 'Toast success title', true),
('contact.toast.success_description', 'contact', 'Thank you for your message. We''ll get back to you within 24 hours.', 'Gracias por tu mensaje. Te responderemos dentro de 24 horas.', 'Toast success description', true),
('contact.toast.unexpected_error', 'contact', 'An unexpected error occurred. Please try again.', 'Ocurrió un error inesperado. Por favor intenta de nuevo.', 'Toast unexpected error', true),

-- Form Validation Messages
('contact.validation.first_name_min', 'contact', 'First name must be at least 2 characters.', 'El nombre debe tener al menos 2 caracteres.', 'Validation message', true),
('contact.validation.last_name_min', 'contact', 'Last name must be at least 2 characters.', 'El apellido debe tener al menos 2 caracteres.', 'Validation message', true),
('contact.validation.email_valid', 'contact', 'Please enter a valid email address.', 'Por favor ingresa una dirección de correo electrónico válida.', 'Validation message', true),
('contact.validation.inquiry_type_required', 'contact', 'Please select an inquiry type.', 'Por favor selecciona un tipo de consulta.', 'Validation message', true),
('contact.validation.subject_min', 'contact', 'Subject must be at least 5 characters.', 'El asunto debe tener al menos 5 caracteres.', 'Validation message', true),
('contact.validation.message_min', 'contact', 'Message must be at least 10 characters.', 'El mensaje debe tener al menos 10 caracteres.', 'Validation message', true)

ON CONFLICT (key) DO UPDATE SET
  spanish_text = EXCLUDED.spanish_text,
  english_text = EXCLUDED.english_text,
  context = EXCLUDED.context,
  updated_at = NOW();
