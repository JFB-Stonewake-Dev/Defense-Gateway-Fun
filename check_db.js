const { Client } = require('pg');
require('dotenv').config({path:'.env.local'});
const client = new Client({connectionString: process.env.DATABASE_URL});
client.connect().then(() => 
  client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    .then(res => {
      console.log(res.rows);
      client.end();
    })
    .catch(e => {
      console.error(e);
      client.end();
    })
);
