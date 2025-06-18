const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const { Company } = require('./companyModel');
const codeSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    code: { type: String, required: true, unique: true },
    offer:{
        type:Number,
        required:true,
        min:0,
        max:100
    },
    description: { type: String, required: true },
    AdminNumber: { type: Number, required: true }
}, { timestamps: true });
function validateCode(obj) {
    const codeJoiSchema = joi.object({
        companyId: joi.string().required(),
        code: joi.string().required(),
        description: joi.string().required(),
        AdminNumber: joi.number().required(),
        offer: joi.number().required().min(0).max(100)
    });
    return codeJoiSchema.validate(obj);
}
module.exports = {
    Code: mongoose.model('Code', codeSchema),
    validateCode
};