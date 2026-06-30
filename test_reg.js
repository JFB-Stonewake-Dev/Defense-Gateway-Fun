const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({path:'.env.local'});
const client = new Client({connectionString: process.env.DATABASE_URL});

async function testReg() {
  await client.connect();
  try {
    const passwordHash = await bcrypt.hash('test', 10);
    const res = await client.query(`
      INSERT INTO users (roblox_id, username, password_hash, main_group_rank, police_group_rank)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, ['1262082687', 'carboyjo', passwordHash, 0, 0]);
    console.log("INSERT SUCCESS", res.rows);
  } catch (e) {
    console.error("INSERT ERROR", e);
  }
  await client.end();
}
testReg();
