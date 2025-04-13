
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Mail, Phone, User, Briefcase, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!user || !id) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setEmployee(data as Employee);
      } catch (error: any) {
        toast({
          title: "Error fetching employee details",
          description: error.message,
          variant: "destructive",
        });
        navigate('/employees');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [user, id, navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case 'active':
        return <Badge className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-50 text-blue-600 border-blue-200">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Employee not found</h2>
          <p className="text-gray-500 mb-4">The employee you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => navigate('/employees')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Employee Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                {getStatusBadge(employee.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Full Name</p>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">{employee.name}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">{employee.employee_id}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Role</p>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">{employee.role}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                
                {employee.phone && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Added On</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="font-medium">
                      {format(new Date(employee.created_at), 'PPP')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {employee.job_description_url ? (
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <span>Job Description</span>
                    </div>
                    <a 
                      href={employee.job_description_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="p-4 border rounded-md flex items-center justify-between bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-500">Job Description</span>
                    </div>
                    <span className="text-xs text-gray-400">Not uploaded</span>
                  </div>
                )}
                
                {employee.contract_url ? (
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <span>Contract</span>
                    </div>
                    <a 
                      href={employee.contract_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="p-4 border rounded-md flex items-center justify-between bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-500">Contract</span>
                    </div>
                    <span className="text-xs text-gray-400">Not uploaded</span>
                  </div>
                )}
                
                {employee.resume_url ? (
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <span>Resume</span>
                    </div>
                    <a 
                      href={employee.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="p-4 border rounded-md flex items-center justify-between bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-500">Resume</span>
                    </div>
                    <span className="text-xs text-gray-400">Not uploaded</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
