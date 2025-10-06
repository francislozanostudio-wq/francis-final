# Reminder Email Add-Ons Fix

## Issue
The reminder emails (24h, 1h, and **custom reminders**) were sending the correct appointment time, but the Total Cost didn't include the add-ons price when manually sending reminders from the admin panel.

## Root Cause
There were TWO places where the add-ons data was missing:

### 1. Automated Reminders (booking-reminders function)
The `Booking` interface in `supabase/functions/booking-reminders/index.ts` was missing the `selected_add_ons` and `add_ons_total` fields.

### 2. Manual/Custom Reminders (admin panel)
The `BookingReminderButton` component in `src/components/admin/BookingReminderButton.tsx` was not passing the add-ons data when building the email payload.

Even though:
- The database has these fields
- The email templates were correctly calculating the total
- The interface was fetching incomplete data

## Fixes Applied

### Fix 1: booking-reminders/index.ts
Updated the `Booking` interface to include:
```typescript
interface Booking {
  id: string;
  service_name: string;
  service_price: number;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  confirmation_number: string;
  notes?: string;
  status: string;
  selected_add_ons?: any[];      // ✅ Added
  add_ons_total?: number;         // ✅ Added
}
```

### Fix 2: BookingReminderButton.tsx
Updated two locations:

**Interface:**
```typescript
interface BookingReminderButtonProps {
  booking: {
    // ... existing fields
    selected_add_ons?: any[];    // ✅ Added
    add_ons_total?: number;       // ✅ Added
  };
  adminEmail?: string;
}
```

**Email Data Payload:**
```typescript
const emailData = {
  type: reminderType,
  booking: {
    // ... existing fields
    selected_add_ons: booking.selected_add_ons,  // ✅ Added
    add_ons_total: booking.add_ons_total,        // ✅ Added
  },
  hoursUntilAppointment: timeInfo.totalHours,
  // ...
};
```

## Email Template Verification
All reminder templates correctly calculate the total:

### reminder-24h
- **Total Cost:** `$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}`
- **Payment reminder:** `$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}`
- **Add-ons list:** Displays all selected add-ons if present

### reminder-1h
- **Total Cost:** `$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}`
- **Add-ons list:** Displays all selected add-ons if present

### reminder-custom (165 hours, etc.)
- **Total Cost:** `$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}`
- **Payment reminder:** `$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}`
- **Add-ons list:** Displays all selected add-ons if present

## Deployment Required

### 1. Deploy Edge Function
```bash
npx supabase functions deploy booking-reminders
```

### 2. Build and Deploy Frontend
```bash
npm run build
# Then deploy to your hosting (Netlify/Vercel)
```

## Testing
After deployment, test by:

### Automated Reminders
1. Create a booking with add-ons for tomorrow
2. Wait for or trigger the automated 24h reminder
3. Verify email shows correct total

### Manual/Custom Reminders
1. Create a booking with add-ons
2. Go to admin panel
3. Click "Send Reminder" button
4. Verify the email received shows:
   - Total Cost = Service Price + Add-ons Total
   - Add-ons listed separately
   - Correct payment amount in the bullet points

## Example Output
For a booking with:
- Service: $50
- Add-ons: Gel Polish ($15) + French Tips ($10)
- Add-ons Total: $25

Email should show:
- **Total Cost: $75.00**
- **Add-Ons:** Gel Polish, French Tips
- **Payment reminder:** Bring payment for $75.00

## Files Modified
1. ✅ `supabase/functions/booking-reminders/index.ts` - Added add-ons fields to Booking interface
2. ✅ `src/components/admin/BookingReminderButton.tsx` - Added add-ons fields to interface and email payload
