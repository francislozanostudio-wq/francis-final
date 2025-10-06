import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { sendBookingEmail } from '@/lib/emailService';
import { getStudioSettings } from '@/lib/studioService';
import { useEffect } from 'react';
import { subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { Card, CardContent } from '@/components/ui/card';
import { BookingProgress } from './BookingProgress';
import { ServiceSelectionStep, Service } from './ServiceSelectionStep';
import { AddOnSelectionStep, AddOn } from './AddOnSelectionStep';
import { DateTimeStep } from './DateTimeStep';
import { ClientInfoStep } from './ClientInfoStep';
import { ReviewStep } from './ReviewStep';
import { ConfirmationStep } from './ConfirmationStep';

export interface BookingData {
  service?: Service;
  selectedAddOns?: AddOn[];
  date?: Date;
  time?: string;
  clientInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };
  confirmationNumber?: string;
}

export function MultiStepBookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({ selectedAddOns: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial studio settings
    const loadStudioSettings = async () => {
      const settings = await getStudioSettings();
      setStudioSettings(settings);
    };
    loadStudioSettings();

    // Set up real-time subscription
    const subscription = subscribeToStudioSettings((settings) => {
      setStudioSettings(settings);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const submitBooking = async () => {
    if (!bookingData.service || !bookingData.date || !bookingData.time || !bookingData.clientInfo) {
      toast({
        title: 'Error',
        description: 'Missing required booking information',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const confirmationNumber = 'FNA-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Calculate add-ons total
      const addOnsTotal = (bookingData.selectedAddOns || []).reduce((sum, addOn) => sum + addOn.price, 0);
      
      // Prepare add-ons data for storage
      const selectedAddOnsData = (bookingData.selectedAddOns || []).map(addOn => ({
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
        description: addOn.description
      }));
      
      // Insert booking into Supabase
      const { error } = await supabase
        .from('bookings')
        .insert({
          service_name: bookingData.service.name,
          service_price: bookingData.service.price,
          appointment_date: bookingData.date.toISOString().split('T')[0],
          appointment_time: bookingData.time,
          client_name: bookingData.clientInfo.fullName!,
          client_email: bookingData.clientInfo.email!,
          client_phone: bookingData.clientInfo.phone!,
          status: 'confirmed',
          notes: bookingData.clientInfo.notes || null,
          confirmation_number: confirmationNumber,
          selected_add_ons: selectedAddOnsData,
          add_ons_total: addOnsTotal,
        });

      if (error) {
        console.error('Booking submission error:', error);
        toast({
          title: 'Booking Failed',
          description: `There was an error submitting your booking: ${error.message}. Please try again.`,
          variant: 'destructive',
        });
        return;
      }

      // Update booking data with confirmation number
      updateBookingData({ confirmationNumber });
      
      toast({
        title: 'Booking Confirmed!',
        description: `Your appointment has been scheduled. Confirmation #${confirmationNumber}`,
      });
      
      // Send confirmation email to client and admin notification
      try {
        // Get location configuration from localStorage
        const locationConfigStr = localStorage.getItem('location-config');
        const locationConfig = locationConfigStr ? JSON.parse(locationConfigStr) : {
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
        
        console.log('Location config being sent:', locationConfig);
        
        // Get studio configuration from database
        const studioSettings = await getStudioSettings();
        const studioConfig = studioSettings ? {
          studioName: studioSettings.studio_name,
          studioPhone: studioSettings.studio_phone,
          studioEmail: studioSettings.studio_email,
          websiteUrl: studioSettings.website_url
        } : {};
        
        // Calculate totals
        const addOnsTotal = (bookingData.selectedAddOns || []).reduce((sum, addOn) => sum + addOn.price, 0);
        
        // Send client confirmation email
        await sendBookingEmail({
          type: 'confirmation',
          booking: {
            id: 'temp-id', // Will be replaced with actual ID from database
            service_name: bookingData.service.name,
            service_price: bookingData.service.price,
            appointment_date: bookingData.date.toISOString().split('T')[0],
            appointment_time: bookingData.time,
            client_name: bookingData.clientInfo.fullName!,
            client_email: bookingData.clientInfo.email!,
            client_phone: bookingData.clientInfo.phone!,
            confirmation_number: confirmationNumber,
            notes: bookingData.clientInfo.notes,
            selected_add_ons: bookingData.selectedAddOns || [],
            add_ons_total: addOnsTotal,
          },
          locationConfig: locationConfig,
          studioConfig: studioConfig
        });
        
        console.log('Confirmation email sent with location config:', locationConfig);
        
        // Send admin notifications to all active emails with delay
        const adminEmailConfigs = JSON.parse(localStorage.getItem('admin-email-configs') || '[]');
        const activeAdminEmails = adminEmailConfigs.filter((config: any) => config.isActive);
        const emailsToNotify = activeAdminEmails.length > 0 ? activeAdminEmails : [{ email: 'alerttradingvieww@gmail.com', name: 'Admin' }];
        
        for (let i = 0; i < emailsToNotify.length; i++) {
          const adminConfig = emailsToNotify[i];
          
          try {
            // Add delay between emails (except for the first one)
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
            
            await sendBookingEmail({
              type: 'admin-notification',
              booking: {
                id: 'temp-id',
                service_name: bookingData.service.name,
                service_price: bookingData.service.price,
                appointment_date: bookingData.date.toISOString().split('T')[0],
                appointment_time: bookingData.time,
                client_name: bookingData.clientInfo.fullName!,
                client_email: bookingData.clientInfo.email!,
                client_phone: bookingData.clientInfo.phone!,
                confirmation_number: confirmationNumber,
                notes: bookingData.clientInfo.notes,
                selected_add_ons: bookingData.selectedAddOns || [],
                add_ons_total: addOnsTotal,
              },
              adminEmail: adminConfig.email,
              locationConfig: locationConfig,
              studioConfig: studioConfig
            });
            
            console.log(`Admin notification sent to: ${adminConfig.email}`);
          } catch (adminEmailError) {
            console.error(`Failed to send admin notification to ${adminConfig.email}:`, adminEmailError);
            // Continue with other emails even if one fails
          }
        }
        
        console.log('Confirmation emails sent successfully');
      } catch (emailError) {
        console.error('Failed to send confirmation emails:', emailError);
        // Don't fail the booking if email fails
        toast({
          title: 'Booking Confirmed',
          description: 'Your booking was confirmed, but there was an issue sending the confirmation email. Please contact us if you need assistance.',
          variant: 'destructive',
        });
      }
      
      nextStep();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelectionStep
            selectedService={bookingData.service}
            onServiceSelect={(service) => updateBookingData({ service })}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <AddOnSelectionStep
            selectedAddOns={bookingData.selectedAddOns || []}
            onAddOnsSelect={(selectedAddOns) => updateBookingData({ selectedAddOns })}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={nextStep}
          />
        );
      case 3:
        return (
          <DateTimeStep
            selectedDate={bookingData.date}
            selectedTime={bookingData.time}
            serviceDuration={bookingData.service?.duration || 60}
            onDateTimeSelect={(date, time) => updateBookingData({ date, time })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <ClientInfoStep
            clientInfo={bookingData.clientInfo}
            onClientInfoSubmit={(clientInfo) => updateBookingData({ clientInfo })}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <ReviewStep
            bookingData={bookingData}
            onConfirm={submitBooking}
            onPrev={prevStep}
            onEdit={goToStep}
            isSubmitting={isSubmitting}
          />
        );
      case 6:
        return (
          <ConfirmationStep
            bookingData={bookingData}
            onNewBooking={() => {
              setCurrentStep(1);
              setBookingData({ selectedAddOns: [] });
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <Card className="w-full max-w-4xl mx-auto bg-card border-border/50 shadow-elegant backdrop-blur-sm">
        <CardContent className="p-8">
          <BookingProgress currentStep={currentStep} totalSteps={6} />
          <div className="mt-8">
            {renderStep()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
