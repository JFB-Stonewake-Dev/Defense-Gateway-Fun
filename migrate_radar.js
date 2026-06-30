const { Client } = require('pg');
require('dotenv').config({path:'.env.local'});
const client = new Client({connectionString: process.env.DATABASE_URL});

const query = `
CREATE TABLE IF NOT EXISTS public.radar_tracks (
  id TEXT PRIMARY KEY,
  callsign TEXT,
  x FLOAT,
  z FLOAT,
  heading FLOAT,
  speed FLOAT,
  altitude FLOAT,
  identity TEXT,
  squawk TEXT,
  status TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.radar_tracks DISABLE ROW LEVEL SECURITY;
`;

client.connect().then(() => 
  client.query(query)
    .then(() => {
      console.log('Migration successful');
      client.end();
    })
    .catch(e => {
      console.error(e);
      client.end();
    })
);
