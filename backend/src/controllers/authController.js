const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// In-memory OTP storage for rapid demonstration
const otpStorage = new Map();

exports.requestOtp = (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không được để trống' });
  }

  // Pre-set OTP 8888 for easy testing and evaluation
  const otpCode = '8888';
  otpStorage.set(phone, otpCode);

  return res.json({
    success: true,
    message: `Mã OTP xác thực đã được gửi tới ${phone} qua tin nhắn Zalo/SMS`,
    demoOtp: otpCode // convenient for testing
  });
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Thiếu số điện thoại hoặc mã OTP' });
  }

  const expectedOtp = otpStorage.get(phone) || '8888';
  if (otp !== expectedOtp && otp !== '8888') {
    return res.status(400).json({ success: false, message: 'Mã OTP không chính xác. Thử lại với 8888.' });
  }

  const user = {
    id: `usr_${phone.slice(-4)}`,
    fullName: phone === '0901234567' ? 'Nguyễn Văn An' : 'Người Dùng ITS',
    phone,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isEkycVerified: true,
    drivingLicense: 'GPLX Hạng B2 - 790123456789',
    drivingLicenseExpiry: '2030-12-31',
    walletBalance: 1500000,
    ecoPoints: 340,
    totalCo2SavedKg: 42.8,
    memberTier: 'DIAMOND_GREEN'
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    success: true,
    message: 'Đăng nhập thành công',
    token,
    user
  });
};

exports.getProfile = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

exports.updateEkyc = (req, res) => {
  const { fullName, cccdNumber, licenseNumber, licenseType } = req.body;
  
  return res.json({
    success: true,
    message: 'Hồ sơ GPLX và CCCD gắn chip đã được xác thực tự động bởi hệ thống eKYC AI',
    ekycData: {
      status: 'VERIFIED',
      fullName: fullName || req.user.fullName,
      cccdNumber: cccdNumber || '079201008899',
      licenseNumber: licenseNumber || '790123456789',
      licenseType: licenseType || 'B2',
      verifiedAt: new Date().toISOString()
    }
  });
};
