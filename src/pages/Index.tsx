import { Link } from 'react-router-dom';
import { Star, Sparkles, Calendar, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations } from '@/lib/translations';

interface HomepageContent {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
  display_order: number;
}

const Index = () => {
  const [featuredGalleryItems, setFeaturedGalleryItems] = useState<any[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContent[]>([]);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const { t, language, translateByText } = useTranslations();

  useEffect(() => {
    fetchFeaturedItems();
    fetchHomepageContent();
    loadStudioSettings();
    
    // Set up real-time subscription for homepage content
    const homepageSubscription = supabase
      .channel('homepage-content-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'homepage_content' },
        () => {
          // Force re-fetch to get latest content
          fetchHomepageContent();
        }
      )
      .subscribe();

    const studioSubscription = subscribeToStudioSettings((settings) => {
      setStudioSettings(settings);
    });

    return () => {
      supabase.removeChannel(homepageSubscription);
      if (studioSubscription) {
        studioSubscription.unsubscribe();
      }
    };
  }, []);

  const loadStudioSettings = async () => {
    const settings = await getStudioSettings();
    setStudioSettings(settings);
  };

  const fetchFeaturedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_featured', true)
        .eq('media_type', 'image')
        .limit(3)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured items:', error);
        return;
      }

      setFeaturedGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    }
  };

  const fetchHomepageContent = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching homepage content:', error);
        return;
      }

      setHomepageContent(data || []);
    } catch (error) {
      console.error('Error fetching homepage content:', error);
    }
  };

  const getContentBySection = (sectionName: string) => {
    return homepageContent.find(content => content.section === sectionName);
  };

  const heroContent = getContentBySection('hero');
  const aboutContent = getContentBySection('about');
  const servicesContent = getContentBySection('services');
  const testimonialContent = getContentBySection('testimonial');
  const ctaContent = getContentBySection('cta');

  // Services array - depends on language, so it's recalculated on each render
  const services = [
    {
      icon: Sparkles,
      title: t('homepage.services.luxury_manicures', 'Luxury Manicures'),
      description: t('homepage.services.luxury_manicures_desc', 'Premium manicure services with meticulous attention to detail and lasting results.')
    },
    {
      icon: Award,
      title: t('homepage.services.custom_nail_art', 'Custom Nail Art'),
      description: t('homepage.services.custom_nail_art_desc', 'Bespoke nail designs crafted to reflect your unique style and personality.')
    },
    {
      icon: Star,
      title: t('homepage.services.premium_extensions', 'Premium Extensions'),
      description: t('homepage.services.premium_extensions_desc', 'Professional gel, acrylic, and dip powder systems for enduring beauty.')
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroContent?.image_url || ''}')` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-6">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-light mb-6 tracking-wide">
            {translateByText(heroContent?.title) || t('homepage.hero.title', 'Francis Lozano Studio')}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 font-light max-w-3xl mx-auto leading-relaxed">
            {translateByText(heroContent?.subtitle) || t('homepage.hero.subtitle', 'Exquisite nail artistry by appointment in Nashville. Where craftsmanship meets elegance in an intimate studio setting.')}
          </p>
          
          {heroContent?.content && (
            <div className="mb-12 max-w-3xl mx-auto">
              <p className="text-base md:text-lg font-light leading-relaxed whitespace-pre-line text-white/95 italic">
                {translateByText(heroContent.content)}
              </p>
            </div>
          )}
          
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-black hover:bg-white/90 font-medium text-base px-10 py-6 rounded-sm"
          >
            <Link to={heroContent?.button_link || '/booking'}>
              {translateByText(heroContent?.button_text) || t('homepage.hero.button', 'Book Consultation')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-light mb-8 text-foreground">
              {translateByText(aboutContent?.title) || t('homepage.about.title', 'Artistry Redefined')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {translateByText(aboutContent?.subtitle) || t('homepage.about.subtitle', 'At Francis Lozano Studio, every appointment is a personalized experience. We specialize in creating bespoke nail designs that elevate your natural beauty through precision, artistry, and the finest materials.')}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-heading text-3xl md:text-4xl font-light mb-6 text-foreground">
              {translateByText(servicesContent?.title) || t('homepage.services.title', 'Our Services')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {translateByText(servicesContent?.subtitle) || t('homepage.services.subtitle', 'Discover our curated selection of premium nail services')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-primary/80 transition-colors duration-300">
                  <service.icon size={32} className="text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-medium mb-4 text-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-sm px-8 py-6">
              <Link to={servicesContent?.button_link || '/services'}>
                {translateByText(servicesContent?.button_text) || t('homepage.services.view_all', 'View All Services')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-heading text-3xl md:text-4xl font-light mb-6 text-foreground">
              {t('homepage.portfolio.title', 'Portfolio')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('homepage.portfolio.subtitle', 'A showcase of our finest nail artistry creations')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {featuredGalleryItems.length > 0 ? featuredGalleryItems.map((item, index) => (
              <div 
                key={index} 
                className="aspect-[4/5] overflow-hidden group cursor-pointer"
              >
                <img 
                  src={item.media_url} 
                  alt={item.title || `Featured nail design ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )) : (
              // Fallback to placeholder if no featured items
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                <p>Featured gallery items will appear here</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-8 py-6">
              <Link to="/gallery">
                {t('homepage.portfolio.view_full_gallery', 'View Full Gallery')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="flex justify-center mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} className="text-yellow-500 fill-current mx-1" />
            ))}
          </div>
          <blockquote className="font-heading text-xl md:text-2xl lg:text-3xl font-light italic mb-8 leading-relaxed">
            "{translateByText(testimonialContent?.subtitle) || t('homepage.testimonial.quote', 'Francis transformed my nails into absolute works of art. The attention to detail, quality of work, and luxurious experience exceeded all expectations.')}"
          </blockquote>
          <cite className="text-black-300 font-medium">{translateByText(testimonialContent?.content) || t('homepage.testimonial.author', 'Sarah M., Nashville')}</cite>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gold/10 to-gold/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            {translateByText(ctaContent?.title) || t('homepage.cta.title', 'Ready to Transform Your Nails?')}
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {translateByText(ctaContent?.subtitle) || t('homepage.cta.subtitle', "Don't wait—my calendar fills up quickly! Book your appointment today and experience the difference of truly personalized nail artistry.")}
          </p>
          <div className="space-x-4">
            <Button size="lg" className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
              <Calendar className="mr-2" size={20} />
              {translateByText(ctaContent?.button_text) || t('homepage.cta.book_now', 'Book Now')}
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-luxury-black">
              <Link to="/services">{t('homepage.cta.view_services', 'View Services')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
