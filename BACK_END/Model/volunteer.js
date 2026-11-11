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
    address: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    activity: {
      type: String,
      required: [true, 'Preferred activity is required'],
      enum: ['event', 'education', 'pr', 'other'],
    },
    projectName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'active', 'completed', 'closed'],
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
