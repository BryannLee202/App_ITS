const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');

router.get('/checkin-status', rewardController.getCheckInStatus);
router.post('/checkin', rewardController.executeCheckIn);

module.exports = router;
