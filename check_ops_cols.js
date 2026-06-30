const { Client } = require('pg');
require('dotenv').config({path:'.env.local'});
const client = new Client({connectionString: process.env.DATABASE_URL});
client.connect().then(() => 
  client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'operations_map_plots'")
    .then(res => {
      console.log(res.rows);
      client.end();
    })
    .catch(e => {
      console.error(e);
      client.end();
    })
);
