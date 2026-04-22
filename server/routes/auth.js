const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { db } = require('../db');
const authMw = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const user = db.get('users').find({ email: email.toLowerCase().trim() }).value();
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.get('/me', authMw, (req, res) => {
  const u = db.get('users').find({ id: req.user.id }).value();
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({ id: u.id, email: u.email, name: u.name, created_at: u.created_at });
});

router.post('/change-password', authMw, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8)
    return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const user = db.get('users').find({ id: req.user.id }).value();
  if (!bcrypt.compareSync(currentPassword, user.password))
    return res.status(401).json({ error: 'Current password is incorrect' });

  db.get('users').find({ id: req.user.id }).assign({ password: bcrypt.hashSync(newPassword, 12) }).write();
  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
