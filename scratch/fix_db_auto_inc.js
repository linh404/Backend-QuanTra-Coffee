const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
  });
  
  try {
    console.log('Fixing ai_chat_history table...');
    
    // First, change the existing id 0 to 1 if it exists
    await pool.query('UPDATE ai_chat_history SET id = 1 WHERE id = 0');
    
    // Then modify column to be auto_increment
    await pool.query('ALTER TABLE ai_chat_history MODIFY COLUMN id BIGINT(20) NOT NULL AUTO_INCREMENT');
    
    console.log('Table fixed successfully!');
    
    const [rows] = await pool.query('DESCRIBE ai_chat_history');
    console.table(rows);
  } catch (err) {
    console.error('Error fixing table:', err);
  } finally {
    await pool.end();
  }
}

fix();
