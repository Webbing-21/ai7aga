const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  serviceId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Service',
    required:true
  },
  fullname:{
    type:String,
    required:true,
    minlength:3,
    maxlength:50
  },
  phone:{
    type:Number,
    required:true,
    match:  /^01[0125][0-9]{8}$/, // Adjust regex for phone number validation
  },
  date:{
    type:Date,
    required:true
  },
  time:{
    type:String,
    required:true
  },
 code:{
  type:String,
  
 },
total:{
  type:Number,
  required:true
}, 
})
const Booking = mongoose.model('Booking',BookingSchema);

function validateBooking(obj){
  const bookingJoiSchema = joi.object({
    userId:joi.string().required(),
    serviceId:joi.string().required(),
    name:joi.string().required(),
    phone:joi.number().required(),
    date:joi.date().required(),
    time:joi.string().required(),
  })
  return bookingJoiSchema.validate(obj);
}
module.exports = {
  Booking,
  validateBooking
}