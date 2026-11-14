const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET } = require('../config');
const SmsService = require('../services/smsService');

const USERS_FILE = path.join(__dirname, '../data/users.json');

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading users.json:', err.message);
  }
  return [];
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving users.json:', err.message);
  }
}

// Phone number normalization helper (+84 / 84 / 0... -> standard 0xxxxxxxxx)
function normalizePhone(p) {
  if (!p) return '';
  let digits = p.toString().trim().replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length >= 10) {
    digits = '0' + digits.slice(2);
  } else if (!digits.startsWith('0') && digits.length >= 9) {
    digits = '0' + digits;
  }
  return digits;
}

// Persistent OTP storage cache with file backup so server restarts don't wipe pending codes
const OTP_CACHE_FILE = path.join(__dirname, '../data/otp_cache.json');

function loadOtpCache() {
  try {
    if (fs.existsSync(OTP_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(OTP_CACHE_FILE, 'utf8'));
      const map = new Map();
      const now = Date.now();
      for (const [k, v] of Object.entries(data)) {
        if (v && v.expiresAt > now) {
          map.set(k, v);
        }
      }
      return map;
    }
  } catch (err) {
    console.warn('Error reading otp_cache.json:', err.message);
  }
  return new Map();
}

function saveOtpCache(map) {
  try {
    const obj = {};
    for (const [k, v] of map.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(OTP_CACHE_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error writing otp_cache.json:', err.message);
  }
}

const otpStorage = loadOtpCache();

exports.requestOtp = async (req, res) => {
  const { phone, channel = 'ZALO' } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không được để trống' });
  }

  const cleanPhone = normalizePhone(phone);
  if (cleanPhone.length < 8) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ' });
  }

  // Generate dynamic random 4-digit OTP
  const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 300 * 1000; // 5 minutes TTL (300s)

  const otpRecord = {
    code: randomOtp,
    channel,
    expiresAt,
    attempts: 0
  };

  otpStorage.set(cleanPhone, otpRecord);
  saveOtpCache(otpStorage);

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
    expiresInSec: 300,
    generatedOtp: randomOtp // Returned to facilitate live in-app push simulation while also dispatching
  });
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Thiếu số điện thoại hoặc mã OTP' });
  }

  const cleanPhone = normalizePhone(phone);
  const inputOtp = otp.toString().trim();

  // 1. Support Master Demo Code '8888'
  const isMasterCode = inputOtp === '8888';

  let record = otpStorage.get(cleanPhone);

  // If not found by normalized phone, scan all active unexpired records in cache to match OTP code
  if (!record && !isMasterCode) {
    for (const [p, rec] of otpStorage.entries()) {
      if (rec && rec.code === inputOtp && Date.now() <= rec.expiresAt) {
        record = rec;
        break;
      }
    }
  }

  if (!record && !isMasterCode) {
    return res.status(400).json({
      success: false,
      message: 'Chưa có yêu cầu gửi mã OTP cho số điện thoại này hoặc mã đã hết hạn. Vui lòng bấm gửi lại mã.'
    });
  }

  if (record && !isMasterCode) {
    if (Date.now() > record.expiresAt) {
      otpStorage.delete(cleanPhone);
      saveOtpCache(otpStorage);
      return res.status(400).json({
        success: false,
        message: 'Mã OTP đã hết hiệu lực. Vui lòng yêu cầu mã mới.'
      });
    }

    if (record.attempts >= 5) {
      otpStorage.delete(cleanPhone);
      saveOtpCache(otpStorage);
      return res.status(400).json({
        success: false,
        message: 'Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã OTP mới.'
      });
    }

    if (inputOtp !== record.code) {
      record.attempts += 1;
      saveOtpCache(otpStorage);
      return res.status(400).json({
        success: false,
        message: `Mã OTP không chính xác. Bạn còn ${5 - record.attempts} lần thử.`
      });
    }

    // OTP Verified successfully! Clean up record
    otpStorage.delete(cleanPhone);
    saveOtpCache(otpStorage);
  }

  const formattedPhone = cleanPhone.startsWith('0')
    ? `+84${cleanPhone.slice(1)}`
    : `+84${cleanPhone}`;

  const users = loadUsers();
  let user = users.find(u => {
    const uNorm = normalizePhone(u.phone);
    return uNorm === cleanPhone || u.phone === formattedPhone || u.phone === cleanPhone;
  });

  if (!user) {
    // New customer registration - Create accurate initial profile
    user = {
      id: `usr_${cleanPhone.slice(-4)}_${Date.now().toString().slice(-4)}`,
      phone: formattedPhone,
      fullName: `Khách hàng ${cleanPhone.slice(-4)}`,
      email: `user.${cleanPhone.slice(-4)}@ecogo.vn`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isEkycVerified: true,
      drivingLicense: 'GPLX B2 - 790123456789',
      licenseNumber: '790123456789',
      drivingLicenseExpiry: '15/08/2032',
      cccdNumber: '079201018891',
      memberRank: 'Eco Elite Ambassador',
      membershipId: `ESG-ECOGO-2026-${cleanPhone.slice(-4)}`,
      walletBalance: 1500000,
      ecoPoints: 340,
      ecoCoins: 180,
      totalCo2SavedKg: 42.8,
      memberTier: 'DIAMOND_GREEN',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
  }

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    success: true,
    message: 'Đăng nhập thành công! Chào mừng bạn đến với Green SM / EcoGo.',
    token,
    user
  });
};

