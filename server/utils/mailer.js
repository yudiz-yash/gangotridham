const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const NOTIFY_TO = process.env.NOTIFY_EMAIL || 'hitendodiya1990@gmail.com';
const FROM      = `"श्री गंगोत्री धाम" <${process.env.SMTP_USER}>`;

function row(label, value) {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#5C5147;width:160px;white-space:nowrap;border-bottom:1px solid #EDE8E0;">${label}</td>
      <td style="padding:8px 12px;color:#1C1712;border-bottom:1px solid #EDE8E0;">${value}</td>
    </tr>`;
}

function wrap(title, badge, tableRows) {
  return `<!DOCTYPE html>
<html lang="hi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FDFBF7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#C5621E,#E07B39);padding:28px 32px;">
            <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">🕉️ श्री गंगोत्री धाम</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.80);margin-top:4px;">Admin Notification</div>
          </td>
        </tr>
        <!-- Badge + title -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <span style="background:#FBF0E6;color:#C5621E;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px;">${badge}</span>
            <h2 style="margin:12px 0 0;font-size:20px;color:#1C1712;">${title}</h2>
          </td>
        </tr>
        <!-- Table -->
        <tr>
          <td style="padding:16px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EDE8E0;border-radius:8px;overflow:hidden;">
              ${tableRows}
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F8F5F0;padding:16px 32px;text-align:center;color:#9A8E82;font-size:12px;border-top:1px solid #EDE8E0;">
            This is an automated notification from Gangotri Dham website.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendBookingEmail(booking) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const html = wrap(
    'New Puja Booking Received',
    'Puja Booking',
    row('यजमान नाम', booking.yajaman_name) +
    row('Mobile',     booking.mobile) +
    row('Email',      booking.email) +
    row('पूजा प्रकार', booking.puja_type) +
    row('पूजा तिथि',  booking.puja_date) +
    row('गोत्र',      booking.gotra) +
    row('उद्देश्य',   booking.purpose) +
    row('संदेश',      booking.message) +
    row('Submitted',  new Date(booking.created_at).toLocaleString('en-IN'))
  );
  await transporter.sendMail({
    from: FROM, to: NOTIFY_TO,
    subject: `New Puja Booking — ${booking.yajaman_name} (${booking.puja_type})`,
    html,
  });
}

async function sendContactEmail(contact) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  const html = wrap(
    'New Contact Message Received',
    'Contact Form',
    row('Name',      contact.name) +
    row('Mobile',    contact.mobile) +
    row('Message',   contact.message) +
    row('Received',  new Date(contact.created_at).toLocaleString('en-IN'))
  );
  await transporter.sendMail({
    from: FROM, to: NOTIFY_TO,
    subject: `New Contact Message — ${contact.name}`,
    html,
  });
}

module.exports = { sendBookingEmail, sendContactEmail };
