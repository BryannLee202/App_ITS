const { v4: uuidv4 } = require('uuid');
const telematicsService = require('../services/telematicsService');
const ITSEngine = require('../services/itsEngine');

// In-memory rentals store
let rentals = [
  {
    id: 'trip_demo_101',
    userId: 'usr_demo_01',
    vehicleId: 'veh-ioniq5-001',
    pickupStationId: 'hub-uth-01',
    returnStationId: 'hub-thuthiem-01',
    rentalType: 'HOURLY',
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    endTime: null,
    status: 'ACTIVE', // 'ACTIVE', 'COMPLETED', 'CANCELLED'
    totalHours: 2,
    basePricePerHour: 120000,
    estimatedTotal: 240000,
    distanceTraveledKm: 14.2,
    co2SavedKg: 1.70,
    ecoPointsEarned: 17,
    digitalKeyActivated: true,
    eContractSigned: true,
    contractNumber: 'HD-ECOGO-2026-9812'
  }
];

// Start background simulation for the demo trip
telematicsService.startTripSimulation('veh-ioniq5-001', 'trip_demo_101');

// Available Promo Vouchers & Events
const VOUCHERS = [
  {
    code: 'BANMOI30',
    title: 'Gói Quà Bạn Mới - Giảm 30%',
    description: 'Giảm 30% chuyến đầu tiên cho tài khoản mới (tối đa 80.000đ)',
    discountType: 'PERCENT',
    discountValue: 30,
    maxDiscount: 80000,
    tag: 'BẠN MỚI',
    claimedPct: 88,
    expiry: 'Còn 3 ngày'
  },
  {
    code: 'CHAOXANH',
    title: 'Gói Quà Bạn Mới - Giảm 30%',
    description: 'Giảm 30% chuyến đầu tiên cho tài khoản mới (tối đa 80.000đ)',
    discountType: 'PERCENT',
    discountValue: 30,
    maxDiscount: 80000,
    tag: 'BẠN MỚI',
    claimedPct: 88,
    expiry: 'Còn 3 ngày'
  },
  {
    code: 'ECOGO20',
    title: 'Hành Trình Xanh EcoGo - Giảm 20%',
    description: 'Áp dụng cho mọi dòng xe ô tô tự lái & xe máy điện (tối đa 120.000đ)',
    discountType: 'PERCENT',
    discountValue: 20,
    maxDiscount: 120000,
    tag: 'HOT',
    claimedPct: 76,
    expiry: 'Còn 5 ngày'
  },
  {
    code: 'XANH20',
    title: 'Giảm 20% Thuê Xe Xanh EcoGo',
    description: 'Áp dụng cho mọi dòng xe ô tô tự lái & xe máy điện (tối đa 120.000đ)',
    discountType: 'PERCENT',
    discountValue: 20,
    maxDiscount: 120000,
    tag: 'HOT',
    claimedPct: 76,
    expiry: 'Còn 5 ngày'
  },
  {
    code: 'GIOVANG25',
    title: 'Flash Sale Giờ Vàng - Giảm 25K',
    description: 'Áp dụng cho các khung giờ cao điểm 11h-13h và 17h-19h hàng ngày',
    discountType: 'FIXED',
    discountValue: 25000,
    maxDiscount: 25000,
    tag: 'GIỜ VÀNG',
    claimedPct: 92,
    expiry: 'Hôm nay'
  },
  {
    code: 'UTH50K',
    title: 'Ưu Đãi Độc Quyền Sinh Viên UTH',
    description: 'Giảm trực tiếp 50.000đ khi nhận xe tại Trạm Hub ĐH Giao Thông Vận Tải TP.HCM',
    discountType: 'FIXED',
    discountValue: 50000,
    maxDiscount: 50000,
    tag: 'UTH CHUYÊN ĐỀ',
    claimedPct: 65,
    expiry: 'Hết tháng 11'
  },
  {
    code: 'CUOITUAN200',
    title: 'Dã Ngoại Cuối Tuần - Giảm 200K',
    description: 'Giảm ngay 200.000đ khi thuê ô tô tự lái theo ngày dịp cuối tuần',
    discountType: 'FIXED',
    discountValue: 200000,
    maxDiscount: 200000,
    tag: 'CUỐI TUẦN',
    claimedPct: 54,
    expiry: 'Cuối tuần'
  },
  {
    code: 'THUENGAY200',
    title: 'Gói Dã Ngoại 24H - Giảm 200K',
    description: 'Giảm ngay 200.000đ khi thuê ô tô tự lái theo ngày dịp cuối tuần',
    discountType: 'FIXED',
    discountValue: 200000,
    maxDiscount: 200000,
    tag: 'CUỐI TUẦN',
    claimedPct: 54,
    expiry: 'Cuối tuần'
  },
  {
    code: 'FREESHIP',
    title: 'Miễn Phí Giao Xe Tận Nơi 5KM',
    description: 'Miễn 100% phí giao nhận xe tận cửa nhà trong bán kính 5km quanh trạm EcoGo Hub',
    discountType: 'DELIVERY_FREE',
    discountValue: 50000,
    maxDiscount: 50000,
    tag: 'TIỆN LỢI',
    claimedPct: 83,
    expiry: 'Còn 7 ngày'
  },
  {
    code: 'FREESHIP5KM',
    title: 'Miễn Phí Giao Xe Tận Nơi 5KM',
    description: 'Miễn 100% phí giao nhận xe tận cửa nhà trong bán kính 5km quanh trạm EcoGo Hub',
    discountType: 'DELIVERY_FREE',
    discountValue: 50000,
    maxDiscount: 50000,
    tag: 'TIỆN LỢI',
    claimedPct: 83,
    expiry: 'Còn 7 ngày'
  }
];

