const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/validate-phone', authController.validatePhone);
router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/google-login', authController.googleLogin);
router.get('/oauth-config', authController.getOAuthConfig);
router.post('/google-oauth', authController.googleOAuthVerify);
router.get('/verify-session', authMiddleware.requireAuth, authController.verifySession);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/update-profile', authMiddleware, authController.updateProfile);
router.put('/update-avatar', authMiddleware, authController.updateAvatar);
router.post('/update-avatar', authMiddleware, authController.updateAvatar);
router.post('/ekyc-verify', authMiddleware, authController.updateEkyc);

module.exports = router;
