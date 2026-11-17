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

/**
 * Chuẩn hóa số điện thoại người dùng nhập:
 * - Loại bỏ toàn bộ ký tự không phải số.
 * - Tự động loại bỏ mã quốc gia 84 ở đầu nếu có.
 * - Tự động loại bỏ số 0 ở đầu (vì giao diện đã có tiền tố +84).
 * - Cắt đúng tối đa 9 chữ số di động chuẩn.
 * 
 * Ví dụ: 
 *   "0908 123 456"  -> "908123456"
 *   "+84386726647"  -> "386726647"
 *   "0084912345678" -> "912345678"
 */
export const normalizeVnPhone = (input) => {
  if (!input) return '';
  let clean = String(input).replace(/\D/g, '');

  // Xử lý tiền tố 84
  if (clean.startsWith('84')) {
    clean = clean.slice(2);
  }
  // Bỏ số 0 ở đầu nếu người dùng quen tay gõ 0
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
 * Kiểm tra xem chuỗi số có phải là số di động Việt Nam hợp lệ:
 * - Phải đủ 9 chữ số sau +84 (tương đương 10 số khi có số 0 ở đầu).
 * - Đầu số phải thuộc danh mục quy hoạch của Bộ TT&TT:
 *   3x (32-39), 5x (52,55,56,58,59), 7x (70,76-79), 8x (81-89), 9x (90-99).
 */
export const isValidVnMobile = (digits) => {
  const clean = normalizeVnPhone(digits);
  if (clean.length !== 9) return false;
  const VN_MOBILE_REGEX = /^(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  return VN_MOBILE_REGEX.test(clean);
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
