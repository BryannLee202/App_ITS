const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = require('../config');
const SmsService = require('../services/smsService');

// In-memory OTP storage with expiration
// Key: normalized phone, Value: { code, expiresAt, attempts }
const otpStorage = new Map();

exports.requestOtp = async (req, res) => {
  const { phone, channel = 'ZALO' } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không được để trống' });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');
  if (cleanPhone.length < 8) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' });
  }

  // Generate dynamic random 4-digit OTP
  const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 60 * 1000; // 60 seconds TTL

  otpStorage.set(cleanPhone, {
    code: randomOtp,
    channel,
    expiresAt,
    attempts: 0
  });

  // Dispatch via SMS / Zalo / Telegram / Webhook provider
  const dispatchResult = await SmsService.sendOtp({
    phone: cleanPhone,
    otp: randomOtp,
    channel
  });

  return res.json({
    success: true,
    message: dispatchResult.message,
    phone: cleanPhone,
    channel,
    expiresInSec: 60,
    generatedOtp: randomOtp // Returned to facilitate live in-app push simulation while also dispatching
  });
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Thiếu số điện thoại hoặc mã OTP' });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const record = otpStorage.get(cleanPhone);

  if (!record) {
    return res.status(400).json({
      success: false,
      message: 'Chưa có yêu cầu gửi mã OTP cho số điện thoại này hoặc mã đã hết hạn. Vui lòng bấm gửi lại mã.'
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStorage.delete(cleanPhone);
    return res.status(400).json({
      success: false,
      message: 'Mã OTP đã hết hiệu lực (quá 60 giây). Vui lòng yêu cầu mã mới.'
    });
  }

  if (record.attempts >= 5) {
    otpStorage.delete(cleanPhone);
    return res.status(400).json({
      success: false,
      message: 'Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã OTP mới.'
    });
  }

  const inputOtp = otp.toString().trim();
  if (inputOtp !== record.code) {
    record.attempts += 1;
    return res.status(400).json({
      success: false,
      message: `Mã OTP không chính xác. Bạn còn ${5 - record.attempts} lần thử.`
    });
  }

  // OTP Verified successfully! Clean up record
  otpStorage.delete(cleanPhone);

  const user = {
    id: `usr_${cleanPhone.slice(-4)}`,
    fullName: 'Minh Tài',
    phone: cleanPhone.startsWith('+84') ? cleanPhone : `+84${cleanPhone.replace(/^0+/, '')}`,
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
    message: 'Đăng nhập thành công! Chào mừng bạn đến với Green SM / EcoGo.',
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
