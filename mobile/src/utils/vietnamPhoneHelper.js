/**
 * Bộ công cụ chuẩn hóa & kiểm tra số điện thoại di động Việt Nam
 * Tuân theo quy chuẩn của Bộ Thông tin & Truyền thông và chuẩn quốc tế ITU-T / E.164
 */

// Bảng tra cứu các đầu số mạng di động chính thức tại Việt Nam (2 chữ số sau số 0 / sau +84)
export const VN_CARRIERS = {
  VIETTEL: {
    name: 'Viettel',
    prefixes: ['86', '96', '97', '98', '32', '33', '34', '35', '36', '37', '38', '39'],
    color: '#ED1C24',
    bg: '#FEF2F2'
  },
  MOBIFONE: {
    name: 'MobiFone',
    prefixes: ['89', '90', '93', '70', '79', '77', '76', '78'],
    color: '#005BAA',
    bg: '#EFF6FF'
  },
  VINAPHONE: {
    name: 'VinaPhone',
    prefixes: ['88', '91', '94', '83', '84', '85', '81', '82'],
    color: '#00A0E9',
    bg: '#F0F9FF'
  },
  VIETNAMOBILE: {
    name: 'Vietnamobile',
    prefixes: ['92', '56', '58'],
    color: '#FF6F00',
    bg: '#FFFBEB'
  },
  GMOBILE: {
    name: 'Gmobile',
    prefixes: ['99', '59'],
    color: '#EAB308',
    bg: '#FEFCE8'
  },
  WINTEL: {
    name: 'Wintel',
    prefixes: ['55'],
    color: '#DC2626',
    bg: '#FEF2F2'
  },
  ITELECOM: {
    name: 'Itelecom',
    prefixes: ['87'],
    color: '#0D9488',
    bg: '#F0FDFA'
  }
};

// Danh sách các số Sandbox phục vụ kiểm thử hệ thống
export const WHITELIST_DEMO_NUMBERS = [
  '386726647',
  '908123456',
  '912345678'
];

/**
 * Chuẩn hóa số điện thoại người dùng nhập:
 * - Loại bỏ toàn bộ ký tự không phải số.
 * - Tự động loại bỏ mã quốc gia 84 ở đầu nếu có.
 * - Tự động loại bỏ số 0 ở đầu (vì giao diện đã có tiền tố +84).
 * - Cắt đúng tối đa 9 chữ số di động chuẩn.
 */
export const normalizeVnPhone = (input) => {
  if (!input) return '';
  let clean = String(input).replace(/\D/g, '');

  if (clean.startsWith('84')) {
    clean = clean.slice(2);
  }
  while (clean.startsWith('0')) {
    clean = clean.slice(1);
  }

  return clean.slice(0, 9);
};

/**
 * Định dạng hiển thị phân tách dấu cách chuẩn mắt:
 * 9 chữ số -> "xxx xxx xxx" (VD: "908 123 456")
 */
export const formatVnPhoneDisplay = (digits) => {
  if (!digits) return '';
  const clean = normalizeVnPhone(digits);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
};

/**
 * Định dạng quốc gia đầy đủ:
 * "908123456" -> "+84 908 123 456"
 */
export const formatInternationalPhone = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (!clean) return '+84';
  return `+84 ${formatVnPhoneDisplay(clean)}`;
};

/**
 * Định dạng quốc nội (có số 0 ở đầu):
 * "908123456" -> "0908 123 456"
 */
export const formatNationalPhone = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (!clean) return '';
  const national = '0' + clean;
  if (national.length <= 4) return national;
  if (national.length <= 7) return `${national.slice(0, 4)} ${national.slice(4)}`;
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
};

/**
 * Phát hiện mẫu số ảo / số rác / dãy số thử nghiệm bàn phím
 */
