import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';
import { initSocket } from '../services/socket';

export default function DigitalKeyScreen({ onNavigateHome }) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Đã kết nối Bluetooth BLE 5.2 & Cloud Telematics với xe.'
  );

  const [telematics, setTelematics] = useState({
    batteryLevelPct: 92,
    speedKmh: 42,
    odometerKm: 14520,
    isLocked: false,
    isEngineOn: true
  });

  const [glosa, setGlosa] = useState({
    distanceToIntersectionMeters: 280,
    currentSpeedKmh: 42,
    recommendedSpeedKmh: 45,
    advisoryStatus: 'MAINTAIN',
    advisoryMessage: 'Duy trì 45 km/h để qua ngã tư đèn xanh không cần dừng',
    signalState: 'GREEN',
    secondsToSignalChange: 24,
    fuelSavedEstimatePct: 18.5
  });

  const [eco, setEco] = useState({
    distanceKm: 14.2,
    co2SavedKg: 1.7,
    treesEquivalent: 0.085,
    ecoPointsEarned: 17
  });

  useEffect(() => {
    loadActiveTrip();

    const cleanup = initSocket(
      (telemetryData) => {
        if (telemetryData.telematics) {
          setTelematics((prev) => ({ ...prev, ...telemetryData.telematics }));
        }
        if (telemetryData.glosa) {
          setGlosa(telemetryData.glosa);
        }
        if (telemetryData.eco) {
          setEco(telemetryData.eco);
        }
      },
      (ackData) => {
        setStatusMessage(ackData.message);
        if (ackData.telematics) {
          setTelematics((prev) => ({ ...prev, ...ackData.telematics }));
        }
      }
    );

    return cleanup;
  }, []);

  const loadActiveTrip = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getActiveTrip();
      if (res.activeTrip) {
        setActiveTrip(res.activeTrip);
        if (res.activeTrip.vehicle?.telematics) {
          setTelematics(res.activeTrip.vehicle.telematics);
        }
        if (res.activeTrip.glosa) setGlosa(res.activeTrip.glosa);
        if (res.activeTrip.eco) setEco(res.activeTrip.eco);
      }
    } catch (err) {
      console.warn('Load active trip error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleControlCommand = async (command) => {
    if (!activeTrip) return;
    try {
      setActionLoading(true);
      const res = await ApiService.controlVehicle(activeTrip.id, command);
      setStatusMessage(res.message);
      if (res.telematics) {
        setTelematics((prev) => ({ ...prev, ...res.telematics }));
      }
    } catch (err) {
      Alert.alert('Lỗi điều khiển', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnVehicle = () => {
    if (!activeTrip) return;

    Alert.alert(
      'Xác Nhận Trả Xe Tại Trạm Hub',
      'Hệ thống ITS sẽ kiểm tra vị trí đỗ Geofencing (bán kính <= 150m từ trạm) và khóa xe tự động.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác Nhận Trả Xe',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await ApiService.completeTrip(
                activeTrip.id,
                activeTrip.returnStationId
              );
              Alert.alert('Trả Xe Thành Công', res.message);
              setActiveTrip(null);
            } catch (err) {
              Alert.alert('Không thể trả xe', err.message);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang kết nối Chìa khóa số Digital Key...</Text>
      </View>
    );
  }

  if (!activeTrip) {
    return (
      <View style={styles.noTripContainer}>
        <View style={styles.noTripCircle}>
          <Ionicons name="key" size={40} color="#DF8268" />
        </View>
        <Text style={styles.noTripTitle}>Chưa có xe đang thuê</Text>
        <Text style={styles.noTripSub}>
          Hãy chọn một chiếc ô tô hoặc xe máy điện tại Trang chủ để kích hoạt Chìa khóa số thông minh (Digital Key).
        </Text>
        <TouchableOpacity
          style={styles.reloadBtn}
          onPress={onNavigateHome || loadActiveTrip}
        >
          <Ionicons name="car-sport" size={16} color="#FFFFFF" />
          <Text style={styles.reloadBtnText}>Chọn xe ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const veh = activeTrip.vehicle || {};
  const batteryPct = Math.round(telematics.batteryLevelPct || 92);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* =========================================================
          1. THÔNG TIN XE & TRẠNG THÁI KẾT NỐI TRỰC QUAN
      ========================================================= */}
      <View style={styles.vehicleOverviewCard}>
        <View style={styles.vehicleHeaderRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={styles.contractBadge}>
              <Ionicons name="bluetooth" size={12} color="#527394" />
              <Text style={styles.contractBadgeText}>
                BLE 5.2 ĐÃ KẾT NỐI • {activeTrip.contractNumber}
              </Text>
            </View>
            <Text style={styles.vehicleName}>{veh.name || 'VinFast VF 8 Plus'}</Text>
            <Text style={styles.plateText}>Biển số: {veh.plateNumber || '51K-882.91'}</Text>
          </View>

          <View
            style={[
              styles.lockStatusBadge,
              telematics.isLocked ? styles.lockedBadge : styles.unlockedBadge
            ]}
          >
            <Ionicons
              name={telematics.isLocked ? 'lock-closed' : 'lock-open'}
              size={14}
              color={telematics.isLocked ? '#C4684F' : '#527394'}
            />
            <Text
              style={[
                styles.lockStatusText,
                { color: telematics.isLocked ? '#C4684F' : '#527394' }
              ]}
            >
              {telematics.isLocked ? 'ĐÃ KHÓA CỬA' : 'CỬA ĐANG MỞ'}
            </Text>
          </View>
        </View>

        {/* Hình ảnh xe thực tế & 3 chỉ số nhanh */}
        <View style={styles.vehicleVisualRow}>
          <Image
            source={{
              uri:
                veh.thumbnail ||
                'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80'
            }}
            style={styles.vehicleBannerImage}
            resizeMode="cover"
          />
          <View style={styles.quickMetricsCol}>
            <View style={styles.quickMetricBox}>
              <Text style={styles.qmLabel}>Mức Pin hiện tại</Text>
              <Text style={[styles.qmVal, { color: '#527394' }]}>{batteryPct}% Pin</Text>
            </View>
            <View style={styles.quickMetricBox}>
              <Text style={styles.qmLabel}>Quãng đường còn lại</Text>
              <Text style={styles.qmVal}>{Math.round(batteryPct * 4.2)} km</Text>
            </View>
            <View style={styles.quickMetricBox}>
              <Text style={styles.qmLabel}>Trạng thái máy</Text>
              <Text style={[styles.qmVal, { color: telematics.isEngineOn ? '#4C8C64' : '#7A6A63' }]}>
                {telematics.isEngineOn ? 'Đang nổ máy' : 'Đã tắt máy'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.feedbackBar}>
          <Ionicons name="checkmark-circle" size={15} color="#DF8268" />
          <Text style={styles.feedbackText} numberOfLines={1}>
            {statusMessage}
          </Text>
        </View>
      </View>

      {/* =========================================================
          2. BẢNG ĐIỀU KHIỂN CHÌA KHÓA SỐ (RÕ RÀNG, DỄ BẤM)
      ========================================================= */}
      <View style={styles.remoteCard}>
        <Text style={styles.sectionTitle}>Điều khiển xe từ xa (Chạm để thao tác)</Text>

        {/* Nút Khởi động / Tắt máy lớn ở trung tâm */}
        <TouchableOpacity
          style={[
            styles.enginePowerBtn,
            telematics.isEngineOn && styles.enginePowerBtnActive
          ]}
          activeOpacity={0.88}
          disabled={actionLoading}
          onPress={() =>
            handleControlCommand(telematics.isEngineOn ? 'STOP_ENGINE' : 'START_ENGINE')
          }
        >
          <View style={styles.powerIconCircle}>
            <Ionicons
              name="power"
              size={24}
              color={telematics.isEngineOn ? '#527394' : '#DF8268'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.engineBtnTitle}>
              {telematics.isEngineOn ? 'ĐỘNG CƠ ĐANG BẬT (READY)' : 'BẤM ĐỂ KHỞI ĐỘNG XE'}
            </Text>
            <Text style={styles.engineBtnSub}>
              {telematics.isEngineOn
                ? 'Điều hòa 22°C đang hoạt động • Chạm để tắt máy'
                : 'Khởi động từ xa & làm mát khoang lái trước khi lên xe'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 4 Nút Chức Năng Vật Lý Trực Quan (2x2 Grid) */}
        <View style={styles.fourButtonsGrid}>
          {/* Nút 1: Mở khóa cửa */}
          <TouchableOpacity
            style={[
              styles.controlTile,
              !telematics.isLocked && styles.controlTileActiveBlue
            ]}
            activeOpacity={0.85}
            disabled={actionLoading}
            onPress={() => handleControlCommand('UNLOCK')}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: '#EBF2F8' }]}>
              <Ionicons name="lock-open" size={22} color="#527394" />
            </View>
            <Text style={styles.tileTitle}>Mở khóa cửa</Text>
            <Text style={styles.tileSub}>Mở chốt 4 cửa xe</Text>
          </TouchableOpacity>

          {/* Nút 2: Khóa xe */}
          <TouchableOpacity
            style={[
              styles.controlTile,
              telematics.isLocked && styles.controlTileActiveCoral
            ]}
            activeOpacity={0.85}
            disabled={actionLoading}
            onPress={() => handleControlCommand('LOCK')}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: '#FCEEE9' }]}>
              <Ionicons name="lock-closed" size={22} color="#DF8268" />
            </View>
            <Text style={styles.tileTitle}>Khóa toàn bộ xe</Text>
            <Text style={styles.tileSub}>Gập gương & lên kính</Text>
          </TouchableOpacity>

          {/* Nút 3: Bấm còi & Nháy đèn */}
          <TouchableOpacity
            style={styles.controlTile}
            activeOpacity={0.85}
            disabled={actionLoading}
            onPress={() => handleControlCommand('HORN')}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: '#FDF6E4' }]}>
              <Ionicons name="volume-high" size={22} color="#D49B35" />
            </View>
            <Text style={styles.tileTitle}>Tìm xe trong bãi</Text>
            <Text style={styles.tileSub}>Bấm còi & nháy đèn</Text>
          </TouchableOpacity>

          {/* Nút 4: Mở cốp sau */}
          <TouchableOpacity
            style={styles.controlTile}
            activeOpacity={0.85}
            disabled={actionLoading}
            onPress={() => handleControlCommand('TRUNK')}
          >
            <View style={[styles.tileIconCircle, { backgroundColor: '#E8F4EC' }]}>
              <Ionicons name="briefcase" size={22} color="#4C8C64" />
            </View>
            <Text style={styles.tileTitle}>Mở cốp điện</Text>
            <Text style={styles.tileSub}>Nâng cốp sau tự động</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================================================
          3. HỖ TRỢ LÁI XE LÀN SÓNG XANH (GLOSA HUD TRỰC QUAN)
      ========================================================= */}
      <View style={styles.glosaCard}>
        <View style={styles.glosaHeader}>
          <View style={styles.trafficLightDot} />
          <Text style={styles.glosaTitle}>HỆ THỐNG DẪN ĐƯỜNG LÀN SÓNG XANH (GLOSA)</Text>
        </View>

        <View style={styles.speedComparisonRow}>
          <View style={styles.speedBox}>
            <Text style={styles.speedBoxLabel}>Tốc độ xe hiện tại</Text>
            <Text style={styles.speedBoxValue}>
              {Math.round(telematics.speedKmh || 42)} <Text style={styles.speedUnit}>km/h</Text>
            </Text>
          </View>

          <Ionicons name="arrow-forward-circle" size={24} color="#6E92B5" />

          <View style={[styles.speedBox, styles.speedBoxGreenWave]}>
            <Text style={[styles.speedBoxLabel, { color: '#527394' }]}>
              Vận tốc khuyến nghị
            </Text>
            <Text style={[styles.speedBoxValue, { color: '#527394' }]}>
              {glosa.recommendedSpeedKmh || 45} <Text style={styles.speedUnit}>km/h</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.glosaMessageText}>
          🚦 {glosa.advisoryMessage} (Đèn xanh ngã tư kế tiếp còn {glosa.secondsToSignalChange}s)
        </Text>
      </View>

      {/* =========================================================
          4. THỐNG KÊ MÔI TRƯỜNG & NÚT TRẢ XE TẠI TRẠM
      ========================================================= */}
      <CO2Widget eco={eco} />

      <TouchableOpacity
        style={styles.returnVehicleBtn}
        activeOpacity={0.88}
        onPress={handleReturnVehicle}
      >
        <Text style={styles.returnVehicleText}>KẾT THÚC CHUYẾN & TRẢ XE TẠI TRẠM HUB</Text>
        <View style={styles.returnKnobWhite}>
          <Ionicons name="checkmark" size={16} color="#DF8268" />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFE5DC'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#EFE5DC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#7A6A63',
    fontWeight: '600'
  },
  noTripContainer: {
    flex: 1,
    backgroundColor: '#EFE5DC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28
  },
  noTripCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5
  },
  noTripTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2C221E',
    marginBottom: 8
  },
  noTripSub: {
    fontSize: 13,
    color: '#7A6A63',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    fontWeight: '600'
  },
  reloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DF8268',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8
  },
  reloadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },

  /* 1. Vehicle Overview Card */
  vehicleOverviewCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 14
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  contractBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  contractBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#527394'
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2C221E'
  },
  plateText: {
    fontSize: 12,
    color: '#7A6A63',
    fontWeight: '700',
    marginTop: 2
  },
  lockStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5
  },
  lockedBadge: {
    backgroundColor: '#FCEEE9'
  },
  unlockedBadge: {
    backgroundColor: '#EBF2F8'
  },
  lockStatusText: {
    fontSize: 10,
    fontWeight: '900'
  },
  vehicleVisualRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  vehicleBannerImage: {
    width: '54%',
    height: 118,
    borderRadius: 16,
    backgroundColor: '#F3EAE0'
  },
  quickMetricsCol: {
    flex: 1,
    gap: 6
  },
  quickMetricBox: {
    backgroundColor: '#F6F0E8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  qmLabel: {
    fontSize: 9,
    color: '#8C7A70',
    fontWeight: '700'
  },
  qmVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2C221E',
    marginTop: 1
  },
  feedbackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F0E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C4B43',
    flex: 1
  },

  /* 2. Remote Control Card */
  remoteCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2C221E',
    marginBottom: 12
  },
  enginePowerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCEEE9',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#F5C2AF',
    marginBottom: 14
  },
  enginePowerBtnActive: {
    backgroundColor: '#EBF2F8',
    borderColor: '#94B4D1'
  },
  powerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3
  },
  engineBtnTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2C221E'
  },
  engineBtnSub: {
    fontSize: 11,
    color: '#7A6A63',
    fontWeight: '600',
    marginTop: 2
  },
  fourButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10
  },
  controlTile: {
    width: '48.5%',
    backgroundColor: '#F6F0E8',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  },
  controlTileActiveBlue: {
    borderColor: '#6E92B5',
    backgroundColor: '#F2F7FB'
  },
  controlTileActiveCoral: {
    borderColor: '#DF8268',
    backgroundColor: '#FDF4F1'
  },
  tileIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C221E'
  },
  tileSub: {
    fontSize: 10,
    color: '#8C7A70',
    fontWeight: '600',
    marginTop: 2
  },

  /* 3. GLOSA Card */
  glosaCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 10
  },
  glosaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  trafficLightDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4C8C64'
  },
  glosaTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2C221E',
    letterSpacing: 0.4
  },
  speedComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10
  },
  speedBox: {
    flex: 1,
    backgroundColor: '#F6F0E8',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  speedBoxGreenWave: {
    backgroundColor: '#EBF2F8',
    borderColor: '#94B4D1'
  },
  speedBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A6A63'
  },
  speedBoxValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2C221E',
    marginTop: 2
  },
  speedUnit: {
    fontSize: 11,
    fontWeight: '700'
  },
  glosaMessageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#527394',
    backgroundColor: '#EBF2F8',
    padding: 10,
    borderRadius: 12
  },

  /* 4. Return Button */
  returnVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DF8268',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 26,
    marginTop: 10,
    shadowColor: '#DF8268',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6
  },
  returnVehicleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  returnKnobWhite: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
