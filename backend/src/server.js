const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PORT } = require('./config');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const itsRoutes = require('./routes/itsRoutes');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'ITS Smart Vehicle Rental System (Chuyên đề UTH)',
    version: '1.0.0-PROD',
    telematicsOnline: true,
    activeVehicles: telematicsService.getAllVehicles().length,
    activeStations: telematicsService.getAllStations().length,
    timestamp: new Date().toISOString()
  });
});

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
