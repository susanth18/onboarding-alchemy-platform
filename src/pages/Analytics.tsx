import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line, CartesianGrid } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subMonths } from "date-fns";

// Keep progress data hardcoded for now as it requires complex storage scanning
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
  const [onboardingData, setOnboardingData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<{name: string, value: number, color: string}[]>([
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Active', value: 0, color: '#10b981' },
    { name: 'Completed', value: 0, color: '#3b82f6' },
  ]);
  const [roleData, setRoleData] = useState<{name: string, employees: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      
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

        // Process onboarding data (last 6 months)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = subMonths(new Date(), 5 - i);
            return {
                month: format(d, 'MMM'),
                monthIdx: d.getMonth(),
                year: d.getFullYear(),
                new: 0,
                active: 0,
                completed: 0
            };
        });

        data.forEach(e => {
            const d = new Date(e.created_at);
            const monthIdx = d.getMonth();
            const year = d.getFullYear();
            
            const monthData = last6Months.find(m => m.monthIdx === monthIdx && m.year === year);
            if (monthData) {
                monthData.new += 1;
                if (e.status === 'completed') {
                    monthData.completed += 1;
                } else {
                    monthData.active += 1;
                }
            }
        });

        setOnboardingData(last6Months);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [user]);

  const totalEmployees = employees.length;
  const activeOnboarding = employees.filter(e => e.status !== 'completed').length;

  if (loading) {
     return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      );
  }

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
                    <div className="text-3xl font-bold">-- days</div>
                    <p className="text-sm text-muted-foreground">Not enough data</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Status (Last 6 Months)</CardTitle>
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
                
                {/* Keep hardcoded for now or remove if strictly needed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Challenges</CardTitle>
                    <CardDescription>Reported onboarding challenges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-10">Data not available yet</p>
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
              
             
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Progress Curve</CardTitle>
                  <CardDescription>Target progress curve</CardDescription>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
