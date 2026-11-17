/**
 * Cấu hình OAuth 2.0 cho Google Sign-In
 * ---------------------------------------------------------
 * HƯỚNG DẪN:
 * Dán Google OAuth Client ID (từ Google Cloud Console) vào biến môi trường GOOGLE_CLIENT_ID trên Render.
 */
module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
};
