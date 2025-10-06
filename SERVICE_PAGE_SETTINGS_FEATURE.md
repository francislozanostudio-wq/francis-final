# Service Page Settings Feature

## Overview
This feature allows administrators to dynamically edit the booking policies and custom text displayed on the Services page through the admin panel. All content is translatable and updates in real-time.

## What Was Implemented

### 1. Database Changes
- **Migration**: `20251006120000_add_booking_policies_settings.sql`
  - Added `booking_policies_text` (jsonb) field to `studio_settings` table
  - Added `service_page_custom_text` (text) field to `studio_settings` table
  - Set default values matching the new requirements

### 2. Backend Updates
- **File**: `src/lib/studioService.ts`
  - Added `BookingPolicySection` interface
  - Added `BookingPoliciesText` interface  
  - Updated `StudioSettings` to include new fields
  - Added default values for booking policies and custom text
  - Updated all CRUD operations to handle new fields

### 3. Frontend - Admin Panel
- **New Page**: `src/pages/admin/AdminServicePageSettings.tsx`
  - Full CRUD interface for managing booking policies
  - Editable sections: Deposits & Payment, Cancellation Policy, Service Guarantee, Health & Safety
  - Each section has editable title and list items
  - Add/remove policy items dynamically
  - Edit custom text that appears at the bottom of Services page
  - Real-time updates via Supabase subscriptions
  - Auto-save functionality

- **Navigation**: Added to `AdminSidebar.tsx`
  - New menu item "Service Page" under Services section
  - Route: `/admin/service-page-settings`

- **Routing**: Updated `App.tsx`
  - Added protected route for the new admin page

### 4. Frontend - Public Services Page
- **File**: `src/pages/Services.tsx`
  - Updated Booking Policies section to display dynamic content from database
  - Updated custom text to pull from database settings
  - All content connected to translation system via `translateByText()`
  - Fallback to default values if settings not available
  - Real-time updates when admin makes changes

### 5. Translation System
- **Migration**: `20251006120001_add_service_page_translations.sql`
  - Added translations for all default policy items
  - Added translation for custom pricing text
  - English and Spanish translations provided
  - All text is translatable through the existing translation system

## New Booking Policies Content

### Deposits & Payment
- A $30 deposit is required to secure your appointment.
- Cash and Zelle payments are accepted.
- Tips are appreciated but not required.

### Cancellation Policy
- 48-hour notice required for cancellations
- Same-day cancellations forfeit deposit
- Late arrivals may result in shortened service

### Service Guarantee
- ✅ 1-week guarantee on all services.

### Health & Safety
- Please reschedule if feeling unwell
- All tools are sanitized and sterilized
- Allergic reactions: please inform before service

### Removed Sections
- ❌ Fills & Touch-Ups section (as requested)

## Custom Text
The following text now appears at the bottom of the Services page and is editable:
> "Final pricing for nail art is determined based on complexity and design detail. Book your consultation to discuss your vision and receive an accurate quote."

## How to Use

### For Administrators:
1. Log in to admin panel
2. Navigate to "Service Page" in the sidebar
3. Edit section titles, policy items, or custom text
4. Click "Add Item" to add new policy items
5. Click trash icon to remove items
6. Click "Save Changes" to update
7. Changes appear immediately on the public Services page

### Features:
- ✅ Real-time updates
- ✅ Full translation support (English/Spanish)
- ✅ Dynamic content management
- ✅ Fallback to defaults if settings not configured
- ✅ Validation and error handling
- ✅ Responsive design
- ✅ Auto-save on updates

## Technical Details

### Data Structure (studio_settings.booking_policies_text)
```json
{
  "deposit_payment": {
    "title": "Deposits & Payment",
    "items": ["...", "...", "..."]
  },
  "cancellation": {
    "title": "Cancellation Policy", 
    "items": ["...", "...", "..."]
  },
  "guarantee": {
    "title": "Service Guarantee",
    "items": ["..."]
  },
  "health_safety": {
    "title": "Health & Safety",
    "items": ["...", "...", "..."]
  }
}
```

### Translation Integration
- All text from booking policies passes through `translateByText()` function
- Custom text also uses `translateByText()` for automatic translation
- Translations can be managed in Admin > Translations page
- Supports English and Spanish out of the box

## Files Modified/Created

### Created:
1. `supabase/migrations/20251006120000_add_booking_policies_settings.sql`
2. `supabase/migrations/20251006120001_add_service_page_translations.sql`
3. `src/pages/admin/AdminServicePageSettings.tsx`

### Modified:
1. `src/lib/studioService.ts`
2. `src/pages/Services.tsx`
3. `src/App.tsx`
4. `src/components/admin/AdminSidebar.tsx`

## Next Steps
1. Run the migrations: Deploy to Supabase or run locally
2. Test the admin interface
3. Verify translations work correctly
4. Add any additional custom policy sections if needed
