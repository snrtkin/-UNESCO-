require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./Config/db');
const dataRoutes = require('./Routes/data');
const authRoutes = require('./Routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5500')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);

app.use(express.json({ limit: '32kb' }));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    message: 'Okayama UNESCO API',
    endpoints: {
      health: '/api/health',
      membership: 'POST /api/membership',
      volunteer: 'POST /api/volunteer',
    },
  });
});

app.use('/api', dataRoutes);
app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Not found' });
});

app.use((err, _req, res, _next) => {
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ ok: false, message: err.message });
  }
  console.error(err);
  res.status(500).json({ ok: false, message: 'Internal server error' });
});

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
