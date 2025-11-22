
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, User, Mail, Phone, Briefcase, CheckCircle, XCircle, Loader2, Upload, Plus, CheckSquare, Trash2, Calendar } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import MeetingScheduler from "@/components/employees/MeetingScheduler";
import { format, parseISO } from "date-fns";

type HrTask = {
  id: number;
  title: string;
  category: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
};

const EmployeeDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("");

  // HR Tasks State
  const [tasks, setTasks] = useState<HrTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("HR");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!id) {
      toast({
        title: "Missing employee ID",
        description: "Please select an employee to view details",
        variant: "destructive",
      });
      navigate("/employees");
      return;
    }

    fetchEmployeeData(id);
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab === 'admin' && id) {
      fetchTasks(id);
    }
  }, [activeTab, id]);

  const fetchEmployeeData = async (employeeId: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/employees/${employeeId}`);
      const data = response.data;

      setEmployee(data);
      setStatus(data.status);
      setEmail(data.email);
      setPhone(data.phone || "");
      setRole(data.role);
    } catch (error: any) {
      toast({
        title: "Error fetching employee details",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (employeeId: string) => {
    setLoadingTasks(true);
    try {
      const response = await api.get(`/hr_tasks`, { params: { employeeId } });
      setTasks(response.data || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast({ title: "Error loading tasks", variant: "destructive" });
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await api.patch(`/employees/${id}`, { status: newStatus });
      setStatus(newStatus);
      setEmployee({ ...employee, status: newStatus });

      toast({
        title: "Status updated",
        description: "Employee status has been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmployee = async () => {
    setIsUpdating(true);
    try {
      await api.patch(`/employees/${id}`, {
        email: email,
        phone: phone,
        role: role,
      });

      setEmployee({ ...employee, email: email, phone: phone, role: role });

      toast({
        title: "Employee updated",
        description: "Employee details have been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Error updating employee",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTask = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

    // Optimistic Update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.patch(`/hr_tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      // Revert
      fetchTasks(id!);
      toast({ title: "Error updating task", variant: "destructive" });
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await api.post('/hr_tasks', {
        employee_id: id,
        title: newTaskTitle,
        category: newTaskCategory,
        priority: newTaskPriority,
        due_date: newTaskDueDate || null,
      });

      setTasks([...tasks, response.data]);
      setNewTaskTitle("");
      setNewTaskDueDate("");
      toast({ title: "Task added" });
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({ title: "Error adding task", description: error.message, variant: "destructive" });
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await api.delete(`/hr_tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast({ title: "Task deleted" });
    } catch (error) {
      toast({ title: "Error deleting task", variant: "destructive" });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <div className="flex items-center p-2 border rounded-md bg-gray-50 text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {employee?.startDate ? format(parseISO(employee.startDate), 'PPP') : 'Not set'}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex space-x-4">
                <Button
                  variant={status === "pending" ? "default" : "outline"}
                  onClick={() => handleStatusChange("pending")}
                  disabled={isUpdating}
                >
                  Pending
                </Button>
                <Button
                  variant={status === "active" ? "default" : "outline"}
                  onClick={() => handleStatusChange("active")}
                  disabled={isUpdating}
                >
                  Active
                </Button>
                <Button
                  variant={status === "completed" ? "default" : "outline"}
                  onClick={() => handleStatusChange("completed")}
                  disabled={isUpdating}
                >
                  Completed
                </Button>
              </div>
            </div>
            <Separator />
            <Button onClick={handleUpdateEmployee} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Employee"}
            </Button>
          </div>
        );
      case "documents":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee?.jobDescriptionUrl ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Document is available. You can view or download it.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={employee.jobDescriptionUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" asChild>
                          <a href={employee.jobDescriptionUrl} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No job description uploaded yet. Upload one from the Documents page.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contract</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee?.contractUrl ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Document is available. You can view or download it.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={employee.contractUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" asChild>
                          <a href={employee.contractUrl} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No contract uploaded yet. Upload one from the Documents page.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee?.resumeUrl ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Document is available. You can view or download it.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={employee.resumeUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" asChild>
                          <a href={employee.resumeUrl} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No resume uploaded yet. Upload one from the Documents page.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to="/documents">
                        <Upload className="h-4 w-4 mr-2" />
                        Go to Documents Page
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      case "meetings":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <MeetingScheduler 
                employeeId={id as string} 
                hrId={employee?.hrId as string}
              />
            </div>
          </div>
        );
      case "admin":
        return (
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>HR Admin Checklist</CardTitle>
                    <CardDescription>Internal tasks related to {employee?.name}'s onboarding</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingTasks ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 border rounded-md bg-white">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            checked={task.status === 'completed'}
                                            onCheckedChange={() => toggleTask(task.id, task.status)}
                                        />
                                        <div>
                                            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex space-x-2 text-xs text-muted-foreground">
                                                <span>{task.category}</span>
                                                {task.due_date && <span>• Due {format(parseISO(task.due_date), 'MMM d, yyyy')}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            {tasks.length === 0 && <p className="text-muted-foreground text-center py-4">No tasks found.</p>}
                        </div>
                    )}

                    <Separator className="my-6" />

                    <div className="space-y-4">
                        <h4 className="font-medium">Add Custom Task</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="task-title">Task Title</Label>
                                <Input
                                    id="task-title"
                                    placeholder="e.g. Schedule welcome lunch"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="task-category">Category</Label>
                                <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HR">HR</SelectItem>
                                        <SelectItem value="IT">IT</SelectItem>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                        <SelectItem value="Logistics">Logistics</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="task-priority">Priority</Label>
                                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Button onClick={addTask} disabled={!newTaskTitle.trim()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <BackButton to="/employees" label="Back to Employees" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              {employee?.name || "Employee Details"}
            </CardTitle>
            <p className="text-muted-foreground">
              ID: {employee?.employeeId || "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="admin">HR Admin</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {renderTabContent()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDetails;
