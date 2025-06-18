const router = require('express').Router();
const {createCode , deleteCode , getCodeByCompanyId} = require('../Controlletrs/codeController');
router.post('/createCode', createCode);
router.delete('/deleteCode/:id', deleteCode);
router.get('/getCodeByCompanyId/:companyId', getCodeByCompanyId);
module.exports = router;