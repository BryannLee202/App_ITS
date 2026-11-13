/**
 * ITS ENGINE - Chuyên đề Hệ thống Giao thông Thông minh (UTH)
 * Mathematical Models based on:
 * - TS. Văn Hồng Tấn - "Hệ thống Giao thông Thông minh"
 * - Lighthill-Whitham-Richards (LWR) Traffic Shockwave Theory
 * - GLOSA (Green Light Optimal Speed Advisory) / Green Wave Coordination
 */

const { ITS_CONFIG } = require('../config');

class ITSEngine {
  /**
   * Tính toán khoảng cách trắc địa (Haversine Formula) giữa 2 tọa độ GPS
   * @param {number} lat1 
   * @param {number} lon1 
   * @param {number} lat2 
   * @param {number} lon2 
   * @returns {number} Khoảng cách tính bằng mét (m)
   */
  static calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Bán kính Trái Đất (mét)
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Thuật toán GLOSA (Green Light Optimal Speed Advisory)
   * Khuyến nghị vận tốc tối ưu để xe đón đúng pha đèn xanh (Làn sóng xanh - Green Wave)
   * Tránh dừng đèn đỏ, tiết kiệm 15-22% tiêu hao pin/nhiên liệu (theo Chương 4 Tài liệu UTH)
   * 
   * @param {number} distanceToIntersectionMeters - Khoảng cách tới nút đèn tiếp theo (m)
   * @param {number} currentSpeedKmh - Vận tốc hiện tại của xe (km/h)
   * @param {number} cycleProgressSec - Thời điểm hiện tại trong chu kỳ đèn C=90s (0 <= t < 90)
   */
  static computeGreenWaveSpeedAdvisory(distanceToIntersectionMeters, currentSpeedKmh, cycleProgressSec = null) {
    const C = ITS_CONFIG.DEFAULT_CYCLE_LENGTH_SEC; // Chu kỳ đèn C = 90s
    const greenSplit = ITS_CONFIG.GREEN_SPLIT_RATIO; // 0.55 => Xanh: 49.5s, Đỏ + Vàng: 40.5s
    const greenDuration = C * greenSplit;

    const nowSec = cycleProgressSec !== null 
      ? (cycleProgressSec % C) 
      : ((Date.now() / 1000) % C);

    // Thời gian tới khi bắt đầu pha xanh tiếp theo hoặc hết pha xanh hiện tại
    let isCurrentlyGreen = nowSec < greenDuration;
    let timeUntilGreenSec = 0;
    let timeGreenRemainingSec = 0;

    if (isCurrentlyGreen) {
      timeGreenRemainingSec = greenDuration - nowSec;
    } else {
      timeUntilGreenSec = C - nowSec;
      timeGreenRemainingSec = greenDuration;
    }

    // Dải vận tốc cho phép trên trục đô thị: 25 km/h <= v <= 55 km/h
    const V_MIN_KMH = 25;
    const V_MAX_KMH = 55;
    const V_DESIGN_KMH = ITS_CONFIG.DESIGN_SPEED_KMH; // 45 km/h

    let recommendedSpeedKmh = V_DESIGN_KMH;
    let advisoryStatus = 'MAINTAIN'; // 'ACCELERATE', 'DECELERATE', 'MAINTAIN', 'CANNOT_PASS'
    let advisoryMessage = '';

    if (isCurrentlyGreen) {
      // Nếu có thể đến giao lộ trước khi hết đèn xanh
      const currentSpeedMs = Math.max(currentSpeedKmh, 5) / 3.6;
      const etaSec = distanceToIntersectionMeters / currentSpeedMs;

      if (etaSec <= timeGreenRemainingSec) {
        recommendedSpeedKmh = Math.min(Math.max(currentSpeedKmh, V_MIN_KMH), V_MAX_KMH);
        advisoryStatus = 'MAINTAIN';
        advisoryMessage = `Duy trì tốc độ ${Math.round(recommendedSpeedKmh)} km/h để qua đèn xanh (${Math.round(timeGreenRemainingSec)}s còn lại)`;
      } else {
        // Cần tăng tốc hoặc chuẩn bị giảm tốc đón pha xanh sau
        const requiredSpeedMs = distanceToIntersectionMeters / timeGreenRemainingSec;
        const requiredSpeedKmh = requiredSpeedMs * 3.6;

        if (requiredSpeedKmh <= V_MAX_KMH) {
          recommendedSpeedKmh = Math.round(requiredSpeedKmh);
          advisoryStatus = 'ACCELERATE';
          advisoryMessage = `Tăng tốc nhẹ lên ${recommendedSpeedKmh} km/h để kịp pha xanh`;
        } else {
          // Không kịp xanh này, điều chỉnh tốc độ vừa phải để đón đầu pha xanh chu kỳ tiếp theo
          const nextGreenEtaSec = timeUntilGreenSec + (C - greenDuration) + (greenDuration * 0.3);
          const cruiseSpeedKmh = Math.max(Math.min((distanceToIntersectionMeters / nextGreenEtaSec) * 3.6, V_DESIGN_KMH), V_MIN_KMH);
          recommendedSpeedKmh = Math.round(cruiseSpeedKmh);
          advisoryStatus = 'DECELERATE';
          advisoryMessage = `Giảm tốc êm về ${recommendedSpeedKmh} km/h để đón đầu làn sóng xanh tiếp theo`;
        }
      }
    } else {
      // Đang đèn đỏ: tính vận tốc để đến nút vừa đúng lúc đèn chuyển xanh
      const targetTimeSec = timeUntilGreenSec + 2; // thêm 2s an toàn
      const targetSpeedMs = distanceToIntersectionMeters / targetTimeSec;
      const targetSpeedKmh = targetSpeedMs * 3.6;

      if (targetSpeedKmh >= V_MIN_KMH && targetSpeedKmh <= V_MAX_KMH) {
        recommendedSpeedKmh = Math.round(targetSpeedKmh);
        advisoryStatus = 'DECELERATE';
        advisoryMessage = `Chạy ${recommendedSpeedKmh} km/h để không phải dừng đèn đỏ (xanh sau ${Math.round(timeUntilGreenSec)}s)`;
      } else if (targetSpeedKmh < V_MIN_KMH) {
        recommendedSpeedKmh = V_MIN_KMH;
        advisoryStatus = 'DECELERATE';
        advisoryMessage = `Chạy chậm ${V_MIN_KMH} km/h thả dốc đón đèn xanh`;
      } else {
        recommendedSpeedKmh = V_MAX_KMH;
        advisoryStatus = 'ACCELERATE';
        advisoryMessage = `Duy trì tốc độ hành lang ${V_MAX_KMH} km/h`;
      }
    }

    return {
      distanceToIntersectionMeters: Math.round(distanceToIntersectionMeters),
      currentSpeedKmh: Math.round(currentSpeedKmh),
      recommendedSpeedKmh,
      advisoryStatus,
      advisoryMessage,
      signalState: isCurrentlyGreen ? 'GREEN' : 'RED',
      secondsToSignalChange: Math.round(isCurrentlyGreen ? timeGreenRemainingSec : timeUntilGreenSec),
      fuelSavedEstimatePct: 18.5 // Theo báo cáo ITS: giảm 18.5% lãng phí năng lượng do dừng/khởi động
    };
  }