exports.getVouchers = (req, res) => {
  return res.json({
    success: true,
    vouchers: VOUCHERS
  });
};

exports.getBookingQuote = (req, res) => {
  const {
    vehicleId,
    rentalType = 'HOURLY',
    durationHours = 4,
    durationDays = 1,
    insuranceTier = 'STANDARD',
    deliveryMode = 'STATION',
    voucherCode = ''
  } = req.body;

  const vehicle = telematicsService.getVehicleById(vehicleId);
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy phương tiện' });
  }

  const baseRentalFee = rentalType === 'DAILY'
    ? vehicle.dailyPrice * Math.max(1, durationDays)
    : vehicle.hourlyPrice * Math.max(1, durationHours);

  const insuranceRates = {
    BASIC: 0,
    STANDARD: rentalType === 'DAILY' ? 85000 * Math.max(1, durationDays) : 25000,
    PREMIUM: rentalType === 'DAILY' ? 150000 * Math.max(1, durationDays) : 55000
  };
  const insuranceFee = insuranceRates[insuranceTier] ?? 25000;
  const platformServiceFee = Math.round(baseRentalFee * 0.05);
  let deliveryFee = deliveryMode === 'DOORSTEP' ? 50000 : 0;

  let discountAmount = 0;
  const normalizedCode = (voucherCode || '').trim().toUpperCase();
  const appliedVoucher = VOUCHERS.find(v => v.code === normalizedCode) || null;

  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'PERCENT') {
      discountAmount = Math.min(
        Math.round((baseRentalFee * appliedVoucher.discountValue) / 100),
        appliedVoucher.maxDiscount
      );
    } else if (appliedVoucher.discountType === 'FIXED') {
      discountAmount = appliedVoucher.discountValue;
    } else if (appliedVoucher.discountType === 'DELIVERY_FREE') {
      discountAmount = deliveryFee;
    }
  }

  const totalAmount = Math.max(0, baseRentalFee + insuranceFee + platformServiceFee + deliveryFee - discountAmount);

  return res.json({
    success: true,
    quote: {
      vehicleId,
      rentalType,
      durationHours: rentalType === 'DAILY' ? durationDays * 24 : durationHours,
      durationDays,
      baseRentalFee,
      insuranceTier,
      insuranceFee,
      platformServiceFee,
      deliveryMode,
      deliveryFee,
      voucherCode: appliedVoucher ? appliedVoucher.code : null,
      discountAmount,
      depositAmount: 0,
      totalAmount
    }
  });
};

