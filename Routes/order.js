const router = require('express').Router();
const {addOrder , getOrdersByCompanyId , deleteOrederByCompanyId , updateOrder} = require('../Controlletrs/orderController');
router.post('/', addOrder);
router.get('/:id', getOrdersByCompanyId);
router.delete('/:id', deleteOrederByCompanyId);
router.put('/:id', updateOrder);
module.exports = router;