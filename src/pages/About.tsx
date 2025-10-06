import { Heart, Award, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getStudioSettings, subscribeToStudioSettings, type StudioSettings } from '@/lib/studioService';
import { useTranslations } from '@/lib/translations';

interface AboutContent {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

const About = () => {
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studioSettings, setStudioSettings] = useState<StudioSettings | null>(null);
  const { t, language, translateByText } = useTranslations();

  useEffect(() => {
    fetchAboutContent();
    loadStudioSettings();
    
    // Set up real-time subscription
    const aboutSubscription = supabase
      .channel('about-content-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'about_content' },
        () => {
          fetchAboutContent();
        }
      )
      .subscribe();

    const studioSubscription = subscribeToStudioSettings((settings) => {
      setStudioSettings(settings);
    });

    return () => {
      supabase.removeChannel(aboutSubscription);
      if (studioSubscription) {
        studioSubscription.unsubscribe();
      }
    };
  }, []);

  const loadStudioSettings = async () => {
    const settings = await getStudioSettings();
    setStudioSettings(settings);
  };

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching about content:', error);
        return;
      }

      setAboutContent(data || []);
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getContentBySection = (sectionName: string) => {
    return aboutContent.find(content => content.section === sectionName);
  };

  const heroContent = getContentBySection('hero');
  const mainContent = getContentBySection('main');
  const philosophyContent = getContentBySection('philosophy');
  const journeyContent = getContentBySection('journey');
  const experienceContent = getContentBySection('experience');

  const values = [
    {
      icon: Heart,
      title: t('about.values.passion_title', 'Passion-Driven Artistry'),
      description: t('about.values.passion_desc', 'Every nail is a canvas where creativity meets technical excellence, resulting in wearable art that tells your unique story.')
    },
    {
      icon: Award,
      title: t('about.values.quality_title', 'Uncompromising Quality'),
      description: t('about.values.quality_desc', 'Using only premium products and proven techniques to ensure your nails not only look stunning but remain healthy and strong.')
    },
    {
      icon: Sparkles,
      title: t('about.values.personalized_title', 'Personalized Experience'),
      description: t('about.values.personalized_desc', 'Each appointment is tailored to your individual style, lifestyle, and preferences in an intimate, private setting.')
    },
    {
      icon: Users,
      title: t('about.values.client_title', 'Client-Centered Care'),
      description: t('about.values.client_desc', 'Building lasting relationships through exceptional service, attention to detail, and genuine care for your satisfaction.')
    }
  ];

  const journey = [
    {
      year: '2019',
      title: t('about.journey.2019_title', 'Discovered My Passion'),
      description: t('about.journey.2019_desc', 'Fell in love with nail artistry during my first professional training course in Nashville.')
    },
    {
      year: '2020',
      title: t('about.journey.2020_title', 'Advanced Training'),
      description: t('about.journey.2020_desc', 'Completed specialized certifications in advanced nail systems, art techniques, and salon safety protocols.')
    },
    {
      year: '2021',
      title: t('about.journey.2021_title', 'Building Experience'),
      description: t('about.journey.2021_desc', 'Honed my skills working with diverse clients, developing my signature style and artistic approach.')
    },
    {
      year: '2023',
      title: t('about.journey.2023_title', 'Francis Lozano Studio'),
      description: t('about.journey.2023_desc', 'Opened my private, appointment-only studio to provide the intimate, luxury experience I envisioned.')
    }
  ];

  if (isLoading) {
    return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div></Layout>;
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 text-foreground">
            {translateByText(heroContent?.title) || t('about.title', 'Meet Francis')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {translateByText(heroContent?.content) || t('about.subtitle', 'The artist behind the artistry. Discover the passion, training, and philosophy that drives every beautiful creation at Francis Lozano Studio.')}
          </p>
          <div className="w-24 h-1 bg-gradient-gold mx-auto"></div>
        </div>
      </section>

      {/* Main About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden shadow-luxe">
                  <img 
                    src={mainContent?.image_url || '/src/assets/francis-portrait.jpg'}
                    alt="Francis Lozano, Nail Artist"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
                  <Sparkles size={32} className="text-luxury-black" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
                {translateByText(mainContent?.title) || t('about.hello_francis', "Hello, I'm Francis")}
              </h2>
              <div className="text-lg text-muted-foreground leading-relaxed">
                {mainContent?.content ? (
                  <div className="space-y-4">
                    {mainContent.content.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{translateByText(paragraph)}</p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>
                      {t('about.main_content_p1', 'Welcome to my world of nail artistry! I\'m Francis Lozano, the creative force behind Francis Lozano Studio. What started as a fascination with intricate designs has evolved into a passionate career dedicated to transforming nails into personalized works of art.')}
                    </p>
                    <p>
                      {t('about.main_content_p2', 'In my private Nashville studio, I\'ve created a sanctuary where luxury meets artistry. Every appointment is an intimate collaboration where your vision comes to life through meticulous attention to detail, premium products, and techniques refined through years of dedicated practice.')}
                    </p>
                    <p>
                      {t('about.main_content_p3', 'I believe that beautiful nails are more than just an aesthetic choice—they\'re a form of self-expression that should make you feel confident and radiant every day. That\'s why I take the time to understand not just what you want, but who you are, ensuring every design reflects your unique personality and style.')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button asChild size="lg" className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
                  <Link to="/booking">{t('about.book_with_francis', 'Book with Francis')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              {translateByText(philosophyContent?.title) || t('about.philosophy', 'My Philosophy')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {translateByText(philosophyContent?.subtitle) || t('about.philosophy_subtitle', 'The principles that guide every interaction, every design, and every detail of your experience')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="hover-lift bg-card border-border">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mb-6">
                    <value.icon size={32} className="text-luxury-black" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-4 text-card-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              {translateByText(journeyContent?.title) || t('about.journey', 'My Journey')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {translateByText(journeyContent?.subtitle) || t('about.journey_subtitle', 'The path that led me to create Francis Lozano Studio and serve Nashville\'s most discerning clients')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {journey.map((milestone, index) => (
                <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
                      <span className="font-heading font-bold text-luxury-black text-lg">
                        {milestone.year}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Studio Experience */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {translateByText(experienceContent?.title) || t('about.studio_experience', 'The Studio Experience')}
          </h2>
          <div className="max-w-4xl mx-auto text-lg leading-relaxed text-muted-foreground">
            {experienceContent?.content ? (
              <div className="space-y-6">
                {experienceContent.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={index === experienceContent.content!.split('\n\n').length - 1 ? "text-accent font-semibold" : ""}>
                    {translateByText(paragraph)}
                  </p>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <p>{t('about.experience_p1', 'Step into my private home studio, where every detail has been carefully curated to provide a luxurious, relaxing experience. From the moment you arrive, you\'ll feel the difference that comes with truly personalized service.')}</p>
                <p>{t('about.experience_p2', 'Unlike traditional salons, my appointment-only approach means you receive my undivided attention in a peaceful, intimate setting. No crowds, no rushing—just you, me, and the time needed to create something truly beautiful.')}</p>
                <p className="text-accent font-semibold">{t('about.experience_p3', 'This is more than a nail appointment; it\'s your personal sanctuary for self-care and artistic expression.')}</p>
              </div>
            )}
          </div>
          
          <div className="pt-8 space-x-4">
            <Button asChild size="lg" className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold">
              <Link to="/booking">{t('about.experience_difference', 'Experience the Difference')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-luxury-black">
              <Link to="/gallery">{t('about.view_work', 'View My Work')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
