import { supabase } from './supabase';

export interface ContactMessage {
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

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  inquiryType: string;
  subject: string;
  message: string;
}

export const submitContactForm = async (formData: ContactFormData): Promise<ContactMessage> => {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone || null,
      inquiry_type: formData.inquiryType,
      subject: formData.subject,
      message: formData.message,
      status: 'unread'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit contact form: ${error.message}`);
  }

  return data;
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch contact messages: ${error.message}`);
  }

  return data || [];
};

export const updateMessageStatus = async (
  messageId: string, 
  status: 'unread' | 'read' | 'replied'
): Promise<void> => {
  const { error } = await supabase
    .from('contact_messages')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId);

  if (error) {
    throw new Error(`Failed to update message status: ${error.message}`);
  }
};

export const updateAdminNotes = async (
  messageId: string, 
  notes: string
): Promise<void> => {
  const { error } = await supabase
    .from('contact_messages')
    .update({ 
      admin_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId);

  if (error) {
    throw new Error(`Failed to update admin notes: ${error.message}`);
  }
};

export const deleteContactMessage = async (messageId: string): Promise<void> => {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', messageId);

  if (error) {
    throw new Error(`Failed to delete message: ${error.message}`);
  }
};

export const getMessageStats = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('status');

  if (error) {
    throw new Error(`Failed to fetch message stats: ${error.message}`);
  }

  const stats = {
    total: data.length,
    unread: data.filter(m => m.status === 'unread').length,
    read: data.filter(m => m.status === 'read').length,
    replied: data.filter(m => m.status === 'replied').length,
  };

  return stats;
};