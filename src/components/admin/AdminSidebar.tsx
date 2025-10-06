import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Image,
  FileText,
  Package,
  Star,
  Home,
  Quote,
  Settings,
  Languages,
  LogOut, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { NotificationBadge } from './NotificationBadge';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    title: 'Homepage',
    href: '/admin/homepage',
    icon: Home,
    description: 'Edit homepage content'
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
    description: 'Manage appointments'
  },
  {
    title: 'Services',
    href: '/admin/services',
    icon: Package,
    description: 'Manage service offerings'
  },
  {
    title: 'Service Page',
    href: '/admin/service-page-settings',
    icon: FileText,
    description: 'Edit service page content'
  },
  {
    title: 'Add-Ons',
    href: '/admin/add-ons',
    icon: Star,
    description: 'Manage optional add-ons'
  },
  {
    title: 'Gallery',
    href: '/admin/gallery',
    icon: Image,
    description: 'Manage portfolio media'
  },
  {
    title: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
    description: 'Contact form messages',
    hasNotification: true
  },
  {
    title: 'About Us',
    href: '/admin/about',
    icon: FileText,
    description: 'Edit about page content'
  },
  {
    title: 'Testimonials',
    href: '/admin/testimonials',
    icon: Quote,
    description: 'Manage client testimonials'
  },
  {
    title: 'Translations',
    href: '/admin/translations',
    icon: Languages,
    description: 'Manage website translations'
  },
  {
    title: 'Email Settings',
    href: '/admin/email-settings',
    icon: Settings,
    description: 'Configure email notifications'
  }
];

export function AdminSidebar({ isCollapsed, onToggleCollapse, isMobileOpen = false, onMobileToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);

  useEffect(() => {
    // Load initial studio settings
    const loadStudioSettings = async () => {
      const settings = await getStudioSettings();
      setStudioSettings(settings);
    };
    loadStudioSettings();

    // Set up real-time subscription
    const subscription = subscribeToStudioSettings((settings) => {
      setStudioSettings(settings);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (onMobileToggle && isMobileOpen) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={onMobileToggle}
          className="bg-card border-border shadow-lg"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40 flex flex-col",
        // Mobile styles
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop styles
        "lg:w-64",
        isCollapsed && "lg:w-16",
        // Mobile width
        "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-luxury-black font-heading font-bold text-sm">FL</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-base lg:text-lg font-semibold text-foreground truncate">
                  {studioSettings?.studio_name || 'Francis Lozano Studio'}
                </h2>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2 hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 w-full" style={{ height: 'calc(100vh - 136px)' }}>
        <div className="space-y-1 p-3 lg:p-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-accent text-accent-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  isCollapsed && "lg:justify-center"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon size={20} className={cn(
                  "flex-shrink-0",
                  isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm lg:text-base truncate">{item.title}</p>
                    <p className="text-xs opacity-70 truncate hidden lg:block">{item.description}</p>
                  </div>
                )}
                {item.hasNotification && (
                  <div className={cn(
                    "flex-shrink-0",
                    isCollapsed ? "lg:absolute -top-1 -right-1" : ""
                  )}>
                    <NotificationBadge />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted text-sm lg:text-base",
            isCollapsed && "lg:justify-center lg:px-2"
          )}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
    </>
  );
}

