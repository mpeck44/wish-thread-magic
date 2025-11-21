import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Itinerary from "./pages/Itinerary";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ProfileOnboarding from "./pages/ProfileOnboarding";
import TripPlanning from "./pages/TripPlanning";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-onboarding" element={<ProtectedRoute><ProfileOnboarding /></ProtectedRoute>} />
            <Route path="/trip-planning" element={<ProtectedRoute><TripPlanning /></ProtectedRoute>} />
            <Route path="/trip-planning/:tripId" element={<ProtectedRoute><TripPlanning /></ProtectedRoute>} />
            <Route path="/itinerary/:id" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
