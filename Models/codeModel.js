const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const { Company } = require('./companyModel');
const codeSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true }
}, { timestamps: true });
function validateCode(obj) {
    const codeJoiSchema = joi.object({
        companyId: joi.string().required(),
        code: joi.string().required(),
        description: joi.string().required()
    });
    return codeJoiSchema.validate(obj);
}
module.exports = {
    Code: mongoose.model('Code', codeSchema),
    validateCode
};