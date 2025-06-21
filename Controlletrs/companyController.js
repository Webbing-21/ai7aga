const { Campany, validateCompany } = require('../Models/companyModel');
const asyncHandler = require('express-async-handler');
const asyncHandler = require('express-async-handler');
const { validateCompany } = require('../validations/companyValidation');

module.exports.AddCompany = asyncHandler(async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    // Only allow admin or superadmin to add a company
    if (!['superadmin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const logo = req.files?.['logo']?.[0];
    const coverImage = req.files?.['coverImage']?.[0];

    if (!logo || !coverImage) {
      return res.status(400).json({ message: 'Please upload both logo and cover image' });
    }

    const companyData = {
      name: req.body.name,
      about: req.body.about,
      location: req.body.location,
      website: req.body.website,
      socialmedia: req.body.socialmedia ? JSON.parse(req.body.socialmedia) : [],
      theme: req.body.theme,
      logo: {
        data: logo.buffer,
        contentType: logo.mimetype,
      },
      coverImage: {
        data: coverImage.buffer,
        contentType: coverImage.mimetype,
      },
      userId: userId.toString()
    };

    // Validate input
    const { error } = validateCompany(companyData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const company = new Campany(companyData);
    await company.save();

    res.status(201).json({ message: 'Company added successfully', company });

  } catch (err) {
    console.error('Error in AddCompany:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports.showImage = asyncHandler (async (req , res) => {
    try{
        const company = await Campany.findById(req.params.id);
        if (!company || !company.logo?.data || !company.coverImage?.data) return res.sendStatus(404);
        const logo = company.logo.data;
        const coverImage = company.coverImage.data;
        res.set('Content-Type', company.logo.contentType);
        res.set('Content-Type', company.coverImage.contentType);
        res.send(logo);
        res.send(coverImage);
        
    } catch(err){res.status(500).json(err)}
})
module.exports.getCompany = asyncHandler(async (req , res) => {
    try{
        const company = await Campany.findById(req.params.id);
        if (!company) return res.sendStatus(404);
        res.json(company);
    } catch(err){
        res.status(500).json(err);
    }
})
module.exports.getAllCompanies = asyncHandler(async (req , res) => {
    try{
        const companies = await Campany.find();
        res.json(companies);
    } catch(err){
        res.status(500).json(err);
    }
})
module.exports.updateCompany = asyncHandler(async (req , res) => {
    try{
       const { role, _id: userId } = req.user;
    if (!['superadmin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
      
        const company = await Campany.findByIdAndUpdate(req.params.id , req.body , {new: true});
        if (!company) return res.sendStatus(404);
        res.json(company);
    } catch(err){
        res.status(500).json(err);
    }
})
module.exports.deleteCompany = asyncHandler(async (req , res) => {
    try{
       const { role, _id: userId } = req.user;
    if (!['superadmin'].includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
        const company = await Campany.findByIdAndDelete(req.params.id);
        if (!company) return res.sendStatus(404);
        res.json(company);
    } catch(err){
        res.status(500).json(err);
    }
})
