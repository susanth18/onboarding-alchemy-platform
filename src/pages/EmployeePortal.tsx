import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, CalendarCheck, Users, CheckSquare, ArrowLeft, Download, User, Calendar, LogOut, Loader2 } from "lucide-react";
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
import { api } from "@/lib/api";

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
    const loadEmployeeData = async () => {
      if (!user?.email) return;

      try {
        console.log("Loading employee data for", user.email);
        
        const employees = await api.getEmployees(undefined, user.email);
        const employeeData = employees.length > 0 ? employees[0] : null;

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
          try {
            const hrData = await api.getHrProfile(employeeData.hr_id);
            if (hrData) {
                setHrName(hrData.name);
            }
          } catch (e) {
              console.error("Error fetching HR profile", e);
          }
        }
        
        setDocuments({
          job_description_url: employeeData.job_description_url,
          contract_url: employeeData.contract_url,
          resume_url: employeeData.resume_url
        });

        // Directly get meetings with employee's UUID
        try {
            const meetingsData = await api.getMeetings({ employee_id: employeeData.id });
            if (meetingsData) {
                const formattedMeetings: Meeting[] = meetingsData.map((meeting: any) => ({
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
        } catch (e) {
            console.error("Error fetching meetings", e);
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
      const data = await api.createMeeting({
          hr_id: employeeData?.hr_id,
          employee_id: employeeData?.id,
          meeting_date: selectedDate.toISOString(),
          meeting_time: meetingTime,
          purpose: meetingPurpose
      });

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <p className="font-medium">{employeeData?.role || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge>{employeeData?.status || "Pending"}</Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <div className="flex items-center">
                    <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="h-2 flex-1 mr-4" />
                    <span className="text-sm font-medium">{completedTasks}/{totalTasks} Tasks</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 p-0 border-t">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="plan">Onboarding Plan</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="dashboard" className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <CheckSquare className="h-5 w-5 text-primary mr-2" />
                          Current Tasks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {milestonePlan[0].milestones.length > 0 ? (
                          <div className="space-y-3">
                            {milestonePlan[0].milestones.slice(0, 3).map((milestone, index) => (
                              <div key={milestone.id} className="flex items-start space-x-3">
                                <Checkbox 
                                  checked={milestone.completed} 
                                  onCheckedChange={() => toggleMilestoneCompletion(0, index)}
                                />
                                <label className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {milestone.text}
                                </label>
                              </div>
                            ))}
                            <Button variant="link" className="px-0" onClick={() => setActiveTabAndNavigate("plan")}>
                              View full plan
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No pending tasks</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Calendar className="h-5 w-5 text-primary mr-2" />
                          Upcoming Meetings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderUpcomingMeetings()}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="plan" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your 30-60-90 Day Plan</CardTitle>
                      <CardDescription>
                        Follow this roadmap for a successful onboarding journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {milestonePlan.map((period, periodIndex) => (
                          <div key={period.title} className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center">
                              <CalendarCheck className="h-5 w-5 text-primary mr-2" />
                              {period.title}
                            </h3>
                            <div className="space-y-4 pl-2 border-l-2 border-gray-100 ml-2">
                              {period.milestones.map((milestone, milestoneIndex) => (
                                <div key={milestone.id} className="pl-4 relative">
                                  <div className="border rounded-md p-4 bg-white">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start space-x-3">
                                        <Checkbox 
                                          id={`portal-milestone-${milestone.id}`}
                                          checked={milestone.completed}
                                          onCheckedChange={() => toggleMilestoneCompletion(periodIndex, milestoneIndex)}
                                          className="mt-1"
                                        />
                                        <div className="space-y-1">
                                          <label 
                                            htmlFor={`portal-milestone-${milestone.id}`} 
                                            className={`font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}
                                          >
                                            {milestone.text}
                                          </label>
                                          
                                          <div className="mt-2">
                                            <Label htmlFor={`portal-notes-${milestone.id}`} className="text-xs text-muted-foreground">
                                              My Notes
                                            </Label>
                                            <Textarea 
                                              id={`portal-notes-${milestone.id}`}
                                              placeholder="Add your notes here..."
                                              value={milestone.notes}
                                              onChange={(e) => updateMilestoneNotes(periodIndex, milestoneIndex, e.target.value)}
                                              className="mt-1 text-sm h-20"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <Badge variant={milestone.completed ? "default" : "outline"}>
                                        {milestone.completed ? "Completed" : "Pending"}
                                      </Badge>
                                    </div>
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
                
                <TabsContent value="documents" className="mt-0">
                  {renderDocumentsTabContent()}
                </TabsContent>
                
                <TabsContent value="schedule" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule a Meeting</CardTitle>
                      <CardDescription>Request a meeting with your HR manager</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Select Date</Label>
                            <div className="border rounded-md p-2 flex justify-center">
                              <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                initialFocus
                                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="portal-meeting-time">Time</Label>
                            <Input
                              id="portal-meeting-time"
                              type="time"
                              value={meetingTime}
                              onChange={(e) => setMeetingTime(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="portal-meeting-purpose">Purpose</Label>
                            <Textarea
                              id="portal-meeting-purpose"
                              placeholder="What would you like to discuss?"
                              value={meetingPurpose}
                              onChange={(e) => setMeetingPurpose(e.target.value)}
                              rows={4}
                            />
                          </div>
                          
                          <div className="pt-4">
                            <Button 
                              className="w-full" 
                              onClick={scheduleMeeting}
                              disabled={!selectedDate || !meetingPurpose.trim()}
                            >
                              <CalendarCheck className="h-4 w-4 mr-2" />
                              Schedule Meeting
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default EmployeePortal;
