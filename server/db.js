const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

// Check if .env exists or create dummy one
const envPath = path.resolve(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    const defaultEnv = `DATABASE_URL=postgresql://engine:engine@localhost:5432/project
PORT=3000
SECRET_KEY=super_secret_key
`;
    fs.writeFileSync(envPath, defaultEnv);
}

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    client.query('SELECT NOW()', (err, result) => {
      release();
      if (err) {
        console.error('Error executing query', err.stack);
      } else {
        console.log('Connected to PostgreSQL:', result.rows[0]);
      }
    });
  }
});

module.exports = pool;
