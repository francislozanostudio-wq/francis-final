/*
  # Add booking policies and service page custom text to studio settings

  1. Changes
    - Add booking_policies_text (jsonb) field to studio_settings
    - Add service_page_custom_text (text) field to studio_settings
    - Add default values for these fields

  2. Notes
    - booking_policies_text will store structured policy data
    - service_page_custom_text will store the custom message about pricing
*/

-- Add new columns to studio_settings
ALTER TABLE studio_settings
ADD COLUMN IF NOT EXISTS booking_policies_text jsonb DEFAULT '{
  "deposit_payment": {
    "title": "Deposits & Payment",
    "items": [
      "A $30 deposit is required to secure your appointment.",
      "Cash and Zelle payments are accepted.",
      "Tips are appreciated but not required."
    ]
  },
  "cancellation": {
    "title": "Cancellation Policy",
    "items": [
      "48-hour notice required for cancellations",
      "Same-day cancellations forfeit deposit",
      "Late arrivals may result in shortened service"
    ]
  },
  "guarantee": {
    "title": "Service Guarantee",
    "items": [
      "✅ 1-week guarantee on all services."
    ]
  },
  "health_safety": {
    "title": "Health & Safety",
    "items": [
      "Please reschedule if feeling unwell",
      "All tools are sanitized and sterilized",
      "Allergic reactions: please inform before service"
    ]
  }
}'::jsonb;

ALTER TABLE studio_settings
ADD COLUMN IF NOT EXISTS service_page_custom_text text DEFAULT 'Final pricing for nail art is determined based on complexity and design detail. Book your consultation to discuss your vision and receive an accurate quote.';

-- Update existing records with default values
UPDATE studio_settings
SET 
  booking_policies_text = '{
    "deposit_payment": {
      "title": "Deposits & Payment",
      "items": [
        "A $30 deposit is required to secure your appointment.",
        "Cash and Zelle payments are accepted.",
        "Tips are appreciated but not required."
      ]
    },
    "cancellation": {
      "title": "Cancellation Policy",
      "items": [
        "48-hour notice required for cancellations",
        "Same-day cancellations forfeit deposit",
        "Late arrivals may result in shortened service"
      ]
    },
    "guarantee": {
      "title": "Service Guarantee",
      "items": [
        "✅ 1-week guarantee on all services."
      ]
    },
    "health_safety": {
      "title": "Health & Safety",
      "items": [
        "Please reschedule if feeling unwell",
        "All tools are sanitized and sterilized",
        "Allergic reactions: please inform before service"
      ]
    }
  }'::jsonb,
  service_page_custom_text = 'Final pricing for nail art is determined based on complexity and design detail. Book your consultation to discuss your vision and receive an accurate quote.'
WHERE booking_policies_text IS NULL OR service_page_custom_text IS NULL;
