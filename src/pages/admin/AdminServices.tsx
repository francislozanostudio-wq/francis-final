import { useEffect, useState } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  Search,
  Filter,
  Move,
  Package,
  FolderPlus
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  categories: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    active: 0,
    inactive: 0,
    categories: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    category: 'general',
    is_active: true
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchServices();
    
    // Set up real-time subscription
    const servicesSubscription = supabase
      .channel('services-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'services' },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    const categoriesSubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'service_categories' },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(servicesSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch services. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setServices(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching services.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (servicesData: Service[]) => {
    const uniqueCategories = new Set(servicesData.map(s => s.category));
    const stats: ServiceStats = {
      total: servicesData.length,
      active: servicesData.filter(s => s.is_active).length,
      inactive: servicesData.filter(s => !s.is_active).length,
      categories: uniqueCategories.size
    };
    setStats(stats);
  };

  const filterServices = () => {
    let filtered = [...services];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(term) ||
        (service.description?.toLowerCase().includes(term)) ||
        service.category.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(service => service.is_active === isActive);
    }

    setFilteredServices(filtered);
  };

  const addService = async () => {
    try {
      if (!newService.name || newService.price <= 0 || newService.duration <= 0) {
        toast({
          title: 'Missing Information',
          description: 'Please provide service name, valid price, and duration.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      const { error } = await supabase
        .from('services')
        .insert({
          name: newService.name,
          description: newService.description || null,
          price: newService.price,
          duration: newService.duration,
          category: newService.category,
          is_active: newService.is_active,
          display_order: services.length
        });

      if (error) {
        console.error('Error adding service:', error);
        toast({
          title: 'Error',
          description: 'Failed to add service. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Reset form
      setNewService({
        name: '',
        description: '',
        price: 0,
        duration: 60,
        category: 'general',
        is_active: true
      });

      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Service added successfully.',
      });
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateService = async () => {
    if (!editingService) return;

    try {
      if (!editingService.name || editingService.price <= 0 || editingService.duration <= 0) {
        toast({
          title: 'Invalid Data',
          description: 'Please provide valid service name, price, and duration.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      const { error } = await supabase
        .from('services')
        .update({
          name: editingService.name,
          description: editingService.description || null,
          price: editingService.price,
          duration: editingService.duration,
          category: editingService.category,
          is_active: editingService.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingService.id);

      if (error) {
        console.error('Error updating service:', error);
        toast({
          title: 'Error',
          description: 'Failed to update service. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setIsEditDialogOpen(false);
      setEditingService(null);
      toast({
        title: 'Success',
        description: 'Service updated successfully.',
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.error('Error deleting service:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete service. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Service deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ 
          is_active: !service.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', service.id);

      if (error) {
        console.error('Error updating service status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update service status.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Service ${!service.is_active ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  const addCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        toast({
          title: 'Missing Information',
          description: 'Please provide a category name.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);

      // Generate slug from name
      const slug = newCategory.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { error } = await supabase
        .from('service_categories')
        .insert({
          name: newCategory.name,
          slug: slug,
          display_order: categories.length + 1,
          is_active: true
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: 'Error',
            description: 'A category with this name already exists.',
            variant: 'destructive',
          });
        } else {
          console.error('Error adding category:', error);
          toast({
            title: 'Error',
            description: 'Failed to add category. Please try again.',
            variant: 'destructive',
          });
        }
        return;
      }

      // Reset form
      setNewCategory({ name: '', slug: '' });
      setIsAddCategoryDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Category added successfully.',
      });

      // Refresh categories
      await fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
              Services Management
            </h1>
            <p className="text-muted-foreground">
              Manage your service offerings, pricing, and availability
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchServices}
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
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Add New Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Service Name</Label>
                      <Input
                        id="new-name"
                        placeholder="e.g., Classic Manicure"
                        value={newService.name}
                        onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-category">Category</Label>
                      <Select value={newService.category} onValueChange={(value) => {
                        if (value === '__add_new__') {
                          setIsAddCategoryDialogOpen(true);
                        } else {
                          setNewService(prev => ({ ...prev, category: value }));
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.slug} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="__add_new__" className="text-accent font-medium">
                            <div className="flex items-center">
                              <FolderPlus className="mr-2 h-4 w-4" />
                              Add New Category
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-description">Description</Label>
                    <Textarea
                      id="new-description"
                      placeholder="Describe the service..."
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-price">Price ($)</Label>
                      <Input
                        id="new-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="45.00"
                        value={newService.price || ''}
                        onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-duration">Duration (minutes)</Label>
                      <Input
                        id="new-duration"
                        type="number"
                        min="1"
                        placeholder="60"
                        value={newService.duration || ''}
                        onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newService.is_active}
                      onCheckedChange={(checked) => setNewService(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Service is active and bookable</Label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addService}
                      disabled={isSaving || !newService.name || newService.price <= 0}
                      className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Service'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Package className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Services</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Inactive Services</p>
                  <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
                </div>
                <EyeOff className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-foreground">{stats.categories}</p>
                </div>
                <Filter className="text-accent h-6 w-6" />
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
                    placeholder="Search services by name, description, or category..."
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
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredServices.length} of {services.length} services
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-accent hover:text-accent-foreground"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-card-foreground">
              All Services ({filteredServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No services found</p>
                <p className="text-sm">Add your first service to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="bg-background border-border hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-card-foreground text-lg">
                              {service.name}
                            </h3>
                            <Badge 
                              className={service.is_active 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                              }
                            >
                              {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {categories.find(c => c.slug === service.category)?.name || service.category}
                            </Badge>
                          </div>
                          
                          {service.description && (
                            <p className="text-muted-foreground">
                              {service.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <DollarSign className="mr-1" size={14} />
                              <span className="font-medium">${service.price}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="mr-1" size={14} />
                              <span className="font-medium">{service.duration} minutes</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 lg:ml-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleServiceStatus(service)}
                            >
                              {service.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingService(service);
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
                                  <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{service.name}"? This action cannot be undone and will affect any existing bookings.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteService(service.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Service
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
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
              <DialogTitle className="font-heading text-2xl">Edit Service</DialogTitle>
            </DialogHeader>
            {editingService && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Service Name</Label>
                    <Input
                      id="edit-name"
                      value={editingService.name}
                      onChange={(e) => setEditingService(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={editingService.category} onValueChange={(value) => {
                      if (value === '__add_new__') {
                        setIsAddCategoryDialogOpen(true);
                      } else {
                        setEditingService(prev => prev ? { ...prev, category: value } : null);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__add_new__" className="text-accent font-medium">
                          <div className="flex items-center">
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Add New Category
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingService.price || ''}
                      onChange={(e) => setEditingService(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      min="1"
                      value={editingService.duration || ''}
                      onChange={(e) => setEditingService(prev => prev ? { ...prev, duration: parseInt(e.target.value) || 60 } : null)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingService.is_active}
                    onCheckedChange={(checked) => setEditingService(prev => prev ? { ...prev, is_active: checked } : null)}
                  />
                  <Label>Service is active and bookable</Label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateService}
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

        {/* Add Category Dialog */}
        <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl flex items-center">
                <FolderPlus className="mr-2 text-accent" size={24} />
                Add New Category
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Gel Nails, Spa Treatments"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newCategory.name.trim()) {
                      addCategory();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a descriptive name for your new service category
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddCategoryDialogOpen(false);
                    setNewCategory({ name: '', slug: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={addCategory}
                  disabled={isSaving || !newCategory.name.trim()}
                  className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={16} />
                      Add Category
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
