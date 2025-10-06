import { useState } from 'react';
import { Save, Eye, Copy, FileText, Wand2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'confirmation' | 'reminder-24h' | 'reminder-1h' | 'admin-notification' | 'location';
  subject: string;
  content: string;
  isActive: boolean;
  variables: string[];
}

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
}

const templatePresets = {
  confirmation: {
    subject: 'Booking Confirmed - {{service_name}} on {{appointment_date}}',
    content: `Dear {{client_name}},

Thank you for choosing Francis Lozano Studio! Your appointment has been confirmed.

**Appointment Details:**
- Service: {{service_name}}
- Date: {{appointment_date_formatted}}
- Time: {{appointment_time}}
- Investment: ${{service_price}}
- Confirmation #: {{confirmation_number}}

{{#if client_notes}}
**Your Notes:** {{client_notes}}
{{/if}}

**Before Your Visit:**
• Please arrive with clean, polish-free nails
• Arrive 5 minutes early for check-in
• Payment due at time of service

{{location_section}}

Looking forward to seeing you!
Francis`
  },
  'reminder-24h': {
    subject: 'Reminder: Your appointment is tomorrow at {{appointment_time}}',
    content: `Dear {{client_name}},

Your nail appointment at Francis Lozano Studio is tomorrow!

**Tomorrow's Appointment:**
- Service: {{service_name}}
- Time: {{appointment_time}}
- Confirmation #: {{confirmation_number}}

**Final Reminders:**
✅ Come with clean, polish-free nails
✅ Arrive 5 minutes early
✅ Bring payment for ${{service_price}}

{{location_section}}

See you tomorrow!
Francis`
  },
  'reminder-1h': {
    subject: 'Starting Soon: Your appointment begins in 1 hour',
    content: `Dear {{client_name}},

Your appointment starts in 1 hour!

**Today's Appointment:**
- Service: {{service_name}}
- Time: {{appointment_time}}
- Address: {{studio_address}}

If you're running late, please call: {{studio_phone}}

See you soon!
Francis`
  },
  location: {
    subject: 'Studio Address & Directions - Appointment {{appointment_date}}',
    content: `Dear {{client_name}},

Here are the complete address details for your upcoming appointment:

**Studio Location:**
{{studio_full_address}}

**Parking Instructions:**
{{parking_instructions}}

**Access Instructions:**
{{access_instructions}}

{{#if google_maps_link}}
**Google Maps:** {{google_maps_link}}
{{/if}}

**Your Appointment:**
- Service: {{service_name}}
- Date: {{appointment_date_formatted}}
- Time: {{appointment_time}}

See you soon!
Francis`
  }
};

export function EmailTemplateEditor({ template, onSave, onCancel }: EmailTemplateEditorProps) {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate>(template);
  const [activeTab, setActiveTab] = useState('editor');
  const { toast } = useToast();

  const applyPreset = () => {
    const preset = templatePresets[editingTemplate.type];
    if (preset) {
      setEditingTemplate(prev => ({
        ...prev,
        subject: preset.subject,
        content: preset.content
      }));
      toast({
        title: 'Preset Applied',
        description: 'Template has been updated with the preset content.',
      });
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = editingTemplate.content;
      const newContent = currentContent.substring(0, start) + `{{${variable}}}` + currentContent.substring(end);
      
      setEditingTemplate(prev => ({ ...prev, content: newContent }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const generatePreview = () => {
    const sampleData = {
      client_name: 'Sarah Johnson',
      service_name: 'Luxury Gel Manicure with Nail Art',
      appointment_date: '2024-12-20',
      appointment_date_formatted: 'Friday, December 20th, 2024',
      appointment_time: '2:00 PM',
      service_price: '85',
      confirmation_number: 'FNA-ABC123',
      client_notes: 'Looking for elegant winter design with gold accents',
      studio_phone: '(+1 737-378-5755',
      studio_address: 'Private Studio, Nashville TN',
      studio_full_address: '123 Studio Lane\nNashville, TN 37XXX',
      parking_instructions: 'Free parking available on-site',
      access_instructions: 'Please ring doorbell upon arrival',
      google_maps_link: 'https://maps.google.com/...',
      location_section: 'Studio address will be provided 24 hours before your appointment'
    };

    let preview = editingTemplate.content;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      preview = preview.replace(regex, value);
    });

    // Handle conditional blocks
    preview = preview.replace(/{{#if client_notes}}[\s\S]*?{{\/if}}/g, 
      sampleData.client_notes ? `**Your Notes:** ${sampleData.client_notes}` : '');

    return preview;
  };

  const availableVariables = [
    { category: 'Client', variables: ['client_name', 'client_email', 'client_phone', 'client_notes'] },
    { category: 'Appointment', variables: ['service_name', 'service_price', 'appointment_date', 'appointment_date_formatted', 'appointment_time', 'confirmation_number'] },
    { category: 'Studio', variables: ['studio_name', 'studio_phone', 'studio_address', 'studio_full_address'] },
    { category: 'Location', variables: ['location_section', 'parking_instructions', 'access_instructions', 'google_maps_link'] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-semibold text-foreground">
            {editingTemplate.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            Template Type: {editingTemplate.type}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={editingTemplate.isActive}
            onCheckedChange={(checked) => setEditingTemplate(prev => ({ ...prev, isActive: checked }))}
          />
          <Label>Active</Label>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name-edit">Template Name</Label>
              <Input
                id="template-name-edit"
                value={editingTemplate.name}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyPreset}
                >
                  <Wand2 size={14} className="mr-1" />
                  Apply Preset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTemplate(prev => ({ ...prev, content: '', subject: '' }))}
                >
                  <RotateCcw size={14} className="mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-subject-edit">Email Subject</Label>
            <Input
              id="template-subject-edit"
              placeholder="Use {{variables}} for dynamic content"
              value={editingTemplate.subject}
              onChange={(e) => setEditingTemplate(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-content">Email Content</Label>
            <Textarea
              id="template-content"
              placeholder="Use {{variables}} for dynamic content..."
              value={editingTemplate.content}
              onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableVariables.map((group) => (
              <Card key={group.category} className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{group.category} Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.variables.map((variable) => (
                      <div key={variable} className="flex items-center justify-between">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {`{{${variable}}}`}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable)}
                        >
                          Insert
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Conditional Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted/50 rounded p-3">
                  <code className="text-sm">
                    {`{{#if client_notes}}Your notes: {{client_notes}}{{/if}}`}
                  </code>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shows content only when client_notes exists
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('#if client_notes}}Content here{{/if')}
                >
                  Insert Conditional Block
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Live Preview with Sample Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-card-foreground mb-2">Subject:</h4>
                  <p className="text-sm bg-background border border-border rounded p-2">
                    {editingTemplate.subject.replace(/{{(\w+)}}/g, '[Sample Data]')}
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-card-foreground mb-2">Content:</h4>
                  <div className="bg-background border border-border rounded p-4 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {generatePreview()}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatePreview());
                    toast({
                      title: 'Copied!',
                      description: 'Preview content copied to clipboard.',
                    });
                  }}
                >
                  <Copy className="mr-2" size={16} />
                  Copy Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSave(editingTemplate)}
          className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
        >
          <Save className="mr-2" size={16} />
          Save Template
        </Button>
      </div>
    </div>
  );
}