
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AddEmployeeForm from "@/components/employees/AddEmployeeForm";
import EmployeeList from "@/components/employees/EmployeeList";
import { useNavigate } from "react-router-dom";

const Employees: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddEmployeeSheet, setShowAddEmployeeSheet] = useState(false);
  const navigate = useNavigate();

  const handleAddEmployeeSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowAddEmployeeSheet(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Employees</h1>
        
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
      
      <EmployeeList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default Employees;
