const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/book', authMiddleware, rentalController.createRental);
router.get('/active', authMiddleware, rentalController.getActiveTrip);
router.get('/history', authMiddleware, rentalController.getTripHistory);
router.post('/control', authMiddleware, rentalController.controlVehicle);
router.post('/complete', authMiddleware, rentalController.completeTrip);

module.exports = router;
