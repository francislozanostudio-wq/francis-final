# Deploy Email Function After Add-Ons Fix

## Quick Deployment Guide

After fixing the add-ons price integration, you need to redeploy the email edge function to production.

### Option 1: Using Supabase CLI

```bash
# Make sure you're in the project root
cd c:\Users\asus\OneDrive\Desktop\FRANCIS-main

# Deploy the send-booking-email function
supabase functions deploy send-booking-email
```

### Option 2: Using the Deployment Script

If you have the deployment script available:

```bash
# Make it executable (if on Mac/Linux)
chmod +x deploy-edge-function.sh

# Run the deployment
./deploy-edge-function.sh send-booking-email
```

### Option 3: Manual Deployment via Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Edge Functions** in the left sidebar
4. Click on **send-booking-email** function
5. Click **Deploy** button
6. Upload the updated `index.ts` file from `supabase/functions/send-booking-email/`

## Verification After Deployment

1. **Test with a new booking**:
   - Create a booking with add-ons
   - Check that emails include add-ons pricing
   - Verify PDF shows add-ons

2. **Check function logs**:
   ```bash
   supabase functions logs send-booking-email
   ```

3. **Test email delivery**:
   - Confirmation email to client
   - Admin notification email
   - Both should show complete pricing breakdown

## Environment Variables

Make sure these are set in Supabase Dashboard > Project Settings > Edge Functions:

- `BREVO_API_KEY` - Your Brevo API key for sending emails
- `SENDER_EMAIL` - Email address to send from
- `ADMIN_EMAIL` - Default admin email for notifications (optional, now uses DB)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

## Troubleshooting

### If emails don't show add-ons:

1. **Clear browser cache** and test again
2. **Check function logs** for errors:
   ```bash
   supabase functions logs send-booking-email --follow
   ```
3. **Verify deployment** was successful
4. **Test the function directly** using the Supabase Functions testing interface

### If deployment fails:

1. Ensure Supabase CLI is installed and logged in:
   ```bash
   supabase login
   ```
2. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
3. Try deploying again

## Notes

- The frontend code doesn't need redeployment (already correctly sends add-ons data)
- Only the edge function needs to be redeployed
- Old bookings without add-ons will still work correctly (backward compatible)
- The function handles cases where add-ons are empty or not present

## Success Indicators

After successful deployment, you should see:

✅ Confirmation emails show service price + add-ons total + grand total
✅ Admin notifications include complete pricing breakdown
✅ Reminder emails show correct total amount to bring
✅ PDF downloads include add-ons section with prices
✅ All prices match the booking total shown in admin dashboard

## Support

If you encounter issues:
1. Check the Edge Function logs in Supabase Dashboard
2. Verify the TypeScript code has no syntax errors
3. Ensure all environment variables are set correctly
4. Test with a simple booking first (no add-ons) to ensure basic functionality works
