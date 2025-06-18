const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const searchSchema = new Schema({
    userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  searchTerm: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  results: [{
    type: Schema.Types.ObjectId,
    refPath: 'modelType'
  }],
  modelType: {
    type: String,
    required: true,
    enum: ['Company', 'Service', 'ServiceItem', 'User']
  }
}, { timestamps: true });
function validateSearch(obj) {
  const searchJoiSchema = joi.object({
    userId: joi.string().required(),
    searchTerm: joi.string().min(1).max(100).required(),
    results: joi.array().items(joi.string()).required(),
    modelType: joi.string().valid('Company', 'Service', 'ServiceItem', 'User').required()
  });
  return searchJoiSchema.validate(obj);
}
module.exports = {
  Search: mongoose.model('Search', searchSchema),
  validateSearch
};