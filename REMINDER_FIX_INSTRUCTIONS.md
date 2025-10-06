# Booking Reminder Fix - Deployment Instructions

## Problem Summary
When clicking "Send Reminder (237h early)", the system was sending a generic "24-hour reminder" instead of a custom reminder showing the actual time remaining (237 hours).

## What Was Fixed

### 1. **Frontend Changes** ✅
- Updated `BookingReminderButton.tsx` to pass actual hours remaining
- Updated `emailService.ts` to include `hoursUntilAppointment` in the request
- Added detailed logging to debug the issue

### 2. **Backend Changes** ✅ (Needs Deployment)
- Added new `reminder-custom` email type to `send-booking-email/index.ts`
- Created dynamic email template that shows actual time remaining
- Added intelligent subject line generation based on hours/days remaining
- Added fallback logic to ensure subject is never empty

## CRITICAL: Deploy Edge Function

The edge function changes **MUST be deployed** to Supabase for the fix to work!

### Option 1: Deploy via Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI if you haven't already
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link your project (first time only)
supabase link --project-ref your-project-ref

# 4. Deploy the function
supabase functions deploy send-booking-email

# 5. Verify environment variables are set
supabase secrets list
```

### Option 2: Deploy via Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions**
3. Find `send-booking-email` function
4. Click **Deploy** or **Update**
5. Copy the entire contents of `supabase/functions/send-booking-email/index.ts`
6. Paste and save

### Required Environment Variables

Make sure these are set in your Supabase project:

```bash
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_sender_email
ADMIN_EMAIL=your_admin_email
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

## Testing After Deployment

1. Go to Admin → Bookings
2. Find a booking that's more than 24 hours away
3. Click the "Send Reminder (XXXh early)" button
4. Check your browser console for logs:
   - Should see: `Request body being sent to edge function:`
   - Should see: `Processing email type: reminder-custom, hoursRemaining: XXX`
   - Should see: `Email subject: "Reminder: Your appointment is in X days..."`
5. Check the email received - it should say the correct time remaining!

## How It Works Now

### Time Calculation Flow:
1. **Button Click** → Calculates hours until appointment (e.g., 237 hours)
2. **Determines Type**:
   - < 1 hour → `reminder-1h`
   - 1-24 hours → `reminder-24h`
   - > 24 hours → `reminder-custom` ✨ NEW!
3. **Sends Data** → Includes `hoursUntilAppointment: 237`
4. **Edge Function** → Converts to days/hours (e.g., 9 days and 21 hours)
5. **Email Subject** → "Reminder: Your appointment is in 9 days at 2:00 PM"
6. **Email Body** → "...scheduled in 9 days and 21 hours..."

## Troubleshooting

### If you still see the error "subject is required":

1. **Check browser console** - Look for the log: `Request body being sent to edge function:`
   - Verify `hoursUntilAppointment` is in the JSON
   - Verify `type` is set correctly

2. **Check edge function logs** in Supabase Dashboard:
   - Go to Edge Functions → send-booking-email → Logs
   - Look for: `Processing email type: reminder-custom, hoursRemaining: XXX`
   - If you don't see this, the function wasn't deployed

3. **Redeploy the edge function** - The most common issue is the edge function not being updated

4. **Clear browser cache** and reload the page

## Files Changed

- ✅ `src/components/admin/BookingReminderButton.tsx`
- ✅ `src/lib/emailService.ts`
- ✅ `supabase/functions/send-booking-email/index.ts` ⚠️ **NEEDS DEPLOYMENT**

---

**Next Step:** Deploy the edge function using one of the methods above!
