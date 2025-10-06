import { useEffect, useState } from 'react';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  TrendingUp,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Package,
  Image,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { NotificationBadge } from '@/components/admin/NotificationBadge';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  unreadMessages: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  todayBookings: number;
  tomorrowBookings: number;
  averageBookingValue: number;
  totalServices: number;
  activeServices: number;
  totalGalleryItems: number;
  featuredGalleryItems: number;
  completionRate: number;
  cancellationRate: number;
}

interface RecentBooking {
  id: string;
  service_name: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_price: number;
  confirmation_number: string;
  created_at: string;
}

interface RecentMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  inquiry_type: string;
  subject: string;
  status: string;
  created_at: string;
}

interface PopularService {
  service_name: string;
  booking_count: number;
  total_revenue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    unreadMessages: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayBookings: 0,
    tomorrowBookings: 0,
    averageBookingValue: 0,
    totalServices: 0,
    activeServices: 0,
    totalGalleryItems: 0,
    featuredGalleryItems: 0,
    completionRate: 0,
    cancellationRate: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscriptions
    const bookingsSubscription = supabase
      .channel('dashboard-bookings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchDashboardData()
      )
      .subscribe();

    const messagesSubscription = supabase
      .channel('dashboard-messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [
        bookingsResult,
        messagesResult,
        servicesResult,
        galleryResult
      ] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*'),
        supabase.from('gallery').select('*')
      ]);

      const bookings = bookingsResult.data || [];
      const messages = messagesResult.data || [];
      const services = servicesResult.data || [];
      const gallery = galleryResult.data || [];

      // Calculate comprehensive stats
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const completedBookings = bookings.filter(b => b.status === 'completed');
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + b.service_price, 0);
      
      const weeklyBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at);
        return bookingDate >= weekStart && bookingDate <= weekEnd;
      });
      
      const monthlyBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });

      const todayBookings = bookings.filter(b => isToday(new Date(b.appointment_date)));
      const tomorrowBookings = bookings.filter(b => isTomorrow(new Date(b.appointment_date)));

      const stats: DashboardStats = {
        totalBookings: bookings.length,
        totalRevenue: totalRevenue,
        upcomingBookings: bookings.filter(b => 
          new Date(b.appointment_date) >= new Date() && b.status === 'confirmed'
        ).length,
        completedBookings: completedBookings.length,
        cancelledBookings: cancelledBookings.length,
        unreadMessages: messages.filter(m => m.status === 'unread').length,
        monthlyRevenue: monthlyBookings.reduce((sum, b) => sum + (b.status === 'completed' ? b.service_price : 0), 0),
        weeklyRevenue: weeklyBookings.reduce((sum, b) => sum + (b.status === 'completed' ? b.service_price : 0), 0),
        todayBookings: todayBookings.length,
        tomorrowBookings: tomorrowBookings.length,
        averageBookingValue: completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0,
        totalServices: services.length,
        activeServices: services.filter(s => s.is_active).length,
        totalGalleryItems: gallery.length,
        featuredGalleryItems: gallery.filter(g => g.is_featured).length,
        completionRate: bookings.length > 0 ? (completedBookings.length / bookings.length) * 100 : 0,
        cancellationRate: bookings.length > 0 ? (cancelledBookings.length / bookings.length) * 100 : 0,
      };

      setStats(stats);
      setRecentBookings(bookings.slice(0, 5));
      setRecentMessages(messages.slice(0, 5));

      // Calculate popular services
      const serviceStats = bookings
        .filter(b => b.status === 'completed')
        .reduce((acc, booking) => {
          const serviceName = booking.service_name;
          if (!acc[serviceName]) {
            acc[serviceName] = { booking_count: 0, total_revenue: 0 };
          }
          acc[serviceName].booking_count++;
          acc[serviceName].total_revenue += booking.service_price;
          return acc;
        }, {} as Record<string, { booking_count: number; total_revenue: number }>);

      const popularServicesData = Object.entries(serviceStats)
        .map(([service_name, data]) => ({
          service_name,
          booking_count: data.booking_count,
          total_revenue: data.total_revenue
        }))
        .sort((a, b) => b.booking_count - a.booking_count)
        .slice(0, 5);

      setPopularServices(popularServicesData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unread':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'read':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'replied':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'unread':
        return <AlertCircle size={14} className="text-red-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground flex items-center">
              <Activity className="mr-2 sm:mr-3 text-accent" size={28} />
              Business Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Complete overview of your nail studio business performance
            </p>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Last updated: {format(new Date(), 'PPP p')}
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-border hover-lift transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground truncate">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: ${Math.round(stats.averageBookingValue)} per booking
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="text-green-600" size={20} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">This month: </span>
                  <span className="font-semibold ml-1">${stats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover-lift transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalBookings}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.completionRate.toFixed(1)}% completion rate
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-blue-600" size={20} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover-lift transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Upcoming Appointments</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.upcomingBookings}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.todayBookings} today • {stats.tomorrowBookings} tomorrow
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-orange-600" size={20} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>Today: {stats.todayBookings}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Tomorrow: {stats.tomorrowBookings}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover-lift transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">New Messages</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.unreadMessages}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Require attention
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center relative flex-shrink-0">
                  <MessageSquare className="text-purple-600" size={20} />
                  {stats.unreadMessages > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <NotificationBadge />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                {stats.unreadMessages > 0 ? (
                  <Button asChild size="sm" variant="outline" className="w-full text-xs sm:text-sm">
                    <Link to="/admin/messages">View Messages</Link>
                  </Button>
                ) : (
                  <p className="text-xs sm:text-sm text-green-600">All caught up! 🎉</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <TrendingUp className="mr-2 text-accent" size={18} />
                Business Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Completion Rate</span>
                <span className="text-sm sm:text-base font-semibold text-green-600">{stats.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Cancellation Rate</span>
                <span className="text-sm sm:text-base font-semibold text-red-600">{stats.cancellationRate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.cancellationRate} className="h-2" />
              
              <div className="pt-2 text-xs text-muted-foreground space-y-1">
                <p>✅ {stats.completedBookings} completed</p>
                <p>❌ {stats.cancelledBookings} cancelled</p>
                <p>⏳ {stats.upcomingBookings} upcoming</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <Package className="mr-2 text-accent" size={18} />
                Content Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Active Services</span>
                <span className="text-sm sm:text-base font-semibold">{stats.activeServices}/{stats.totalServices}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Gallery Items</span>
                <span className="text-sm sm:text-base font-semibold">{stats.totalGalleryItems}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-muted-foreground">Featured Items</span>
                <span className="text-sm sm:text-base font-semibold">{stats.featuredGalleryItems}</span>
              </div>
              
              <div className="pt-2 space-y-1">
                <Button asChild size="sm" variant="outline" className="w-full text-xs sm:text-sm">
                  <Link to="/admin/services">Manage Services</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="w-full text-xs sm:text-sm">
                  <Link to="/admin/gallery">Manage Gallery</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <BarChart3 className="mr-2 text-accent" size={18} />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">This Week</span>
                  <span className="text-sm sm:text-base font-semibold">${stats.weeklyRevenue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">This Month</span>
                  <span className="text-sm sm:text-base font-semibold">${stats.monthlyRevenue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">All Time</span>
                  <span className="text-sm sm:text-base font-semibold">${stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="pt-2 text-xs text-muted-foreground space-y-1">
                <p>Average booking: ${Math.round(stats.averageBookingValue)}</p>
                <p>Total completed: {stats.completedBookings} services</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs sm:text-sm">Bookings</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm">Messages</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Today's Schedule */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-lg sm:text-xl text-card-foreground flex items-center">
                    <Calendar className="mr-2 text-accent" size={18} />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentBookings.filter(b => isToday(new Date(b.appointment_date))).length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <Calendar size={40} className="mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base font-medium">No appointments today</p>
                      <p className="text-xs sm:text-sm">Enjoy your free day!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {recentBookings
                        .filter(b => isToday(new Date(b.appointment_date)))
                        .map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-2 sm:p-3 bg-background rounded-lg border border-border">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm sm:text-base font-medium text-card-foreground truncate">{booking.client_name}</p>
                                <Badge className={`${getStatusColor(booking.status)} text-xs`}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(booking.status)}
                                    <span className="hidden sm:inline">{booking.status}</span>
                                  </div>
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{booking.service_name}</p>
                              <p className="text-xs text-accent font-medium">{booking.appointment_time}</p>
                            </div>
                            <div className="text-right ml-2">
                              <p className="text-sm sm:text-base font-semibold text-card-foreground">${booking.service_price}</p>
                              <p className="text-xs text-muted-foreground hidden sm:block">#{booking.confirmation_number}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-lg sm:text-xl text-card-foreground">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button asChild className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold text-xs sm:text-sm h-auto py-2 sm:py-3">
                      <Link to="/admin/bookings">
                        <Calendar className="mr-1 sm:mr-2" size={14} />
                        <span className="hidden sm:inline">View All </span>Bookings
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm h-auto py-2 sm:py-3">
                      <Link to="/admin/gallery">
                        <Image className="mr-1 sm:mr-2" size={14} />
                        <span className="hidden sm:inline">Manage </span>Gallery
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm h-auto py-2 sm:py-3">
                      <Link to="/admin/services">
                        <Package className="mr-1 sm:mr-2" size={14} />
                        <span className="hidden sm:inline">Edit </span>Services
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm h-auto py-2 sm:py-3">
                      <Link to="/admin/homepage">
                        <FileText className="mr-1 sm:mr-2" size={14} />
                        <span className="hidden sm:inline">Edit </span>Homepage
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm h-auto py-2 sm:py-3 col-span-2">
                      <Link to="/admin/testimonials">
                        <MessageSquare className="mr-1 sm:mr-2" size={14} />
                        Manage Testimonials
                      </Link>
                    </Button>
                  </div>
                  
                  {stats.unreadMessages > 0 && (
                    <Button asChild className="w-full bg-red-100 text-red-800 hover:bg-red-200 border border-red-200 text-xs sm:text-sm">
                      <Link to="/admin/messages">
                        <MessageSquare className="mr-2" size={14} />
                        {stats.unreadMessages} Unread Message{stats.unreadMessages > 1 ? 's' : ''}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-xl text-card-foreground">
                  Recent Bookings
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/bookings">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No recent bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <Card key={booking.id} className="bg-background border-border">
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-semibold text-card-foreground">{booking.client_name}</h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(booking.status)}
                                    <span>{booking.status}</span>
                                  </div>
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                  <Package className="mr-2" size={14} />
                                  <span>{booking.service_name}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Calendar className="mr-2" size={14} />
                                  <span>{format(new Date(booking.appointment_date), 'MMM dd')} at {booking.appointment_time}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Mail className="mr-2" size={14} />
                                  <span>{booking.client_email}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                  <Phone className="mr-2" size={14} />
                                  <span>{booking.client_phone}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <p className="font-semibold text-card-foreground text-lg">${booking.service_price}</p>
                              <p className="text-xs text-muted-foreground">#{booking.confirmation_number}</p>
                              <p className="text-xs text-muted-foreground">
                                Booked {format(new Date(booking.created_at), 'MMM dd')}
                              </p>
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

          <TabsContent value="messages" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-xl text-card-foreground">
                  Recent Messages
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/messages">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No recent messages</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.map((message) => (
                      <Card key={message.id} className="bg-background border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-card-foreground">
                                  {message.first_name} {message.last_name}
                                </h3>
                                <Badge className={getStatusColor(message.status)}>
                                  {message.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-1">
                                {message.inquiry_type}
                              </p>
                              
                              <p className="font-medium text-card-foreground mb-2">
                                {message.subject}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center">
                                  <Mail className="mr-1" size={12} />
                                  {message.email}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-1" size={12} />
                                  {format(new Date(message.created_at), 'MMM dd, HH:mm')}
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Services */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
                    <Star className="mr-2 text-accent" size={20} />
                    Popular Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {popularServices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No completed bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {popularServices.map((service, index) => (
                        <div key={service.service_name} className="flex items-center justify-between p-3 bg-background rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                              <span className="text-accent font-semibold text-sm">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-card-foreground">{service.service_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {service.booking_count} bookings
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-card-foreground">
                              ${service.total_revenue.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${Math.round(service.total_revenue / service.booking_count)} avg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Insights */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
                    <PieChart className="mr-2 text-accent" size={20} />
                    Business Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center space-x-2">
                        <ArrowUp className="text-foreground" size={16} />
                        <span className="text-sm font-medium text-foreground">Completion Rate</span>
                      </div>
                      <span className="font-bold text-foreground">{stats.completionRate.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="text-foreground" size={16} />
                        <span className="text-sm font-medium text-foreground">Monthly Revenue</span>
                      </div>
                      <span className="font-bold text-foreground">${stats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center space-x-2">
                        <Users className="text-foreground" size={16} />
                        <span className="text-sm font-medium text-foreground">Active Services</span>
                      </div>
                      <span className="font-bold text-foreground">{stats.activeServices}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center space-x-2">
                        <Image className="text-foreground" size={16} />
                        <span className="text-sm font-medium text-foreground">Gallery Items</span>
                      </div>
                      <span className="font-bold text-foreground">{stats.totalGalleryItems}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Your business is performing well! 🎉
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-xl text-card-foreground">
                  All Recent Bookings
                </CardTitle>
                <Button asChild>
                  <Link to="/admin/bookings">Manage All Bookings</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <Card key={booking.id} className="bg-background border-border">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-card-foreground">{booking.client_name}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(booking.status)}
                                  <span>{booking.status}</span>
                                </div>
                              </Badge>
                              {isToday(new Date(booking.appointment_date)) && (
                                <Badge className="bg-red-100 text-red-800 border-red-200">
                                  <AlertCircle size={12} className="mr-1" />
                                  Today
                                </Badge>
                              )}
                              {isTomorrow(new Date(booking.appointment_date)) && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  <Clock size={12} className="mr-1" />
                                  Tomorrow
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Package className="mr-2" size={14} />
                                <span>{booking.service_name}</span>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="mr-2" size={14} />
                                <span>{format(new Date(booking.appointment_date), 'MMM dd')} at {booking.appointment_time}</span>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <DollarSign className="mr-2" size={14} />
                                <span className="font-medium">${booking.service_price}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Mail className="mr-2" size={14} />
                                <span>{booking.client_email}</span>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <Phone className="mr-2" size={14} />
                                <span>{booking.client_phone}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-1">
                            <p className="text-xs text-muted-foreground">#{booking.confirmation_number}</p>
                            <p className="text-xs text-muted-foreground">
                              Booked {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-xl text-card-foreground">
                  Recent Contact Messages
                </CardTitle>
                <Button asChild>
                  <Link to="/admin/messages">Manage All Messages</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No recent messages</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentMessages.map((message) => (
                      <Card key={message.id} className="bg-background border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-card-foreground">
                                  {message.first_name} {message.last_name}
                                </h3>
                                <Badge className={getStatusColor(message.status)}>
                                  {message.status}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-1">
                                {message.inquiry_type}
                              </p>
                              
                              <p className="font-medium text-card-foreground mb-2">
                                {message.subject}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center">
                                  <Mail className="mr-1" size={12} />
                                  {message.email}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="mr-1" size={12} />
                                  {format(new Date(message.created_at), 'MMM dd, HH:mm')}
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
          </TabsContent>
        </Tabs>

        {/* Action Items */}
        {(stats.unreadMessages > 0 || stats.todayBookings > 0 || stats.tomorrowBookings > 0) && (
          <Card className="border-border bg-background">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-card-foreground flex items-center">
                <AlertCircle className="mr-2 text-accent" size={20} />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.unreadMessages > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-800/30 rounded-lg border border-red-700/40">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="text-red-600" size={16} />
                      <span className="text-sm font-medium">{stats.unreadMessages} Unread Messages</span>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/messages">Review</Link>
                    </Button>
                  </div>
                )}
                
                {stats.todayBookings > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-800/30 rounded-lg border border-blue-700/40">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-blue-600" size={16} />
                      <span className="text-sm font-medium">{stats.todayBookings} Appointments Today</span>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/bookings">View</Link>
                    </Button>
                  </div>
                )}
                
                {stats.tomorrowBookings > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-800/30 rounded-lg border border-yellow-700/40">
                    <div className="flex items-center space-x-2">
                      <Clock className="text-yellow-600" size={16} />
                      <span className="text-sm font-medium">{stats.tomorrowBookings} Appointments Tomorrow</span>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/bookings">Prepare</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
