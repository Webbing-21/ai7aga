const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const UserSchema = new Schema({
  name: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^01[0125][0-9]{8}$/,
  },
  email: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 100,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  password: {
    type: String,
    trim: true,
    minlength: 8,
    maxlength: 100,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'superadmin'],
    trim: true,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  company: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  CompanyCode: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  jobTitle: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  idimage: [
    {
      data: Buffer,
      contentType: String,
    }
    
  ],
  location: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  token: {
    type: String,
    default: null,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);

function validateRegister(obj) {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^01[0125][0-9]{8}$/).required(),
  });
  return schema.validate(obj);
}
function validateCompleteRegister(obj) {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^01[0125][0-9]{8}$/).required(),
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
    company: Joi.string().min(3).max(50).required(),
    CompanyCode: Joi.string().min(3).max(50).required(),
    jobTitle: Joi.string().min(3).max(50).required(),
    location: Joi.string().min(3).max(50).required(),
   
  });
  return schema.validate(obj);
}


function validateLogin(obj) {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^01[0125][0-9]{8}$/).required(),
    otp: Joi.number().required(),
  });
  return schema.validate(obj);
}

module.exports = {
  UserModel,
  validateRegister,
  validateLogin,
  validateCompleteRegister,
};
