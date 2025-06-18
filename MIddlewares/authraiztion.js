const jwt = require("jsonwebtoken");
const {UserModel} = require("../Models/userModel");
const asyncHandler = require("express-async-handler");

const authorization = asyncHandler(async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    if(!token){
        res.status(401);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id).select("-password");
    if(!user){
        res.status(401);
    }
    req.user = user;
    next();
})
const AdminAuthorization =async (req,res,next) => {
   try {
    const user = req.user;
   const findUser = await UserModel.findById(user._id);
   if(!findUser){
    res.status(401);
   }
   if(findUser.role ==='admin'){next()}
   }catch(err){res.status(500).json({message:err.message})}
}
const SuperAdminAuthorization =async (req,res,next) => {
   try {
    const user = req.user;
   const findUser = await UserModel.findById(user._id);
   if(!findUser){
    res.status(401);
   }
   if(findUser.role ==='admin'){next()}
   }catch(err){res.status(500).json({message:err.message})}
}
module.exports = {authorization,AdminAuthorization,SuperAdminAuthorization};