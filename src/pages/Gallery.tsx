import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations } from '@/lib/translations';

interface GalleryItem {
  id: string;
  title?: string;
  description?: string;
  media_url: string;
  media_type: 'image' | 'video';
  category: string;
  shape: string;
  style: string;
  is_featured: boolean;
  created_at: string;
}

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const { toast } = useToast();
  const { t, language, translateByText } = useTranslations();

  useEffect(() => {
    fetchGalleryItems();
    loadStudioSettings();

    // Set up real-time subscription for studio settings
    const studioSubscription = subscribeToStudioSettings((settings) => {
      setStudioSettings(settings);
    });

    return () => {
      if (studioSubscription) {
        studioSubscription.unsubscribe();
      }
    };
  }, []);

  const loadStudioSettings = async () => {
    const settings = await getStudioSettings();
    setStudioSettings(settings);
  };

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery items:', error);
        toast({
          title: 'Error',
          description: 'Failed to load gallery. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: t('gallery.all_designs', 'All Designs') },
    { id: 'featured', label: t('gallery.featured', 'Featured') },
    { id: 'almond', label: 'Almond Shape' },
    { id: 'stiletto', label: 'Stiletto Shape' },
    { id: 'coffin', label: 'Coffin Shape' },
    { id: 'chrome', label: 'Chrome Finish' },
    { id: 'french', label: 'French Style' },
    { id: 'abstract', label: 'Abstract Art' },
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'floral', label: 'Floral' },
    { id: 'bold', label: 'Bold' },
    { id: 'romantic', label: 'Romantic' },
  ];

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : activeFilter === 'featured'
    ? galleryItems.filter(item => item.is_featured)
    : galleryItems.filter(item => 
        item.category === activeFilter || 
        item.shape === activeFilter || 
        item.style === activeFilter
      );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('gallery.title', 'Design Gallery')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('gallery.subtitle', 'Explore our portfolio of stunning nail artistry. Each design is a unique masterpiece crafted with precision, creativity, and passion. Find inspiration for your next appointment.')}
          </p>
          <div className="w-24 h-1 bg-gradient-gold mx-auto"></div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              {t('gallery.filter_by_style', 'Filter by Style')}
            </h2>
            <p className="text-muted-foreground">
              Find the perfect inspiration for your next nail design
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.id)}
                className={`${
                  activeFilter === filter.id 
                    ? 'bg-gradient-gold text-luxury-black hover:bg-gradient-gold/90' 
                    : 'border-accent text-accent hover:bg-accent hover:text-accent-foreground'
                } font-semibold transition-all duration-300`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No gallery items found</h3>
              <p>Try adjusting your filters or check back later for new additions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg shadow-elegant hover:shadow-luxe transition-all duration-300 hover-lift"
                >
                  <div className="aspect-square overflow-hidden">
                    {item.media_type === 'image' ? (
                      <img 
                        src={item.media_url}
                        alt={item.title || `Nail design ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <video 
                        src={item.media_url}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    )}
                  </div>
                  
                  {/* Featured Badge */}
                  {item.is_featured && (
                    <div className="absolute top-3 left-3 bg-gold text-luxury-black px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <span className="mr-1">⭐</span>
                      Featured
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-luxury-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center text-pure-white p-4">
                      <h3 className="font-heading text-lg font-semibold mb-2">
                        {translateByText(item.title) || 'Beautiful Nail Design'}
                      </h3>
                      {item.description && (
                        <p className="text-sm mb-3 opacity-90">
                          {translateByText(item.description)}
                        </p>
                      )}
                      <div className="flex flex-wrap justify-center gap-2 text-xs">
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded">
                          {item.shape}
                        </span>
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded">
                          {item.style}
                        </span>
                        <span className="bg-gold/20 text-gold px-2 py-1 rounded">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Info */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              {t('gallery.showing_designs', `Showing ${filteredItems.length} designs`).replace('{count}', filteredItems.length.toString())}
              {activeFilter !== 'all' && ` for "${filters.find(f => f.id === activeFilter)?.label}"`}
            </p>
            
            <div className="space-y-4">
              <p className="text-lg text-foreground max-w-2xl mx-auto">
                {t('gallery.book_cta', 'Love what you see? Book your appointment today and let\'s create your perfect nail design together.')}
              </p>
              <div className="space-x-4">
                <Button asChild size="lg" className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                  <Link to="/booking">{t('gallery.book_appointment', 'Book Appointment')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <Link to="/services">{t('gallery.view_services', 'View Services')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t('gallery.custom_design_title', 'Bring Your Vision to Life')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('gallery.custom_design_description', 'Have a specific design in mind? Our custom consultation process ensures your unique vision becomes a stunning reality. From concept sketches to the final masterpiece, we work together to create nail art that\'s uniquely yours.')}
          </p>
          <Button asChild size="lg" className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
            <Link to="/contact">{t('gallery.discuss_custom', 'Discuss Custom Design')}</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;