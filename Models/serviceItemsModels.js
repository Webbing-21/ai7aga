const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const serviceItemSchema = new Schema({
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    image:{
          url: {
      type: String,
      default: ''
    },
     id:{
        type: String,
        default: ''
     } 
        },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
    }, { timestamps: true });
function validateServiceItem(obj) {
    const serviceItemJoiSchema = joi.object({
        serviceId: joi.string().required(),
        name: joi.string().min(3).max(50).required(),
        description: joi.string().min(10).max(500).required(),
        price: joi.number().min(0).required(),
        image:joi.object({
                    url: joi.string().required(),
                    id: joi.string().required()
                }).required(),
        categoryId: joi.string().required()
    });

    return serviceItemJoiSchema.validate(obj);
}
module.exports = {
    ServiceItem: mongoose.model('ServiceItem', serviceItemSchema),
    validateServiceItem
};