const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
  });
  
  try {
    const [rows] = await pool.query('DESCRIBE ai_chat_history');
    console.log('Table structure for ai_chat_history:');
    console.table(rows);
    
    const [data] = await pool.query('SELECT * FROM ai_chat_history LIMIT 5');
    console.log('Current data in ai_chat_history:');
    console.table(data);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();
