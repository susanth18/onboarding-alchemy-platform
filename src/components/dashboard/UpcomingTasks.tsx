
import React from "react";
import { CalendarClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
  // In a real application, this would come from state/API
  const [tasks, setTasks] = React.useState([
    { id: 1, title: "Review Michael's 30-60-90 day plan", deadline: "Today, 5:00 PM", priority: "high", completed: false },
    { id: 2, title: "Schedule orientation for new hires", deadline: "Tomorrow, 10:00 AM", priority: "medium", completed: true },
    { id: 3, title: "Sign off on Q3 compliance documents", deadline: "Apr 15, 3:00 PM", priority: "high", completed: false },
    { id: 4, title: "Prepare training materials for IT department", deadline: "Apr 16, 12:00 PM", priority: "medium", completed: false },
    { id: 5, title: "Follow up on pending equipment requests", deadline: "Apr 18, 2:00 PM", priority: "low", completed: false },
  ]);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

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
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            title={task.title}
            deadline={task.deadline}
            priority={task.priority as "high" | "medium" | "low"}
            completed={task.completed}
            onToggle={() => toggleTaskCompletion(task.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default UpcomingTasks;
