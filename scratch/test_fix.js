const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Testing address insertion...');
  const [result] = await connection.query(
    'INSERT INTO user_addresses (user_id, name, phone, line1, city, district, ward, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [1, 'Test User', '0123456789', '123 Test St', 'Test City', 'Test District', 'Test Ward', 1]
  );
  console.log('Insert result:', result);
  
  const [rows] = await connection.query('SELECT * FROM user_addresses WHERE user_id = 1');
  console.log('Addresses for user 1:', rows);
  
  await connection.end();
}

test().catch(console.error);
