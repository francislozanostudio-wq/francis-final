import { useState, useEffect } from 'react';
import { Settings, Mail, Save, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface EmailConfig {
  adminEmail: string;
  studioName: string;
  studioAddress: string;
  studioPhone: string;
  fromEmail: string;
}

interface EmailConfigDialogProps {
  trigger?: React.ReactNode;
}

export function EmailConfigDialog({ trigger }: EmailConfigDialogProps) {
  const [config, setConfig] = useState<EmailConfig>({
    adminEmail: 'alerttradingvieww@gmail.com',
    studioName: 'Francis Lozano Studio',
    studioAddress: 'Private Studio, Nashville TN',
    studioPhone: '(+1 737-378-5755',
    fromEmail: 'alerttradingvieww@gmail.com',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    // Load from localStorage for now
    const savedConfig = localStorage.getItem('email-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (legacy format for backward compatibility)
      localStorage.setItem('email-config', JSON.stringify(config));
      
      // Also update the new admin email configs if they exist
      const adminEmailConfigs = JSON.parse(localStorage.getItem('admin-email-configs') || '[]');
      if (adminEmailConfigs.length > 0) {
        // Update primary email in the new format
        const updatedConfigs = adminEmailConfigs.map((emailConfig: any) => 
          emailConfig.isPrimary 
            ? { ...emailConfig, email: config.adminEmail }
            : emailConfig
        );
        localStorage.setItem('admin-email-configs', JSON.stringify(updatedConfigs));
      }
      
      toast({
        title: 'Configuration Saved',
        description: 'Email settings have been updated successfully.',
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save config:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save email configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailConfiguration = async () => {
    setIsTesting(true);
    try {
      // Test email by sending a test message
      const testBooking = {
        id: 'test-id',
        service_name: 'Test Service',
        service_price: 50,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '2:00 PM',
        client_name: 'Test Client',
        client_email: config.adminEmail, // Send test to admin email
        client_phone: '+1 737-378-5755',
        confirmation_number: 'TEST-123',
        notes: 'This is a test email to verify configuration.',
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'confirmation',
          booking: testBooking,
          adminEmail: config.adminEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      toast({
        title: 'Test Email Sent via Brevo!',
        description: `Test confirmation email sent to ${config.adminEmail}. Check your inbox and spam folder.`,
      });
      
    } catch (error) {
      console.error('Test email failed:', error);
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Settings className="mr-2" size={16} />
            Email Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center">
            <Mail className="mr-2 text-accent" size={24} />
            Email Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Brevo Integration:</strong> Using Brevo API for reliable email delivery. Make sure your sender email ({config.fromEmail}) is verified in your Brevo account under Senders & IP settings.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email Address</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@francis_lozano_studio.com"
                value={config.adminEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Email address to receive booking notifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email Address</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="your-verified-email@gmail.com"
                value={config.fromEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Must be verified in your Brevo account (Senders & IP section)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studioName">Studio Name</Label>
              <Input
                id="studioName"
                placeholder="Francis Lozano Studio"
                value={config.studioName}
                onChange={(e) => setConfig(prev => ({ ...prev, studioName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studioPhone">Studio Phone</Label>
              <Input
                id="studioPhone"
                placeholder="(+1 737-378-5755"
                value={config.studioPhone}
                onChange={(e) => setConfig(prev => ({ ...prev, studioPhone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studioAddress">Studio Address</Label>
            <Textarea
              id="studioAddress"
              placeholder="Private Studio, Nashville TN"
              value={config.studioAddress}
              onChange={(e) => setConfig(prev => ({ ...prev, studioAddress: e.target.value }))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Address shown in confirmation emails (keep private details secure)
            </p>
          </div>

          <div className="flex justify-between space-x-3">
            <Button
              variant="outline"
              onClick={testEmailConfiguration}
              disabled={isTesting || !config.adminEmail}
              className="flex-1"
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
              onClick={saveConfig}
              disabled={isSaving}
              className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold flex-1"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}