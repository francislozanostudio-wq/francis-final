import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslations } from '@/lib/translations';

const timeSlots = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  // 1:00 PM - 2:00 PM is lunch break (excluded)
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

// Simulate some booked slots for realistic demo
const bookedSlots: Record<string, string[]> = {
  [format(new Date(2024, 11, 15), 'yyyy-MM-dd')]: ['10:00 AM', '2:00 PM'],
  [format(new Date(2024, 11, 16), 'yyyy-MM-dd')]: ['11:00 AM', '3:00 PM', '4:00 PM'],
  [format(new Date(2024, 11, 17), 'yyyy-MM-dd')]: ['9:00 AM', '1:00 PM'],
};

interface DateTimeStepProps {
  selectedDate?: Date;
  selectedTime?: string;
  serviceDuration: number;
  onDateTimeSelect: (date: Date, time: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DateTimeStep({ 
  selectedDate, 
  selectedTime, 
  serviceDuration,
  onDateTimeSelect, 
  onNext, 
  onPrev 
}: DateTimeStepProps) {
  const [tempDate, setTempDate] = useState<Date | undefined>(selectedDate);
  const [tempTime, setTempTime] = useState<string | undefined>(selectedTime);
  const { t, language } = useTranslations();

  // Disable past dates and Sundays (0)
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    return date < today || dayOfWeek === 0; // Only disable Sundays
  };

  const getAvailableSlots = (date: Date | undefined) => {
    if (!date) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const booked = bookedSlots[dateStr] || [];
    
    return timeSlots.map(slot => ({
      time: slot,
      isBooked: booked.includes(slot),
      isAvailable: !booked.includes(slot)
    }));
  };

  const handleTimeSelect = (time: string) => {
    if (!tempDate) return;
    setTempTime(time);
    onDateTimeSelect(tempDate, time);
  };

  const canProceed = tempDate && tempTime;
  const availableSlots = getAvailableSlots(tempDate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
          {t('booking.pick_time', 'Choose Date & Time')}
        </h2>
        <p className="text-muted-foreground">
          Select your preferred appointment date and time. Available Monday to Saturday, 7:00 AM - 5:00 PM (Lunch: 1:00 PM - 2:00 PM)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Selection */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="font-heading text-xl font-semibold text-card-foreground mb-4">
              Select Date
            </h3>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mb-4 bg-background/80 border-input hover:border-accent",
                    !tempDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tempDate ? format(tempDate, "PPPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border-border shadow-elegant z-50" align="start">
                <Calendar
                  mode="single"
                  selected={tempDate}
                  onSelect={(date) => {
                    setTempDate(date);
                    setTempTime(undefined); // Reset time when date changes
                  }}
                  disabled={isDateDisabled}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Studio closed on Sundays</p>
              <p>• Hours: 7:00 AM - 5:00 PM (Mon-Sat)</p>
              <p>• Lunch break: 1:00 PM - 2:00 PM</p>
              <p>• Service duration: {serviceDuration} minutes</p>
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <h3 className="font-heading text-xl font-semibold text-card-foreground mb-4">
              Available Times
            </h3>
            
            {!tempDate ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock size={48} className="mx-auto mb-3 opacity-50" />
                <p>Please select a date first</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={slot.time}
                    variant={tempTime === slot.time ? "default" : "outline"}
                    disabled={!slot.isAvailable}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={cn(
                      "transition-all duration-200 animate-fade-in",
                      tempTime === slot.time && "bg-gradient-gold text-luxury-black hover:bg-gradient-gold/90",
                      !slot.isAvailable && "opacity-50 cursor-not-allowed",
                      slot.isAvailable && tempTime !== slot.time && "hover:border-accent hover:text-accent"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Clock size={14} className="mr-2" />
                    {slot.time}
                    {!slot.isAvailable && (
                      <span className="ml-2 text-xs">(Booked)</span>
                    )}
                  </Button>
                ))}
              </div>
            )}
            
            {tempDate && (
              <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Showing availability for {format(tempDate, "PPPP")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button 
          variant="outline" 
          onClick={onPrev}
          className="border-muted-foreground text-muted-foreground hover:border-accent hover:text-accent"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Services
        </Button>
        
        {canProceed && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 flex-1 mx-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-card-foreground">
                  {format(tempDate!, "PPPP")} at {tempTime}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {serviceDuration} minutes
                </p>
              </div>
              <Button 
                onClick={onNext}
                className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold hover-scale"
              >
                Continue
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}