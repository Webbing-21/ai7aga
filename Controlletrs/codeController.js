const Code = require('../Models/codeModel');
const { Company } = require('../Models/companyModel');
const asyncHandler = require('express-async-handler');

// دالة توليد كود عشوائي
const generateRandomCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports.createCode = asyncHandler(async (req, res) => {
  try {
    const { companyId , description , AdminNumber, offer } = req.body;

    // تحقق من وجود الشركة
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // توليد كود عشوائي
    const generatedCode = generateRandomCode(8); // مثلاً كود من 8 حروف وأرقام

    // تحقق من عدم تكرار الكود
    const existing = await Code.findOne({ code: generatedCode });
    if (existing) {
      return res.status(409).json({ message: "Generated code already exists, try again" });
    }
    const {error} = validateCode({companyId , description , number , code: generatedCode});
    if(error){
      return res.status(400).json({message: error.details[0].message});
    }

    

    const code = new Code({
      companyId,
      code: generatedCode,
      offer,
      description,
      AdminNumber
    });

    await code.save();

    res.status(201).json({ message: "Code created successfully", code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports.deleteCode = asyncHandler(async (req, res) => {
  try {
    const {id} = req.params;
    const code = await Code.findByIdAndDelete(id);
    if(!code){
      return res.status(404).json({message: "Code not found"});
    }
    res.status(200).json({message: "Code deleted successfully", code});
  }catch(err){res.status(500).json({message: err.message});}
})
module.exports.getCodeByCompanyId = asyncHandler(async (req, res) => {
  try {
    const {companyId} = req.params;
    const codes = await Code.find({companyId});
    res.status(200).json({codes});
  }catch(err){res.status(500).json({message: err.message});}
})