  /**
   * Mô hình Sóng xung kích giao thông LWR (Lighthill-Whitham-Richards)
   * Vận tốc sóng xung kích v_w = (q2 - q1) / (k2 - k1)
   * Dùng để phát hiện nguy cơ kẹt xe lan truyền ngược dòng và cảnh báo người lái
   * 
   * @param {number} upstreamFlowQ1 - Lưu lượng thượng lưu (xe/h/làn)
   * @param {number} upstreamDensityK1 - Mật độ thượng lưu (xe/km/làn)
   * @param {number} bottleneckFlowQ2 - Lưu lượng tại điểm nghẽn (xe/h/làn)
   * @param {number} bottleneckDensityK2 - Mật độ tại điểm nghẽn (xe/km/làn)
   */
  static evaluateTrafficShockwave(upstreamFlowQ1, upstreamDensityK1, bottleneckFlowQ2, bottleneckDensityK2) {
    const deltaQ = bottleneckFlowQ2 - upstreamFlowQ1;
    const deltaK = bottleneckDensityK2 - upstreamDensityK1;

    let shockwaveSpeedKmh = 0;
    if (Math.abs(deltaK) > 0.001) {
      shockwaveSpeedKmh = deltaQ / deltaK; // v_w (km/h)
    }

    // Nếu v_w < 0: Sóng xung kích đang lan truyền ngược dòng (nguy cơ kẹt xe dồn toa)
    const isPropagatingUpstream = shockwaveSpeedKmh < 0;
    const congestionSeverity = bottleneckDensityK2 > 80 ? 'HIGH' : bottleneckDensityK2 > 45 ? 'MEDIUM' : 'LOW';

    return {
      upstreamDensityVehKm: upstreamDensityK1,
      bottleneckDensityVehKm: bottleneckDensityK2,
      shockwaveSpeedKmh: Math.round(shockwaveSpeedKmh * 10) / 10,
      isPropagatingUpstream,
      congestionSeverity,
      recommendation: isPropagatingUpstream 
        ? `Cảnh báo: Sóng xung kích ùn tắc đang lan ngược ${Math.abs(Math.round(shockwaveSpeedKmh))} km/h. Đề xuất chuyển làn hoặc rẽ đường tránh.`
        : 'Dòng xe thông suốt, không có hiện tượng dồn toa.'
    };
  }

