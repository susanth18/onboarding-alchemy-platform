
export interface HRProfile {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  hr_id: string;
  name: string;
  employee_id: string;
  role: string;
  email: string;
  phone: string | null;
  job_description_url: string | null;
  contract_url: string | null;
  resume_url: string | null;
  status: "pending" | "active" | "completed";
  created_at: string;
  temp_password?: string;
}

export interface Meeting {
  id: string;
  hr_id: string;
  employee_id: string;
  employee_name?: string;
  meeting_date: string;
  meeting_time: string;
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at?: string;
}
