import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getNotificationData, markNotificationsAsChecked, subscribeToMessageNotifications, type NotificationData } from '@/lib/notificationService';

interface NotificationBadgeProps {
  className?: string;
  onClick?: () => void;
}

export function NotificationBadge({ className, onClick }: NotificationBadgeProps) {
  const [notifications, setNotifications] = useState<NotificationData>({
    unreadMessages: 0,
    lastChecked: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load
    loadNotifications();

    // Set up real-time subscription
    const subscription = subscribeToMessageNotifications((data) => {
      setNotifications(data);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotificationData();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    markNotificationsAsChecked();
    setNotifications(prev => ({ ...prev, lastChecked: new Date().toISOString() }));
    onClick?.();
  };

  const hasUnread = notifications.unreadMessages > 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn("relative p-2", className)}
      disabled={isLoading}
    >
      {hasUnread ? (
        <BellRing className="h-5 w-5 text-accent animate-pulse" />
      ) : (
        <Bell className="h-5 w-5 text-muted-foreground" />
      )}
      
      {hasUnread && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs animate-bounce"
        >
          {notifications.unreadMessages > 99 ? '99+' : notifications.unreadMessages}
        </Badge>
      )}
    </Button>
  );
}