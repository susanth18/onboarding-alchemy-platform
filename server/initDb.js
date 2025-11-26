const db = require('./db');

const initDb = async () => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // hr_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hr_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT,
        position TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // employees table
    await client.query(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hr_id) REFERENCES hr_profiles(id)
      );
    `);

    // meetings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id SERIAL PRIMARY KEY,
        hr_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        meeting_date TEXT NOT NULL,
        meeting_time TEXT NOT NULL,
        purpose TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hr_id) REFERENCES hr_profiles(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      );
    `);

    // tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        hr_id TEXT NOT NULL,
        title TEXT NOT NULL,
        deadline TEXT NOT NULL,
        priority TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hr_id) REFERENCES hr_profiles(id)
      );
    `);

    // messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // milestone_plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS milestone_plans (
        employee_id TEXT PRIMARY KEY,
        plan_json TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      );
    `);

    // Seed dummy HR user if not exists
    const dummyHrId = "11111111-1111-1111-1111-111111111111";
    const res = await client.query("SELECT id FROM hr_profiles WHERE id = $1", [dummyHrId]);
    if (res.rows.length === 0) {
      await client.query(`
        INSERT INTO hr_profiles (id, name, company, position)
        VALUES ($1, $2, $3, $4)
      `, [dummyHrId, "Demo HR", "Acme Corp", "HR Manager"]);
      console.log("Seeded dummy HR user");
    }

    await client.query('COMMIT');
    console.log("Database initialized successfully");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("Error initializing database", e);
  } finally {
    client.release();
  }
};

if (require.main === module) {
    initDb().then(() => process.exit(0));
}

module.exports = initDb;
