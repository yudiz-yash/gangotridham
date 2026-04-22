require('dotenv').config();
const low      = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const adapter = new FileSync(path.join(__dirname, 'gangotri.json'));
const db      = low(adapter);

/* ── Next ID helper ── */
function nextId(col) {
  const items = db.get(col).value();
  return items.length === 0 ? 1 : Math.max(...items.map(i => i.id)) + 1;
}

/* ── Defaults ── */
const now = new Date().toISOString();
db.defaults({
  users: [],
  events: [],
  bookings: [],
  contact_messages: [],
  kapat: {
    is_open: 0, open_date: null, close_date: null,
    announcement: 'श्री गंगोत्री धाम के कपाट अक्षय तृतीया (अप्रैल/मई 2025) को खुलेंगे — तिथि शीघ्र घोषित होगी',
    updated_at: now
  },
}).write();

/* ── Seed admin ── */
const adminEmail = process.env.ADMIN_EMAIL || 'admin@gangotridham.org';
const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@2025';
if (!db.get('users').find({ email: adminEmail }).value()) {
  db.get('users').push({
    id: 1, email: adminEmail, name: 'Admin',
    password: bcrypt.hashSync(adminPass, 12),
    created_at: now,
  }).write();
  console.log(`✅  Admin seeded: ${adminEmail} / ${adminPass}`);
}

/* ── Seed sample events ── */
if (db.get('events').size().value() === 0) {
  db.get('events').push(
    { id: 1, title: 'Gangotri Dham Kapat Udghatan', title_hindi: 'गंगोत्री धाम कपाट उद्घाटन', description: 'Opening of Gangotri Dham gates on Akshay Tritiya 2025', description_hindi: 'अक्षय तृतीया के पावन पर्व पर श्री गंगोत्री धाम के कपाट माँ गंगा के भक्तों के लिए खोले जाएंगे।', event_date: '2025-04-30', event_type: 'kapat', is_featured: 1, is_published: 1, created_at: now, updated_at: now },
    { id: 2, title: 'Ganga Dussehra Mahotsav', title_hindi: 'गंगा दशहरा महोत्सव', description: 'Grand celebration of Ganga Dussehra', description_hindi: 'गंगा दशहरा के अवसर पर विशेष पूजन, रुद्राभिषेक एवं गंगा आरती का भव्य आयोजन।', event_date: '2025-06-05', event_type: 'festival', is_featured: 0, is_published: 1, created_at: now, updated_at: now },
    { id: 3, title: 'Pashupatinath Jalabhishek Yatra', title_hindi: 'पशुपतिनाथ जलाभिषेक यात्रा', description: 'Annual Gangajal Yatra to Pashupatinath Temple', description_hindi: 'रावल जी महाराज 1100 लीटर गंगाजल लेकर काठमांडू जाएंगे।', event_date: '2025-11-01', event_type: 'yatra', is_featured: 0, is_published: 1, created_at: now, updated_at: now },
    { id: 4, title: 'Sheetkalin Kapat Band', title_hindi: 'शीतकालीन कपाट बंद', description: 'Closing of Gangotri Dham for winter', description_hindi: 'दीपावली के दूसरे दिन कपाट बंद।', event_date: '2025-10-23', event_type: 'kapat', is_featured: 0, is_published: 1, created_at: now, updated_at: now }
  ).write();
}

module.exports = { db, nextId };
