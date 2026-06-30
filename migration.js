const { Client } = require('pg');
require('dotenv').config({path:'.env.local'});
const client = new Client({connectionString: process.env.DATABASE_URL});
client.connect().then(() => 
  client.query('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT, ADD COLUMN IF NOT EXISTS main_group_role TEXT, ADD COLUMN IF NOT EXISTS police_group_role TEXT;')
    .then(() => {
      console.log('Migration successful');
      client.end();
    })
    .catch(e => {
      console.error(e);
      client.end();
    })
);
