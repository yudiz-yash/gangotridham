const router              = require('express').Router();
const { ContactMessage }  = require('../db');
const auth                = require('../middleware/auth');
const { sendContactEmail } = require('../utils/mailer');

const MOBILE_RE = /^[+\d\s\-]{10,15}$/;

// Public: submit
router.post('/', async (req, res) => {
  try {
    const { name, mobile, message } = req.body;
    if (!name || !mobile || !message)
      return res.status(400).json({ error: 'Name, mobile and message are required' });
    if (!MOBILE_RE.test(mobile))
      return res.status(400).json({ error: 'Invalid mobile number' });

    await ContactMessage.create({
      name: name.trim(), mobile: mobile.trim(), message: message.trim(),
      status: 'unread', created_at: new Date().toISOString(),
    });
    res.status(201).json({ message: 'Message sent successfully' });
    sendContactEmail(msg).catch(err => console.error('Contact email failed:', err.message));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: all
router.get('/', auth, async (_req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ created_at: -1 });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update status
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status || 'read' },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
