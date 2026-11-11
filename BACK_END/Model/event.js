const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    category: {
      type: String,
      enum: ['event', 'education', 'pr', 'other'],
      default: 'event',
    },
    eventDate: {
      type: Date,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'events',
  }
);

eventSchema.index({ eventDate: -1 });
eventSchema.index({ featured: 1, createdAt: -1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
