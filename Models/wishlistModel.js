const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const wishlistSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        type: Schema.Types.ObjectId,
        refPath: 'modelType'
    }],
   serviceitemId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceItem',
        required: true
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
}, { timestamps: true });
function validateWishlist(obj) {
    const wishlistJoiSchema = joi.object({
        userId: joi.string().required(),
        items: joi.array().items(joi.string()).required(),
        serviceitemId: joi.string().required(),
        serviceId: joi.string().required()
    });
    return wishlistJoiSchema.validate(obj);
}
module.exports = {
    Wishlist: mongoose.model('Wishlist', wishlistSchema),
    validateWishlist
};