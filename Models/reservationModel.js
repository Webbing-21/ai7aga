const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const availableTimeSchema = new Schema({
  availableTime: { 
    type: String, 
    required: true, 
    match: /^([01]\d|2[0-3]):[0-5]\d$/
  },
  isAvailable: { type: Boolean, default: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true }
});

module.exports = mongoose.model('AvailableTime', availableTimeSchema);

const bookingSchema = new Schema({
  fullname: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
  phonenumber: { type: String, required: true, match: /^01[0125][0-9]{8}$/ },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  timeSlotId: { type: Schema.Types.ObjectId, ref: 'AvailableTime', required: true }, 
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });
function validateBooking(obj) {
  const bookingJoiSchema = joi.object({
    fullname: joi.string().min(3).max(50).required(),
    phonenumber: joi.string().pattern(/^01[0125][0-9]{8}$/).required(),
    userId: joi.string().required(),
    serviceId: joi.string().required(),
    timeSlotId: joi.string().required(),
    status: joi.string().valid('pending', 'confirmed', 'cancelled').default('pending')
    });
    
    return bookingJoiSchema.validate(obj);
    
}
function validateAvailableTime(obj) {
  const availableTimeJoiSchema = joi.object({
    availableTime: joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
    isAvailable: joi.boolean().default(true),
    serviceId: joi.string().required(),
    date: joi.date().required()
  });
  
  return availableTimeJoiSchema.validate(obj);
}
module.exports = {
  Booking: mongoose.model('Booking', bookingSchema),
    AvailableTime: mongoose.model('AvailableTime', availableTimeSchema),
  validateBooking,
    validateAvailableTime
};