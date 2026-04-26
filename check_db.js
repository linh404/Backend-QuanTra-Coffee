const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    const orders = await sql`SELECT * FROM orders`;
    console.log('Orders:', JSON.stringify(orders, null, 2));
    
    const users = await sql`SELECT * FROM users`;
    console.log('Users:', JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
