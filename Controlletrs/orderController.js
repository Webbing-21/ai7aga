const { Order ,validateOrder} = require('../Models/orderModel');
const asyncHandler = require('express-async-handler');
const {User} = require('../Models/userModel');
const {Campany} = require('../Models/companyModel');
const {Service} = require('../Models/serviceModel');

module.exports.addOrder = asyncHandler(async (req , res) => {
   try{
    const {error} = validateOrder(req.body);
    if (error) return res.status(400).json({message: error.details[0].message});
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({message: 'user not found'});
    const company = await Campany.findById(req.body.companyId);
    if (!company) return res.status(404).json({message: 'company not found'});
    const service = await Service.findById(req.body.serviceId);
    if (!service) return res.status(404).json({message: 'service not found'});
    const code = await Code.findById(req.body.codeId);
    if (!code) return res.status(404).json({message: 'code not found'});
    const order = new Order({
        userId: user._id,
        companyId: company._id,
        serviceId: service._id,
        orderCount: req.body.orderCount,
        codeId: code._id
    });
    await order.save();
    res.status(201).json(order);
   }catch(err){res.status(500).json(err)}
})
module.exports.getOrdersByCompanyId = asyncHandler(async (req , res) => {
    try{
        const order = await Order.find({companyId: req.params.id});
        if (!order) return res.status(404).json({message: 'order not found'});
        res.json(order);
    }catch(err){res.status(500).json(err)}
})
module.exports.deleteOrederByCompanyId = asyncHandler(async (req , res) => {
    try{
        const order = await Order.find({_id: req.params.id , companyId: req.body.companyId});
        if (!order) return res.status(404).json({message: 'order not found'});
        res.json(order);
    }catch(err){res.status(500).json(err)}
})
module.exports.updateOrder = asyncHandler(async (req , res) => {
    try{
      const order = await Order.find({_id: req.params.id , companyId: req.body.companyId});
      if (!order) return res.status(404).json({message: 'order not found'});
      order.status = req.body.status;
      await order.save();
      res.json(order);
    }catch(err){res.status(500).json(err)}
})
