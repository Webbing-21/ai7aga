const { UserModel, validateRegister } = require("../Models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../config/sendSMS");

// دالة مساعدة للتحقق من صحة كود OTP
const isOTPValid = (user, otp) => {
  return (
    user.otp &&
    user.otp.code === otp &&
    user.otp.expiresAt &&
    user.otp.expiresAt > new Date()
  );
};

// إرسال كود التسجيل
module.exports.sendRegisterCode = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!/^01[0125][0-9]{8}$/.test(phone)) {
    return res.status(400).json({ message: "رقم الهاتف غير صالح" });
  }

  const userExist = await UserModel.findOne({ phone });
  if (userExist) return res.status(400).json({ message: "الرقم مستخدم بالفعل" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = {
    code: otpCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };

  const user = new UserModel({ phone, otp });
  await user.save();

  await sendOTP(`+2${phone}`, otpCode);
  res.status(200).json({ message: "تم إرسال كود التفعيل" });
});

// التحقق من كود التفعيل للتسجيل
module.exports.verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const user = await UserModel.findOne({ phone });

  if (!user) return res.status(404).json({ message: "رقم غير مسجل" });
  if (user.isVerified) return res.status(400).json({ message: "تم التحقق مسبقًا" });

  if (!isOTPValid(user, otp)) {
    return res.status(400).json({ message: "كود التفعيل غير صحيح أو منتهي الصلاحية" });
  }

  user.isVerified = true;
  user.otp = { code: null, expiresAt: null };
  await user.save();

  res.status(200).json({ message: "تم التحقق بنجاح، يمكنك متابعة التسجيل" });
});

// إكمال التسجيل بعد التحقق
module.exports.completeRegister = asyncHandler(async (req, res) => {
  const { phone, name, email, password, company, CompanyCode, jobTitle, location, userId } = req.body;

  const user = await UserModel.findOne({ phone });
  if (!user || !user.isVerified) return res.status(400).json({ message: "يرجى التحقق من الهاتف أولًا" });
  if (user.password) return res.status(400).json({ message: "تم تسجيل الحساب مسبقًا" });

  const hashedPassword = await bcrypt.hash(password, 10);

  user.name = name;
  user.email = email;
  user.password = hashedPassword;
  user.company = company;
  user.CompanyCode = CompanyCode;
  user.jobTitle = jobTitle;
  user.location = location;
  user.userId = userId;

  await user.save();
  res.status(201).json({ message: "تم إكمال التسجيل بنجاح" });
});

// إرسال كود الدخول
module.exports.sendLoginOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const user = await UserModel.findOne({ phone });
  if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = {
    code: otpCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };

  user.otp = otp;
  await user.save();

  await sendOTP(`+2${phone}`, otpCode);
  res.status(200).json({ message: "تم إرسال كود الدخول على رقم الهاتف" });
});

// تسجيل الدخول باستخدام OTP
module.exports.loginWithOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  const user = await UserModel.findOne({ phone });
  if (!user) return res.status(404).json({ message: " user not found" });

  if (!isOTPValid(user, otp)) {
    return res.status(400).json({ message: "invalid otp" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });

  user.otp = { code: null, expiresAt: null };
  await user.save();

  res.status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000
    })
    .json({ message: "تم تسجيل الدخول بنجاح", token });
});

// تفعيل الحساب (نسخة إضافية إن احتجتها)
module.exports.verifyUser = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const user = await UserModel.findOne({ phone });

  if (!user) return res.status(404).json({ message: "المستخدم غير موجود." });
  if (user.isVerified) return res.status(400).json({ message: "المستخدم مفعل بالفعل." });

  if (!isOTPValid(user, otp)) {
    return res.status(400).json({ message: "كود التفعيل غير صحيح أو منتهي الصلاحية." });
  }

  user.isVerified = true;
  user.otp = { code: null, expiresAt: null };
  await user.save();

  res.status(200).json({ message: "تم تفعيل الحساب بنجاح." });
});

// تسجيل الخروج
module.exports.logOut = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
});

// إرسال كود إعادة تعيين الباسورد
module.exports.sendCodeResetBassword = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const user = await UserModel.findOne({ phone });
  if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = {
    code: otpCode,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };

  user.otp = otp;
  await user.save();

  await sendOTP(`+2${phone}`, otpCode);
  res.status(200).json({ message: "تم إرسال كود التفعيل إلى رقم الهاتف" });
});

// إعادة تعيين كلمة المرور
module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { phone, otp, password } = req.body;
  const user = await UserModel.findOne({ phone });
  if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

  if (!isOTPValid(user, otp)) {
    return res.status(400).json({ message: "كود التفعيل غير صحيح أو منتهي الصلاحية" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.otp = { code: null, expiresAt: null };
  await user.save();

  res.status(200).json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
});
