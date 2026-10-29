import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { rows } = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
    }
    const payload = { id: user.id, username: user.username, role: user.role, full_name: user.full_name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: payload });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
