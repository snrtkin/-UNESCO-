const express = require('express');
const crypto = require('crypto');

const router = express.Router();

function createToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    exp: Date.now() + 8 * 60 * 60 * 1000,
  })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const [payload, signature] = (token || '').split('.');
  if (!payload || !signature || !process.env.JWT_SECRET) return null;

  const expected = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(payload)
    .digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
    return res.status(500).json({ ok: false, message: 'Admin authentication is not configured' });
  }
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: 'Invalid username or password' });
  }
  res.json({ ok: true, token: createToken(username), username });
});

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ ok: false, message: 'Authentication required' });
  req.admin = user;
  next();
}

router.get('/status', (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = verifyToken(token);
  res.json({ ok: true, authenticated: Boolean(user), username: user?.username || null });
});

module.exports = { router, requireAdmin };
