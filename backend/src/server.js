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

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/its', itsRoutes);
app.use('/api/rewards', rewardRoutes);

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
    version: '1.0.2-PROD',
    telematicsOnline: true,
    activeVehicles: telematicsService.getAllVehicles().length,
    activeStations: telematicsService.getAllStations().length,
    timestamp: new Date().toISOString()
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
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
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
