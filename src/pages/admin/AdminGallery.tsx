import { useEffect, useState } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Edit, 
  Eye,
  Plus,
  Search,
  Filter,
  Star,
  StarOff,
  Move,
  RefreshCw,
  Download,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  media_url: string;
  media_type: 'image' | 'video';
  upload_type: 'upload' | 'url';
  category: string;
  shape: string;
  style: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface GalleryStats {
  total: number;
  images: number;
  videos: number;
  featured: number;
  uploads: number;
  urls: number;
}

const AdminGallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState<GalleryStats>({
    total: 0,
    images: 0,
    videos: 0,
    featured: 0,
    uploads: 0,
    urls: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Form states
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'image' as 'image' | 'video',
    upload_type: 'url' as 'upload' | 'url',
    category: 'general',
    shape: 'almond',
    style: 'classic',
    is_featured: false
  });

  const categories = [
    'general', 'chrome', 'floral', 'abstract', 'minimalist', 'bold', 'romantic', 'french'
  ];

  const shapes = [
    'almond', 'stiletto', 'coffin', 'square', 'round', 'oval'
  ];

  const styles = [
    'classic', 'geometric', 'marble', 'accent', 'foil', 'ombre', 'metallic', 'artistic'
  ];

  useEffect(() => {
    fetchGalleryItems();
    
    // Set up real-time subscription
    const gallerySubscription = supabase
      .channel('gallery-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gallery' },
        () => {
          fetchGalleryItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gallerySubscription);
    };
  }, []);

  useEffect(() => {
    filterItems();
  }, [galleryItems, searchTerm, categoryFilter, typeFilter]);

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery items:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch gallery items. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setGalleryItems(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching gallery items.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (items: GalleryItem[]) => {
    const stats: GalleryStats = {
      total: items.length,
      images: items.filter(item => item.media_type === 'image').length,
      videos: items.filter(item => item.media_type === 'video').length,
      featured: items.filter(item => item.is_featured).length,
      uploads: items.filter(item => item.upload_type === 'upload').length,
      urls: items.filter(item => item.upload_type === 'url').length
    };
    setStats(stats);
  };

  const filterItems = () => {
    let filtered = [...galleryItems];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title?.toLowerCase().includes(term)) ||
        (item.description?.toLowerCase().includes(term)) ||
        item.category.toLowerCase().includes(term) ||
        item.shape.toLowerCase().includes(term) ||
        item.style.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.media_type === typeFilter);
    }

    setFilteredItems(filtered);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image or video file.',
          variant: 'destructive',
        });
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

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

      // Update form with uploaded file URL
      setNewItem(prev => ({
        ...prev,
        media_url: publicUrl,
        media_type: isImage ? 'image' : 'video',
        upload_type: 'upload'
      }));

      setUploadProgress(100);
      toast({
        title: 'Upload Successful',
        description: 'File uploaded successfully. You can now add details and save.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred during upload.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addGalleryItem = async () => {
    try {
      if (!newItem.media_url) {
        toast({
          title: 'Missing Media',
          description: 'Please upload a file or provide a URL.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('gallery')
        .insert({
          title: newItem.title || null,
          description: newItem.description || null,
          media_url: newItem.media_url,
          media_type: newItem.media_type,
          upload_type: newItem.upload_type,
          category: newItem.category,
          shape: newItem.shape,
          style: newItem.style,
          is_featured: newItem.is_featured,
          display_order: galleryItems.length
        });

      if (error) {
        console.error('Error adding gallery item:', error);
        toast({
          title: 'Error',
          description: 'Failed to add gallery item. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Reset form
      setNewItem({
        title: '',
        description: '',
        media_url: '',
        media_type: 'image',
        upload_type: 'url',
        category: 'general',
        shape: 'almond',
        style: 'classic',
        is_featured: false
      });

      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Gallery item added successfully.',
      });
    } catch (error) {
      console.error('Error adding gallery item:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const updateGalleryItem = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('gallery')
        .update({
          title: editingItem.title || null,
          description: editingItem.description || null,
          category: editingItem.category,
          shape: editingItem.shape,
          style: editingItem.style,
          is_featured: editingItem.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingItem.id);

      if (error) {
        console.error('Error updating gallery item:', error);
        toast({
          title: 'Error',
          description: 'Failed to update gallery item. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({
        title: 'Success',
        description: 'Gallery item updated successfully.',
      });
    } catch (error) {
      console.error('Error updating gallery item:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const deleteGalleryItem = async (item: GalleryItem) => {
    try {
      // If it's an uploaded file, delete from storage too
      if (item.upload_type === 'upload') {
        const fileName = item.media_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('gallery')
            .remove([fileName]);
        }
      }

      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', item.id);

      if (error) {
        console.error('Error deleting gallery item:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete gallery item. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Gallery item deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const toggleFeatured = async (item: GalleryItem) => {
    try {
      const { error } = await supabase
        .from('gallery')
        .update({ 
          is_featured: !item.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) {
        console.error('Error updating featured status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update featured status.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Item ${!item.is_featured ? 'featured' : 'unfeatured'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
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
              Gallery Management
            </h1>
            <p className="text-muted-foreground">
              Manage your portfolio images and videos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchGalleryItems}
              disabled={isLoading}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List size={16} />
              </Button>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Media
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Add New Gallery Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <Tabs value={newItem.upload_type} onValueChange={(value) => setNewItem(prev => ({ ...prev, upload_type: value as 'upload' | 'url' }))}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="flex items-center">
                        <Upload className="mr-2" size={16} />
                        Upload File
                      </TabsTrigger>
                      <TabsTrigger value="url" className="flex items-center">
                        <LinkIcon className="mr-2" size={16} />
                        Paste URL
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                          <p className="text-lg font-medium text-foreground mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Images: JPG, PNG, WebP up to 10MB<br />
                            Videos: MP4, WebM up to 50MB
                          </p>
                        </label>
                      </div>
                      
                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-accent h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="media-url">Media URL</Label>
                        <Input
                          id="media-url"
                          placeholder="https://example.com/image.jpg"
                          value={newItem.media_url}
                          onChange={(e) => setNewItem(prev => ({ ...prev, media_url: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="media-type">Media Type</Label>
                        <Select value={newItem.media_type} onValueChange={(value) => setNewItem(prev => ({ ...prev, media_type: value as 'image' | 'video' }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Preview */}
                  {newItem.media_url && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="border border-border rounded-lg overflow-hidden">
                        {newItem.media_type === 'image' ? (
                          <img 
                            src={newItem.media_url} 
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
                        ) : (
                          <video 
                            src={newItem.media_url} 
                            className="w-full h-48 object-cover"
                            controls
                            onError={() => {
                              toast({
                                title: 'Invalid URL',
                                description: 'The provided URL does not point to a valid video.',
                                variant: 'destructive',
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Details Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title (Optional)</Label>
                      <Input
                        id="title"
                        placeholder="Beautiful nail design"
                        value={newItem.title}
                        onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shape">Nail Shape</Label>
                      <Select value={newItem.shape} onValueChange={(value) => setNewItem(prev => ({ ...prev, shape: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {shapes.map(shape => (
                            <SelectItem key={shape} value={shape}>
                              {shape.charAt(0).toUpperCase() + shape.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="style">Style</Label>
                      <Select value={newItem.style} onValueChange={(value) => setNewItem(prev => ({ ...prev, style: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map(style => (
                            <SelectItem key={style} value={style}>
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe this nail design..."
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newItem.is_featured}
                      onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, is_featured: checked }))}
                    />
                    <Label>Feature this item</Label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addGalleryItem}
                      disabled={!newItem.media_url}
                      className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                    >
                      Add to Gallery
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <ImageIcon className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Images</p>
                  <p className="text-2xl font-bold text-foreground">{stats.images}</p>
                </div>
                <ImageIcon className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Videos</p>
                  <p className="text-2xl font-bold text-foreground">{stats.videos}</p>
                </div>
                <Video className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Featured</p>
                  <p className="text-2xl font-bold text-foreground">{stats.featured}</p>
                </div>
                <Star className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uploads</p>
                  <p className="text-2xl font-bold text-foreground">{stats.uploads}</p>
                </div>
                <Upload className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">URLs</p>
                  <p className="text-2xl font-bold text-foreground">{stats.urls}</p>
                </div>
                <LinkIcon className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search by title, description, category, shape, or style..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(searchTerm || categoryFilter !== 'all' || typeFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredItems.length} of {galleryItems.length} items
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-accent hover:text-accent-foreground"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gallery Grid/List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-card-foreground">
              Gallery Items ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No gallery items found</p>
                <p className="text-sm">Add your first gallery item to get started</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="bg-background border-border hover:shadow-md transition-all duration-200 group">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        {item.media_type === 'image' ? (
                          <img 
                            src={item.media_url}
                            alt={item.title || 'Gallery item'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <video 
                            src={item.media_url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => toggleFeatured(item)}
                            >
                              {item.is_featured ? <StarOff size={14} /> : <Star size={14} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setEditingItem(item);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit size={14} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 size={14} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Gallery Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this gallery item? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteGalleryItem(item)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {item.is_featured && (
                            <Badge className="bg-gold text-luxury-black">
                              <Star size={10} className="mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {item.media_type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-medium text-card-foreground mb-1">
                          {item.title || 'Untitled'}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.shape}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.style}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="bg-background border-border">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          {item.media_type === 'image' ? (
                            <img 
                              src={item.media_url}
                              alt={item.title || 'Gallery item'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video 
                              src={item.media_url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-card-foreground">
                              {item.title || 'Untitled'}
                            </h3>
                            {item.is_featured && (
                              <Badge className="bg-gold text-luxury-black">
                                <Star size={10} className="mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {item.media_type}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.shape}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.style}
                            </Badge>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFeatured(item)}
                          >
                            {item.is_featured ? <StarOff size={14} /> : <Star size={14} />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(item);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Gallery Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this gallery item? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteGalleryItem(item)}
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
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Edit Gallery Item</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-6">
                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    {editingItem.media_type === 'image' ? (
                      <img 
                        src={editingItem.media_url}
                        alt={editingItem.title || 'Gallery item'}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <video 
                        src={editingItem.media_url}
                        className="w-full h-48 object-cover"
                        controls
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={editingItem.category} onValueChange={(value) => setEditingItem(prev => prev ? { ...prev, category: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-shape">Shape</Label>
                    <Select value={editingItem.shape} onValueChange={(value) => setEditingItem(prev => prev ? { ...prev, shape: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shapes.map(shape => (
                          <SelectItem key={shape} value={shape}>
                            {shape.charAt(0).toUpperCase() + shape.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-style">Style</Label>
                    <Select value={editingItem.style} onValueChange={(value) => setEditingItem(prev => prev ? { ...prev, style: value } : null)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map(style => (
                          <SelectItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingItem.is_featured}
                    onCheckedChange={(checked) => setEditingItem(prev => prev ? { ...prev, is_featured: checked } : null)}
                  />
                  <Label>Feature this item</Label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateGalleryItem}
                    className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                  >
                    Save Changes
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

export default AdminGallery;
