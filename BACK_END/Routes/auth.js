const express = require('express');
const crypto = require('crypto');
const Membership = require('../Model/user');

const router = express.Router();

function derivePassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(key);
    });
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await derivePassword(password, salt);
  return `$scrypt$${salt}$${key.toString('hex')}`;
}

async function verifyPassword(password, encodedHash) {
  const parts = encodedHash.split('$');
  if (parts.length !== 4 || parts[1] !== 'scrypt' || !/^[a-f0-9]{32}$/i.test(parts[2]) || !/^[a-f0-9]{128}$/i.test(parts[3])) {
    return false;
  }

  const expected = Buffer.from(parts[3], 'hex');
  const actual = await derivePassword(password, parts[2]);
  return crypto.timingSafeEqual(actual, expected);
}

function createToken(username, claims = {}) {
  const payload = Buffer.from(JSON.stringify({
    username,
    ...claims,
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
  res.json({ ok: true, token: createToken(username, { role: 'admin' }), username });
});

router.post('/member-login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'メールアドレスとパスワードを入力してください。' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ ok: false, message: 'ログイン機能が設定されていません。' });
  }

  try {
    const memberships = await Membership.find({ email })
      .select('+passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    for (const membership of memberships) {
      if (!membership.passwordHash || !(await verifyPassword(password, membership.passwordHash))) continue;

      const membershipId = membership._id.toString();
      return res.json({
        ok: true,
        token: createToken(membershipId, { role: 'member', membershipId }),
        name: membership.name,
      });
    }

    return res.status(401).json({
      ok: false,
      message: 'メールアドレス、パスワード、または会員の承認状況をご確認ください。',
    });
  } catch (err) {
    console.error('POST /api/auth/member-login:', err);
    return res.status(500).json({ ok: false, message: 'ログインに失敗しました。時間をおいて再度お試しください。' });
  }
});

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') return res.status(401).json({ ok: false, message: 'Authentication required' });
  req.admin = user;
  next();
}

function requireMember(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = verifyToken(token);
  if (!user || user.role !== 'member' || !user.membershipId) {
    return res.status(401).json({ ok: false, message: 'Authentication required' });
  }
  req.member = user;
  next();
}

router.get('/status', (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const user = verifyToken(token);
  res.json({ ok: true, authenticated: Boolean(user), username: user?.username || null });
});

module.exports = { router, requireAdmin, requireMember, hashPassword };
