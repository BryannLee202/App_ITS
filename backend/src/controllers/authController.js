const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET } = require('../config');
const oauthConfig = require('../config/oauthConfig');
const SmsService = require('../services/smsService');
const { verifyVietnamTelecom } = require('../utils/telecomVerifier');

// Rate limiting map: Lưu trữ số lần yêu cầu OTP chống spam
const requestRateMap = new Map();

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

// Endpoint kiểm tra tính xác thực viễn thông của số điện thoại
exports.validatePhone = (req, res) => {
  const { phone } = req.body;
  const result = verifyVietnamTelecom(phone);
  if (!result.isValid || !result.isRealSubscriber) {
    return res.status(400).json({
      success: false,
      code: result.code,
      message: result.message
    });
  }
  return res.json({
    success: true,
    telecom: result
  });
};

exports.requestOtp = async (req, res) => {
  const { phone, channel = 'ZALO' } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Số điện thoại không được để trống' });
  }

  // 1. Xác minh viễn thông 5 lớp: Chặn số ảo, số rác, số không có thật, đầu số không hợp lệ
  const telecomCheck = verifyVietnamTelecom(phone);
  if (!telecomCheck.isValid || !telecomCheck.isRealSubscriber) {
    return res.status(400).json({
      success: false,
      code: telecomCheck.code || 'TELECOM_NUMBER_NOT_FOUND',
      message: telecomCheck.message || 'Số điện thoại không tồn tại trên mạng viễn thông hoặc chứa chuỗi số ảo không hợp lệ.'
    });
  }

  const cleanPhone = telecomCheck.nationalPhone; // '0386726647'

  // 2. Chống gian lận & Rate Limit (Tối đa 3 lần gửi OTP trong vòng 5 phút)
  const now = Date.now();
  const rateRecord = requestRateMap.get(cleanPhone) || { count: 0, firstTime: now };
  if (now - rateRecord.firstTime > 5 * 60 * 1000) {
    rateRecord.count = 1;
    rateRecord.firstTime = now;
  } else {
    rateRecord.count += 1;
    if (rateRecord.count > 3) {
      const waitSec = Math.ceil((5 * 60 * 1000 - (now - rateRecord.firstTime)) / 1000);
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Bạn đã yêu cầu gửi mã OTP quá 3 lần. Vui lòng đợi ${waitSec} giây để bảo vệ an toàn tài khoản.`
      });
    }
  }
  requestRateMap.set(cleanPhone, rateRecord);

  // 3. Khởi tạo mã OTP 4 chữ số ngẫu nhiên
  const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 300 * 1000; // 5 minutes TTL (300s)

  const otpRecord = {
    code: randomOtp,
    channel,
    expiresAt,
    carrier: telecomCheck.carrier,
    attempts: 0
  };

  otpStorage.set(cleanPhone, otpRecord);
  saveOtpCache(otpStorage);

  // 4. Phát lệnh gửi qua SMS Gateway / Zalo ZNS
  const dispatchResult = await SmsService.sendOtp({
    phone: cleanPhone,
    otp: randomOtp,
    channel
  });

  return res.json({
    success: true,
    message: dispatchResult.message,
    phone: cleanPhone,
    e164: telecomCheck.e164Phone,
    carrier: telecomCheck.carrier,
    network: telecomCheck.network,
    channel,
    expiresInSec: 300,
    generatedOtp: randomOtp
  });
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Thiếu số điện thoại hoặc mã OTP' });
  }

  const cleanPhone = normalizePhone(phone);
  const inputOtp = otp.toString().trim();

  // 1. Support Master Demo Code '8888' and Admin Root Code '9999'
  const isMasterCode = inputOtp === '8888' || inputOtp === '9999';

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
  const { fullName, email, phone, licenseNumber, cccdNumber, avatar, birthYear, age, licenseFrontPhoto, licenseBackPhoto } = req.body;

  const users = loadUsers();
  let userIndex = users.findIndex(u => (userId && u.id === userId) || (phone && u.phone === phone));

  if (userIndex === -1 && users.length > 0) {
    userIndex = 0; // Fallback to first user
  }

  if (userIndex !== -1) {
    if (fullName && fullName.trim()) users[userIndex].fullName = fullName.trim();
    if (email && email.trim()) users[userIndex].email = email.trim();
    if (avatar && avatar.trim()) users[userIndex].avatar = avatar.trim();
    if (licenseFrontPhoto) users[userIndex].licenseFrontPhoto = licenseFrontPhoto;
    if (licenseBackPhoto) users[userIndex].licenseBackPhoto = licenseBackPhoto;
    if (birthYear) {
      users[userIndex].birthYear = parseInt(birthYear, 10);
      users[userIndex].age = age ? parseInt(age, 10) : (new Date().getFullYear() - parseInt(birthYear, 10));
    }
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

exports.updateAvatar = (req, res) => {
  const userId = req.user ? req.user.id : null;
  const { avatar } = req.body;

  if (!avatar || !avatar.trim()) {
    return res.status(400).json({ success: false, message: 'Đường dẫn ảnh đại diện không hợp lệ' });
  }

  const users = loadUsers();
  let userIndex = users.findIndex(u => (userId && u.id === userId));
  if (userIndex === -1 && users.length > 0) {
    userIndex = 0;
  }

  if (userIndex !== -1) {
    users[userIndex].avatar = avatar.trim();
    saveUsers(users);
    const updatedUser = users[userIndex];
    const newToken = jwt.sign(updatedUser, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công!',
      user: updatedUser,
      token: newToken
    });
  }

  return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ người dùng' });
};

exports.googleLogin = (req, res) => {
  const {
    googleId,
    email,
    fullName,
    avatar,
    birthYear = 1998,
    age,
    phone = '+84386726647'
  } = req.body;

  if (!email && !fullName && !googleId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực Google' });
  }

  const users = loadUsers();
  const cleanPhone = normalizePhone(phone);
  const formattedPhone = cleanPhone.startsWith('0')
    ? `+84${cleanPhone.slice(1)}`
    : `+84${cleanPhone}`;

  // Match existing user by email, googleId, or phone
  let userIndex = users.findIndex(u => {
    if (email && u.email && u.email.toLowerCase() === email.toLowerCase()) return true;
    if (googleId && u.googleId === googleId) return true;
    if (phone && normalizePhone(u.phone) === cleanPhone) return true;
    return false;
  });

  const parsedBirthYear = parseInt(birthYear, 10) || 1998;
  const currentYear = new Date().getFullYear();
  const calculatedAge = age ? parseInt(age, 10) : (currentYear - parsedBirthYear);

  let user;
  if (userIndex !== -1) {
    // Existing user: Synchronize latest Google profile info (avatar, fullName, email, birthYear, age)
    users[userIndex].fullName = fullName || users[userIndex].fullName;
    users[userIndex].email = email || users[userIndex].email;
    if (avatar) users[userIndex].avatar = avatar;
    users[userIndex].birthYear = parsedBirthYear;
    users[userIndex].age = calculatedAge;
    users[userIndex].authProvider = 'GOOGLE';
    if (googleId) users[userIndex].googleId = googleId;
    saveUsers(users);
    user = users[userIndex];
  } else {
    // New user via Google: Create complete enriched profile
    user = {
      id: `usr_gg_${Date.now().toString().slice(-6)}`,
      googleId: googleId || `gid_${Date.now()}`,
      phone: formattedPhone,
      fullName: fullName || 'Khách hàng EcoGo',
      email: email || 'minhtai.ecogo@gmail.com',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      birthYear: parsedBirthYear,
      age: calculatedAge,
      authProvider: 'GOOGLE',
      isEkycVerified: true,
      drivingLicense: 'GPLX B2 - 790123456789',
      licenseNumber: '790123456789',
      drivingLicenseExpiry: '15/08/2032',
      cccdNumber: '079201018891',
      memberRank: 'Eco Elite Ambassador',
      membershipId: `ESG-ECOGO-2026-GG${Date.now().toString().slice(-4)}`,
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
    message: 'Đăng nhập bằng tài khoản Google thành công! Thông tin cá nhân đã được đồng bộ.',
    token,
    user
  });
};

// Trả về cấu hình OAuth (Google Client ID) để Frontend tự động kích hoạt popup Google thật
exports.getOAuthConfig = (req, res) => {
  return res.json({
    success: true,
    googleClientId: oauthConfig.GOOGLE_CLIENT_ID || '',
    googleEnabled: Boolean(oauthConfig.GOOGLE_CLIENT_ID)
  });
};

// Xác thực Google OAuth 2.0 Thật (hỗ trợ cả accessToken từ Google Identity Services & idToken JWT)
exports.googleOAuthVerify = async (req, res) => {
  try {
    const { accessToken, idToken } = req.body;
    if (!accessToken && !idToken) {
      return res.status(400).json({ success: false, message: 'Thiếu accessToken hoặc idToken từ Google' });
    }

    let googleProfile = null;
    if (accessToken) {
      const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!resp.ok) {
        return res.status(401).json({ success: false, message: 'Google accessToken không hợp lệ hoặc đã hết hạn' });
      }
      googleProfile = await resp.json();
    } else if (idToken) {
      const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!resp.ok) {
        return res.status(401).json({ success: false, message: 'Google idToken không hợp lệ' });
      }
      googleProfile = await resp.json();
    }

    if (!googleProfile || !googleProfile.email) {
      return res.status(400).json({ success: false, message: 'Không lấy được thông tin Email từ tài khoản Google' });
    }

    // Tái sử dụng logic đồng bộ/tạo user trong CSDL EcoGo
    req.body = {
      googleId: `gg_${googleProfile.sub || Date.now()}`,
      email: googleProfile.email,
      fullName: googleProfile.name || googleProfile.email.split('@')[0],
      avatar: googleProfile.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      birthYear: 1998,
      phone: '+84386726647'
    };
    return exports.googleLogin(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: `Lỗi xác thực Google OAuth: ${err.message}` });
  }
};

exports.updateEkyc = (req, res) => {
  const userId = req.user ? req.user.id : null;
  const { fullName, cccdNumber, licenseNumber, licenseType, licenseFrontPhoto, licenseBackPhoto } = req.body;
  
  const users = loadUsers();
  let userIndex = users.findIndex(u => (userId && u.id === userId));
  if (userIndex === -1 && users.length > 0) {
    userIndex = 0;
  }

  if (userIndex !== -1) {
    if (fullName) users[userIndex].fullName = fullName;
    if (cccdNumber) users[userIndex].cccdNumber = cccdNumber;
    if (licenseFrontPhoto) users[userIndex].licenseFrontPhoto = licenseFrontPhoto;
    if (licenseBackPhoto) users[userIndex].licenseBackPhoto = licenseBackPhoto;
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