  /**
   * Tính toán lượng CO2 giảm thiểu theo tiêu chuẩn MaaS & ITS Xanh
   * So sánh giữa Xe Điện (EV) và xe xăng truyền thống (ICE)
   * 
   * @param {number} distanceKm - Quãng đường di chuyển (km)
   * @param {string} powerType - 'ELECTRIC' | 'GASOLINE' | 'HYBRID'
   */
  static calculateEcoImpact(distanceKm, powerType = 'ELECTRIC') {
    const iceEmissionG = distanceKm * ITS_CONFIG.ICE_CO2_EMISSION_G_KM; // 145g/km
    let actualEmissionG = 0;

    if (powerType === 'ELECTRIC') {
      actualEmissionG = distanceKm * ITS_CONFIG.EV_CO2_EMISSION_G_KM; // 25g/km
    } else if (powerType === 'HYBRID') {
      actualEmissionG = distanceKm * 85; // 85g/km
    } else {
      actualEmissionG = iceEmissionG;
    }

    const co2SavedGrams = Math.max(0, iceEmissionG - actualEmissionG);
    const co2SavedKg = Math.round((co2SavedGrams / 1000) * 100) / 100;

    // 1 cây xanh trưởng thành hấp thụ ~20kg CO2/năm => 0.054kg CO2/ngày
    const treesEquivalent = Math.round((co2SavedKg / 20) * 1000) / 1000;
    // Điểm thưởng ITS Eco Points (10 điểm cho mỗi 1kg CO2 tiết kiệm)
    const ecoPointsEarned = Math.round(co2SavedKg * 10);

    return {
      distanceKm: Math.round(distanceKm * 10) / 10,
      powerType,
      iceBaselineCO2Kg: Math.round((iceEmissionG / 1000) * 100) / 100,
      actualTripCO2Kg: Math.round((actualEmissionG / 1000) * 100) / 100,
      co2SavedKg,
      treesEquivalent,
      ecoPointsEarned
    };
  }

  /**
   * Xác thực Geofencing khi nhận hoặc trả xe tại Trạm Hub thông minh
   * @param {number} userLat 
   * @param {number} userLng 
   * @param {object} targetStation 
   */
  static verifyStationGeofence(userLat, userLng, targetStation) {
    const distanceMeters = this.calculateDistanceMeters(
      userLat,
      userLng,
      targetStation.coordinates.latitude,
      targetStation.coordinates.longitude
    );

    const isWithinGeofence = distanceMeters <= ITS_CONFIG.GEOFENCE_RADIUS_METERS;

    return {
      stationId: targetStation.id,
      stationName: targetStation.name,
      distanceMeters: Math.round(distanceMeters),
      allowedRadiusMeters: ITS_CONFIG.GEOFENCE_RADIUS_METERS,
      isWithinGeofence,
      statusMessage: isWithinGeofence 
        ? `Hợp lệ: Phương tiện đang ở trong phạm vi trạm (${Math.round(distanceMeters)}m <= ${ITS_CONFIG.GEOFENCE_RADIUS_METERS}m)`
        : `Chưa vào trạm: Khoảng cách hiện tại là ${Math.round(distanceMeters)}m (cần <= ${ITS_CONFIG.GEOFENCE_RADIUS_METERS}m)`
    };
  }

