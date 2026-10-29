import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const fields = ['code', 'name', 'generic_name', 'manufacturer', 'category',
  'requires_prescription', 'unit_price', 'stock_quantity', 'reorder_level', 'expiry_date'];

function pick(body) {
  const data = {};
  for (const f of fields) if (body[f] !== undefined) data[f] = body[f] === '' ? null : body[f];
  return data;
}

router.get('/', async (req, res, next) => {
  try {
    const { q = '', filter = 'all' } = req.query;
    const conditions = [];
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(name ILIKE $${params.length} OR generic_name ILIKE $${params.length} OR code ILIKE $${params.length})`);
    }
    if (filter === 'low') conditions.push('stock_quantity <= reorder_level');
    if (filter === 'expiring') conditions.push("expiry_date <= CURRENT_DATE + INTERVAL '60 days'");
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(`SELECT * FROM medicines ${where} ORDER BY name LIMIT 500`, params);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const d = pick(req.body);
    if (!d.code || !d.name || d.unit_price === undefined) {
      return res.status(400).json({ message: 'کد، نام و قیمت الزامی است' });
    }
    const cols = Object.keys(d);
    const sql = `INSERT INTO medicines (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    const { rows } = await query(sql, Object.values(d));
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const d = pick(req.body);
    const cols = Object.keys(d);
    if (!cols.length) return res.status(400).json({ message: 'داده‌ای برای ویرایش نیست' });
    const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const { rows } = await query(
      `UPDATE medicines SET ${sets}, updated_at = NOW() WHERE id = $${cols.length + 1} RETURNING *`,
      [...Object.values(d), req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'دارو پیدا نشد' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM medicines WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ message: 'این دارو در فروش‌ها ثبت شده و قابل حذف نیست' });
    next(err);
  }
});

export default router;
