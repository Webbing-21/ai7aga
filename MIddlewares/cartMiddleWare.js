const PlatformSettings = require('../models/platformSettings');

const checkCartOrderAvailability = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.findOne();
    if (!settings?.available && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Cart and ordering are not available right now it will available soon :)' });
    }
    next();
  } catch (err) {
    console.error('Availability check error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports = { checkCartOrderAvailability };
