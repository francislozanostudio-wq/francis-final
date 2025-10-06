import { supabase } from './supabase';

export type Language = 'en' | 'es';

export interface Translation {
  id: string;
  key: string;
  category: string;
  english_text: string;
  spanish_text?: string;
  context?: string;
  is_active: boolean;
}

// Translation cache
let translationsCache: Record<string, Translation> = {};
let currentLanguage: Language = 'en';

// Get current language from localStorage or default to English
export const getCurrentLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('francis-studio-language');
    return (saved as Language) || 'en';
  }
  return 'en';
};

// Set current language and save to localStorage
export const setCurrentLanguage = (language: Language) => {
  currentLanguage = language;
  if (typeof window !== 'undefined') {
    localStorage.setItem('francis-studio-language', language);
    // Trigger a custom event to notify components of language change
    window.dispatchEvent(new CustomEvent('languageChange', { detail: language }));
  }
};

// Initialize language on app start
export const initializeLanguage = () => {
  currentLanguage = getCurrentLanguage();
};

// Fetch all translations from Supabase
export const fetchTranslations = async (): Promise<Translation[]> => {
  try {
    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) {
      console.error('Error fetching translations:', error);
      return [];
    }

    // Update cache
    translationsCache = {};
    data?.forEach(translation => {
      translationsCache[translation.key] = translation;
    });

    return data || [];
  } catch (error) {
    console.error('Error fetching translations:', error);
    return [];
  }
};

// Get translation by key
export const t = (key: string, fallback?: string): string => {
  const translation = translationsCache[key];
  const lang = getCurrentLanguage(); // Always get fresh language
  
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return fallback || key;
  }

  if (lang === 'es' && translation.spanish_text) {
    return translation.spanish_text;
  }

  return translation.english_text || fallback || key;
};

// Get translation by matching English text (for dynamic content from database)
export const translateByText = (englishText: string | undefined | null): string => {
  if (!englishText) return '';
  
  const lang = getCurrentLanguage();
  
  // If English, return as-is
  if (lang === 'en') {
    return englishText;
  }
  
  // For Spanish, search for matching translation
  const matchingTranslation = Object.values(translationsCache).find(
    translation => translation.english_text?.trim().toLowerCase() === englishText.trim().toLowerCase()
  );
  
  // Return Spanish if found, otherwise return English text
  if (matchingTranslation && matchingTranslation.spanish_text) {
    return matchingTranslation.spanish_text;
  }
  
  return englishText;
};

// Hook for using translations in React components
import { useState, useEffect } from 'react';

export const useTranslations = () => {
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(true);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Initialize translations
    initializeLanguage();
    fetchTranslations().then(() => {
      setIsLoading(false);
    });

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setLanguage(event.detail);
      // Force re-render to update all translations
      forceUpdate({});
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    setCurrentLanguage(newLanguage);
    setLanguage(newLanguage);
    // Force re-render
    forceUpdate({});
  };

  return {
    language,
    changeLanguage,
    t,
    translateByText,
    isLoading
  };
};

// Admin functions for managing translations
export const createTranslation = async (translation: Omit<Translation, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('translations')
    .insert(translation)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create translation: ${error.message}`);
  }

  return data;
};

export const updateTranslation = async (id: string, updates: Partial<Translation>) => {
  const { data, error } = await supabase
    .from('translations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update translation: ${error.message}`);
  }

  // Update cache
  if (data) {
    translationsCache[data.key] = data;
  }

  return data;
};

export const deleteTranslation = async (id: string) => {
  const { error } = await supabase
    .from('translations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete translation: ${error.message}`);
  }
};

export const getAllTranslations = async (): Promise<Translation[]> => {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch translations: ${error.message}`);
  }

  return data || [];
};

export const getTranslationsByCategory = async (category: string): Promise<Translation[]> => {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('key', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch translations for category ${category}: ${error.message}`);
  }

  return data || [];
};