
import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const WelcomeCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-hr-blue to-blue-700 rounded-lg p-6 text-white mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold mb-2">Welcome to ProjectX Onboarding</h2>
          <p className="text-blue-100 mb-4">
            Streamline your employee onboarding process and improve new hire experiences
          </p>
          <div className="flex space-x-3">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
              Quick Tour
            </Button>
            <Button variant="secondary" className="bg-white text-hr-blue hover:bg-white/90">
              Add New Employee
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
        <div className="hidden md:block">
          {/* This would be a nice graphic/illustration */}
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <Users size={40} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Users = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default WelcomeCard;
