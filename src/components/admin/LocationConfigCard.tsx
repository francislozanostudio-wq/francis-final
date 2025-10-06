import { MapPin, Navigation, Globe, Send, Eye, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LocationConfig {
  includeInConfirmation: boolean;
  deliveryMethod: 'inline' | 'separate' | 'both';
  fullAddress: string;
  displayAddress: string;
  googleMapsLink: string;
  parkingInstructions: string;
  accessInstructions: string;
  separateEmailSubject: string;
  separateEmailDelay: number;
}

interface LocationConfigCardProps {
  config: LocationConfig;
  onChange: (config: LocationConfig) => void;
}

export function LocationConfigCard({ config, onChange }: LocationConfigCardProps) {
  const { toast } = useToast();

  const updateConfig = (updates: Partial<LocationConfig>) => {
    onChange({ ...config, ...updates });
  };

  const generateGoogleMapsLink = () => {
    if (!config.fullAddress) {
      toast({
        title: 'Missing Address',
        description: 'Please enter the full address first.',
        variant: 'destructive',
      });
      return;
    }

    const encodedAddress = encodeURIComponent(config.fullAddress.replace(/\n/g, ', '));
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    updateConfig({ googleMapsLink: mapsUrl });
    
    toast({
      title: 'Google Maps Link Generated',
      description: 'Link has been automatically created from your address.',
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  const generateLocationPreview = () => {
    if (!config.includeInConfirmation) return 'Location information disabled';

    switch (config.deliveryMethod) {
      case 'inline':
        return `**Studio Location:**
${config.displayAddress}

${config.parkingInstructions ? `**Parking:** ${config.parkingInstructions}` : ''}
${config.accessInstructions ? `**Access:** ${config.accessInstructions}` : ''}
${config.googleMapsLink ? `**Directions:** Click here for Google Maps` : ''}`;
      
      case 'separate':
        return '**Studio Location:** Address details will be sent separately 24 hours before your appointment for privacy and security.';
      
      case 'both':
        return `**Studio Location:**
${config.displayAddress}

**Complete address and directions will be sent separately 24 hours before your appointment.**`;
      
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Location Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
            <MapPin className="mr-2 text-accent" size={20} />
            Location Information Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.includeInConfirmation}
              onCheckedChange={(checked) => updateConfig({ includeInConfirmation: checked })}
            />
            <Label>Include location information in confirmation emails</Label>
          </div>

          {config.includeInConfirmation && (
            <>
              <div className="space-y-2">
                <Label htmlFor="delivery-method">How to deliver location information</Label>
                <Select 
                  value={config.deliveryMethod} 
                  onValueChange={(value: 'inline' | 'separate' | 'both') => updateConfig({ deliveryMethod: value })}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display-address">Display Address</Label>
                  <Textarea
                    id="display-address"
                    placeholder="Private Studio, Nashville TN"
                    value={config.displayAddress}
                    onChange={(e) => updateConfig({ displayAddress: e.target.value })}
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
                    placeholder="123 Studio Lane&#10;Nashville, TN 37XXX"
                    value={config.fullAddress}
                    onChange={(e) => updateConfig({ fullAddress: e.target.value })}
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
                    value={config.parkingInstructions}
                    onChange={(e) => updateConfig({ parkingInstructions: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access-instructions">Access Instructions</Label>
                  <Input
                    id="access-instructions"
                    placeholder="Please ring doorbell upon arrival"
                    value={config.accessInstructions}
                    onChange={(e) => updateConfig({ accessInstructions: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google-maps-link">Google Maps Link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="google-maps-link"
                    placeholder="https://maps.google.com/..."
                    value={config.googleMapsLink}
                    onChange={(e) => updateConfig({ googleMapsLink: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    onClick={generateGoogleMapsLink}
                    disabled={!config.fullAddress}
                  >
                    <Globe size={14} className="mr-1" />
                    Generate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('https://www.google.com/maps', '_blank')}
                  >
                    <Navigation size={14} className="mr-1" />
                    Maps
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shareable Google Maps link for easy navigation
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Separate Email Settings */}
      {config.includeInConfirmation && config.deliveryMethod !== 'inline' && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
              <Send className="mr-2 text-accent" size={20} />
              Separate Location Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="separate-subject">Email Subject</Label>
                <Input
                  id="separate-subject"
                  placeholder="Studio Address & Directions - Your Appointment {{appointment_date}}"
                  value={config.separateEmailSubject}
                  onChange={(e) => updateConfig({ separateEmailSubject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-delay">Send Before Appointment</Label>
                <Select 
                  value={config.separateEmailDelay.toString()} 
                  onValueChange={(value) => updateConfig({ separateEmailDelay: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour before</SelectItem>
                    <SelectItem value="2">2 hours before</SelectItem>
                    <SelectItem value="4">4 hours before</SelectItem>
                    <SelectItem value="12">12 hours before</SelectItem>
                    <SelectItem value="24">24 hours before</SelectItem>
                    <SelectItem value="48">48 hours before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <h4 className="font-semibold text-card-foreground mb-2">Automation Note:</h4>
              <p className="text-sm text-muted-foreground">
                Separate location emails are currently sent manually from the admin dashboard. 
                To automate this, set up a cron job to call the booking-reminders function.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                onClick={() => copyToClipboard(generateLocationPreview(), 'Location preview')}
              >
                <Copy size={14} className="mr-1" />
                Copy
              </Button>
            </div>
            <div className="bg-background border border-border rounded p-3 text-sm whitespace-pre-wrap">
              {generateLocationPreview().replace(/\*\*(.*?)\*\*/g, '$1')}
            </div>
          </div>

          {config.googleMapsLink && (
            <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-card-foreground">Google Maps Integration</p>
                  <p className="text-sm text-muted-foreground">Clients can click to open directions</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(config.googleMapsLink, '_blank')}
                >
                  <Navigation size={14} className="mr-1" />
                  Test Link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}