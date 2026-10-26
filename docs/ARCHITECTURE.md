# KIẾN TRÚC KỸ THUẬT & HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG ITS VEHICLE RENTAL

Hệ thống được thiết kế theo mô hình **Micro-Modular Architecture**, phân tách rõ ràng giữa Mobile Frontend, Real-time Gateway, Core API và IoT Telematics Engine.

---

## 1. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ

```
+-------------------------------------------------------------+
|                 MOBILE CLIENT (React Native Expo)           |
|  - HomeScreen (Search & Fleet Filter)                       |
|  - MapScreen (ITS Mobility Hubs & Clustered Pins)           |
|  - DigitalKeyScreen (BonbonCar BLE/Cloud Cockpit)           |
|  - TripsHistoryScreen (e-Contracts & CO2 Invoices)          |
|  - ProfileScreen (eKYC Verification & Eco Points Wallet)    |
+------------------------------+------------------------------+
                               |
                   HTTP/JSON   |   WebSocket (WSS)
                               v
+-------------------------------------------------------------+
|               BACKEND GATEWAY & API (Node.js)               |
|  - Express REST Controllers (/api/auth, /api/vehicles, ...) |
|  - Socket.IO Telematics Streamer (Real-time AVL & Ack)      |
|  - JWT Authentication & RBAC Middleware                     |
+------------------------------+------------------------------+
                               |
                               +-----------------------+
                               |                       |
                               v                       v
               +-------------------------------+  +--------------------------+
               |       ITS CORE ENGINE         |  |   TELEMATICS FLEET IO    |
               | - GLOSA Speed Advisory        |  | - AVL GPS Tracker        |
               | - LWR Traffic Shockwave       |  | - Digital Key IoT Hub    |
               | - Green Mobility (CO2/Trees)  |  | - Simulation Heartbeat   |
               | - Geofence Validator (r<=150m)|  | - Vehicle State Machine  |
               +-------------------------------+  +--------------------------+
```

---

## 2. ĐẶC TẢ API RESTFUL VÀ SOCKET.IO

### 2.1. REST API Endpoints

| Phương thức | Endpoint | Chức năng | Tham số chính |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/request-otp` | Yêu cầu gửi mã OTP SMS/Zalo | `{ phone }` |
| `POST` | `/api/auth/verify-otp` | Xác thực OTP & cấp phát JWT | `{ phone, otp }` (demo: 8888) |
| `GET` | `/api/auth/profile` | Lấy thông tin người dùng & eKYC | Header `Authorization: Bearer <token>` |
| `GET` | `/api/vehicles` | Danh sách phương tiện | `category`, `powerType`, `stationId` |
| `GET` | `/api/vehicles/:id` | Chi tiết xe & trạm đỗ | `id` |
| `GET` | `/api/vehicles/stations` | Danh sách trạm ITS Hub tại TP.HCM | - |
| `POST` | `/api/rentals/book` | Đặt thuê xe & ký hợp đồng điện tử | `{ vehicleId, durationHours, pickupStationId }` |
| `GET` | `/api/rentals/active` | Lấy chuyến đi hiện hành & khóa số | - |
| `POST` | `/api/rentals/control` | Thực thi lệnh chìa khóa số IoT | `{ tripId, command: 'LOCK'/'UNLOCK'/'HORN'/'ENGINE_START' }` |
| `POST` | `/api/rentals/complete` | Kết thúc chuyến & kiểm tra Geofence | `{ tripId, targetStationId }` |
| `GET` | `/api/its/green-wave` | Tính toán vận tốc làn sóng xanh GLOSA | `distanceMeters`, `currentSpeedKmh` |
| `POST` | `/api/its/shockwave` | Tính toán sóng xung kích LWR | `{ q1, k1, q2, k2 }` |
| `GET` | `/api/its/eco-calculator` | Tính toán CO₂ giảm phát thải | `distanceKm`, `powerType` |

### 2.2. Socket.IO Real-time Events

| Tên Event | Chiều gửi | Dữ liệu truyền tải | Mô tả |
| :--- | :--- | :--- | :--- |
| `fleet:initial` | Server -> Client | `{ vehicles, stations }` | Gửi toàn bộ trạng thái xe khi vừa kết nối |
| `trip:telemetry` | Server -> Client | `{ tripId, telematics, glosa, eco }` | Stream tọa độ GPS, GLOSA advisory, CO₂ mỗi 2.5s |
| `vehicle:control_ack` | Server -> Client | `{ vehicleId, command, message }` | Xác nhận phản hồi sau khi ấn nút trên Digital Key |
| `fleet:heartbeat` | Server -> Client | `{ activeVehiclesCount, availableCount }` | Nhịp tim giám sát hệ thống mỗi 10s |

---

## 3. HƯỚNG DẪN KHỞI CHẠY & KIỂM THỬ

### Bước 1: Khởi động Backend Telematics Server
```powershell
cd c:\App_ITS-main\backend
npm start
```
- Server chạy tại: `http://localhost:5000`
- Kiểm tra sức khỏe hệ thống: `http://localhost:5000/api/health`

### Bước 2: Khởi động Ứng dụng Di động Mobile
Mở cửa sổ dòng lệnh thứ hai:
```powershell
cd c:\App_ITS-main\mobile
npx expo start
```
- **Để xem trên Web (thuyết trình giảng đường):** Bấm phím `w` hoặc chạy `npx expo start --web`.
- **Để chạy trên điện thoại thật:** Mở ứng dụng **Expo Go** trên iOS/Android và quét mã QR hiển thị trên màn hình terminal.
