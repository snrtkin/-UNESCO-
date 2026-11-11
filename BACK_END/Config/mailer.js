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

async function sendApplicationConfirmation({ to, name, type, amount, paymentUrl }) {
  const applicationType = type === 'membership' ? '入会' : 'ボランティア';
  const membershipPaymentDetails = type === 'membership'
    ? `\n会費: ¥${amount.toLocaleString('ja-JP')}（年額）\n${paymentUrl
      ? `お支払いリンク: ${paymentUrl}`
      : 'お支払いリンクは準備中です。事務局から改めてご案内します。'}\nお支払い確認と事務局の承認後、会員登録が完了します。\n`
    : '';

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `岡山ユネスコ協会: ${applicationType}申込を受け付けました`,
    text: `${name || 'お申し込み者'} 様\n\n岡山ユネスコ協会です。\n${applicationType}のお申し込みを受け付けました。${membershipPaymentDetails}\nこのメールは自動送信されています。`,
  });
}

module.exports = { sendApplicationConfirmation };