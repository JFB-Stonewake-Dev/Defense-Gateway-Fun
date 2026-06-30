const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function initDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');
    
    const schemaSql = fs.readFileSync('schema.sql', 'utf8');
    
    console.log('Executing schema.sql...');
    await client.query(schemaSql);
    
    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.end();
  }
}

initDb();
