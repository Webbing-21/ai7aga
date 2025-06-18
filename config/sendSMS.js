const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendOTP = async (to, otpCode) => {
  await client.messages.create({
    body: `كود التفعيل الخاص بك هو: ${otpCode}`,
    from: fromNumber,
    to: to // لازم يكون بالصيغة الدولية: +20xxxxxxxxxx
  });
};

module.exports = sendOTP;