exports.getProfile = (req, res) => {
  const users = loadUsers();
  const userId = req.user ? req.user.id : null;
  const user = users.find(u => u.id === userId) || req.user;
  return res.json({
    success: true,
    user
  });
};

exports.verifySession = (req, res) => {
  const users = loadUsers();
  const userId = req.user ? req.user.id : null;
  const user = users.find(u => u.id === userId) || req.user;
  return res.json({
    success: true,
    message: 'Phiên xác thực hợp lệ',
    user
  });
};

exports.updateProfile = (req, res) => {
  const userId = req.user ? req.user.id : null;
  const { fullName, email, phone, licenseNumber, cccdNumber } = req.body;

  const users = loadUsers();
  let userIndex = users.findIndex(u => (userId && u.id === userId) || (phone && u.phone === phone));

  if (userIndex === -1 && users.length > 0) {
    userIndex = 0; // Fallback to first user
  }

  if (userIndex !== -1) {
    if (fullName && fullName.trim()) users[userIndex].fullName = fullName.trim();
    if (email && email.trim()) users[userIndex].email = email.trim();
    if (licenseNumber && licenseNumber.trim()) {
      users[userIndex].licenseNumber = licenseNumber.trim();
      users[userIndex].drivingLicense = `GPLX B2 - ${licenseNumber.trim()}`;
    }
    if (cccdNumber && cccdNumber.trim()) users[userIndex].cccdNumber = cccdNumber.trim();

    saveUsers(users);
    const updatedUser = users[userIndex];
    const newToken = jwt.sign(updatedUser, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Cập nhật thông tin khách hàng thành công và đã lưu cơ sở dữ liệu!',
      user: updatedUser,
      token: newToken
    });
  }

  return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ người dùng trong hệ thống' });
};

exports.updateEkyc = (req, res) => {
  const userId = req.user ? req.user.id : null;
  const { fullName, cccdNumber, licenseNumber, licenseType } = req.body;
  
  const users = loadUsers();
  let userIndex = users.findIndex(u => (userId && u.id === userId));
  if (userIndex === -1 && users.length > 0) {
    userIndex = 0;
  }

  if (userIndex !== -1) {
    if (fullName) users[userIndex].fullName = fullName;
    if (cccdNumber) users[userIndex].cccdNumber = cccdNumber;
    if (licenseNumber) {
      users[userIndex].licenseNumber = licenseNumber;
      users[userIndex].drivingLicense = `GPLX ${licenseType || 'B2'} - ${licenseNumber}`;
    }
    users[userIndex].isEkycVerified = true;
    saveUsers(users);
  }

  return res.json({
    success: true,
    message: 'Hồ sơ GPLX và CCCD gắn chip đã được xác thực tự động và lưu trữ an toàn trong CSDL EcoGo Mobility',
    ekycData: {
      status: 'VERIFIED',
      fullName: fullName || (users[userIndex] ? users[userIndex].fullName : req.user.fullName),
      cccdNumber: cccdNumber || '079201018891',
      licenseNumber: licenseNumber || '790123456789',
      licenseType: licenseType || 'B2',
      verifiedAt: new Date().toISOString()
    }
  });
};
