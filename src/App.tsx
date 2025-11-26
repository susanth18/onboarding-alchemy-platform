
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import Profile from "./pages/Profile";
import EmployeePortal from "./pages/EmployeePortal";
import Documents from "./pages/Documents";
import Schedules from "./pages/Schedules";
import Plans from "./pages/Plans";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Recruitment from "./pages/Recruitment";
import { AuthProvider } from "./contexts/AuthContext";
import React from "react";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/:id" element={<EmployeeDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/employee-portal" element={<EmployeePortal />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/schedules" element={<Schedules />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
