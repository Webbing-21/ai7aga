const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require("../Models/SendEmail");
const { tokenBlacklist } = require("../MIddlewares/auth");
const User =require('../Models/userModel')
require('dotenv').config();
exports.register = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already registered with this email.' });
        }
        let newuser= await User(req.body);
        if(req.body.email === undefined || req.body.password === undefined || req.body.name === undefined){
            return res.status(400).json({ message: 'Please fill all the fields' });}
        let hashpassword= await bcrypt.hash(newuser.password, 10);
        newuser.password= hashpassword;
        let user= await newuser.save();
        res.status(200).json({ message: 'User registered successfully',name:user.name ,email: user.email });;

    } catch (error) {
       console.log(error)
        res.status(400).json({ message: 'Something went wrong' });
        
    }
}
exports.login = async (req, res) => {
    try {
        let user=await User.findOne({email:req.body.email});
        if(!user||!await user.comparepassword(req.body.password)){
            return res.status(400).json({message:'Invalid email or password'});
        
        }
        else
        {let token =jwt.sign({name:user.name,id:user._id,role:user.role},process.env.JWT_SECRET_KEY,{expiresIn:'1h'});
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,      
            sameSite: "None"    ,
            maxAge: 3600000  
          });
            res.status(200).json({ message: 'Login successfully',name:user.name ,email: user.email,token:token });
    }
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
        console.log(error)
        
    }
}
exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        tokenBlacklist.add(token); 

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const  {email}  = req.body;
        const user = await User.findOne( {email} );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const Otp = Math.floor(100000 + Math.random() * 900000).toString();
        const OtpExpires=new Date(Date.now() + 10 * 60 * 1000);

        user.otp=Otp;
        user.otpExpires=OtpExpires;
        await user.save();
        await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${Otp}`);
        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        if(!req.user){ return res.status(403).json({ message: "Access denied" });}
        const updatedData = req.body;
        const userId = req.user.id; 
        Object.keys( updatedData ).forEach(
            (key) =>  updatedData [key] === undefined && delete  updatedData [key]
        );
        if (updatedData==='password'){
            return res.status(400).json({ message: "Password cannot be updated here" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$set:{...updatedData}},
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).
            json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", updatedUser:{name:updatedUser.name,email:updatedUser.email} });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}
exports.ChangePassword = async (req, res) => {
    try {
        if(!req.user){ return res.status(403).json({ message: "Access denied"})}
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id; 

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}