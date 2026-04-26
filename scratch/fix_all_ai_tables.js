const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAll() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
  });
  
  const tables = ['ai_product_index', 'ai_user_profile', 'ai_recommend_logs', 'ai_chat_history'];
  
  try {
    for (const table of tables) {
      console.log(`Checking table: ${table}`);
      const [rows] = await pool.query(`DESCRIBE ${table}`);
      console.table(rows);
      
      const hasAutoInc = rows.some(r => r.Field === 'id' && r.Extra.includes('auto_increment'));
      if (!hasAutoInc) {
        console.warn(`!!! Table ${table} is missing AUTO_INCREMENT on id column. Fixing...`);
        await pool.query(`ALTER TABLE ${table} MODIFY COLUMN id BIGINT(20) NOT NULL AUTO_INCREMENT`);
        console.log(`Table ${table} fixed.`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkAll();
