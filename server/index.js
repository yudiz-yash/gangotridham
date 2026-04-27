require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./db');

const app = express();

/* ── Security ── */
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use('/api/gallery', express.json({ limit: '15mb' })); // base64 images
app.use('/api/content', express.json({ limit: '5mb' }));  // rawal photo base64
app.use(express.json({ limit: '10kb' }));

/* ── Rate limiting ── */
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false }));
app.use('/api/bookings', rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, skip: req => req.method !== 'POST' }));

/* ── Routes ── */
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/events',   require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/kapat',    require('./routes/kapat'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/gallery',  require('./routes/gallery'));
app.use('/api/content',  require('./routes/content'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

/* ── 404 ── */
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

/* ── Global error handler ── */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n✅  Gangotri Dham API running on http://localhost:${PORT}`);
      console.log(`   Admin login: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}\n`);
    });
  })
  .catch(err => {
    console.error('❌  Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
