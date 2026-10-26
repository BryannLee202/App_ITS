const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.get('/', vehicleController.getVehicles);
router.get('/stations', vehicleController.getStations);
router.get('/stations/:id', vehicleController.getStationById);
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;
