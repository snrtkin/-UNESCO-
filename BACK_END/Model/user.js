const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
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
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: 100,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: '',
    },
    tier: {
      type: String,
      required: [true, 'Membership tier is required'],
      enum: ['regular', 'corporate', 'supporting', 'student'],
    },
    organization: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    postal: {
      type: String,
      trim: true,
      maxlength: 20,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'memberships',
  }
);

membershipSchema.index({ email: 1, createdAt: -1 });
membershipSchema.index({ status: 1, createdAt: -1 });

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;
