const express = require("express");
const router = express.Router();

const {
  sendRegisterCode,
  verifyRegisterOTP,
  completeRegister,
  sendLoginOTP,
  loginWithOTP,
  logOut,
  sendCodeResetBassword,
  resetPassword
} = require("../Controlletrs/userControllers"); // أو userControllers لو ده اسم الملف عندك

// ✅ التسجيل
router.post("/register", sendRegisterCode); // إرسال كود التسجيل
router.post("/register/verify", verifyRegisterOTP); // التحقق من كود OTP
router.post("/register/complete", completeRegister); // إكمال التسجيل

// ✅ تسجيل الدخول
router.post("/login/send-otp", sendLoginOTP); // إرسال كود الدخول
router.post("/login/verify-otp", loginWithOTP); // التحقق من كود الدخول

// ✅ تسجيل الخروج
router.post("/logout", logOut);

// ✅ استعادة كلمة المرور
router.post("/reset-password/send-code", sendCodeResetBassword); // إرسال كود استعادة الباسورد
router.post("/reset-password", resetPassword); // تعيين كلمة المرور الجديدة

module.exports = router;
