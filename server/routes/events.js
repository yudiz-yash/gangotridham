const router      = require('express').Router();
const { Event }   = require('../db');
const auth        = require('../middleware/auth');

// Public: published events sorted by date
router.get('/', async (_req, res) => {
  try {
    const events = await Event.find({ is_published: 1 }).sort({ event_date: 1 });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: all events
router.get('/all', auth, async (_req, res) => {
  try {
    const events = await Event.find().sort({ event_date: -1 });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: create
router.post('/', auth, async (req, res) => {
  try {
    const { title, title_hindi, description, description_hindi, event_date, event_type, is_featured, is_published } = req.body;
    if (!title || !event_date)
      return res.status(400).json({ error: 'Title and event_date are required' });

    const now  = new Date().toISOString();
    const item = await Event.create({
      title: title.trim(), title_hindi: title_hindi || '',
      description: description || '', description_hindi: description_hindi || '',
      event_date, event_type: event_type || 'event',
      is_featured:  is_featured  ? 1 : 0,
      is_published: is_published !== false ? 1 : 0,
      created_at: now, updated_at: now,
    });
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, title_hindi, description, description_hindi, event_date, event_type, is_featured, is_published } = req.body;
    if (!title || !event_date)
      return res.status(400).json({ error: 'Title and event_date are required' });

    const item = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(), title_hindi: title_hindi || '',
        description: description || '', description_hindi: description_hindi || '',
        event_date, event_type: event_type || 'event',
        is_featured:  is_featured  ? 1 : 0,
        is_published: is_published ? 1 : 0,
        updated_at: new Date().toISOString(),
      },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Event not found' });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Event.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
