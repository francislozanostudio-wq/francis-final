/*
# Contact Form Notification Function

This edge function sends email notifications to admin when:
1. New contact form messages are submitted
2. Provides full message details for quick response

Uses Brevo API for reliable email delivery.
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ContactMessage {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  inquiry_type: string;
  subject: string;
  message: string;
  created_at: string;
}

interface ContactNotificationData {
  message: ContactMessage;
  adminEmail: string | string[];
  studioConfig?: {
    studioName: string;
    studioPhone: string;
    studioEmail: string;
    websiteUrl: string;
  };
}

const generateAdminNotificationHTML = (message: ContactMessage, studioConfig?: ContactNotificationData['studioConfig']) => {
  const formattedDate = new Date(message.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  // Use actual studio config or fallback to defaults
  const studioName = studioConfig?.studioName || 'Francis Lozano Studio';
  const studioPhone = studioConfig?.studioPhone || '(+1 737-378-5755';
  const studioEmail = studioConfig?.studioEmail || 'francislozanostudio@gmail.com';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Message - ${studioName}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center; }
        .header h1 { color: #0f0f23; margin: 0; font-size: 28px; font-weight: bold; }
        .header p { color: #0f0f23; margin: 5px 0 0 0; font-size: 16px; }
        .content { padding: 30px; }
        .message-card { background: #f8f9fa; border-left: 4px solid #FFD700; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: 600; color: #666; }
        .detail-value { font-weight: 500; color: #333; }
        .highlight { color: #FFD700; font-weight: bold; }
        .footer { background: #0f0f23; color: #ffffff; padding: 20px; text-align: center; font-size: 14px; }
        .button { display: inline-block; background: #FFD700; color: #0f0f23; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
        .urgent { background: #4CAF50; color: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .message-content { background: #ffffff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Message</h1>
          <p>${studioName} Admin</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            <h2 style="margin: 0;">📧 New Message Received!</h2>
            <p style="margin: 5px 0 0 0;">A potential client has contacted you through your website</p>
          </div>
          
          <div class="message-card">
            <h3 style="margin-top: 0; color: #0f0f23;">Contact Details</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value highlight">${message.first_name} ${message.last_name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${message.email}</span>
            </div>
            ${message.phone ? `
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${message.phone}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Inquiry Type:</span>
              <span class="detail-value">${message.inquiry_type}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Subject:</span>
              <span class="detail-value">${message.subject}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Received:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
          </div>
          
          <h3>Message Content</h3>
          <div class="message-content">
            <p style="margin: 0; white-space: pre-wrap;">${message.message}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}&body=Dear ${encodeURIComponent(message.first_name)},%0A%0AThank you for contacting Francis Lozano Studio.%0A%0A" class="button">
              Reply to ${message.first_name}
            </a>
            <a href="tel:${message.phone || ''}" class="button">
              Call ${message.phone || 'Client'}
            </a>
          </div>
          
          <h3>Quick Actions</h3>
          <ul>
            <li>Reply directly to this email to respond to ${message.first_name}</li>
            <li>Call ${message.phone || 'the client'} for immediate assistance</li>
            <li>Check your admin dashboard for more details</li>
            <li>Mark as read/replied in the admin panel</li>
          </ul>
          
          <p><strong>Response Time Goal:</strong> Aim to respond within 24 hours for the best client experience.</p>
        </div>
        
        <div class="footer">
          <p>${studioName} Admin System</p>
          <p>This is an automated notification from your website contact form</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmailWithBrevo = async (to: string, subject: string, html: string, senderEmail: string, senderName: string) => {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  console.log(`Sending contact notification to: ${to} with subject: ${subject}`);

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
        name: `${senderName} Admin`
      }],
      subject: subject,
      htmlContent: html,
      tags: ['contact-form', 'admin-notification']
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Brevo API error:', errorData);
    throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
  }

  const result = await response.json();
  console.log('Contact notification sent successfully via Brevo:', result);
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
    // Parse request body
    let requestData: ContactNotificationData;
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

    const { message, adminEmail, studioConfig } = requestData;

    // Validate required fields
    if (!message || !adminEmail) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'Both message data and admin email are required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate message object has required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'subject', 'message', 'inquiry_type'];
    const missingFields = requiredFields.filter(field => !message[field]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required message fields',
          details: `Missing: ${missingFields.join(', ')}` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const senderEmail = Deno.env.get('SENDER_EMAIL') || studioConfig?.studioEmail || 'francislozanostudio@gmail.com';
    const senderName = studioConfig?.studioName || 'Francis Lozano Studio';

    // Send admin notification email to single recipient (called multiple times from frontend)
    try {
      const subject = `New Contact: ${message.inquiry_type} from ${message.first_name} ${message.last_name}`;
      const html = generateAdminNotificationHTML(message, studioConfig);
      
      const emailResult = await sendEmailWithBrevo(
        adminEmail,
        subject,
        html,
        senderEmail,
        senderName
      );

      console.log(`Contact notification sent to: ${adminEmail}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Contact notification sent successfully via Brevo',
          result: emailResult
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (emailError) {
      console.error(`Failed to send contact notification to ${adminEmail}:`, emailError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send contact notification',
          details: emailError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Contact notification function error:', error);
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