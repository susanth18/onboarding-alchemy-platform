import { api } from "@/lib/api";

export interface Task {
  id: number;
  title: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

export const getTasks = async (hrId: string): Promise<Task[]> => {
  try {
    return await api.getTasks(hrId);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const saveTasks = async (hrId: string, tasks: Task[]): Promise<boolean> => {
  try {
    return await api.saveTasks(hrId, tasks);
  } catch (error) {
    console.error("Error saving tasks:", error);
    return false;
  }
};
