# EcoGo Smart - Hệ Thống Cho Thuê Phương Tiện Giao Thông Thông Minh (ITS)

<div align="center">

<img src="./docs/screenshots/ui_00_logo_splash.png" alt="EcoGo Smart Logo" width="220" style="border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);" />

### **Hệ Thống Giao Thông Thông Minh Đô Thị — Nền Tảng Đặt & Quản Lý Thuê Phương Tiện Giao Thông Xanh 24/7**

[![CI / Build Status](https://img.shields.io/badge/Build-Passing-10b981?style=for-the-badge&logo=github-actions)](https://github.com/BryannLee202/App_ITS)
[![Mobile Platform](https://img.shields.io/badge/React%20Native-Expo%20SDK%2058-38bdf8?style=for-the-badge&logo=react)](./mobile)
[![Backend API](https://img.shields.io/badge/Node.js-Express%20v24-68a063?style=for-the-badge&logo=nodedotjs)](./backend)
[![ITS Telematics](https://img.shields.io/badge/ITS%20Standard-Level%204%20Mobility-bc7155?style=for-the-badge&logo=google-maps)](./docs)
[![Academic Project](https://img.shields.io/badge/Course-UTH%20ITS%202026-blue?style=for-the-badge)](https://uth.edu.vn)

[📖 Tổng Quan](#-tổng-quan-dự-án) • [🏛️ Kiến Trúc](#-kiến-trúc-hệ-thống) • [✨ Tính Năng Nổi Bật](#-tính-năng-nổi-bật) • [🖼️ Giao Diện Màn Hình](#-giao-diện-ứng-dụng-thực-tế) • [📊 Sơ Đồ Thiết Kế](#-sơ-đồ-thiết-kế-hệ-thống-uml) • [🚀 Cài Đặt & Chạy](#-hướng-dẫn-cài-đặt--khởi-động-nhanh) • [🔐 Tài Khoản Demo](#-tài-khoản-demo-sẵn-có) • [📁 Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục-dự-án) • [👥 Đội Ngũ](#-phân-công-thực-hiện-đề-tài)

</div>

---

## 📖 Tổng Quan Dự Án

**EcoGo Smart Mobility** là đề tài nghiên cứu khoa học và phát triển ứng dụng di động cho môn học **"Chuyên đề: Hệ thống giao thông thông minh"** (Mã học phần: `012012203802`, Giảng viên hướng dẫn: **thầy Vũ Đình Long** — **Trường Đại học Giao thông Vận tải TP.HCM (UTH)**).

Hệ thống được thiết kế nhằm số hóa toàn diện quy trình tìm kiếm, đặt thuê và quản lý phương tiện giao thông tại TP. Hồ Chí Minh. Bằng việc kết hợp các công nghệ cốt lõi của **Hệ thống Giao thông Thông minh (ITS)** như **Định vị vệ tinh GPS**, **Bản đồ số GIS**, **Dữ liệu thời gian thực (Real-time Telematics)** và **Khóa số không chạm (Digital Key BLE/IoT)**, EcoGo Smart loại bỏ các rào cản thủ tục giấy tờ truyền thống, thúc đẩy xu hướng di chuyển xanh (Green Mobility) và giảm thiểu ùn tắc giao thông đô thị.

### 🎯 4 Trụ Cột Giá Trị Cốt Lõi

1. **🌿 Giao Thông Xanh & Bền Vững (Eco-Friendly Mobility)**:
   - Ưu tiên đội xe thuần điện không phát thải (ô tô điện VinFast VF3, VF8, VF e34; xe máy điện Klara S, Feliz; xe đạp thông minh).
   - Theo dõi hành trình, tính toán lượng khí thải $CO_2$ giảm phát thải sau mỗi chuyến đi và quy đổi thành điểm thưởng **EcoXu** đổi quà.
2. **📍 Định Vị GPS & Trạm Xe Thông Minh (Real-time Station Geolocation)**:
   - Bản đồ trạm số tích hợp hệ tọa độ GPS thực tế tại TP.HCM (UTH Bình Thạnh, Ga Metro Bến Thành, Landmark 81, Sân bay Tân Sơn Nhất, Đô thị Thủ Thiêm).
   - Kiểm tra trực quan số lượng phương tiện khả dụng, mức pin/nhiên liệu và dẫn đường thông minh tới trạm gần nhất.
3. **⚡ Thuê Xe Tự Động 24/7 & Hợp Đồng Điện Tử (Smart Self-Service)**:
   - Tự cấu hình thời gian thuê (theo giờ, theo ngày), nhận xe tại trạm EcoGo Hub hoặc giao xe tận nơi.
   - Ký kết Hợp đồng điện tử minh bạch, tích hợp thanh toán thẻ/ví điện tử và khôi phục mật khẩu bảo mật qua OTP.
4. **📊 Quản Trị Vận Hành & Doanh Thu Tập Trung (Fleet & Revenue Analytics)**:
   - Phân hệ Quản trị viên (Admin Portal) độc lập giúp theo dõi trạng thái đội xe thời gian thực, duyệt đơn thuê tức thì, quản lý khách hàng và phân tích doanh thu theo biểu đồ trực quan.

---

## 🏛️ Kiến Trúc Hệ Thống

Hệ thống được thiết kế theo mô hình phân lớp hiện đại (**Multi-Tier Architecture**), đảm bảo khả năng mở rộng linh hoạt, tách biệt rõ ràng giữa giao diện di động, tầng xử lý nghiệp vụ ITS và cơ sở dữ liệu:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Mobile & Responsive Web)               │
│         React Native (Expo SDK 58) + React Navigation + Vanilla CSS     │
│   - Splash Logo Screen & Màn hình Đăng nhập hiện đại                    │
│   - Bản đồ trạm xe GPS tương tác, Tìm kiếm & Lọc xe đa tiêu chí         │
│   - Buồng lái số mô phỏng Digital Key BLE, Hợp đồng & Thanh toán        │
│   - Ví điểm thưởng EcoXu, Lịch sử thuê & Phân hệ Quản trị Admin         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS REST API / WebSocket Stream
                                     │ Port 5000 / Dynamic Telematics
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CORE BACKEND & ITS SERVICES (Node.js)                │
│                         Express.js + Socket.IO Server                   │
│   - Auth Controller & JWT Session Middleware                            │
│   - Vehicle Management & Fleet Status Controller                        │
│   - Rental & Electronic Contract Booking Service                        │
│   - Voucher, Promotion & Eco Points Calculation Engine                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Real-time Telematics / Data Feed
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ITS TELEMATICS & ALGORITHMIC MODULES                 │
│   - Haversine Geofencing: Bán kính nhận/trả xe tại trạm Hub             │
│   - CO₂ Footprint Tracker: Đo đạc phát thải & tích lũy Eco Points       │
│   - Real-time GPS Position Feeder & Vehicle Sensor Telemetry            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ JSON Persistence / LocalStorage
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                          │
│   - Entities: TaiKhoan, KhachHang, QuanTriVien, PhuongTien, DiaDiem,    │
│               DonThue, ThanhToan, ViEco, Voucher, DanhGia, ThongBao     │
│   - Relational Schema mapping via UML Class Diagram                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Tính Năng Nổi Bật

| Phân Hệ Nghiệp Vụ | Mô Tả Chức Năng Chi Tiết |
|---|---|
| **📱 Khởi Động & Định Danh** | Màn hình Splash Logo thương hiệu EcoGo Smart; Giao diện Đăng nhập hiện đại tối giản với liên kết **Quên mật khẩu?** tinh tế; Đăng nhập nhanh qua số điện thoại, mật khẩu, OTP hoặc Google. |
| **🗺️ Bản Đồ Trạm Xe Số GPS** | Tích hợp bản đồ vệ tinh/số hiển thị mạng lưới trạm EcoGo Hub tại TP.HCM; đo khoảng cách thực tế, kiểm tra số lượng xe trống, mức pin và chỉ đường đến trạm. |
| **🔍 Tìm Kiếm & Lọc Đa Tiêu Chí** | Bộ lọc xe linh hoạt theo loại phương tiện (Ô tô điện, ô tô xăng, xe máy điện, xe tay ga, xe đạp), mức giá thuê theo giờ/ngày, địa điểm trạm và khoảng thời gian mong muốn. |
| **⚡ Chi Tiết Xe & Đặt Thuê** | Xem chi tiết thông số kỹ thuật (hộp số, dung lượng pin, số chỗ, màu sắc); lựa chọn gói thuê theo giờ hoặc theo ngày; chọn nhận xe tại trạm hoặc giao xe tận nơi. |
| **📜 Hợp Đồng Thuê & Chữ Ký Số** | Khởi tạo hợp đồng thuê phương tiện điện tử tự động; minh bạch quy chế cọc xe và bảo hiểm; khách hàng ký số xác nhận trực tiếp trên màn hình. |
| **💳 Thanh Toán & Mã Giảm Giá** | Đa dạng phương thức thanh toán: Ví điện tử (MoMo, ZaloPay), chuyển khoản ngân hàng QR Code hoặc tiền mặt; tích hợp bộ lọc áp dụng mã Voucher giảm giá tức thì. |
| **🎁 Ví Ưu Đãi & Điểm EcoXu** | Quản lý danh sách voucher; hệ thống tích điểm thưởng sinh thái EcoXu qua từng km di chuyển xanh; xếp hạng bậc thành viên (Eco Elite Ambassador). |
| **🚗 Hồ Sơ, Lịch Sử & Hóa Đơn** | Theo dõi chi tiết lịch sử các chuyến đi đã hoàn thành; tải hóa đơn điện tử VAT; quản lý thông tin GPLX và CCCD đã xác thực; gửi đánh giá số sao dịch vụ. |
| **🛡️ Phân Hệ Quản Trị Admin** | Bảng điều khiển quản trị trung tâm dành cho người vận hành: theo dõi số lượng xe khả dụng, duyệt hoặc từ chối đơn thuê thời gian thực, quản lý khách hàng và thống kê doanh thu. |

---

## 🖼️ Giao Diện Ứng Dụng Thực Tế

Toàn bộ giao diện được thiết kế theo phong cách di động hiện đại, phối màu nâu trầm ấm kết hợp xanh lá nhận diện thương hiệu EcoGo Smart, phông chữ chuẩn sắc nét và trải nghiệm chạm mượt mà:

| Màn Hình Khởi Động (Logo App) | Trang Đăng Nhập & Quên Mật Khẩu |
|:---:|:---:|
| <img src="./docs/screenshots/ui_00_logo_splash.png" width="300" alt="Logo Splash" /> | <img src="./docs/screenshots/ui_01_dang_nhap.png" width="300" alt="Đăng Nhập" /> |
| *Màn hình biểu tượng Logo EcoGo Smart* | *Giao diện Đăng nhập với liên kết Quên mật khẩu nhỏ gọn* |

| Trang Chủ Ứng Dụng | Bản Đồ Trạm Xe Định Vị GPS |
|:---:|:---:|
| <img src="./docs/screenshots/ui_02_trang_chu.png" width="300" alt="Trang Chủ" /> | <img src="./docs/screenshots/ui_03_ban_do_tram_gps.png" width="300" alt="Bản Đồ GPS" /> |
| *Trang chủ tiện ích, danh mục xe & ưu đãi* | *Bản đồ định vị GPS hiển thị trạm xe xung quanh* |

| Tìm Kiếm & Bộ Lọc Phương Tiện | Chi Tiết Xe & Cấu Hình Đặt |
|:---:|:---:|
| <img src="./docs/screenshots/ui_04_tim_kiem_phuong_tien.png" width="300" alt="Tìm Kiếm" /> | <img src="./docs/screenshots/ui_05_chi_tiet_dat_xe.png" width="300" alt="Chi Tiết Xe" /> |
| *Bộ lọc loại xe, mức giá và trạng thái pin* | *Xem ảnh xe, thông số kỹ thuật và chọn thời gian* |

| Hợp Đồng Điện Tử & Thanh Toán | Ví Ưu Đãi Voucher & EcoXu |
|:---:|:---:|
| <img src="./docs/screenshots/ui_06_thanh_toan_hop_dong.png" width="300" alt="Thanh Toán" /> | <img src="./docs/screenshots/ui_07_uu_dai_voucher_ecoxu.png" width="300" alt="Ví Voucher" /> |
| *Hợp đồng số, chiết khấu và bước thanh toán* | *Quản lý điểm EcoXu và áp dụng mã voucher* |

| Hồ Sơ Cá Nhân & Lịch Sử Thuê Xe | Bảng Điều Khiển Quản Trị (Admin) |
|:---:|:---:|
| <img src="./docs/screenshots/ui_09_ho_so_lich_su_thue.png" width="300" alt="Lịch Sử Thuê" /> | <img src="./docs/screenshots/ui_10_quan_tri_admin.png" width="300" alt="Admin Portal" /> |
| *Theo dõi đơn thuê, lịch sử hành trình & hóa đơn VAT* | *Phân hệ Admin duyệt đơn thuê, quản lý xe và thống kê* |

---

## 📊 Sơ Đồ Thiết Kế Hệ Thống (UML)

Hệ thống được thiết kế bài bản theo tiêu chuẩn UML 2.0 bằng công cụ Draw.io chuyên dụng cho sinh viên IT:

### 1. Sơ Đồ Use Case Tổng Quát
Toàn bộ tương tác giữa hai tác nhân chính **Khách hàng (User)** và **Quản trị viên (Admin)**:

<div align="center">
<img src="./docs/diagrams/usecase_tong_quat.png" width="700" alt="Use Case Tổng Quát" />
</div>

### 2. Phân Rã Use Case Chi Tiết Từng Phân Hệ
Hệ thống được phân rã thành các sơ đồ con chuyên biệt, chữ to rõ ràng, không bị rối mắt:

<details>
<summary><b>🔍 Nhấn để xem chi tiết 5 Sơ đồ Use Case Khách Hàng (User)</b></summary>

| Quản lý tài khoản | Tìm kiếm phương tiện |
|:---:|:---:|
| <img src="./docs/diagrams/uc_user_tai_khoan.png" width="380" /> | <img src="./docs/diagrams/uc_user_tim_kiem.png" width="380" /> |

| Đặt xe & Hợp đồng | Thanh toán & Quản lý thuê |
|:---:|:---:|
| <img src="./docs/diagrams/uc_user_dat_xe.png" width="380" /> | <img src="./docs/diagrams/uc_user_thanh_toan.png" width="380" /> |

| Nhóm tiện ích (Thông báo, Ví Eco, Hỗ trợ) |
|:---:|
| <img src="./docs/diagrams/uc_user_tien_ich.png" width="450" /> |

</details>

<details>
<summary><b>🛡️ Nhấn để xem chi tiết 6 Sơ đồ Use Case Quản Trị Viên (Admin)</b></summary>

| Tài khoản Admin | Quản lý khách hàng |
|:---:|:---:|
| <img src="./docs/diagrams/uc_admin_tai_khoan.png" width="380" /> | <img src="./docs/diagrams/uc_admin_khach_hang.png" width="380" /> |

| Quản lý phương tiện | Quản lý đơn thuê |
|:---:|:---:|
| <img src="./docs/diagrams/uc_admin_phuong_tien.png" width="380" /> | <img src="./docs/diagrams/uc_admin_don_thue.png" width="380" /> |

| Quản lý thanh toán | Thống kê số lượng xe & Doanh thu |
|:---:|:---:|
| <img src="./docs/diagrams/uc_admin_thanh_toan.png" width="380" /> | <img src="./docs/diagrams/uc_admin_thong_ke.png" width="380" /> |

</details>

### 3. Sơ Đồ Lớp (Class Diagram)
Mô hình hóa cấu trúc dữ liệu tĩnh của hệ thống với 12 thực thể chính (`TaiKhoan`, `KhachHang`, `QuanTriVien`, `PhuongTien`, `DiaDiem`, `DonThue`, `ThanhToan`, `ViEco`, `Voucher`, `DanhGia`, `ThongBao`, `YeuCauHoTro`), hiển thị đầy đủ thuộc tính, phương thức và quan hệ kế thừa/liên kết:

<div align="center">
<img src="./docs/diagrams/class_diagram_ecogo.png" width="850" alt="Class Diagram" />
</div>

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 📱 Frontend & Mobile
* **Framework**: React Native (Expo SDK 58), React 19, JavaScript ES6+
* **Điều hướng**: React Navigation (Bottom Tabs, Native Stack)
* **Bản đồ & Định vị**: React Native Maps, Geolocation API, Haversine Geofencing
* **Iconography & Styling**: Lucide Icons, Expo Vector Icons, Responsive CSS Variables

### 🖥️ Backend & API
* **Runtime**: Node.js (LTS v20 / v24)
* **Framework**: Express.js RESTful API Architecture
* **Thời gian thực (Real-time)**: Socket.IO Server (GPS Telematics Simulation)
* **Bảo mật**: JWT (JSON Web Token), CORS, Helmet, Input Sanitization

### 📊 Thiết Kế & Kiểm Thử
* **Mô hình hóa UML**: Draw.io (Sinh viên tiêu chuẩn), Visual Paradigm
* **Kiểm thử giao diện**: Playwright E2E Browser Testing, React Native DevTools
* **Tài liệu & Báo cáo**: Microsoft Word (.docx) & PDF tiêu chuẩn học thuật UTH (46 trang, phông Times New Roman 13-14pt, giãn dòng 1.3, không bullet chấm, căn lề chuẩn 3-2-2-2 cm).

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Động Nhanh

### Yêu Cầu Tiên Quyết
* Đã cài đặt **Node.js** (Khuyến nghị phiên bản v18, v20 hoặc v24 LTS).
* Trình quản lý gói **npm** hoặc **yarn**.
* Điện thoại thông minh cài ứng dụng **Expo Go** (iOS / Android) nếu muốn test trực tiếp trên điện thoại.

### Bước 1: Clone mã nguồn từ GitHub
```bash
git clone https://github.com/BryannLee202/App_ITS.git
cd App_ITS
```

### Bước 2: Khởi động Backend Server
Mở một cửa sổ dòng lệnh (Terminal 1):
```bash
cd backend
npm install
npm start
```
* Backend REST API sẽ chạy tại: **`http://localhost:5000`**
* Kiểm tra sức khỏe API: `http://localhost:5000/api/health`

### Bước 3: Khởi động Ứng dụng Di động
Mở một cửa sổ dòng lệnh thứ hai (Terminal 2):
```bash
cd mobile
npm install
npx expo start
```
* **Chạy trực tiếp trên Trình duyệt Web:** Nhấn phím `w` trong terminal hoặc truy cập `http://localhost:8081`.
* **Chạy trên Điện thoại di động:** Dùng camera điện thoại (iOS) hoặc ứng dụng Expo Go (Android) quét mã QR hiển thị trên màn hình terminal.

---

## 🔐 Tài Khoản Demo Sẵn Có

Hệ thống cấu hình sẵn các tài khoản demo phục vụ thuyết trình và chấm điểm đồ án:

| Vai trò | Số điện thoại / Email | Mật khẩu mặc định | Quyền hạn & Chức năng kiểm thử |
|---|---|---|---|
| **Khách Hàng (User)** | `0901234567` / `user@ecogo.vn` | `EcoGo@2026` | Tìm xe, xem bản đồ GPS, đặt thuê xe, ký hợp đồng, áp dụng voucher, xem hóa đơn VAT |
| **Quản Trị Viên (Admin)** | `admin@ecogo.vn` | `Admin@2026` | Duyệt đơn thuê, cập nhật trạng thái xe, quản lý khách hàng, theo dõi báo cáo doanh thu |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
App_ITS/
├── backend/                                   # Mã nguồn Backend API & Telematics
│   ├── src/
│   │   ├── config.js                          # Cấu hình hệ thống, trạm Hub & phát thải
│   │   ├── server.js                          # Express app & Socket.IO server
│   │   ├── controllers/                       # Xử lý logic nghiệp vụ (Auth, Rental, Admin)
│   │   ├── routes/                            # Định tuyến REST endpoints
│   │   ├── services/                          # Dịch vụ tính toán ITS, định vị GPS
│   │   └── data/                              # Dữ liệu mẫu (phương tiện, trạm xe, vouchers)
│   └── package.json
├── mobile/                                    # Mã nguồn ứng dụng di động React Native
│   ├── App.js                                 # Điểm khởi chạy ứng dụng & Root Navigation
│   ├── app.json                               # Cấu hình Expo, quyền định vị GPS & icons
│   ├── src/
│   │   ├── screens/                           # Màn hình chức năng (Home, Map, Booking, Admin...)
│   │   ├── components/                        # Thành phần UI tái sử dụng (Header, Cards, Modals)
│   │   ├── services/                          # Kết nối API Backend & LocalStorage
│   │   └── styles/theme.js                    # Hệ màu nhận diện thương hiệu EcoGo Smart
│   └── package.json
├── docs/                                      # Tài liệu học thuật & hồ sơ thiết kế
│   ├── diagrams/                              # Trọn bộ 15 sơ đồ UML Use Case & Class Diagram
│   ├── screenshots/                           # Bộ 13 ảnh chụp màn hình UI sắc nét 3x Ultra-HD
│   ├── Báo_cáo_Cuối_kỳ_..._EcoGo_Smart.docx   # File Word báo cáo cuối kỳ hoàn chỉnh (có Mục lục)
│   └── Báo_cáo_Cuối_kỳ_..._EcoGo_Smart.pdf    # File PDF báo cáo cuối kỳ xuất từ Word (46 trang)
├── README.md                                  # Tài liệu giới thiệu dự án chính
└── .gitignore
```

---

## 👥 Phân Công Thực Hiện Đề Tài

Dự án được thực hiện bởi nhóm sinh viên **Trường Đại học Giao thông Vận tải TP.HCM (UTH)**:

| STT | Sinh Viên Thực Hiện | Mã Sinh Viên | Vai Trò & Phân Hệ Phụ Trách Chính |
|:---:|---|:---:|---|
| **1** | **Lê Minh Tài** | *Trưởng nhóm* | Kiến trúc hệ thống, Phát triển phân hệ Đặt xe, Hợp đồng điện tử, Quản trị Admin, Viết báo cáo cuối kỳ |
| **2** | **Thành viên nhóm** | *Thành viên* | Khảo sát nhu cầu người dùng, Thiết kế sơ đồ Use Case & Class Diagram, Xây dựng kịch bản kiểm thử |
| **3** | **Thành viên nhóm** | *Thành viên* | Xây dựng giao diện ứng dụng di động, Tích hợp bản đồ số GPS trạm xe, Tính toán điểm thưởng EcoXu |

* **Giảng viên hướng dẫn:** **thầy Vũ Đình Long**
* **Khoa / Viện:** Viện Công nghệ Thông tin và Điện, Điện tử — Trường ĐH Giao thông Vận tải TP.HCM.

---

## 📜 Tài Liệu Báo Cáo Đính Kèm

Toàn bộ báo cáo học thuật cuối kỳ đã được định dạng chuẩn mực (Mục lục, Danh mục hình ảnh, Danh mục bảng biểu, đầy đủ 8 chương, không bullet AI, sơ đồ sắc nét):
* 📄 **Bản Word nộp bài:** [Báo_cáo_Cuối_kỳ_Ứng_dụng_cho_thuê_phương_tiện_giao_thông_EcoGo_Smart.docx](./docs/B%C3%A1o_c%C3%A1o_Cu%E1%BB%91i_k%E1%BB%B3_%E1%BB%A8ng_d%E1%BB%A5ng_cho_thu%C3%AA_ph%C6%B0%C6%A1ng_ti%E1%BB%87n_giao_th%C3%B4ng_EcoGo_Smart.docx)
* 📕 **Bản PDF in ấn:** [Báo_cáo_Cuối_kỳ_Ứng_dụng_cho_thuê_phương_tiện_giao_thông_EcoGo_Smart.pdf](./docs/B%C3%A1o_c%C3%A1o_Cu%E1%BB%91i_k%E1%BB%B3_%E1%BB%A8ng_d%E1%BB%A5ng_cho_thu%C3%AA_ph%C6%B0%C6%A1ng_ti%E1%BB%87n_giao_th%C3%B4ng_EcoGo_Smart.pdf)

---

<div align="center">
⭐ <i>Dự án thuộc học phần Chuyên đề Hệ thống Giao thông Thông minh (ITS) - UTH 2026. Mọi đóng góp và thắc mắc xin vui lòng mở Issue hoặc Pull Request trên GitHub.</i> ⭐
</div>
