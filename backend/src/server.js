import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import medicineRoutes from './routes/medicines.js';
import customerRoutes from './routes/customers.js';
import salesRoutes from './routes/sales.js';
import dashboardRoutes from './routes/dashboard.js';
import { requireAuth } from './middleware/auth.js';
import { initDatabase } from './init.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'سدید' }));
app.use('/api/auth', authRoutes);
app.use('/api/medicines', requireAuth, medicineRoutes);
app.use('/api/customers', requireAuth, customerRoutes);
app.use('/api/sales', requireAuth, salesRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);

// فرانت‌اند ساخته‌شده (در نسخه آنلاین از همین سرور سرو می‌شود)
const distDir = fileURLToPath(new URL('../../frontend/dist', import.meta.url));
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === '23505') return res.status(409).json({ message: 'این مقدار قبلاً ثبت شده است' });
  res.status(err.status || 500).json({ message: err.message || 'خطای داخلی سرور' });
});

const port = process.env.PORT || 4000;
initDatabase()
  .then(() => app.listen(port, () => console.log(`سدید روی پورت ${port} اجرا شد`)))
  .catch((err) => { console.error('خطا در اتصال به دیتابیس:', err); process.exit(1); });
