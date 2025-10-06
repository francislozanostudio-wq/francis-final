import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations } from '@/lib/translations';

const Footer = () => {
  const { t, language } = useTranslations();
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

  const studioName = studioSettings?.studio_name || 'Francis Lozano Studio';
  const studioPhone = studioSettings?.studio_phone || '(+1 737-378-5755';
  const studioEmail = studioSettings?.studio_email || 'francislozanostudio@gmail.com';

  return (
    <footer className="bg-luxury-black text-pure-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center">
                <span className="text-luxury-black font-heading font-bold text-lg">FL</span>
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold">{studioName}</h3>
                <p className="text-sm text-gold-muted">Nail Artistry</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bespoke nail design by appointment in Nashville. Artistry at your fingertips.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-gold">{t('footer.quick_links', 'Quick Links')}</h4>
            <nav className="space-y-2">
              {[
                { href: '/services', label: t('nav.services', 'Services') },
                { href: '/gallery', label: t('nav.gallery', 'Gallery') },
                { href: '/about', label: t('nav.about', 'About') },
                { href: '/booking', label: t('nav.book_now', 'Book Appointment') },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block text-gray-300 hover:text-gold transition-colors text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-gold">{t('footer.services', 'Services')}</h4>
            <div className="space-y-2">
              {[
                'Classic Manicures',
                'Luxury Pedicures',
                'Gel-X & Acrylics',
                'Custom Nail Art',
                'Chrome & Foils',
              ].map((service) => (
                <p key={service} className="text-gray-300 text-sm">{service}</p>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-semibold text-gold">{t('footer.get_in_touch', 'Get in Touch')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-gold flex-shrink-0" />
                <span className="text-gray-300 text-sm">Nashville, TN</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gold flex-shrink-0" />
                <a 
                  href={`mailto:${studioEmail}`}
                  className="text-gray-300 hover:text-gold transition-colors text-sm"
                >
                  {studioEmail}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Instagram size={16} className="text-gold flex-shrink-0" />
                <a 
                  href="https://instagram.com/francislozanostudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-gold transition-colors text-sm"
                >
                  @francis_lozano_studio
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 {studioName}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-gold transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-gold transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="/admin/login" className="text-gray-400 hover:text-gold transition-colors text-sm">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
