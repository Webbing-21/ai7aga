const mongoose = require('mongoose');
const Joi = require('joi');
const { Schema } = mongoose;

const ratingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true }
});
const categorySchema = new Schema({
  maincategory: { type: String, required: true },
  mainphoto: {   
    url: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    }
  },
  subcategory: { type: String },
  subphoto: { 
    url: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: ''
    }
  }
});
const ServiceSchema = new Schema({
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  price: { type: Number, required: true, min: 0 },
  coverimage: { type: String, required: true },
  serviceImage: {
    type: [String],
    default: [],
    required: true
  },
  ratings: [ratingSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  canBook: { type: Boolean, default: false },
});


function validateService(obj) {
  const schema = Joi.object({
    categoryId: Joi.string().required(), // Important: match Mongoose field name!
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().min(0).required(),
    coverimage: Joi.string().required(),
    serviceImage: Joi.array().items(Joi.string()).required(), // fixed typo: serviceimage → serviceImage
    ratings: Joi.array().items(
      Joi.object({
        userId: Joi.string().required(),
        rating: Joi.number().min(0).max(5).required()
      })
    ),
    rating: Joi.number().min(0).max(5),
    ratingCount: Joi.number().min(0),
    canBook: Joi.boolean()
  });

  return schema.validate(obj);
}

function validateCategory(obj) {
  const schema = Joi.object({
    maincategory: Joi.string().required(),
    mainphoto: Joi.string().required(),
    subcategory: Joi.string().required(),
    subphoto: Joi.string().allow('')
  });

  return schema.validate(obj);
}


module.exports = {
  Service: mongoose.model('Service', ServiceSchema),
  Category: mongoose.model('Category', categorySchema),
  ServiceSchema,
  ratingSchema,
  validateService,
  validateCategory
};
