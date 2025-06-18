const mongoose = require('mongoose');
const ocrImageSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    },
  filename: String,
  contentType: String,
  image: Buffer,
  text: String,
}, { timestamps: true });

module.exports = mongoose.model('OCRImage', ocrImageSchema);