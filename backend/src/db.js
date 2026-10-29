import pg from 'pg';
import 'dotenv/config';

const url = process.env.DATABASE_URL;
const useSsl = process.env.DB_SSL !== 'false' && !/localhost|127\.0\.0\.1/.test(url || '');

export const pool = new pg.Pool({
  connectionString: url,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

export const query = (text, params) => pool.query(text, params);

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
