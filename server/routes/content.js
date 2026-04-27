const router         = require('express').Router();
const { SiteContent } = require('../db');
const auth           = require('../middleware/auth');

// Public: all sections as { section: data } map
router.get('/', async (_req, res) => {
  try {
    const docs   = await SiteContent.find();
    const result = {};
    docs.forEach(d => { result[d.section] = d.data; });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public: single section
router.get('/:section', async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ section: req.params.section });
    if (!doc) return res.status(404).json({ error: 'Section not found' });
    res.json(doc.data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update a section (body IS the data)
router.put('/:section', auth, async (req, res) => {
  try {
    const doc = await SiteContent.findOneAndUpdate(
      { section: req.params.section },
      { data: req.body, updated_at: new Date().toISOString() },
      { new: true, upsert: true }
    );
    res.json(doc.data);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
