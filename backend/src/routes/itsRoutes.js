const express = require('express');
const router = express.Router();
const itsController = require('../controllers/itsController');

router.get('/green-wave', itsController.getGreenWaveAdvisory);
router.post('/shockwave', itsController.calculateShockwave);
router.get('/eco-calculator', itsController.calculateEco);
router.get('/corridors', itsController.getCorridors);

module.exports = router;
