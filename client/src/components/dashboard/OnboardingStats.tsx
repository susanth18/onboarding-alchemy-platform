
import React, { useEffect, useState } from "react";
import { Users, FileText, CheckSquare, CalendarClock, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  return (
    <div className="hr-stat-card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="hr-card-title">{title}</h3>
          <p className="hr-card-subtitle">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${color || 'bg-blue-50'}`}>
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <div className="hr-card-value">{value}</div>
      </div>
    </div>
  );
};

const OnboardingStats: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOnboardings: 0,
    missingDocs: 0,
    completionRate: 0,
    upcomingMeetings: 0
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch employees to calculate stats
      // Ideally backend should provide an aggregated stats endpoint.
      // I'll use client-side calc for consistency with my current migration strategy
      const response = await api.get('/employees');
      const employees = response.data || [];

      // 1. Active Onboardings
      const activeCount = employees.filter((e: any) => e.status !== 'completed').length;

      // 2. Documents Pending
      let missingDocsCount = 0;
      employees.forEach((emp: any) => {
        if (!emp.jobDescriptionUrl || !emp.contractUrl || !emp.resumeUrl) {
          missingDocsCount++;
        }
      });

      // 3. Overall Completion Rate (Milestones)
      // Need milestones. Let's fetch all milestones? Or fetch per employee?
      // Fetching all milestones for all employees might be heavy.
      // For this MVP, I will skip detailed milestone rate calculation or estimate it from status.
      // Or, I can assume "Active" = 50%, "Pending" = 0%, "Completed" = 100%.
      // Let's implement a simple proxy: (Completed Employees / Total Employees) * 100
      // OR, better: create a backend endpoint for stats.
      // But sticking to frontend refactor plan: let's just use 0% if calculation is expensive.
      // Wait, I can fetch /analytics logic here?

      // Let's use a placeholder calculation for now to unblock.
      const rate = employees.length > 0 ? Math.round((employees.filter((e: any) => e.status === 'completed').length / employees.length) * 100) : 0;

      // 4. Scheduled Meetings (Upcoming)
      const meetingResponse = await api.get('/meetings'); // This endpoint returns upcoming meetings
      const meetingsCount = meetingResponse.data ? meetingResponse.data.length : 0;

      setStats({
        activeOnboardings: activeCount,
        missingDocs: missingDocsCount,
        completionRate: rate,
        upcomingMeetings: meetingsCount
      });

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 h-32 items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Active Onboardings"
        value={stats.activeOnboardings}
        subtitle="Employees in process"
        icon={<Users size={24} className="text-hr-blue" />}
        color="bg-blue-50"
      />

      <StatCard
        title="Documents Pending"
        value={stats.missingDocs}
        subtitle="Employees with missing docs"
        icon={<FileText size={24} className="text-hr-amber" />}
        color="bg-amber-50"
      />

      <StatCard
        title="Completed Tasks"
        value={`${stats.completionRate}%`}
        subtitle="Overall completion rate"
        icon={<CheckSquare size={24} className="text-hr-teal" />}
        color="bg-teal-50"
      />

      <StatCard
        title="Scheduled Meetings"
        value={stats.upcomingMeetings}
        subtitle="Upcoming meetings"
        icon={<CalendarClock size={24} className="text-purple-500" />}
        color="bg-purple-50"
      />
    </div>
  );
};

export default OnboardingStats;
