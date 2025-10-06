import { format } from 'date-fns';
import { CheckCircle, CalendarIcon, Clock, MapPin, Phone, Mail, CreditCard, ArrowRight, Download, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { generateBookingPDF } from '@/lib/pdfGenerator';
import { useState, useEffect } from 'react';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import type { BookingData } from './MultiStepBookingForm';
import { useTranslations } from '@/lib/translations';

interface ConfirmationStepProps {
  bookingData: BookingData;
  onNewBooking: () => void;
}

export function ConfirmationStep({ bookingData, onNewBooking }: ConfirmationStepProps) {
  const { service, date, time, clientInfo, confirmationNumber } = bookingData;
  const { t, language, translateByText } = useTranslations();
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);

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
  
  if (!service || !date || !time || !clientInfo || !clientInfo.fullName || !clientInfo.email || !clientInfo.phone || !confirmationNumber) {
    return <div>Incomplete booking data</div>;
  }

  const studioName = studioSettings?.studio_name || 'Francis Lozano Studio';
  const studioPhone = studioSettings?.studio_phone || '(+1 737-378-5755';
  const studioEmail = studioSettings?.studio_email || 'francislozanostudio@gmail.com';

  const handleDownloadPDF = async () => {
    try {
      await generateBookingPDF(bookingData);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-center">
      {/* Success Icon */}
      <div className="animate-scale-in">
        <div className="w-24 h-24 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
          <CheckCircle size={48} className="text-white" />
        </div>
        <h2 className="font-heading text-4xl font-bold text-foreground mb-2">
          {t('success.booking_confirmed', 'Booking Confirmed!')}
        </h2>
        <p className="text-xl text-muted-foreground">
          Your appointment has been successfully scheduled
        </p>
      </div>

      {/* Confirmation Details */}
      <Card className="max-w-2xl mx-auto bg-card border-accent/20 shadow-elegant">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-card-foreground">
            {t('booking.confirmation_number', 'Confirmation')} #{confirmationNumber}
          </CardTitle>
          <p className="text-muted-foreground">
            Keep this number for your records
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CalendarIcon className="text-accent mt-1" size={20} />
                <div>
                  <p className="font-semibold text-card-foreground">{translateByText(service.name)}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(date, "PPPP")} at {time}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {service.duration} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="text-accent mt-1" size={20} />
                <div>
                  <p className="font-semibold text-card-foreground">{studioName}</p>
                  <p className="text-sm text-muted-foreground">
                    Private Studio, Nashville TN
                  </p>
                  <p className="text-xs text-muted-foreground">
                    *Address details sent via email
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="text-accent mt-1" size={20} />
                <div>
                  <p className="font-semibold text-card-foreground">Service Details</p>
                  <p className="text-sm text-muted-foreground">
                    Service: ${service.price}
                  </p>
                  {bookingData.selectedAddOns && bookingData.selectedAddOns.length > 0 && (
                    <>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add-ons: +${bookingData.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0).toFixed(2)}
                      </p>
                      <p className="text-sm font-bold text-accent mt-1">
                        Total: ${(service.price + bookingData.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0)).toFixed(2)}
                      </p>
                    </>
                  )}
                  {(!bookingData.selectedAddOns || bookingData.selectedAddOns.length === 0) && (
                    <p className="text-sm font-bold text-accent mt-1">
                      Total: ${service.price}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment due at appointment
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="text-accent mt-1" size={20} />
                <div>
                  <p className="font-semibold text-card-foreground">Confirmations Sent</p>
                  <p className="text-sm text-muted-foreground">{clientInfo.email}</p>
                  <p className="text-sm text-muted-foreground">{clientInfo.phone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Selected Add-Ons if any */}
          {bookingData.selectedAddOns && bookingData.selectedAddOns.length > 0 && (
            <>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <h4 className="font-semibold text-card-foreground mb-3 flex items-center">
                  <Plus className="mr-2 text-accent" size={18} />
                  Selected Add-Ons ({bookingData.selectedAddOns.length})
                </h4>
                <div className="space-y-2">
                  {bookingData.selectedAddOns.map((addOn) => (
                    <div key={addOn.id} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{translateByText(addOn.name)}</span>
                      <span className="font-medium text-accent">+${addOn.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="bg-border" />
            </>
          )}

          {/* Next Steps */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <h4 className="font-semibold text-card-foreground mb-3 flex items-center">
              <Clock className="mr-2 text-accent" size={18} />
              What's Next?
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Confirmation email sent with studio address and preparation instructions</p>
              <p>✓ Calendar invitation with appointment details</p>
              <p>✓ Text reminder 24 hours before your appointment</p>
              <p>✓ Text reminder 2 hours before your appointment</p>
            </div>
          </div>

          {/* Preparation Instructions */}
          <div className="text-left">
            <h4 className="font-semibold text-card-foreground mb-3">Preparation for Your Visit:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Please arrive with clean, polish-free nails</li>
              <li>• Bring inspiration photos if you have specific designs</li>
              <li>• Arrive 5 minutes early for check-in</li>
              <li>• Bring your preferred payment method for the full service amount</li>
              <li>• Reschedule if you're feeling unwell (48hr notice required)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="max-w-md mx-auto bg-card border-border">
        <CardContent className="p-6 text-center">
          <h4 className="font-semibold text-card-foreground mb-3">Need to Make Changes?</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <Phone size={14} />
              <span>{studioPhone}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Mail size={14} />
              <span>{studioEmail}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            48-hour notice required for changes
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleDownloadPDF}
            size="lg"
            className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold hover-scale"
          >
            <Download className="mr-2" size={20} />
            Download Confirmation PDF
          </Button>
          
          <Button 
            onClick={onNewBooking}
            variant="outline"
            size="lg"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="mr-2" size={20} />
            Book Another Appointment
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Thank you for choosing {studioName}!<br />
          I can't wait to create something beautiful for you.
        </p>
      </div>
    </div>
  );
}