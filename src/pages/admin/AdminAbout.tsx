import { useEffect, useState } from 'react';
import { 
  Edit, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Type,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Move,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AboutContent {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminAbout = () => {
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<AboutContent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [newSection, setNewSection] = useState({
    section: '',
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    upload_type: 'url' as 'upload' | 'url',
    is_active: true
  });

  useEffect(() => {
    fetchAboutContent();
    
    // Set up real-time subscription
    const aboutSubscription = supabase
      .channel('about-content-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'about_content' },
        () => {
          fetchAboutContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(aboutSubscription);
    };
  }, []);

  const fetchAboutContent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching about content:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch about content. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setAboutContent(data || []);
    } catch (error) {
      console.error('Error fetching about content:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching content.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file.',
          variant: 'destructive',
        });
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `about-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: 'Upload Failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred during upload.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const updateAboutContent = async (section: AboutContent) => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('about_content')
        .update({
          title: section.title || null,
          subtitle: section.subtitle || null,
          content: section.content || null,
          image_url: section.image_url || null,
          is_active: section.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id);

      if (error) {
        console.error('Error updating about content:', error);
        toast({
          title: 'Error',
          description: 'Failed to update content. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Refresh the data from database
      await fetchAboutContent();
      
      setIsEditDialogOpen(false);
      setEditingSection(null);
      toast({
        title: 'Success',
        description: 'Content updated successfully.',
      });
    } catch (error) {
      console.error('Error updating about content:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addNewSection = async () => {
    try {
      if (!newSection.section || !newSection.title) {
        toast({
          title: 'Missing Information',
          description: 'Please provide at least a section name and title.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      const { error } = await supabase
        .from('about_content')
        .insert({
          section: newSection.section.toLowerCase().replace(/\s+/g, '-'),
          title: newSection.title,
          subtitle: newSection.subtitle || null,
          content: newSection.content || null,
          image_url: newSection.image_url || null,
          display_order: aboutContent.length,
          is_active: newSection.is_active
        });

      if (error) {
        console.error('Error adding about content:', error);
        toast({
          title: 'Error',
          description: 'Failed to add new section. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Refresh the data from database
      await fetchAboutContent();
      
      // Reset form
      setNewSection({
        section: '',
        title: '',
        subtitle: '',
        content: '',
        image_url: '',
        upload_type: 'url',
        is_active: true
      });

      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'New section added successfully.',
      });
    } catch (error) {
      console.error('Error adding about content:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('about_content')
        .delete()
        .eq('id', sectionId);

      if (error) {
        console.error('Error deleting section:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete section. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Refresh the data from database
      await fetchAboutContent();
      
      toast({
        title: 'Success',
        description: 'Section deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const toggleSectionVisibility = async (section: AboutContent) => {
    try {
      const { error } = await supabase
        .from('about_content')
        .update({ 
          is_active: !section.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.id);

      if (error) {
        console.error('Error updating visibility:', error);
        toast({
          title: 'Error',
          description: 'Failed to update visibility.',
          variant: 'destructive',
        });
        return;
      }

      // Refresh the data from database
      await fetchAboutContent();
      
      toast({
        title: 'Success',
        description: `Section ${!section.is_active ? 'shown' : 'hidden'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
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
            <h1 className="font-heading text-3xl font-bold text-foreground">
              About Us Management
            </h1>
            <p className="text-muted-foreground">
              Edit all content and images for the About page
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchAboutContent}
              disabled={isLoading}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Add New About Section</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-section">Section Name</Label>
                      <Input
                        id="new-section"
                        placeholder="e.g., values, mission, team"
                        value={newSection.section}
                        onChange={(e) => setNewSection(prev => ({ ...prev, section: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-title">Title</Label>
                      <Input
                        id="new-title"
                        placeholder="Section title"
                        value={newSection.title}
                        onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-subtitle">Subtitle (Optional)</Label>
                    <Input
                      id="new-subtitle"
                      placeholder="Section subtitle"
                      value={newSection.subtitle}
                      onChange={(e) => setNewSection(prev => ({ ...prev, subtitle: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-content">Content</Label>
                    <Textarea
                      id="new-content"
                      placeholder="Section content..."
                      value={newSection.content}
                      onChange={(e) => setNewSection(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                    />
                  </div>

                  <Tabs value={newSection.upload_type} onValueChange={(value) => setNewSection(prev => ({ ...prev, upload_type: value as 'upload' | 'url' }))}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload Image</TabsTrigger>
                      <TabsTrigger value="url">Image URL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file);
                              if (url) {
                                setNewSection(prev => ({ ...prev, image_url: url }));
                              }
                            }
                          }}
                          className="hidden"
                          id="new-file-upload"
                        />
                        <label htmlFor="new-file-upload" className="cursor-pointer">
                          <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                          <p className="text-lg font-medium text-foreground mb-2">
                            Click to upload image
                          </p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, WebP up to 10MB
                          </p>
                        </label>
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-image-url">Image URL</Label>
                        <Input
                          id="new-image-url"
                          placeholder="https://example.com/image.jpg"
                          value={newSection.image_url}
                          onChange={(e) => setNewSection(prev => ({ ...prev, image_url: e.target.value }))}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {newSection.image_url && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <img 
                          src={newSection.image_url} 
                          alt="Preview"
                          className="w-full h-48 object-cover"
                          onError={() => {
                            toast({
                              title: 'Invalid URL',
                              description: 'The provided URL does not point to a valid image.',
                              variant: 'destructive',
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newSection.is_active}
                      onCheckedChange={(checked) => setNewSection(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Section is active</Label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addNewSection}
                      disabled={isSaving || !newSection.section || !newSection.title}
                      className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Section'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 gap-6">
          {aboutContent.map((section) => (
            <Card key={section.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="font-heading text-xl text-card-foreground capitalize">
                      {section.section.replace('-', ' ')} Section
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={section.is_active}
                        onCheckedChange={() => toggleSectionVisibility(section)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {section.is_active ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSection(section);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="mr-2" size={14} />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Section</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the "{section.section}" section? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteSection(section.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {section.title && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                        <p className="text-lg font-semibold text-card-foreground">{section.title}</p>
                      </div>
                    )}
                    
                    {section.subtitle && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Subtitle</Label>
                        <p className="text-muted-foreground">{section.subtitle}</p>
                      </div>
                    )}
                    
                    {section.content && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Content</Label>
                        <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {section.content.length > 200 
                              ? `${section.content.substring(0, 200)}...` 
                              : section.content
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {section.image_url && section.section !== 'hero' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Image</Label>
                      <div className="aspect-square rounded-lg overflow-hidden border border-border">
                        <img 
                          src={section.image_url}
                          alt={section.title || 'Section image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">
                Edit {editingSection?.section.replace('-', ' ')} Section
              </DialogTitle>
            </DialogHeader>
            {editingSection && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editingSection.title || ''}
                      onChange={(e) => setEditingSection(prev => prev ? { ...prev, title: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subtitle">Subtitle</Label>
                    <Input
                      id="edit-subtitle"
                      value={editingSection.subtitle || ''}
                      onChange={(e) => setEditingSection(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editingSection.content || ''}
                    onChange={(e) => setEditingSection(prev => prev ? { ...prev, content: e.target.value } : null)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                {editingSection.section !== 'hero' && (
                  <>
                    <Tabs defaultValue="url">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload New Image</TabsTrigger>
                        <TabsTrigger value="url">Image URL</TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file);
                                if (url) {
                                  setEditingSection(prev => prev ? { ...prev, image_url: url } : null);
                                }
                              }
                            }}
                            className="hidden"
                            id="edit-file-upload"
                          />
                          <label htmlFor="edit-file-upload" className="cursor-pointer">
                            <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                            <p className="text-lg font-medium text-foreground mb-2">
                              Click to upload new image
                            </p>
                            <p className="text-sm text-muted-foreground">
                              JPG, PNG, WebP up to 10MB
                            </p>
                          </label>
                        </div>
                      </TabsContent>

                      <TabsContent value="url" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-image-url">Image URL</Label>
                          <Input
                            id="edit-image-url"
                            placeholder="https://example.com/image.jpg"
                            value={editingSection.image_url || ''}
                            onChange={(e) => setEditingSection(prev => prev ? { ...prev, image_url: e.target.value } : null)}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    {editingSection.image_url && (
                      <div className="space-y-2">
                        <Label>Current Image</Label>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <img 
                            src={editingSection.image_url}
                            alt={editingSection.title || 'Section image'}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingSection.is_active}
                    onCheckedChange={(checked) => setEditingSection(prev => prev ? { ...prev, is_active: checked } : null)}
                  />
                  <Label>Section is visible on website</Label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateAboutContent(editingSection)}
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
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminAbout;