exports.createRental = (req, res) => {
  const {
    vehicleId,
    rentalType,
    durationHours,
    durationDays,
    pickupStationId,
    returnStationId,
    insuranceTier = 'STANDARD',
    deliveryMode = 'STATION',
    voucherCode = ''
  } = req.body;

  const vehicle = telematicsService.getVehicleById(vehicleId);
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
  }

  if (vehicle.status === 'RENTED') {
    return res.status(400).json({ success: false, message: 'Phương tiện hiện đang có người thuê' });
  }

  const isDaily = rentalType === 'DAILY';
  const hours = isDaily ? (durationDays || 1) * 24 : (durationHours || 4);
  const baseRentalFee = isDaily
    ? vehicle.dailyPrice * (durationDays || 1)
    : vehicle.hourlyPrice * (durationHours || 4);
  const insuranceFee = insuranceTier === 'PREMIUM' ? 55000 : insuranceTier === 'STANDARD' ? 25000 : 0;
  const platformServiceFee = Math.round(baseRentalFee * 0.05);
  const deliveryFee = deliveryMode === 'DOORSTEP' ? 50000 : 0;

  let discountAmount = 0;
  const normalizedCode = (voucherCode || '').trim().toUpperCase();
  const voucher = VOUCHERS.find(v => v.code === normalizedCode);
  if (voucher) {
    if (voucher.discountType === 'PERCENT') {
      discountAmount = Math.min(Math.round((baseRentalFee * voucher.discountValue) / 100), voucher.maxDiscount);
    } else if (voucher.discountType === 'FIXED') {
      discountAmount = voucher.discountValue;
    } else if (voucher.discountType === 'DELIVERY_FREE') {
      discountAmount = deliveryFee;
    }
  }

  const estimatedTotal = Math.max(0, baseRentalFee + insuranceFee + platformServiceFee + deliveryFee - discountAmount);

  const newTrip = {
    id: `trip_${uuidv4().substring(0, 8)}`,
    userId: req.user ? req.user.id : 'usr_demo_01',
    vehicleId,
    pickupStationId: pickupStationId || vehicle.stationId,
    returnStationId: returnStationId || pickupStationId || vehicle.stationId,
    rentalType: rentalType || 'HOURLY',
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'ACTIVE',
    totalHours: hours,
    basePricePerHour: vehicle.hourlyPrice,
    baseRentalFee,
    insuranceTier,
    insuranceFee,
    platformServiceFee,
    deliveryMode,
    deliveryFee,
    voucherCode: voucher ? voucher.code : null,
    discountAmount,
    estimatedTotal,
    distanceTraveledKm: 0,
    co2SavedKg: 0,
    ecoPointsEarned: 0,
    digitalKeyActivated: true,
    eContractSigned: true,
    contractNumber: `HD-ITS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  };

  rentals.unshift(newTrip);

  // Trigger telematics trip simulation
  telematicsService.startTripSimulation(vehicleId, newTrip.id);

  return res.status(201).json({
    success: true,
    message: 'Đặt thuê xe và ký Hợp đồng điện tử thành công! Chìa khóa số Digital Key đã kích hoạt.',
    trip: newTrip,
    vehicle
  });
};

exports.getActiveTrip = (req, res) => {
  const userId = req.user ? req.user.id : 'usr_demo_01';
  const activeTrip = rentals.find(r => r.userId === userId && r.status === 'ACTIVE');

  if (!activeTrip) {
    return res.json({ success: true, activeTrip: null });
  }

  const vehicle = telematicsService.getVehicleById(activeTrip.vehicleId);
  const pickupStation = telematicsService.getStationById(activeTrip.pickupStationId);
  const returnStation = telematicsService.getStationById(activeTrip.returnStationId);

  // Current GLOSA advisory
  const glosa = ITSEngine.computeGreenWaveSpeedAdvisory(280, vehicle?.telematics?.speedKmh || 40);
  const eco = ITSEngine.calculateEcoImpact(activeTrip.distanceTraveledKm || 14.2, vehicle?.powerType || 'ELECTRIC');

  return res.json({
    success: true,
    activeTrip: {
      ...activeTrip,
      vehicle,
      pickupStation,
      returnStation,
      glosa,
      eco
    }
  });
};

exports.getTripHistory = (req, res) => {
  const userId = req.user ? req.user.id : 'usr_demo_01';
  const userTrips = rentals.filter(r => r.userId === userId);

  const populatedTrips = userTrips.map(trip => {
    const vehicle = telematicsService.getVehicleById(trip.vehicleId);
    return {
      ...trip,
      vehicle
    };
  });

  return res.json({
    success: true,
    total: populatedTrips.length,
    trips: populatedTrips
  });
};

exports.controlVehicle = (req, res) => {
  const { tripId, command } = req.body;
  const trip = rentals.find(r => r.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, message: 'Chuyến đi không tồn tại' });
  }

  if (trip.status !== 'ACTIVE') {
    return res.status(400).json({ success: false, message: 'Chuyến đi không còn hiệu lực' });
  }

  try {
    const result = telematicsService.executeControlCommand(trip.vehicleId, command);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.completeTrip = (req, res) => {
  const { tripId, targetStationId } = req.body;
  const trip = rentals.find(r => r.id === tripId);

  if (!trip) {
    return res.status(404).json({ success: false, message: 'Chuyến đi không tồn tại' });
  }

  const vehicle = telematicsService.getVehicleById(trip.vehicleId);
  const stationId = targetStationId || trip.returnStationId;
  const returnStation = telematicsService.getStationById(stationId);

  // Geofence check
  const geofenceResult = ITSEngine.verifyStationGeofence(
    vehicle.telematics.latitude,
    vehicle.telematics.longitude,
    returnStation
  );

  // Stop simulation
  telematicsService.stopTripSimulation(tripId);

  trip.status = 'COMPLETED';
  trip.endTime = new Date().toISOString();
  trip.distanceTraveledKm = Math.round((trip.distanceTraveledKm + 8.5) * 10) / 10;
  
  const eco = ITSEngine.calculateEcoImpact(trip.distanceTraveledKm, vehicle.powerType);
  trip.co2SavedKg = eco.co2SavedKg;
  trip.ecoPointsEarned = eco.ecoPointsEarned;

  return res.json({
    success: true,
    message: 'Trả xe thành công! Cảm ơn bạn đã đồng hành cùng giao thông xanh ITS.',
    trip,
    geofenceResult,
    eco
  });
};
