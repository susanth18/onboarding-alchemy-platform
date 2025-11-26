import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, FileText, CheckSquare, CalendarClock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { getTasks } from "@/lib/tasks";
import { api } from "@/lib/api";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, change, icon, color }) => {
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
        {change && (
          <div className="flex items-center mt-2 text-sm">
            {change.isPositive ? (
              <>
                <TrendingUp className="text-green-500 mr-1" size={16} />
                <span className="text-green-500">{change.value}% increase</span>
              </>
            ) : (
              <>
                <TrendingDown className="text-red-500 mr-1" size={16} />
                <span className="text-red-500">{change.value}% decrease</span>
              </>
            )}
            <span className="text-gray-400 ml-1">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

const OnboardingStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeOnboardings: 0,
    documentsPending: 0,
    scheduledMeetings: 0,
    taskCompletionRate: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Fetch active employees
        const employees = await api.getEmployees(user.id);
          
        const active = employees?.filter((e: any) => e.status !== 'completed').length || 0;
        
        // Calculate pending documents (for active employees)
        const pendingDocs = employees?.filter((e: any) => 
            e.status !== 'completed' && 
            (!e.job_description_url || !e.contract_url || !e.resume_url)
        ).length || 0;

        // Fetch meetings
        const meetings = await api.getMeetings({ hr_id: user.id, status: 'scheduled' });
        
        // Fetch tasks for completion rate
        const tasks = await getTasks(user.id);
        const completedTasks = tasks.filter(t => t.completed).length;
        const totalTasks = tasks.length;
        const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        setStats({
          activeOnboardings: active,
          documentsPending: pendingDocs,
          scheduledMeetings: meetings.length || 0,
          taskCompletionRate: taskRate
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Active Onboardings"
        value={stats.activeOnboardings}
        subtitle="Employees in process"
        // change={{ value: 8, isPositive: true }}
        icon={<Users size={24} className="text-hr-blue" />}
        color="bg-blue-50"
      />
      
      <StatCard
        title="Documents Pending"
        value={stats.documentsPending}
        subtitle="Employees with missing docs"
        // change={{ value: 5, isPositive: false }}
        icon={<FileText size={24} className="text-hr-amber" />}
        color="bg-amber-50"
      />
      
      <StatCard
        title="Tasks Completed"
        value={`${stats.taskCompletionRate}%`}
        subtitle="HR task completion rate"
        icon={<CheckSquare size={24} className="text-hr-teal" />}
        color="bg-teal-50"
      />
      
      <StatCard
        title="Scheduled Meetings"
        value={stats.scheduledMeetings}
        subtitle="Upcoming meetings"
        icon={<CalendarClock size={24} className="text-purple-500" />}
        color="bg-purple-50"
      />
    </div>
  );
};

export default OnboardingStats;
