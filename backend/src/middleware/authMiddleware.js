const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo/development convenience, provide default authenticated user if no token
    req.user = {
      id: 'usr_demo_01',
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      isEkycVerified: true,
      drivingLicense: 'B2 - 790123456789',
      ecoPoints: 340,
      walletBalance: 1500000
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
