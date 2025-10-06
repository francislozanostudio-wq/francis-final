import { useEffect, useState } from 'react';
import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Mail,
  Phone,
  Eye,
  Filter,
  Search,
  Edit,
  Trash2,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  MapPin,
  MessageSquare,
  RefreshCw,
  SortAsc,
  SortDesc,
  FileText,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { BookingReminderButton } from '@/components/admin/BookingReminderButton';

interface Booking {
  id: string;
  service_name: string;
  service_price: number;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  confirmation_number: string;
  created_at: string;
  updated_at: string;
  selected_add_ons?: any[];
  add_ons_total?: number;
}

interface BookingStats {
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  todayBookings: number;
  upcomingBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    
    // Set up real-time subscription for bookings
    const bookingsSubscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Booking change detected:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch bookings. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setBookings(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching bookings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (bookingsData: Booking[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats: BookingStats = {
      total: bookingsData.length,
      confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
      completed: bookingsData.filter(b => b.status === 'completed').length,
      cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
      todayBookings: bookingsData.filter(b => {
        const bookingDate = parseISO(b.appointment_date);
        return isToday(bookingDate);
      }).length,
      upcomingBookings: bookingsData.filter(b => {
        const bookingDate = parseISO(b.appointment_date);
        return isFuture(bookingDate) && b.status === 'confirmed';
      }).length,
      totalRevenue: bookingsData
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.service_price, 0),
      monthlyRevenue: bookingsData
        .filter(b => {
          const bookingDate = parseISO(b.created_at);
          return bookingDate.getMonth() === currentMonth && 
                 bookingDate.getFullYear() === currentYear &&
                 b.status === 'completed';
        })
        .reduce((sum, b) => sum + b.service_price, 0)
    };

    setStats(stats);
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.client_name.toLowerCase().includes(term) ||
        booking.client_email.toLowerCase().includes(term) ||
        booking.service_name.toLowerCase().includes(term) ||
        booking.confirmation_number.toLowerCase().includes(term) ||
        booking.client_phone.includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(booking => {
        const bookingDate = parseISO(booking.appointment_date);
        switch (dateFilter) {
          case 'today':
            return isToday(bookingDate);
          case 'tomorrow':
            return isTomorrow(bookingDate);
          case 'upcoming':
            return isFuture(bookingDate);
          case 'past':
            return isPast(bookingDate);
          case 'this-week':
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            return bookingDate >= weekStart && bookingDate < weekEnd;
          case 'this-month':
            return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'appointment_date':
          aValue = new Date(a.appointment_date + ' ' + a.appointment_time);
          bValue = new Date(b.appointment_date + ' ' + b.appointment_time);
          break;
        case 'client_name':
          aValue = a.client_name.toLowerCase();
          bValue = b.client_name.toLowerCase();
          break;
        case 'service_price':
          aValue = a.service_price;
          bValue = b.service_price;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update booking status. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
          : booking
      ));

      toast({
        title: 'Success',
        description: `Booking status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating the booking.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error deleting booking:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete booking. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      toast({
        title: 'Success',
        description: 'Booking deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the booking.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateBookingNotes = async (bookingId: string, notes: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to update booking notes. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, notes: notes, updated_at: new Date().toISOString() }
          : booking
      ));

      toast({
        title: 'Success',
        description: 'Booking notes updated successfully.',
      });
    } catch (error) {
      console.error('Error updating booking notes:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating the notes.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportBookings = () => {
    const csvContent = [
      ['Confirmation Number', 'Client Name', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Price', 'Status', 'Created', 'Notes'],
      ...filteredBookings.map(booking => [
        booking.confirmation_number,
        booking.client_name,
        booking.client_email,
        booking.client_phone,
        booking.service_name,
        booking.appointment_date,
        booking.appointment_time,
        booking.service_price.toString(),
        booking.status,
        format(parseISO(booking.created_at), 'yyyy-MM-dd HH:mm'),
        booking.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Bookings exported successfully.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={14} className="text-blue-600" />;
      case 'completed':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'cancelled':
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
  };

  const getPriorityLevel = (booking: Booking) => {
    const appointmentDate = parseISO(booking.appointment_date);
    if (isToday(appointmentDate)) return 'high';
    if (isTomorrow(appointmentDate)) return 'medium';
    return 'normal';
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
              Bookings Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Comprehensive appointment management and client tracking
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={fetchBookings}
              disabled={isLoading}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm"
              size="sm"
            >
              <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportBookings}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm"
              size="sm"
            >
              <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Export
            </Button>
            <Button className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold text-xs sm:text-sm" size="sm">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="border-border hover-lift transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stats.confirmed} confirmed • {stats.completed} completed
                  </p>
                </div>
                <Calendar className="text-accent h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover-lift transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Today's Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.todayBookings}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.upcomingBookings} upcoming
                  </p>
                </div>
                <Clock className="text-accent h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover-lift transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">${stats.totalRevenue}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${stats.monthlyRevenue} this month
                  </p>
                </div>
                <DollarSign className="text-accent h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover-lift transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg. Booking Value</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    ${stats.total > 0 ? Math.round(stats.totalRevenue / stats.completed || 0) : 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.cancelled} cancelled
                  </p>
                </div>
                <Users className="text-accent h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search by name, email, service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="appointment_date">Appointment Date</SelectItem>
                    <SelectItem value="client_name">Client Name</SelectItem>
                    <SelectItem value="service_price">Price</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-2 sm:px-3"
                >
                  {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                </Button>
              </div>
            </div>
            
            {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Showing {filteredBookings.length} of {bookings.length} bookings
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  className="text-accent hover:text-accent-foreground text-xs sm:text-sm"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-heading text-lg sm:text-xl text-card-foreground flex items-center justify-between">
              <span>All Bookings ({filteredBookings.length})</span>
              {isUpdating && (
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <RefreshCw className="animate-spin mr-2" size={14} />
                  <span className="hidden sm:inline">Updating...</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Calendar size={40} className="mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-base sm:text-lg font-medium mb-2">No bookings found</p>
                <p className="text-xs sm:text-sm">Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredBookings.map((booking) => {
                  const priority = getPriorityLevel(booking);
                  const appointmentDate = parseISO(booking.appointment_date);
                  
                  return (
                    <Card 
                      key={booking.id} 
                      className={`bg-card border-border hover:shadow-md transition-all duration-200 ${
                        priority === 'high' ? 'border-l-4 border-l-red-500' :
                        priority === 'medium' ? 'border-l-4 border-l-yellow-500' : ''
                      }`}
                    >
                      <CardContent className="p-3 sm:p-6">
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <div className="flex-1 space-y-2 sm:space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-card-foreground text-sm sm:text-lg">
                                {booking.service_name}
                              </h3>
                              <Badge className={`${getStatusColor(booking.status)} text-xs`}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(booking.status)}
                                  <span>{booking.status}</span>
                                </div>
                              </Badge>
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                #{booking.confirmation_number}
                              </span>
                              {priority === 'high' && (
                                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                  <AlertCircle size={12} className="mr-1" />
                                  Today
                                </Badge>
                              )}
                              {priority === 'medium' && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                  <Clock size={12} className="mr-1" />
                                  Tomorrow
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm">
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center text-muted-foreground">
                                  <Calendar className="mr-2 flex-shrink-0" size={14} />
                                  <span className="font-medium truncate">
                                    {format(appointmentDate, 'MMM dd')} at {booking.appointment_time}
                                  </span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <DollarSign className="mr-2 flex-shrink-0" size={14} />
                                  <div>
                                    <span className="font-medium">${booking.service_price}</span>
                                    {booking.selected_add_ons && booking.selected_add_ons.length > 0 && (
                                      <>
                                        <span className="text-xs text-accent ml-1">
                                          +${booking.add_ons_total?.toFixed(2)}
                                        </span>
                                        <br />
                                        <span className="text-xs font-bold text-accent">
                                          Total: ${(booking.service_price + (booking.add_ons_total || 0)).toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center text-muted-foreground">
                                  <Users className="mr-2 flex-shrink-0" size={14} />
                                  <span className="font-medium truncate">{booking.client_name}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Mail className="mr-2 flex-shrink-0" size={14} />
                                  <span className="font-medium truncate">{booking.client_email}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center text-muted-foreground">
                                  <Phone className="mr-2 flex-shrink-0" size={14} />
                                  <span className="font-medium truncate">{booking.client_phone}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Clock className="mr-2 flex-shrink-0" size={14} />
                                  <span className="truncate">Created {format(parseISO(booking.created_at), 'MMM dd')}</span>
                                </div>
                              </div>
                            </div>
                            
                            {booking.notes && (
                              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted/50 rounded-md">
                                <div className="flex items-start space-x-2">
                                  <MessageSquare size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-card-foreground mb-1">Client Notes:</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{booking.notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {booking.selected_add_ons && booking.selected_add_ons.length > 0 && (
                              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-accent/5 rounded-md border border-accent/20">
                                <div className="flex items-start space-x-2">
                                  <DollarSign size={14} className="text-accent mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-card-foreground mb-1">Add-Ons ({booking.selected_add_ons.length}):</p>
                                    <div className="flex flex-wrap gap-1">
                                      {booking.selected_add_ons.map((addOn: any, index: number) => (
                                        <span key={index} className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">
                                          {addOn.name} (+${addOn.price})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Select
                              value={booking.status}
                              onValueChange={(value) => updateBookingStatus(booking.id, value as any)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <div className="flex gap-2 flex-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsDetailsOpen(true);
                                }}
                                className="flex-1 text-xs sm:text-sm"
                              >
                                <Eye className="mr-1" size={14} />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                              <div className="flex-1">
                                <BookingReminderButton 
                                  booking={booking}
                                  adminEmail={(() => {
                                    const adminEmailConfigs = JSON.parse(localStorage.getItem('admin-email-configs') || '[]');
                                    const activeAdminEmails = adminEmailConfigs.filter((config: any) => config.isActive);
                                    const primaryEmail = activeAdminEmails.find((config: any) => config.isPrimary);
                                    return primaryEmail?.email || activeAdminEmails[0]?.email || 'admin@francis_lozano_studio.com';
                                  })()}
                                />
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="px-2">
                                    <MoreHorizontal size={14} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingBooking(booking);
                                      setAdminNotes(booking.notes || '');
                                      setIsEditOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2" size={14} />
                                    Edit Notes
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => window.open(`mailto:${booking.client_email}?subject=Regarding your appointment on ${format(parseISO(booking.appointment_date), 'PPP')}`)}
                                  >
                                    <Send className="mr-2" size={14} />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => window.open(`tel:${booking.client_phone}`)}
                                  >
                                    <Phone className="mr-2" size={14} />
                                    Call Client
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="mr-2" size={14} />
                                        Delete Booking
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this booking? This action cannot be undone.
                                          <br /><br />
                                          <strong>Client:</strong> {booking.client_name}<br />
                                          <strong>Service:</strong> {booking.service_name}<br />
                                          <strong>Date:</strong> {format(parseISO(booking.appointment_date), 'PPP')} at {booking.appointment_time}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteBooking(booking.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete Booking
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">
                Booking Details
              </DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                      <p className="text-lg font-semibold">{selectedBooking.service_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                      <p className="text-lg font-semibold">
                        {format(parseISO(selectedBooking.appointment_date), 'PPPP')}
                      </p>
                      <p className="text-muted-foreground">{selectedBooking.appointment_time}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                      <p className="text-lg font-semibold">${selectedBooking.service_price}</p>
                      {selectedBooking.selected_add_ons && selectedBooking.selected_add_ons.length > 0 && (
                        <>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add-ons: +${selectedBooking.add_ons_total?.toFixed(2) || '0.00'}
                          </p>
                          <p className="text-base font-bold text-accent mt-1">
                            Total: ${(selectedBooking.service_price + (selectedBooking.add_ons_total || 0)).toFixed(2)}
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(selectedBooking.status)}
                          <span>{selectedBooking.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Client Name</Label>
                      <p className="text-lg font-semibold">{selectedBooking.client_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-lg">{selectedBooking.client_email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="text-lg">{selectedBooking.client_phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Confirmation #</Label>
                      <p className="text-lg font-mono">{selectedBooking.confirmation_number}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p>{format(parseISO(selectedBooking.created_at), 'PPP p')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <p>{format(parseISO(selectedBooking.updated_at), 'PPP p')}</p>
                  </div>
                </div>
                
                {selectedBooking.selected_add_ons && selectedBooking.selected_add_ons.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Selected Add-Ons</Label>
                      <div className="mt-2 space-y-2">
                        {selectedBooking.selected_add_ons.map((addOn: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-accent/5 rounded-md">
                            <div>
                              <p className="text-sm font-medium">{addOn.name}</p>
                              {addOn.description && (
                                <p className="text-xs text-muted-foreground">{addOn.description}</p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-accent">+${addOn.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {selectedBooking.notes && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Client Notes</Label>
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm">{selectedBooking.notes}</p>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => window.open(`mailto:${selectedBooking.client_email}?subject=Regarding your appointment on ${format(parseISO(selectedBooking.appointment_date), 'PPP')}`)}
                    className="flex-1"
                  >
                    <Mail className="mr-2" size={16} />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`tel:${selectedBooking.client_phone}`)}
                    className="flex-1"
                  >
                    <Phone className="mr-2" size={16} />
                    Call Client
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Notes Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                Edit Booking Notes
              </DialogTitle>
            </DialogHeader>
            {editingBooking && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Booking: {editingBooking.service_name} - {editingBooking.client_name}
                  </Label>
                </div>
                <div>
                  <Label htmlFor="admin-notes">Admin Notes</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this booking..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      updateBookingNotes(editingBooking.id, adminNotes);
                      setIsEditOpen(false);
                    }}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={16} />
                        Saving...
                      </>
                    ) : (
                      'Save Notes'
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

export default AdminBookings;
