
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
import TeamDetails from "./pages/TeamDetails";
import Profile from "./pages/Profile";
import EmployeePortal from "./pages/EmployeePortal";
import Documents from "./pages/Documents";
import Schedules from "./pages/Schedules";
import Teams from "./pages/Teams";
import { AuthProvider } from "./contexts/AuthContext";
import React from "react";

// Import the actual pages instead of placeholders
const Plans = () => <div className="p-8"><h1 className="text-2xl font-bold">30-60-90 Plans Page</h1><p className="mt-4">This page is under construction.</p></div>;
const Messages = () => <div className="p-8"><h1 className="text-2xl font-bold">Messages Page</h1><p className="mt-4">This page is under construction.</p></div>;
const Analytics = () => <div className="p-8"><h1 className="text-2xl font-bold">Analytics Page</h1><p className="mt-4">This page is under construction.</p></div>;
const Settings = () => <div className="p-8"><h1 className="text-2xl font-bold">Settings Page</h1><p className="mt-4">This page is under construction.</p></div>;

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
              <Route path="/teams/:id" element={<TeamDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/employee-portal" element={<EmployeePortal />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/schedules" element={<Schedules />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/analytics" element={<Analytics />} />
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
