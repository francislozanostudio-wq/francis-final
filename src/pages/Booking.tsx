import { Calendar, Clock, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { MultiStepBookingForm } from '@/components/booking/MultiStepBookingForm';
import { useState, useEffect } from 'react';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations } from '@/lib/translations';

const Booking = () => {
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const { t, language, translateByText } = useTranslations();

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

  const bookingSteps = [
    {
      icon: Calendar,
      title: t('booking.select_service', 'Select Your Service'),
      description: 'Choose from our menu of luxury nail services and add-ons to create your perfect appointment.'
    },
    {
      icon: Clock,
      title: t('booking.pick_time', 'Pick Your Time'),
      description: 'Select from available appointment slots that work with your schedule.'
    },
    {
      icon: CreditCard,
      title: t('booking.secure_deposit', 'Secure with Deposit'),
      description: '50% deposit secures your appointment and is applied to your final service cost.'
    },
    {
      icon: Shield,
      title: t('booking.confirmation', 'Confirmation & Prep'),
      description: 'Receive confirmation with studio address and preparation instructions for your visit.'
    }
  ];

  const policies = [
    {
      title: 'Deposits & Payment',
      items: [
        '50% deposit required to secure all appointments',
        'Deposits are non-refundable but transferable with 48hr notice',
        'Remaining balance due at appointment completion',
        'Cash, Venmo, Zelle, and major cards accepted',
        'Gratuity is appreciated but never required'
      ]
    },
    {
      title: 'Cancellation & Rescheduling',
      items: [
        '48-hour advance notice required for changes',
        'Same-day cancellations forfeit entire deposit',
        'No-shows forfeit deposit and may be declined future bookings',
        'Emergency situations evaluated case-by-case',
        'Rescheduling available based on availability'
      ]
    },
    {
      title: 'Appointment Guidelines',
      items: [
        'Arrive 5 minutes early for check-in',
        'Late arrivals may result in shortened service time',
        'Full studio address provided upon confirmation',
        'Please come with clean, polish-free nails',
        'Reschedule if feeling unwell for everyone\'s safety'
      ]
    },
    {
      title: 'Fills & Touch-Ups',
      items: [
        'Fills from other salons require removal fee ($25-45)',
        '2-week guarantee on all gel and acrylic services',
        'Free minor adjustments within 3 days of service',
        'Fill appointments available every 2-3 weeks',
        'Nail art touch-ups evaluated individually'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How far in advance should I book?',
      answer: 'For best availability, book 1-2 weeks in advance. Last-minute appointments may be available for simple services.'
    },
    {
      question: 'What if I\'m allergic to certain products?',
      answer: 'Please inform me of any allergies during booking. I can accommodate most sensitivities with alternative products.'
    },
    {
      question: 'Can I bring inspiration photos?',
      answer: 'Absolutely! Bring photos or Pinterest boards to help communicate your vision. We\'ll discuss feasibility during consultation.'
    },
    {
      question: 'Do you offer group appointments?',
      answer: 'Private studio appointments are individual only. For special events, please contact me to discuss options.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('booking.title', 'Book Your Appointment')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('booking.subtitle', "Ready to experience luxury nail artistry? Schedule your private appointment and let's create something beautiful together in my Nashville studio.")}
          </p>
          <div className="w-24 h-1 bg-gradient-gold mx-auto"></div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <MultiStepBookingForm />

            {/* Booking Process */}
            <div className="mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
                {t('booking.how_booking_works', 'How Booking Works')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {bookingSteps.map((step, index) => (
                  <Card key={index} className="text-center hover-lift bg-card border-border">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                        <step.icon size={24} className="text-luxury-black" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold mb-3 text-card-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Policies */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Booking Policies
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Please review these important policies before booking your appointment to ensure 
                a smooth and enjoyable experience for everyone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {policies.map((policy, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-heading text-xl text-card-foreground">
                      {policy.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {policy.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-muted-foreground text-sm flex items-start">
                          <span className="text-accent mr-2 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Common questions about booking and preparing for your appointment
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-card-foreground mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-muted-foreground mb-6">
                Have another question? I'm here to help!
              </p>
              <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Link to="/contact">Contact Francis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-luxury-black text-pure-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Nails?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Don't wait—my calendar fills up quickly! Book your appointment today and 
            experience the difference of truly personalized nail artistry.
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
              <Calendar className="mr-2" size={20} />
              Book Now
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-luxury-black">
              <Link to="/services">View Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Booking;