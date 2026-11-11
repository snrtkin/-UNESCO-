const express = require('express');
const mongoose = require('mongoose');
const Membership = require('../Model/user');
const Volunteer = require('../Model/volunteer');
const Event = require('../Model/event');
const EventRegistration = require('../Model/eventRegistration');
const { sendApplicationConfirmation } = require('../Config/mailer');
const { requireAdmin, requireMember, hashPassword } = require('./auth');

const router = express.Router();

const membershipFees = {
  regular: 5000,
  supporting: 10000,
  student: 2000,
};

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

router.patch('/membership/:id/payment-status', requireAdmin, async (req, res) => {
  const { paymentStatus } = req.body;
  if (!['pending', 'paid'].includes(paymentStatus)) {
    return res.status(400).json({ ok: false, message: 'Invalid membership payment status' });
  }

  try {
    const application = await Membership.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ ok: false, message: 'Membership application not found' });
    res.json({ ok: true, data: application });
  } catch (err) {
    console.error('PATCH /api/membership/:id/payment-status:', err);
    res.status(400).json({ ok: false, message: 'Failed to update membership payment status' });
  }
});

router.post('/membership', async (req, res) => {
  try {
    const { name, email, phone, tier, organization, country, postal, address, message, password } = req.body || {};
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ ok: false, errors: ['ログイン用パスワードは8文字以上128文字以内で入力してください。'] });
    }
    if (!Object.hasOwn(membershipFees, tier)) {
      return res.status(400).json({ ok: false, errors: ['会員種別を選択してください。'] });
    }
    if (typeof country !== 'string' || !country.trim() || country.trim().length > 100) {
      return res.status(400).json({ ok: false, errors: ['国・地域を100文字以内で入力してください。'] });
    }

    const application = await Membership.create({
      name,
      email,
      phone,
      tier,
      organization,
      country,
      postal,
      address,
      message,
      passwordHash: await hashPassword(password),
    });

    let emailSent = false;
    let emailError = null;
    try {
      const tierPaymentUrl = process.env[`MEMBERSHIP_PAYMENT_URL_${application.tier.toUpperCase()}`];
      await sendApplicationConfirmation({
        to: application.email,
        name: application.name,
        type: 'membership',
        amount: membershipFees[application.tier],
        paymentUrl: tierPaymentUrl || process.env.MEMBERSHIP_PAYMENT_URL,
      });
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
    const { name, email, phone, address, activity, projectName } = req.body;

    const application = await Volunteer.create({
      name,
      email,
      phone,
      address,
      activity,
      projectName,
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

router.post('/events/:eventId/registrations', requireMember, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.eventId)) {
    return res.status(400).json({ ok: false, message: 'イベントを確認できませんでした。' });
  }

  try {
    const membership = await Membership.findById(req.member.membershipId)
      .select('name email status paymentStatus')
      .lean();
    if (!membership) return res.status(404).json({ ok: false, message: '会員情報が見つかりません。' });
    if (membership.status !== 'approved' || membership.paymentStatus !== 'paid') {
      return res.status(403).json({ ok: false, message: '承認済みで会費のお支払いが確認できた会員のみ申し込めます。' });
    }

    const event = await Event.findById(req.params.eventId).select('title eventDate').lean();
    if (!event) return res.status(404).json({ ok: false, message: 'イベントが見つかりません。' });

    const existingRegistration = await EventRegistration.findOne({
      member: membership._id,
      event: event._id,
    }).lean();
    if (existingRegistration) {
      return res.json({ ok: true, data: existingRegistration, alreadyRegistered: true });
    }

    const registration = await EventRegistration.create({
      member: membership._id,
      event: event._id,
      memberName: membership.name,
      memberEmail: membership.email,
      eventTitle: event.title,
      eventDate: event.eventDate,
    });
    return res.status(201).json({ ok: true, data: registration });
  } catch (err) {
    if (err.code === 11000) {
      try {
        const registration = await EventRegistration.findOne({
          member: req.member.membershipId,
          event: req.params.eventId,
        }).lean();
        if (registration) return res.json({ ok: true, data: registration, alreadyRegistered: true });
      } catch (lookupErr) {
        console.error('GET existing event registration:', lookupErr);
      }
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ ok: false, errors: formatValidationError(err) });
    }
    console.error('POST /api/events/:eventId/registrations:', err);
    return res.status(500).json({ ok: false, message: 'イベントの申し込みに失敗しました。' });
  }
});

router.get('/member/dashboard', requireMember, async (req, res) => {
  try {
    const membership = await Membership.findById(req.member.membershipId)
      .select('name email tier status paymentStatus country createdAt')
      .lean();

    if (!membership) return res.status(404).json({ ok: false, message: '会員情報が見つかりません。' });

    const volunteerHistory = await Volunteer.find({ email: membership.email })
      .sort({ createdAt: -1 })
      .select('activity projectName status createdAt')
      .limit(100)
      .lean();

    const eventHistory = await EventRegistration.find({ member: membership._id })
      .sort({ createdAt: -1 })
      .select('event eventTitle eventDate attendanceStatus createdAt')
      .limit(100)
      .lean();

    res.json({
      ok: true,
      data: {
        member: {
          name: membership.name,
          tier: membership.tier,
          status: membership.status,
          paymentStatus: membership.paymentStatus || 'pending',
          country: membership.country || '',
          memberSince: membership.createdAt,
        },
        volunteerHistory,
        eventHistory,
      },
    });
  } catch (err) {
    console.error('GET /api/member/dashboard:', err);
    res.status(500).json({ ok: false, message: 'マイページ情報を取得できませんでした。' });
  }
});

router.use(requireAdmin);

router.get('/event-registrations', async (_req, res) => {
  try {
    const registrations = await EventRegistration.find()
      .sort({ createdAt: -1 })
      .select('-__v')
      .limit(500)
      .lean();

    res.json({ ok: true, count: registrations.length, data: registrations });
  } catch (err) {
    console.error('GET /api/event-registrations:', err);
    res.status(500).json({ ok: false, message: 'イベント申し込みを取得できませんでした。' });
  }
});

router.patch('/event-registrations/:id/attendance', async (req, res) => {
  const { attendanceStatus } = req.body || {};
  if (!['registered', 'attended'].includes(attendanceStatus)) {
    return res.status(400).json({ ok: false, message: '出欠状況が正しくありません。' });
  }

  try {
    const registration = await EventRegistration.findByIdAndUpdate(
      req.params.id,
      { attendanceStatus },
      { new: true, runValidators: true }
    );
    if (!registration) return res.status(404).json({ ok: false, message: '申し込みが見つかりません。' });
    res.json({ ok: true, data: registration });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ ok: false, message: '申し込みを確認できませんでした。' });
    }
    console.error('PATCH /api/event-registrations/:id/attendance:', err);
    res.status(500).json({ ok: false, message: '出欠状況を更新できませんでした。' });
  }
});

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
  if (!['pending', 'active', 'completed', 'closed'].includes(status)) {
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
