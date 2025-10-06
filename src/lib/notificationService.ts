import { supabase } from './supabase';

export interface NotificationData {
  unreadMessages: number;
  lastChecked: string;
}

export const getNotificationData = async (): Promise<NotificationData> => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notification data: ${error.message}`);
    }

    const unreadMessages = data?.filter(m => m.status === 'unread').length || 0;
    const lastChecked = localStorage.getItem('admin-last-checked') || new Date().toISOString();

    return {
      unreadMessages,
      lastChecked
    };
  } catch (error) {
    console.error('Error fetching notification data:', error);
    return {
      unreadMessages: 0,
      lastChecked: new Date().toISOString()
    };
  }
};

export const markNotificationsAsChecked = () => {
  localStorage.setItem('admin-last-checked', new Date().toISOString());
};

export const subscribeToMessageNotifications = (callback: (data: NotificationData) => void) => {
  const subscription = supabase
    .channel('message-notifications')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'contact_messages' },
      () => {
        // Refresh notification data when new message arrives
        getNotificationData().then(callback);
      }
    )
    .subscribe();

  return subscription;
};