  /* ============================================================
     TP.HCM INTELLIGENT INTERSECTION KNOWLEDGE BASE (SPaT HUB)
     ============================================================ */
  static SMART_INTERSECTIONS = [
    {
      id: 'int-hang-xanh',
      name: 'Ngã tư Hàng Xanh',
      fullAddress: 'Điện Biên Phủ × Xô Viết Nghệ Tĩnh, Q. Bình Thạnh',
      streetName: 'Đường Điện Biên Phủ',
      lat: 10.7985,
      lng: 106.7175,
      cycleSec: 90,
      greenDurationSec: 50,
      yellowDurationSec: 4,
      phaseOffsetSec: 0
    },
    {
      id: 'int-d1-dbp',
      name: 'Nút giao D1 - Điện Biên Phủ (Cổng UTH)',
      fullAddress: 'Số 2 Võ Oanh - Điện Biên Phủ, P.25, Bình Thạnh',
      streetName: 'Đường Võ Oanh',
      lat: 10.8018,
      lng: 106.7142,
      cycleSec: 75,
      greenDurationSec: 40,
      yellowDurationSec: 3,
      phaseOffsetSec: 18
    },
    {
      id: 'int-vo-oanh-d2',
      name: 'Giao lộ Võ Oanh - Nguyễn Gia Trí',
      fullAddress: 'Võ Oanh × Nguyễn Gia Trí (D2), Bình Thạnh',
      streetName: 'Đường Võ Oanh',
      lat: 10.8035,
      lng: 106.7168,
      cycleSec: 65,
      greenDurationSec: 35,
      yellowDurationSec: 3,
      phaseOffsetSec: 32
    },
    {
      id: 'int-cau-sai-gon',
      name: 'Nút giao Cầu Sài Gòn - Thảo Điền',
      fullAddress: 'Chân cầu Sài Gòn, TP. Thủ Đức',
      streetName: 'Xa Lộ Hà Nội',
      lat: 10.7952,
      lng: 106.7218,
      cycleSec: 90,
      greenDurationSec: 52,
      yellowDurationSec: 4,
      phaseOffsetSec: 45
    },
    {
      id: 'int-mai-chi-tho-tran-nao',
      name: 'Giao lộ Mai Chí Thọ - Trần Não',
      fullAddress: 'Mai Chí Thọ × Trần Não, P. An Phú, TP. Thủ Đức',
      streetName: 'Đại lộ Mai Chí Thọ',
      lat: 10.7801,
      lng: 106.7289,
      cycleSec: 100,
      greenDurationSec: 60,
      yellowDurationSec: 4,
      phaseOffsetSec: 12
    },
    {
      id: 'int-mai-chi-tho-dong-van-cong',
      name: 'Nút giao Mai Chí Thọ - Đồng Văn Cống',
      fullAddress: 'Mai Chí Thọ × Đồng Văn Cống, P. An Phú',
      streetName: 'Đại lộ Mai Chí Thọ',
      lat: 10.7758,
      lng: 106.7450,
      cycleSec: 100,
      greenDurationSec: 58,
      yellowDurationSec: 4,
      phaseOffsetSec: 38
    },
    {
      id: 'int-pham-van-dong-phan-van-tri',
      name: 'Ngã tư Phạm Văn Đồng - Phan Văn Trị',
      fullAddress: 'Phạm Văn Đồng × Phan Văn Trị, Q. Gò Vấp',
      streetName: 'Đại lộ Phạm Văn Đồng',
      lat: 10.8235,
      lng: 106.6912,
      cycleSec: 90,
      greenDurationSec: 55,
      yellowDurationSec: 4,
      phaseOffsetSec: 10
    },
    {
      id: 'int-pham-van-dong-le-quang-dinh',
      name: 'Giao lộ Phạm Văn Đồng - Lê Quang Định',
      fullAddress: 'Phạm Văn Đồng × Lê Quang Định, Q. Bình Thạnh',
      streetName: 'Đại lộ Phạm Văn Đồng',
      lat: 10.8190,
      lng: 106.6995,
      cycleSec: 90,
      greenDurationSec: 52,
      yellowDurationSec: 4,
      phaseOffsetSec: 28
    },
    {
      id: 'int-nguyen-huu-canh-vinhome',
      name: 'Ngã tư Nguyễn Hữu Cảnh - Landmark 81',
      fullAddress: 'Nguyễn Hữu Cảnh × Cổng Tân Cảng, Bình Thạnh',
      streetName: 'Đường Nguyễn Hữu Cảnh',
      lat: 10.7932,
      lng: 106.7205,
      cycleSec: 80,
      greenDurationSec: 44,
      yellowDurationSec: 3,
      phaseOffsetSec: 15
    },
    {
      id: 'int-to-ky-q12',
      name: 'Nút giao Tô Ký - Trung Mỹ Tây (UTH Cơ sở 3)',
      fullAddress: 'Tô Ký × Trung Mỹ Tây, P. Tân Chánh Hiệp, Q.12',
      streetName: 'Đường Tô Ký',
      lat: 10.8580,
      lng: 106.6190,
      cycleSec: 70,
      greenDurationSec: 38,
      yellowDurationSec: 3,
      phaseOffsetSec: 20
    }
  ];

