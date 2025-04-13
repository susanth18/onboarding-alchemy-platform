
import React from "react";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import OnboardingStats from "@/components/dashboard/OnboardingStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";

const Index: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container py-6">
          <DashboardHeader />
          
          <WelcomeCard />
          
          <OnboardingStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity />
            <UpcomingTasks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
