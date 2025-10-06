import { useEffect, useState } from 'react';
import {
  Mail,
  Settings,
  Save,
  TestTube,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  MapPin,
  Send,
  Globe,
  Navigation,
  Copy,
  AlertCircle,
  CheckCircle,
  User,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import {
  getStudioSettings,
  updateStudioSettings,
  subscribeToStudioSettings,
  ensureSingleStudioSettings,
  type StudioSettings,
  type AdminEmailConfig,
  type StudioLocationConfig,
  type UpdateStudioSettingsInput,
  createDefaultAdminEmailConfigs,
  createDefaultLocationConfig,
} from '@/lib/studioService';

const ADMIN_EMAIL_STORAGE_KEY = 'admin-email-configs';
const LOCATION_STORAGE_KEY = 'location-config';

const writeLocalStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write ${key} to local storage:`, error);
  }
};

const readLocalStorage = <T,>(key: string): T | null => {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return null;
    }
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`Failed to read ${key} from local storage:`, error);
    return null;
  }
};

const AdminEmailSettings = () => {
  const [emailConfigs, setEmailConfigs] = useState<AdminEmailConfig[]>(createDefaultAdminEmailConfigs());
  const [locationConfig, setLocationConfig] = useState<StudioLocationConfig>(createDefaultLocationConfig());
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const [isAddEmailOpen, setIsAddEmailOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmail, setNewEmail] = useState({ email: '', name: '' });
  const { toast } = useToast();

  const persistSettings = async (
    updates: UpdateStudioSettingsInput,
    messages: {
      successTitle: string;
      successDescription: string;
      errorTitle: string;
      errorDescription?: string;
      showToast?: boolean;
    },
  ) => {
    const { successTitle, successDescription, errorTitle, errorDescription, showToast = true } = messages;

    try {
      const updated = await updateStudioSettings(updates);

      if (updated) {
        setStudioSettings(updated);

        if (updates.admin_email_configs !== undefined) {
          setEmailConfigs(updated.admin_email_configs);
          writeLocalStorage(ADMIN_EMAIL_STORAGE_KEY, updated.admin_email_configs);
        }

        if (updates.location_config !== undefined) {
          setLocationConfig(updated.location_config);
          writeLocalStorage(LOCATION_STORAGE_KEY, updated.location_config);
        }
      }

      if (showToast) {
        toast({
          title: successTitle,
          description: successDescription,
        });
      }

      return updated;
    } catch (error) {
      console.error(errorTitle, error);

      if (showToast) {
        const errorMessage = [
          errorDescription ?? 'An error occurred while saving your changes',
          error instanceof Error ? error.message : null,
        ]
          .filter(Boolean)
          .join(': ');

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });
      }

      throw error;
    }
  };

  useEffect(() => {
    const initializeSettings = async () => {
      const savedEmailConfigs = readLocalStorage<AdminEmailConfig[]>(ADMIN_EMAIL_STORAGE_KEY);
      if (savedEmailConfigs && savedEmailConfigs.length > 0) {
        setEmailConfigs(savedEmailConfigs);
      } else {
        const defaults = createDefaultAdminEmailConfigs();
        setEmailConfigs(defaults);
        writeLocalStorage(ADMIN_EMAIL_STORAGE_KEY, defaults);
      }

      const savedLocationConfig = readLocalStorage<StudioLocationConfig>(LOCATION_STORAGE_KEY);
      if (savedLocationConfig) {
        setLocationConfig({
          ...createDefaultLocationConfig(),
          ...savedLocationConfig,
        });
      } else {
        const defaults = createDefaultLocationConfig();
        setLocationConfig(defaults);
        writeLocalStorage(LOCATION_STORAGE_KEY, defaults);
      }

      try {
        await ensureSingleStudioSettings();
        const settings = await getStudioSettings();
        if (settings) {
          setStudioSettings(settings);
          setEmailConfigs(settings.admin_email_configs);
          setLocationConfig(settings.location_config);
          writeLocalStorage(ADMIN_EMAIL_STORAGE_KEY, settings.admin_email_configs);
          writeLocalStorage(LOCATION_STORAGE_KEY, settings.location_config);
        }
      } catch (error) {
        console.error('Error loading studio settings:', error);
        toast({
          title: 'Error Loading Studio Settings',
          description: 'Failed to load studio settings. Please try refreshing the page.',
          variant: 'destructive',
        });
      }
    };

    initializeSettings();

    // Set up real-time subscription for studio settings
    const studioSubscription = subscribeToStudioSettings((settings) => {
      setStudioSettings(settings);
      setEmailConfigs(settings.admin_email_configs);
      setLocationConfig(settings.location_config);
      writeLocalStorage(ADMIN_EMAIL_STORAGE_KEY, settings.admin_email_configs);
      writeLocalStorage(LOCATION_STORAGE_KEY, settings.location_config);
    });

    return () => {
      if (studioSubscription) {
        studioSubscription.unsubscribe();
      }
    };
  }, [toast]);

  const saveEmailConfigs = async () => {
    setIsSaving(true);
    try {
      await persistSettings(
        { admin_email_configs: emailConfigs },
        {
          successTitle: 'Email Settings Saved',
          successDescription: 'Email configurations have been updated successfully.',
          errorTitle: 'Save Failed',
          errorDescription: 'Failed to save email configurations',
        },
      );
    } catch (error) {
      console.error('Failed to save email configurations:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveLocationConfig = async () => {
    setIsSaving(true);
    try {
      await persistSettings(
        { location_config: locationConfig },
        {
          successTitle: 'Location Settings Saved',
          successDescription: 'Location configuration has been updated successfully.',
          errorTitle: 'Save Failed',
          errorDescription: 'Failed to save location configuration',
        },
      );
    } catch (error) {
      console.error('Failed to save location configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveStudioSettings = async (options?: { showToast?: boolean }) => {
    if (!studioSettings) return;

    setIsSaving(true);
    try {
      await persistSettings(
        {
          studio_name: studioSettings.studio_name,
          studio_phone: studioSettings.studio_phone,
          studio_email: studioSettings.studio_email,
          website_url: studioSettings.website_url,
        },
        {
          successTitle: 'Studio Settings Saved',
          successDescription: 'Studio information has been updated successfully.',
          errorTitle: 'Save Failed',
          errorDescription: 'Failed to save studio settings',
          showToast: options?.showToast ?? true,
        },
      );
    } catch (error) {
      console.error('Failed to save studio settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllConfigurations = async () => {
    setIsSaving(true);
    try {
      const updatePayload: UpdateStudioSettingsInput = {
        admin_email_configs: emailConfigs,
        location_config: locationConfig,
      };

      if (studioSettings) {
        updatePayload.studio_name = studioSettings.studio_name;
        updatePayload.studio_phone = studioSettings.studio_phone;
        updatePayload.studio_email = studioSettings.studio_email;
        updatePayload.website_url = studioSettings.website_url;
      }

      await persistSettings(updatePayload, {
        successTitle: 'All Settings Saved',
        successDescription: 'All email and location settings have been updated successfully.',
        errorTitle: 'Save Failed',
        errorDescription: 'Failed to save configurations',
        showToast: false,
      });

      toast({
        title: 'All Settings Saved',
        description: 'All email and location settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving configurations:', error);
      toast({
        title: 'Save Failed',
        description: `Failed to save configurations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addEmailConfig = () => {
    if (!newEmail.email || !newEmail.name) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both email and name.',
        variant: 'destructive',
      });
      return;
    }

    const newConfig: AdminEmailConfig = {
      id: Date.now().toString(),
      email: newEmail.email,
      name: newEmail.name,
      isActive: true,
      isPrimary: emailConfigs.length === 0
    };

    setEmailConfigs(prev => [...prev, newConfig]);
    setNewEmail({ email: '', name: '' });
    setIsAddEmailOpen(false);

    toast({
      title: 'Email Added',
      description: 'New admin email has been added successfully.',
    });
  };

  const updateEmailConfig = (id: string, updates: Partial<AdminEmailConfig>) => {
    setEmailConfigs(prev => prev.map(config =>
      config.id === id ? { ...config, ...updates } : config
    ));
  };

  const deleteEmailConfig = (id: string) => {
    setEmailConfigs(prev => prev.filter(config => config.id !== id));
    toast({
      title: 'Email Removed',
      description: 'Admin email has been removed successfully.',
    });
  };

  const setPrimaryEmail = (id: string) => {
    setEmailConfigs(prev => prev.map(config => ({
      ...config,
      isPrimary: config.id === id
    })));
    toast({
      title: 'Primary Email Updated',
      description: 'Primary admin email has been changed.',
    });
  };

  const generateGoogleMapsLink = () => {
    if (!locationConfig.fullAddress) {
      toast({
        title: 'Missing Address',
        description: 'Please enter the full address first.',
        variant: 'destructive',
      });
      return;
    }

    const encodedAddress = encodeURIComponent(locationConfig.fullAddress.replace(/\n/g, ', '));
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    setLocationConfig(prev => ({ ...prev, googleMapsLink: mapsUrl }));

    toast({
      title: 'Google Maps Link Generated',
      description: 'Link has been automatically created from your address.',
    });
  };

  const generateLocationSection = () => {
    console.log('Generating location section preview with config:', locationConfig);

    if (!locationConfig.includeInConfirmation) {
      return 'Location information will be provided separately.';
    }

    switch (locationConfig.deliveryMethod) {
      case 'inline':
        return `**Studio Location:**
${locationConfig.displayAddress || 'Private Studio, Nashville TN'}

${locationConfig.parkingInstructions ? `**🚗 Parking:** ${locationConfig.parkingInstructions}` : ''}
${locationConfig.accessInstructions ? `**🚪 Access:** ${locationConfig.accessInstructions}` : ''}
${locationConfig.googleMapsLink ? `**🗺️ Directions:** ${locationConfig.googleMapsLink}` : ''}`;

      case 'separate':
        return '**Studio Location:** Complete address and directions will be sent separately 24 hours before your appointment for privacy and security.';

      case 'both':
        return `**Studio Location:**
${locationConfig.displayAddress || 'Private Studio, Nashville TN'}

**Complete address and directions will be sent separately 24 hours before your appointment.**`;

      default:
        return '';
    }
  };

  const testEmailConfiguration = async () => {
    setIsTesting(true);
    try {
      const activeAdminEmails = emailConfigs.filter(config => config.isActive);

      if (activeAdminEmails.length === 0) {
        toast({
          title: 'No Email Configured',
          description: 'Please add at least one active admin email first.',
          variant: 'destructive',
        });
        return;
      }

      // Get current location configuration for testing
      const currentLocationConfig = {
        includeInConfirmation: locationConfig.includeInConfirmation,
        deliveryMethod: locationConfig.deliveryMethod,
        fullAddress: locationConfig.fullAddress,
        displayAddress: locationConfig.displayAddress,
        googleMapsLink: locationConfig.googleMapsLink,
        parkingInstructions: locationConfig.parkingInstructions,
        accessInstructions: locationConfig.accessInstructions,
        separateEmailSubject: locationConfig.separateEmailSubject,
        separateEmailDelay: locationConfig.separateEmailDelay
      };

      console.log('Testing with location config:', currentLocationConfig);

      // Test booking data
      const testBooking = {
        id: 'test-id',
        service_name: 'Email Configuration Test Service',
        service_price: 75,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '2:00 PM',
        client_name: 'Test Client',
        client_email: activeAdminEmails[0].email, // Send test to first admin email
        client_phone: '+1 737-378-5755',
        confirmation_number: 'TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        notes: 'This is a test email to verify your email configuration and location settings are working properly.',
      };

      // Send test emails to all active admin emails with delay
      const results = [];

      for (let i = 0; i < activeAdminEmails.length; i++) {
        const adminConfig = activeAdminEmails[i];

        // Add delay between emails (except for the first one)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'confirmation',
            booking: testBooking,
            adminEmail: adminConfig.email,
            locationConfig: currentLocationConfig,
            studioConfig: studioSettings ? {
              studioName: studioSettings.studio_name,
              studioPhone: studioSettings.studio_phone,
              studioEmail: studioSettings.studio_email,
              websiteUrl: studioSettings.website_url
            } : undefined
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          results.push({ email: adminConfig.email, status: 'failed', error: errorText });
          console.error(`Failed to send test email to ${adminConfig.email}:`, errorText);
        } else {
          const result = await response.json();
          results.push({ email: adminConfig.email, status: 'success', result });
          console.log(`Test email sent successfully to: ${adminConfig.email}`);
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const failCount = results.filter(r => r.status === 'failed').length;

      toast({
        title: 'Test Email Results',
        description: `${successCount} test emails sent successfully${failCount > 0 ? `, ${failCount} failed` : ''}. Check your email inbox to verify location information appears correctly.`,
        variant: failCount > 0 ? 'destructive' : 'default',
      });

    } catch (error) {
      console.error('Test email failed:', error);
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Failed to send test emails',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground flex items-center">
              <Mail className="mr-3 text-accent" size={32} />
              Email & Location Settings
            </h1>
            <p className="text-muted-foreground">
              Configure email notifications, admin contacts, and location delivery settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={testEmailConfiguration}
              disabled={isTesting || emailConfigs.length === 0}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="mr-2" size={16} />
                  Test Configuration
                </>
              )}
            </Button>
            <Button
              onClick={saveAllConfigurations}
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
                  <Save className="mr-2" size={16} />
                  Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="studio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="studio">Studio Info</TabsTrigger>
            <TabsTrigger value="emails">Admin Emails</TabsTrigger>
            <TabsTrigger value="location">Location Settings</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          {/* Studio Information */}
          <TabsContent value="studio" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
                  <Settings className="mr-2 text-accent" size={20} />
                  Studio Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!studioSettings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading studio settings...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studio-name">Studio Name</Label>
                        <Input
                          id="studio-name"
                          value={studioSettings.studio_name}
                          onChange={(e) => setStudioSettings(prev => prev ? { ...prev, studio_name: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studio-phone">Studio Phone</Label>
                        <Input
                          id="studio-phone"
                          value={studioSettings.studio_phone}
                          onChange={(e) => setStudioSettings(prev => prev ? { ...prev, studio_phone: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studio-email">Studio Email (Display Only)</Label>
                        <div className="relative">
                          <Input
                            id="studio-email"
                            placeholder="francislozanostudio@gmail.com"
                            value={studioSettings.studio_email}
                            onChange={(e) => setStudioSettings(prev => prev ? { ...prev, studio_email: e.target.value } : null)}
                            className="bg-background"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Badge variant="outline" className="text-xs">
                              Display Only
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This email appears in PDFs, footers, contact info, and all public displays. Test emails are sent to Admin Email Addresses.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website-url">Website URL</Label>
                        <Input
                          id="website-url"
                          value={studioSettings.website_url}
                          onChange={(e) => setStudioSettings(prev => prev ? { ...prev, website_url: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => void saveStudioSettings()}
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
                          <Save className="mr-2" size={16} />
                          Save Studio Info
                        </>
                      )}
                    </Button>

                    <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Studio email is used for display purposes in PDFs, email footers, contact information, and all public displays.
                        Test emails are sent to the Admin Email Addresses configured in the next tab. Changes are applied in real-time across the entire website.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Email Management */}
          <TabsContent value="emails" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
                  <User className="mr-2 text-accent" size={20} />
                  Admin Email Addresses
                </CardTitle>
                <Dialog open={isAddEmailOpen} onOpenChange={setIsAddEmailOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                      <Plus className="mr-2" size={16} />
                      Add Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Admin Email</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email Address</Label>
                        <Input
                          id="new-email"
                          type="email"
                          placeholder="admin@francis_lozano_studio.com"
                          value={newEmail.email}
                          onChange={(e) => setNewEmail(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Name</Label>
                        <Input
                          id="new-name"
                          placeholder="Admin Name"
                          value={newEmail.name}
                          onChange={(e) => setNewEmail(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setIsAddEmailOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addEmailConfig}>
                          Add Email
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {emailConfigs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No admin emails configured</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emailConfigs.map((config) => (
                      <Card key={config.id} className="bg-background border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-card-foreground">{config.name}</p>
                                {config.isPrimary && (
                                  <Badge className="bg-accent text-accent-foreground">
                                    <Shield size={10} className="mr-1" />
                                    Primary
                                  </Badge>
                                )}
                                <Badge variant={config.isActive ? "default" : "secondary"}>
                                  {config.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{config.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={config.isActive}
                                onCheckedChange={(checked) => updateEmailConfig(config.id, { isActive: checked })}
                              />
                              {!config.isPrimary && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPrimaryEmail(config.id)}
                                >
                                  Set Primary
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 size={14} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Email</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {config.email} from admin notifications?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteEmailConfig(config.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Button
                  onClick={saveEmailConfigs}
                  className="mt-4 bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                >
                  <Save className="mr-2" size={16} />
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Settings */}
          <TabsContent value="location" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
                  <MapPin className="mr-2 text-accent" size={20} />
                  Location Delivery Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={locationConfig.includeInConfirmation}
                    onCheckedChange={(checked) => setLocationConfig(prev => ({ ...prev, includeInConfirmation: checked }))}
                  />
                  <Label>Include location information in confirmation emails</Label>
                </div>

                {locationConfig.includeInConfirmation && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="delivery-method">Location Delivery Method</Label>
                      <Select
                        value={locationConfig.deliveryMethod}
                        onValueChange={(value: 'inline' | 'separate' | 'both') => setLocationConfig(prev => ({ ...prev, deliveryMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inline">
                            <div className="flex items-center">
                              <Send className="mr-2" size={14} />
                              <div>
                                <p className="font-medium">Include in confirmation email</p>
                                <p className="text-xs text-muted-foreground">Address shown immediately</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="separate">
                            <div className="flex items-center">
                              <Mail className="mr-2" size={14} />
                              <div>
                                <p className="font-medium">Send separate location email</p>
                                <p className="text-xs text-muted-foreground">Address sent closer to appointment</p>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="both">
                            <div className="flex items-center">
                              <Navigation className="mr-2" size={14} />
                              <div>
                                <p className="font-medium">Both methods</p>
                                <p className="text-xs text-muted-foreground">Basic info now + detailed later</p>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        <strong>Inline:</strong> Shows location info directly in confirmation email<br />
                        <strong>Separate:</strong> Sends location details in a separate email<br />
                        <strong>Both:</strong> Shows basic info now, detailed info later
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display-address">Display Address</Label>
                        <Textarea
                          id="display-address"
                          placeholder="Private Studio, Nashville TN"
                          value={locationConfig.displayAddress}
                          onChange={(e) => setLocationConfig(prev => ({ ...prev, displayAddress: e.target.value }))}
                          rows={2}
                        />
                        <p className="text-xs text-muted-foreground">
                          General address shown in confirmation emails (can be vague for privacy)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full-address">Complete Address</Label>
                        <Textarea
                          id="full-address"
                          placeholder="123 Studio Lane
Nashville, TN 37XXX"
                          value={locationConfig.fullAddress}
                          onChange={(e) => setLocationConfig(prev => ({ ...prev, fullAddress: e.target.value }))}
                          rows={2}
                        />
                        <p className="text-xs text-muted-foreground">
                          Full address for separate location emails and Google Maps
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parking-instructions">Parking Instructions</Label>
                        <Input
                          id="parking-instructions"
                          placeholder="Free parking available on-site"
                          value={locationConfig.parkingInstructions}
                          onChange={(e) => setLocationConfig(prev => ({ ...prev, parkingInstructions: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="access-instructions">Access Instructions</Label>
                        <Input
                          id="access-instructions"
                          placeholder="Please ring doorbell upon arrival"
                          value={locationConfig.accessInstructions}
                          onChange={(e) => setLocationConfig(prev => ({ ...prev, accessInstructions: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="google-maps-link">Google Maps Link</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="google-maps-link"
                          placeholder="https://www.google.com/maps/search/?api=1&query=..."
                          value={locationConfig.googleMapsLink}
                          onChange={(e) => setLocationConfig(prev => ({ ...prev, googleMapsLink: e.target.value }))}
                        />
                        <Button
                          variant="outline"
                          onClick={generateGoogleMapsLink}
                          disabled={!locationConfig.fullAddress}
                        >
                          <Globe size={14} className="mr-1" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  onClick={saveLocationConfig}
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
                      <Save className="mr-2" size={16} />
                      Save Location Settings
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Location Preview */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
                  <Eye className="mr-2 text-accent" size={20} />
                  Location Section Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-card-foreground">How it appears in confirmation email:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generateLocationSection(), 'Location preview')}
                    >
                      <Copy size={14} className="mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-background border border-border rounded p-3 text-sm whitespace-pre-wrap">
                    {generateLocationSection()}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-1">Testing Location Settings</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        After saving your location settings, use the "Test Configuration" button to send a test email and verify that location information appears correctly in the confirmation email.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-card-foreground">
                  Email Template Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <h4 className="font-semibold text-card-foreground mb-2">Template Variables Available:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-card-foreground mb-2">Client Information:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• <code>client_name</code> - Full client name</li>
                        <li>• <code>client_email</code> - Client email address</li>
                        <li>• <code>client_phone</code> - Client phone number</li>
                        <li>• <code>client_notes</code> - Special requests/notes</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground mb-2">Appointment Details:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• <code>service_name</code> - Selected service</li>
                        <li>• <code>service_price</code> - Service price</li>
                        <li>• <code>appointment_date</code> - Date (YYYY-MM-DD)</li>
                        <li>• <code>appointment_time</code> - Time (12-hour format)</li>
                        <li>• <code>confirmation_number</code> - Booking reference</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground mb-2">Studio Information:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• <code>studio_name</code> - {studioSettings?.studio_name || 'Loading...'}</li>
                        <li>• <code>studio_phone</code> - {studioSettings?.studio_phone || 'Loading...'}</li>
                        <li>• <code>studio_email</code> - {studioSettings?.studio_email || 'Loading...'}</li>
                        <li>• <code>location_section</code> - Dynamic location content</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground mb-2">Location Details:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• <code>studio_address</code> - Display address</li>
                        <li>• <code>studio_full_address</code> - Complete address</li>
                        <li>• <code>parking_instructions</code> - Parking info</li>
                        <li>• <code>access_instructions</code> - Access info</li>
                        <li>• <code>google_maps_link</code> - Maps URL</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-card-foreground mb-2">Current Location Section Output:</h4>
                  <div className="bg-background border border-border rounded p-3 text-sm whitespace-pre-wrap">
                    {generateLocationSection()}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-1">Template Integration</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Email templates are automatically updated with your location and studio settings.
                        Address shown in confirmation emails when "inline" or "both" is selected
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminEmailSettings;