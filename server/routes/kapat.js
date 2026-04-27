const router      = require('express').Router();
const { Kapat }   = require('../db');
const auth        = require('../middleware/auth');

// Public
router.get('/', async (_req, res) => {
  try {
    const kapat = await Kapat.findOne();
    res.json(kapat);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin
router.put('/', auth, async (req, res) => {
  try {
    const { is_open, open_date, close_date, announcement } = req.body;
    const kapat = await Kapat.findOneAndUpdate(
      {},
      {
        is_open:      is_open ? 1 : 0,
        open_date:    open_date  || null,
        close_date:   close_date || null,
        announcement: announcement || '',
        updated_at:   new Date().toISOString(),
      },
      { new: true, upsert: true }
    );
    res.json(kapat);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
