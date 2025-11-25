
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, CalendarCheck, Loader2, Check } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import BackButton from "@/components/common/BackButton";

type MilestoneType = {
  id: number;
  text: string;
  completed: boolean;
  notes: string;
  employee_id?: string;
  title?: string;
  category?: string;
};

type MilestonePeriod = {
  title: string;
  milestones: MilestoneType[];
};

type PlanTemplate = {
    id: string;
    name: string;
    role: string;
    description: string;
    milestones: MilestonePeriod[];
    complexity: "Low" | "Medium" | "High";
    duration: string;
    badgeColor: string;
};

const STANDARD_MILESTONES: MilestonePeriod[] = [
  {
    title: "First 30 Days",
    milestones: [
      { id: 1, text: "Complete company orientation", completed: false, notes: "" },
      { id: 2, text: "Meet with team members", completed: false, notes: "" },
      { id: 3, text: "Set up workstation and tools", completed: false, notes: "" },
      { id: 4, text: "Review job description and responsibilities", completed: false, notes: "" },
    ]
  },
  {
    title: "60 Days",
    milestones: [
      { id: 5, text: "Complete first project", completed: false, notes: "" },
      { id: 6, text: "Participate in team meeting", completed: false, notes: "" },
      { id: 7, text: "Complete required training modules", completed: false, notes: "" },
    ]
  },
  {
    title: "90 Days",
    milestones: [
      { id: 8, text: "First performance review", completed: false, notes: "" },
      { id: 9, text: "Set long-term goals", completed: false, notes: "" },
      { id: 10, text: "Present onboarding feedback", completed: false, notes: "" },
    ]
  }
];

const DEVELOPER_MILESTONES: MilestonePeriod[] = [
    {
      title: "First 30 Days",
      milestones: [
        { id: 1, text: "Setup local development environment", completed: false, notes: "" },
        { id: 2, text: "Complete Git and codebase walkthrough", completed: false, notes: "" },
        { id: 3, text: "Fix first bug / small issue", completed: false, notes: "" },
        { id: 4, text: "Review coding standards and guidelines", completed: false, notes: "" },
      ]
    },
    {
      title: "60 Days",
      milestones: [
        { id: 5, text: "Complete first feature implementation", completed: false, notes: "" },
        { id: 6, text: "Participate in code reviews", completed: false, notes: "" },
        { id: 7, text: "Deep dive into architecture documentation", completed: false, notes: "" },
      ]
    },
    {
      title: "90 Days",
      milestones: [
        { id: 8, text: "Lead a small technical project", completed: false, notes: "" },
        { id: 9, text: "Propose technical improvements", completed: false, notes: "" },
        { id: 10, text: "Complete probation review", completed: false, notes: "" },
      ]
    }
];

const MANAGER_MILESTONES: MilestonePeriod[] = [
    {
      title: "First 30 Days",
      milestones: [
        { id: 1, text: "1-on-1s with all direct reports", completed: false, notes: "" },
        { id: 2, text: "Review team goals and KPIs", completed: false, notes: "" },
        { id: 3, text: "Understand budget and resource allocation", completed: false, notes: "" },
        { id: 4, text: "Meet with key stakeholders", completed: false, notes: "" },
      ]
    },
    {
      title: "60 Days",
      milestones: [
        { id: 5, text: "Assess team performance and gaps", completed: false, notes: "" },
        { id: 6, text: "Lead first strategic planning session", completed: false, notes: "" },
        { id: 7, text: "Draft Q3/Q4 roadmap", completed: false, notes: "" },
      ]
    },
    {
      title: "90 Days",
      milestones: [
        { id: 8, text: "Present team strategy to leadership", completed: false, notes: "" },
        { id: 9, text: "Complete first round of performance reviews", completed: false, notes: "" },
        { id: 10, text: "Finalize long-term hiring plan", completed: false, notes: "" },
      ]
    }
];

