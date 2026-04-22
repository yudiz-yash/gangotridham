const router = require('express').Router();
const { db, nextId } = require('../db');
const auth = require('../middleware/auth');

// Public: published events sorted by date
router.get('/', (_req, res) => {
  const events = db.get('events')
    .filter(e => e.is_published === 1)
    .sortBy('event_date')
    .value();
  res.json(events);
});

// Admin: all events
router.get('/all', auth, (_req, res) => {
  res.json(db.get('events').sortBy('event_date').reverse().value());
});

// Admin: create
router.post('/', auth, (req, res) => {
  const { title, title_hindi, description, description_hindi, event_date, event_type, is_featured, is_published } = req.body;
  if (!title || !event_date)
    return res.status(400).json({ error: 'Title and event_date are required' });

  const now = new Date().toISOString();
  const item = {
    id: nextId('events'),
    title: title.trim(), title_hindi: title_hindi || '',
    description: description || '', description_hindi: description_hindi || '',
    event_date, event_type: event_type || 'event',
    is_featured: is_featured ? 1 : 0,
    is_published: is_published !== false ? 1 : 0,
    created_at: now, updated_at: now,
  };
  db.get('events').push(item).write();
  res.status(201).json(item);
});

// Admin: update
router.put('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, title_hindi, description, description_hindi, event_date, event_type, is_featured, is_published } = req.body;
  if (!title || !event_date)
    return res.status(400).json({ error: 'Title and event_date are required' });

  const exists = db.get('events').find({ id }).value();
  if (!exists) return res.status(404).json({ error: 'Event not found' });

  const updates = {
    title: title.trim(), title_hindi: title_hindi || '',
    description: description || '', description_hindi: description_hindi || '',
    event_date, event_type: event_type || 'event',
    is_featured: is_featured ? 1 : 0,
    is_published: is_published ? 1 : 0,
    updated_at: new Date().toISOString(),
  };
  db.get('events').find({ id }).assign(updates).write();
  res.json(db.get('events').find({ id }).value());
});

// Admin: delete
router.delete('/:id', auth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!db.get('events').find({ id }).value())
    return res.status(404).json({ error: 'Event not found' });
  db.get('events').remove({ id }).write();
  res.json({ message: 'Deleted' });
});

module.exports = router;
