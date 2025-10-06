import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '@/lib/utils';
import { NotificationBadge } from './NotificationBadge';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Floating notification badge for mobile */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <NotificationBadge className="bg-card border border-border shadow-lg" />
      </div>
      
      <main className={cn(
        "transition-all duration-300",
        "lg:ml-64", // Always show full sidebar on desktop
        isSidebarCollapsed && "lg:ml-16" // Collapsed state on desktop only
      )}>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}