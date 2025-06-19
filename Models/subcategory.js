const mongoose = require('mongoose');
const Joi = require('joi');
const { Schema } = mongoose;
const subcategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
  photo: {
  data: Buffer,
  contentType: String,
  },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true });
function validateSubcategory(obj) {
  const subcategoryJoiSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().min(10).max(500).required(),
    photo: Joi.object({
      data: Joi.binary().required(),
      contentType: Joi.string().required()
    }).required(),
    categoryId: Joi.string().required()
  });

  return subcategoryJoiSchema.validate(obj);
}
module.exports = {
  Subcategory: mongoose.model('Subcategory', subcategorySchema),
  validateSubcategory
  };