const telematicsService = require('../services/telematicsService');

exports.getVehicles = (req, res) => {
  const { category, powerType, stationId, status } = req.query;
  let vehicles = telematicsService.getAllVehicles();

  if (category) {
    vehicles = vehicles.filter(v => v.category.toLowerCase() === category.toLowerCase());
  }

  if (powerType) {
    vehicles = vehicles.filter(v => v.powerType.toLowerCase() === powerType.toLowerCase());
  }

  if (stationId) {
    vehicles = vehicles.filter(v => v.stationId === stationId);
  }

  if (status) {
    vehicles = vehicles.filter(v => v.status === status);
  }

  return res.json({
    success: true,
    total: vehicles.length,
    vehicles
  });
};

exports.getVehicleById = (req, res) => {
  const { id } = req.params;
  const vehicle = telematicsService.getVehicleById(id);

  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin phương tiện' });
  }

  const station = telematicsService.getStationById(vehicle.stationId);

  return res.json({
    success: true,
    vehicle: {
      ...vehicle,
      station
    }
  });
};

exports.getStations = (req, res) => {
  const stations = telematicsService.getAllStations();
  return res.json({
    success: true,
    total: stations.length,
    stations
  });
};

exports.getStationById = (req, res) => {
  const { id } = req.params;
  const station = telematicsService.getStationById(id);

  if (!station) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy trạm Hub ITS' });
  }

  const vehiclesAtStation = telematicsService.getAllVehicles().filter(v => v.stationId === id);

  return res.json({
    success: true,
    station: {
      ...station,
      vehicles: vehiclesAtStation
    }
  });
};
