const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ordersSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    codeId: { type: Schema.Types.ObjectId, ref: 'Code', required: true },
    orderCount: { type: Number, required: true, min: 1 },
    cartItemId: { type: Schema.Types.ObjectId, ref: 'Cartitem', required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });
const Order = mongoose.model('Order', ordersSchema);
function validateOrder(obj) {
    const orderJoiSchema = Joi.object({
        userId: Joi.string().required(),
        companyId: Joi.string().required(),
        serviceId: Joi.string().required(),
        codeId: Joi.string().required(),
        orderCount: Joi.number().min(1).required(),
        status: Joi.string().valid('pending', 'completed', 'cancelled').default('pending')
    });
    return orderJoiSchema.validate(obj);
}
module.exports = {
    Order,
    validateOrder
};