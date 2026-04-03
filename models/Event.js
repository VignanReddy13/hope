import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  confidenceScore: {
    type: Number,
    required: false,
  },
  imagePath: {
    type: String,
    required: false,
  }
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
