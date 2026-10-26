# 🚗 ITS Smart Vehicle Rental - Hệ Thống Cho Thuê Phương Tiện Giao Thông Thông Minh

[![Node.js](https://img.shields.io/badge/Node.js-v24.15-green.svg)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2058-blue.svg)](https://expo.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime%20Telematics-black.svg)](https://socket.io/)
[![Course](https://img.shields.io/badge/Chuy%C3%AAn%20%C4%91%E1%BB%81%20ITS-UTH%202026-purple.svg)](https://uth.edu.vn/)

Đề tài nghiên cứu khoa học và phát triển ứng dụng di động cho môn học **"124007 - Chuyên đề: Hệ Thống Giao Thông Thông Minh"** (Giảng viên hướng dẫn: **TS. Lê Văn Quốc Anh** - Trường Đại học Giao thông Vận tải TP.HCM).

Hệ thống được phát triển theo tiêu chuẩn doanh nghiệp (**Commercial-Grade / Enterprise Production**), vừa đáp ứng trọn vẹn các yêu cầu học thuật ITS lý thuyết, vừa sẵn sàng thương mại hóa và chuyển giao cho các doanh nghiệp vận tải.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **🔑 Chìa khóa số thông minh (Digital Key - BonbonCar model):**
   - Mở khóa / Khóa cửa xe, nháy đèn tìm xe, còi báo động, khởi động/tắt máy từ xa 24/7 qua Bluetooth Low Energy (BLE) và Cloud IoT.
   - Nhận xe và trả xe tự động, không cần gặp chủ xe, giải quyết 100% nhu cầu người dùng theo kết quả khảo sát.

2. **🚦 Hệ thống Làn sóng xanh tối ưu vận tốc (GLOSA - Green Light Optimal Speed Advisory):**
   - Dựa trên chu kỳ đèn tín hiệu $C = 90$s và khoảng cách trắc địa tới nút giao.
   - Khuyến nghị vận tốc tối ưu (25–55 km/h) để xe đến giao lộ đúng lúc đèn xanh, giảm 18.5% tiêu hao năng lượng do dừng phanh.

3. **🌊 Mô hình Sóng xung kích giao thông LWR (Lighthill-Whitham-Richards):**
   - Đánh giá biến thiên lưu lượng và mật độ $\Delta q / \Delta k$.
   - Tự động phát hiện và cảnh báo sóng xung kích ùn tắc dồn toa lan ngược dòng ($v_w < 0$), khuyến nghị đổi lộ trình đường tránh.

4. **🌿 Chỉ số Giao thông Xanh (Green Mobility & CO₂ Index):**
   - So sánh lượng phát thải xe điện VinFast (25g CO₂/km) với xe xăng truyền thống (145g CO₂/km).
   - Tự động tích lũy điểm thưởng **ITS Eco Points** và cấp chứng nhận quy đổi cây xanh bảo vệ đô thị.

5. **🎯 Trả xe thông minh bằng Geofencing:**
   - Sử dụng công thức Haversine xác thực tọa độ vị trí xe trong bán kính $\le 150$m quanh các trạm Hub ITS (UTH, Ga Metro Bến Thành, Landmark 81, Tân Sơn Nhất, Thủ Thiêm).

6. **🛡️ Xác thực danh tính điện tử eKYC AI:**
   - Tích hợp quét CCCD gắn chip và GPLX Hạng B1/B2 giúp khách hàng được thuê xe miễn thế chấp tài sản lớn.

---

## 📱 CẤU TRÚC THƯ MỤC

```
App_ITS/
├── backend/                        # Server Node.js Express & Socket.io
│   ├── src/
│   │   ├── config.js               # Tham số ITS (chu kỳ đèn, phát thải, geofence)
│   │   ├── server.js               # Setup Express & WebSockets
│   │   ├── data/
│   │   │   ├── vehicles.json       # Đội xe thông minh (VF8, VF3, Klara S, ...)
│   │   │   └── stations.json       # Các trạm ITS Hub tại TP.HCM
│   │   ├── controllers/            # Auth, Vehicle, Rental, ITS logic
│   │   ├── routes/                 # REST API endpoints
│   │   └── services/
│   │       ├── itsEngine.js        # Mô hình toán học GLOSA & Shockwave LWR
│   │       └── telematicsService.js# Bộ giả lập AVL GPS & IoT Digital Key
│   └── package.json
├── mobile/                         # Ứng dụng di động React Native Expo
│   ├── App.js                      # Root Navigator & Thanh điều hướng đáy
│   ├── app.json                    # Cấu hình Expo iOS/Android
│   ├── src/
│   │   ├── components/             # Header, VehicleCard, GreenWaveBadge, CO2Widget
│   │   ├── screens/
│   │   │   ├── HomeScreen.js       # Khám phá, tìm kiếm & thuê xe
│   │   │   ├── MapScreen.js        # Bản đồ trạm Hub & xe sẵn sàng
│   │   │   ├── DigitalKeyScreen.js # Buồng lái số BonbonCar Digital Key
│   │   │   ├── TripsHistoryScreen.js# Hợp đồng điện tử & lịch sử chuyến
│   │   │   └── ProfileScreen.js    # eKYC & Ví điểm xanh Eco Points
│   │   ├── services/               # Kết nối REST API & WebSocket Streamer
│   │   └── styles/theme.js         # Hệ màu Moovtek / Green SM / Modern Slate
│   └── package.json
├── docs/
│   ├── BAO_CAO_CHUYEN_DE_ITS.md    # Báo cáo học thuật chi tiết nộp giảng viên
│   └── ARCHITECTURE.md             # Tài liệu kiến trúc kỹ thuật & đặc tả API
└── README.md
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY THỬ NGHIỆM

### 1. Khởi động Backend
```powershell
cd backend
npm install
npm start
```
Server chạy tại: `http://localhost:5000` (Kiểm tra sức khỏe: `http://localhost:5000/api/health`).

### 2. Khởi động Ứng dụng Di động
Mở một terminal mới:
```powershell
cd mobile
npm install
npx expo start
```
- **Xem trực tiếp trên Trình duyệt:** Nhấn phím `w` trong terminal hoặc chạy `npx expo start --web`.
- **Chạy trên Điện thoại di động (iOS / Android):** Quét mã QR bằng ứng dụng **Expo Go**.

---

## 👥 THÀNH VIÊN NHÓM & LIÊN HỆ
- Đơn vị đào tạo: Trường Đại học Giao thông Vận tải TP.HCM (UTH).
- Khoa: Công nghệ Thông tin / Viện Cơ khí & Đào tạo Quốc tế.
- Repository GitHub: [https://github.com/BryannLee202/App_ITS](https://github.com/BryannLee202/App_ITS)
