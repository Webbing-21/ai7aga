const mongosse = require('mongoose');
const Schema = mongosse.Schema;
const bcrypt = require('bcryptjs')
const UserSchema = new Schema({
    name: {
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:30,
        trim:true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^01[0125][0-9]{8}$/, // رقم موبايل مصري مثلاً
      },
    password: {
        type:String,
        required:true,
        trim:true,
        minlength:8,
        maxlength:50,
        
    },
    role:{
         type: String,
          default: 'user',
          enum:['user','admin','superadmin'],
          trim:true
        },
        otp: {
            code: String,       // كود التحقق المؤقت
            expiresAt: Date     // وقت انتهاء صلاحية الكود
          },
          isVerified: {
            type: Boolean,
            default: false,
          },
          company:{
            type:String,
            trim:true,
            minlength:3,
            maxlength:50,

          },
          CompanyCode:{
            type:String,
            trim:true,
            minlength:3,
            maxlength:50,
            trim:true
          },
         
},{timestamps:true});
function validateUser(obj) {
    const schema = Joi.object({
        name:Joi.string().min(3).max(30).required(),
        phone:Joi.string().pattern(/^01[0125][0-9]{8}$/).required(),
        password:Joi.string().min(8).max(50).required(),
        role:Joi.string().valid('user','admin','superadmin').default('user'),
        company:Joi.string().min(3).max(50).required(),
        CompanyCode:Joi.string().min(3).max(50).required(),
    })
    return schema.validate(obj);
}
module.exports = {
  UserModel,
  validateUser
};
const UserModel = mongosse.model('User', UserSchema);