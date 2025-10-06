import { Clock, Star, Palette, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations } from '@/lib/translations';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  is_active: boolean;
  display_order: number;
}

interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  display_order: number;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const { t, language, translateByText } = useTranslations();

  useEffect(() => {
    fetchServices();
    fetchAddOns();
    loadStudioSettings();
    
    // Set up real-time subscription
    const servicesSubscription = supabase
      .channel('services-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'services' },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    const addOnsSubscription = supabase
      .channel('add-ons-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'add_ons' },
        () => {
          fetchAddOns();
        }
      )
      .subscribe();

    const studioSubscription = subscribeToStudioSettings((settings) => {
      setStudioSettings(settings);
    });

    return () => {
      supabase.removeChannel(servicesSubscription);
      supabase.removeChannel(addOnsSubscription);
      if (studioSubscription) {
        studioSubscription.unsubscribe();
      }
    };
  }, []);

  const loadStudioSettings = async () => {
    const settings = await getStudioSettings();
    setStudioSettings(settings);
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddOns = async () => {
    try {
      const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching add-ons:', error);
        return;
      }

      setAddOns(data || []);
    } catch (error) {
      console.error('Error fetching add-ons:', error);
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const categoryConfig = {
    'manicures': { title: 'Classic Manicures & Pedicures', icon: Star },
    'pedicures': { title: 'Classic Manicures & Pedicures', icon: Star },
    'extensions': { title: 'Nail Extensions', icon: Palette },
    'systems': { title: 'Nail Systems', icon: Palette },
    'nail-art': { title: 'Nail Art Tiers', icon: Clock },
    'add-ons': { title: 'Add-On Services', icon: Star },
    'general': { title: 'Additional Services', icon: Star }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('services.title', 'Services & Pricing')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('services.subtitle', 'Discover our comprehensive menu of luxury nail services, each crafted to deliver exceptional quality and artistry. All services include consultation and aftercare guidance.')}
          </p>
          <div className="w-24 h-1 bg-gradient-gold mx-auto"></div>
        </div>
      </section>

      {/* Service Notes */}
      {studioSettings && (studioSettings.service_note_pricing || studioSettings.service_note_hand_treatment) && (
        <section className="py-8 bg-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {studioSettings.service_note_pricing && (
                <div className="bg-card border border-accent/20 rounded-lg p-6 text-center">
                  <p className="text-lg text-card-foreground font-medium">
                    {translateByText(studioSettings.service_note_pricing)}
                  </p>
                </div>
              )}
              {studioSettings.service_note_hand_treatment && (
                <div className="bg-card border border-accent/20 rounded-lg p-6 text-center">
                  <p className="text-lg text-card-foreground font-medium">
                    {translateByText(studioSettings.service_note_hand_treatment)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Services Menu */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : Object.entries(groupedServices).length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No services available</p>
              <p className="text-sm">Services are being updated. Please check back soon.</p>
            </div>
          ) : (
            Object.entries(groupedServices).map(([categoryKey, categoryServices]) => {
              const config = categoryConfig[categoryKey] || { title: categoryKey, icon: Star };
              return (
                <div key={categoryKey} className="mb-16">
                  <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                      <config.icon size={32} className="text-luxury-black" />
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                      {config.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryServices.map((service) => (
                      <Card key={service.id} className="hover-lift bg-card border-border relative">
                        <CardHeader>
                          <CardTitle className="font-heading text-xl text-card-foreground flex items-center justify-between">
                            <span>{translateByText(service.name)}</span>
                            <span className="text-lg font-bold text-accent">${service.price}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{translateByText(service.description)}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock size={16} className="mr-2" />
                            <span>{service.duration} min</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* Dynamic Add-On Services Section */}
          {addOns.length > 0 && (
            <div className="mb-16">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="text-luxury-black" />
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                  {t('services.add_ons', 'Add-On Services')}
                </h2>
                <p className="text-muted-foreground mt-2">
                  Enhance your experience with these optional extras
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addOns.map((addOn) => (
                  <div key={addOn.id} className="flex justify-between items-center p-4 bg-muted rounded-lg hover:bg-accent/10 transition-colors">
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{translateByText(addOn.name)}</span>
                      {addOn.description && (
                        <p className="text-xs text-muted-foreground mt-1">{translateByText(addOn.description)}</p>
                      )}
                    </div>
                    <span className="font-bold text-accent ml-4">+${addOn.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Policies */}
          <div className="bg-secondary rounded-lg p-8 mb-12">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-6">{t('services.booking_policies', 'Booking Policies')}</h3>
            {studioSettings?.booking_policies_text ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studioSettings.booking_policies_text.deposit_payment && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">{translateByText(studioSettings.booking_policies_text.deposit_payment.title)}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      {studioSettings.booking_policies_text.deposit_payment.items.map((item, index) => (
                        <li key={index}>• {translateByText(item)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {studioSettings.booking_policies_text.cancellation && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">{translateByText(studioSettings.booking_policies_text.cancellation.title)}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      {studioSettings.booking_policies_text.cancellation.items.map((item, index) => (
                        <li key={index}>• {translateByText(item)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {studioSettings.booking_policies_text.guarantee && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">{translateByText(studioSettings.booking_policies_text.guarantee.title)}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      {studioSettings.booking_policies_text.guarantee.items.map((item, index) => (
                        <li key={index}>• {translateByText(item)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {studioSettings.booking_policies_text.health_safety && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">{translateByText(studioSettings.booking_policies_text.health_safety.title)}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      {studioSettings.booking_policies_text.health_safety.items.map((item, index) => (
                        <li key={index}>• {translateByText(item)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Deposits & Payment</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• A $30 deposit is required to secure your appointment.</li>
                    <li>• Cash and Zelle payments are accepted.</li>
                    <li>• Tips are appreciated but not required.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Cancellation Policy</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 48-hour notice required for cancellations</li>
                    <li>• Same-day cancellations forfeit deposit</li>
                    <li>• Late arrivals may result in shortened service</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Service Guarantee</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• ✅ 1-week guarantee on all services.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Health & Safety</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Please reschedule if feeling unwell</li>
                    <li>• All tools are sanitized and sterilized</li>
                    <li>• Allergic reactions: please inform before service</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="font-heading text-3xl font-bold text-foreground mb-4">
              {t('services.ready_to_book', 'Ready to Book Your Appointment?')}
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {studioSettings?.service_page_custom_text 
                ? translateByText(studioSettings.service_page_custom_text)
                : translateByText('Final pricing for nail art is determined based on complexity and design detail. Book your consultation to discuss your vision and receive an accurate quote.')
              }
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                <Link to="/booking">{t('nav.book_now', 'Book Now')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Link to="/gallery">{t('nav.gallery', 'View Gallery')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;