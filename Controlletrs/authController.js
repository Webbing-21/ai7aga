const { UserModel, validateRegister, validateCompleteRegister, validateLogin } = require("../Models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../config/sendSMS");
const {Campany} = require("../Models/companyModel");
const {companyCode} = require("../Models/companyModel");

// دالة مساعدة للتحقق من كود OTP
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
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { phone } = req.body;
  const userExist = await UserModel.findOne({ phone });
  if (userExist) return res.status(400).json({ message: "this phone number is already registered" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = { code: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
console.log(otp)
  const user = new UserModel({ phone, otp });
  await user.save();

  // await sendOTP(`+2${phone}`, otpCode);
  res.status(200).json({ message: "otp sent successfully" });
});

// التحقق من كود التفعيل
module.exports.verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const user = await UserModel.findOne({ phone });

  if (!user) return res.status(404).json({ message: " this phone number is not registered" });
  if (user.isVerified) return res.status(400).json({ message: " this phone number is already verified" });
 if(user.otp.code !== otp) return res.status(400).json({ message: "invalid otp" });
 if(user.otp.expiresAt < new Date()) return res.status(400).json({ message: "otp expired" });

  user.isVerified = true;
  user.otp = { code: null, expiresAt: null };
  await user.save();

  res.status(200).json({ message: "otp verified successfully" });
});

module.exports.completeRegister = asyncHandler(async (req, res) => {
  const { error } = validateCompleteRegister(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { phone, name, email, password, company, CompanyCode, jobTitle, location } = req.body;
  const files = req.files;

  const user = await UserModel.findOne({ phone });
  if (!user || !user.isVerified) return res.status(400).json({ message: "please verify your phone number" });
  if (user.password) return res.status(400).json({ message: "user already registered" });

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "please upload at least one image" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const checkCampany = await Campany.findOne({ code: CompanyCode });
  if (!checkCampany) return res.status(400).json({ message: "invalid company code" });
  const checkCompanyCode = await companyCode.findOne({ code: CompanyCode });
  if (!checkCompanyCode) return res.status(400).json({ message: "invalid company code" });
  // إضافة الصور كمصفوفة من Buffer
  user.name = name;
  user.email = email;
  user.password = hashedPassword;
  user.company = company;
  user.CompanyCode = CompanyCode;
  user.jobTitle = jobTitle;
  user.location = location;
  user.idimage = files.map(file => ({
    data: file.buffer,
    contentType: file.mimetype,
  }));

  await user.save();
  res.status(201).json({ message: "تم إكمال التسجيل بنجاح" });
});


// إرسال كود الدخول
module.exports.sendLoginOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const user = await UserModel.findOne({ phone });
  if (!user) return res.status(404).json({ message: "user not found" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = { code: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
console.log(otp)
  user.otp = otp;
  await user.save();

  // await sendOTP(`+2${phone}`, otpCode);
  res.status(200).json({ message: "otp sent successfully" });
});

// تسجيل الدخول باستخدام OTP
module.exports.loginWithOTP = asyncHandler(async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { phone, otp } = req.body;
  const user = await UserModel.findOne({ phone });
  if (!user) return res.status(404).json({ message: "user not found" });

  // ✅ التحقق من صلاحية الكود وتطابقه
 if ( user.otp.code !== otp) return res.status(400).json({message:'otp is not vaild'})
 if(user.otp.expiresAt < new Date()) return res.status(400).json({message:'otp expired'})
if(user.otp.code === null) return res.status(400).json({message:'otp is not vaild'})
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  user.otp = { code: null, expiresAt: null };
  await user.save();

  res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
    })
    .json({ message: "login successfully", token });
});


// تسجيل الخروج
module.exports.logOut = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message:  "logged out successfully" });
});

// إرسال كود إعادة تعيين الباسورد
module.exports.sendCodeResetBassword = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const user = await UserModel.findOne({ phone });
  if (!user) return res.status(404).json({ message: "user not found" });

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otp = { code: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };

  user.otp = otp;
  await user.save();

  await sendOTP(`+2${phone}`, otpCode);
  res.status(200).json({ message: "otp sent successfully" });
});

// إعادة تعيين كلمة المرور
module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { phone, otp, password } = req.body;
  const user = await UserModel.findOne({ phone });
  if (!user) return res.status(404).json({ message: "user not found" });

  if (!isOTPValid(user, otp)) {
    return res.status(400).json({ message: "invalid otp" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.otp = { code: null, expiresAt: null };
  await user.save();

  res.status(200).json({ message: "password reset successfully" });
});