const { UserModel, validateUser } = require("../Models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
module.exports.registerUser = asyncHandler(async (req, res) => {
    try {
        const {name,phone,password,company,CompanyCode} = req.body;
    }catch(err){res.status(500).json({message:err.message})}
})