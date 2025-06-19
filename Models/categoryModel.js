const mongoose = require('mongoose');
const Joi = require('joi');
const { Schema } = mongoose;
const categorySchema = new Schema({
  category: { type: String, required: true },
  photo: {   
    data: Buffer,
    contentType: String,
  }
});
function validateCategory(obj) {
  const categoryJoiSchema = Joi.object({
    category: Joi.string().required(),
    photo: Joi.object({
      data: Joi.binary().required(),
      contentType: Joi.string().required()
    }).required()
  });

  return categoryJoiSchema.validate(obj);
}
module.exports = {
  Category: mongoose.model('Category', categorySchema),
  validateCategory
};