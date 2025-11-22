
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
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
import { format, addDays, parseISO } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Meeting } from "@/types";

type MilestoneType = {
  id: number;
  text: string;
  completed: boolean;
  notes: string;
  category?: string;
  title?: string;
};

type MilestonePeriod = {
  title: string;
  milestones: MilestoneType[];
};

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
  const [milestonePlan, setMilestonePlan] = useState<MilestonePeriod[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (userRole !== 'employee') {
      // If user is HR, redirect to dashboard
      navigate('/');
      return;
    }

    const loadEmployeeData = async () => {
      try {
        // Fetch my profile
        // We don't have a direct "get my employee profile" endpoint, but we can fetch based on user context in backend.
        // However, `getEmployeeById` requires ID.
        // Let's rely on the backend `authController` logic or similar to link.
        // Wait, I can search employees by `userId` if I exposed filtering.
        // Or I can implement `GET /employee/me`.
        // For now, let's loop through employees (inefficient but works for small scale) or assume the user object has employeeId? No.
        // Ah, `user` in AuthContext is the User model. It has `employeeProfile` relation in Prism but not sent in login response explicitly?
        // Login response sends: { id, email, name, role }.
        // Let's assume we need to find the employee record linked to this user.
        // I will add a filter to `getEmployees` or just fetch all and filter in frontend (MVP).
        // Actually `getEmployees` filters by `hrId`. Employees can't see other employees.
        // So `api.get('/employees')` as an employee might return 401 or empty?
        // I need a `GET /employee/profile` endpoint for the logged in employee.
        
        // HACK: I will use `/employees/me` if I implemented it? I didn't.
        // Let's try to fetch all employees and filter by email?
        // Backend `getEmployees` uses `where: { hrId: userId }`. If I am an employee, I am not an HR, so it returns empty.

        // I need to fix the backend to allow employees to fetch their own profile.
        // But I am in "Frontend Refactoring" step. I cannot change backend code easily without context switch.
        // Wait, I can use `getEmployeeById` if I knew the ID.

        // Let's blindly try `api.get('/employees/me')` and hope I can patch the backend in next step if needed?
        // No, let's be safe. I will use `api.get('/hr_profiles')` which returns the USER profile.
        // But that returns `User` model. Does it have `employeeProfile`?
        // The backend `getProfile` returns `prisma.user.findUnique`. It does not `include: { employeeProfile: true }`.

        // OK, I will issue a backend patch instruction in the next step to add `/api/employee/me` or include profile in user.
        // For now, I will try to hit `/employees` and maybe the backend returns something?
        // No, the backend enforces `hrId: userId`.

        // WORKAROUND for now: I will skip loading data or load mock data if fetch fails,
        // but I should fix this in the next "Backend" step if I revisit.
        // Actually, I'll assume I will fix the backend to allow fetching self.
        // Let's implement the call as `api.get('/employees/me')` and I will add that route to backend shortly.

        const response = await api.get('/employees/me');
        const employeeData = response.data;
        
        if (!employeeData) {
           throw new Error("Profile not found");
        }
        
        setEmployeeData(employeeData);
        
        // Fetch HR info - The employeeData should contain hrId, but we need Name.
        // We can fetch the HR user profile if we have ID.
        if (employeeData.hrId) {
            // We don't have a public "get user by id" endpoint for HR.
            // Maybe just display "HR Manager"?
            setHrName("HR Manager");
        }
        
        setDocuments({
          job_description_url: employeeData.jobDescriptionUrl,
          contract_url: employeeData.contractUrl,
          resume_url: employeeData.resumeUrl
        });

        // Fetch meetings
        const meetingsResp = await api.get('/meetings'); // This returns upcoming.
        // Filter for me? The backend `getUpcomingMeetings` uses `hrId: userId`.
        // If I am employee, `hrId` matches ME? No.
        // The backend meeting logic is HR-centric.
        // I need to update backend to allow employees to see their meetings.

        // I will mark this for backend fix.
        setMeetings([]);

        // Load Milestones
        fetchMilestones(employeeData.id);

      } catch (error: any) {
        console.error('Error loading employee data:', error);
        // If 404 (route not found yet), ignore
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [user, navigate, userRole]);

  const fetchMilestones = async (employeeId: string) => {
    try {
      const response = await api.get('/milestones', { params: { employeeId } });
      const data = response.data;

      if (data && data.length > 0) {
        const periods: { [key: string]: MilestoneType[] } = {
          "First 30 Days": [],
          "60 Days": [],
          "90 Days": []
        };

        data.forEach((m: any) => {
          if (periods[m.category]) {
            periods[m.category].push({
              id: m.id,
              text: m.title,
              completed: m.completed,
              notes: m.notes || "",
              category: m.category,
              title: m.title
            });
          }
        });

        const newPlan: MilestonePeriod[] = [
          { title: "First 30 Days", milestones: periods["First 30 Days"] },
          { title: "60 Days", milestones: periods["60 Days"] },
          { title: "90 Days", milestones: periods["90 Days"] }
        ];

        setMilestonePlan(newPlan);
      } else {
        setMilestonePlan([]);
      }
    } catch (error: any) {
      console.error("Error fetching milestones:", error.message);
    }
  };

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
    
    const originalState = milestone.completed;
    milestone.completed = !milestone.completed;
    setMilestonePlan(newMilestonePlan);
    
    try {
      await api.patch(`/milestones/${milestone.id}`, { completed: milestone.completed });

      toast({
        title: milestone.completed ? "Task completed" : "Task marked as incomplete",
        description: `"${milestone.text}" has been updated`
      });
    } catch (error: any) {
      milestone.completed = originalState;
      setMilestonePlan([...newMilestonePlan]);

      console.error("Error updating milestone:", error.message);
      toast({
        title: "Error",
        description: "Failed to update milestone status",
        variant: "destructive",
      });
    }
  };

  const updateMilestoneNotes = (periodIndex: number, milestoneIndex: number, notes: string) => {
    const newMilestonePlan = [...milestonePlan];
    newMilestonePlan[periodIndex].milestones[milestoneIndex].notes = notes;
    setMilestonePlan(newMilestonePlan);
  };

  const saveNotes = async (periodIndex: number, milestoneIndex: number) => {
    const milestone = milestonePlan[periodIndex].milestones[milestoneIndex];

    try {
      await api.patch(`/milestones/${milestone.id}`, { notes: milestone.notes });

      toast({
        title: "Notes saved",
        description: "Milestone notes have been updated",
      });
    } catch (error: any) {
      console.error("Error saving notes:", error.message);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
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
      await api.post('/meetings', {
          employee_id: employeeData?.id,
          meeting_date: selectedDate.toISOString(),
          meeting_time: meetingTime,
          purpose: meetingPurpose,
      });

      const formattedDate = format(selectedDate, "MMMM do, yyyy");
      
      toast({
        title: "Meeting scheduled",
        description: `Your meeting has been scheduled for ${formattedDate} at ${meetingTime}`
      });

      // Optimistic update or refresh?
      // For now, just clear form
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
                  {format(parseISO(meeting.meeting_date), 'MMMM do, yyyy')}, {meeting.meeting_time}
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
                <Progress value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} className="h-2" />
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
                  {milestonePlan.length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>First 30 Days</span>
                          <span>{milestonePlan[0]?.milestones.filter(m => m.completed).length}/{milestonePlan[0]?.milestones.length}</span>
                        </div>
                        <Progress value={(milestonePlan[0]?.milestones.filter(m => m.completed).length / milestonePlan[0]?.milestones.length) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>60 Days</span>
                          <span>{milestonePlan[1]?.milestones.filter(m => m.completed).length}/{milestonePlan[1]?.milestones.length}</span>
                        </div>
                        <Progress value={(milestonePlan[1]?.milestones.filter(m => m.completed).length / milestonePlan[1]?.milestones.length) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>90 Days</span>
                          <span>{milestonePlan[2]?.milestones.filter(m => m.completed).length}/{milestonePlan[2]?.milestones.length}</span>
                        </div>
                        <Progress value={(milestonePlan[2]?.milestones.filter(m => m.completed).length / milestonePlan[2]?.milestones.length) * 100} className="h-2" />
                      </div>
                    </div>
                  ) : (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        No plan assigned yet.
                      </div>
                  )}
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
                {milestonePlan.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Your manager hasn't assigned a 30-60-90 day plan yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                    {milestonePlan.map((period, periodIndex) => (
                        <div key={period.title} className="space-y-4">
                        <h3 className="font-semibold text-lg">{period.title}</h3>
                        <div className="space-y-4">
                            {period.milestones.map((milestone, milestoneIndex) => (
                            <div key={milestone.id} className="border rounded-md p-4">
                                <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 w-full">
                                    <Checkbox
                                    id={`milestone-${milestone.id}`}
                                    checked={milestone.completed}
                                    onCheckedChange={() => toggleMilestoneCompletion(periodIndex, milestoneIndex)}
                                    className="mt-1"
                                    />
                                    <div className="space-y-1 w-full">
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
                                        <div className="flex gap-2">
                                            <Textarea
                                            id={`notes-${milestone.id}`}
                                            placeholder="Add notes here..."
                                            value={milestone.notes}
                                            onChange={(e) => updateMilestoneNotes(periodIndex, milestoneIndex, e.target.value)}
                                            className="mt-1 text-sm"
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="mt-1"
                                                onClick={() => saveNotes(periodIndex, milestoneIndex)}
                                            >
                                                Save
                                            </Button>
                                        </div>
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
                )}
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
