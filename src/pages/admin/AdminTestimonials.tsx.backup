import { useEffect, useState } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Search,
  Filter,
  Move,
  MessageSquare,
  Upload,
  Link as LinkIcon,
  ExternalLink,
  Quote,
  User,
  MapPin,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  client_name: string;
  client_location?: string;
  rating: number;
  testimonial_text: string;
  service_name?: string;
  client_image_url?: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ReviewLink {
  id: string;
  platform: string;
  platform_name: string;
  url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface TestimonialStats {
  total: number;
  active: number;
  featured: number;
  averageRating: number;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [reviewLinks, setReviewLinks] = useState<ReviewLink[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<TestimonialStats>({
    total: 0,
    active: 0,
    featured: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddTestimonialOpen, setIsAddTestimonialOpen] = useState(false);
  const [isEditTestimonialOpen, setIsEditTestimonialOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isEditLinkOpen, setIsEditLinkOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingLink, setEditingLink] = useState<ReviewLink | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [newTestimonial, setNewTestimonial] = useState({
    client_name: '',
    client_location: '',
    rating: 5,
    testimonial_text: '',
    service_name: '',
    client_image_url: '',
    upload_type: 'url' as 'upload' | 'url',
    is_featured: false,
    is_active: true
  });

  const [newLink, setNewLink] = useState({
    platform: '',
    platform_name: '',
    url: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscriptions
    const testimonialsSubscription = supabase
      .channel('testimonials-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'testimonials' },
        () => fetchData()
      )
      .subscribe();

    const reviewLinksSubscription = supabase
      .channel('review-links-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'review_links' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(testimonialsSubscription);
      supabase.removeChannel(reviewLinksSubscription);
    };
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, searchTerm, ratingFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [testimonialsResult, reviewLinksResult] = await Promise.all([
        supabase
          .from('testimonials')
          .select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false }),
        supabase
          .from('review_links')
          .select('*')
          .order('display_order', { ascending: true })
      ]);

      if (testimonialsResult.error) {
        console.error('Error fetching testimonials:', testimonialsResult.error);
        toast({
          title: 'Error',
          description: 'Failed to fetch testimonials. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      if (reviewLinksResult.error) {
        console.error('Error fetching review links:', reviewLinksResult.error);
        toast({
          title: 'Error',
          description: 'Failed to fetch review links. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setTestimonials(testimonialsResult.data || []);
      setReviewLinks(reviewLinksResult.data || []);
      calculateStats(testimonialsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (testimonialsData: Testimonial[]) => {
    const activeTestimonials = testimonialsData.filter(t => t.is_active);
    const totalRating = activeTestimonials.reduce((sum, t) => sum + t.rating, 0);
    
    const stats: TestimonialStats = {
      total: testimonialsData.length,
      active: activeTestimonials.length,
      featured: testimonialsData.filter(t => t.is_featured && t.is_active).length,
      averageRating: activeTestimonials.length > 0 ? totalRating / activeTestimonials.length : 0
    };
    setStats(stats);
  };

  const filterTestimonials = () => {
    let filtered = [...testimonials];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(testimonial =>
        testimonial.client_name.toLowerCase().includes(term) ||
        testimonial.testimonial_text.toLowerCase().includes(term) ||
        (testimonial.service_name?.toLowerCase().includes(term)) ||
        (testimonial.client_location?.toLowerCase().includes(term))
      );
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(testimonial => testimonial.rating === parseInt(ratingFilter));
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(testimonial => testimonial.is_active === isActive);
    }

    setFilteredTestimonials(filtered);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file.',
          variant: 'destructive',
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

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

  const addTestimonial = async () => {
    try {
      if (!newTestimonial.client_name || !newTestimonial.testimonial_text) {
        toast({
          title: 'Missing Information',
          description: 'Please provide client name and testimonial text.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      const { error } = await supabase
        .from('testimonials')
        .insert({
          client_name: newTestimonial.client_name,
          client_location: newTestimonial.client_location || null,
          rating: newTestimonial.rating,
          testimonial_text: newTestimonial.testimonial_text,
          service_name: newTestimonial.service_name || null,
          client_image_url: newTestimonial.client_image_url || null,
          is_featured: newTestimonial.is_featured,
          is_active: newTestimonial.is_active,
          display_order: testimonials.length
        });

      if (error) {
        console.error('Error adding testimonial:', error);
        toast({
          title: 'Error',
          description: 'Failed to add testimonial. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setNewTestimonial({
        client_name: '',
        client_location: '',
        rating: 5,
        testimonial_text: '',
        service_name: '',
        client_image_url: '',
        upload_type: 'url',
        is_featured: false,
        is_active: true
      });

      setIsAddTestimonialOpen(false);
      toast({
        title: 'Success',
        description: 'Testimonial added successfully.',
      });
    } catch (error) {
      console.error('Error adding testimonial:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTestimonial = async () => {
    if (!editingTestimonial) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('testimonials')
        .update({
          client_name: editingTestimonial.client_name,
          client_location: editingTestimonial.client_location || null,
          rating: editingTestimonial.rating,
          testimonial_text: editingTestimonial.testimonial_text,
          service_name: editingTestimonial.service_name || null,
          client_image_url: editingTestimonial.client_image_url || null,
          is_featured: editingTestimonial.is_featured,
          is_active: editingTestimonial.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTestimonial.id);

      if (error) {
        console.error('Error updating testimonial:', error);
        toast({
          title: 'Error',
          description: 'Failed to update testimonial. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setIsEditTestimonialOpen(false);
      setEditingTestimonial(null);
      toast({
        title: 'Success',
        description: 'Testimonial updated successfully.',
      });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTestimonial = async (testimonialId: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId);

      if (error) {
        console.error('Error deleting testimonial:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete testimonial. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const toggleTestimonialStatus = async (testimonial: Testimonial, field: 'is_active' | 'is_featured') => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ 
          [field]: !testimonial[field],
          updated_at: new Date().toISOString()
        })
        .eq('id', testimonial.id);

      if (error) {
        console.error(`Error updating ${field}:`, error);
        toast({
          title: 'Error',
          description: `Failed to update testimonial ${field}.`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Testimonial ${field === 'is_active' ? (testimonial.is_active ? 'hidden' : 'shown') : (testimonial.is_featured ? 'unfeatured' : 'featured')} successfully.`,
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const addReviewLink = async () => {
    try {
      if (!newLink.platform || !newLink.platform_name || !newLink.url) {
        toast({
          title: 'Missing Information',
          description: 'Please provide platform, name, and URL.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      const { error } = await supabase
        .from('review_links')
        .insert({
          platform: newLink.platform.toLowerCase().replace(/\s+/g, '-'),
          platform_name: newLink.platform_name,
          url: newLink.url,
          is_active: newLink.is_active,
          display_order: reviewLinks.length
        });

      if (error) {
        console.error('Error adding review link:', error);
        toast({
          title: 'Error',
          description: 'Failed to add review link. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setNewLink({
        platform: '',
        platform_name: '',
        url: '',
        is_active: true
      });

      setIsAddLinkOpen(false);
      toast({
        title: 'Success',
        description: 'Review link added successfully.',
      });
    } catch (error) {
      console.error('Error adding review link:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateReviewLink = async () => {
    if (!editingLink) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('review_links')
        .update({
          platform_name: editingLink.platform_name,
          url: editingLink.url,
          is_active: editingLink.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingLink.id);

      if (error) {
        console.error('Error updating review link:', error);
        toast({
          title: 'Error',
          description: 'Failed to update review link. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setIsEditLinkOpen(false);
      setEditingLink(null);
      toast({
        title: 'Success',
        description: 'Review link updated successfully.',
      });
    } catch (error) {
      console.error('Error updating review link:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteReviewLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('review_links')
        .delete()
        .eq('id', linkId);

      if (error) {
        console.error('Error deleting review link:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete review link. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Review link deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting review link:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
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
            <h1 className="font-heading text-3xl font-bold text-foreground flex items-center">
              <Quote className="mr-3 text-accent" size={32} />
              Testimonials Management
            </h1>
            <p className="text-muted-foreground">
              Manage client testimonials and external review platform links
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Testimonials</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <MessageSquare className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                </div>
                <Eye className="text-accent h-6 w-6" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Award className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="testimonials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="testimonials" className="flex items-center">
              <Quote className="mr-2" size={16} />
              Testimonials ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="review-links" className="flex items-center">
              <ExternalLink className="mr-2" size={16} />
              Review Links ({reviewLinks.length})
            </TabsTrigger>
          </TabsList>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-6">
            {/* Filters and Add Button */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col lg:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Search testimonials by name, text, service, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Dialog open={isAddTestimonialOpen} onOpenChange={setIsAddTestimonialOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Testimonial
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-2xl">Add New Testimonial</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-client-name">Client Name *</Label>
                        <Input
                          id="new-client-name"
                          placeholder="e.g., Sarah M."
                          value={newTestimonial.client_name}
                          onChange={(e) => setNewTestimonial(prev => ({ ...prev, client_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-client-location">Location</Label>
                        <Input
                          id="new-client-location"
                          placeholder="e.g., Nashville, TN"
                          value={newTestimonial.client_location}
                          onChange={(e) => setNewTestimonial(prev => ({ ...prev, client_location: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-rating">Rating</Label>
                        <div className="space-y-3">
                          <Slider
                            value={[newTestimonial.rating]}
                            onValueChange={(value) => setNewTestimonial(prev => ({ ...prev, rating: value[0] }))}
                            max={5}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex items-center justify-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={20} 
                                className={`${
                                  star <= newTestimonial.rating 
                                    ? 'text-gold fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                            <span className="ml-2 font-medium">{newTestimonial.rating} stars</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-service-name">Service Name</Label>
                        <Input
                          id="new-service-name"
                          placeholder="e.g., Custom Chrome Art"
                          value={newTestimonial.service_name}
                          onChange={(e) => setNewTestimonial(prev => ({ ...prev, service_name: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-testimonial-text">Testimonial Text *</Label>
                      <Textarea
                        id="new-testimonial-text"
                        placeholder="Enter the client's testimonial..."
                        value={newTestimonial.testimonial_text}
                        onChange={(e) => setNewTestimonial(prev => ({ ...prev, testimonial_text: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <Tabs value={newTestimonial.upload_type} onValueChange={(value) => setNewTestimonial(prev => ({ ...prev, upload_type: value as 'upload' | 'url' }))}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload Photo</TabsTrigger>
                        <TabsTrigger value="url">Photo URL</TabsTrigger>
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
                                  setNewTestimonial(prev => ({ ...prev, client_image_url: url }));
                                }
                              }
                            }}
                            className="hidden"
                            id="new-file-upload"
                          />
                          <label htmlFor="new-file-upload" className="cursor-pointer">
                            <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                            <p className="text-lg font-medium text-foreground mb-2">
                              Click to upload client photo
                            </p>
                            <p className="text-sm text-muted-foreground">
                              JPG, PNG, WebP up to 10MB (Optional)
                            </p>
                          </label>
                        </div>
                      </TabsContent>

                      <TabsContent value="url" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-image-url">Client Photo URL</Label>
                          <Input
                            id="new-image-url"
                            placeholder="https://example.com/client-photo.jpg"
                            value={newTestimonial.client_image_url}
                            onChange={(e) => setNewTestimonial(prev => ({ ...prev, client_image_url: e.target.value }))}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    {newTestimonial.client_image_url && (
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <img 
                            src={newTestimonial.client_image_url} 
                            alt="Client preview"
                            className="w-full h-32 object-cover"
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

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newTestimonial.is_featured}
                          onCheckedChange={(checked) => setNewTestimonial(prev => ({ ...prev, is_featured: checked }))}
                        />
                        <Label>Feature this testimonial</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newTestimonial.is_active}
                          onCheckedChange={(checked) => setNewTestimonial(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label>Testimonial is active</Label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddTestimonialOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={addTestimonial}
                        disabled={isSaving || !newTestimonial.client_name || !newTestimonial.testimonial_text}
                        className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          'Add Testimonial'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Testimonials List */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-card-foreground">
                  All Testimonials ({filteredTestimonials.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTestimonials.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Quote size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No testimonials found</p>
                    <p className="text-sm">Add your first testimonial to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTestimonials.map((testimonial) => (
                      <Card key={testimonial.id} className="bg-background border-border hover:shadow-md transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Client Photo */}
                            {testimonial.client_image_url && (
                              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                                <img 
                                  src={testimonial.client_image_url}
                                  alt={testimonial.client_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Content */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <h3 className="font-semibold text-card-foreground text-lg">
                                    {testimonial.client_name}
                                  </h3>
                                  {testimonial.client_location && (
                                    <span className="text-sm text-muted-foreground">
                                      {testimonial.client_location}
                                    </span>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star} 
                                        size={14} 
                                        className={`${
                                          star <= testimonial.rating 
                                            ? 'text-gold fill-current' 
                                            : 'text-gray-300'
                                        }`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {testimonial.is_featured && (
                                    <Badge className="bg-gold text-luxury-black">
                                      <Star size={10} className="mr-1" />
                                      Featured
                                    </Badge>
                                  )}
                                  <Badge 
                                    className={testimonial.is_active 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : 'bg-red-100 text-red-800 border-red-200'
                                    }
                                  >
                                    {testimonial.is_active ? 'Active' : 'Hidden'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <blockquote className="text-muted-foreground italic">
                                "{testimonial.testimonial_text}"
                              </blockquote>
                              
                              {testimonial.service_name && (
                                <p className="text-sm font-medium text-accent">
                                  Service: {testimonial.service_name}
                                </p>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex flex-col space-y-2 lg:ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleTestimonialStatus(testimonial, 'is_featured')}
                              >
                                {testimonial.is_featured ? <StarOff size={14} /> : <Star size={14} />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleTestimonialStatus(testimonial, 'is_active')}
                              >
                                {testimonial.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingTestimonial(testimonial);
                                  setIsEditTestimonialOpen(true);
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
                                    <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the testimonial from {testimonial.client_name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteTestimonial(testimonial.id)}
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
          </TabsContent>

          {/* Review Links Tab */}
          <TabsContent value="review-links" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">External Review Links</h3>
                <p className="text-muted-foreground">Manage links to Google Reviews, Instagram, and other platforms</p>
              </div>
              
              <Dialog open={isAddLinkOpen} onOpenChange={setIsAddLinkOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Review Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading text-2xl">Add Review Platform Link</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-platform">Platform ID</Label>
                        <Input
                          id="new-platform"
                          placeholder="e.g., yelp, facebook"
                          value={newLink.platform}
                          onChange={(e) => setNewLink(prev => ({ ...prev, platform: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-platform-name">Display Name</Label>
                        <Input
                          id="new-platform-name"
                          placeholder="e.g., Yelp Reviews"
                          value={newLink.platform_name}
                          onChange={(e) => setNewLink(prev => ({ ...prev, platform_name: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-url">Review URL</Label>
                      <Input
                        id="new-url"
                        placeholder="https://..."
                        value={newLink.url}
                        onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newLink.is_active}
                        onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label>Link is active</Label>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddLinkOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={addReviewLink}
                        disabled={isSaving || !newLink.platform || !newLink.platform_name || !newLink.url}
                        className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          'Add Link'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewLinks.map((link) => (
                <Card key={link.id} className="bg-background border-border hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-card-foreground">
                            {link.platform_name}
                          </h3>
                          <Badge 
                            className={link.is_active 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {link.is_active ? 'Active' : 'Hidden'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 break-all">
                          {link.url}
                        </p>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link.url, '_blank')}
                          className="w-full"
                        >
                          <ExternalLink className="mr-2" size={14} />
                          Test Link
                        </Button>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingLink(link);
                            setIsEditLinkOpen(true);
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
                              <AlertDialogTitle>Delete Review Link</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the {link.platform_name} link? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReviewLink(link.id)}
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
          </TabsContent>
        </Tabs>

        {/* Edit Testimonial Dialog */}
        <Dialog open={isEditTestimonialOpen} onOpenChange={setIsEditTestimonialOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Edit Testimonial</DialogTitle>
            </DialogHeader>
            {editingTestimonial && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-client-name">Client Name</Label>
                    <Input
                      id="edit-client-name"
                      value={editingTestimonial.client_name}
                      onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, client_name: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-client-location">Location</Label>
                    <Input
                      id="edit-client-location"
                      value={editingTestimonial.client_location || ''}
                      onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, client_location: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-rating">Rating</Label>
                    <div className="space-y-3">
                      <Slider
                        value={[editingTestimonial.rating]}
                        onValueChange={(value) => setEditingTestimonial(prev => prev ? { ...prev, rating: value[0] } : null)}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex items-center justify-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={20} 
                            className={`${
                              star <= editingTestimonial.rating 
                                ? 'text-gold fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="ml-2 font-medium">{editingTestimonial.rating} stars</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-service-name">Service Name</Label>
                    <Input
                      id="edit-service-name"
                      value={editingTestimonial.service_name || ''}
                      onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, service_name: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-testimonial-text">Testimonial Text</Label>
                  <Textarea
                    id="edit-testimonial-text"
                    value={editingTestimonial.testimonial_text}
                    onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, testimonial_text: e.target.value } : null)}
                    rows={4}
                  />
                </div>

                <Tabs defaultValue="url">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload New Photo</TabsTrigger>
                    <TabsTrigger value="url">Photo URL</TabsTrigger>
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
                              setEditingTestimonial(prev => prev ? { ...prev, client_image_url: url } : null);
                            }
                          }
                        }}
                        className="hidden"
                        id="edit-file-upload"
                      />
                      <label htmlFor="edit-file-upload" className="cursor-pointer">
                        <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                        <p className="text-lg font-medium text-foreground mb-2">
                          Click to upload new photo
                        </p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, WebP up to 10MB
                        </p>
                      </label>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-image-url">Client Photo URL</Label>
                      <Input
                        id="edit-image-url"
                        placeholder="https://example.com/client-photo.jpg"
                        value={editingTestimonial.client_image_url || ''}
                        onChange={(e) => setEditingTestimonial(prev => prev ? { ...prev, client_image_url: e.target.value } : null)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {editingTestimonial.client_image_url && (
                  <div className="space-y-2">
                    <Label>Current Photo</Label>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <img 
                        src={editingTestimonial.client_image_url}
                        alt={editingTestimonial.client_name}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingTestimonial.is_featured}
                      onCheckedChange={(checked) => setEditingTestimonial(prev => prev ? { ...prev, is_featured: checked } : null)}
                    />
                    <Label>Feature this testimonial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingTestimonial.is_active}
                      onCheckedChange={(checked) => setEditingTestimonial(prev => prev ? { ...prev, is_active: checked } : null)}
                    />
                    <Label>Testimonial is active</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditTestimonialOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateTestimonial}
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

        {/* Edit Review Link Dialog */}
        <Dialog open={isEditLinkOpen} onOpenChange={setIsEditLinkOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Edit Review Link</DialogTitle>
            </DialogHeader>
            {editingLink && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-platform-name">Display Name</Label>
                  <Input
                    id="edit-platform-name"
                    value={editingLink.platform_name}
                    onChange={(e) => setEditingLink(prev => prev ? { ...prev, platform_name: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-url">Review URL</Label>
                  <Input
                    id="edit-url"
                    value={editingLink.url}
                    onChange={(e) => setEditingLink(prev => prev ? { ...prev, url: e.target.value } : null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingLink.is_active}
                    onCheckedChange={(checked) => setEditingLink(prev => prev ? { ...prev, is_active: checked } : null)}
                  />
                  <Label>Link is active</Label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditLinkOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateReviewLink}
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

export default AdminTestimonials;