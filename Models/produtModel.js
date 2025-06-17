const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const ratingSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true }
})
const ProductSchema = new Schema({
    name: { type: String, required: true,unique: true},
    description: { type: String, required: true},
    price: { type: Number, required: true},
    CoverImage: { type: String, required: true },
    productImage: {
        type: [String],
        default: [],
        required: true,
    },
    category: { type: String, required: true },
    ratings: [ratingSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 }
});
function validateProduct(obj) {
const productJoiSchema = joi.object({
    name: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().required(),
    CoverImage: joi.string().required(),
    productImage: joi.array().items(joi.string()).required(),
    category: joi.string().required(),
    ratings: joi.array().items(joi.object().keys({
        userId: joi.string().required(),
        rating: joi.number().required()
    }))
});
return productJoiSchema.validate(obj);
}

module.exports = {
    Product: mongoose.model('Product', ProductSchema),
    validateProduct
};