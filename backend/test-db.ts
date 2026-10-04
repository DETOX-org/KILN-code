import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to DB');
    const res = await client.query('SELECT 1');
    console.log('Query success:', res.rows);
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await client.end();
  }
}

main();
