const router = require('express').Router();
const {createBooking} = require('../Controlletrs/reservationController');
router.post('/createBooking', createBooking);
module.exports = router;