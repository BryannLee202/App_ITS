const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.get('/verify-session', authMiddleware.requireAuth, authController.verifySession);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/ekyc-verify', authMiddleware, authController.updateEkyc);

module.exports = router;
