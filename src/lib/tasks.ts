import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "employee_documents";
const FOLDER_NAME = "tasks";

export interface Task {
  id: number;
  title: string;
  deadline: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

export const getTasks = async (hrId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(`${FOLDER_NAME}/${hrId}.json`);

    if (error) {
      console.log("Error fetching tasks (might be missing):", error);
      // Return default tasks if file doesn't exist, so the UI isn't empty on first load
      return [
        { id: 1, title: "Review Michael's 30-60-90 day plan", deadline: "Today, 5:00 PM", priority: "high", completed: false },
        { id: 2, title: "Schedule orientation for new hires", deadline: "Tomorrow, 10:00 AM", priority: "medium", completed: true },
        { id: 3, title: "Sign off on Q3 compliance documents", deadline: "Apr 15, 3:00 PM", priority: "high", completed: false },
        { id: 4, title: "Prepare training materials for IT department", deadline: "Apr 16, 12:00 PM", priority: "medium", completed: false },
        { id: 5, title: "Follow up on pending equipment requests", deadline: "Apr 18, 2:00 PM", priority: "low", completed: false },
      ];
    }

    const text = await data.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const saveTasks = async (hrId: string, tasks: Task[]): Promise<boolean> => {
  try {
    const blob = new Blob([JSON.stringify(tasks)], { type: "application/json" });
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${FOLDER_NAME}/${hrId}.json`, blob, {
        upsert: true,
        contentType: "application/json",
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving tasks:", error);
    return false;
  }
};
