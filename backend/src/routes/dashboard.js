import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/summary', async (_req, res, next) => {
  try {
    const [stats, low, expiring, today] = await Promise.all([
      query('SELECT COUNT(*)::int AS total, COALESCE(SUM(stock_quantity * unit_price),0) AS stock_value FROM medicines'),
      query('SELECT id, name, stock_quantity, reorder_level FROM medicines WHERE stock_quantity <= reorder_level ORDER BY stock_quantity LIMIT 10'),
      query("SELECT id, name, expiry_date FROM medicines WHERE expiry_date <= CURRENT_DATE + INTERVAL '60 days' ORDER BY expiry_date LIMIT 10"),
      query('SELECT COUNT(*)::int AS count, COALESCE(SUM(total_amount),0) AS total FROM sales WHERE created_at::date = CURRENT_DATE'),
    ]);
    res.json({
      total_medicines: stats.rows[0].total,
      stock_value: stats.rows[0].stock_value,
      low_stock: low.rows,
      expiring: expiring.rows,
      today_sales_count: today.rows[0].count,
      today_sales_total: today.rows[0].total,
    });
  } catch (err) { next(err); }
});

export default router;