const TEMPLATES: PlanTemplate[] = [
    {
        id: "standard",
        name: "Standard Onboarding",
        role: "Default",
        description: "General onboarding plan for most roles",
        milestones: STANDARD_MILESTONES,
        complexity: "Medium",
        duration: "90 days",
        badgeColor: ""
    },
    {
        id: "developer",
        name: "Developer Onboarding",
        role: "Technical",
        description: "For software engineers and technical roles",
        milestones: DEVELOPER_MILESTONES,
        complexity: "High",
        duration: "90 days",
        badgeColor: "bg-blue-100 text-blue-800"
    },
    {
        id: "manager",
        name: "Manager Onboarding",
        role: "Leadership",
        description: "For team leads and management positions",
        milestones: MANAGER_MILESTONES,
        complexity: "High",
        duration: "90 days",
        badgeColor: "bg-green-100 text-green-800"
    }
];

const Plans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  const [loading, setLoading] = useState(true);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [milestonePlan, setMilestonePlan] = useState<MilestonePeriod[]>(STANDARD_MILESTONES);
  const [hasPlan, setHasPlan] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("standard");

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchMilestones(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      setEmployees(response.data || []);
    } catch (error: any) {
      console.error("Error fetching employees:", error.message);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async (employeeId: string) => {
    try {
      setLoadingMilestones(true);
      const response = await api.get('/milestones', { params: { employeeId } });
      const data = response.data;

      if (data && data.length > 0) {
        // Map DB milestones to UI structure
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
              employee_id: m.employeeId,
              title: m.title,
              category: m.category
            });
          }
        });

        const newPlan: MilestonePeriod[] = [
          { title: "First 30 Days", milestones: periods["First 30 Days"] },
          { title: "60 Days", milestones: periods["60 Days"] },
          { title: "90 Days", milestones: periods["90 Days"] }
        ];

        setMilestonePlan(newPlan);
        setHasPlan(true);
      } else {
        setMilestonePlan(STANDARD_MILESTONES);
        setHasPlan(false);
      }
    } catch (error: any) {
      console.error("Error fetching milestones:", error.message);
      toast({
        title: "Error",
        description: "Failed to load employee plan",
        variant: "destructive",
      });
    } finally {
      setLoadingMilestones(false);
    }
  };

  const assignPlan = async () => {
    if (!selectedEmployee) return;

    try {
      setLoadingMilestones(true);

      const template = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];

      // Prepare milestones for insertion
      const milestonesToInsert: any[] = [];

      template.milestones.forEach(period => {
        period.milestones.forEach(m => {
          milestonesToInsert.push({
            employee_id: selectedEmployee,
            title: m.text,
            category: period.title,
            completed: false,
            notes: ""
          });
        });
      });

      await api.post('/milestones', { milestones: milestonesToInsert });

      toast({
        title: "Plan Assigned",
        description: `${template.name} has been assigned to the employee.`,
      });

      fetchMilestones(selectedEmployee);

    } catch (error: any) {
      console.error("Error assigning plan:", error.message);
      toast({
        title: "Error",
        description: "Failed to assign plan",
        variant: "destructive",
      });
      setLoadingMilestones(false);
    }
  };

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
        description: `"${milestone.text}" has been updated`,
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

  const updateMilestoneNotes = async (periodIndex: number, milestoneIndex: number, notes: string) => {
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

  const calculateProgress = (milestones: MilestoneType[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />

      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <CalendarCheck className="h-5 w-5 mr-2" />
            30-60-90 Day Plans
          </CardTitle>
          <CardDescription>
            Create and manage onboarding plans for your employees
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="employee-plans">Employee Plans</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TEMPLATES.map(template => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                        {template.badgeColor ? (
                            <Badge className={`w-fit mb-2 ${template.badgeColor}`}>{template.role}</Badge>
                        ) : (
                            <Badge className="w-fit mb-2">Default</Badge>
                        )}
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                            {template.description}
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                            <span>Complexity</span>
                            <span>{template.complexity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                            <span>Milestones</span>
                            <span>{template.milestones.reduce((acc, curr) => acc + curr.milestones.length, 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                            <span>Time to complete</span>
                            <span>{template.duration}</span>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div className="space-y-8">
                  <h3 className="text-xl font-semibold">Preview: {TEMPLATES.find(t => t.id === selectedTemplate)?.name || "Standard Onboarding"}</h3>

                  {/* Template Selection for Preview */}
                  <div className="flex space-x-2 mb-4">
                    {TEMPLATES.map(template => (
                        <Button
                            key={template.id}
                            variant={selectedTemplate === template.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                setSelectedTemplate(template.id);
                            }}
                        >
                            {template.name}
                        </Button>
                    ))}
                  </div>

                  {(TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0]).milestones.map((period) => (
                    <div key={period.title} className="space-y-4">
                      <div className="flex items-center">
                        <h4 className="font-semibold text-lg">{period.title}</h4>
                        <span className="ml-4 text-sm text-muted-foreground">
                          {period.milestones.length} tasks
                        </span>
                      </div>

                      <div className="space-y-2">
                        {period.milestones.map((milestone, idx) => (
                          <div key={idx} className="flex items-center space-x-2 border rounded-md p-2">
                            <CheckCircle className="h-5 w-5 text-gray-300" />
                            <span>
                              {milestone.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employee-plans" className="space-y-6">
              {loading ? (
                <div className="flex justify-center p-6">
                  <Clock className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center p-6">
                  <h3 className="font-medium text-lg">No employees found</h3>
                  <p className="text-muted-foreground mt-1">
                    Add employees first to create onboarding plans
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {employees.map((employee) => (
                      <Card
                        key={employee.id}
                        className={`cursor-pointer transition-all ${selectedEmployee === employee.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedEmployee(employee.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{employee.name}</CardTitle>
                          <CardDescription>
                            {employee.role}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Start Date</span>
                              <span>{employee.startDate ? new Date(employee.startDate).toLocaleDateString() : "Not set"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Status</span>
                              <Badge variant="outline" className={
                                employee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                employee.status === 'active' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {employee.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedEmployee && (
                    <div className="mt-8 space-y-6">
                      {loadingMilestones ? (
                        <div className="flex justify-center py-8">
                           <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">
                              {employees.find(e => e.id === selectedEmployee)?.name}'s 30-60-90 Day Plan
                            </h3>
                          </div>

                          {!hasPlan ? (
                            <div className="p-6 border rounded-lg bg-gray-50">
                                <h4 className="text-lg font-medium mb-4">Assign a Plan</h4>
                                <p className="text-muted-foreground mb-6">Select a template to assign to {employees.find(e => e.id === selectedEmployee)?.name}.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {TEMPLATES.map(template => (
                                        <Card
                                            key={template.id}
                                            className={`cursor-pointer ${selectedTemplate === template.id ? 'ring-2 ring-primary border-primary' : ''}`}
                                            onClick={() => setSelectedTemplate(template.id)}
                                        >
                                            <CardHeader className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                                    {selectedTemplate === template.id && <Check className="h-4 w-4 text-primary" />}
                                                </div>
                                                <CardDescription className="text-xs mt-1">
                                                    {template.description}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>

                                <Button onClick={assignPlan}>Assign Selected Plan</Button>
                            </div>
                          ) : (
                            <div className="space-y-8">
                                {milestonePlan.map((period, periodIndex) => (
                                <div key={period.title} className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg">{period.title}</h3>
                                        <span className="text-sm text-muted-foreground">
                                            {period.milestones.filter(m => m.completed).length}/{period.milestones.length} completed
                                        </span>
                                    </div>
                                    <Progress value={calculateProgress(period.milestones)} className="h-2" />

                                    <div className="space-y-4 mt-4">
                                    {period.milestones.map((milestone, milestoneIndex) => (
                                        <div key={milestone.id} className="border rounded-md p-4 bg-white">
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
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Plans;
