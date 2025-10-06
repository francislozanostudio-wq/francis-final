import { useEffect, useState } from 'react';
import { 
  Languages,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Globe,
  FileText,
  Download,
  Upload,
  Copy,
  CheckCircle,
  AlertCircle
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  getAllTranslations, 
  createTranslation, 
  updateTranslation, 
  deleteTranslation,
  type Translation 
} from '@/lib/translations';

interface TranslationStats {
  total: number;
  translated: number;
  untranslated: number;
  categories: number;
  completionRate: number;
}

const categories = [
  'navigation', 'homepage', 'services', 'gallery', 'about', 'contact', 
  'booking', 'testimonials', 'admin', 'forms', 'common', 'errors', 'success', 'languages'
];

const AdminTranslations = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [stats, setStats] = useState<TranslationStats>({
    total: 0,
    translated: 0,
    untranslated: 0,
    categories: 0,
    completionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [newTranslation, setNewTranslation] = useState({
    key: '',
    category: 'general',
    english_text: '',
    spanish_text: '',
    context: '',
    is_active: true
  });

  useEffect(() => {
    fetchTranslationsData();
  }, []);

  useEffect(() => {
    filterTranslations();
  }, [translations, searchTerm, categoryFilter, statusFilter]);

  const fetchTranslationsData = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTranslations();
      setTranslations(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching translations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch translations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (translationsData: Translation[]) => {
    const uniqueCategories = new Set(translationsData.map(t => t.category));
    const translated = translationsData.filter(t => t.spanish_text && t.spanish_text.trim() !== '');
    
    const stats: TranslationStats = {
      total: translationsData.length,
      translated: translated.length,
      untranslated: translationsData.length - translated.length,
      categories: uniqueCategories.size,
      completionRate: translationsData.length > 0 ? (translated.length / translationsData.length) * 100 : 0
    };
    setStats(stats);
  };

  const filterTranslations = () => {
    let filtered = [...translations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(translation =>
        translation.key.toLowerCase().includes(term) ||
        translation.english_text.toLowerCase().includes(term) ||
        (translation.spanish_text?.toLowerCase().includes(term)) ||
        translation.category.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(translation => translation.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'translated') {
        filtered = filtered.filter(translation => translation.spanish_text && translation.spanish_text.trim() !== '');
      } else if (statusFilter === 'untranslated') {
        filtered = filtered.filter(translation => !translation.spanish_text || translation.spanish_text.trim() === '');
      } else if (statusFilter === 'active') {
        filtered = filtered.filter(translation => translation.is_active);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(translation => !translation.is_active);
      }
    }

    setFilteredTranslations(filtered);
  };

  const addTranslation = async () => {
    try {
      if (!newTranslation.key || !newTranslation.english_text) {
        toast({
          title: 'Missing Information',
          description: 'Please provide at least a key and English text.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      await createTranslation({
        key: newTranslation.key,
        category: newTranslation.category,
        english_text: newTranslation.english_text,
        spanish_text: newTranslation.spanish_text || null,
        context: newTranslation.context || null,
        is_active: newTranslation.is_active
      });

      // Reset form
      setNewTranslation({
        key: '',
        category: 'general',
        english_text: '',
        spanish_text: '',
        context: '',
        is_active: true
      });

      setIsAddDialogOpen(false);
      await fetchTranslationsData();
      
      toast({
        title: 'Success',
        description: 'Translation added successfully.',
      });
    } catch (error) {
      console.error('Error adding translation:', error);
      toast({
        title: 'Error',
        description: 'Failed to add translation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateTranslationData = async () => {
    if (!editingTranslation) return;

    try {
      setIsSaving(true);
      await updateTranslation(editingTranslation.id, {
        key: editingTranslation.key,
        category: editingTranslation.category,
        english_text: editingTranslation.english_text,
        spanish_text: editingTranslation.spanish_text || null,
        context: editingTranslation.context || null,
        is_active: editingTranslation.is_active
      });

      setIsEditDialogOpen(false);
      setEditingTranslation(null);
      await fetchTranslationsData();
      
      toast({
        title: 'Success',
        description: 'Translation updated successfully.',
      });
    } catch (error) {
      console.error('Error updating translation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update translation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTranslationData = async (translationId: string) => {
    try {
      await deleteTranslation(translationId);
      await fetchTranslationsData();
      
      toast({
        title: 'Success',
        description: 'Translation deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete translation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleTranslationStatus = async (translation: Translation) => {
    try {
      await updateTranslation(translation.id, { is_active: !translation.is_active });
      await fetchTranslationsData();
      
      toast({
        title: 'Success',
        description: `Translation ${!translation.is_active ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating translation status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update translation status.',
        variant: 'destructive',
      });
    }
  };

  const exportTranslations = () => {
    const csvContent = [
      ['Key', 'Category', 'English Text', 'Spanish Text', 'Context', 'Status'],
      ...filteredTranslations.map(translation => [
        translation.key,
        translation.category,
        translation.english_text,
        translation.spanish_text || '',
        translation.context || '',
        translation.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Translations exported successfully.',
    });
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
              <Languages className="mr-3 text-accent" size={32} />
              Translation Management
            </h1>
            <p className="text-muted-foreground">
              Manage website translations for English and Spanish
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchTranslationsData}
              disabled={isLoading}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportTranslations}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Translation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Add New Translation</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-key">Translation Key</Label>
                      <Input
                        id="new-key"
                        placeholder="e.g., homepage.hero.title"
                        value={newTranslation.key}
                        onChange={(e) => setNewTranslation(prev => ({ ...prev, key: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-category">Category</Label>
                      <Select value={newTranslation.category} onValueChange={(value) => setNewTranslation(prev => ({ ...prev, category: value }))}>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-english">English Text</Label>
                    <Textarea
                      id="new-english"
                      placeholder="Enter the English text..."
                      value={newTranslation.english_text}
                      onChange={(e) => setNewTranslation(prev => ({ ...prev, english_text: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-spanish">Spanish Translation</Label>
                    <Textarea
                      id="new-spanish"
                      placeholder="Enter the Spanish translation..."
                      value={newTranslation.spanish_text}
                      onChange={(e) => setNewTranslation(prev => ({ ...prev, spanish_text: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-context">Context (Optional)</Label>
                    <Input
                      id="new-context"
                      placeholder="Additional context for translators..."
                      value={newTranslation.context}
                      onChange={(e) => setNewTranslation(prev => ({ ...prev, context: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newTranslation.is_active}
                      onCheckedChange={(checked) => setNewTranslation(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Translation is active</Label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addTranslation}
                      disabled={isSaving || !newTranslation.key || !newTranslation.english_text}
                      className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Translation'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Translations</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Languages className="text-accent h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Translated</p>
                  <p className="text-2xl font-bold text-foreground">{stats.translated}</p>
                </div>
                <CheckCircle className="text-green-500 h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Untranslated</p>
                  <p className="text-2xl font-bold text-foreground">{stats.untranslated}</p>
                </div>
                <AlertCircle className="text-yellow-500 h-6 w-6" />
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

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion</p>
                  <p className="text-2xl font-bold text-foreground">{stats.completionRate.toFixed(1)}%</p>
                </div>
                <Globe className="text-accent h-6 w-6" />
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
                    placeholder="Search by key, English text, Spanish text, or category..."
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

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="translated">Translated</SelectItem>
                    <SelectItem value="untranslated">Untranslated</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredTranslations.length} of {translations.length} translations
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

        {/* Translations List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl text-card-foreground">
              All Translations ({filteredTranslations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTranslations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Languages size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No translations found</p>
                <p className="text-sm">Add your first translation to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTranslations.map((translation) => (
                  <Card key={translation.id} className="bg-background border-border hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-card-foreground text-lg">
                                {translation.key}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {translation.category}
                              </Badge>
                              <Badge 
                                className={translation.is_active 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-red-100 text-red-800 border-red-200'
                                }
                              >
                                {translation.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {translation.spanish_text ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  <CheckCircle size={10} className="mr-1" />
                                  Translated
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  <AlertCircle size={10} className="mr-1" />
                                  Needs Translation
                                </Badge>
                              )}
                            </div>
                            
                            {translation.context && (
                              <p className="text-sm text-muted-foreground italic">
                                Context: {translation.context}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleTranslationStatus(translation)}
                            >
                              {translation.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTranslation(translation);
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
                                  <AlertDialogTitle>Delete Translation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the translation for "{translation.key}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTranslationData(translation.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Translation
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm font-medium text-muted-foreground">English</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(translation.english_text)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy size={12} />
                              </Button>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm text-muted-foreground">
                                {translation.english_text}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm font-medium text-muted-foreground">Spanish</Label>
                              {translation.spanish_text && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(translation.spanish_text!)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy size={12} />
                                </Button>
                              )}
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                              {translation.spanish_text ? (
                                <p className="text-sm text-muted-foreground">
                                  {translation.spanish_text}
                                </p>
                              ) : (
                                <p className="text-sm text-yellow-600 italic">
                                  Translation needed
                                </p>
                              )}
                            </div>
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
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Edit Translation</DialogTitle>
            </DialogHeader>
            {editingTranslation && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-key">Translation Key</Label>
                    <Input
                      id="edit-key"
                      value={editingTranslation.key}
                      onChange={(e) => setEditingTranslation(prev => prev ? { ...prev, key: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={editingTranslation.category} onValueChange={(value) => setEditingTranslation(prev => prev ? { ...prev, category: value } : null)}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-english">English Text</Label>
                  <Textarea
                    id="edit-english"
                    value={editingTranslation.english_text}
                    onChange={(e) => setEditingTranslation(prev => prev ? { ...prev, english_text: e.target.value } : null)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-spanish">Spanish Translation</Label>
                  <Textarea
                    id="edit-spanish"
                    value={editingTranslation.spanish_text || ''}
                    onChange={(e) => setEditingTranslation(prev => prev ? { ...prev, spanish_text: e.target.value } : null)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-context">Context</Label>
                  <Input
                    id="edit-context"
                    value={editingTranslation.context || ''}
                    onChange={(e) => setEditingTranslation(prev => prev ? { ...prev, context: e.target.value } : null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingTranslation.is_active}
                    onCheckedChange={(checked) => setEditingTranslation(prev => prev ? { ...prev, is_active: checked } : null)}
                  />
                  <Label>Translation is active</Label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateTranslationData}
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

export default AdminTranslations;