import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%';
    const { rows } = await query(
      'SELECT * FROM customers WHERE full_name ILIKE $1 OR phone ILIKE $1 ORDER BY full_name LIMIT 200',
      [q]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { full_name, phone, national_id, address } = req.body;
    if (!full_name) return res.status(400).json({ message: 'نام مشتری الزامی است' });
    const { rows } = await query(
      'INSERT INTO customers (full_name, phone, national_id, address) VALUES ($1,$2,$3,$4) RETURNING *',
      [full_name, phone || null, national_id || null, address || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { full_name, phone, national_id, address } = req.body;
    const { rows } = await query(
      'UPDATE customers SET full_name=$1, phone=$2, national_id=$3, address=$4 WHERE id=$5 RETURNING *',
      [full_name, phone || null, national_id || null, address || null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'مشتری پیدا نشد' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
