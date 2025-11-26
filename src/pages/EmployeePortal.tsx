
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, CalendarCheck, Users, CheckSquare, ArrowLeft, Download, User, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Meeting, MilestonePeriod } from "@/types";
import { getMilestonePlan, saveMilestonePlan, defaultMilestonePlan } from "@/lib/milestones";

const EmployeePortal = () => {
  const navigate = useNavigate();
  const { user, signOut, userRole } = useAuth();
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
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [meetingTime, setMeetingTime] = useState<string>("10:00");
  const [meetingPurpose, setMeetingPurpose] = useState<string>("");
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [milestonePlan, setMilestonePlan] = useState<MilestonePeriod[]>(defaultMilestonePlan);

  useEffect(() => {
    // if (!user) {
    //   navigate('/auth');
    //   return;
    // }

    // if (userRole !== 'employee') {
    //   console.log("User is not an employee, redirecting to appropriate page");
    //   // navigate('/');
    //   // return;
    // }

    const loadEmployeeData = async () => {
      try {
        console.log("Loading employee data for", user.email);
        
        // Changed from single() to maybeSingle() to prevent errors when no rows are found
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*, hr_id')
          .eq('email', user.email)
          .maybeSingle();

        if (employeeError) {
          console.error("Error fetching employee data:", employeeError);
          throw employeeError;
        }
        
        if (!employeeData) {
          console.error("No employee record found for this user");
          toast({
            title: "Account Not Found",
            description: "No employee profile found for your account. Please contact HR.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        console.log("Employee data loaded:", employeeData);
        setEmployeeData(employeeData);
        
        if (employeeData.hr_id) {
          // Changed from single() to maybeSingle() to prevent errors
          const { data: hrData, error: hrError } = await supabase
            .from('hr_profiles')
            .select('name')
            .eq('id', employeeData.hr_id)
            .maybeSingle();
            
          if (hrError) {
            console.error("Error fetching HR data:", hrError);
          } else if (hrData) {
            console.log("HR data loaded:", hrData);
            setHrName(hrData.name);
          }
        }
        
        setDocuments({
          job_description_url: employeeData.job_description_url,
          contract_url: employeeData.contract_url,
          resume_url: employeeData.resume_url
        });

        // Directly get meetings with employee's UUID
        const { data: meetingsData, error: meetingsError } = await supabase
          .from('meetings')
          .select('*')
          .eq('employee_id', employeeData.id);
          
        if (meetingsError) {
          console.error("Error fetching meetings:", meetingsError);
        } else {
          console.log("Meetings loaded:", meetingsData);
          if (meetingsData) {
            const formattedMeetings: Meeting[] = meetingsData.map((meeting) => ({
              id: meeting.id,
              hr_id: meeting.hr_id,
              employee_id: meeting.employee_id,
              meeting_date: meeting.meeting_date,
              meeting_time: meeting.meeting_time,
              purpose: meeting.purpose,
              status: meeting.status as 'scheduled' | 'completed' | 'cancelled'
            }));
            
            setMeetings(formattedMeetings);
          }
        }

        // Load milestone plan
        const plan = await getMilestonePlan(employeeData.id);
        if (plan) {
          console.log("Milestone plan loaded:", plan);
          setMilestonePlan(plan);
        } else {
          console.log("No milestone plan found, using default");
          setMilestonePlan(defaultMilestonePlan);
        }
      } catch (error: any) {
        console.error('Error loading employee data:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [user, navigate, userRole]);

  useEffect(() => {
    let completed = 0;
    let total = 0;

    milestonePlan.forEach(period => {
      period.milestones.forEach(milestone => {
        total++;
        if (milestone.completed) {
          completed++;
        }
      });
    });

    setCompletedTasks(completed);
    setTotalTasks(total);
  }, [milestonePlan]);

  const toggleMilestoneCompletion = async (periodIndex: number, milestoneIndex: number) => {
    const newMilestonePlan = [...milestonePlan];
    const milestone = newMilestonePlan[periodIndex].milestones[milestoneIndex];
    milestone.completed = !milestone.completed;
    
    setMilestonePlan(newMilestonePlan);
    
    // Save to backend
    if (employeeData?.id) {
      await saveMilestonePlan(employeeData.id, newMilestonePlan);
    }
    
    toast({
      title: milestone.completed ? "Task completed" : "Task marked as incomplete",
      description: `"${milestone.text}" has been updated`
    });
  };

  const updateMilestoneNotes = async (periodIndex: number, milestoneIndex: number, notes: string) => {
    const newMilestonePlan = [...milestonePlan];
    newMilestonePlan[periodIndex].milestones[milestoneIndex].notes = notes;
    setMilestonePlan(newMilestonePlan);

    // Save to backend
    if (employeeData?.id) {
      await saveMilestonePlan(employeeData.id, newMilestonePlan);
    }
  };

  const scheduleMeeting = async () => {
    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select a date for the meeting",
        variant: "destructive",
      });
      return;
    }

    if (!meetingPurpose.trim()) {
      toast({
        title: "Purpose required",
        description: "Please provide a purpose for the meeting",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          hr_id: employeeData?.hr_id,
          employee_id: employeeData?.id,
          meeting_date: selectedDate.toISOString(),
          meeting_time: meetingTime,
          purpose: meetingPurpose,
          status: 'scheduled' as const
        })
        .select();

      if (error) throw error;

      const formattedDate = format(selectedDate, "MMMM do, yyyy");
      
      toast({
        title: "Meeting scheduled",
        description: `Your meeting has been scheduled for ${formattedDate} at ${meetingTime}`
      });

      if (data && data.length > 0) {
        const newMeeting: Meeting = {
          id: data[0].id,
          hr_id: data[0].hr_id,
          employee_id: data[0].employee_id,
          meeting_date: data[0].meeting_date,
          meeting_time: data[0].meeting_time,
          purpose: data[0].purpose,
          status: data[0].status as 'scheduled' | 'completed' | 'cancelled'
        };
        
        setMeetings([...meetings, newMeeting]);
      }

      setSelectedDate(undefined);
      setMeetingTime("10:00");
      setMeetingPurpose("");
    } catch (error: any) {
      console.error("Error scheduling meeting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule meeting",
        variant: "destructive",
      });
    }
  };

  const setActiveTabAndNavigate = (tabValue: string) => {
    setActiveTab(tabValue);
    setTimeout(() => {
      const tabElement = document.querySelector(`[value="${tabValue}"]`);
      if (tabElement && tabElement instanceof HTMLElement) {
        tabElement.click();
      }
    }, 0);
  };

  const renderDocumentsTabContent = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>Access and download your onboarding documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed overview of your role, responsibilities, and performance expectations.
                </p>
                {documents.job_description_url ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center" asChild>
                      <a href={documents.job_description_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button size="sm" className="flex items-center" asChild>
                      <a href={documents.job_description_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Document not available yet. Please check back later.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  Employment Contract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your employment agreement including terms and conditions.
                </p>
                {documents.contract_url ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center" asChild>
                      <a href={documents.contract_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button size="sm" className="flex items-center" asChild>
                      <a href={documents.contract_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Document not available yet. Please check back later.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your submitted resume.
                </p>
                {documents.resume_url ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center" asChild>
                      <a href={documents.resume_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button size="sm" className="flex items-center" asChild>
                      <a href={documents.resume_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Document not available yet. Please check back later.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  Company Handbook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Important company policies, culture, and guidelines.
                </p>
                <div className="text-sm text-muted-foreground">
                  Document not available yet. Please check back later.
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderUpcomingMeetings = () => {
    const upcomingMeetings = meetings.filter(m => m.status === 'scheduled');
    return upcomingMeetings.length > 0 ? (
      <div className="space-y-4">
        {upcomingMeetings.map((meeting) => (
          <div key={meeting.id} className="p-4 border rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{meeting.purpose}</h3>
                <p className="text-sm text-gray-500">With {hrName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(meeting.meeting_date), 'MMMM do, yyyy')}, {meeting.meeting_time}
                </p>
                <Badge className="mt-2">Video Meeting</Badge>
              </div>
              <Button variant="outline" size="sm">Join</Button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center p-6">
        <h3 className="font-medium text-lg">No upcoming meetings</h3>
        <p className="text-muted-foreground mt-1">
          Schedule a meeting using the form
        </p>
      </div>
    );
  };

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
              variant="secondary" 
              onClick={() => signOut()}
              className="bg-white text-sidebar hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Welcome to your Onboarding Portal</CardTitle>
                <CardDescription>Track your onboarding progress and access resources</CardDescription>
              </div>
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-white text-xl">
                  {employeeData?.name?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your HR Manager</p>
                  <p className="font-medium">{hrName || "Not assigned"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{employeeData?.role || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={
                    employeeData?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    employeeData?.status === 'active' ? 'bg-green-100 text-green-800' : 
                    'bg-blue-100 text-blue-800'
                  }>
                    {employeeData?.status || "Unknown"}
                  </Badge>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Onboarding Progress</p>
                  <p className="text-sm text-muted-foreground">{completedTasks} of {totalTasks} tasks completed</p>
                </div>
                <Progress value={(completedTasks / totalTasks) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTabAndNavigate} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="dashboard" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center">
              <CalendarCheck className="h-4 w-4 mr-2" />
              30-60-90 Day Plan
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Meetings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access your job-related documents and agreements
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      Job Description
                      {documents.job_description_url ? (
                        <Badge variant="outline" className="ml-2">Available</Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 bg-gray-100">Pending</Badge>
                      )}
                    </li>
                    <li className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      Contract
                      {documents.contract_url ? (
                        <Badge variant="outline" className="ml-2">Available</Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 bg-gray-100">Pending</Badge>
                      )}
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTabAndNavigate("documents")}>
                    View Documents
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarCheck className="h-5 w-5 mr-2 text-primary" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track your 30-60-90 day plan progress
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>First 30 Days</span>
                        <span>{milestonePlan[0].milestones.filter(m => m.completed).length}/{milestonePlan[0].milestones.length}</span>
                      </div>
                      <Progress value={(milestonePlan[0].milestones.filter(m => m.completed).length / milestonePlan[0].milestones.length) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>60 Days</span>
                        <span>{milestonePlan[1].milestones.filter(m => m.completed).length}/{milestonePlan[1].milestones.length}</span>
                      </div>
                      <Progress value={(milestonePlan[1].milestones.filter(m => m.completed).length / milestonePlan[1].milestones.length) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>90 Days</span>
                        <span>{milestonePlan[2].milestones.filter(m => m.completed).length}/{milestonePlan[2].milestones.length}</span>
                      </div>
                      <Progress value={(milestonePlan[2].milestones.filter(m => m.completed).length / milestonePlan[2].milestones.length) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTabAndNavigate("plan")}>
                    View Full Plan
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Upcoming Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule and manage your onboarding meetings
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-md">
                      <p className="font-medium">Onboarding Introduction</p>
                      <p className="text-sm text-muted-foreground">With {hrName}</p>
                      <p className="text-sm text-muted-foreground mt-1">Tomorrow, 10:00 AM</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="font-medium">Team Introduction</p>
                      <p className="text-sm text-muted-foreground">With Team Lead</p>
                      <p className="text-sm text-muted-foreground mt-1">Next Monday, 2:00 PM</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTabAndNavigate("meetings")}>
                    Schedule Meeting
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            {renderDocumentsTabContent()}
          </TabsContent>
          
          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle>Your 30-60-90 Day Plan</CardTitle>
                <CardDescription>Track your progress through the onboarding process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {milestonePlan.map((period, periodIndex) => (
                    <div key={period.title} className="space-y-4">
                      <h3 className="font-semibold text-lg">{period.title}</h3>
                      <div className="space-y-4">
                        {period.milestones.map((milestone, milestoneIndex) => (
                          <div key={milestone.id} className="border rounded-md p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <Checkbox 
                                  id={`milestone-${milestone.id}`}
                                  checked={milestone.completed}
                                  onCheckedChange={() => toggleMilestoneCompletion(periodIndex, milestoneIndex)}
                                  className="mt-1"
                                />
                                <div className="space-y-1">
                                  <label 
                                    htmlFor={`milestone-${milestone.id}`} 
                                    className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}
                                  >
                                    {milestone.text}
                                  </label>
                                  
                                  <div className="mt-2">
                                    <Label htmlFor={`notes-${milestone.id}`} className="text-sm text-muted-foreground">
                                      Notes
                                    </Label>
                                    <Textarea 
                                      id={`notes-${milestone.id}`}
                                      placeholder="Add notes here..."
                                      value={milestone.notes}
                                      onChange={(e) => updateMilestoneNotes(periodIndex, milestoneIndex, e.target.value)}
                                      className="mt-1 text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                              <Badge variant={milestone.completed ? "default" : "outline"}>
                                {milestone.completed ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meetings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule a Meeting</CardTitle>
                  <CardDescription>Book time with your HR manager or team members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meeting-time">Time</Label>
                    <Input
                      id="meeting-time"
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meeting-purpose">Purpose</Label>
                    <Textarea
                      id="meeting-purpose"
                      placeholder="What would you like to discuss in this meeting?"
                      value={meetingPurpose}
                      onChange={(e) => setMeetingPurpose(e.target.value)}
                    />
                  </div>
                  
                  <Button className="w-full" onClick={scheduleMeeting}>
                    Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Your scheduled onboarding sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderUpcomingMeetings()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EmployeePortal;
