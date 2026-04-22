const router = require('express').Router();
const { db, nextId } = require('../db');
const auth = require('../middleware/auth');

const MOBILE_RE = /^[+\d\s\-]{10,15}$/;
const STATUSES  = ['pending', 'confirmed', 'completed', 'cancelled'];

// Public: create booking
router.post('/', (req, res) => {
  const { yajaman_name, mobile, email, puja_type, puja_date, gotra, purpose, message } = req.body;
  if (!yajaman_name || !mobile || !puja_type || !puja_date)
    return res.status(400).json({ error: 'Name, mobile, puja type and date are required' });
  if (!MOBILE_RE.test(mobile))
    return res.status(400).json({ error: 'Invalid mobile number' });

  const now = new Date().toISOString();
  const item = {
    id: nextId('bookings'),
    yajaman_name: yajaman_name.trim(), mobile: mobile.trim(),
    email: email || '', puja_type, puja_date,
    gotra: gotra || '', purpose: purpose || '', message: message || '',
    status: 'pending', admin_notes: '',
    created_at: now, updated_at: now,
  };
  db.get('bookings').push(item).write();
  res.status(201).json({ id: item.id, message: 'Booking received successfully' });
});

// Admin: all bookings with optional filter + pagination
router.get('/', auth, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const pg = parseInt(page, 10); const lm = parseInt(limit, 10);

  let all = db.get('bookings').sortBy('created_at').reverse().value();
  if (status) all = all.filter(b => b.status === status);

  const total = all.length;
  const bookings = all.slice((pg - 1) * lm, pg * lm);
  res.json({ bookings, total, page: pg, limit: lm });
});

// Admin: stats
router.get('/stats/summary', auth, (_req, res) => {
  const all = db.get('bookings').value();
  const count = s => all.filter(b => b.status === s).length;
  res.json({ total: all.length, pending: count('pending'), confirmed: count('confirmed'), completed: count('completed'), cancelled: count('cancelled') });
});

// Admin: update status / notes
router.patch('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, admin_notes } = req.body;
  if (status && !STATUSES.includes(status))
    return res.status(400).json({ error: 'Invalid status' });

  const exists = db.get('bookings').find({ id }).value();
  if (!exists) return res.status(404).json({ error: 'Booking not found' });

  const updates = { updated_at: new Date().toISOString() };
  if (status !== undefined)      updates.status      = status;
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;

  db.get('bookings').find({ id }).assign(updates).write();
  res.json(db.get('bookings').find({ id }).value());
});

// Admin: delete
router.delete('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!db.get('bookings').find({ id }).value())
    return res.status(404).json({ error: 'Booking not found' });
  db.get('bookings').remove({ id }).write();
  res.json({ message: 'Deleted' });
});

module.exports = router;
