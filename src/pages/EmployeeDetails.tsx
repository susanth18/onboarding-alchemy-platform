import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Upload, Loader2 } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import MeetingScheduler from "@/components/employees/MeetingScheduler";
import { api } from "@/lib/api";

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

  // New state for active tab
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

  const fetchEmployeeData = async (employeeId: string) => {
    setIsLoading(true);
    try {
      const data = await api.getEmployee(employeeId);
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

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await api.updateEmployee(id, { status: newStatus });

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
    if (!id) return;
    setIsUpdating(true);
    try {
      await api.updateEmployee(id, {
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

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {employee?.job_description_url ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Document is available. You can view or download it.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={employee.job_description_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" asChild>
                          <a href={employee.job_description_url} download>
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
                  {employee?.contract_url ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Document is available. You can view or download it.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={employee.contract_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" asChild>
                          <a href={employee.contract_url} download>
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
                  {employee?.resume_url ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Document is available. You can view or download it.
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={employee.resume_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" asChild>
                          <a href={employee.resume_url} download>
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
                hrId={employee?.hr_id as string} 
              />
            </div>
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
              ID: {employee?.employee_id || "N/A"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
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
