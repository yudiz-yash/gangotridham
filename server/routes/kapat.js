const router = require('express').Router();
const { db } = require('../db');
const auth   = require('../middleware/auth');

// Public
router.get('/', (_req, res) => {
  res.json(db.get('kapat').value());
});

// Admin
router.put('/', auth, (req, res) => {
  const { is_open, open_date, close_date, announcement } = req.body;
  db.set('kapat', {
    is_open:      is_open ? 1 : 0,
    open_date:    open_date  || null,
    close_date:   close_date || null,
    announcement: announcement || '',
    updated_at:   new Date().toISOString(),
  }).write();
  res.json(db.get('kapat').value());
});

module.exports = router;
