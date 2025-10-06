/*
  # Add translations for service page booking policies and custom text

  1. New Translations
    - Add translations for booking policy section titles
    - Add translations for booking policy items
    - Add translation for service page custom text
*/

-- Insert translations for booking policy section titles
INSERT INTO translations (key, category, english_text, spanish_text, context, is_active)
VALUES
-- Deposits & Payment Section
('services.policies.deposit_payment.title', 'services', 'Deposits & Payment', 'Depósitos y Pagos', 'Booking policies section title', true),
('services.policies.deposit_payment.item1', 'services', 'A $30 deposit is required to secure your appointment.', 'Se requiere un depósito de $30 para asegurar su cita.', 'Booking policy item', true),
('services.policies.deposit_payment.item2', 'services', 'Cash and Zelle payments are accepted.', 'Se aceptan pagos en efectivo y Zelle.', 'Booking policy item', true),
('services.policies.deposit_payment.item3', 'services', 'Tips are appreciated but not required.', 'Las propinas son apreciadas pero no requeridas.', 'Booking policy item', true),

-- Cancellation Policy Section
('services.policies.cancellation.title', 'services', 'Cancellation Policy', 'Política de Cancelación', 'Booking policies section title', true),
('services.policies.cancellation.item1', 'services', '48-hour notice required for cancellations', 'Se requiere aviso de 48 horas para cancelaciones', 'Booking policy item', true),
('services.policies.cancellation.item2', 'services', 'Same-day cancellations forfeit deposit', 'Las cancelaciones del mismo día pierden el depósito', 'Booking policy item', true),
('services.policies.cancellation.item3', 'services', 'Late arrivals may result in shortened service', 'Las llegadas tardías pueden resultar en servicio acortado', 'Booking policy item', true),

-- Service Guarantee Section
('services.policies.guarantee.title', 'services', 'Service Guarantee', 'Garantía de Servicio', 'Booking policies section title', true),
('services.policies.guarantee.item1', 'services', '✅ 1-week guarantee on all services.', '✅ Garantía de 1 semana en todos los servicios.', 'Booking policy item', true),

-- Health & Safety Section
('services.policies.health_safety.title', 'services', 'Health & Safety', 'Salud y Seguridad', 'Booking policies section title', true),
('services.policies.health_safety.item1', 'services', 'Please reschedule if feeling unwell', 'Por favor reprograme si se siente mal', 'Booking policy item', true),
('services.policies.health_safety.item2', 'services', 'All tools are sanitized and sterilized', 'Todas las herramientas están desinfectadas y esterilizadas', 'Booking policy item', true),
('services.policies.health_safety.item3', 'services', 'Allergic reactions: please inform before service', 'Reacciones alérgicas: por favor informe antes del servicio', 'Booking policy item', true),

-- Custom service page text
('services.custom_pricing_text', 'services', 'Final pricing for nail art is determined based on complexity and design detail. Book your consultation to discuss your vision and receive an accurate quote.', 'El precio final del arte de uñas se determina según la complejidad y el detalle del diseño. Reserve su consulta para discutir su visión y recibir un presupuesto preciso.', 'Custom text on services page', true)

ON CONFLICT (key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  spanish_text = EXCLUDED.spanish_text,
  context = EXCLUDED.context,
  is_active = EXCLUDED.is_active,
  updated_at = now();
