import { useEffect, useState } from 'react';
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  DollarSign,
  Eye,
  EyeOff,
  Search,
  Package,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface AddOnStats {
  total: number;
  active: number;
  inactive: number;
}

const AdminAddOns = () => {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [filteredAddOns, setFilteredAddOns] = useState<AddOn[]>([]);
  const [stats, setStats] = useState<AddOnStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [newAddOn, setNewAddOn] = useState({
    name: '',
    description: '',
    price: 0,
    is_active: true
  });

  useEffect(() => {
    fetchAddOns();
    
    // Set up real-time subscription
    const addOnsSubscription = supabase
      .channel('add-ons-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'add_ons' },
        () => {
          fetchAddOns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(addOnsSubscription);
    };
  }, []);

  useEffect(() => {
    filterAddOns();
  }, [addOns, searchTerm, statusFilter]);

  const fetchAddOns = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching add-ons:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch add-ons. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setAddOns(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching add-ons.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (addOnsData: AddOn[]) => {
    const stats: AddOnStats = {
      total: addOnsData.length,
      active: addOnsData.filter(a => a.is_active).length,
      inactive: addOnsData.filter(a => !a.is_active).length,
    };
    setStats(stats);
  };

  const filterAddOns = () => {
    let filtered = [...addOns];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(addOn =>
        addOn.name.toLowerCase().includes(term) ||
        (addOn.description?.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(addOn => addOn.is_active === isActive);
    }

    setFilteredAddOns(filtered);
  };

  const addAddOn = async () => {
    try {
      if (!newAddOn.name || newAddOn.price < 0) {
        toast({
          title: 'Missing Information',
          description: 'Please provide add-on name and valid price.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      const { error } = await supabase
        .from('add_ons')
        .insert({
          name: newAddOn.name,
          description: newAddOn.description || null,
          price: newAddOn.price,
          is_active: newAddOn.is_active,
          display_order: addOns.length
        });

      if (error) {
        console.error('Error adding add-on:', error);
        toast({
          title: 'Error',
          description: 'Failed to add add-on. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Reset form
      setNewAddOn({
        name: '',
        description: '',
        price: 0,
        is_active: true
      });

      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Add-on created successfully.',
      });
    } catch (error) {
      console.error('Error adding add-on:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateAddOn = async () => {
    if (!editingAddOn) return;

    try {
      if (!editingAddOn.name || editingAddOn.price < 0) {
        toast({
          title: 'Invalid Data',
          description: 'Please provide valid add-on name and price.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      const { error } = await supabase
        .from('add_ons')
        .update({
          name: editingAddOn.name,
          description: editingAddOn.description || null,
          price: editingAddOn.price,
          is_active: editingAddOn.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAddOn.id);

      if (error) {
        console.error('Error updating add-on:', error);
        toast({
          title: 'Error',
          description: 'Failed to update add-on. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setIsEditDialogOpen(false);
      setEditingAddOn(null);
      toast({
        title: 'Success',
        description: 'Add-on updated successfully.',
      });
    } catch (error) {
      console.error('Error updating add-on:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAddOn = async (addOnId: string) => {
    try {
      const { error } = await supabase
        .from('add_ons')
        .delete()
        .eq('id', addOnId);

      if (error) {
        console.error('Error deleting add-on:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete add-on. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Add-on deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting add-on:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const toggleAddOnStatus = async (addOn: AddOn) => {
    try {
      const { error } = await supabase
        .from('add_ons')
        .update({ 
          is_active: !addOn.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', addOn.id);

      if (error) {
        console.error('Error updating add-on status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update add-on status.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Add-on ${!addOn.is_active ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating add-on status:', error);
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
              Add-Ons Management
            </h1>
            <p className="text-muted-foreground">
              Manage additional services that clients can add to their bookings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchAddOns}
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
                  Add New Add-On
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Create New Add-On</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Add-On Name</Label>
                    <Input
                      id="new-name"
                      placeholder="e.g., Extended Hand Massage"
                      value={newAddOn.name}
                      onChange={(e) => setNewAddOn(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-description">Description (Optional)</Label>
                    <Textarea
                      id="new-description"
                      placeholder="Describe what this add-on includes..."
                      value={newAddOn.description}
                      onChange={(e) => setNewAddOn(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-price">Additional Price ($)</Label>
                    <Input
                      id="new-price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="10.00"
                      value={newAddOn.price || ''}
                      onChange={(e) => setNewAddOn(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newAddOn.is_active}
                      onCheckedChange={(checked) => setNewAddOn(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Add-on is active and available for booking</Label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addAddOn}
                      disabled={isSaving || !newAddOn.name || newAddOn.price < 0}
                      className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Create Add-On'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Add-Ons</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Star className="text-accent h-6 w-6" />
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
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
                </div>
                <EyeOff className="text-accent h-6 w-6" />
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
                    placeholder="Search add-ons by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            {(searchTerm || statusFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredAddOns.length} of {addOns.length} add-ons
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
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

        {/* Add-Ons List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-card-foreground">
              All Add-Ons ({filteredAddOns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAddOns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No add-ons found</p>
                <p className="text-sm">Create your first add-on to enhance your services</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAddOns.map((addOn) => (
                  <Card key={addOn.id} className="bg-background border-border hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-card-foreground text-lg">
                              {addOn.name}
                            </h3>
                            <Badge 
                              className={addOn.is_active 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-800 border-red-200'
                              }
                            >
                              {addOn.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          {addOn.description && (
                            <p className="text-muted-foreground">
                              {addOn.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <DollarSign className="mr-1" size={14} />
                              <span className="font-medium">+${addOn.price}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 lg:ml-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAddOnStatus(addOn)}
                            >
                              {addOn.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAddOn(addOn);
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
                                  <AlertDialogTitle>Delete Add-On</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{addOn.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteAddOn(addOn.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Add-On
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
              <DialogTitle className="font-heading text-2xl">Edit Add-On</DialogTitle>
            </DialogHeader>
            {editingAddOn && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Add-On Name</Label>
                  <Input
                    id="edit-name"
                    value={editingAddOn.name}
                    onChange={(e) => setEditingAddOn(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingAddOn.description || ''}
                    onChange={(e) => setEditingAddOn(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price">Additional Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingAddOn.price || ''}
                    onChange={(e) => setEditingAddOn(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingAddOn.is_active}
                    onCheckedChange={(checked) => setEditingAddOn(prev => prev ? { ...prev, is_active: checked } : null)}
                  />
                  <Label>Add-on is active and available for booking</Label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateAddOn}
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

export default AdminAddOns;
