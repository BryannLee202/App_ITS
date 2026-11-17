// Tiện ích hiển thị phôi ảnh chuẩn Giấy phép Lái xe (GPLX PET) cho EcoGo eKYC
// Hỗ trợ hiển thị ảnh mô phỏng chất lượng cao định dạng SVG Data URI chuẩn

export const createGplxFrontSvg = (name = 'KHÁCH HÀNG', licenseNo = '790123456789', birthYear = '1998') => {
  const safeName = (name || 'KHÁCH HÀNG').toUpperCase();
  const safeLicense = licenseNo || '790123456789';
  const safeYear = birthYear || '1998';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF7"/>
        <stop offset="50%" stop-color="#FCF3DC"/>
        <stop offset="100%" stop-color="#F5E4B5"/>
      </linearGradient>
      <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#9E7618"/>
      </linearGradient>
    </defs>

    <!-- Card Background -->
    <rect width="600" height="380" rx="20" fill="url(#bgGrad)" stroke="#C4A869" stroke-width="3"/>

    <!-- Guilloche Security Circles Pattern -->
    <g opacity="0.09" stroke="#6F4E37" stroke-width="1.2" fill="none">
      <circle cx="300" cy="190" r="140"/>
      <circle cx="300" cy="190" r="110"/>
      <circle cx="300" cy="190" r="80"/>
      <circle cx="300" cy="190" r="50"/>
      <circle cx="100" cy="190" r="70"/>
      <circle cx="500" cy="190" r="70"/>
    </g>

    <!-- Header Flag & Title -->
    <text x="300" y="38" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" font-weight="bold" fill="#2B1810" text-anchor="middle" letter-spacing="0.5">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</text>
    <text x="300" y="54" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="10" font-weight="500" fill="#5A3E26" text-anchor="middle">Độc lập - Tự do - Hạnh phúc</text>
    <line x1="210" y1="60" x2="390" y2="60" stroke="#9E7618" stroke-width="1.5"/>

    <text x="300" y="86" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="19" font-weight="900" fill="#C0392B" text-anchor="middle" letter-spacing="1">GIẤY PHÉP LÁI XE / DRIVER'S LICENSE</text>

    <!-- Photo Box -->
    <rect x="36" y="105" width="130" height="170" rx="10" fill="#EAE4D5" stroke="#C4A869" stroke-width="2"/>
    <!-- Silhouette Avatar -->
    <circle cx="101" cy="160" r="35" fill="#A8947C"/>
    <path d="M66 242 C66 198, 136 198, 136 242 Z" fill="#88735C"/>
    <!-- Chip Icon -->
    <rect x="135" y="115" width="22" height="18" rx="3" fill="#D4AF37" stroke="#9E7618" stroke-width="1"/>
    <!-- Badge B2 -->
    <rect x="36" y="282" width="130" height="28" rx="6" fill="url(#goldRibbon)"/>
    <text x="101" y="300" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">HẠNG B2 (Ô TÔ)</text>

    <!-- Details Box -->
    <text x="190" y="125" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="13" fill="#6A5A4A">Số / No.:</text>
    <text x="255" y="126" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="18" font-weight="bold" fill="#D32F2F" letter-spacing="1">${safeLicense}</text>

    <text x="190" y="156" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" fill="#6A5A4A">Họ và tên / Full name:</text>
    <text x="190" y="179" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="16" font-weight="bold" fill="#1A1D1F">${safeName}</text>

    <text x="190" y="208" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" fill="#6A5A4A">Năm sinh / DOB: <tspan font-weight="bold" fill="#1A1D1F">${safeYear}</tspan></text>
    <text x="385" y="208" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" fill="#6A5A4A">Quốc tịch: <tspan font-weight="bold" fill="#1A1D1F">VIỆT NAM</tspan></text>

    <text x="190" y="235" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" fill="#6A5A4A">Nơi cư trú: <tspan font-weight="bold" fill="#1A1D1F">TP. Hồ Chí Minh, Việt Nam</tspan></text>

    <!-- Sub Info Card -->
    <rect x="190" y="252" width="374" height="58" rx="8" fill="#FFFFFF" opacity="0.9" stroke="#E0D1B5" stroke-width="1.5"/>
    <text x="205" y="274" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" fill="#6A5A4A">Hạng xe: <tspan font-weight="bold" font-size="13" fill="#15803D">B2 (Ô tô tự lái dưới 9 chỗ)</tspan></text>
    <text x="205" y="296" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" fill="#6A5A4A">Thời hạn: <tspan font-weight="bold" fill="#D32F2F">15/08/2032 (Còn 6 năm hiệu lực)</tspan></text>

    <!-- eKYC Bar -->
    <rect x="36" y="324" width="528" height="38" rx="8" fill="#15803D"/>
    <text x="300" y="348" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓ HỒ SƠ ĐÃ XÁC THỰC OCR AI & ĐỐI SOÁT CƠ SỞ DỮ LIỆU BỘ GTVT</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

export const createGplxBackSvg = (licenseNo = '790123456789') => {
  const safeLicense = licenseNo || '790123456789';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGradBack" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF7"/>
        <stop offset="50%" stop-color="#FCF3DC"/>
        <stop offset="100%" stop-color="#F5E4B5"/>
      </linearGradient>
    </defs>

    <!-- Card Background -->
    <rect width="600" height="380" rx="20" fill="url(#bgGradBack)" stroke="#C4A869" stroke-width="3"/>

    <!-- Guilloche Security Circles Pattern -->
    <g opacity="0.09" stroke="#6F4E37" stroke-width="1.2" fill="none">
      <circle cx="300" cy="190" r="140"/>
      <circle cx="300" cy="190" r="90"/>
    </g>

    <!-- Header Back -->
    <text x="36" y="36" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" font-weight="bold" fill="#2B1810">CÁC HẠNG XE ĐƯỢC PHÉP ĐIỀU KHIỂN</text>

    <!-- Categories Table -->
    <rect x="36" y="50" width="370" height="190" rx="6" fill="#FFFFFF" opacity="0.9" stroke="#D1C09E" stroke-width="1.5"/>
    <!-- Row 1: A1, A2 -->
    <line x1="36" y1="88" x2="406" y2="88" stroke="#E8DDCA" stroke-width="1"/>
    <text x="50" y="74" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" font-weight="bold" fill="#4E3322">Hạng A1, A2:</text>
    <text x="140" y="74" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="10" fill="#6A5A4A">Mô tô 2 bánh từ 50cm3 trở lên</text>

    <!-- Row 2: B1 -->
    <line x1="36" y1="126" x2="406" y2="126" stroke="#E8DDCA" stroke-width="1"/>
    <text x="50" y="112" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" font-weight="bold" fill="#4E3322">Hạng B1:</text>
    <text x="140" y="112" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="10" fill="#6A5A4A">Ô tô tự động chở người đến 9 chỗ</text>

    <!-- Row 3: B2 (HIGHLIGHTED ACTIVE) -->
    <rect x="38" y="128" width="366" height="38" fill="#E8F5E9"/>
    <line x1="36" y1="166" x2="406" y2="166" stroke="#C8E6C9" stroke-width="1.5"/>
    <text x="50" y="152" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="12" font-weight="bold" fill="#15803D">Hạng B2 (✓):</text>
    <text x="140" y="152" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" font-weight="bold" fill="#15803D">Ô tô chở người đến 9 chỗ, tải &lt; 3.5T</text>

    <!-- Row 4: C, D, E -->
    <text x="50" y="190" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" font-weight="bold" fill="#4E3322">Hạng C, D, E:</text>
    <text x="140" y="190" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="10" fill="#6A5A4A">Ô tô tải nặng, xe khách trên 30 chỗ</text>

    <!-- QR Code Box on Top Right -->
    <rect x="424" y="50" width="140" height="140" rx="10" fill="#FFFFFF" stroke="#C4A869" stroke-width="2"/>
    <!-- Simulated QR Modules -->
    <g fill="#1A1D1F">
      <!-- QR Corner 1 -->
      <rect x="436" y="62" width="32" height="32" rx="4"/>
      <rect x="442" y="68" width="20" height="20" rx="2" fill="#FFFFFF"/>
      <rect x="447" y="73" width="10" height="10" rx="1" fill="#1A1D1F"/>
      <!-- QR Corner 2 -->
      <rect x="520" y="62" width="32" height="32" rx="4"/>
      <rect x="526" y="68" width="20" height="20" rx="2" fill="#FFFFFF"/>
      <rect x="531" y="73" width="10" height="10" rx="1" fill="#1A1D1F"/>
      <!-- QR Corner 3 -->
      <rect x="436" y="146" width="32" height="32" rx="4"/>
      <rect x="442" y="152" width="20" height="20" rx="2" fill="#FFFFFF"/>
      <rect x="447" y="157" width="10" height="10" rx="1" fill="#1A1D1F"/>
      <!-- QR Data Points -->
      <rect x="476" y="65" width="8" height="8"/>
      <rect x="492" y="65" width="12" height="8"/>
      <rect x="480" y="80" width="16" height="8"/>
      <rect x="504" y="80" width="8" height="16"/>
      <rect x="476" y="102" width="10" height="10"/>
      <rect x="494" y="102" width="18" height="10"/>
      <rect x="440" y="110" width="10" height="18"/>
      <rect x="480" y="125" width="12" height="12"/>
      <rect x="500" y="125" width="14" height="8"/>
      <rect x="480" y="145" width="14" height="14"/>
      <rect x="510" y="145" width="12" height="20"/>
      <rect x="530" y="110" width="14" height="14"/>
      <rect x="490" y="165" width="20" height="10"/>
      <rect x="525" y="170" width="15" height="10"/>
    </g>
    <rect x="424" y="196" width="140" height="26" rx="6" fill="#15803D"/>
    <text x="494" y="213" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">QR CHÍNH THỨC BỘ GTVT</text>

    <!-- Authority Signature & Stamp -->
    <text x="36" y="268" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" fill="#6A5A4A">Ngày cấp / Date of issue: <tspan font-weight="bold" fill="#1A1D1F">15/08/2022</tspan></text>
    <text x="36" y="292" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" fill="#6A5A4A">Nơi cấp: <tspan font-weight="bold" fill="#1A1D1F">SỞ GIAO THÔNG VẬN TẢI TP. HỒ CHÍ MINH</tspan></text>

    <!-- Red Authority Stamp Seal -->
    <circle cx="494" cy="285" r="34" fill="none" stroke="#C0392B" stroke-width="2.5" opacity="0.85"/>
    <circle cx="494" cy="285" r="30" fill="none" stroke="#C0392B" stroke-width="1" opacity="0.75"/>
    <text x="494" y="278" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="7" font-weight="bold" fill="#C0392B" text-anchor="middle">SỞ GTVT</text>
    <text x="494" y="290" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="8" font-weight="bold" fill="#C0392B" text-anchor="middle">TP. HỒ CHÍ MINH</text>

    <!-- Bottom Bar -->
    <rect x="36" y="324" width="528" height="38" rx="8" fill="#4E3322"/>
    <text x="300" y="348" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle">MÃ ĐỊNH DANH GPLX ĐIỆN TỬ: ${safeLicense} · ECOGO VERIFIED</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

export const SAMPLE_GPLX_FRONT = createGplxFrontSvg('KHÁCH HÀNG', '790123456789', '1998');
export const SAMPLE_GPLX_BACK = createGplxBackSvg('790123456789');
