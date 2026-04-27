require('dotenv').config();
const mongoose = require('mongoose');
const fs       = require('fs');
const path     = require('path');
const { GalleryImage } = require('./db');

const GALLERY_DIR = path.join(__dirname, '../client/src/assets/gallery');

const IMAGES = [
  { file: 'gangotri-dham-01.jpeg', title: 'Gangotri Dham Temple',       title_hindi: 'गंगोत्री धाम मंदिर',       sort_order: 1 },
  { file: 'gangotri-dham-02.jpeg', title: 'Bhagirathi River',            title_hindi: 'भागीरथी नदी',               sort_order: 2 },
  { file: 'gangotri-dham-03.jpeg', title: 'Sacred Pilgrimage',           title_hindi: 'पावन तीर्थयात्रा',          sort_order: 3 },
  { file: 'gangotri-dham-04.jpeg', title: 'Temple Premises',             title_hindi: 'मंदिर परिसर',               sort_order: 4 },
  { file: 'gangotri-dham-05.jpeg', title: 'Himalayan Peaks',             title_hindi: 'हिमालय पर्वत',              sort_order: 5 },
  { file: 'gangotri-dham-06.jpeg', title: 'Ganga Aarti',                 title_hindi: 'गंगा आरती',                 sort_order: 6 },
  { file: 'gangotri-dham-07.jpeg', title: 'Devotees at Gangotri',        title_hindi: 'गंगोत्री में भक्तगण',       sort_order: 7 },
  { file: 'gangotri-dham-08.jpeg', title: 'Gangotri Scenic View',        title_hindi: 'गंगोत्री प्राकृतिक दृश्य', sort_order: 8 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅  MongoDB connected');

  const existing = await GalleryImage.countDocuments();
  if (existing > 0) {
    console.log(`ℹ️   Gallery already has ${existing} images — skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  const now = new Date().toISOString();
  let seeded = 0;

  for (const img of IMAGES) {
    const filePath = path.join(GALLERY_DIR, img.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️   File not found: ${img.file}`);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    await GalleryImage.create({
      title:       img.title,
      title_hindi: img.title_hindi,
      image:       base64,
      sort_order:  img.sort_order,
      is_published: 1,
      created_at: now,
      updated_at: now,
    });
    console.log(`   ✔  Seeded: ${img.file} (${(buffer.length / 1024).toFixed(0)} KB)`);
    seeded++;
  }

  console.log(`\n✅  ${seeded} gallery images seeded into MongoDB.\n`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌  Seed failed:', err.message); process.exit(1); });
