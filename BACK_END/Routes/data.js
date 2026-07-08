const express = require('express');
const Membership = require('../Model/user');
const Volunteer = require('../Model/volunteer');

const router = express.Router();

function formatValidationError(err) {
  const messages = Object.values(err.errors || {}).map((e) => e.message);
  return messages.length ? messages : [err.message];
}

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'okayama-unesco-api',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

router.post('/membership', async (req, res) => {
  try {
    const { name, email, phone, tier, message } = req.body;

    const application = await Membership.create({
      name,
      email,
      phone,
      tier,
      message,
    });

    res.status(201).json({
      ok: true,
      message: 'Membership application received',
      id: application._id,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ ok: false, errors: formatValidationError(err) });
    }
    console.error('POST /api/membership:', err);
    res.status(500).json({ ok: false, message: 'Failed to save membership application' });
  }
});

router.post('/volunteer', async (req, res) => {
  try {
    const { name, email, phone, activity, message } = req.body;

    const application = await Volunteer.create({
      name,
      email,
      phone,
      activity,
      message,
    });

    res.status(201).json({
      ok: true,
      message: 'Volunteer application received',
      id: application._id,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ ok: false, errors: formatValidationError(err) });
    }
    console.error('POST /api/volunteer:', err);
    res.status(500).json({ ok: false, message: 'Failed to save volunteer application' });
  }
});

router.get('/membership', async (_req, res) => {
  try {
    const applications = await Membership.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .limit(100)
      .lean();

    res.json({ ok: true, count: applications.length, data: applications });
  } catch (err) {
    console.error('GET /api/membership:', err);
    res.status(500).json({ ok: false, message: 'Failed to fetch membership applications' });
  }
});

router.get('/volunteer', async (_req, res) => {
  try {
    const applications = await Volunteer.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .limit(100)
      .lean();

    res.json({ ok: true, count: applications.length, data: applications });
  } catch (err) {
    console.error('GET /api/volunteer:', err);
    res.status(500).json({ ok: false, message: 'Failed to fetch volunteer applications' });
  }
});

module.exports = router;
