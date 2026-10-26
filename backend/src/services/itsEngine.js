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
}

module.exports = ITSEngine;
