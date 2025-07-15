const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  duration: Number, // seconds
  distance: Number, // meters
  averageSpeed: Number,
  path: [
    {
      lat: Number,
      lng: Number,
      timestamp: Date
    }
  ]
});

module.exports = mongoose.model('Session', sessionSchema);
