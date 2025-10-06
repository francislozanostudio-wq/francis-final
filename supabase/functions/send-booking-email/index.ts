/*
# Booking Email Notification Function

This edge function handles:
1. Booking confirmation emails to clients
2. Booking reminder emails (24h and 1h before)
3. Admin notifications for new bookings

Uses Brevo API for reliable email delivery with dynamic location and studio configuration from database.
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface BookingEmailData {
  type: 'confirmation' | 'reminder-24h' | 'reminder-1h' | 'reminder-custom' | 'admin-notification';
  booking: {
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
    selected_add_ons?: any[];
    add_ons_total?: number;
  };
  hoursUntilAppointment?: number;
  adminEmail?: string;
  locationConfig?: {
    includeInConfirmation: boolean;
    deliveryMethod: 'inline' | 'separate' | 'both';
    fullAddress: string;
    displayAddress: string;
    googleMapsLink: string;
    parkingInstructions: string;
    accessInstructions: string;
  };
  studioConfig?: {
    studioName: string;
    studioPhone: string;
    studioEmail: string;
    websiteUrl: string;
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const getStudioSettingsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('studio_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching studio settings from DB:', error);
      return null;
    }

    return {
      studioName: data.studio_name,
      studioPhone: data.studio_phone,
      studioEmail: data.studio_email,
      websiteUrl: data.website_url
    };
  } catch (error) {
    console.error('Error fetching studio settings:', error);
    return null;
  }
};

const generateLocationSection = (locationConfig?: BookingEmailData['locationConfig']) => {
  console.log('Generating location section with config:', locationConfig);
  
  if (!locationConfig || !locationConfig.includeInConfirmation) {
    console.log('Location not included in confirmation or config missing');
    return 'Studio address will be provided separately for privacy and security.';
  }

  console.log('Location delivery method:', locationConfig.deliveryMethod);

  switch (locationConfig.deliveryMethod) {
    case 'inline':
      const inlineContent = `<div class="location-section">
        <h3 style="color: #0f0f23; margin-bottom: 15px;">🏠 Studio Location</h3>
        <p style="margin: 8px 0;"><strong>${locationConfig.displayAddress || 'Private Studio, Nashville TN'}</strong></p>
        ${locationConfig.parkingInstructions ? `<p style="margin: 8px 0;"><strong>🚗 Parking:</strong> ${locationConfig.parkingInstructions}</p>` : ''}
        ${locationConfig.accessInstructions ? `<p style="margin: 8px 0;"><strong>🚪 Access:</strong> ${locationConfig.accessInstructions}</p>` : ''}
        ${locationConfig.googleMapsLink ? `<p style="margin: 8px 0;"><strong>🗺️ Directions:</strong> <a href="${locationConfig.googleMapsLink}" style="color: #FFD700; text-decoration: none;">Click here for Google Maps</a></p>` : ''}
      </div>`;
      console.log('Generated inline location content:', inlineContent);
      return inlineContent;
    
    case 'separate':
      const separateContent = `<div class="location-section">
        <h3 style="color: #0f0f23; margin-bottom: 15px;">🏠 Studio Location</h3>
        <p style="margin: 8px 0;"><strong>Address details will be sent separately 24 hours before your appointment</strong> for privacy and security.</p>
        <p style="margin: 8px 0;">You'll receive complete directions, parking information, and access instructions closer to your appointment date.</p>
      </div>`;
      console.log('Generated separate location content:', separateContent);
      return separateContent;
    
    case 'both':
      const bothContent = `<div class="location-section">
        <h3 style="color: #0f0f23; margin-bottom: 15px;">🏠 Studio Location</h3>
        <p style="margin: 8px 0;"><strong>${locationConfig.displayAddress || 'Private Studio, Nashville TN'}</strong></p>
        <p style="margin: 8px 0;"><em>Complete address and detailed directions will be sent separately 24 hours before your appointment.</em></p>
      </div>`;
      console.log('Generated both location content:', bothContent);
      return bothContent;
    
    default:
      console.log('Unknown delivery method, using default');
      return '';
  }
};

const generateEmailHTML = (data: BookingEmailData) => {
  const { booking, type, locationConfig, studioConfig } = data;
  const appointmentDateTime = new Date(`${booking.appointment_date}T${convertTo24Hour(booking.appointment_time)}`);
  const formattedDate = appointmentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use studio config from database or fallback to defaults
  const studioName = studioConfig?.studioName || 'Francis Lozano Studio';
  const studioPhone = studioConfig?.studioPhone || '(+1 737-378-5755';
  const studioEmail = studioConfig?.studioEmail || 'francislozanostudio@gmail.com';
  const websiteUrl = studioConfig?.websiteUrl || 'https://francislozanostudio.com';

  const locationSection = generateLocationSection(locationConfig);
  console.log('Final location section for email:', locationSection);

  const baseStyles = `
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
      .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; }
      .header h1 { color: #0f0f23; margin: 0; font-size: 28px; font-weight: bold; }
      .header p { color: #0f0f23; margin: 5px 0 0 0; font-size: 16px; }
      .content { padding: 30px; }
      .booking-card { background: #f8f9fa; border-left: 4px solid #FFD700; padding: 20px; margin: 20px 0; border-radius: 8px; }
      .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
      .detail-label { font-weight: 600; color: #666; }
      .detail-value { font-weight: 500; color: #333; }
      .highlight { color: #FFD700; font-weight: bold; }
      .footer { background: #0f0f23; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; }
      .button { display: inline-block; background: #FFD700; color: #0f0f23; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
      .urgent { background: #ff6b6b; color: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
      .location-section { background: #f0f8ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
  `;

  switch (type) {
    case 'confirmation':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Booking Confirmation - ${studioName}</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${studioName}</h1>
              <p>Luxury Nail Artistry • Nashville, TN</p>
            </div>
            
            <div class="content">
              <h2>Booking Confirmed! ✨</h2>
              <p>Dear ${booking.client_name},</p>
              
              <p>Thank you for choosing ${studioName}! Your appointment has been confirmed and I'm excited to create something beautiful for you.</p>
              
              <div class="booking-card">
                <h3 style="margin-top: 0; color: #0f0f23;">Appointment Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Confirmation Number:</span>
                  <span class="detail-value highlight">#${booking.confirmation_number}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${booking.service_name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${booking.appointment_time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service Price:</span>
                  <span class="detail-value">$${booking.service_price}</span>
                </div>
                ${booking.selected_add_ons && booking.selected_add_ons.length > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Add-Ons:</span>
                  <span class="detail-value">
                    ${booking.selected_add_ons.map((addOn: any) => `${addOn.name} (+$${addOn.price})`).join(', ')}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Add-Ons Total:</span>
                  <span class="detail-value">+$${booking.add_ons_total?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="detail-row" style="border-top: 2px solid #FFD700; padding-top: 10px; margin-top: 5px;">
                  <span class="detail-label"><strong>Total Investment:</strong></span>
                  <span class="detail-value highlight"><strong>$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}</strong></span>
                </div>
                ` : `
                <div class="detail-row">
                  <span class="detail-label">Total Investment:</span>
                  <span class="detail-value">$${booking.service_price}</span>
                </div>
                `}
                ${booking.notes ? `
                <div class="detail-row">
                  <span class="detail-label">Your Notes:</span>
                  <span class="detail-value">${booking.notes}</span>
                </div>
                ` : ''}
              </div>
              
              ${locationSection}
              
              <h3>Before Your Visit</h3>
              <ul>
                <li>Please arrive with clean, polish-free nails</li>
                <li>Arrive 5 minutes early for check-in</li>
                <li>Bring inspiration photos if you have specific designs in mind</li>
                <li>Payment due at time of service: <strong>$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}</strong> (Cash, Venmo, Zelle, Cards accepted)</li>
                <li>Please reschedule if feeling unwell (48hr notice required)</li>
              </ul>
              
              <p><strong>Cancellation Policy:</strong> 48-hour notice required for cancellations or changes. Same-day cancellations forfeit deposit.</p>
              
              <p>If you have any questions or need to make changes, please contact me at:</p>
              <p>📞 ${studioPhone}<br>
              📧 ${studioEmail}</p>
              
              <p>Looking forward to seeing you soon!</p>
              <p><em>Francis</em></p>
            </div>
            
            <div class="footer">
              <p>${studioName} - Luxury Nail Artistry</p>
              <p>Nashville, Tennessee | ${studioEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'reminder-24h':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Reminder - Tomorrow</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${studioName}</h1>
              <p>Appointment Reminder</p>
            </div>
            
            <div class="content">
              <h2>Your Appointment is Tomorrow! 💅</h2>
              <p>Dear ${booking.client_name},</p>
              
              <p>This is a friendly reminder that your nail appointment is scheduled for tomorrow. I'm looking forward to creating something beautiful for you!</p>
              
              <div class="booking-card">
                <h3 style="margin-top: 0; color: #0f0f23;">Tomorrow's Appointment</h3>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${booking.service_name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value highlight">${booking.appointment_time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Confirmation:</span>
                  <span class="detail-value">#${booking.confirmation_number}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Cost:</span>
                  <span class="detail-value highlight">$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}</span>
                </div>
                ${booking.selected_add_ons && booking.selected_add_ons.length > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Add-Ons:</span>
                  <span class="detail-value">
                    ${booking.selected_add_ons.map((addOn: any) => addOn.name).join(', ')}
                  </span>
                </div>
                ` : ''}
              </div>
              
              ${locationSection}
              
              <h3>Final Reminders</h3>
              <ul>
                <li>✅ Come with clean, polish-free nails</li>
                <li>✅ Arrive 5 minutes early</li>
                <li>✅ Bring payment for <strong>$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}</strong></li>
                <li>✅ Bring inspiration photos if desired</li>
              </ul>
              
              <p>Need to reschedule? Please call or text <strong>${studioPhone}</strong> immediately.</p>
              
              <p>Can't wait to see you tomorrow!</p>
              <p><em>Francis</em></p>
            </div>
            
            <div class="footer">
              <p>${studioName} - Luxury Nail Artistry</p>
              <p>Nashville, Tennessee | ${studioPhone}</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'reminder-1h':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Appointment Starting Soon</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${studioName}</h1>
              <p>Your Appointment Starts Soon!</p>
            </div>
            
            <div class="content">
              <div class="urgent">
                <h2 style="margin: 0;">Your appointment starts in 1 hour! ⏰</h2>
              </div>
              
              <p>Dear ${booking.client_name},</p>
              
              <p>Your nail appointment at ${studioName} starts in approximately 1 hour. Here are your final details:</p>
              
              <div class="booking-card">
                <h3 style="margin-top: 0; color: #0f0f23;">Today's Appointment</h3>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${booking.service_name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value highlight">${booking.appointment_time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Cost:</span>
                  <span class="detail-value">$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}</span>
                </div>
                ${booking.selected_add_ons && booking.selected_add_ons.length > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Add-Ons:</span>
                  <span class="detail-value">
                    ${booking.selected_add_ons.map((addOn: any) => addOn.name).join(', ')}
                  </span>
                </div>
                ` : ''}
              </div>
              
              <div class="location-section">
                <h3>🚗 Getting Here</h3>
                <p><strong>${studioName}</strong><br>
                ${locationConfig?.fullAddress || locationConfig?.displayAddress || 'Private Studio, Nashville TN'}<br>
                ${locationConfig?.parkingInstructions ? `<strong>Parking:</strong> ${locationConfig.parkingInstructions}` : ''}</p>
              </div>
              
              <h3>📱 Contact Info</h3>
              <p>If you're running late or have any issues:<br>
              <strong>Call/Text:</strong> ${studioPhone}<br>
              <strong>Email:</strong> ${studioEmail}</p>
              
              <p>See you very soon!</p>
              <p><em>Francis</em></p>
            </div>
            
            <div class="footer">
              <p>${studioName} - Luxury Nail Artistry</p>
              <p>Nashville, Tennessee | ${studioPhone}</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'reminder-custom':
      const hoursRemaining = data.hoursUntilAppointment || 0;
      const daysRemaining = Math.floor(hoursRemaining / 24);
      const remainingHours = hoursRemaining % 24;
      
      let timeRemainingText = '';
      if (daysRemaining > 0) {
        timeRemainingText = daysRemaining === 1 
          ? `in ${daysRemaining} day and ${remainingHours} hours`
          : `in ${daysRemaining} days and ${remainingHours} hours`;
      } else {
        timeRemainingText = `in ${hoursRemaining} hours`;
      }

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Upcoming Appointment Reminder</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${studioName}</h1>
              <p>Appointment Reminder</p>
            </div>
            
            <div class="content">
              <h2>Your Appointment is Coming Up! 💅</h2>
              <p>Dear ${booking.client_name},</p>
              
              <p>This is a friendly reminder that your nail appointment is scheduled ${timeRemainingText}. I'm looking forward to creating something beautiful for you!</p>
              
              <div class="booking-card">
                <h3 style="margin-top: 0; color: #0f0f23;">Upcoming Appointment</h3>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${booking.service_name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value highlight">${booking.appointment_time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Confirmation:</span>
                  <span class="detail-value">#${booking.confirmation_number}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Cost:</span>
                  <span class="detail-value">$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}</span>
                </div>
                ${booking.selected_add_ons && booking.selected_add_ons.length > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Add-Ons:</span>
                  <span class="detail-value">
                    ${booking.selected_add_ons.map((addOn: any) => addOn.name).join(', ')}
                  </span>
                </div>
                ` : ''}
              </div>
              
              ${locationSection}
              
              <h3>Before Your Visit</h3>
              <ul>
                <li>✅ Come with clean, polish-free nails</li>
                <li>✅ Arrive 5 minutes early</li>
                <li>✅ Bring payment for <strong>$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}</strong></li>
                <li>✅ Bring inspiration photos if desired</li>
              </ul>
              
              <p><strong>Need to reschedule?</strong> Please contact me at least 48 hours in advance:</p>
              <p>📞 ${studioPhone}<br>
              📧 ${studioEmail}</p>
              
              <p>Looking forward to seeing you!</p>
              <p><em>Francis</em></p>
            </div>
            
            <div class="footer">
              <p>${studioName} - Luxury Nail Artistry</p>
              <p>Nashville, Tennessee | ${studioPhone}</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'admin-notification':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking Received</title>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Booking Alert</h1>
              <p>${studioName} Admin</p>
            </div>
            
            <div class="content">
              <h2>New Appointment Booked! 🎉</h2>
              
              <p>A new booking has been received through your website:</p>
              
              <div class="booking-card">
                <h3 style="margin-top: 0; color: #0f0f23;">Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Confirmation #:</span>
                  <span class="detail-value highlight">#${booking.confirmation_number}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Client:</span>
                  <span class="detail-value">${booking.client_name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${booking.client_email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${booking.client_phone}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${booking.service_name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${formattedDate} at ${booking.appointment_time}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service Price:</span>
                  <span class="detail-value">$${booking.service_price}</span>
                </div>
                ${booking.selected_add_ons && booking.selected_add_ons.length > 0 ? `
                <div class="detail-row">
                  <span class="detail-label">Add-Ons:</span>
                  <span class="detail-value">
                    ${booking.selected_add_ons.map((addOn: any) => `${addOn.name} (+$${addOn.price})`).join(', ')}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Add-Ons Total:</span>
                  <span class="detail-value">+$${booking.add_ons_total?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="detail-row" style="border-top: 2px solid #FFD700; padding-top: 10px; margin-top: 5px;">
                  <span class="detail-label"><strong>Total Price:</strong></span>
                  <span class="detail-value highlight"><strong>$${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}</strong></span>
                </div>
                ` : `
                <div class="detail-row">
                  <span class="detail-label">Total Price:</span>
                  <span class="detail-value">$${booking.service_price}</span>
                </div>
                `}
                ${booking.notes ? `
                <div class="detail-row">
                  <span class="detail-label">Client Notes:</span>
                  <span class="detail-value">${booking.notes}</span>
                </div>
                ` : ''}
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Client confirmation email has been sent automatically</li>
                <li>24-hour reminder will be sent automatically</li>
                <li>1-hour reminder will be sent automatically</li>
                <li>Review booking in admin dashboard if needed</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>${studioName} Admin System</p>
              <p>This is an automated notification</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return '';
  }
};

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

const sendEmailWithBrevo = async (to: string, subject: string, html: string, senderEmail: string, senderName: string) => {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  console.log(`Sending email to: ${to} with subject: ${subject}`);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [{
        email: to,
        name: to.split('@')[0] // Use email prefix as name if no name provided
      }],
      subject: subject,
      htmlContent: html,
      tags: ['booking', 'transactional']
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Brevo API error:', errorData);
    throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
  }

  const result = await response.json();
  console.log('Email sent successfully via Brevo:', result);
  return result;
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get studio settings from database first
    const dbStudioConfig = await getStudioSettingsFromDB();
    
    // Parse request body
    let requestData: BookingEmailData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON format in request body',
          details: parseError.message 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { type, booking, adminEmail, locationConfig } = requestData;
    
    // Use database studio config, fallback to request data, then defaults
    const finalStudioConfig = dbStudioConfig || requestData.studioConfig || {
      studioName: 'Francis Lozano Studio',
      studioPhone: '(+1 737-378-5755',
      studioEmail: 'francislozanostudio@gmail.com',
      websiteUrl: 'https://francislozanostudio.com'
    };

    // Validate required fields
    if (!booking || !type) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'Both booking data and email type are required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate booking object has required fields
    const requiredFields = ['service_name', 'client_name', 'client_email', 'appointment_date', 'appointment_time', 'confirmation_number'];
    const missingFields = requiredFields.filter(field => !booking[field]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required booking fields',
          details: `Missing: ${missingFields.join(', ')}` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailResults = [];
    const senderEmail = Deno.env.get('SENDER_EMAIL') || finalStudioConfig.studioEmail || 'francislozanostudio@gmail.com';
    const senderName = finalStudioConfig.studioName || 'Francis Lozano Studio';

    // Send client email for all types except admin-notification
    if (type !== 'admin-notification') {
      const hoursRemaining = requestData.hoursUntilAppointment || 0;
      const daysRemaining = Math.floor(hoursRemaining / 24);
      
      console.log(`Processing email type: ${type}, hoursRemaining: ${hoursRemaining}, daysRemaining: ${daysRemaining}`);
      
      let subject = '';
      
      switch (type) {
        case 'confirmation':
          subject = `Booking Confirmed - ${booking.service_name} on ${new Date(booking.appointment_date).toLocaleDateString()}`;
          break;
        case 'reminder-24h':
          subject = `Reminder: Your appointment is tomorrow at ${booking.appointment_time}`;
          break;
        case 'reminder-1h':
          subject = `Starting Soon: Your appointment begins in 1 hour`;
          break;
        case 'reminder-custom':
          if (daysRemaining > 0) {
            subject = `Reminder: Your appointment is in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} at ${booking.appointment_time}`;
          } else if (hoursRemaining > 0) {
            subject = `Reminder: Your appointment is in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} at ${booking.appointment_time}`;
          } else {
            subject = `Reminder: Your appointment is today at ${booking.appointment_time}`;
          }
          break;
        default:
          subject = `Appointment Reminder - ${booking.service_name} on ${new Date(booking.appointment_date).toLocaleDateString()}`;
          break;
      }

      // Ensure subject is never empty
      if (!subject || subject.trim() === '') {
        subject = `Appointment Reminder - ${booking.service_name} on ${new Date(booking.appointment_date).toLocaleDateString()}`;
        console.warn(`Subject was empty for type ${type}, using fallback subject: ${subject}`);
      }

      console.log(`Email subject: "${subject}"`);

      try {
        const clientEmailResult = await sendEmailWithBrevo(
          booking.client_email,
          subject,
          generateEmailHTML({ type, booking, locationConfig, studioConfig: finalStudioConfig, hoursUntilAppointment: hoursRemaining }),
          senderEmail,
          senderName
        );
        emailResults.push({ recipient: 'client', result: clientEmailResult });
        console.log(`Email sent to client: ${booking.client_email}`);
      } catch (emailError) {
        console.error('Failed to send client email:', emailError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send client email',
            details: emailError.message 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Send admin notification (only for admin-notification type to avoid duplicates)
    if (type === 'admin-notification') {
      const adminEmailAddress = adminEmail || Deno.env.get('ADMIN_EMAIL') || 'alerttradingvieww@gmail.com';
      
      try {
        const adminEmailResult = await sendEmailWithBrevo(
          adminEmailAddress,
          `New Booking: ${booking.client_name} - ${booking.service_name}`,
          generateEmailHTML({ type: 'admin-notification', booking, locationConfig, studioConfig: finalStudioConfig }),
          senderEmail,
          senderName
        );
        emailResults.push({ recipient: `admin-${adminEmailAddress}`, result: adminEmailResult });
        console.log(`Admin notification sent to: ${adminEmailAddress}`);
      } catch (emailError) {
        console.error(`Failed to send admin email to ${adminEmailAddress}:`, emailError);
        emailResults.push({ recipient: `admin-${adminEmailAddress}`, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully via Brevo',
        results: emailResults
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Email function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});