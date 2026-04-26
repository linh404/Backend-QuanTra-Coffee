
import { sql } from './src/lib/db';
import bcrypt from 'bcryptjs';

async function run() {
  const email = 'admin@quantra.com';
  const password = '123123';
  const name = 'Admin User';
  const role = 'admin';

  try {
    // Check if exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    
    if (existing.length > 0) {
      console.log('User already exists, updating password and role...');
      const passwordHash = await bcrypt.hash(password, 12);
      await sql`
        UPDATE users 
        SET password_hash = ${passwordHash}, role = ${role}, name = ${name}
        WHERE email = ${email}
      `;
      console.log('User updated successfully.');
    } else {
      console.log('Creating new admin user...');
      const passwordHash = await bcrypt.hash(password, 12);
      await sql`
        INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
        VALUES (${email}, ${passwordHash}, ${name}, ${role}, NOW(), NOW())
      `;
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
