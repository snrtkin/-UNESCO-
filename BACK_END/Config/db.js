const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB once and reuse the Mongoose client for the process lifetime.
 * Default pool settings suit a small long-running API; tune only if you observe pool exhaustion.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and add your connection string.');
  }

  if (isConnected) {
    return mongoose.connection;
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('MongoDB disconnected');
  });

  await mongoose.connect(uri);
  isConnected = true;

  return mongoose.connection;
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}

module.exports = { connectDB, disconnectDB };
