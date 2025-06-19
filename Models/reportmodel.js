const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reportSchema = new Schema({
    name: { type: String, required: true, trim: true , minlength: 3, maxlength: 50 },
    email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phonenumber: { type: String, required: true, match:  /^01[0125][0-9]{8}$/ },
    subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
})
function validateReport(obj) {
    const reportJoiSchema = joi.object({
        name: joi.string().min(3).max(50).required(),
        email: joi.string().email().required(),
        phonenumber: joi.string().pattern( /^01[0125][0-9]{8}$/).required(),
        subject: joi.string().min(3).max(100).required(),
        message: joi.string().min(10).max(500).required()
    });
    return reportJoiSchema.validate(obj);
}
module.exports = {
    Report: mongoose.model('Report', reportSchema),
    validateReport
};