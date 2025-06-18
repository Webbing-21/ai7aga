const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const joi = require('joi');
const inviteSchema = new Schema({
  token: { type: String, required: true, unique: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });
function validateInvite(obj) {
  const inviteJoiSchema = joi.object({
    token: joi.string().required(),
    invitedBy: joi.string().required(),
    expiresAt: joi.date().required(),
    used: joi.boolean().default(false)
  });
  return inviteJoiSchema.validate(obj);
}
module.exports ={
    Invite: mongoose.model('Invite', inviteSchema),
    validateInvite
    };

