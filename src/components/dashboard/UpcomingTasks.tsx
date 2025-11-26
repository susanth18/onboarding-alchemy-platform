import React, { useEffect, useState } from "react";
import { CalendarClock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { getTasks, saveTasks, Task } from "@/lib/tasks";
import { toast } from "@/components/ui/use-toast";

interface TaskItemProps {
  title: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  onToggle: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ title, deadline, priority, completed, onToggle }) => {
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
      <Checkbox 
        checked={completed} 
        onCheckedChange={onToggle}
        className="mr-3" 
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      setLoading(true);
      const data = await getTasks(user.id);
      setTasks(data);
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  const toggleTaskCompletion = async (taskId: number) => {
    if (!user) return;

    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    setTasks(newTasks);
    
    // Save to backend
    const success = await saveTasks(user.id, newTasks);
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to save task update",
        variant: "destructive"
      });
      // Revert if failed
      setTasks(tasks); 
    }
  };

  if (loading) {
    return (
      <div className="hr-card h-full flex justify-center items-center">
         <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="hr-card h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="hr-card-title">Upcoming Tasks</h3>
        <Button variant="ghost" className="text-sm text-hr-blue hover:text-blue-700 font-medium">
          <span>View All</span>
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
      
      <div>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              title={task.title}
              deadline={task.deadline}
              priority={task.priority}
              completed={task.completed}
              onToggle={() => toggleTaskCompletion(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingTasks;
