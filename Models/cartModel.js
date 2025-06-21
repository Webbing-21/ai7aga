const mongoose = require('mongoose');
const joi = require('joi');
const Schema = mongoose.Schema;
const cartitemSchema = new Schema({
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'ServiceItem',
        required: true
    }],
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
})
    
const CartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cartitemId:[ {
        type: Schema.Types.ObjectId,
        ref: 'CartItem',
        required: true
    }],
});
function validateCart(obj) {
    const cartJoiSchema = joi.object({
        userId: joi.string().required(),
        items: joi.array().items(joi.string()).required(),
        serviceitemId: joi.string().required(),
        serviceId: joi.string().required()
        });
        return cartJoiSchema.validate(obj);
}
function validateCartItem(obj) {
    const cartItemJoiSchema = joi.object({
        items: joi.array().items(joi.string()).required(),
        quantity: joi.number().min(1).required(),
        totalPrice: joi.number().min(0).required(),
        userId: joi.string().required()
    });
    return cartItemJoiSchema.validate(obj);

}

module.exports = {
    CartItem: mongoose.model('CartItem', cartitemSchema),
    Cart: mongoose.model('Cart', CartSchema),
    validateCart,
    validateCartItem
}