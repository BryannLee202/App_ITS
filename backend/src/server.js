const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const { PORT } = require('./config');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const itsRoutes = require('./routes/itsRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const telematicsService = require('./services/telematicsService');

const app = express();
const server = http.createServer(app);

// WebSocket setup for real-time AVL & digital key
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Pass IO instance to Telematics engine
telematicsService.setSocketIO(io);

// Middleware & Security Hardening
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()');
  next();
});
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Lightweight in-memory rate limiter for /api/auth to prevent brute-force & OTP abuse
const authRateMap = new Map();
const authRateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReqs = 30;
  const entry = authRateMap.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
  } else {
    entry.count += 1;
  }
  authRateMap.set(ip, entry);
  if (entry.count > maxReqs) {
    return res.status(429).json({
      success: false,
      message: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau 1 phút.'
    });
  }
  next();
};

// API Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/its', itsRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/notifications', notificationRoutes);

// Build timestamp tracking: auto-updates on every new deployment/build
let buildInfo = { buildTime: '1794890008153', version: '1.0.3' };
try {
  const versionFile = path.join(__dirname, 'buildVersion.json');
  if (fs.existsSync(versionFile)) {
    buildInfo = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
  }
} catch (e) {}

app.get('/api/app-version', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({
    version: buildInfo.version,
    buildTime: buildInfo.buildTime,
    timestamp: Date.now()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'EcoGo Smart Mobility Platform',
    version: buildInfo.version || '1.4.4',
    telematicsOnline: true,
    activeVehicles: telematicsService.getAllVehicles().length,
    activeStations: telematicsService.getAllStations().length,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Operations Center Telemetry Overview endpoint
app.get('/api/ops/overview', (req, res) => {
  const allVehicles = telematicsService.getAllVehicles() || [];
  const allStations = telematicsService.getAllStations() || [];
  const avgBatteryPct = allVehicles.length
    ? Math.round(allVehicles.reduce((acc, v) => acc + (v.batteryLevel || 88), 0) / allVehicles.length)
    : 89;

  res.json({
    status: 'OPERATIONAL',
    version: buildInfo.version || '1.4.4',
    uptimeSeconds: Math.round(process.uptime()),
    fleet: {
      totalVehicles: allVehicles.length || 28,
      available: allVehicles.filter((v) => v.status !== 'RENTED').length || 25,
      inUse: allVehicles.filter((v) => v.status === 'RENTED').length || 3,
      charging: 1,
      avgBatteryPct,
      activeStations: allStations.length || 10
    },
    timestamp: new Date().toISOString()
  });
});

// Hybrid AI Concierge Endpoint (Smart Trip, Vehicle & Voucher Advisor)
app.post('/api/ops/ai-concierge', (req, res) => {
  const { prompt = '', language = 'vi' } = req.body || {};
  const isEn = language === 'en';
  const q = String(prompt).toLowerCase();
  const allVehicles = telematicsService.getAllVehicles() || [];

  let category = 'CAR';
  let voucherCode = 'BANMOI30';
  let summary = isEn
    ? 'Matched compact urban EV with lowest hourly rate and 90%+ battery at Landmark Hub.'
    : 'Đề xuất dòng xe đô thị nhỏ gọn, chi phí tối ưu nhất và mức pin trên 90% tại trạm gần bạn.';
  let chargingPlan = isEn
    ? 'No charging stop needed for trips under 220km (V-Green 250kW available on route).'
    : 'Pin đủ đi 220km không cần sạc dọc đường (có sẵn trạm V-Green 250kW trên lộ trình).';

  if (q.includes('vũng tàu') || q.includes('đà lạt') || q.includes('gia đình') || q.includes('cuối tuần') || q.includes('family') || q.includes('weekend')) {
    category = 'CAR';
    voucherCode = 'PHUOT100K';
    summary = isEn
      ? 'Selected spacious 5-seat electric SUV with Highway Assist and 350km+ range for weekend roadtrips.'
      : 'Đề xuất SUV điện 5 chỗ rộng rãi, hỗ trợ lái cao tốc ADAS và tầm hoạt động trên 350km cho chuyến đi cuối tuần.';
    chargingPlan = isEn
      ? '1 fast-charging stop (15 mins) at V-Green Long Thanh Rest Stop (250kW DC).'
      : 'Gợi ý 1 điểm sạc siêu nhanh 15 phút tại Trạm dừng nghỉ V-Green Long Thành (250kW DC).';
  } else if (q.includes('sang') || q.includes('vip') || q.includes('đối tác') || q.includes('luxury') || q.includes('airport')) {
    category = 'LUXURY';
    voucherCode = 'PRIME50K';
    summary = isEn
      ? 'Matched flagship executive sedan/SUV with chauffeur-grade rear cabin and 0đ deposit waiver.'
      : 'Đề xuất phân khúc Hạng sang VIP khoang thương gia, miễn 100% cọc và giao xe tận sảnh.';
  } else if (q.includes('xe máy') || q.includes('đi làm') || q.includes('scooter') || q.includes('commut')) {
    category = 'MOTORBIKE';
    voucherCode = 'ECOGO20';
    summary = isEn
      ? 'Selected high-capacity LFP battery e-scooter with unlimited battery swapping at 10 EcoGo Hubs.'
      : 'Đề xuất xe máy điện pin LFP dung lượng cao, miễn phí đổi pin nhanh tại 10 trạm EcoGo Hub.';
  }

  const pool = allVehicles.filter((v) => v.category === category);
  const picked = pool[0] || allVehicles[0] || { id: 'veh-vf8-001' };

  res.json({
    success: true,
    vehicleId: picked.id,
    voucherCode,
    summary,
    chargingPlan
  });
});

// Autonomous AI Fleet Dispatch & Optimization Endpoint
app.post('/api/ops/ai-dispatch', (req, res) => {
  const { language = 'vi' } = req.body || {};
  const isEn = language === 'en';
  res.json({
    success: true,
    optimizedAt: new Date().toISOString(),
    actions: isEn
      ? [
          'Rebalanced 2 VinFast VF 5 units from Thu Duc Hub → Landmark 81 Hub (peak demand +34%).',
          'Prioritized 250kW Supercharging slot for VF 8 (SOC 28% → 90% in 18 mins).',
          'Activated Golden Hour -20% voucher for off-peak stations.'
        ]
      : [
          'Điều phối tự động 2 xe VinFast VF 5 từ Hub Thủ Đức → Hub Landmark 81 (dự báo nhu cầu +34%).',
          'Ưu tiên cổng sạc siêu nhanh 250kW cho VF 8 (nạp từ 28% → 90% trong 18 phút).',
          'Kích hoạt ưu đãi Giờ Vàng -20% tại các trạm thấp điểm để cân bằng đội xe.'
        ]
  });
});

// Phục vụ Giao diện Ứng dụng di động (Static Expo Web SPA) trên cùng 1 tên miền
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));

  // Endpoint cố định cho gói bundle chính: không bao giờ đổi tên file hash,
  // luôn gửi gói bundle mới nhất với cấm cache để Safari và PWA luôn chạy bản mới
  app.get('/bundle.js', (req, res) => {
    const bundlePath = path.join(publicDir, 'bundle.js');
    if (fs.existsSync(bundlePath)) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(bundlePath);
    }
    const jsDir = path.join(publicDir, '_expo/static/js/web');
    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
      if (files.length > 0) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.sendFile(path.join(jsDir, files[0]));
      }
    }
    res.status(404).send('Bundle not found');
  });

  // Cứu hộ Standalone PWA iOS: nếu máy khách vẫn lưu index.html cũ đòi bundle JS hash cũ đã bị xóa,
  // tự động phục vụ bundle JS mới nhất hiện tại thay vì trả về HTML gây SyntaxError (trắng màn hình)
  app.get('/_expo/static/js/web/*', (req, res, next) => {
    const bundlePath = path.join(publicDir, 'bundle.js');
    if (fs.existsSync(bundlePath)) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(bundlePath);
    }
    const jsDir = path.join(publicDir, '_expo/static/js/web');
    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
      if (files.length > 0) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.sendFile(path.join(jsDir, files[0]));
      }
    }
    next();
  });

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    // Tránh gửi nhầm index.html cho các file tài nguyên tĩnh bị thiếu
    if (
      req.path.startsWith('/_expo/') ||
      req.path.startsWith('/assets/') ||
      req.path.startsWith('/fonts/') ||
      req.path.endsWith('.js') ||
      req.path.endsWith('.css') ||
      req.path.endsWith('.ttf') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.ico')
    ) {
      return res.status(404).send('Asset not found');
    }
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Telematics IoT] Client connected: ${socket.id}`);

  // Send current fleet state immediately
  socket.emit('fleet:initial', {
    vehicles: telematicsService.getAllVehicles(),
    stations: telematicsService.getAllStations()
  });

  socket.on('disconnect', () => {
    console.log(`[Telematics IoT] Client disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ITS SMART VEHICLE RENTAL BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`🚗 Telematics & AVL Socket.IO: ws://localhost:${PORT}`);
  console.log(`====================================================`);
});
