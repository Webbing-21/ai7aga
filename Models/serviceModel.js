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
const ratingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true }
});
const categorySchema = new Schema({
  category: { type: String, required: true },
  photo: {   
    data: Buffer,
    contentType: String,
  }
});
const branchSchema = new Schema({
  serviceId:{
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
 city: { type: String, required: true },
 address: { type: String, required: true },
 openingHours: {
   type: String,
    required: true,
    },
    phoneNumber: { type: String, required: true },
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
  coverimage: {
    data: Buffer,
    contentType: String,
   },
  serviceImage: [
    {
      data: Buffer,
    contentType: String,
    }
  ],
  ratings: [ratingSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  canBook: { type: Boolean, default: false },
  offerpercent: { type: Number, default: 0, min: 0, max: 100 },
  offerdiscription:[ { 
    type: String, 
    default: '' ,
    minlength: 0,
    maxlength: 100
  }]
});


function validateService(obj) {
  const schema = Joi.object({
    categoryId: Joi.string().required(), // Important: match Mongoose field name!
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().min(0).required(),
    coverimage: Joi.object({
      data: Joi.binary().required(),
      contentType: Joi.string().required()
    }),
    serviceImage: Joi.array().items(Joi.object({
      data: Joi.binary().required(),
      contentType: Joi.string().required()
    })), // fixed typo: serviceimage → serviceImage
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
    category: Joi.string().required(),
    photo: Joi.object({
      data: Joi.binary().required(),
      contentType: Joi.string().required()
    }),
    subcategory: Joi.string().required(),
  });

  return schema.validate(obj);
}
function validateBranch(obj) {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50),
    city: Joi.string().required(),
    address: Joi.string().required(),
    openingHours: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    serviceId: Joi.string().required()
  })
  return schema.validate(obj);
}

module.exports = {
  Service: mongoose.model('Service', ServiceSchema),
  Branch: mongoose.model('Branch', branchSchema),
  Rating: mongoose.model('Rating', ratingSchema),
  Category: mongoose.model('Category', categorySchema),
  ServiceSchema,
  ratingSchema,
  validateService,
  validateCategory,
  validateBranch
};
