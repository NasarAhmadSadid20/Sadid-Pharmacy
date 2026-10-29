import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { query } from './db.js';

const schemaPath = fileURLToPath(new URL('../../database/schema.sql', import.meta.url));

export async function initDatabase() {
  await query(fs.readFileSync(schemaPath, 'utf8'));

  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await query(
    `INSERT INTO users (username, password_hash, full_name, role)
     VALUES ('admin', $1, 'مدیر داروخانه', 'admin') ON CONFLICT (username) DO NOTHING`, [hash]);

  const meds = [
    ['MED-001', 'آموکسی‌سیلین ۵۰۰', 'Amoxicillin', 'Abidi', 'آنتی‌بیوتیک', true, 45000, 120, 20, '2027-06-30'],
    ['MED-002', 'استامینوفن ۵۰۰', 'Acetaminophen', 'Sina', 'مسکن', false, 18000, 8, 15, '2027-01-15'],
    ['MED-003', 'امپرازول ۲۰', 'Omeprazole', 'Darou Pakhsh', 'گوارشی', false, 32000, 60, 20, '2026-12-01'],
    ['MED-004', 'انسولین ریگولار', 'Insulin Regular', 'Novo', 'دیابت', true, 350000, 15, 5, '2026-11-20'],
    ['MED-005', 'ویتامین C ۱۰۰۰', 'Ascorbic Acid', 'Osveh', 'مکمل', false, 65000, 40, 10, '2028-03-10'],
  ];
  for (const m of meds) {
    await query(
      `INSERT INTO medicines (code, name, generic_name, manufacturer, category, requires_prescription,
         unit_price, stock_quantity, reorder_level, expiry_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (code) DO NOTHING`, m);
  }
  console.log('Database ready');
}
