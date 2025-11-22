
import React, { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  User,
  Loader2
} from "lucide-react";
import api from "@/lib/api";
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
      <div className="flex items-center text-xs text-gray-400 whitespace-nowrap ml-2">
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
    if (user) {
      fetchActivity();
    }
  }, [user]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const newActivities: any[] = [];

      // 1. New Employees
      const empResponse = await api.get('/employees');
      const employees = empResponse.data || [];

      // Filter recent
      employees.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const recentEmployees = employees.slice(0, 3);

      recentEmployees.forEach((emp: any) => {
        newActivities.push({
          type: 'new_employee',
          title: "New Employee Added",
          description: `${emp.name} joined as ${emp.role}`,
          createdAt: new Date(emp.createdAt),
          icon: <User size={16} className="text-red-500" />,
          iconColor: "bg-red-100"
        });
      });

      // 2. Recent Meetings
       const meetingResponse = await api.get('/meetings');
       const meetings = meetingResponse.data || [];

       // Backend endpoint filters by upcoming, but let's see if we can use them as "activity"
       // "Meeting Scheduled" is a valid activity.

       meetings.forEach((m: any) => {
         newActivities.push({
           type: 'meeting',
           title: "Meeting Scheduled",
           description: `${m.purpose} with ${m.employee?.name}`,
           createdAt: new Date(m.createdAt),
           icon: <Calendar size={16} className="text-purple-500" />,
           iconColor: "bg-purple-100"
         });
       });

       // Sort by date desc and take top 5
       newActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
       setActivities(newActivities.slice(0, 5));

    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="hr-card-title">Recent Activity</h3>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-4">
          No recent activity found.
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((activity, index) => (
            <ActivityItem
              key={index}
              {...activity}
              time={formatDistanceToNow(activity.createdAt, { addSuffix: true })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
