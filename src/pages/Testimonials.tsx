import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations } from '@/lib/translations';

interface Testimonial {
  id: string;
  client_name: string;
  client_location?: string;
  rating: number;
  testimonial_text: string;
  service_name?: string;
  client_image_url?: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface ReviewLink {
  id: string;
  platform: string;
  platform_name: string;
  url: string;
  is_active: boolean;
  display_order: number;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [reviewLinks, setReviewLinks] = useState<ReviewLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const { t, language, translateByText } = useTranslations();

  useEffect(() => {
    fetchTestimonials();
    fetchReviewLinks();
    loadStudioSettings();
    
    // Set up real-time subscriptions
    const testimonialsSubscription = supabase
      .channel('testimonials-public-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'testimonials' },
        () => fetchTestimonials()
      )
      .subscribe();

    const reviewLinksSubscription = supabase
      .channel('review-links-public-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'review_links' },
        () => fetchReviewLinks()
      )
      .subscribe();

    const studioSubscription = subscribeToStudioSettings((settings) => {
      setStudioSettings(settings);
    });

    return () => {
      supabase.removeChannel(testimonialsSubscription);
      supabase.removeChannel(reviewLinksSubscription);
      if (studioSubscription) {
        studioSubscription.unsubscribe();
      }
    };
  }, []);

  const loadStudioSettings = async () => {
    const settings = await getStudioSettings();
    setStudioSettings(settings);
  };

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching testimonials:', error);
        return;
      }

      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('review_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching review links:', error);
        return;
      }

      setReviewLinks(data || []);
    } catch (error) {
      console.error('Error fetching review links:', error);
    }
  };

  const stats = [
    { number: '500+', label: 'Happy Clients' },
    { number: '98%', label: 'Return Rate' },
    { number: '2 weeks', label: 'Average Lasting' },
    { number: '5 stars', label: 'Average Rating' }
  ];

  // Calculate dynamic stats
  const activeTestimonials = testimonials.filter(t => t.is_active);
  const totalRating = activeTestimonials.reduce((sum, t) => sum + t.rating, 0);
  const averageRating = activeTestimonials.length > 0 ? (totalRating / activeTestimonials.length).toFixed(1) : '5.0';
  
  const dynamicStats = [
    { number: `${activeTestimonials.length}+`, label: 'Happy Clients' },
    { number: '98%', label: 'Return Rate' },
    { number: '2 weeks', label: 'Average Lasting' },
    { number: `${averageRating} stars`, label: 'Average Rating' }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {t('testimonials.title', 'Client Testimonials')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('testimonials.subtitle', "Don't just take our word for it. Read what our valued clients have to say about their transformative experiences at Francis Lozano Studio.")}
          </p>
          <div className="w-24 h-1 bg-gradient-gold mx-auto mb-8"></div>
          
          {/* Overall Rating */}
          <div className="flex justify-center items-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={32} className="text-gold fill-current" />
            ))}
          </div>
          <p className="text-lg text-foreground font-semibold">
            {averageRating} Stars from {activeTestimonials.length}+ Reviews
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-luxury-black text-pure-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {dynamicStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {activeTestimonials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Quote size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No testimonials available</p>
              <p className="text-sm">Check back soon for client reviews</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-lift bg-card border-border relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="absolute top-4 right-4 text-gold opacity-20">
                    <Quote size={48} />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        className={`${
                          star <= testimonial.rating 
                            ? 'text-gold fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed italic">
                    "{translateByText(testimonial.testimonial_text)}"
                  </blockquote>

                  {/* Client Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-card-foreground">{translateByText(testimonial.client_name)}</p>
                      {testimonial.client_location && (
                        <p className="text-sm text-muted-foreground">{translateByText(testimonial.client_location)}</p>
                      )}
                    </div>
                    {testimonial.service_name && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-accent">{translateByText(testimonial.service_name)}</p>
                      </div>
                    )}
                  </div>

                  {/* Work Sample */}
                  {testimonial.client_image_url && (
                    <div className="mt-6">
                      <div className="w-full h-32 rounded-lg overflow-hidden">
                        <img 
                          src={testimonial.client_image_url}
                          alt={`${testimonial.service_name || 'Service'} by Francis`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Google Reviews CTA */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            See More Reviews
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Read authentic reviews from satisfied clients on various platforms. 
            Your experience matters, and we're grateful for every review!
          </p>
          {reviewLinks.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {reviewLinks.map((link, index) => (
                <Button 
                  key={link.id}
                  asChild 
                  size="lg" 
                  className={index === 0 
                    ? "bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
                    : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  }
                  variant={index === 0 ? "default" : "outline"}
                >
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {link.platform_name}
                  </a>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-x-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
              >
                <a 
                  href="https://www.google.com/search?q=francis+lozano+studio+reviews" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View Google Reviews
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <a 
                  href="https://www.instagram.com/francis_lozano_studio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Follow on Instagram
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Review Invitation */}
      <section className="py-20 bg-luxury-black text-pure-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Loved Your Experience?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Help other nail art enthusiasts discover Francis Lozano Studio by sharing your experience. 
            Your review helps us continue providing exceptional service and growing our community.
          </p>
          <div className="space-x-4">
            <Button 
              size="lg" 
              className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
            >
              <Star className="mr-2" size={20} />
              Leave a Review
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gold text-gold hover:bg-gold hover:text-luxury-black">
              <Link to="/booking">Book Your Experience</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            Join Our Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Become part of the Francis Lozano Studio family and experience why clients travel 
            from across Nashville and beyond for our luxury nail artistry.
          </p>
          <Button asChild size="lg" className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
            <Link to="/booking">Book Your First Appointment</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Testimonials;