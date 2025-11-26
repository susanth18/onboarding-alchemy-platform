
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line, CartesianGrid } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const onboardingData = [
  { month: 'Jan', completed: 5, active: 12, new: 8 },
  { month: 'Feb', completed: 8, active: 10, new: 6 },
  { month: 'Mar', completed: 6, active: 14, new: 9 },
  { month: 'Apr', completed: 12, active: 8, new: 5 },
  { month: 'May', completed: 10, active: 7, new: 4 },
  { month: 'Jun', completed: 7, active: 9, new: 6 },
];

/*
const statusData = [
  { name: 'Pending', value: 14, color: '#f59e0b' },
  { name: 'Active', value: 28, color: '#10b981' },
  { name: 'Completed', value: 18, color: '#3b82f6' },
];

const departmentData = [
  { name: 'Engineering', employees: 22 },
  { name: 'Marketing', employees: 18 },
  { name: 'HR', employees: 8 },
  { name: 'Sales', employees: 15 },
  { name: 'Finance', employees: 10 },
  { name: 'Operations', employees: 12 },
];
*/

const progressData = [
  { day: 1, completion: 10 },
  { day: 15, completion: 25 },
  { day: 30, completion: 40 },
  { day: 45, completion: 55 },
  { day: 60, completion: 70 },
  { day: 75, completion: 85 },
  { day: 90, completion: 98 },
];

const Analytics = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<{name: string, value: number, color: string}[]>([
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Active', value: 0, color: '#10b981' },
    { name: 'Completed', value: 0, color: '#3b82f6' },
  ]);
  const [roleData, setRoleData] = useState<{name: string, employees: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('hr_id', user.id);
        
      if (data) {
        setEmployees(data);
        
        // Process status data
        const pending = data.filter(e => e.status === 'pending').length;
        const active = data.filter(e => e.status === 'active').length;
        const completed = data.filter(e => e.status === 'completed').length;
        
        setStatusData([
          { name: 'Pending', value: pending, color: '#f59e0b' },
          { name: 'Active', value: active, color: '#10b981' },
          { name: 'Completed', value: completed, color: '#3b82f6' },
        ]);

        // Process role data
        const roles: Record<string, number> = {};
        data.forEach(e => {
            roles[e.role] = (roles[e.role] || 0) + 1;
        });
        
        setRoleData(Object.keys(roles).map(role => ({
            name: role,
            employees: roles[role]
        })));
      }
    };
    
    fetchData();
  }, [user]);

  const totalEmployees = employees.length;
  const activeOnboarding = employees.filter(e => e.status !== 'completed').length;

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />
      
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Analytics
          </CardTitle>
          <CardDescription>
            Track onboarding metrics and employee performance
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalEmployees}</div>
                    <p className="text-sm text-muted-foreground">Registered in system</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Onboarding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{activeOnboarding}</div>
                    <p className="text-sm text-muted-foreground">Pending or Active</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Avg. Completion Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">82 days</div>
                    <p className="text-sm text-muted-foreground">-3 days from last quarter</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Status</CardTitle>
                  <CardDescription>Monthly breakdown of employee onboarding status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={onboardingData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="new" name="New Hires" fill="#f59e0b" />
                        <Bar dataKey="active" name="Active Onboarding" fill="#10b981" />
                        <Bar dataKey="completed" name="Completed" fill="#3b82f6" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Status</CardTitle>
                    <CardDescription>Current status of all employees</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-[280px] w-full max-w-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Challenges</CardTitle>
                    <CardDescription>Reported onboarding challenges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Access to Systems</span>
                          <span className="text-sm">32%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: "32%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Role Clarity</span>
                          <span className="text-sm">24%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: "24%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Training Resources</span>
                          <span className="text-sm">18%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: "18%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Team Integration</span>
                          <span className="text-sm">15%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: "15%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Communication</span>
                          <span className="text-sm">11%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: "11%" }}></div>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="departments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employees by Role</CardTitle>
                  <CardDescription>Distribution of employees across roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={roleData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="employees" fill="#3b82f6" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Onboarding Speed by Department</CardTitle>
                    <CardDescription>Average days to complete onboarding</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Engineering</span>
                          <span className="text-sm">92 days</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: "92%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Marketing</span>
                          <span className="text-sm">78 days</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: "78%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">HR</span>
                          <span className="text-sm">65 days</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full" style={{ width: "65%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Sales</span>
                          <span className="text-sm">85 days</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full" style={{ width: "85%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Finance</span>
                          <span className="text-sm">88 days</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full" style={{ width: "88%" }}></div>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Department Growth</CardTitle>
                    <CardDescription>Year-over-year change</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Engineering</span>
                        <span className="text-green-600">+15%</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Marketing</span>
                        <span className="text-green-600">+8%</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">HR</span>
                        <span className="text-green-600">+3%</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Sales</span>
                        <span className="text-green-600">+12%</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Finance</span>
                        <span className="text-red-600">-2%</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="font-medium">Operations</span>
                        <span className="text-green-600">+5%</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Progress Curve</CardTitle>
                  <CardDescription>Average completion percentage over 90 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="completion" 
                          name="Completion %" 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }} 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Milestone Completion Rate</CardTitle>
                    <CardDescription>Percentage of employees completing key milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Company Orientation</span>
                          <span className="text-sm">98%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: "98%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Team Introduction</span>
                          <span className="text-sm">95%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: "95%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Training Completion</span>
                          <span className="text-sm">76%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full" style={{ width: "76%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">First Project</span>
                          <span className="text-sm">68%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full" style={{ width: "68%" }}></div>
                        </div>
                      </li>
                      <li className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Performance Review</span>
                          <span className="text-sm">52%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full" style={{ width: "52%" }}></div>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Time to Complete</CardTitle>
                    <CardDescription>Average days to complete onboarding phase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">First 30 Days</span>
                        <span>28 days</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">60 Days</span>
                        <span>35 days</span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="font-medium">90 Days</span>
                        <span>22 days</span>
                      </li>
                    </ul>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        Employees are completing the first 30 days slightly ahead of schedule, but the 60-day phase is taking longer than expected. Consider reviewing the milestones in the 60-day phase.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
