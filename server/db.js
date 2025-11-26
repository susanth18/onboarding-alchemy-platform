const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a database file in the server directory
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON");

  // hr_profiles table
  db.run(`
    CREATE TABLE IF NOT EXISTS hr_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      position TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // employees table
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      hr_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      phone TEXT,
      contract_url TEXT,
      job_description_url TEXT,
      resume_url TEXT,
      temp_password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hr_id) REFERENCES hr_profiles(id)
    )
  `);

  // meetings table
  db.run(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hr_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      meeting_date TEXT NOT NULL,
      meeting_time TEXT NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hr_id) REFERENCES hr_profiles(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  // tasks table (for HR)
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hr_id TEXT NOT NULL,
      title TEXT NOT NULL,
      deadline TEXT NOT NULL,
      priority TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hr_id) REFERENCES hr_profiles(id)
    )
  `);

  // messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // milestone_plans table
  db.run(`
    CREATE TABLE IF NOT EXISTS milestone_plans (
      employee_id TEXT PRIMARY KEY,
      plan_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  // Seed dummy HR user if not exists
  const dummyHrId = "11111111-1111-1111-1111-111111111111";
  db.get("SELECT id FROM hr_profiles WHERE id = ?", [dummyHrId], (err, row) => {
    if (!row) {
      db.run(`
        INSERT INTO hr_profiles (id, name, company, position)
        VALUES (?, ?, ?, ?)
      `, [dummyHrId, "Demo HR", "Acme Corp", "HR Manager"]);
      console.log("Seeded dummy HR user");
    }
  });
});

module.exports = db;