  /**
   * Tính toán Real-time SPaT cho một nút giao tại thời điểm hiện tại
   */
  static getIntersectionSPaT(intersection, currentTimeSec = null) {
    const t = currentTimeSec !== null ? currentTimeSec : Date.now() / 1000;
    const progress = (t + intersection.phaseOffsetSec) % intersection.cycleSec;
    const green = intersection.greenDurationSec;
    const yellow = intersection.yellowDurationSec;

    let signalState = 'GREEN';
    let secondsRemaining = 0;

    if (progress < green) {
      signalState = 'GREEN';
      secondsRemaining = Math.max(1, Math.round(green - progress));
    } else if (progress < green + yellow) {
      signalState = 'YELLOW';
      secondsRemaining = Math.max(1, Math.round(green + yellow - progress));
    } else {
      signalState = 'RED';
      secondsRemaining = Math.max(1, Math.round(intersection.cycleSec - progress));
    }

    return {
      intersectionId: intersection.id,
      name: intersection.name,
      streetName: intersection.streetName,
      fullAddress: intersection.fullAddress,
      signalState,
      secondsRemaining,
      cycleSec: intersection.cycleSec,
      greenDurationSec: green
    };
  }

  /**
   * AI Dynamic Map-Matching & Real-time GLOSA Engine
   * Tìm nút giao gần nhất theo tọa độ xe và tính toán khuyến nghị vận tốc tức thì
   */
  static evaluateRealtimeGLOSA(userLat = 10.8018, userLng = 106.7142, currentSpeedKmh = 38) {
    const lat = parseFloat(userLat) || 10.8018;
    const lng = parseFloat(userLng) || 106.7142;
    const speed = Math.max(0, parseFloat(currentSpeedKmh) || 38);

    // Tính khoảng cách tới tất cả nút giao thông minh
    const evaluatedIntersections = this.SMART_INTERSECTIONS.map((inter) => {
      const dist = this.calculateDistanceMeters(lat, lng, inter.lat, inter.lng);
      const spat = this.getIntersectionSPaT(inter);
      return {
        ...inter,
        distanceMeters: Math.round(dist),
        spat
      };
    });

    evaluatedIntersections.sort((a, b) => a.distanceMeters - b.distanceMeters);
    const nearest = evaluatedIntersections[0];

    const distanceM = Math.max(60, Math.min(nearest.distanceMeters, 1500));

    let recommendedSpeedKmh = 42;
    let advisoryStatus = 'MAINTAIN';
    let advisoryMessage = '';

    if (nearest.spat.signalState === 'GREEN') {
      const currentSpeedMs = Math.max(speed, 10) / 3.6;
      const etaSec = distanceM / currentSpeedMs;

      if (etaSec <= nearest.spat.secondsRemaining) {
        recommendedSpeedKmh = Math.min(Math.max(speed, 28), 50);
        advisoryStatus = 'MAINTAIN';
        advisoryMessage = `Duy trì ${Math.round(recommendedSpeedKmh)} km/h để qua đèn xanh tại ${nearest.name} (còn ${nearest.spat.secondsRemaining}s)`;
      } else {
        const requiredSpeedMs = distanceM / nearest.spat.secondsRemaining;
        const requiredSpeedKmh = requiredSpeedMs * 3.6;

        if (requiredSpeedKmh <= 52) {
          recommendedSpeedKmh = Math.round(requiredSpeedKmh);
          advisoryStatus = 'ACCELERATE';
          advisoryMessage = `Tăng tốc nhẹ lên ${recommendedSpeedKmh} km/h để kịp đèn xanh tại ${nearest.name}`;
        } else {
          const timeToNextGreen = nearest.spat.secondsRemaining + (nearest.cycleSec - nearest.greenDurationSec);
          const cruiseSpeedKmh = Math.max(Math.min((distanceM / (timeToNextGreen + 5)) * 3.6, 45), 25);
          recommendedSpeedKmh = Math.round(cruiseSpeedKmh);
          advisoryStatus = 'DECELERATE';
          advisoryMessage = `Chạy chậm ${recommendedSpeedKmh} km/h để đón đầu nhịp đèn xanh tiếp theo`;
        }
      }
    } else if (nearest.spat.signalState === 'YELLOW') {
      recommendedSpeedKmh = 25;
      advisoryStatus = 'DECELERATE';
      advisoryMessage = `Đèn vàng tại ${nearest.name} (còn ${nearest.spat.secondsRemaining}s) - Giảm tốc an toàn`;
    } else {
      // Đèn Đỏ (RED)
      const targetTimeSec = nearest.spat.secondsRemaining + 2;
      const targetSpeedMs = distanceM / targetTimeSec;
      const targetSpeedKmh = targetSpeedMs * 3.6;

      if (targetSpeedKmh >= 25 && targetSpeedKmh <= 50) {
        recommendedSpeedKmh = Math.round(targetSpeedKmh);
        advisoryStatus = 'DECELERATE';
        advisoryMessage = `Duy trì ${recommendedSpeedKmh} km/h để tới ${nearest.name} đúng lúc đèn vừa chuyển xanh`;
      } else if (targetSpeedKmh < 25) {
        recommendedSpeedKmh = 25;
        advisoryStatus = 'DECELERATE';
        advisoryMessage = `Chạy chậm ${recommendedSpeedKmh} km/h đón nhịp xanh sau ${nearest.spat.secondsRemaining}s`;
      } else {
        recommendedSpeedKmh = 45;
        advisoryStatus = 'MAINTAIN';
        advisoryMessage = `Duy trì ${recommendedSpeedKmh} km/h trên hành lang sóng xanh`;
      }
    }

    return {
      timestamp: Date.now(),
      currentStreet: nearest.streetName,
      nearestIntersection: {
        id: nearest.id,
        name: nearest.name,
        fullAddress: nearest.fullAddress,
        distanceMeters: distanceM,
        signalState: nearest.spat.signalState,
        secondsRemaining: nearest.spat.secondsRemaining,
        cycleSec: nearest.spat.cycleSec,
        greenDurationSec: nearest.spat.greenDurationSec
      },
      telematics: {
        currentSpeedKmh: Math.round(speed),
        recommendedSpeedKmh: Math.round(recommendedSpeedKmh),
        minSafeSpeedKmh: 25,
        maxSafeSpeedKmh: 50,
        advisoryStatus,
        advisoryMessage,
        energySavedEstimatePct: 22.5,
        co2SavedGramsEst: Math.round(distanceM * 0.14)
      },
      nearbyIntersections: evaluatedIntersections.slice(0, 4).map((d) => ({
        id: d.id,
        name: d.name,
        streetName: d.streetName,
        distanceMeters: d.distanceMeters,
        signalState: d.spat.signalState,
        secondsRemaining: d.spat.secondsRemaining
      }))
    };
  }
}

module.exports = ITSEngine;
