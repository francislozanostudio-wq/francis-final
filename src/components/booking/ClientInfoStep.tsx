import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from '@/lib/translations';

const FormSchema = z.object({
  fullName: z.string().min(2, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

interface ClientInfoStepProps {
  clientInfo?: Partial<FormData>;
  onClientInfoSubmit: (data: FormData) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ClientInfoStep({ clientInfo, onClientInfoSubmit, onNext, onPrev }: ClientInfoStepProps) {
  const { t, language } = useTranslations();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: clientInfo?.fullName || '',
      email: clientInfo?.email || '',
      phone: clientInfo?.phone || '',
      notes: clientInfo?.notes || '',
    },
  });

  function onSubmit(data: FormData) {
    onClientInfoSubmit(data);
    onNext();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <User size={24} className="text-luxury-black" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
          {t('form.your_information', 'Your Information')}
        </h2>
        <p className="text-muted-foreground">
          Please provide your contact details for appointment confirmation
        </p>
      </div>

      <Card className="max-w-2xl mx-auto bg-card border-border">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <FormLabel className="text-card-foreground font-medium">{t('form.full_name', 'Full Name')} *</FormLabel>
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
                    <FormLabel className="text-card-foreground font-medium">{t('form.email', 'Email Address')} *</FormLabel>
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
                    <FormLabel className="text-card-foreground font-medium">{t('form.phone', 'Phone Number')} *</FormLabel>
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

              {/* Notes Field */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <FormLabel className="text-card-foreground font-medium">{t('form.special_requests', 'Special Requests or Notes')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special requests, allergies, or notes for your appointment..."
                        className="bg-background/80 border-input hover:border-accent transition-all duration-200 focus:bg-background min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Important Information */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <h4 className="font-medium text-card-foreground mb-2">Before Your Appointment:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Please arrive with clean, polish-free nails</li>
                  <li>• Bring inspiration photos if you have specific designs in mind</li>
                  <li>• Payment is due at the time of your appointment</li>
                  <li>• You'll receive confirmation details via email and text</li>
                </ul>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onPrev}
                  className="border-muted-foreground text-muted-foreground hover:border-accent hover:text-accent"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Back to Date & Time
                </Button>
                
                <Button 
                  type="submit"
                  className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold hover-scale"
                >
                  Review Booking
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}