
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
  job_description_url: string | null;
  contract_url: string | null;
  resume_url: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  status: 'pending' | 'active' | 'completed';
}
