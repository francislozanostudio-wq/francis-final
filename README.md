# Francis Lozano Studio - Email Integration Setup

## Brevo API Integration

This project uses Brevo API for sending booking confirmation and reminder emails. Follow these steps to set up the email system:

### Step 1: Get Brevo API Key

1. Go to [Brevo.com](https://brevo.com) and create an account
2. Navigate to **SMTP & API** in your account settings
3. Create a new API key with transactional email permissions
4. Copy the API key (starts with `xkeysib-`)

### Step 2: Add Brevo API Key to Supabase Edge Function Secrets

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click on **Settings** or **Secrets**
4. Add these secrets:
   - **Name**: `BREVO_API_KEY`
   - **Value**: Your Brevo API key (e.g., `xkeysib-REPLACE_WITH_YOUR_REAL_KEY`)

### Step 3: Configure Email Settings

Add these additional secrets in Supabase Edge Function secrets:
   - **Name**: `ADMIN_EMAIL`
   - **Value**: Your admin email address (e.g., `alerttradingvieww@gmail.com`)
   - **Name**: `SENDER_EMAIL`
   - **Value**: Your verified sender email (e.g., `alerttradingvieww@gmail.com`)

### Step 4: Verify Your Sender Email in Brevo

1. In your Brevo dashboard, go to **Senders & IP**
2. Add and verify your sender email address
3. This is the email that will appear in the "From" field of your emails

### Step 5: Test the Email System

1. Go to Admin Dashboard → Bookings
2. Click the **Email Settings** button
3. Configure your email settings
4. Click **Test Configuration** to send a test email
5. Check your email inbox to verify emails are working

## Email Features

### Automatic Emails Sent:

1. **Booking Confirmation**: Sent immediately when a new booking is created
2. **Admin Notification**: Sent to admin when new booking is received
3. **24-Hour Reminder**: Can be sent manually or via cron job
4. **1-Hour Reminder**: Can be sent manually or via cron job

### Brevo Advantages:

- No domain verification required for transactional emails
- Reliable delivery with high inbox rates
- Built-in analytics and tracking
- Free tier includes 300 emails per day
- Professional email templates

### Manual Reminder System:

- In the Admin Bookings page, each booking has a "Send Reminder" button
- The button text changes based on time remaining until appointment:
  - "Send 24-Hour Reminder" (when appointment is tomorrow)
  - "Send 1-Hour Reminder" (when appointment is within 1 hour)
  - "Send Reminder (Xh early)" (for other times)

### Setting Up Automated Reminders (Optional):

To automate the reminder emails, you can:

1. Use Supabase Cron Jobs (if available in your plan)
2. Set up a GitHub Action or external cron service
3. Call the `booking-reminders` edge function periodically

Example cron schedule:
- Every hour: `0 * * * *` to check for 1-hour reminders
- Every day at 9 AM: `0 9 * * *` to send 24-hour reminders

## Email Templates

The system includes professionally designed HTML email templates with:
- Responsive design
- Brand colors and styling
- Clear appointment details
- Contact information
- Preparation instructions

## Troubleshooting

### Common Issues:

1. **Emails not sending**: 
   - Check that `BREVO_API_KEY` is correctly set in Supabase Edge Function secrets
   - Verify that `SENDER_EMAIL` is verified in your Brevo account
   - Check that `ADMIN_EMAIL` is set correctly
2. **Invalid sender error**: 
   - Make sure your sender email is verified in Brevo dashboard
   - Go to Senders & IP section and verify your email address
3. **Emails going to spam**: 
   - Brevo has good deliverability, but check spam folders initially
   - Consider setting up SPF and DKIM records for better delivery
4. **Function timeout**: Check Supabase Edge Function logs for detailed errors

### Testing:

1. Use the "Test Configuration" button in Email Settings
2. Check Supabase Edge Function logs for errors
3. Monitor email delivery in your Brevo dashboard
4. Check the Statistics section in Brevo for delivery reports

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor email sending quotas and usage

## Brevo Setup Summary

Required Environment Variables in Supabase Edge Functions:
- `BREVO_API_KEY`: Your Brevo API key
- `ADMIN_EMAIL`: Email to receive admin notifications
- `SENDER_EMAIL`: Verified sender email address

## Moving to Production

Brevo is production-ready out of the box:
1. Verify your sender email address in Brevo
2. Set up proper SPF/DKIM records for your domain (optional but recommended)
3. Monitor your sending limits and upgrade plan if needed
4. Use Brevo's analytics to track email performance