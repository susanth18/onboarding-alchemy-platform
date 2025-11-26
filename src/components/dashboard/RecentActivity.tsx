import React, { useEffect, useState } from "react";
import { 
  Clock, 
  FileText, 
  CheckSquare, 
  Calendar, 
  MessageSquare,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  iconColor: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, description, time, iconColor }) => {
  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`p-2 rounded-full ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
      <div className="flex items-center text-xs text-gray-400">
        <Clock size={12} className="mr-1" />
        {time}
      </div>
    </div>
  );
};

const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // Fetch recent employees (last 5)
        const { data: newEmployees, error: empError } = await supabase
          .from('employees')
          .select('name, role, created_at, status')
          .eq('hr_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (empError) throw empError;

        // Fetch recent meetings (last 5)
        const { data: newMeetings, error: meetError } = await supabase
          .from('meetings')
          .select('purpose, meeting_date, created_at, employees(name)')
          .eq('hr_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (meetError) throw meetError;

        // Transform and merge
        const employeeActivities = (newEmployees || []).map(emp => ({
          type: 'employee',
          created_at: emp.created_at,
          icon: <User size={16} className="text-blue-500" />,
          title: "New Employee Added",
          description: `${emp.name} joined as ${emp.role}`,
          iconColor: "bg-blue-100"
        }));

        const meetingActivities = (newMeetings || []).map(meet => ({
          type: 'meeting',
          created_at: meet.created_at,
          icon: <Calendar size={16} className="text-purple-500" />,
          title: "Meeting Scheduled",
          description: `${meet.purpose} with ${meet.employees?.name || 'Employee'}`,
          iconColor: "bg-purple-100"
        }));

        // Combine and sort by date desc
        const allActivities = [...employeeActivities, ...meetingActivities]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5); // Take top 5

        setActivities(allActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  if (loading) {
    return (
      <div className="hr-card h-full flex justify-center items-center">
         <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="hr-card h-full">
        <h3 className="hr-card-title mb-4">Recent Activity</h3>
        <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="hr-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="hr-card-title">Recent Activity</h3>
        <button className="text-sm text-hr-blue hover:text-blue-700 font-medium">View All</button>
      </div>
      <div className="space-y-0">
        {activities.map((activity, index) => (
          <ActivityItem 
            key={index} 
            {...activity} 
            time={formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
