import { useState } from 'react';
import { useEffect } from 'react';
import { ArrowRight, Clock, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/lib/translations';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  is_active: boolean;
  display_order: number;
}

interface ServiceSelectionStepProps {
  selectedService?: Service;
  onServiceSelect: (service: Service) => void;
  onNext: () => void;
}

export function ServiceSelectionStep({ selectedService, onServiceSelect, onNext }: ServiceSelectionStepProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t, language, translateByText } = useTranslations();

  useEffect(() => {
    fetchServices();
    
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

    return () => {
      supabase.removeChannel(servicesSubscription);
    };
  }, []);

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
        toast({
          title: 'Error',
          description: 'Failed to load services. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    onServiceSelect(service);
  };

  const canProceed = selectedService !== undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
          {t('booking.select_service', 'Select Your Service')}
        </h2>
        <p className="text-muted-foreground">
          Choose the perfect service for your nail transformation
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No services available</p>
          <p className="text-sm">Services are being updated. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, index) => (
            <Card
              key={service.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover-lift animate-fade-in",
                selectedService?.id === service.id
                  ? "border-accent ring-2 ring-accent/20 shadow-glow"
                  : "border-border hover:border-accent/50",
                "bg-card"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleServiceSelect(service)}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-heading text-lg font-semibold text-card-foreground">
                    {translateByText(service.name)}
                  </h3>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all duration-200",
                    selectedService?.id === service.id
                      ? "border-accent bg-accent" 
                      : "border-muted-foreground"
                  )}>
                    {selectedService?.id === service.id && (
                      <div className="w-full h-full rounded-full bg-accent animate-scale-in" />
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {translateByText(service.description)}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-accent">
                      <DollarSign size={16} className="mr-1" />
                      <span className="font-semibold">${service.price}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock size={16} className="mr-1" />
                      <span className="text-sm">{service.duration}min</span>
                    </div>
                  </div>
                  {(hoveredService === service.id || selectedService?.id === service.id) && (
                    <div className="text-accent animate-fade-in">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedService && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 animate-scale-in">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-card-foreground">
                Selected: {translateByText(selectedService.name)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total cost: ${selectedService.price} • Duration: {selectedService.duration} minutes
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
  );
}
