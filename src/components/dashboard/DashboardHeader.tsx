
import React from "react";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DashboardHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, HR Manager</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="search" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-200 focus:border-hr-blue"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-hr-amber"></span>
        </Button>
        
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-hr-blue text-white flex items-center justify-center">
            <User size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
