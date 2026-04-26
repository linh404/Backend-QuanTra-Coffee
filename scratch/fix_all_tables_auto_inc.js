const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAllTables() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
  });

  try {
    console.log('Fetching all tables...');
    const [tablesRow] = await pool.query('SHOW TABLES');
    const tables = tablesRow.map(row => Object.values(row)[0]);
    
    console.log(`Found ${tables.length} tables. Checking for missing AUTO_INCREMENT...`);

    let fixedCount = 0;

    for (const table of tables) {
      const [columns] = await pool.query(`DESCRIBE \`${table}\``);
      
      const idColumn = columns.find(col => col.Field.toLowerCase() === 'id');
      
      if (idColumn && idColumn.Key === 'PRI') {
        const hasAutoInc = idColumn.Extra.toLowerCase().includes('auto_increment');
        const isInt = idColumn.Type.toLowerCase().includes('int');
        
        if (!hasAutoInc && isInt) {
          console.log(`[WARNING] Table \`${table}\` is missing AUTO_INCREMENT on \`id\` (${idColumn.Type}). Fixing...`);
          
          try {
            // Check if there's an id = 0. If so, and if there are other records, we might need to fix it first.
            const [zeroRows] = await pool.query(`SELECT id FROM \`${table}\` WHERE id = 0`);
            if (zeroRows.length > 0) {
                console.log(`  -> Found record with id=0 in \`${table}\`. Updating to a new ID to allow auto_increment...`);
                const [maxRows] = await pool.query(`SELECT MAX(id) as maxId FROM \`${table}\``);
                const nextId = (maxRows[0].maxId || 0) + 1;
                await pool.query(`UPDATE \`${table}\` SET id = ? WHERE id = 0`, [nextId]);
            }

            // Alter the table
            await pool.query(`ALTER TABLE \`${table}\` MODIFY COLUMN id ${idColumn.Type} NOT NULL AUTO_INCREMENT`);
            console.log(`  -> [SUCCESS] Table \`${table}\` fixed.`);
            fixedCount++;
          } catch (alterErr) {
            console.error(`  -> [ERROR] Failed to fix table \`${table}\`:`, alterErr.message);
          }
        }
      }
    }

    console.log(`\nDone! Fixed ${fixedCount} tables.`);
  } catch (err) {
    console.error('Fatal Error:', err);
  } finally {
    await pool.end();
  }
}

fixAllTables();
