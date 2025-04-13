
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, CalendarCheck, Users, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const EmployeePortal = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hrName, setHrName] = useState("");
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [documents, setDocuments] = useState<{
    job_description_url: string | null;
    contract_url: string | null;
    resume_url: string | null;
  }>({
    job_description_url: null,
    contract_url: null,
    resume_url: null,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadEmployeeData = async () => {
      try {
        // Get employee data
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*, hr_id')
          .eq('email', user.email)
          .single();

        if (employeeError) throw employeeError;
        
        setEmployeeData(employeeData);
        
        // Get HR info
        if (employeeData.hr_id) {
          const { data: hrData, error: hrError } = await supabase
            .from('hr_profiles')
            .select('name')
            .eq('id', employeeData.hr_id)
            .single();
            
          if (hrError) throw hrError;
          
          setHrName(hrData.name);
        }
        
        // Set document URLs
        setDocuments({
          job_description_url: employeeData.job_description_url,
          contract_url: employeeData.contract_url,
          resume_url: employeeData.resume_url
        });
      } catch (error: any) {
        console.error('Error loading employee data:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-sidebar text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Employee Onboarding Portal</h1>
          <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="text-white border-white hover:bg-white hover:text-sidebar-foreground"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome to your Onboarding Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Your HR Manager:</strong> {hrName}
              </p>
              <p>
                <strong>Role:</strong> {employeeData?.role}
              </p>
              <p>
                <strong>Status:</strong> {' '}
                <Badge className={
                  employeeData?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  employeeData?.status === 'active' ? 'bg-green-100 text-green-800' : 
                  'bg-blue-100 text-blue-800'
                }>
                  {employeeData?.status}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="documents">
          <TabsList className="mb-4">
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="plan">
              <CalendarCheck className="h-4 w-4 mr-2" />
              30-60-90 Day Plan
            </TabsTrigger>
            <TabsTrigger value="meetings">
              <Users className="h-4 w-4 mr-2" />
              Meetings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documents.job_description_url ? (
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <span>Job Description</span>
                    </div>
                    <a 
                      href={documents.job_description_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  </div>
                ) : (
                  <div className="p-4 border rounded-md flex items-center justify-between bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-500">Job Description</span>
                    </div>
                    <span className="text-xs text-gray-400">Not available</span>
                  </div>
                )}
                
                {documents.contract_url ? (
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <span>Contract</span>
                    </div>
                    <a 
                      href={documents.contract_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  </div>
                ) : (
                  <div className="p-4 border rounded-md flex items-center justify-between bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-500">Contract</span>
                    </div>
                    <span className="text-xs text-gray-400">Not available</span>
                  </div>
                )}
                
                {documents.resume_url ? (
                  <div className="p-4 border rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <span>Resume</span>
                    </div>
                    <a 
                      href={documents.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  </div>
                ) : (
                  <div className="p-4 border rounded-md flex items-center justify-between bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-500">Resume</span>
                    </div>
                    <span className="text-xs text-gray-400">Not available</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="plan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>30-60-90 Day Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">First 30 Days</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-1" />
                        <label htmlFor="task-1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Complete company orientation
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-2" />
                        <label htmlFor="task-2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Meet with team members
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-3" />
                        <label htmlFor="task-3" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Set up workstation and tools
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">60 Days</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-4" />
                        <label htmlFor="task-4" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Complete first project
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-5" />
                        <label htmlFor="task-5" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Participate in team meeting
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">90 Days</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-6" />
                        <label htmlFor="task-6" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          First performance review
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="task-7" />
                        <label htmlFor="task-7" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Set long-term goals
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Onboarding Introduction</h3>
                        <p className="text-sm text-gray-500">With {hrName}</p>
                        <p className="text-sm text-gray-500 mt-1">Tomorrow, 10:00 AM</p>
                      </div>
                      <Button variant="outline" size="sm">Join</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Team Introduction</h3>
                        <p className="text-sm text-gray-500">With Team Lead</p>
                        <p className="text-sm text-gray-500 mt-1">Next Week, Monday 2:00 PM</p>
                      </div>
                      <Button variant="outline" size="sm">Join</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EmployeePortal;
