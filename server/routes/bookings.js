const router        = require('express').Router();
const { Booking }   = require('../db');
const auth          = require('../middleware/auth');
const { sendBookingEmail } = require('../utils/mailer');

const MOBILE_RE = /^[+\d\s\-]{10,15}$/;
const STATUSES  = ['pending', 'confirmed', 'completed', 'cancelled'];

// Public: create booking
router.post('/', async (req, res) => {
  try {
    const { yajaman_name, mobile, email, puja_type, puja_date, gotra, purpose, message } = req.body;
    if (!yajaman_name || !mobile || !puja_type || !puja_date)
      return res.status(400).json({ error: 'Name, mobile, puja type and date are required' });
    if (!MOBILE_RE.test(mobile))
      return res.status(400).json({ error: 'Invalid mobile number' });

    const now  = new Date().toISOString();
    const item = await Booking.create({
      yajaman_name: yajaman_name.trim(), mobile: mobile.trim(),
      email: email || '', puja_type, puja_date,
      gotra: gotra || '', purpose: purpose || '', message: message || '',
      status: 'pending', admin_notes: '',
      created_at: now, updated_at: now,
    });
    res.status(201).json({ id: item._id.toString(), message: 'Booking received successfully' });
    sendBookingEmail(item).catch(err => console.error('Booking email failed:', err.message));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: all bookings with optional filter + pagination
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pg = parseInt(page, 10);
    const lm = parseInt(limit, 10);

    const filter = status ? { status } : {};
    const total    = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ created_at: -1 })
      .skip((pg - 1) * lm)
      .limit(lm);

    res.json({ bookings, total, page: pg, limit: lm });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: stats
router.get('/stats/summary', auth, async (_req, res) => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
    ]);
    res.json({ total, pending, confirmed, completed, cancelled });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update status / notes
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    if (status && !STATUSES.includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const updates = { updated_at: new Date().toISOString() };
    if (status      !== undefined) updates.status      = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const item = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ error: 'Booking not found' });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Booking.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
