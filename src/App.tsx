import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Booking from "./pages/Booking";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminServices from "./pages/admin/AdminServices";
import AdminAddOns from "./pages/admin/AdminAddOns";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminEmailSettings from "./pages/admin/AdminEmailSettings";
import AdminTranslations from "./pages/admin/AdminTranslations";
import AdminServicePageSettings from "./pages/admin/AdminServicePageSettings";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SubmitReview } from "./pages/SubmitReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="francis-lozano-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/review/:shortCode" element={<SubmitReview />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute requireAdmin><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/gallery" element={<ProtectedRoute requireAdmin><AdminGallery /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute requireAdmin><AdminMessages /></ProtectedRoute>} />
            <Route path="/admin/about" element={<ProtectedRoute requireAdmin><AdminAbout /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute requireAdmin><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/add-ons" element={<ProtectedRoute requireAdmin><AdminAddOns /></ProtectedRoute>} />
            <Route path="/admin/homepage" element={<ProtectedRoute requireAdmin><AdminHomepage /></ProtectedRoute>} />
            <Route path="/admin/testimonials" element={<ProtectedRoute requireAdmin><AdminTestimonials /></ProtectedRoute>} />
            <Route path="/admin/email-settings" element={<ProtectedRoute requireAdmin><AdminEmailSettings /></ProtectedRoute>} />
            <Route path="/admin/translations" element={<ProtectedRoute requireAdmin><AdminTranslations /></ProtectedRoute>} />
            <Route path="/admin/service-page-settings" element={<ProtectedRoute requireAdmin><AdminServicePageSettings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
