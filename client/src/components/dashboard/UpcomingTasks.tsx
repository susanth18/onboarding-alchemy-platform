
import React, { useEffect, useState } from "react";
import { CalendarClock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";

interface TaskItemProps {
  title: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ title, deadline, priority, completed }) => {
  const priorityBadge = () => {
    switch (priority) {
      case "high":
        return <span className="hr-badge-red">High</span>;
      case "medium":
        return <span className="hr-badge-amber">Medium</span>;
      case "low":
        return <span className="hr-badge-blue">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      {/* Checkbox is read-only here as these are aggregated tasks */}
      <Checkbox
        checked={completed}
        className="mr-3"
        disabled
      />
      <div className="flex-1">
        <p className={`text-sm font-medium ${completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {title}
        </p>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <CalendarClock size={12} className="mr-1" />
          <span className="mr-2">{deadline}</span>
          {priorityBadge()}
        </div>
      </div>
    </div>
  );
};

const UpcomingTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks: any[] = [];

      // 1. Upcoming Meetings
      const response = await api.get('/meetings');
      const meetings = response.data || [];

      // The backend returns upcoming meetings automatically
      meetings.forEach((m: any, index: number) => {
        fetchedTasks.push({
          id: `meeting-${index}`,
          title: `Meeting: ${m.purpose} (${m.employee?.name})`,
          deadline: format(parseISO(m.date), "MMM d") + `, ${format(parseISO(m.date), "HH:mm")}`, // Reformatting
          priority: "high", // Meetings are high priority
          completed: false
        });
      });

      setTasks(fetchedTasks);

    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="hr-card-title">Upcoming Schedule</h3>
        <Button variant="ghost" className="text-sm text-hr-blue hover:text-blue-700 font-medium">
          <span>View All</span>
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-4">
          No upcoming meetings scheduled.
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              title={task.title}
              deadline={task.deadline}
              priority={task.priority as "high" | "medium" | "low"}
              completed={task.completed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks;
