/**
 * Telematics & IoT Fleet Management Service
 * Manages AVL (Automatic Vehicle Location), Digital Key commands (BLE/Cloud),
 * and Socket.io real-time telemetry streaming.
 */

const fs = require('fs');
const path = require('path');
const ITSEngine = require('./itsEngine');

const VEHICLES_FILE = path.join(__dirname, '../data/vehicles.json');
const STATIONS_FILE = path.join(__dirname, '../data/stations.json');

class TelematicsService {
  constructor() {
    this.vehicles = [];
    this.stations = [];
    this.activeSimulations = new Map();
    this.io = null;

    this.loadData();
  }

  loadData() {
    try {
      this.vehicles = JSON.parse(fs.readFileSync(VEHICLES_FILE, 'utf8'));
      this.stations = JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8'));
    } catch (err) {
      console.error('Error loading telematics seed data:', err);
    }
  }

  saveVehicles() {
    try {
      fs.writeFileSync(VEHICLES_FILE, JSON.stringify(this.vehicles, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving vehicles data:', err);
    }
  }

  setSocketIO(io) {
    this.io = io;
    this.startGlobalTelemetryHeartbeat();
  }

  getAllVehicles() {
    return this.vehicles;
  }

  getVehicleById(id) {
    return this.vehicles.find(v => v.id === id);
  }

  getAllStations() {
    return this.stations;
  }

  getStationById(id) {
    return this.stations.find(s => s.id === id);
  }

  /**
   * Execute IoT Digital Key Command (BonbonCar style)
   * Actions: 'LOCK', 'UNLOCK', 'HORN', 'FLASH_LIGHTS', 'ENGINE_START', 'ENGINE_STOP'
   */
  executeControlCommand(vehicleId, command) {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle ${vehicleId} not found`);
    }

    const timestamp = new Date().toISOString();
    let resultMessage = '';

    switch (command.toUpperCase()) {
      case 'UNLOCK':
        vehicle.telematics.isLocked = false;
        resultMessage = 'Đã mở khóa cửa xe thành công qua Digital Key IoT';
        break;
      case 'LOCK':
        vehicle.telematics.isLocked = true;
        resultMessage = 'Đã khóa cửa xe an toàn qua Digital Key IoT';
        break;
      case 'ENGINE_START':
        if (vehicle.telematics.isLocked) {
          throw new Error('Vui lòng mở khóa cửa trước khi khởi động động cơ!');
        }
        vehicle.telematics.isEngineOn = true;
        resultMessage = 'Động cơ đã khởi động. Sẵn sàng lăn bánh!';
        break;
      case 'ENGINE_STOP':
        vehicle.telematics.isEngineOn = false;
        vehicle.telematics.speedKmh = 0;
        resultMessage = 'Động cơ đã tắt.';
        break;
      case 'HORN':
        resultMessage = 'Đã kích hoạt còi xe tìm vị trí (Bíp bíp!)';
        break;
      case 'FLASH_LIGHTS':
        resultMessage = 'Đã nháy đèn khẩn cấp 3 lần hỗ trợ tìm xe trong bãi';
        break;
      default:
        throw new Error(`Unsupported command: ${command}`);
    }

    vehicle.telematics.lastPing = timestamp;
    this.saveVehicles();

    // Broadcast IoT status change to all connected clients
    if (this.io) {
      this.io.emit('vehicle:control_ack', {
        vehicleId,
        command,
        telematics: vehicle.telematics,
        message: resultMessage,
        timestamp
      });
    }

    return {
      success: true,
      vehicleId,
      command,
      telematics: vehicle.telematics,
      message: resultMessage
    };
  }

  /**
   * Starts a real-time GPS driving simulation for an active trip
   * Simulates moving along the UTH -> Mai Chí Thọ corridor with ITS Green Wave telemetry
   */
  startTripSimulation(vehicleId, tripId) {
    if (this.activeSimulations.has(tripId)) {
      return;
    }

    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) return;

    // Route coordinates: From UTH Campus -> Điện Biên Phủ -> Cầu Sài Gòn -> Mai Chí Thọ (Green Wave corridor)
    const waypoints = [
      { lat: 10.8018, lng: 106.7142 }, // UTH
      { lat: 10.7985, lng: 106.7175 }, // Ngã 4 Hàng Xanh
      { lat: 10.7952, lng: 106.7218 }, // Landmark 81 / Cầu Sài Gòn
      { lat: 10.7895, lng: 106.7270 }, // Trục Xa Lộ Hà Nội
      { lat: 10.7801, lng: 106.7289 }, // Nút giao Mai Chí Thọ
      { lat: 10.7758, lng: 106.7245 }  // Hub Thủ Thiêm
    ];

    let currentWaypointIdx = 0;
    let distanceCoveredKm = 0;
    vehicle.status = 'RENTED';
    vehicle.telematics.isEngineOn = true;
    vehicle.telematics.isLocked = false;

    const intervalId = setInterval(() => {
      if (currentWaypointIdx >= waypoints.length - 1) {
        currentWaypointIdx = 0; // loop simulation
      }

      const currentPoint = waypoints[currentWaypointIdx];
      const nextPoint = waypoints[currentWaypointIdx + 1];

      // Interpolate position
      vehicle.telematics.latitude = currentPoint.lat;
      vehicle.telematics.longitude = currentPoint.lng;
      vehicle.telematics.speedKmh = Math.floor(35 + Math.random() * 15); // 35 - 50 km/h
      vehicle.telematics.odometerKm += 0.05;
      distanceCoveredKm += 0.05;

      if (vehicle.powerType === 'ELECTRIC') {
        vehicle.telematics.batteryLevelPct = Math.max(5, Math.round((vehicle.telematics.batteryLevelPct - 0.02) * 10) / 10);
      }

      vehicle.telematics.lastPing = new Date().toISOString();

      // Compute ITS Green Wave Advisory for this position
      const distanceToNextLight = Math.floor(150 + Math.random() * 350); // 150m - 500m
      const glosa = ITSEngine.computeGreenWaveSpeedAdvisory(
        distanceToNextLight,
        vehicle.telematics.speedKmh
      );

      // Compute cumulative CO2 savings
      const eco = ITSEngine.calculateEcoImpact(distanceCoveredKm, vehicle.powerType);

      const telemetryPayload = {
        tripId,
        vehicleId,
        telematics: vehicle.telematics,
        glosa,
        eco,
        timestamp: new Date().toISOString()
      };

      if (this.io) {
        this.io.emit('trip:telemetry', telemetryPayload);
        this.io.emit('vehicle:location_update', {
          id: vehicle.id,
          latitude: vehicle.telematics.latitude,
          longitude: vehicle.telematics.longitude,
          speedKmh: vehicle.telematics.speedKmh
        });
      }

      currentWaypointIdx++;
    }, 2500);

    this.activeSimulations.set(tripId, {
      intervalId,
      vehicleId,
      startTime: Date.now()
    });
  }

  stopTripSimulation(tripId) {
    const sim = this.activeSimulations.get(tripId);
    if (sim) {
      clearInterval(sim.intervalId);
      this.activeSimulations.delete(tripId);

      const vehicle = this.getVehicleById(sim.vehicleId);
      if (vehicle) {
        vehicle.status = 'AVAILABLE';
        vehicle.telematics.speedKmh = 0;
        vehicle.telematics.isEngineOn = false;
        vehicle.telematics.isLocked = true;
        this.saveVehicles();
      }
    }
  }

  startGlobalTelemetryHeartbeat() {
    // Broadcast heartbeat every 10 seconds for available vehicles
    setInterval(() => {
      if (this.io) {
        this.io.emit('fleet:heartbeat', {
          activeVehiclesCount: this.vehicles.length,
          availableCount: this.vehicles.filter(v => v.status === 'AVAILABLE').length,
          timestamp: new Date().toISOString()
        });
      }
    }, 10000);
  }
}

module.exports = new TelematicsService();
