import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  getStudioSettings, 
  updateStudioSettings, 
  subscribeToStudioSettings,
  type StudioSettings,
  type BookingPoliciesText
} from '@/lib/studioService';

const AdminServicePageSettings = () => {
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [bookingPolicies, setBookingPolicies] = useState<BookingPoliciesText>({
    deposit_payment: {
      title: 'Deposits & Payment',
      items: [],
    },
    cancellation: {
      title: 'Cancellation Policy',
      items: [],
    },
    guarantee: {
      title: 'Service Guarantee',
      items: [],
    },
    health_safety: {
      title: 'Health & Safety',
      items: [],
    },
  });

  const [customText, setCustomText] = useState('');
  const [serviceNotePricing, setServiceNotePricing] = useState('');
  const [serviceNoteHandTreatment, setServiceNoteHandTreatment] = useState('');

  useEffect(() => {
    loadSettings();

    const subscription = subscribeToStudioSettings((updatedSettings) => {
      setSettings(updatedSettings);
      initializeFormData(updatedSettings);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getStudioSettings();
      if (data) {
        setSettings(data);
        initializeFormData(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFormData = (data: StudioSettings) => {
    if (data.booking_policies_text) {
      setBookingPolicies(data.booking_policies_text);
    }
    if (data.service_page_custom_text) {
      setCustomText(data.service_page_custom_text);
    }
    if (data.service_note_pricing) {
      setServiceNotePricing(data.service_note_pricing);
    }
    if (data.service_note_hand_treatment) {
      setServiceNoteHandTreatment(data.service_note_hand_treatment);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await updateStudioSettings({
        booking_policies_text: bookingPolicies,
        service_page_custom_text: customText,
        service_note_pricing: serviceNotePricing,
        service_note_hand_treatment: serviceNoteHandTreatment,
      });

      toast({
        title: 'Success',
        description: 'Service page settings updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addPolicyItem = (section: keyof BookingPoliciesText) => {
    setBookingPolicies(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: [...prev[section].items, ''],
      },
    }));
  };

  const updatePolicyItem = (section: keyof BookingPoliciesText, index: number, value: string) => {
    setBookingPolicies(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.map((item, i) => i === index ? value : item),
      },
    }));
  };

  const removePolicyItem = (section: keyof BookingPoliciesText, index: number) => {
    setBookingPolicies(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.filter((_, i) => i !== index),
      },
    }));
  };

  const updateSectionTitle = (section: keyof BookingPoliciesText, title: string) => {
    setBookingPolicies(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        title,
      },
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="text-accent" />
              Service Page Settings
            </h1>
            <p className="text-muted-foreground">
              Customize booking policies and service page text
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={isLoading}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Custom Text Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-card-foreground">
              Service Page Custom Text
            </CardTitle>
            <CardDescription>
              This text appears at the bottom of the services page, before the booking buttons.
              It will be translated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="custom-text">Custom Message</Label>
              <Textarea
                id="custom-text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
                placeholder="Enter the custom text that appears on the service page..."
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Current: "{customText}"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Notes Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-card-foreground">
              Service Page Notes
            </CardTitle>
            <CardDescription>
              These notes appear at the top of the services page. They will be translated automatically to Spanish.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="note-pricing">Pricing Note</Label>
              <Textarea
                id="note-pricing"
                value={serviceNotePricing}
                onChange={(e) => setServiceNotePricing(e.target.value)}
                rows={3}
                placeholder="💫 Important Note: Final prices may vary..."
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This note explains that final prices may vary based on design complexity.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-hand-treatment">Hand Treatment Note</Label>
              <Textarea
                id="note-hand-treatment"
                value={serviceNoteHandTreatment}
                onChange={(e) => setServiceNoteHandTreatment(e.target.value)}
                rows={3}
                placeholder="🌸 Note: All our hand services include..."
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This note highlights the complimentary paraffin treatment included with hand services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Policies Sections */}
        {Object.entries(bookingPolicies).map(([key, section]) => (
          <Card key={key} className="border-border">
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle className="font-heading text-xl text-card-foreground mb-2">
                    {section.title}
                  </CardTitle>
                  <CardDescription>
                    Customize the {section.title.toLowerCase()} section. Each item will be translated automatically.
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${key}-title`}>Section Title</Label>
                  <Input
                    id={`${key}-title`}
                    value={section.title}
                    onChange={(e) => updateSectionTitle(key as keyof BookingPoliciesText, e.target.value)}
                    placeholder="Section title..."
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Policy Items</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addPolicyItem(key as keyof BookingPoliciesText)}
                    className="text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {section.items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No items yet. Click "Add Item" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {section.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Textarea
                          value={item}
                          onChange={(e) => updatePolicyItem(key as keyof BookingPoliciesText, index, e.target.value)}
                          placeholder="Enter policy item..."
                          rows={2}
                          className="flex-1 resize-none"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removePolicyItem(key as keyof BookingPoliciesText, index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Save Button at Bottom */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServicePageSettings;
