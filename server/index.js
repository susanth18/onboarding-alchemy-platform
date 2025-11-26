const express = require('express');
const cors = require('cors');
const db = require('./db');
const initDb = require('./initDb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "super_secret_key";

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize DB
initDb();

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // We expect upload URL to be /api/upload/:employeeId/:type
    const employeeId = req.params.employeeId || 'common';
    const type = req.params.type || 'misc';
    const dir = path.join(__dirname, 'uploads', employeeId, type);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Helper to wrap db.query
const query = async (sql, params = []) => {
  const res = await db.query(sql, params);
  return res;
};

// AUTH
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (email === 'demo@example.com') {
      const user = { id: "11111111-1111-1111-1111-111111111111", role: 'hr', email };
      const token = jwt.sign(user, SECRET_KEY);
      return res.json({ user, session: { access_token: token } });
    }

    const result = await query("SELECT * FROM employees WHERE email = $1", [email]);
    const employee = result.rows[0];
    if (employee) {
        const user = { id: employee.id, role: 'employee', email };
        const token = jwt.sign(user, SECRET_KEY);
        return res.json({ user, session: { access_token: token } });
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// EMPLOYEES
app.get('/api/employees', async (req, res) => {
  try {
    const { hr_id, email } = req.query;
    let sql = "SELECT * FROM employees";
    let params = [];
    let conditions = [];
    let paramIdx = 1;
    
    if (hr_id) {
        conditions.push(`hr_id = $${paramIdx++}`);
        params.push(hr_id);
    }
    if (email) {
        conditions.push(`email = $${paramIdx++}`);
        params.push(email);
    }
    
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    
    sql += " ORDER BY created_at DESC";
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const result = await query("SELECT * FROM employees WHERE id = $1", [req.params.id]);
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { hr_id, name, email, role, employee_id, phone } = req.body;
    const id = uuidv4();
    await query(
      `INSERT INTO employees (id, hr_id, employee_id, name, email, role, phone, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [id, hr_id, employee_id, name, email, role, phone]
    );
    const result = await query("SELECT * FROM employees WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
    try {
        const { status, email, phone, role, name, employee_id } = req.body;
        
        // Construct dynamic update query
        let updates = [];
        let params = [];
        let paramIdx = 1;
        
        if (status !== undefined) { updates.push(`status = $${paramIdx++}`); params.push(status); }
        if (email !== undefined) { updates.push(`email = $${paramIdx++}`); params.push(email); }
        if (phone !== undefined) { updates.push(`phone = $${paramIdx++}`); params.push(phone); }
        if (role !== undefined) { updates.push(`role = $${paramIdx++}`); params.push(role); }
        if (name !== undefined) { updates.push(`name = $${paramIdx++}`); params.push(name); }
        if (employee_id !== undefined) { updates.push(`employee_id = $${paramIdx++}`); params.push(employee_id); }
        
        if (updates.length === 0) return res.json({ success: true });
        
        params.push(req.params.id);
        
        await query(`UPDATE employees SET ${updates.join(', ')} WHERE id = $${paramIdx}`, params);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await query("DELETE FROM employees WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// MEETINGS
app.get('/api/meetings', async (req, res) => {
    try {
        const { hr_id, employee_id, status } = req.query;
        let sql = `
            SELECT m.*, e.name as employee_name 
            FROM meetings m 
            LEFT JOIN employees e ON m.employee_id = e.id
        `;
        let where = [];
        let params = [];
        let paramIdx = 1;

        if (hr_id) {
            where.push(`m.hr_id = $${paramIdx++}`);
            params.push(hr_id);
        }
        if (employee_id) {
            where.push(`m.employee_id = $${paramIdx++}`);
            params.push(employee_id);
        }
        if (status) {
            where.push(`m.status = $${paramIdx++}`);
            params.push(status);
        }

        if (where.length > 0) {
            sql += " WHERE " + where.join(" AND ");
        }
        
        sql += " ORDER BY m.meeting_date ASC";

        const result = await query(sql, params);
        const rows = result.rows;
        
        // Transform for frontend compatibility (nested employees object)
        const transformed = rows.map(r => ({
            ...r,
            employees: { name: r.employee_name }
        }));
        
        res.json(transformed);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/meetings', async (req, res) => {
    try {
        const { hr_id, employee_id, meeting_date, meeting_time, purpose } = req.body;
        const result = await query(
            `INSERT INTO meetings (hr_id, employee_id, meeting_date, meeting_time, purpose, status) 
             VALUES ($1, $2, $3, $4, $5, 'scheduled') RETURNING *`,
            [hr_id, employee_id, meeting_date, meeting_time, purpose]
        );
        res.json([result.rows[0]]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/meetings/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await query("UPDATE meetings SET status = $1 WHERE id = $2", [status, req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// TASKS
app.get('/api/tasks', async (req, res) => {
    try {
        const { hr_id } = req.query;
        const result = await query("SELECT * FROM tasks WHERE hr_id = $1", [hr_id]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const { hr_id, tasks } = req.body;
        
        // Using a transaction
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            await client.query("DELETE FROM tasks WHERE hr_id = $1", [hr_id]);
            
            for (const t of tasks) {
                await client.query(
                    "INSERT INTO tasks (hr_id, title, deadline, priority, completed) VALUES ($1, $2, $3, $4, $5)",
                    [hr_id, t.title, t.deadline, t.priority, t.completed]
                );
            }
            await client.query('COMMIT');
            res.json({ success: true });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// MILESTONES
app.get('/api/milestones/:employeeId', async (req, res) => {
    try {
        const result = await query("SELECT plan_json FROM milestone_plans WHERE employee_id = $1", [req.params.employeeId]);
        const row = result.rows[0];
        if (row) {
            res.json(JSON.parse(row.plan_json));
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/milestones/:employeeId', async (req, res) => {
    try {
        const plan = req.body;
        const planJson = JSON.stringify(plan);
        // Upsert
        await query(`
            INSERT INTO milestone_plans (employee_id, plan_json) VALUES ($1, $2)
            ON CONFLICT(employee_id) DO UPDATE SET plan_json = $2, updated_at = CURRENT_TIMESTAMP
        `, [req.params.employeeId, planJson]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// MESSAGES
app.get('/api/messages', async (req, res) => {
    try {
        const { sender_id, recipient_id } = req.query;
        // Get conversation
        const result = await query(`
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND recipient_id = $2) 
               OR (sender_id = $2 AND recipient_id = $1)
            ORDER BY timestamp ASC
        `, [sender_id, recipient_id]);
        
        // Transform
        const messages = result.rows.map(m => ({
            id: m.id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            content: m.content,
            timestamp: m.timestamp,
            read: !!m.read
        }));
        
        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { senderId, recipientId, senderName, content } = req.body;
        const id = uuidv4();
        await query(`
            INSERT INTO messages (id, sender_id, recipient_id, sender_name, content)
            VALUES ($1, $2, $3, $4, $5)
        `, [id, senderId, recipientId, senderName, content]);
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// UPLOAD
app.post('/api/upload/:employeeId/:type', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        
        const employeeId = req.params.employeeId;
        const type = req.params.type;
        const protocol = req.protocol;
        const host = req.get('host');
        const publicUrl = `${protocol}://${host}/uploads/${employeeId}/${type}/${req.file.filename}`;
        
        // Update employee record if applicable
        if (employeeId !== 'common') {
            let field = null;
            if (type === 'job_description') field = 'job_description_url';
            else if (type === 'contract') field = 'contract_url';
            else if (type === 'resume') field = 'resume_url';
            
            if (field) {
                await query(`UPDATE employees SET ${field} = $1 WHERE id = $2`, [publicUrl, employeeId]);
            }
        }
        
        res.json({ publicUrl });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// HR Profile
app.get('/api/hr_profiles/:id', async (req, res) => {
    try {
        const result = await query("SELECT * FROM hr_profiles WHERE id = $1", [req.params.id]);
        res.json(result.rows[0] || null);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/hr_profiles/:id', async (req, res) => {
    try {
        const { name, company, position } = req.body;
        await query("UPDATE hr_profiles SET name = $1, company = $2, position = $3 WHERE id = $4", [name, company, position, req.params.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
