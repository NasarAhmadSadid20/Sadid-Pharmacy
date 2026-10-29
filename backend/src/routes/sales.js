import { Router } from 'express';
import { query, withTransaction } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT s.id, s.invoice_no, s.total_amount, s.discount, s.paid_amount, s.created_at,
             c.full_name AS customer_name, u.full_name AS seller_name
      FROM sales s
      LEFT JOIN customers c ON c.id = s.customer_id
      JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC LIMIT 200`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const sale = await query(
      `SELECT s.*, c.full_name AS customer_name, u.full_name AS seller_name
       FROM sales s LEFT JOIN customers c ON c.id = s.customer_id
       JOIN users u ON u.id = s.user_id WHERE s.id = $1`, [req.params.id]);
    if (!sale.rows[0]) return res.status(404).json({ message: 'فاکتور پیدا نشد' });
    const items = await query(
      `SELECT si.*, m.name AS medicine_name FROM sale_items si
       JOIN medicines m ON m.id = si.medicine_id WHERE si.sale_id = $1`, [req.params.id]);
    res.json({ ...sale.rows[0], items: items.rows });
  } catch (err) { next(err); }
});

// ثبت فروش: قیمت و موجودی از دیتابیس خوانده می‌شود و کل عملیات در یک تراکنش است
router.post('/', async (req, res, next) => {
  try {
    const { customer_id = null, items = [], discount = 0, paid_amount } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'حداقل یک قلم دارو لازم است' });
    }

    const sale = await withTransaction(async (client) => {
      let total = 0;
      const lines = [];

      for (const item of items) {
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
          const e = new Error('تعداد نامعتبر است'); e.status = 400; throw e;
        }
        const { rows } = await client.query('SELECT * FROM medicines WHERE id = $1 FOR UPDATE', [item.medicine_id]);
        const med = rows[0];
        if (!med) { const e = new Error('دارو پیدا نشد'); e.status = 404; throw e; }
        if (med.stock_quantity < qty) {
          const e = new Error(`موجودی «${med.name}» کافی نیست (موجودی: ${med.stock_quantity})`);
          e.status = 400; throw e;
        }
        if (med.expiry_date && new Date(med.expiry_date) < new Date()) {
          const e = new Error(`«${med.name}» منقضی شده است`); e.status = 400; throw e;
        }
        const lineTotal = Number(med.unit_price) * qty;
        total += lineTotal;
        lines.push({ med, qty, lineTotal });
      }

      const finalDiscount = Math.min(Number(discount) || 0, total);
      const payable = total - finalDiscount;
      const paid = paid_amount === undefined ? payable : Number(paid_amount);

      const count = await client.query('SELECT COUNT(*)::int AS n FROM sales');
      const invoiceNo = `INV-${new Date().getFullYear()}-${String(count.rows[0].n + 1).padStart(6, '0')}`;

      const saleRes = await client.query(
        `INSERT INTO sales (invoice_no, customer_id, user_id, total_amount, discount, paid_amount)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [invoiceNo, customer_id, req.user.id, payable, finalDiscount, paid]
      );
      const saleId = saleRes.rows[0].id;

      for (const l of lines) {
        await client.query(
          'INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, line_total) VALUES ($1,$2,$3,$4,$5)',
          [saleId, l.med.id, l.qty, l.med.unit_price, l.lineTotal]
        );
        await client.query(
          'UPDATE medicines SET stock_quantity = stock_quantity - $1, updated_at = NOW() WHERE id = $2',
          [l.qty, l.med.id]
        );
      }
      return saleRes.rows[0];
    });

    res.status(201).json(sale);
  } catch (err) { next(err); }
});

export default router;
