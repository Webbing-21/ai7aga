const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');

const companySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50 },
  about: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
  location: { type: String, required: true },
  socialmedia: { type: [String], default: [] },
  website: { type: String, required: true },
  logo: {
    data: Buffer,
    contentType: String,
  },
  coverImage: {
    data: Buffer,
    contentType: String,
  },
  theme: { type: String, required: true, default: '#000000' },
  usercode: { type: [String], default: [] },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Campany = mongoose.model('Company', companySchema);

function validateCompany(obj) {
  const companyJoiSchema = joi.object({
    name: joi.string().required(),
    about: joi.string().required(),
    location: joi.string().required(),
    socialmedia: joi.array().items(joi.string()).default([]),
    website: joi.string().required(),
    logo: joi.object({
      data: joi.binary().required(),
      contentType: joi.string().required()
    }).required(),
    coverImage: joi.object({
      data: joi.binary().required(),
      contentType: joi.string().required()
    }).required(),
    theme: joi.string().default('#000000'),
    userId: joi.string().required()
  });

  return companyJoiSchema.validate(obj);
}

module.exports = {
  Campany,
  validateCompany
};
