const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'its_smart_vehicle_rental_secret_key_2026',
  CORS_ORIGIN: '*',
  
  // ITS & Telematics Parameters (Chuyên đề ITS - UTH)
  ITS_CONFIG: {
    // Green Wave Speed Advisory baseline (km/h)
    DEFAULT_CYCLE_LENGTH_SEC: 90, // Chu kỳ đèn tín hiệu C (s)
    GREEN_SPLIT_RATIO: 0.55,      // Tỷ lệ pha xanh g/C
    DESIGN_SPEED_KMH: 45,         // Vận tốc thiết kế hành lang Làn sóng xanh (km/h)
    CORRIDOR_LENGTH_METERS: 2500, // Chiều dài trục hành lang thí điểm (Xa Lộ Hà Nội / Mai Chí Thọ)
    
    // Shockwave & Traffic Density (Mô hình Lighthill-Whitham-Richards: v_w = dq/dk)
    JAM_DENSITY_VEH_KM: 130,      // k_j: Mật độ kẹt xe tối đa (xe/km/làn)
    FREE_FLOW_SPEED_KMH: 60,      // v_f: Vận tốc dòng tự do (km/h)
    
    // Green Mobility & MaaS Metrics (Chương 1 - Giảm thiểu phát thải)
    ICE_CO2_EMISSION_G_KM: 145,   // Xe xăng truyền thống phát thải ~145g CO2/km
    EV_CO2_EMISSION_G_KM: 25,     // Xe điện VinFast tính theo nguồn điện lưới VN ~25g CO2/km
    CO2_SAVED_PER_KM: 120,        // Tiết kiệm được ~120g CO2/km (0.12 kg/km)
    
    // Geofencing tolerance (meters) for Smart Station pickup/return
    GEOFENCE_RADIUS_METERS: 150
  }
};
