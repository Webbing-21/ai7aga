const { Booking, validateBooking } = require('../Models/reservationModel');
const asyncHandler = require('express-async-handler');
const { Code } = require('../Models/codeModel');
const { Service } = require('../Models/serviceModel');
module.exports.createBooking = asyncHandler(async (req, res) => {
  try {
    const { userId, serviceId, name, phone, date, time, code } = req.body;

    // تحقق من صحة البيانات
    const { error } = validateBooking(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // تحقق من كود الخصم
    const checkCode = await Code.findOne({ code });
    if (!checkCode) {
      return res.status(404).json({ message: "Code not found" });
    }
    const service = await Service.findById(serviceId);
    if(!service){
      return res.status(404).json({message: "Service not found"});
    }
    

    // احسب القيمة الإجمالية بناءً على العرض والعدد
    const total = (checkCode.offer / 100) * service.price;

    // إنشاء الحجز
    const newBooking = new Booking({
      userId,
      serviceId,
      name,
      phone,
      date,
      time,
      code,
      total
    });

    await newBooking.save();

    res.status(201).json({ message: "Booking created successfully", booking: newBooking });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

