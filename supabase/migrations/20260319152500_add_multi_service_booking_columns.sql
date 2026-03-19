/*
  # Add multi-service booking support

  1. Updates to bookings table
    - Add `selected_services` (jsonb) to store selected services array
    - Add `services_total` (numeric) to store sum of selected services prices
    - Add `service_duration_total` (integer) to store total service duration

  2. Backfill existing rows
    - Convert legacy single-service rows into `selected_services`
    - Initialize `services_total` and `service_duration_total`
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS selected_services jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS services_total numeric DEFAULT 0 CHECK (services_total >= 0),
  ADD COLUMN IF NOT EXISTS service_duration_total integer DEFAULT 0 CHECK (service_duration_total >= 0);

UPDATE bookings
SET
  selected_services = CASE
    WHEN selected_services IS NULL OR jsonb_typeof(selected_services) <> 'array' OR jsonb_array_length(selected_services) = 0 THEN
      jsonb_build_array(
        jsonb_build_object(
          'name', service_name,
          'price', service_price
        )
      )
    ELSE selected_services
  END,
  services_total = CASE
    WHEN services_total IS NULL OR services_total = 0 THEN service_price
    ELSE services_total
  END,
  service_duration_total = COALESCE(service_duration_total, 0)
WHERE
  selected_services IS NULL
  OR jsonb_typeof(selected_services) <> 'array'
  OR jsonb_array_length(selected_services) = 0
  OR services_total IS NULL
  OR services_total = 0
  OR service_duration_total IS NULL;
