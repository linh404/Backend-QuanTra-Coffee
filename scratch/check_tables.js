const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const [columns] = await connection.query('DESCRIBE users');
  console.log('Users table columns:', columns);
  const [columnsAddr] = await connection.query('DESCRIBE user_addresses');
  console.log('User_addresses table columns:', columnsAddr);
  await connection.end();
}

check().catch(console.error);
