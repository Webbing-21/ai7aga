const { Campany, validateCompany } = require('../Models/companyModel');
const asyncHandler = require('express-async-handler');

module.exports.AddCompany = asyncHandler(async (req, res) => {
  try {
    const logo = req.files['logo']?.[0];
    const coverImage = req.files['coverImage']?.[0];

    if (!logo || !coverImage) {
      return res.status(400).json({ message: 'please upload logo and cover image' });
    }

    const companyData = {
      name: req.body.name,
      about: req.body.about,
      location: req.body.location,
      socialmedia: req.body.socialmedia ? JSON.parse(req.body.socialmedia) : [],
      website: req.body.website,
      logo: {
        data: logo.buffer,
        contentType: logo.mimetype,
      },
      coverImage: {
        data: coverImage.buffer,
        contentType: coverImage.mimetype,
      },
      theme: req.body.theme,
      userId: req.user._id.toString(), // ضروري للتحقق في Joi
    };

    const { error } = validateCompany(companyData);
    if (error) return res.status(400).json(error.details[0].message);

    const company = new Campany(companyData);
    await company.save();

    res.status(201).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error in adding company', error: err.message });
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
        const company = await Campany.findByIdAndUpdate(req.params.id , req.body , {new: true});
        if (!company) return res.sendStatus(404);
        res.json(company);
    } catch(err){
        res.status(500).json(err);
    }
})
module.exports.deleteCompany = asyncHandler(async (req , res) => {
    try{
        const company = await Campany.findByIdAndDelete(req.params.id);
        if (!company) return res.sendStatus(404);
        res.json(company);
    } catch(err){
        res.status(500).json(err);
    }
})
