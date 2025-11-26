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
import { CheckCircle, Clock, CalendarCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BackButton from "@/components/common/BackButton";
import { Milestone, MilestonePeriod } from "@/types";
import { getMilestonePlan, saveMilestonePlan, defaultMilestonePlan } from "@/lib/milestones";
import { api } from "@/lib/api";

const Plans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [milestonePlan, setMilestonePlan] = useState<MilestonePeriod[]>(defaultMilestonePlan);

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  useEffect(() => {
    const loadPlan = async () => {
      if (selectedEmployee) {
        const plan = await getMilestonePlan(selectedEmployee);
        if (plan) {
          setMilestonePlan(plan);
        } else {
          setMilestonePlan(defaultMilestonePlan);
        }
      }
    };
    loadPlan();
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees(user?.id);
      setEmployees(data || []);
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

  const toggleMilestoneCompletion = (periodIndex: number, milestoneIndex: number) => {
    const newMilestonePlan = [...milestonePlan];
    const milestone = newMilestonePlan[periodIndex].milestones[milestoneIndex];
    milestone.completed = !milestone.completed;
    
    setMilestonePlan(newMilestonePlan);
    
    toast({
      title: milestone.completed ? "Task completed" : "Task marked as incomplete",
      description: `"${milestone.text}" has been updated`,
    });
  };

  const updateMilestoneNotes = (periodIndex: number, milestoneIndex: number, notes: string) => {
    const newMilestonePlan = [...milestonePlan];
    newMilestonePlan[periodIndex].milestones[milestoneIndex].notes = notes;
    setMilestonePlan(newMilestonePlan);
  };

  const calculateProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  const handleSavePlan = async () => {
    if (!selectedEmployee) return;
    
    const success = await saveMilestonePlan(selectedEmployee, milestonePlan);
    if (success) {
      toast({
        title: "Plan Saved",
        description: "The onboarding plan has been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save the onboarding plan.",
        variant: "destructive",
      });
    }
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
                  <Card>
                    <CardHeader className="pb-3">
                      <Badge className="w-fit mb-2">Default</Badge>
                      <CardTitle className="text-lg">Standard Onboarding</CardTitle>
                      <CardDescription>
                        General onboarding plan for most roles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Complexity</span>
                          <span>Medium</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Milestones</span>
                          <span>14</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time to complete</span>
                          <span>90 days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <Badge className="w-fit mb-2 bg-blue-100 text-blue-800">Technical</Badge>
                      <CardTitle className="text-lg">Developer Onboarding</CardTitle>
                      <CardDescription>
                        For software engineers and technical roles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Complexity</span>
                          <span>High</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Milestones</span>
                          <span>18</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time to complete</span>
                          <span>90 days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <Badge className="w-fit mb-2 bg-green-100 text-green-800">Leadership</Badge>
                      <CardTitle className="text-lg">Manager Onboarding</CardTitle>
                      <CardDescription>
                        For team leads and management positions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Complexity</span>
                          <span>High</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Milestones</span>
                          <span>16</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Time to complete</span>
                          <span>90 days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                <div className="space-y-8">
                  <h3 className="text-xl font-semibold">Preview Standard Plan</h3>
                  
                  {milestonePlan.map((period, periodIndex) => (
                    <div key={period.title} className="space-y-4">
                      <div className="flex items-center">
                        <h4 className="font-semibold text-lg">{period.title}</h4>
                        <Progress 
                          value={calculateProgress(period.milestones)} 
                          className="h-2 ml-4 w-24"
                        />
                        <span className="ml-2 text-sm text-muted-foreground">
                          {calculateProgress(period.milestones)}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {period.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center space-x-2 border rounded-md p-2">
                            <CheckCircle className={`h-5 w-5 ${milestone.completed ? 'text-primary' : 'text-gray-300'}`} />
                            <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
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
                              <span>Apr 10, 2025</span>
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
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">
                          {employees.find(e => e.id === selectedEmployee)?.name}'s 30-60-90 Day Plan
                        </h3>
                        <Button onClick={handleSavePlan}>Save Plan</Button>
                      </div>
                      
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
