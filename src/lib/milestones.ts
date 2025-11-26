import { api } from "@/lib/api";
import { MilestonePeriod } from "@/types";

export const getMilestonePlan = async (employeeId: string): Promise<MilestonePeriod[] | null> => {
  try {
    return await api.getMilestonePlan(employeeId);
  } catch (error) {
    console.error("Error fetching milestone plan:", error);
    return null;
  }
};

export const saveMilestonePlan = async (employeeId: string, plan: MilestonePeriod[]): Promise<boolean> => {
  try {
    return await api.saveMilestonePlan(employeeId, plan);
  } catch (error) {
    console.error("Error saving milestone plan:", error);
    return false;
  }
};

export const defaultMilestonePlan: MilestonePeriod[] = [
  {
    title: "First 30 Days",
    milestones: [
      { id: 1, text: "Complete company orientation", completed: false, notes: "" },
      { id: 2, text: "Meet with team members", completed: false, notes: "" },
      { id: 3, text: "Set up workstation and tools", completed: false, notes: "" },
      { id: 4, text: "Review job description and responsibilities", completed: false, notes: "" },
    ]
  },
  {
    title: "60 Days",
    milestones: [
      { id: 5, text: "Complete first project", completed: false, notes: "" },
      { id: 6, text: "Participate in team meeting", completed: false, notes: "" },
      { id: 7, text: "Complete required training modules", completed: false, notes: "" },
    ]
  },
  {
    title: "90 Days",
    milestones: [
      { id: 8, text: "First performance review", completed: false, notes: "" },
      { id: 9, text: "Set long-term goals", completed: false, notes: "" },
      { id: 10, text: "Present onboarding feedback", completed: false, notes: "" },
    ]
  }
];
