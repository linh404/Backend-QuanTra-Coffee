const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
  });
  
  try {
    const [orders] = await pool.query('SELECT * FROM orders');
    console.log('Orders found:', orders.length);
    console.log(JSON.stringify(orders, null, 2));
    
    const [users] = await pool.query('SELECT id, name, email FROM users');
    console.log('Users found:', users.length);
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();
