import { MapPin, Phone, Mail, Instagram, Clock, MessageCircle } from 'lucide-react';
import { SiTiktok } from 'react-icons/si'; // TikTok brand icon
import type { LucideProps } from 'lucide-react';

// Adapter component so react-icons matches the expected signature of lucide icons
const TikTokIcon = (props: LucideProps) => {
  const { size = 24, color = 'currentColor', className, ...rest } = props;
  return <SiTiktok size={size} color={color} className={className} {...rest} />;
};
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations, t as translate } from '@/lib/translations';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const { toast } = useToast();
  const { t, language, translateByText } = useTranslations();

  // Create schema with translations inside component
  const ContactFormSchema = z.object({
    firstName: z.string().min(2, { message: t('contact.validation.first_name_min', 'First name must be at least 2 characters.') }),
    lastName: z.string().min(2, { message: t('contact.validation.last_name_min', 'Last name must be at least 2 characters.') }),
    email: z.string().email({ message: t('contact.validation.email_valid', 'Please enter a valid email address.') }),
    phone: z.string().optional(),
    inquiryType: z.string().min(1, { message: t('contact.validation.inquiry_type_required', 'Please select an inquiry type.') }),
    subject: z.string().min(5, { message: t('contact.validation.subject_min', 'Subject must be at least 5 characters.') }),
    message: z.string().min(10, { message: t('contact.validation.message_min', 'Message must be at least 10 characters.') }),
  });

  type ContactFormData = z.infer<typeof ContactFormSchema>;

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

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      inquiryType: '',
      subject: '',
      message: '',
    },
  });

  const contactMethods = [
    {
      icon: Phone,
      title: t('contact.method.call_text', 'Call or Text'),
      details: studioSettings?.studio_phone || '(+1 737-378-5755',
      description: t('contact.method.call_description', 'Quickest way to reach me for urgent questions or booking'),
      action: `tel:${(studioSettings?.studio_phone || '(+1 737-378-5755').replace(/\D/g, '')}`
    },
    {
      icon: Mail,
      title: t('contact.method.email', 'Email'),
      details: studioSettings?.studio_email || 'francislozanostudio@gmail.com',
      description: t('contact.method.email_description', 'Best for detailed inquiries, custom design consultations'),
      action: `mailto:${studioSettings?.studio_email || 'francislozanostudio@gmail.com'}`
    },
    {
      icon: Instagram,
      title: t('contact.method.instagram', 'Instagram DM'),
      details: '@francis_lozano_studio',
      description: t('contact.method.instagram_description', 'Follow for daily inspiration and behind-the-scenes content'),
      action: 'https://instagram.com/francis_lozano_studio'
    },
    {
  icon: TikTokIcon,
      title: t('contact.method.tiktok', 'TikTok'),
      details: '@francislozanostudio',
      description: t('contact.method.tiktok_description', 'Follow for creative nail art videos and tutorials'),
      action: 'https://www.tiktok.com/@francislozanostudio'
    },
    {
      icon: MessageCircle,
      title: t('contact.method.whatsapp', 'WhatsApp'),
      details: studioSettings?.studio_phone || '(+1 737-378-5755',
      description: t('contact.method.whatsapp_description', 'Quick questions, appointment confirmations, or last-minute changes'),
      action: 'https://wa.me/qr/I3MGCHO4PKPIN1'
    }
  ];

  const businessHours = [
    { day: t('contact.days.monday', 'Monday'), hours: '7:00 AM - 5:00 PM' },
    { day: t('contact.days.tuesday', 'Tuesday'), hours: '7:00 AM - 5:00 PM' },
    { day: t('contact.days.wednesday', 'Wednesday'), hours: '7:00 AM - 5:00 PM' },
    { day: t('contact.days.thursday', 'Thursday'), hours: '7:00 AM - 5:00 PM' },
    { day: t('contact.days.friday', 'Friday'), hours: '7:00 AM - 5:00 PM' },
    { day: t('contact.days.saturday', 'Saturday'), hours: '7:00 AM - 5:00 PM' },
    { day: t('contact.days.sunday', 'Sunday'), hours: t('contact.closed', 'Closed') }
  ];

  const inquiryTypes = [
    t('contact.inquiry.new_client', 'New Client Consultation'),
    t('contact.inquiry.custom_design', 'Custom Design Project'),
    t('contact.inquiry.wedding_event', 'Wedding/Event Services'),
    t('contact.inquiry.collaboration', 'Collaboration Inquiry'),
    t('contact.inquiry.media_press', 'Media/Press Request'),
    t('contact.inquiry.general', 'General Question'),
    t('contact.inquiry.other', 'Other')
  ];

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || null,
          inquiry_type: data.inquiryType,
          subject: data.subject,
          message: data.message,
          status: 'unread'
        });

      if (error) {
        console.error('Error submitting contact form:', error);
        toast({
          title: t('contact.toast.error', 'Error'),
          description: t('contact.toast.failed_send', 'Failed to send your message. Please try again or contact us directly.'),
          variant: 'destructive',
        });
        return;
      }

      // Send admin notification email
      try {
        // Get studio configuration from database
        const { getStudioSettings } = await import('@/lib/studioService');
        const studioSettings = await getStudioSettings();
        const studioConfig = studioSettings ? {
          studioName: studioSettings.studio_name,
          studioPhone: studioSettings.studio_phone,
          studioEmail: studioSettings.studio_email,
          websiteUrl: studioSettings.website_url
        } : {};
        
        // Get all active admin emails
        const adminEmailConfigs = JSON.parse(localStorage.getItem('admin-email-configs') || '[]');
        const activeAdminEmails = adminEmailConfigs.filter((config: any) => config.isActive);
        
        // Send to all active admin emails with delay
        const emailsToNotify = activeAdminEmails.length > 0 ? activeAdminEmails : [{ email: 'alerttradingvieww@gmail.com', name: 'Admin' }];
        
        for (let i = 0; i < emailsToNotify.length; i++) {
          const adminConfig = emailsToNotify[i];
          
          // Add delay between emails (except for the first one)
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: {
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone: data.phone || '',
                inquiry_type: data.inquiryType,
                subject: data.subject,
                message: data.message,
                created_at: new Date().toISOString()
              },
              adminEmail: adminConfig.email,
              studioConfig: studioConfig
            }),
          });

          if (!response.ok) {
            console.error(`Failed to send admin notification to ${adminConfig.email}`);
          }
        }
      } catch (emailError) {
        console.error('Error sending admin notification:', emailError);
        // Don't fail the form submission if email fails
      }
      
      // Reset form
      form.reset();
      
      toast({
        title: t('contact.toast.success', 'Message Sent!'),
        description: t('contact.toast.success_description', 'Thank you for your message. We\'ll get back to you within 24 hours.'),
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: t('contact.toast.error', 'Error'),
        description: t('contact.toast.unexpected_error', 'An unexpected error occurred. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('contact.title', 'Get in Touch')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('contact.subtitle', "Have questions about services, want to discuss a custom design, or ready to book? I'd love to hear from you and help bring your nail vision to life.")}
          </p>
          <div className="w-24 h-1 bg-gradient-gold mx-auto"></div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t('contact.how_to_reach', 'How to Reach Me')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('contact.reach_description', 'Choose the method that works best for you. I typically respond within 24 hours.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover-lift bg-card border-border">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                    <method.icon size={24} className="text-luxury-black" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2 text-card-foreground">
                    {method.title}
                  </h3>
                  <p className="text-accent font-semibold mb-3">
                    {method.details}
                  </p>
                  <p className="text-muted-foreground text-sm mb-6">
                    {method.description}
                  </p>
                  <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <a href={method.action} target={method.action.startsWith('http') ? '_blank' : '_self'}>
                      {t('contact.contact_now', 'Contact Now')}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('contact.send_message', 'Send a Message')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('contact.form_description', 'Prefer to write? Use the form below for detailed inquiries or custom project discussions.')}
              </p>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-center">{t('contact.form_title', 'Contact Form')}</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.first_name', 'First Name')} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t('contact.form.first_name_placeholder', 'Your first name')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.last_name', 'Last Name')} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t('contact.form.last_name_placeholder', 'Your last name')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.email', 'Email Address')} *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t('contact.form.email_placeholder', 'your@email.com')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contact.form.phone', 'Phone Number')}</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder={t('contact.form.phone_placeholder', '+1 737-378-5755')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="inquiryType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.form.inquiry_type', 'Inquiry Type')} *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('contact.form.inquiry_type_placeholder', 'Select inquiry type')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inquiryTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.form.subject', 'Subject')} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t('contact.form.subject_placeholder', 'Brief description of your inquiry')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.form.message', 'Message')} *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t('contact.form.message_placeholder', 'Tell me about your vision, questions, or how I can help you...')}
                              rows={6}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="text-center">
                      <Button 
                        type="submit" 
                        size="lg" 
                        disabled={isSubmitting}
                        className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            {t('contact.form.sending', 'Sending...')}
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2" size={20} />
                            {t('contact.form.send_message', 'Send Message')}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Hours & Location */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Business Hours */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-heading text-2xl flex items-center">
                  <Clock className="mr-3 text-accent" size={24} />
                  {t('contact.studio_hours', 'Studio Hours')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {businessHours.map((schedule) => (
                    <div key={schedule.day} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                      <span className="font-medium text-card-foreground">{schedule.day}</span>
                      <span className="text-muted-foreground">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('contact.hours_note', 'Note:')}</strong> {t('contact.hours_note_text', 'Lunch break from 1:00 PM - 2:00 PM daily. All appointments are by reservation only to ensure each client receives dedicated attention.')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-heading text-2xl flex items-center">
                  <MapPin className="mr-3 text-accent" size={24} />
                  {t('contact.studio_location', 'Studio Location')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-card-foreground mb-2">{t('contact.location.city', 'Nashville, Tennessee')}</h4>
                    <p className="text-muted-foreground">
                      {t('contact.location.description', 'Nashboro Village, Nashville Tennessee, 37217. La dirección exacta de envía luego de realizar la reserva para mayor privacidad y seguridad.')}
                    </p>
                  </div>
                  
                  <div className="bg-secondary p-4 rounded-lg">
                    <h5 className="font-semibold text-card-foreground mb-2">{t('contact.location.getting_here', 'Getting Here')}</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {t('contact.location.accessible', 'Easily accessible from downtown Nashville')}</li>
                      <li>• {t('contact.location.parking', 'Free parking available on-site')}</li>
                      <li>• {t('contact.location.directions', 'Detailed directions sent with confirmation')}</li>
                      <li>• {t('contact.location.arrive_early', 'Please arrive 5 minutes early for check-in')}</li>
                    </ul>
                  </div>

                  <div>
                    <Button asChild className="w-full bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                      <Link to="/booking">{t('contact.location.book_address', 'Book to Get Address')}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20 bg-luxury-black text-pure-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            {t('contact.faq.title', 'Looking for Something Specific?')}
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {t('contact.faq.description', 'Need quick answers? Check out these helpful resources or reach out directly.')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Button asChild variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-luxury-black">
              <Link to="/services">{t('contact.faq.services_pricing', 'Services & Pricing')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-luxury-black">
              <Link to="/booking">{t('contact.faq.booking_policies', 'Booking Policies')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-luxury-black">
              <Link to="/gallery">{t('contact.faq.view_portfolio', 'View Portfolio')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;