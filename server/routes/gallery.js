const router             = require('express').Router();
const { GalleryImage }   = require('../db');
const auth               = require('../middleware/auth');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

function validateBase64Image(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  const match = dataUrl.match(/^data:(image\/[a-z]+);base64,/);
  if (!match) return false;
  return ALLOWED_TYPES.includes(match[1]);
}

// Public: published images sorted by sort_order
router.get('/', async (_req, res) => {
  try {
    const images = await GalleryImage.find({ is_published: 1 }).sort({ sort_order: 1, created_at: 1 });
    res.json(images);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: all images
router.get('/all', auth, async (_req, res) => {
  try {
    const images = await GalleryImage.find().sort({ sort_order: 1, created_at: 1 });
    res.json(images);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: upload new image
router.post('/', auth, async (req, res) => {
  try {
    const { title, title_hindi, image, sort_order, is_published } = req.body;
    if (!image) return res.status(400).json({ error: 'Image data is required' });
    if (!validateBase64Image(image)) return res.status(400).json({ error: 'Invalid image format. Use JPEG, PNG or WEBP.' });

    const now  = new Date().toISOString();
    const item = await GalleryImage.create({
      title:        title        || '',
      title_hindi:  title_hindi  || '',
      image,
      sort_order:   sort_order != null ? Number(sort_order) : 0,
      is_published: is_published ? 1 : 0,
      created_at: now, updated_at: now,
    });
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: update caption / sort / published
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, title_hindi, sort_order, is_published, image } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (title        !== undefined) updates.title        = title;
    if (title_hindi  !== undefined) updates.title_hindi  = title_hindi;
    if (sort_order   !== undefined) updates.sort_order   = Number(sort_order);
    if (is_published !== undefined) updates.is_published = is_published ? 1 : 0;
    if (image        !== undefined) {
      if (!validateBase64Image(image)) return res.status(400).json({ error: 'Invalid image format.' });
      updates.image = image;
    }

    const item = await GalleryImage.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ error: 'Image not found' });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Image not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
