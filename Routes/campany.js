const router = require('express').Router();
const multer = require('multer');
const { AddCompany , showImage , getCompany , getAllCompanies , updateCompany , deleteCompany } = require('../Controlletrs/companyController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  '/add',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  AddCompany
);
router.get('/:id/logo', showImage);
router.get('/:id', getCompany);
router.get('/', getAllCompanies);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
  
module.exports = router;
