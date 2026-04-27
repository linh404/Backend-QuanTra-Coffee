import { sql } from './src/lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    const columns = await sql.query('SHOW COLUMNS FROM products');
    console.log(JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
