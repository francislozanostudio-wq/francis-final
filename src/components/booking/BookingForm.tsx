import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

// Demo service data
const services = [
  { id: 'classic-mani', name: 'Classic Manicure', price: 45, duration: 60 },
  { id: 'classic-pedi', name: 'Classic Pedicure', price: 55, duration: 75 },
  { id: 'gel-mani', name: 'Gel Manicure', price: 65, duration: 90 },
  { id: 'gel-x', name: 'Gel-X Full Set', price: 85, duration: 120 },
  { id: 'acrylic', name: 'Acrylic Full Set', price: 80, duration: 120 },
  { id: 'nail-art-simple', name: 'Simple Nail Art', price: 15, duration: 30 },
  { id: 'nail-art-detailed', name: 'Detailed Nail Art', price: 35, duration: 60 },
  { id: 'nail-art-intricate', name: 'Intricate Nail Art', price: 55, duration: 90 },
];

// Available time slots
const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

const FormSchema = z.object({
  fullName: z.string().min(2, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  service: z.string({ required_error: 'Please select a service.' }),
  date: z.date({ required_error: 'Please select a date.' }),
  time: z.string({ required_error: 'Please select a time.' }),
});

export function BookingForm() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const service = services.find(s => s.id === data.service);
    const depositAmount = service ? service.price * 0.5 : 0;
    
    toast({
      title: 'Booking Request Submitted!',
      description: `Your appointment request for ${service?.name} on ${format(data.date, 'PPP')} at ${data.time} has been received. Deposit required: $${depositAmount}`,
    });

    // Here you would typically send the data to your backend
    console.log('Booking data:', data);
  }

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service || null);
  };

  // Disable past dates and Sundays
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  return (
    <div className="animate-fade-in">
      <Card className="w-full max-w-2xl mx-auto bg-gradient-subtle border-border/50 shadow-elegant hover-scale backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CalendarIcon size={24} className="text-luxury-black" />
          </div>
          <CardTitle className="font-heading text-3xl text-card-foreground mb-2">
            Book Your Appointment
          </CardTitle>
          <p className="text-muted-foreground">
            Fill out the form below and we'll confirm your appointment details
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <FormLabel className="text-card-foreground font-medium">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field} 
                        className="bg-background/80 border-input hover:border-accent transition-all duration-200 focus:bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <FormLabel className="text-card-foreground font-medium">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com" 
                        {...field} 
                        className="bg-background/80 border-input hover:border-accent transition-all duration-200 focus:bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <FormLabel className="text-card-foreground font-medium">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="+1 737-378-5755" 
                        {...field} 
                        className="bg-background/80 border-input hover:border-accent transition-all duration-200 focus:bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Service Selection */}
              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <FormLabel className="text-card-foreground font-medium">Select Service</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleServiceChange(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background/80 border-input hover:border-accent transition-all duration-200">
                          <SelectValue placeholder="Choose your service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-sm border-border shadow-elegant z-50">
                        {services.map((service) => (
                          <SelectItem 
                            key={service.id} 
                            value={service.id}
                            className="hover:bg-accent/10 cursor-pointer transition-colors duration-200"
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium">{service.name}</span>
                              <span className="ml-4 text-muted-foreground">
                                ${service.price} ({service.duration}min)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedService && (
                      <div className="mt-2 p-3 bg-accent/5 rounded-md border border-accent/20 animate-scale-in">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-accent">Deposit required:</span> ${(selectedService.price * 0.5).toFixed(0)} 
                          (50% of service cost)
                        </p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <FormLabel className="text-card-foreground font-medium">Preferred Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-background/80 border-input hover:border-accent transition-all duration-200",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background/95 backdrop-blur-sm border-border shadow-elegant z-50" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={isDateDisabled}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-sm text-muted-foreground">
                      Studio is closed on Sundays
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Selection */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <FormLabel className="text-card-foreground font-medium">Preferred Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/80 border-input hover:border-accent transition-all duration-200">
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-sm border-border shadow-elegant z-50">
                        {timeSlots.map((time) => (
                          <SelectItem 
                            key={time} 
                            value={time}
                            className="hover:bg-accent/10 cursor-pointer transition-colors duration-200"
                          >
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-accent" />
                              <span className="font-medium">{time}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-4 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold hover-scale transition-all duration-300 shadow-lg"
                >
                  <CalendarIcon className="mr-2" size={20} />
                  Request Appointment
                </Button>
                
                <p className="text-sm text-muted-foreground text-center mt-4">
                  You'll receive a confirmation email with appointment details. Payment is due at the time of service.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}