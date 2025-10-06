import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { useEffect } from 'react';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations } from '@/lib/translations';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const location = useLocation();
  const { t, language } = useTranslations();

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

  const navItems = [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/services', label: t('nav.services', 'Services') },
    { href: '/gallery', label: t('nav.gallery', 'Gallery') },
    { href: '/about', label: t('nav.about', 'About') },
    { href: '/testimonials', label: t('nav.testimonials', 'Testimonials') },
    { href: '/contact', label: t('nav.contact', 'Contact') },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="fixed top-0 w-full bg-background/98 backdrop-blur-md border-b border-border/50 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-semibold text-sm">FL</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading text-lg font-medium text-foreground tracking-tight">
                {studioSettings?.studio_name || 'Francis Lozano Studio'}
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md hover:bg-muted ${
                  isActive(item.href) ? 'text-primary bg-muted' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-border flex items-center space-x-2">
              <LanguageSelector />
              <ThemeToggle />
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                <Link to="/booking">{t('nav.book_now', 'Book Now')}</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-luxe z-50">
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive(item.href) ? 'text-primary bg-secondary' : 'text-foreground hover:text-primary hover:bg-secondary/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <LanguageSelector />
                </div>
                <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                  <Link to="/booking" onClick={() => setIsOpen(false)}>{t('nav.book_now', 'Book Now')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;