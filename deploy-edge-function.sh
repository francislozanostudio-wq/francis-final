#!/bin/bash
# Deploy the send-booking-email edge function to Supabase

echo "🚀 Deploying send-booking-email edge function to Supabase..."

# Make sure you have the Supabase CLI installed and logged in
# If not, run: npm install -g supabase
# And: supabase login

# Deploy the function
supabase functions deploy send-booking-email

echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: Make sure these environment variables are set in your Supabase dashboard:"
echo "   - BREVO_API_KEY"
echo "   - SENDER_EMAIL"
echo "   - ADMIN_EMAIL"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "To set secrets, run:"
echo "supabase secrets set BREVO_API_KEY=your_key_here"
