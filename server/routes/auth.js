const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { User } = require('../db');
const authMw  = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMw, async (req, res) => {
  try {
    const u = await User.findById(req.user.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ id: u._id.toString(), email: u.email, name: u.name, created_at: u.created_at });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/change-password', authMw, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const user = await User.findById(req.user.id);
    if (!bcrypt.compareSync(currentPassword, user.password))
      return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = bcrypt.hashSync(newPassword, 12);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
