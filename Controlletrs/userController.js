const {User} = require('../Models/userModel');
const asyncHandler = require('express-async-handler');
module.exports.UpdateUser = asyncHandler(async (req, res) => {
    try{
        const {id} = req.params;
        const {name, email, phone} = req.body;
        const user = await User.findByIdAndUpdate(id, {name, email, phone, }, {new: true});
        res.status(200).json({message: "User updated successfully", user});
    }catch(err){res.status(500).json({message: err.message});}
})
