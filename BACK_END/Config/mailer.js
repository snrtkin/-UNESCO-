const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Email is not configured. Missing: ${missing.join(', ')}`);
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendApplicationConfirmation({ to, name, type }) {
  const applicationType = type === 'membership' ? '入会' : 'ボランティア';

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `岡山ユネスコ協会: ${applicationType}申込を受け付けました`,
    text: `${name || 'お申し込み者'} 様\n\n岡山ユネスコ協会です。\n${applicationType}のお申し込みを受け付けました。内容を確認のうえ、改めてご連絡いたします。\n\nこのメールは自動送信されています。`,
  });
}

module.exports = { sendApplicationConfirmation };