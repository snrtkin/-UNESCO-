const express = require('express');
const Membership = require('../Model/user');
const Volunteer = require('../Model/volunteer');
const { sendApplicationConfirmation } = require('../Config/mailer');
const { requireAdmin } = require('./auth');

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

    let emailSent = false;
    let emailError = null;
    try {
      await sendApplicationConfirmation({ to: application.email, name: application.name, type: 'membership' });
      emailSent = true;
    } catch (err) {
      emailError = err.message;
      console.error('Membership confirmation email:', err.message);
    }

    res.status(201).json({
      ok: true,
      message: 'Membership application received',
      id: application._id,
      emailSent,
      emailError,
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

    let emailSent = false;
    let emailError = null;
    try {
      await sendApplicationConfirmation({ to: application.email, name: application.name, type: 'volunteer' });
      emailSent = true;
    } catch (err) {
      emailError = err.message;
      console.error('Volunteer confirmation email:', err.message);
    }

    res.status(201).json({
      ok: true,
      message: 'Volunteer application received',
      id: application._id,
      emailSent,
      emailError,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ ok: false, errors: formatValidationError(err) });
    }
    console.error('POST /api/volunteer:', err);
    res.status(500).json({ ok: false, message: 'Failed to save volunteer application' });
  }
});

router.use(requireAdmin);

router.patch('/membership/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ ok: false, message: 'Invalid membership status' });
  }

  try {
    const application = await Membership.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ ok: false, message: 'Membership application not found' });
    res.json({ ok: true, data: application });
  } catch (err) {
    res.status(400).json({ ok: false, message: 'Failed to update membership status' });
  }
});

router.patch('/volunteer/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'active', 'closed'].includes(status)) {
    return res.status(400).json({ ok: false, message: 'Invalid volunteer status' });
  }

  try {
    const application = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ ok: false, message: 'Volunteer application not found' });
    res.json({ ok: true, data: application });
  } catch (err) {
    res.status(400).json({ ok: false, message: 'Failed to update volunteer status' });
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
