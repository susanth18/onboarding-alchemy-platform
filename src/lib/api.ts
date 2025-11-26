
const API_URL = ''; // Relative path because of Vite proxy

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  // Employees
  getEmployees: async (hrId, email) => {
    let url = `${API_URL}/api/employees`;
    const params = new URLSearchParams();
    if (hrId) params.append('hr_id', hrId);
    if (email) params.append('email', email);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  getEmployee: async (id) => {
    const res = await fetch(`${API_URL}/api/employees/${id}`);
    if (!res.ok) throw new Error('Failed to fetch employee');
    return res.json();
  },

  createEmployee: async (data) => {
    const res = await fetch(`${API_URL}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create employee');
    return res.json();
  },

  deleteEmployee: async (id) => {
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete employee');
    return res.json();
  },

  updateEmployee: async (id, data) => {
    // Note: Backend update endpoint not implemented in this snippet, let's assume createEmployee handles upsert or add an update endpoint
    // Wait, I missed adding PUT /api/employees/:id in server/index.js
    // I will implement it in server/index.js soon.
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return res.json();
  },

  // Meetings
  getMeetings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/meetings?${query}`);
    if (!res.ok) throw new Error('Failed to fetch meetings');
    return res.json();
  },

  createMeeting: async (data) => {
    const res = await fetch(`${API_URL}/api/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create meeting');
    return res.json();
  },

  updateMeetingStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/api/meetings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update meeting');
    return res.json();
  },

  // Tasks
  getTasks: async (hrId) => {
    const res = await fetch(`${API_URL}/api/tasks?hr_id=${hrId}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  saveTasks: async (hrId, tasks) => {
    const res = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hr_id: hrId, tasks })
    });
    return res.ok;
  },

  // Milestones
  getMilestonePlan: async (employeeId) => {
    const res = await fetch(`${API_URL}/api/milestones/${employeeId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch plan');
    return res.json();
  },

  saveMilestonePlan: async (employeeId, plan) => {
    const res = await fetch(`${API_URL}/api/milestones/${employeeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    return res.ok;
  },

  // Messages
  getMessages: async (senderId, recipientId) => {
    const res = await fetch(`${API_URL}/api/messages?sender_id=${senderId}&recipient_id=${recipientId}`);
    if (!res.ok) return [];
    return res.json();
  },

  sendMessage: async (data) => {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.ok;
  },

  // Upload
  uploadDocument: async (employeeId, type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/api/upload/${employeeId}/${type}`, {
        method: 'POST',
        body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // HR Profile
  getHrProfile: async (id) => {
      const res = await fetch(`${API_URL}/api/hr_profiles/${id}`);
      if (!res.ok) return null;
      return res.json();
  },

  updateHrProfile: async (id, data) => {
      const res = await fetch(`${API_URL}/api/hr_profiles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
  }
};
