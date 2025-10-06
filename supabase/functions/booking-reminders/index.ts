/*
# Booking Reminders Cron Function

This function runs periodically to send:
1. 24-hour reminders for upcoming appointments
2. 1-hour reminders for imminent appointments

Should be triggered by a cron job or scheduled task.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
  selected_add_ons?: any[];
  add_ons_total?: number;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return `${hours}:${minutes}:00`;
};

const sendReminderEmail = async (booking: Booking, reminderType: '24h' | '1h') => {
  const emailFunctionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-email`;
  
  const response = await fetch(emailFunctionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: reminderType === '24h' ? 'reminder-24h' : 'reminder-1h',
      booking: booking,
      adminEmail: Deno.env.get('ADMIN_EMAIL')
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send ${reminderType} reminder for booking ${booking.id}: ${errorText}`);
  }

  return await response.json();
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Format dates for comparison
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
    const todayDateStr = now.toISOString().split('T')[0];

    // Get bookings that need 24-hour reminders
    const { data: bookingsFor24h, error: error24h } = await supabase
      .from('bookings')
      .select('*')
      .eq('appointment_date', tomorrowDateStr)
      .eq('status', 'confirmed');

    if (error24h) {
      console.error('Error fetching 24h reminder bookings:', error24h);
    }

    // Get bookings that need 1-hour reminders
    const { data: bookingsFor1h, error: error1h } = await supabase
      .from('bookings')
      .select('*')
      .eq('appointment_date', todayDateStr)
      .eq('status', 'confirmed');

    if (error1h) {
      console.error('Error fetching 1h reminder bookings:', error1h);
    }

    const results = {
      sent24h: 0,
      sent1h: 0,
      errors: [] as string[]
    };

    // Send 24-hour reminders
    if (bookingsFor24h) {
      for (const booking of bookingsFor24h) {
        try {
          await sendReminderEmail(booking, '24h');
          results.sent24h++;
          console.log(`24h reminder sent for booking ${booking.id}`);
        } catch (error) {
          console.error(`Failed to send 24h reminder for booking ${booking.id}:`, error);
          results.errors.push(`24h reminder failed for ${booking.id}: ${error.message}`);
        }
      }
    }

    // Send 1-hour reminders (check if appointment time is within the next hour)
    if (bookingsFor1h) {
      for (const booking of bookingsFor1h) {
        try {
          const appointmentDateTime = new Date(`${booking.appointment_date}T${convertTo24Hour(booking.appointment_time)}`);
          const timeDiff = appointmentDateTime.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);

          // Send reminder if appointment is between 45 minutes and 75 minutes from now
          if (hoursDiff >= 0.75 && hoursDiff <= 1.25) {
            await sendReminderEmail(booking, '1h');
            results.sent1h++;
            console.log(`1h reminder sent for booking ${booking.id}`);
          }
        } catch (error) {
          console.error(`Failed to send 1h reminder for booking ${booking.id}:`, error);
          results.errors.push(`1h reminder failed for ${booking.id}: ${error.message}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reminder check completed',
        results: results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Reminder function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process reminders', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});