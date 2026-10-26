const ITSEngine = require('../services/itsEngine');
const { ITS_CONFIG } = require('../config');

exports.getGreenWaveAdvisory = (req, res) => {
  const { distanceMeters = 300, currentSpeedKmh = 40, cycleSec } = req.query;

  const advisory = ITSEngine.computeGreenWaveSpeedAdvisory(
    parseFloat(distanceMeters),
    parseFloat(currentSpeedKmh),
    cycleSec ? parseFloat(cycleSec) : null
  );

  return res.json({
    success: true,
    data: advisory
  });
};

exports.calculateShockwave = (req, res) => {
  const { q1 = 1200, k1 = 25, q2 = 600, k2 = 90 } = req.body;

  const analysis = ITSEngine.evaluateTrafficShockwave(
    parseFloat(q1),
    parseFloat(k1),
    parseFloat(q2),
    parseFloat(k2)
  );

  return res.json({
    success: true,
    theory: 'Lighthill-Whitham-Richards (LWR) Shockwave Model (v_w = Δq / Δk)',
    analysis
  });
};

exports.calculateEco = (req, res) => {
  const { distanceKm = 15, powerType = 'ELECTRIC' } = req.query;

  const result = ITSEngine.calculateEcoImpact(
    parseFloat(distanceKm),
    powerType
  );

  return res.json({
    success: true,
    result
  });
};

exports.getCorridors = (req, res) => {
  const corridors = [
    {
      id: 'corridor-mai-chi-tho',
      name: 'Trục Làn Sóng Xanh Mai Chí Thọ (Khu Đô Thị Mới Thủ Thiêm)',
      lengthMeters: 4800,
      intersectionsCount: 6,
      designSpeedKmh: 50,
      cycleLengthSec: 90,
      bandwidthPct: 65, // Băng thông làn sóng xanh
      status: 'ACTIVE_SYNCHRONIZED',
      averageDelayReductionPct: 24.5
    },
    {
      id: 'corridor-dien-bien-phu',
      name: 'Hành Lang ĐH GTVT (UTH) - Cầu Sài Gòn - Xa Lộ Hà Nội',
      lengthMeters: 3600,
      intersectionsCount: 5,
      designSpeedKmh: 45,
      cycleLengthSec: 90,
      bandwidthPct: 58,
      status: 'ACTIVE_SYNCHRONIZED',
      averageDelayReductionPct: 19.8
    },
    {
      id: 'corridor-pham-van-dong',
      name: 'Hành Lang Kết Nối Sân Bay TSN - Phạm Văn Đồng',
      lengthMeters: 7200,
      intersectionsCount: 8,
      designSpeedKmh: 60,
      cycleLengthSec: 100,
      bandwidthPct: 70,
      status: 'ACTIVE_SYNCHRONIZED',
      averageDelayReductionPct: 27.2
    }
  ];

  return res.json({
    success: true,
    corridors
  });
};
