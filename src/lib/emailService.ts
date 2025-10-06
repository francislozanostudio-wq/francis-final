import { supabase } from './supabase';
import { getStudioSettings } from './studioService';

export interface BookingEmailData {
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
  locationConfig?: any;
  studioConfig?: any;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getAllActiveAdminEmails = async () => {
  try {
    const studioSettings = await getStudioSettings();
    if (studioSettings && Array.isArray(studioSettings.admin_email_configs)) {
      return studioSettings.admin_email_configs.filter((config: any) => config.isActive);
    }
    return [];
  } catch (error) {
    console.error('Error getting admin emails from database:', error);
    return [];
  }
};

const getLocationConfig = async () => {
  try {
    const studioSettings = await getStudioSettings();
    if (studioSettings && studioSettings.location_config) {
      console.log('Retrieved location config from database:', studioSettings.location_config);
      return studioSettings.location_config;
    }
    console.warn('No location config found in database, using defaults');
    return {
      includeInConfirmation: true,
      deliveryMethod: 'inline',
      fullAddress: '',
      displayAddress: 'Private Studio, Nashville TN',
      googleMapsLink: '',
      parkingInstructions: 'Free parking available on-site',
      accessInstructions: 'Please ring doorbell upon arrival',
      separateEmailSubject: 'Studio Address & Directions - Your Appointment {{appointment_date}}',
      separateEmailDelay: 24
    };
  } catch (error) {
    console.error('Error getting location config from database:', error);
    return {
      includeInConfirmation: true,
      deliveryMethod: 'inline',
      fullAddress: '',
      displayAddress: 'Private Studio, Nashville TN',
      googleMapsLink: '',
      parkingInstructions: 'Free parking available on-site',
      accessInstructions: 'Please ring doorbell upon arrival',
      separateEmailSubject: 'Studio Address & Directions - Your Appointment {{appointment_date}}',
      separateEmailDelay: 24
    };
  }
};
export const sendBookingEmail = async (emailData: BookingEmailData) => {
  try {
    console.log('Sending email with data:', emailData);

    // Get all active admin emails from database
    const activeAdminEmails = await getAllActiveAdminEmails();
    const primaryEmail = activeAdminEmails.find((config: any) => config.isPrimary);
    const fallbackEmail = emailData.adminEmail || primaryEmail?.email || activeAdminEmails[0]?.email || 'alerttradingvieww@gmail.com';

    // Get location configuration from database
    const locationConfig = await getLocationConfig();
    console.log('Email service using location config from database:', locationConfig);

    // Get studio configuration from database
    const studioSettings = await getStudioSettings();
    const studioConfig = studioSettings ? {
      studioName: studioSettings.studio_name,
      studioPhone: studioSettings.studio_phone,
      studioEmail: studioSettings.studio_email,
      websiteUrl: studioSettings.website_url
    } : {};
    
    // Send to client first (for confirmation, reminder emails)
    if (emailData.type !== 'admin-notification') {
      const requestBody = {
        ...emailData,
        adminEmail: fallbackEmail,
        locationConfig: locationConfig,
        studioConfig: studioConfig
      };
      
      console.log('Request body being sent to edge function:', JSON.stringify(requestBody, null, 2));
      
      const clientResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!clientResponse.ok) {
        const errorText = await clientResponse.text();
        console.error('Error sending client email:', errorText);
        throw new Error(`Failed to send client email: ${errorText}`);
      }
      
      console.log('Client email sent successfully with location config');
    }

    // Send admin notifications to all active emails with delay
    if (emailData.type === 'confirmation' || emailData.type === 'admin-notification') {
      const emailsToNotify = activeAdminEmails.length > 0 ? activeAdminEmails : [{ email: fallbackEmail, name: 'Admin' }];
      const results = [];
      
      for (let i = 0; i < emailsToNotify.length; i++) {
        const adminConfig = emailsToNotify[i];
        
        try {
          // Add delay between emails (except for the first one)
          if (i > 0) {
            console.log(`Waiting 5 seconds before sending to ${adminConfig.email}...`);
            await delay(5000);
          }
          
          const adminResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'admin-notification',
              booking: emailData.booking,
              adminEmail: adminConfig.email,
              locationConfig: locationConfig,
              studioConfig: studioConfig
            }),
          });

          if (adminResponse.ok) {
            const result = await adminResponse.json();
            results.push({ email: adminConfig.email, status: 'success', result });
            console.log(`Admin notification sent successfully to: ${adminConfig.email}`);
          } else {
            const errorText = await adminResponse.text();
            results.push({ email: adminConfig.email, status: 'failed', error: errorText });
            console.error(`Failed to send admin notification to ${adminConfig.email}:`, errorText);
          }
        } catch (error) {
          results.push({ email: adminConfig.email, status: 'failed', error: error.message });
          console.error(`Error sending to ${adminConfig.email}:`, error);
        }
      }
      
      console.log('Admin notification results:', results);
      return { success: true, adminNotifications: results };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

export const calculateTimeUntilAppointment = (appointmentDate: string, appointmentTime: string) => {
  const appointmentDateTime = new Date(`${appointmentDate}T${convertTo24Hour(appointmentTime)}`);
  const now = new Date();
  const timeDiff = appointmentDateTime.getTime() - now.getTime();
  
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    totalHours: hours,
    totalMinutes: Math.floor(timeDiff / (1000 * 60)),
    hours,
    minutes,
    isPast: timeDiff < 0,
    isWithin24Hours: timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000,
    isWithin1Hour: timeDiff > 0 && timeDiff <= 60 * 60 * 1000,
  };
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

export const getReminderButtonText = (appointmentDate: string, appointmentTime: string) => {
  const timeInfo = calculateTimeUntilAppointment(appointmentDate, appointmentTime);
  
  if (timeInfo.isPast) {
    return { text: 'Appointment Passed', disabled: true, variant: 'secondary' as const };
  }
  
  if (timeInfo.isWithin1Hour) {
    return { text: 'Send 1-Hour Reminder', disabled: false, variant: 'destructive' as const };
  }
  
  if (timeInfo.isWithin24Hours) {
    return { text: 'Send 24-Hour Reminder', disabled: false, variant: 'default' as const };
  }
  
  if (timeInfo.totalHours > 24) {
    return { text: `Send Reminder (${timeInfo.totalHours}h early)`, disabled: false, variant: 'outline' as const };
  }
  
  return { text: 'Send Reminder', disabled: false, variant: 'outline' as const };
};