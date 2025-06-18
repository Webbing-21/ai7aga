const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ordersSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    codeId: { type: Schema.Types.ObjectId, ref: 'Code', required: true },
    orderCount: { type: Number, required: true, min: 1 },
}, { timestamps: true });
function validateOrder(obj) {
    const orderJoiSchema = Joi.object({
        userId: Joi.string().required(),
        companyId: Joi.string().required(),
        serviceId: Joi.string().required(),
        codeId: Joi.string().required(),
        orderCount: Joi.number().min(1).required()
    });
    return orderJoiSchema.validate(obj);
}
module.exports = {
    Order: mongoose.model('Order', ordersSchema),
    validateOrder
};