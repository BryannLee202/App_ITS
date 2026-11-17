/**
 * Cấu hình OAuth 2.0 cho Google & Apple (iOS)
 * ---------------------------------------------------------
 * HƯỚNG DẪN HOÀN THIỆN CHO CHỦ SỞ HỮU:
 * 1. Vào Google Cloud Console -> Credentials -> Tạo OAuth Client ID (Web application)
 *    - Thêm Authorised JavaScript origins: https://ecogo-m7ln.onrender.com
 *    - Dán mã Client ID vào biến môi trường GOOGLE_CLIENT_ID trên Render (hoặc điền vào chuỗi bên dưới)
 * 2. Với Apple (iOS):
 *    - Nếu có tài khoản Apple Developer ($99/năm), tạo Services ID và dán vào APPLE_CLIENT_ID
 *    - Nếu chưa có, hệ thống tự động dùng luồng Đăng nhập Apple ID (Email iCloud) để hoạt động ngay!
 */
module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID || ''
};
