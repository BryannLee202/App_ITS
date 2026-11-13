const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo/development convenience, provide default authenticated user if no token
    req.user = {
      id: 'usr_demo_01',
      fullName: 'Minh Tài',
      phone: '0901234567',
      isEkycVerified: true,
      drivingLicense: 'GPLX B2 - 790123456789',
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
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' });
  }
}

module.exports = authMiddleware;
module.exports.requireAuth = requireAuth;

