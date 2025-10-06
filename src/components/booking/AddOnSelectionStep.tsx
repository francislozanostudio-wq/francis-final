import { useState, useEffect } from 'react';
import { Star, Plus, Minus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useTranslations } from '@/lib/translations';

export interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  display_order: number;
}

interface AddOnSelectionStepProps {
  selectedAddOns: AddOn[];
  onAddOnsSelect: (addOns: AddOn[]) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function AddOnSelectionStep({
  selectedAddOns,
  onAddOnsSelect,
  onNext,
  onPrev,
  onSkip
}: AddOnSelectionStepProps) {
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { translateByText } = useTranslations();

  useEffect(() => {
    fetchAddOns();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('add-ons-public')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'add_ons' },
        () => {
          fetchAddOns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchAddOns = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching add-ons:', error);
        return;
      }

      setAvailableAddOns(data || []);
    } catch (error) {
      console.error('Error fetching add-ons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAddOnSelected = (addOnId: string) => {
    return selectedAddOns.some(a => a.id === addOnId);
  };

  const toggleAddOn = (addOn: AddOn) => {
    if (isAddOnSelected(addOn.id)) {
      onAddOnsSelect(selectedAddOns.filter(a => a.id !== addOn.id));
    } else {
      onAddOnsSelect([...selectedAddOns, addOn]);
    }
  };

  const calculateTotal = () => {
    return selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  };

  const handleContinue = () => {
    onNext();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={32} className="text-luxury-black" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-3">
          Enhance Your Experience
        </h2>
        <p className="text-muted-foreground text-lg">
          Select optional add-ons to customize your appointment (optional)
        </p>
      </div>

      {availableAddOns.length === 0 ? (
        <Card className="bg-secondary border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No add-ons available at this time.</p>
            <Button
              onClick={onSkip}
              className="mt-4 bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
            >
              Continue to Next Step
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAddOns.map((addOn) => {
              const isSelected = isAddOnSelected(addOn.id);
              
              return (
                <Card
                  key={addOn.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-accent border-2 bg-accent/5 shadow-md'
                      : 'border-border hover:border-accent/50 hover:shadow-sm'
                  }`}
                  onClick={() => toggleAddOn(addOn)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleAddOn(addOn)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground text-lg mb-1">
                            {translateByText(addOn.name)}
                          </h3>
                          {addOn.description && (
                            <p className="text-sm text-muted-foreground">
                              {translateByText(addOn.description)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className="ml-2 bg-gradient-gold text-luxury-black font-bold">
                        +${addOn.price}
                      </Badge>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center text-accent">
                        <Check size={16} className="mr-2" />
                        <span className="text-sm font-medium">Added to booking</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          {selectedAddOns.length > 0 && (
            <Card className="bg-accent/5 border-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-lg">
                    Selected Add-Ons ({selectedAddOns.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddOnsSelect([])}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2 mb-4">
                  {selectedAddOns.map((addOn) => (
                    <div key={addOn.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{translateByText(addOn.name)}</span>
                      <span className="font-medium text-accent">+${addOn.price}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-foreground">Add-Ons Total:</span>
                    <span className="text-accent">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will be added to your service price
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={onPrev}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              Back
            </Button>
            
            <div className="flex gap-3">
              {selectedAddOns.length === 0 && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip Add-Ons
                </Button>
              )}
              <Button
                onClick={handleContinue}
                className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
              >
                Continue to Date & Time
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
