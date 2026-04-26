const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [users] = await connection.query('SELECT * FROM users LIMIT 1');
  if (users.length > 0) {
    const userId = users[0].id;
    const [addresses] = await connection.query('SELECT * FROM user_addresses WHERE user_id = ?', [userId]);
    console.log(`Addresses for user ${userId}:`, addresses);
  } else {
    console.log('No users found');
  }
  await connection.end();
}

check().catch(console.error);
