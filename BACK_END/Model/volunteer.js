const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: '',
    },
    activity: {
      type: String,
      required: [true, 'Preferred activity is required'],
      enum: ['event', 'education', 'pr', 'other'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'active', 'closed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'volunteers',
  }
);

volunteerSchema.index({ email: 1, createdAt: -1 });
volunteerSchema.index({ status: 1, createdAt: -1 });

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer;
