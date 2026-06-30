const { Client } = require('pg');
require('dotenv').config({path:'.env.local'});
const client = new Client({connectionString: process.env.DATABASE_URL});
client.connect().then(() => 
  client.query('DELETE FROM public.users')
    .then(() => {
      console.log('Cleared DB');
      client.end();
    })
    .catch(e => {
      console.error(e);
      client.end();
    })
);
