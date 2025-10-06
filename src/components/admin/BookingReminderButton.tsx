import { useState } from 'react';
import { Clock, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendBookingEmail, getReminderButtonText, calculateTimeUntilAppointment } from '@/lib/emailService';

interface BookingReminderButtonProps {
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
    status: string;
    selected_add_ons?: any[];
    add_ons_total?: number;
  };
  adminEmail?: string;
}

export function BookingReminderButton({ booking, adminEmail }: BookingReminderButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const timeInfo = calculateTimeUntilAppointment(booking.appointment_date, booking.appointment_time);
  const buttonConfig = getReminderButtonText(booking.appointment_date, booking.appointment_time);

  const handleSendReminder = async () => {
    if (booking.status !== 'confirmed') {
      toast({
        title: 'Cannot Send Reminder',
        description: 'Reminders can only be sent for confirmed appointments.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    
    try {
      let reminderType: 'reminder-24h' | 'reminder-1h' | 'reminder-custom';
      
      if (timeInfo.isWithin1Hour) {
        reminderType = 'reminder-1h';
      } else if (timeInfo.isWithin24Hours) {
        reminderType = 'reminder-24h';
      } else {
        reminderType = 'reminder-custom';
      }

      const emailData = {
        type: reminderType,
        booking: {
          id: booking.id,
          service_name: booking.service_name,
          service_price: booking.service_price,
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          client_name: booking.client_name,
          client_email: booking.client_email,
          client_phone: booking.client_phone,
          confirmation_number: booking.confirmation_number,
          notes: booking.notes,
          selected_add_ons: booking.selected_add_ons,
          add_ons_total: booking.add_ons_total,
        },
        hoursUntilAppointment: timeInfo.totalHours,
        adminEmail: adminEmail || 'alerttradingvieww@gmail.com',
        locationConfig: JSON.parse(localStorage.getItem('location-config') || '{}'),
        studioConfig: JSON.parse(localStorage.getItem('studio-config') || '{}')
      };

      console.log('Sending reminder email with data:', emailData);
      await sendBookingEmail(emailData);

      const reminderLabel = reminderType === 'reminder-1h' 
        ? '1-hour' 
        : reminderType === 'reminder-24h' 
          ? '24-hour' 
          : `${timeInfo.totalHours}-hour`;

      toast({
        title: 'Reminder Sent!',
        description: `${reminderLabel} reminder sent (testing mode: check ${adminEmail || 'alerttradingvieww@gmail.com'})`,
      });

    } catch (error) {
      console.error('Failed to send reminder:', error);
      toast({
        title: 'Failed to Send Reminder',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      variant={buttonConfig.variant}
      size="sm"
      onClick={handleSendReminder}
      disabled={buttonConfig.disabled || isSending || booking.status !== 'confirmed'}
      className="w-full"
    >
      {isSending ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2" size={14} />
          {buttonConfig.text}
        </>
      )}
    </Button>
  );
}