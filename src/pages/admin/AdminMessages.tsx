import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  MessageSquare, 
  Mail,
  Phone,
  User,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  Edit,
  Save,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { markNotificationsAsChecked } from '@/lib/notificationService';

interface Message {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  inquiry_type: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface MessageStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isEditNotesOpen, setIsEditNotesOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    
    // Mark notifications as checked when viewing messages
    markNotificationsAsChecked();
    
    // Set up real-time subscription
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch messages. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setMessages(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while fetching messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (messagesData: Message[]) => {
    const stats: MessageStats = {
      total: messagesData.length,
      unread: messagesData.filter(m => m.status === 'unread').length,
      read: messagesData.filter(m => m.status === 'read').length,
      replied: messagesData.filter(m => m.status === 'replied').length,
    };
    setStats(stats);
  };

  const filterMessages = () => {
    let filtered = messages;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(message =>
        `${message.first_name} ${message.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.inquiry_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    setFilteredMessages(filtered);
  };

  const updateMessageStatus = async (messageId: string, newStatus: 'unread' | 'read' | 'replied') => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating message status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update message status.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, status: newStatus, updated_at: new Date().toISOString() }
          : message
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast({
        title: 'Success',
        description: `Message marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAdminNotes = async (messageId: string, notes: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating admin notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to update admin notes.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setMessages(prev => prev.map(message => 
        message.id === messageId 
          ? { ...message, admin_notes: notes, updated_at: new Date().toISOString() }
          : message
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, admin_notes: notes } : null);
      }

      setIsEditNotesOpen(false);
      toast({
        title: 'Success',
        description: 'Admin notes updated successfully.',
      });
    } catch (error) {
      console.error('Error updating admin notes:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete message.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setMessages(prev => prev.filter(message => message.id !== messageId));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }

      toast({
        title: 'Success',
        description: 'Message deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
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
              Messages
            </h1>
            <p className="text-muted-foreground">
              Manage contact form messages and client inquiries
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchMessages}
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
                  <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold text-foreground">{stats.unread}</p>
                </div>
                <AlertCircle className="text-red-500 h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Read</p>
                  <p className="text-2xl font-bold text-foreground">{stats.read}</p>
                </div>
                <Eye className="text-yellow-500 h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Replied</p>
                  <p className="text-2xl font-bold text-foreground">{stats.replied}</p>
                </div>
                <Mail className="text-green-500 h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search by name, email, subject, or inquiry type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-card-foreground">
                  All Messages ({filteredMessages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMessages.map((message) => (
                      <Card 
                        key={message.id} 
                        className={`bg-background border-border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedMessage?.id === message.id ? 'ring-2 ring-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (message.status === 'unread') {
                            updateMessageStatus(message.id, 'read');
                          }
                        }}
                      >
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
                              
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {message.message}
                              </p>
                              
                              <div className="flex items-center space-x-4 mt-3 text-xs text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="mr-1" size={12} />
                                  {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                                </div>
                                <div className="flex items-center">
                                  <Mail className="mr-1" size={12} />
                                  {message.email}
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
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-1">
            <Card className="border-border sticky top-6">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-card-foreground">
                  Message Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedMessage ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a message to view details</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-2">
                        {selectedMessage.first_name} {selectedMessage.last_name}
                      </h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="mr-2" size={14} />
                          {selectedMessage.email}
                        </div>
                        {selectedMessage.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-2" size={14} />
                            {selectedMessage.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="mr-2" size={14} />
                          {format(new Date(selectedMessage.created_at), 'PPP p')}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-card-foreground mb-1">Inquiry Type:</p>
                      <p className="text-sm text-muted-foreground">{selectedMessage.inquiry_type}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-card-foreground mb-1">Subject:</p>
                      <p className="text-sm text-muted-foreground">{selectedMessage.subject}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-card-foreground mb-2">Message:</p>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedMessage.message}
                        </p>
                      </div>
                    </div>

                    {selectedMessage.admin_notes && (
                      <div>
                        <p className="text-sm font-medium text-card-foreground mb-1">Admin Notes:</p>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">{selectedMessage.admin_notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-4">
                      <Select
                        value={selectedMessage.status}
                        onValueChange={(value) => updateMessageStatus(selectedMessage.id, value as 'unread' | 'read' | 'replied')}
                        disabled={isUpdating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unread">Unread</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                        </SelectContent>
                      </Select>

                      <Dialog open={isEditNotesOpen} onOpenChange={setIsEditNotesOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              setAdminNotes(selectedMessage.admin_notes || '');
                              setIsEditNotesOpen(true);
                            }}
                          >
                            <Edit className="mr-2" size={14} />
                            {selectedMessage.admin_notes ? 'Edit Notes' : 'Add Notes'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Admin Notes</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                Message from: {selectedMessage.first_name} {selectedMessage.last_name}
                              </Label>
                            </div>
                            <div>
                              <Label htmlFor="admin-notes">Internal Notes</Label>
                              <Textarea
                                id="admin-notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add internal notes about this message..."
                                rows={4}
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => setIsEditNotesOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => updateAdminNotes(selectedMessage.id, adminNotes)}
                                disabled={isUpdating}
                                className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                              >
                                {isUpdating ? (
                                  <>
                                    <RefreshCw className="animate-spin mr-2" size={16} />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2" size={16} />
                                    Save Notes
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}&body=Dear ${selectedMessage.first_name},\n\nThank you for contacting Francis Lozano Studio.\n\n`);
                          updateMessageStatus(selectedMessage.id, 'replied');
                        }}
                      >
                        <Mail className="mr-2" size={14} />
                        Reply via Email
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="mr-2" size={14} />
                            Delete Message
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Message</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this message from {selectedMessage.first_name} {selectedMessage.last_name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMessage(selectedMessage.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Message
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
