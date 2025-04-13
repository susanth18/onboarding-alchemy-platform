
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import OnboardingStats from "@/components/dashboard/OnboardingStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import EmployeeList from "@/components/employees/EmployeeList";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AddEmployeeForm from "@/components/employees/AddEmployeeForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddEmployeeSheet, setShowAddEmployeeSheet] = useState(false);

  const handleAddEmployeeSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowAddEmployeeSheet(false);
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container py-6 px-4">
          <DashboardHeader />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Onboarding Dashboard</h1>
            
            <Sheet open={showAddEmployeeSheet} onOpenChange={setShowAddEmployeeSheet}>
              <SheetTrigger asChild>
                <Button className="flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md overflow-auto">
                <SheetHeader>
                  <SheetTitle>Add New Employee</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AddEmployeeForm onSuccess={handleAddEmployeeSuccess} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <WelcomeCard />
          
          <OnboardingStats />
          
          <div className="mt-6">
            <EmployeeList refreshTrigger={refreshTrigger} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <RecentActivity />
            <UpcomingTasks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
