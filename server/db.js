require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const fs       = require('fs');
const path     = require('path');

const toJSON = {
  transform(_, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
};

/* ── Schemas ── */
const userSchema = new mongoose.Schema({
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:       { type: String, required: true },
  password:   { type: String, required: true },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { toJSON });

const eventSchema = new mongoose.Schema({
  title:             { type: String, required: true },
  title_hindi:       { type: String, default: '' },
  description:       { type: String, default: '' },
  description_hindi: { type: String, default: '' },
  event_date:        { type: String, required: true },
  event_type:        { type: String, default: 'event' },
  is_featured:       { type: Number, default: 0 },
  is_published:      { type: Number, default: 1 },
  created_at:        { type: String, default: () => new Date().toISOString() },
  updated_at:        { type: String, default: () => new Date().toISOString() },
}, { toJSON });

const bookingSchema = new mongoose.Schema({
  yajaman_name: { type: String, required: true },
  mobile:       { type: String, required: true },
  email:        { type: String, default: '' },
  puja_type:    { type: String, required: true },
  puja_date:    { type: String, required: true },
  gotra:        { type: String, default: '' },
  purpose:      { type: String, default: '' },
  message:      { type: String, default: '' },
  status:       { type: String, default: 'pending' },
  admin_notes:  { type: String, default: '' },
  created_at:   { type: String, default: () => new Date().toISOString() },
  updated_at:   { type: String, default: () => new Date().toISOString() },
}, { toJSON });

const contactSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  mobile:     { type: String, required: true },
  message:    { type: String, required: true },
  status:     { type: String, default: 'unread' },
  created_at: { type: String, default: () => new Date().toISOString() },
}, { toJSON });

const kapatSchema = new mongoose.Schema({
  is_open:      { type: Number, default: 0 },
  open_date:    { type: String, default: null },
  close_date:   { type: String, default: null },
  announcement: { type: String, default: '' },
  updated_at:   { type: String, default: () => new Date().toISOString() },
}, { toJSON });

const siteContentSchema = new mongoose.Schema({
  section:    { type: String, required: true, unique: true },
  data:       { type: mongoose.Schema.Types.Mixed, default: {} },
  updated_at: { type: String, default: () => new Date().toISOString() },
}, { toJSON });

const gallerySchema = new mongoose.Schema({
  title:        { type: String, default: '' },
  title_hindi:  { type: String, default: '' },
  image:        { type: String, required: true }, // base64 data URL
  sort_order:   { type: Number, default: 0 },
  is_published: { type: Number, default: 1 },
  created_at:   { type: String, default: () => new Date().toISOString() },
  updated_at:   { type: String, default: () => new Date().toISOString() },
}, { toJSON });

/* ── Models ── */
const User           = mongoose.model('User',           userSchema);
const Event          = mongoose.model('Event',          eventSchema);
const Booking        = mongoose.model('Booking',        bookingSchema);
const ContactMessage = mongoose.model('ContactMessage', contactSchema);
const Kapat          = mongoose.model('Kapat',          kapatSchema);
const SiteContent    = mongoose.model('SiteContent',    siteContentSchema);
const GalleryImage   = mongoose.model('GalleryImage',   gallerySchema);