export const isDummyOrSpamPattern = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (clean.length < 9) return { isSpam: false };

  if (WHITELIST_DEMO_NUMBERS.includes(clean)) {
    return { isSpam: false };
  }

  // 1. Kiểm tra 5 chữ số liên tiếp giống hệt nhau (ví dụ: 00000, 11111, 88888, 99999)
  if (/(\d)\1{4,}/.test(clean)) {
    return { isSpam: true, reason: 'Chuỗi chữ số lặp vô nghĩa (không có thật trên mạng viễn thông)' };
  }

  // 2. Kiểm tra chuỗi tiến liên tục 6 chữ số (VD: 012345, 123456, 234567, 345678, 456789)
  const ascendingPatterns = ['012345', '123456', '234567', '345678', '456789'];
  for (const pat of ascendingPatterns) {
    if (clean.includes(pat)) {
      return { isSpam: true, reason: 'Dãy số phím ảo tăng dần (dãy số thử nghiệm không có thật)' };
    }
  }

  // 3. Kiểm tra chuỗi lùi liên tục 6 chữ số (VD: 987654, 876543, 765432, 654321, 543210)
  const descendingPatterns = ['987654', '876543', '765432', '654321', '543210'];
  for (const pat of descendingPatterns) {
    if (clean.includes(pat)) {
      return { isSpam: true, reason: 'Dãy số phím ảo giảm dần (dãy số thử nghiệm không có thật)' };
    }
  }

  // 4. Mẫu lặp chu kỳ 2 số lặp 3 lần (VD: 121212, 090909)
  if (/(\d{2})\1{2,}/.test(clean)) {
    return { isSpam: true, reason: 'Số lặp chu kỳ lặp lại vô nghĩa' };
  }

  return { isSpam: false };
};

/**
 * Xác định nhà mạng viễn thông từ số điện thoại
 */
export const getCarrierInfo = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (clean.length < 2) return null;
  const prefix2 = clean.slice(0, 2);

  for (const key of Object.keys(VN_CARRIERS)) {
    const carrier = VN_CARRIERS[key];
    if (carrier.prefixes.includes(prefix2)) {
      return carrier;
    }
  }
  return null;
};

/**
 * Kiểm tra xác minh viễn thông toàn diện:
 * Hợp lệ khi:
 * - Đủ 9 chữ số sau +84
 * - Thuộc nhà mạng hợp lệ của Bộ TT&TT
 * - Không phải số rác / số ảo
 */
export const isValidVnMobile = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (clean.length !== 9) return false;
  const carrier = getCarrierInfo(clean);
  if (!carrier) return false;

  const dummy = isDummyOrSpamPattern(clean);
  return !dummy.isSpam;
};

/**
 * Trả về chi tiết kiểm tra viễn thông của thuê bao
 */
export const verifyTelecomSubscriber = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (clean.length !== 9) {
    return {
      isValid: false,
      isReal: false,
      message: 'Số điện thoại phải gồm đúng 9 chữ số sau +84'
    };
  }

  const carrier = getCarrierInfo(clean);
  if (!carrier) {
    return {
      isValid: false,
      isReal: false,
      message: `Đầu số 0${clean.slice(0, 2)} không tồn tại hoặc chưa được cấp phép tại Việt Nam.`
    };
  }

  const dummy = isDummyOrSpamPattern(clean);
  if (dummy.isSpam) {
    return {
      isValid: false,
      isReal: false,
      message: `Số không có thật trên mạng viễn thông: ${dummy.reason}.`
    };
  }

  return {
    isValid: true,
    isReal: true,
    carrier: carrier.name,
    carrierColor: carrier.color,
    carrierBg: carrier.bg,
    national: '0' + clean,
    e164: '+84' + clean
  };
};

/**
 * Trả về chuỗi lưu trữ chuẩn E.164 cho Database / Backend:
 * "908123456" -> "+84908123456"
 */
export const toE164 = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (!clean) return '';
  return `+84${clean}`;
};

/**
 * Trả về chuỗi nội địa lưu trữ cho Backend / SMS:
 * "908123456" -> "0908123456"
 */
export const toNational = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (!clean) return '';
  return `0${clean}`;
};
