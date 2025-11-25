
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import { BarChart, Loader2 } from "lucide-react";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart as RechartsPieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeOnboarding: 0,
    completedOnboarding: 0,
    pendingEmployees: 0
  });
  const [onboardingData, setOnboardingData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all employees for this HR
      const response = await api.get('/employees');
      const employees = response.data || [];

      // Calculate stats
      const total = employees.length;
      const active = employees.filter((e: any) => e.status === 'active').length;
      const completed = employees.filter((e: any) => e.status === 'completed').length;
      const pending = employees.filter((e: any) => e.status === 'pending').length;

      setStats({
        totalEmployees: total,
        activeOnboarding: active,
        completedOnboarding: completed,
        pendingEmployees: pending
      });

      // Status Pie Chart Data
      setStatusData([
        { name: 'Pending', value: pending, color: '#f59e0b' },
        { name: 'Active', value: active, color: '#10b981' },
        { name: 'Completed', value: completed, color: '#3b82f6' },
      ]);

      // Department Bar Chart Data (Grouping by role)
      const roleCounts: {[key: string]: number} = {};
      employees.forEach((e: any) => {
        const role = e.role || 'Unknown';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });

      const deptData = Object.keys(roleCounts).map(role => ({
        name: role,
        employees: roleCounts[role]
      })).sort((a, b) => b.employees - a.employees).slice(0, 6);

      setDepartmentData(deptData);

      // Onboarding Trend Data (Last 6 months based on created_at)
      const last6Months: any[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthLabel = format(date, 'MMM');
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        // Count employees created in this month
        const count = employees.filter((e: any) => {
          const created = parseISO(e.createdAt);
          return created >= start && created <= end;
        }).length;

        last6Months.push({
          month: monthLabel,
          newHires: count
        });
      }
      setOnboardingData(last6Months);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <TabsTrigger value="roles">Roles Distribution</TabsTrigger>
              <TabsTrigger value="trends">Hiring Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalEmployees}</div>
                    <p className="text-sm text-muted-foreground">Total registered</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Onboarding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.activeOnboarding}</div>
                    <p className="text-sm text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.completedOnboarding}</div>
                    <p className="text-sm text-muted-foreground">Fully onboarded</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Status</CardTitle>
                  <CardDescription>Breakdown of employee status</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    {stats.totalEmployees > 0 ? (
                        <div className="h-[300px] w-full max-w-md">
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
                                <Legend />
                            </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="p-10 text-muted-foreground">No data available</div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Employees by Role</CardTitle>
                  <CardDescription>Distribution of employees across top roles</CardDescription>
                </CardHeader>
                <CardContent>
                  {departmentData.length > 0 ? (
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                            data={departmentData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                        >
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Bar dataKey="employees" fill="#3b82f6" />
                        </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-10 text-center text-muted-foreground">No role data available</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>New Hires Trend</CardTitle>
                  <CardDescription>Number of employees added over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={onboardingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="newHires" name="New Hires" fill="#3b82f6" />
                      </RechartsBarChart>
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
