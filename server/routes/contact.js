const router = require('express').Router();
const { db, nextId } = require('../db');
const auth   = require('../middleware/auth');

const MOBILE_RE = /^[+\d\s\-]{10,15}$/;

// Public: submit
router.post('/', (req, res) => {
  const { name, mobile, message } = req.body;
  if (!name || !mobile || !message)
    return res.status(400).json({ error: 'Name, mobile and message are required' });
  if (!MOBILE_RE.test(mobile))
    return res.status(400).json({ error: 'Invalid mobile number' });

  db.get('contact_messages').push({
    id: nextId('contact_messages'),
    name: name.trim(), mobile: mobile.trim(), message: message.trim(),
    status: 'unread', created_at: new Date().toISOString(),
  }).write();
  res.status(201).json({ message: 'Message sent successfully' });
});

// Admin: all
router.get('/', auth, (_req, res) => {
  res.json(db.get('contact_messages').sortBy('created_at').reverse().value());
});

// Admin: update status
router.patch('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.get('contact_messages').find({ id }).assign({ status: req.body.status || 'read' }).write();
  res.json({ message: 'Updated' });
});

// Admin: delete
router.delete('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!db.get('contact_messages').find({ id }).value())
    return res.status(404).json({ error: 'Not found' });
  db.get('contact_messages').remove({ id }).write();
  res.json({ message: 'Deleted' });
});

module.exports = router;
