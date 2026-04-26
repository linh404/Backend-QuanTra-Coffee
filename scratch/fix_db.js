const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Fixing user_addresses table...');
  // First, remove the existing record with ID 0 to avoid conflicts if needed, 
  // but better yet, just clear the table if it's just test data
  await connection.query('DELETE FROM user_addresses WHERE id = 0');
  
  // Add AUTO_INCREMENT to id
  await connection.query('ALTER TABLE user_addresses MODIFY id BIGINT(20) NOT NULL AUTO_INCREMENT');
  console.log('Added AUTO_INCREMENT to user_addresses.id');
  
  // Check if phone column exists in users
  const [columns] = await connection.query('DESCRIBE users');
  const hasPhone = columns.some(c => c.Field === 'phone');
  
  if (!hasPhone) {
    console.log('Adding phone column to users table...');
    await connection.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER name');
    console.log('Added phone column to users table');
  } else {
    console.log('Phone column already exists in users table');
  }

  await connection.end();
  console.log('Database fixes completed.');
}

fix().catch(console.error);
