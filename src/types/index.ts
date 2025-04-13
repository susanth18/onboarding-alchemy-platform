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
