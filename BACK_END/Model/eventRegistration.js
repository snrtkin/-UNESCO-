const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    memberName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    memberEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    eventTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    eventDate: {
      type: Date,
    },
    attendanceStatus: {
      type: String,
      enum: ['registered', 'attended'],
      default: 'registered',
    },
  },
  {
    timestamps: true,
    collection: 'event_registrations',
  }
);

eventRegistrationSchema.index({ member: 1, event: 1 }, { unique: true });
eventRegistrationSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
