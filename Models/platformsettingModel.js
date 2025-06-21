const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  available: {
    type: Boolean,
    default: true,
  }
});
module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
