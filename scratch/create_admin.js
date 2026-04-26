
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
  const DATABASE_URL = 'mysql://root:@127.0.0.1:3306/quantra-caffee';
  const email = 'admin@quantra.com';
  const password = '123123';
  const name = 'Admin User';
  const role = 'admin';

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // Check if exists
    const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    
    const passwordHash = await bcrypt.hash(password, 12);

    if (rows.length > 0) {
      console.log('User already exists, updating password and role...');
      await connection.query(
        'UPDATE users SET password_hash = ?, role = ?, name = ?, updated_at = NOW() WHERE email = ?',
        [passwordHash, role, name, email]
      );
      console.log('User updated successfully.');
    } else {
      console.log('Creating new admin user...');
      await connection.query(
        'INSERT INTO users (email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [email, passwordHash, name, role]
      );
      console.log('Admin user created successfully.');
    }
    
    console.log('-----------------------------------');
    console.log('Account Details:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);
    console.log('-----------------------------------');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

run();
