import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Upload, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const SubmitReview = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [linkData, setLinkData] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studioInfo, setStudioInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
    service_name: '',
    photo_url: '',
  });

  useEffect(() => {
    validateLink();
    fetchStudioInfo();
  }, [shortCode]);

  const fetchStudioInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('studio_settings')
        .select('*')
        .single();

      if (!error && data) {
        setStudioInfo(data);
      }
    } catch (error) {
      console.error('Error fetching studio info:', error);
    }
  };

  const validateLink = async () => {
    try {
      setIsValidating(true);

      const { data, error } = await supabase
        .from('testimonial_links')
        .select('*')
        .eq('short_code', shortCode)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: 'Invalid Link',
          description: 'This review link is invalid or has expired.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!data.is_active) {
        toast({
          title: 'Link Inactive',
          description: 'This review link is no longer active.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: 'Link Expired',
          description: 'This review link has expired.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (data.max_uses && data.use_count >= data.max_uses) {
        toast({
          title: 'Link Limit Reached',
          description: 'This review link has reached its maximum number of uses.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      setLinkData(data);
    } catch (error) {
      console.error('Error validating link:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while validating the link.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload an image file.',
          variant: 'destructive',
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: 'Upload Failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully!',
      });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred during upload.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.comment) {
      toast({
        title: 'Missing Information',
        description: 'Please provide your name and review.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('testimonials')
        .insert({
          client_name: formData.name,
          rating: formData.rating,
          testimonial_text: formData.comment,
          service_name: formData.service_name || null,
          client_image_url: formData.photo_url || null,
          link_id: linkData.id,
          is_active: false,
          is_featured: false,
          display_order: 999
        });

      if (error) {
        console.error('Error submitting review:', error);
        toast({
          title: 'Submission Failed',
          description: 'Failed to submit your review. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setSubmitted(true);
      toast({
        title: 'Thank You!',
        description: 'Your review has been submitted successfully.',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-accent" size={48} />
            <p className="text-lg font-medium text-foreground">Validating link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <p className="text-lg font-medium text-foreground mb-2">Invalid Link</p>
            <p className="text-sm text-muted-foreground">Redirecting to homepage...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="p-12 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your review has been submitted and will be reviewed by our team.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center space-y-2 pb-8">
            {studioInfo?.logo_url && (
              <img
                src={studioInfo.logo_url}
                alt={studioInfo.business_name}
                className="h-16 mx-auto mb-4 object-contain"
              />
            )}
            <CardTitle className="text-3xl font-heading font-bold text-foreground">
              Share Your Experience
            </CardTitle>
            <CardDescription className="text-base">
              {studioInfo?.business_name && `Thank you for choosing ${studioInfo.business_name}! `}
              We'd love to hear about your experience.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sarah M."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service / Nail Work Type</Label>
                <Input
                  id="service"
                  placeholder="e.g., Custom Chrome Design, Gel Manicure"
                  value={formData.service_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <Label>Rating *</Label>
                <div className="flex items-center justify-center space-x-2 py-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={40}
                        className={`${
                          star <= formData.rating
                            ? 'text-gold fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {formData.rating} star{formData.rating !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Your Review *</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell us about your experience..."
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Your Photo (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="animate-spin mx-auto mb-4 text-muted-foreground" size={48} />
                        <p className="text-lg font-medium text-foreground">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                        <p className="text-lg font-medium text-foreground mb-2">
                          Click to upload your photo
                        </p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, WebP up to 10MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {formData.photo_url && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.comment}
                className="w-full bg-gradient-gold hover:bg-gradient-gold/90 text-luxury-black font-semibold text-lg py-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your review will be reviewed before being published on our website.
              </p>
            </form>
          </CardContent>
        </Card>

        {studioInfo && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>{studioInfo.business_name}</p>
            {studioInfo.address && <p>{studioInfo.address}</p>}
            {studioInfo.phone && <p>{studioInfo.phone}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