/* ── Seed ── */
async function seedData() {
  const now        = new Date().toISOString();
  const adminEmail = process.env.ADMIN_EMAIL    || 'admin@gangotridham.org';
  const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@2025';

  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      email: adminEmail, name: 'Admin',
      password: bcrypt.hashSync(adminPass, 12),
      created_at: now,
    });
    console.log(`✅  Admin seeded: ${adminEmail} / ${adminPass}`);
  }

  if (!(await Kapat.findOne())) {
    await Kapat.create({
      is_open: 0, open_date: null, close_date: null,
      announcement: 'श्री गंगोत्री धाम के कपाट अक्षय तृतीया (अप्रैल/मई 2025) को खुलेंगे — तिथि शीघ्र घोषित होगी',
      updated_at: now,
    });
  }

  // Seed site content sections
  const contentSections = ['about', 'info_chips', 'nearby', 'rawal'];
  const existingSections = await SiteContent.distinct('section');
  const missingSections  = contentSections.filter(s => !existingSections.includes(s));

  if (missingSections.length > 0) {
    // Read rawal photo if available
    let rawalPhoto = '';
    try {
      const photoPath = path.join(__dirname, '../client/src/assets/shivprakashji.jpeg');
      if (fs.existsSync(photoPath)) {
        rawalPhoto = `data:image/jpeg;base64,${fs.readFileSync(photoPath).toString('base64')}`;
      }
    } catch {}

    const defaults = {
      about: {
        paragraphs: [
          'उत्तराखंड के जनपद उत्तरकाशी में समुद्रतल से 3140 मीटर की ऊँचाई और जिला मुख्यालय उत्तरकाशी से 100 किमी की दूरी पर स्थित गंगोत्री हिन्दुओं का पवित्र तीर्थ क्षेत्र है।',
          'उत्तराखंड के चार धामों में से एक गंगोत्री धाम, गंगा \'उतरी\' से बना है — वह जगह जहाँ गंगा उतरीं। पुराणों के अनुसार यहीं पर राजा भागीरथ ने एक शिला पर बैठकर 5500 वर्षों तक तपस्या की थी।',
          'गंगोत्री मंदिर के कपाट अक्षय तृतीया के पावन पर्व पर खुलते हैं और दीपावली के दूसरे दिन शीतकाल के लिए बंद कर दिए जाते हैं। देवी गंगा की प्रतिमा हर्षिल के निकट \'मुखबा\' गाँव में लाकर रख दी जाती है।',
          'गंगोत्री मंदिर का निर्माण 18वीं शताब्दी में गोरखा सेनापति अमर सिंह थापा ने प्रारंभ करवाया, जिसे जयपुर नरेश ने पूरा करवाया।',
        ],
      },
      info_chips: {
        chips: [
          { icon: '⛰️', val: '3140m',       lbl: 'समुद्रतल से ऊँचाई' },
          { icon: '🛣️', val: '100 km',      lbl: 'उत्तरकाशी से दूरी' },
          { icon: '🔔', val: 'अक्षय तृतीया', lbl: 'कपाट खुलने का पर्व' },
          { icon: '🥾', val: '18 km',        lbl: 'गोमुख ट्रेकिंग' },
        ],
      },
      nearby: {
        places: ['🏔️ हर्षिल', '🏔️ गोमुख', '🌿 दयारा बुग्याल', '🏞️ डोडीताल', '🗺️ नेलांग घाटी', '🛕 मुखबा गाँव', '⛺ केदार ताल', '🌊 भागीरथी'],
      },
      rawal: {
        name:  'परम पूज्य शिवप्रकाश जी महाराज',
        title: 'रावल — श्री गंगोत्री धाम',
        photo: rawalPhoto,
        bio_cards: [
          { h: 'जन्म एवं शिक्षा',       p: 'श्री गंगोत्री धाम के रावल परम पूज्य शिवप्रकाश जी महाराज का जन्म 15 नवंबर 1975 को उत्तराखंड राज्य के उत्तरकाशी जिले में हुआ था। 11 साल की बाल्यावस्था में ही घर परिवार का त्याग कर विभिन्न आश्रमों में रहकर वेद, उपनिषद, पुराण, संस्कृत और कर्मकांड शिक्षा ली।' },
          { h: 'पद एवं परंपरा',          p: 'रावल — गंगोत्री धाम के मुख्य पुजारी को "रावल" कहा जाता है। यह पद वंशानुगत/परंपरागत है और रावल ही मंदिर की पूजा-पद्धति, कपाट खुलने-बंद होने व धार्मिक परंपराओं के प्रमुख होते हैं।' },
          { h: 'पशुपतिनाथ जलाभिषेक',    p: 'अनादि काल से चली आ रही परंपरा के तहत गंगोत्री धाम के कपाट शीतकाल में बंद होने के बाद रावल जी गंगोत्री से गंगाजल का कलश लेकर नेपाल स्थित पशुपतिनाथ मंदिर जाते हैं और वहाँ भगवान शिव का जलाभिषेक करते हैं। हर वर्ष लगभग 1100 लीटर गंगाजल लेकर हरिद्वार, मुरादाबाद, बरेली होते हुए काठमांडू जाते हैं।' },
          { h: 'सामाजिक विचार',          p: 'युवाओं को पाश्चात्य संस्कृति छोड़कर ऋषि परंपराओं का अनुसरण करना चाहिए। गंगा, गाय और भारतीय संस्कृति के संरक्षण पर विशेष जोर।' },
          { h: 'हाल की गतिविधियाँ',      p: '26 अक्टूबर 2024 को गंगोत्री से 1100 लीटर गंगाजल लेकर हरिद्वार पहुँचे। नवंबर 2024 में मुरादाबाद में धर्म-संस्कृति पर वार्ता। बरेली में "माँ गंगा बचाओ वेलफेयर सोसाइटी" ने सम्मानित किया।' },
        ],
      },
    };

    for (const section of missingSections) {
      await SiteContent.create({ section, data: defaults[section], updated_at: now });
      console.log(`✅  Seeded content section: ${section}`);
    }
  }

  if ((await Event.countDocuments()) === 0) {
    await Event.insertMany([
      { title: 'Gangotri Dham Kapat Udghatan',     title_hindi: 'गंगोत्री धाम कपाट उद्घाटन',      description: 'Opening of Gangotri Dham gates on Akshay Tritiya 2025',        description_hindi: 'अक्षय तृतीया के पावन पर्व पर श्री गंगोत्री धाम के कपाट माँ गंगा के भक्तों के लिए खोले जाएंगे।', event_date: '2025-04-30', event_type: 'kapat',   is_featured: 1, is_published: 1, created_at: now, updated_at: now },
      { title: 'Ganga Dussehra Mahotsav',           title_hindi: 'गंगा दशहरा महोत्सव',             description: 'Grand celebration of Ganga Dussehra',                          description_hindi: 'गंगा दशहरा के अवसर पर विशेष पूजन, रुद्राभिषेक एवं गंगा आरती का भव्य आयोजन।',               event_date: '2025-06-05', event_type: 'festival', is_featured: 0, is_published: 1, created_at: now, updated_at: now },
      { title: 'Pashupatinath Jalabhishek Yatra',   title_hindi: 'पशुपतिनाथ जलाभिषेक यात्रा',    description: 'Annual Gangajal Yatra to Pashupatinath Temple',                 description_hindi: 'रावल जी महाराज 1100 लीटर गंगाजल लेकर काठमांडू जाएंगे।',                                       event_date: '2025-11-01', event_type: 'yatra',   is_featured: 0, is_published: 1, created_at: now, updated_at: now },
      { title: 'Sheetkalin Kapat Band',              title_hindi: 'शीतकालीन कपाट बंद',             description: 'Closing of Gangotri Dham for winter',                          description_hindi: 'दीपावली के दूसरे दिन कपाट बंद।',                                                               event_date: '2025-10-23', event_type: 'kapat',   is_featured: 0, is_published: 1, created_at: now, updated_at: now },
    ]);
  }
}

/* ── Connect ── */
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅  MongoDB connected');
  await seedData();
}

module.exports = { connectDB, User, Event, Booking, ContactMessage, Kapat, GalleryImage, SiteContent };
