import { sql } from '../src/lib/db';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    const categories = await sql`SELECT * FROM categories`;
    console.log('Categories:', JSON.stringify(categories, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
main();
