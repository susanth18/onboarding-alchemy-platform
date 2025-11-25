
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, CheckSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { format, isPast, isToday, parseISO } from "date-fns";
import BackButton from "@/components/common/BackButton";

type HrTask = {
  id: number;
  employeeId: string;
  title: string;
  category: string;
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
  createdAt: string;
  employee: {
    name: string;
    role: string;
  };
};

const HrTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<HrTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hr_tasks');
      setTasks(response.data || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error.message);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: number) => {
    try {
      // Optimistic update
      setTasks(tasks.filter(t => t.id !== taskId));

      await api.patch(`/hr_tasks/${taskId}`, { status: 'completed' });

      toast({
        title: "Task Completed",
        description: "Task has been marked as done.",
      });
    } catch (error: any) {
      console.error("Error updating task:", error.message);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
      fetchTasks(); // Revert on error
    }
  };

  const getFilteredTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      if (!task.dueDate) return filter === 'all';
      const dueDate = parseISO(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      switch (filter) {
        case 'overdue':
          return isPast(dueDate) && !isToday(dueDate);
        case 'today':
          return isToday(dueDate);
        case 'upcoming':
          return dueDate > today;
        default:
          return true;
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="container mx-auto p-6">
      <BackButton to="/" label="Back to Dashboard" />

      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold flex items-center">
            <CheckSquare className="h-6 w-6 mr-2 text-primary" />
            HR Tasks Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage your internal pre-boarding and administrative checklist</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-red-50 border-red-100">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-red-800">Overdue</p>
                    <h3 className="text-2xl font-bold text-red-900">
                        {tasks.filter(t => t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))).length}
                    </h3>
                </div>
                <AlertCircle className="h-8 w-8 text-red-300" />
            </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-orange-800">Due Today</p>
                    <h3 className="text-2xl font-bold text-orange-900">
                        {tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate))).length}
                    </h3>
                </div>
                <Calendar className="h-8 w-8 text-orange-300" />
            </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-blue-800">Upcoming</p>
                    <h3 className="text-2xl font-bold text-blue-900">
                        {tasks.filter(t => t.dueDate && parseISO(t.dueDate) > new Date()).length}
                    </h3>
                </div>
                <Clock className="h-8 w-8 text-blue-300" />
            </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-green-800">Total Pending</p>
                    <h3 className="text-2xl font-bold text-green-900">{tasks.length}</h3>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-300" />
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
                <CardTitle>Task List</CardTitle>
                <div className="flex space-x-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'overdue' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('overdue')}
                        className={filter === 'overdue' ? "bg-red-600 hover:bg-red-700" : "text-red-600 border-red-200 hover:bg-red-50"}
                    >
                        Overdue
                    </Button>
                    <Button
                        variant={filter === 'today' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('today')}
                        className={filter === 'today' ? "bg-orange-500 hover:bg-orange-600" : "text-orange-600 border-orange-200 hover:bg-orange-50"}
                    >
                        Today
                    </Button>
                    <Button
                        variant={filter === 'upcoming' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-10">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No tasks found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm">
                  <Checkbox
                    className="mt-1 h-5 w-5"
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className={`font-medium text-base ${task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) ? 'text-red-600' : 'text-gray-900'}`}>
                                {task.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                For: <span className="font-medium text-gray-700">{task.employee?.name}</span> ({task.employee?.role})
                            </p>
                        </div>
                        <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {task.priority}
                        </Badge>
                    </div>
                    <div className="flex items-center mt-3 text-xs text-muted-foreground space-x-4">
                        <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {task.dueDate ? format(parseISO(task.dueDate), "MMM d, yyyy") : "No Date"}
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {task.category}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HrTasks;
