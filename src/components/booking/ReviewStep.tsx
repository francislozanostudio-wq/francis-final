import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, Clock, User, DollarSign, Edit3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BookingData } from './MultiStepBookingForm';
import { useTranslations } from '@/lib/translations';

interface ReviewStepProps {
  bookingData: BookingData;
  onConfirm: () => void;
  onPrev: () => void;
  onEdit: (step: number) => void;
  isSubmitting?: boolean;
}

export function ReviewStep({ bookingData, onConfirm, onPrev, onEdit, isSubmitting = false }: ReviewStepProps) {
  const { service, selectedAddOns, date, time, clientInfo } = bookingData;
  const { t, language, translateByText } = useTranslations();
  
  if (!service || !date || !time || !clientInfo || !clientInfo.fullName || !clientInfo.email || !clientInfo.phone) {
    return <div>Incomplete booking data</div>;
  }

  // Calculate totals
  const addOnsTotal = (selectedAddOns || []).reduce((sum, addOn) => sum + addOn.price, 0);
  const grandTotal = service.price + addOnsTotal;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
          {t('booking.review_booking', 'Review Your Booking')}
        </h2>
        <p className="text-muted-foreground">
          Please review all details before confirming your appointment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Details */}
        <Card className="bg-card border-border hover-lift transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <CalendarIcon className="mr-2 text-accent" size={20} />
                {t('booking.service_details', 'Service Details')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(1)}
                className="text-accent hover:text-accent-foreground hover:bg-accent/10"
              >
                <Edit3 size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-card-foreground">{translateByText(service.name)}</p>
              <p className="text-sm text-muted-foreground">Duration: {service.duration} minutes</p>
            </div>
            <div className="flex items-center text-accent">
              <DollarSign size={16} className="mr-1" />
              <span className="font-semibold">${service.price}</span>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="bg-card border-border hover-lift transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="mr-2 text-accent" size={20} />
                {t('booking.date_time', 'Date & Time')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(2)}
                className="text-accent hover:text-accent-foreground hover:bg-accent/10"
              >
                <Edit3 size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-card-foreground">
                {format(date, "PPPP")}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(date, "EEEE")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-accent">{time}</p>
              <p className="text-sm text-muted-foreground">
                Estimated end: {/* Calculate end time based on duration */}
                {format(
                  new Date(date.getTime() + service.duration * 60000), 
                  "h:mm a"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card className="bg-card border-border hover-lift transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <User className="mr-2 text-accent" size={20} />
                {t('booking.your_information', 'Your Information')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(4)}
                className="text-accent hover:text-accent-foreground hover:bg-accent/10"
              >
                <Edit3 size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-card-foreground">{clientInfo.fullName}</p>
              <p className="text-sm text-muted-foreground">{clientInfo.email}</p>
              <p className="text-sm text-muted-foreground">{clientInfo.phone}</p>
            </div>
            {clientInfo.notes && (
              <div>
                <p className="text-xs font-medium text-card-foreground mb-1">Notes:</p>
                <p className="text-sm text-muted-foreground italic">{clientInfo.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add-Ons Section */}
      {selectedAddOns && selectedAddOns.length > 0 && (
        <Card className="bg-accent/5 border-accent/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center">
                <DollarSign className="mr-2 text-accent" size={20} />
                Selected Add-Ons
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(2)}
                className="text-accent hover:text-accent-foreground hover:bg-accent/10"
              >
                <Edit3 size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedAddOns.map((addOn) => (
                <div key={addOn.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-card-foreground">{translateByText(addOn.name)}</p>
                    {addOn.description && (
                      <p className="text-xs text-muted-foreground">{translateByText(addOn.description)}</p>
                    )}
                  </div>
                  <span className="font-semibold text-accent">+${addOn.price}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      <Card className="bg-card border-accent/20 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <CalendarIcon className="mr-2 text-accent" size={24} />
            {t('booking.booking_summary', 'Booking Summary')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-card-foreground">Service:</span>
            <span className="font-semibold">${service.price}</span>
          </div>
          
          {selectedAddOns && selectedAddOns.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-card-foreground">Add-Ons ({selectedAddOns.length}):</span>
              <span className="font-semibold">+${addOnsTotal.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-card-foreground">Duration:</span>
            <span className="font-semibold">{service.duration} minutes</span>
          </div>
          
          <Separator className="bg-border" />
          
          <div className="flex justify-between items-center text-lg">
            <span className="font-bold text-card-foreground">Total Amount:</span>
            <span className="font-bold text-accent text-2xl">${grandTotal.toFixed(2)}</span>
          </div>
          
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Payment:</strong> Full payment due at appointment. Cash, Venmo, Zelle, or major credit cards accepted.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h4 className="font-medium text-card-foreground mb-3">Important Booking Information:</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Cancellations require 48-hour advance notice</li>
            <li>• Please arrive 5 minutes early for check-in</li>
            <li>• You'll receive confirmation via email and text message</li>
            <li>• Studio address will be provided in your confirmation</li>
            <li>• Payment is due at the time of service</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button 
          variant="outline" 
          onClick={onPrev}
          className="border-muted-foreground text-muted-foreground hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Information
        </Button>
        
        <Button 
          onClick={onConfirm}
          size="lg"
          disabled={isSubmitting}
          className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold hover-scale px-8"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-luxury-black mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2" size={20} />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
