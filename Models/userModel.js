const mongosse = require('mongoose');
const Schema = mongosse.Schema;
const bcrypt = require('bcryptjs')
const UserSchema = new Schema({
    name: {type:String,required:true},
    email: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    role:{ type: String, default: 'user' },
    otp: { type: String }, 
    otpExpires: { type: Date }
});
UserSchema.methods.comparepassword= async function(password) {
    return await bcrypt.compare(password,this.password);
}
const UserModel = mongosse.model('User', UserSchema);
module.exports = UserModel;
