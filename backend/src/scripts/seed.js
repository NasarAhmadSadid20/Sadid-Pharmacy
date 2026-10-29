import 'dotenv/config';
import { initDatabase } from '../init.js';
import { pool } from '../db.js';

initDatabase()
  .then(() => console.log('Seed completed'))
  .catch((err) => { console.error(err); process.exitCode = 1; })
  .finally(() => pool.end());
