import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, Shield, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const SignUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof LoginSchema>;
type SignUpData = z.infer<typeof SignUpSchema>;

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLogin = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!authData.user) {
        setError('Authentication failed');
        return;
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        setError('Failed to verify admin access');
        return;
      }

      if (profile?.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        // Sign out the user since they don't have admin access
        await supabase.auth.signOut();
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in as admin.',
      });

      navigate('/admin/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        // Check if email confirmation is required
        if (!authData.session) {
          setSuccess('Please check your email and click the confirmation link to complete registration.');
        } else {
          setSuccess('Account created successfully! You can now sign in.');
          setActiveTab('login');
          loginForm.setValue('email', data.email);
        }
        
        // Reset the sign-up form
        signUpForm.reset();
      }
    } catch (err) {
      setError('An unexpected error occurred during registration');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Shield size={32} className="text-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
            Francis Lozano Studio
          </h1>
          <p className="text-muted-foreground">Admin Access</p>
        </div>

        <Card className="bg-card border-border/50 shadow-elegant backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="font-heading text-2xl text-card-foreground">
              Admin Portal
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Sign in or create an admin account
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <Alert className="mb-6 border-red-700/50 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-blue-700/50 text-blue-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center bg-background hover:bg-accent hover:text-accent-foreground focus:bg-background focus:text-accent-foreground data-[state=active]:bg-gradient-gold data-[state=active]:text-luxury-black">
                  <Shield className="mr-2" size={16} />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center bg-background hover:bg-accent hover:text-accent-foreground focus:bg-background focus:text-accent-foreground data-[state=active]:bg-gradient-gold data-[state=active]:text-luxury-black">
                  <UserPlus className="mr-2" size={16} />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=active]:opacity-100">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-card-foreground font-medium">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                              <Input
                                type="email"
                                placeholder="admin@francis_lozano_studio.com"
                                className="pl-10 bg-background border-input hover:border-accent focus:bg-background"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-card-foreground font-medium">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-10 pr-10 bg-background border-input hover:border-accent focus:bg-background"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-gold hover:bg-gradient-gold/90 text-foreground font-semibold mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        <>
                          <Shield className="mr-2" size={18} />
                          Sign In as Admin
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=active]:opacity-100">
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-card-foreground font-medium">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                className="pl-10 bg-background border-input hover:border-accent focus:bg-background"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-card-foreground font-medium">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                className="pl-10 pr-10 bg-background border-input hover:border-accent focus:bg-background"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-card-foreground font-medium">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className="pl-10 pr-10 bg-background border-input hover:border-accent focus:bg-background"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-sm text-muted-foreground">
                      <p><strong>Note:</strong> New accounts are created with 'user' role by default. Contact the system administrator to upgrade to 'admin' role for dashboard access.</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-gold hover:bg-gradient-gold/90 text-foreground font-semibold mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                          Creating account...
                        </div>
                      ) : (
                        <>
                          <UserPlus className="mr-2" size={18} />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Only authorized administrators can access the dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
