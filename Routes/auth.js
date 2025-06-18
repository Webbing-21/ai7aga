const express = require("express");
const router = express.Router();
const multer = require('multer')
const asyncHandler = require("express-async-handler");
const {
  sendRegisterCode,
  verifyRegisterOTP,
  completeRegister,
  sendLoginOTP,
  loginWithOTP,
  logOut,
  sendCodeResetBassword,
  resetPassword
} = require("../Controlletrs/authController"); // أو userControllers لو ده اسم الملف عندك
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ التسجيل
router.post("/register", sendRegisterCode); // إرسال كود التسجيل
router.post("/register/verify", verifyRegisterOTP); // التحقق من كود OTP
router.post("/register/complete",upload.array('image'), completeRegister); // إكمال التسجيل

// ✅ تسجيل الدخول
router.post("/login/send-otp", sendLoginOTP); // إرسال كود الدخول
router.post("/login/verify-otp", loginWithOTP); // التحقق من كود الدخول

// ✅ تسجيل الخروج
router.post("/logout", logOut);

// ✅ استعادة كلمة المرور
router.post("/reset-password/send-code", sendCodeResetBassword); // إرسال كود استعادة الباسورد
router.post("/reset-password", resetPassword); // تعيين كلمة المرور الجديدة

router.get("/user/:id/images", asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user || !user.idimage || user.idimage.length === 0) {
    return res.status(404).json({ message: "no images" });
  }

  const images = user.idimage.map((image) => ({
    contentType: image.contentType,
    base64: `data:${image.contentType};base64,${image.data.toString("base64")}`
  }));

  res.status(200).json({ images });
}));


module.exports = router;
