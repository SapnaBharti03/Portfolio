import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/admin/components/ProtectedRoute";
import { AdminLayout } from "@/admin/components/AdminLayout";
import Login from "@/admin/pages/Login";
import Signup from "@/admin/pages/Signup";
import Dashboard from "@/admin/pages/Dashboard";
import ProfilePage from "@/admin/pages/Profile";
import ProjectsAdmin from "@/admin/pages/Projects";
import SkillsAdmin from "@/admin/pages/Skills";
import ServicesAdmin from "@/admin/pages/Services";
import ExperienceAdmin from "@/admin/pages/Experience";
import EducationAdmin from "@/admin/pages/Education";
import CertificationsAdmin from "@/admin/pages/Certifications";
import TestimonialsAdmin from "@/admin/pages/Testimonials";
import BlogAdmin from "@/admin/pages/Blog";
import SocialAdmin from "@/admin/pages/Social";
import MessagesAdmin from "@/admin/pages/Messages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="skills" element={<SkillsAdmin />} />
              <Route path="services" element={<ServicesAdmin />} />
              <Route path="experience" element={<ExperienceAdmin />} />
              <Route path="education" element={<EducationAdmin />} />
              <Route path="certifications" element={<CertificationsAdmin />} />
              <Route path="testimonials" element={<TestimonialsAdmin />} />
              <Route path="blog" element={<BlogAdmin />} />
              <Route path="social" element={<SocialAdmin />} />
              <Route path="messages" element={<MessagesAdmin />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
