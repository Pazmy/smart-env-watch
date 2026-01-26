const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }, // Optional: if frontend sends address
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  category: {
    type: String,
    enum: ['Sampah', 'Banjir', 'Jalan Rusak', 'Pohon Tumbang', 'Butuh Verifikasi'],
    default: 'Butuh Verifikasi',
  },
  aiAnalysis: {
    detected: { type: Boolean, default: false },
    class: { type: String },
    confidence: { type: Number },
    rawResult: { type: Object }, // Store full AI response for debugging
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', reportSchema);
