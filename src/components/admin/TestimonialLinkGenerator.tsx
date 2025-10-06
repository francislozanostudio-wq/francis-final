import { useState } from 'react';
import { Plus, Copy, Check, Link2, Trash2, Clock, Hash, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface TestimonialLink {
  id: string;
  short_code: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  max_uses: number | null;
  use_count: number;
}

interface TestimonialLinkGeneratorProps {
  links: TestimonialLink[];
  onRefresh: () => void;
}

export const TestimonialLinkGenerator = ({ links, onRefresh }: TestimonialLinkGeneratorProps) => {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [newLinkOptions, setNewLinkOptions] = useState({
    expires_in_days: '',
    max_uses: '',
    is_active: true
  });

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const generateLink = async () => {
    try {
      setIsGenerating(true);
      const shortCode = generateShortCode();

      let expiresAt = null;
      if (newLinkOptions.expires_in_days) {
        const days = parseInt(newLinkOptions.expires_in_days);
        if (days > 0) {
          const date = new Date();
          date.setDate(date.getDate() + days);
          expiresAt = date.toISOString();
        }
      }

      const maxUses = newLinkOptions.max_uses ? parseInt(newLinkOptions.max_uses) : null;

      const { error } = await supabase
        .from('testimonial_links')
        .insert({
          short_code: shortCode,
          expires_at: expiresAt,
          max_uses: maxUses,
          is_active: newLinkOptions.is_active
        });

      if (error) {
        console.error('Error generating link:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate review link. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setNewLinkOptions({
        expires_in_days: '',
        max_uses: '',
        is_active: true
      });

      setIsGenerateOpen(false);
      onRefresh();

      toast({
        title: 'Success',
        description: 'Review link generated successfully!',
      });
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (shortCode: string) => {
    const url = `${window.location.origin}/review/${shortCode}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(shortCode);
    setTimeout(() => setCopiedCode(null), 2000);

    toast({
      title: 'Copied!',
      description: 'Review link copied to clipboard.',
    });
  };

  const toggleLinkStatus = async (link: TestimonialLink) => {
    try {
      const { error } = await supabase
        .from('testimonial_links')
        .update({ is_active: !link.is_active })
        .eq('id', link.id);

      if (error) {
        console.error('Error updating link:', error);
        toast({
          title: 'Error',
          description: 'Failed to update link status.',
          variant: 'destructive',
        });
        return;
      }

      onRefresh();
      toast({
        title: 'Success',
        description: `Link ${link.is_active ? 'deactivated' : 'activated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('testimonial_links')
        .delete()
        .eq('id', linkId);

      if (error) {
        console.error('Error deleting link:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete link. Please check your permissions and try again.',
          variant: 'destructive',
        });
        return;
      }

      onRefresh();
      toast({
        title: 'Success',
        description: 'Link deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the link.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isMaxUsesReached = (link: TestimonialLink) => {
    if (!link.max_uses) return false;
    return link.use_count >= link.max_uses;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Review Link Generator</h3>
          <p className="text-muted-foreground">Generate short links to send to clients for leaving reviews</p>
        </div>

        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              Generate New Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Generate Review Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="expires-in">Expires In (Days)</Label>
                <Input
                  id="expires-in"
                  type="number"
                  placeholder="Leave empty for no expiration"
                  value={newLinkOptions.expires_in_days}
                  onChange={(e) => setNewLinkOptions(prev => ({ ...prev, expires_in_days: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Set how many days until the link expires
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-uses">Maximum Uses</Label>
                <Input
                  id="max-uses"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={newLinkOptions.max_uses}
                  onChange={(e) => setNewLinkOptions(prev => ({ ...prev, max_uses: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Limit how many times this link can be used
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newLinkOptions.is_active}
                  onCheckedChange={(checked) => setNewLinkOptions(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Link is active</Label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsGenerateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateLink}
                  disabled={isGenerating}
                  className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2" size={16} />
                      Generate Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {links.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Link2 size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium text-foreground mb-2">No review links yet</p>
            <p className="text-sm text-muted-foreground">Generate your first link to start collecting client reviews</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {links.map((link) => {
            const expired = isExpired(link.expires_at);
            const maxReached = isMaxUsesReached(link);
            const linkUrl = `${window.location.origin}/review/${link.short_code}`;
            const isLinkUsable = link.is_active && !expired && !maxReached;

            return (
              <Card key={link.id} className="bg-background border-border hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Link2 className="text-accent" size={20} />
                          <code className="text-lg font-mono font-semibold text-card-foreground">
                            {link.short_code}
                          </code>
                          <Badge
                            className={
                              isLinkUsable
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {isLinkUsable ? 'Active' : expired ? 'Expired' : maxReached ? 'Max Uses' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                        <code className="text-sm text-muted-foreground break-all flex-1">
                          {linkUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(link.short_code)}
                          className="ml-2 flex-shrink-0"
                        >
                          {copiedCode === link.short_code ? (
                            <Check className="text-green-500" size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium text-foreground">{formatDate(link.created_at)}</p>
                        </div>

                        {link.expires_at && (
                          <div>
                            <p className="text-muted-foreground">Expires</p>
                            <p className={`font-medium ${expired ? 'text-red-500' : 'text-foreground'}`}>
                              {formatDate(link.expires_at)}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-muted-foreground">Uses</p>
                          <p className="font-medium text-foreground">
                            {link.use_count} {link.max_uses ? `/ ${link.max_uses}` : ''}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium text-foreground">
                            {link.is_active ? 'Active' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleLinkStatus(link)}
                        title={link.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {link.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review Link</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this review link? Reviews already submitted will not be affected.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteLink(link.id)}
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
            );
          })}
        </div>
      )}
    </div>
  );
};
