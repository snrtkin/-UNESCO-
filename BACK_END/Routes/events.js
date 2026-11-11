const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Event = require('../Model/event');
const { requireAdmin } = require('./auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error('Unsupported image type'));
      return;
    }
    cb(null, true);
  },
});

function formatValidationError(err) {
  const messages = Object.values(err.errors || {}).map((e) => e.message);
  return messages.length ? messages : [err.message];
}

router.get('/events', async (_req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: -1, createdAt: -1 }).select('-__v').lean();
    res.json({ ok: true, count: events.length, data: events });
  } catch (err) {
    console.error('GET /api/events:', err);
    res.status(500).json({ ok: false, message: 'Failed to fetch events' });
  }
});

router.post('/events', requireAdmin, (req, res) => {
  upload.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ ok: false, message: uploadErr.message });
    }

    try {
      const { title, description, category, eventDate, featured } = req.body;

      const event = await Event.create({
        title,
        description,
        category,
        eventDate: eventDate || undefined,
        featured: featured === 'true' || featured === true,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
      });

      res.status(201).json({ ok: true, message: 'Event created', data: event });
    } catch (err) {
      if (req.file) {
        fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
      }
      if (err.name === 'ValidationError') {
        return res.status(400).json({ ok: false, errors: formatValidationError(err) });
      }
      console.error('POST /api/events:', err);
      res.status(500).json({ ok: false, message: 'Failed to create event' });
    }
  });
});

router.delete('/events/:id', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ ok: false, message: 'Event not found' });

    if (event.imageUrl) {
      const filePath = path.join(uploadsDir, path.basename(event.imageUrl));
      fs.unlink(filePath, () => {});
    }

    res.json({ ok: true, message: 'Event deleted' });
  } catch (err) {
    console.error('DELETE /api/events/:id:', err);
    res.status(500).json({ ok: false, message: 'Failed to delete event' });
  }
});

module.exports = router;
