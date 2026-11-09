import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';

const SOCKET_URL = 'http://localhost:5000';

export default function DigitalKeyScreen({ onNavigateHome }) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [telematics, setTelematics] = useState(null);
  const [glosa, setGlosa] = useState(null);
  const [eco, setEco] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(false);
  const [statusToast, setStatusToast] = useState('Đã kết nối khóa thông minh BLE 5.2 Encrypted');

  useEffect(() => {
    loadActiveTrip();

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('trip:telemetry', (payload) => {
      if (payload.telematics) setTelematics(payload.telematics);
      if (payload.glosa) setGlosa(payload.glosa);
      if (payload.eco) setEco(payload.eco);
    });

    socket.on('vehicle:control_ack', (ack) => {
      if (ack.telematics) setTelematics(ack.telematics);
      if (ack.message) setStatusToast(ack.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadActiveTrip = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getActiveTrip();
      if (res.activeTrip) {
        setActiveTrip(res.activeTrip);
        setTelematics(res.activeTrip.vehicle?.telematics || null);
        setGlosa(res.activeTrip.glosa || null);
        setEco(res.activeTrip.eco || null);
      }
    } catch (err) {
      console.warn('Error loading active trip:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleControl = async (command) => {
    if (!activeTrip) return;
    try {
      setCommandLoading(true);
      const res = await ApiService.controlVehicle(activeTrip.id, command);
      if (res.telematics) setTelematics(res.telematics);
      if (res.message) setStatusToast(res.message);
    } catch (err) {
      setStatusToast(err.message || 'Không thể gửi lệnh điều khiển');
    } finally {
      setCommandLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeTrip) return;
    try {
      setCommandLoading(true);
      const res = await ApiService.completeTrip(activeTrip.id, activeTrip.returnStationId);
      setStatusToast(res.message || 'Đã khóa xe và tất toán hợp đồng thành công!');
      setTimeout(() => {
        loadActiveTrip();
      }, 1200);
    } catch (err) {
      setStatusToast(err.message);
    } finally {
      setCommandLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Đang đồng bộ khóa số BLE 5.2 & Telematics...</Text>
      </View>
    );
  }

  if (!activeTrip) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="key-outline" size={38} color="#10B981" />
        </View>
        <Text style={styles.emptyTitle}>Chưa Có Xe Đang Mở Khóa</Text>
        <Text style={styles.emptyDesc}>
          Hãy chọn một phương tiện tại Trang chủ hoặc Bản đồ Trạm Hub để ký hợp đồng điện tử và nhận chìa khóa số BLE 24/7.
        </Text>
        <TouchableOpacity style={styles.goHomeBtn} onPress={onNavigateHome}>
          <Ionicons name="car-sport" size={16} color="#FFFFFF" />
          <Text style={styles.goHomeBtnText}>Chọn Xe Thuê Ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vehicle = activeTrip.vehicle || {};
  const isLocked = telematics ? telematics.isLocked : false;
  const isEngineOn = telematics ? telematics.isEngineOn : true;
  const batteryPct = Math.round(telematics?.batteryLevelPct || 90);
  const currentSpeed = Math.round(telematics?.speedKmh || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Top BLE Connection & Contract Bar */}
      <View style={styles.topStatusBar}>
        <View style={styles.blePill}>
          <View style={styles.blePulseDot} />
          <Ionicons name="bluetooth" size={13} color="#059669" />
          <Text style={styles.blePillText}>BLE 5.2 CONNECTED • {activeTrip.contractNumber}</Text>
        </View>
        <View style={[styles.lockStateBadge, isLocked ? styles.badgeLocked : styles.badgeUnlocked]}>
          <Ionicons name={isLocked ? 'lock-closed' : 'lock-open'} size={11} color="#FFFFFF" />
          <Text style={styles.lockStateText}>{isLocked ? 'ĐÃ KHÓA CỬA' : 'ĐANG MỞ KHÓA'}</Text>
        </View>
      </View>

      {/* 2. Vehicle Showroom Card & Live Telemetry */}
      <View style={styles.vehicleHeroCard}>
        <View style={styles.vehHeaderRow}>
          <View>
            <Text style={styles.vehBrandTag}>VINFAST SMART TELEMATICS</Text>
            <Text style={styles.vehName}>{vehicle.name}</Text>
          </View>
          <View style={styles.plateBox}>
            <Text style={styles.plateText}>{vehicle.plateNumber}</Text>
          </View>
        </View>

        <View style={styles.photoFrame}>
          <Image source={{ uri: vehicle.thumbnail }} style={styles.vehPhoto} resizeMode="cover" />
          <View style={styles.toastOverlay}>
            <Ionicons name="radio-outline" size={14} color="#10B981" />
            <Text style={styles.toastOverlayText} numberOfLines={1}>{statusToast}</Text>
          </View>
        </View>

        {/* 4 Live Telemetry Gauges */}
        <View style={styles.telemetryGrid}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>MỨC PIN</Text>
            <Text style={[styles.telemetryVal, { color: '#059669' }]}>{batteryPct}%</Text>
            <Text style={styles.telemetrySub}>~{Math.round((vehicle.rangeKm || 420) * (batteryPct / 100))} km</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>VẬN TỐC</Text>
            <Text style={styles.telemetryVal}>{currentSpeed}</Text>
            <Text style={styles.telemetrySub}>km/h (GPS)</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>ĐIỀU HÒA</Text>
            <Text style={styles.telemetryVal}>22°C</Text>
            <Text style={styles.telemetrySub}>Auto Eco</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>ÁP SUẤT LỐP</Text>
            <Text style={styles.telemetryVal}>2.3</Text>
            <Text style={styles.telemetrySub}>Bar • Chuẩn</Text>
          </View>
        </View>
      </View>

      {/* 3. Master Engine Start/Stop & 6 Hardware Controls */}
      <View style={styles.controlsSectionCard}>
        <View style={styles.engineMasterRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.engineSectionTitle}>Khởi Động Hệ Thống Điện (START/STOP)</Text>
            <Text style={styles.engineSectionSub}>
              {isEngineOn
                ? 'Động cơ điện đang hoạt động • Sẵn sàng di chuyển'
                : 'Hệ thống đang tắt • Mở khóa cửa trước khi bấm Start'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.engineStartBtn, isEngineOn ? styles.engineBtnOn : styles.engineBtnOff]}
            disabled={commandLoading}
            onPress={() => handleControl(isEngineOn ? 'ENGINE_STOP' : 'ENGINE_START')}
          >
            <Ionicons name="power" size={24} color="#FFFFFF" />
            <Text style={styles.engineBtnLabel}>{isEngineOn ? 'ENGINE ON' : 'START'}</Text>
          </TouchableOpacity>
        </View>

        {/* 6 Tactile Hardware Action Buttons (2x3 Grid) */}
        <View style={styles.hardwareGrid}>
          <TouchableOpacity
            style={[styles.hwButton, !isLocked && styles.hwButtonMintActive]}
            onPress={() => handleControl('UNLOCK')}
          >
            <View style={[styles.hwIconCircle, !isLocked && styles.hwIconCircleActive]}>
              <Ionicons name="lock-open" size={18} color={!isLocked ? '#FFFFFF' : '#059669'} />
            </View>
            <Text style={styles.hwBtnTitle}>Mở Khóa Cửa</Text>
            <Text style={styles.hwBtnSub}>Chạm mở 4 cửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.hwButton, isLocked && styles.hwButtonMintActive]}
            onPress={() => handleControl('LOCK')}
          >
            <View style={[styles.hwIconCircle, isLocked && styles.hwIconCircleActive]}>
              <Ionicons name="lock-closed" size={18} color={isLocked ? '#FFFFFF' : '#059669'} />
            </View>
            <Text style={styles.hwBtnTitle}>Khóa Toàn Bộ</Text>
            <Text style={styles.hwBtnSub}>Đóng kính & gương</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hwButton}
            onPress={() => handleControl('TRUNK_OPEN')}
          >
            <View style={styles.hwIconCircleBeige}>
              <Ionicons name="car-outline" size={18} color="#786B59" />
            </View>
            <Text style={styles.hwBtnTitle}>Mở Cốp Điện</Text>
            <Text style={styles.hwBtnSub}>Cốp sau tự động</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hwButton}
            onPress={() => handleControl('AC_PRECOOL')}
          >
            <View style={styles.hwIconCircleBeige}>
              <Ionicons name="snow-outline" size={18} color="#786B59" />
            </View>
            <Text style={styles.hwBtnTitle}>Làm Mát Trước</Text>
            <Text style={styles.hwBtnSub}>Bật A/C 22°C</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hwButton}
            onPress={() => handleControl('FLASH_LIGHTS')}
          >
            <View style={styles.hwIconCircle}>
              <Ionicons name="flashlight-outline" size={18} color="#059669" />
            </View>
            <Text style={styles.hwBtnTitle}>Nháy Đèn Tìm Xe</Text>
            <Text style={styles.hwBtnSub}>Hazard 3 lần</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hwButton}
            onPress={() => handleControl('HORN')}
          >
            <View style={styles.hwIconCircle}>
              <Ionicons name="volume-high-outline" size={18} color="#059669" />
            </View>
            <Text style={styles.hwBtnTitle}>Phát Còi Báo</Text>
            <Text style={styles.hwBtnSub}>Tìm vị trí hầm</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. ITS GLOSA Green Wave Speed Advisory Cockpit */}
      {glosa && (
        <View style={styles.glosaCockpitCard}>
          <View style={styles.glosaHeader}>
            <View style={styles.glosaTitleRow}>
              <Ionicons name="speedometer" size={16} color="#059669" />
              <Text style={styles.glosaTitle}>HỆ THỐNG LÀN SÓNG XANH GLOSA (ITS UTH)</Text>
            </View>
            <View style={styles.signalCountdownBadge}>
              <Text style={styles.signalCountdownText}>
                ĐÈN {glosa.signalState === 'GREEN' ? 'XANH' : 'ĐỎ'}: {glosa.secondsToSignalChange}S
              </Text>
            </View>
          </View>

          <View style={styles.glosaSpeedCompare}>
            <View style={styles.speedBox}>
              <Text style={styles.speedBoxLabel}>TỐC ĐỘ HIỆN TẠI</Text>
              <Text style={styles.speedBoxCurrent}>{glosa.currentSpeedKmh} <Text style={styles.speedUnit}>km/h</Text></Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#10B981" />
            <View style={[styles.speedBox, styles.speedBoxRecommended]}>
              <Text style={styles.speedBoxLabelMint}>VẬN TỐC KHUYẾN NGHỊ</Text>
              <Text style={styles.speedBoxTarget}>{glosa.recommendedSpeedKmh} <Text style={styles.speedUnitMint}>km/h</Text></Text>
            </View>
          </View>
          <Text style={styles.glosaAdviceText}>✓ {glosa.advisoryMessage}</Text>
        </View>
      )}

      {/* 5. CO2 Impact Widget */}
      <CO2Widget eco={eco} />

      {/* 6. Geofenced Smart Return Button */}
      <TouchableOpacity
        style={styles.returnVehicleBtn}
        activeOpacity={0.88}
        onPress={handleCompleteTrip}
      >
        <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
        <Text style={styles.returnVehicleBtnText}>Kiểm Tra Geofence & Trả Xe Tại Trạm Hub</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7'
  },
  scrollContent: {
    padding: 16
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F5F7'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#F5F5F7'
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827'
  },
  emptyDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19
  },
  goHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 99,
    gap: 8,
    marginTop: 20
  },
  goHomeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  topStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  blePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 5
  },
  blePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  blePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  lockStateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 4
  },
  badgeLocked: {
    backgroundColor: '#111827'
  },
  badgeUnlocked: {
    backgroundColor: '#10B981'
  },
  lockStateText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  vehicleHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12
  },
  vehHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  vehBrandTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5
  },
  vehName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827'
  },
  plateBox: {
    backgroundColor: '#F5F2EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DEC9'
  },
  plateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#57534E'
  },
  photoFrame: {
    width: '100%',
    height: 155,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F2EB',
    position: 'relative',
    marginBottom: 12
  },
  vehPhoto: {
    width: '100%',
    height: '100%'
  },
  toastOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6
  },
  toastOverlayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    flex: 1
  },
  telemetryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  telemetryItem: {
    flex: 1,
    alignItems: 'center'
  },
  telemetryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB'
  },
  telemetryLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6B7280'
  },
  telemetryVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2
  },
  telemetrySub: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600'
  },
  controlsSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12
  },
  engineMasterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F2EB',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5DEC9'
  },
  engineSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827'
  },
  engineSectionSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2
  },
  engineStartBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  engineBtnOn: {
    backgroundColor: '#10B981'
  },
  engineBtnOff: {
    backgroundColor: '#111827'
  },
  engineBtnLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 3
  },
  hardwareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10
  },
  hwButton: {
    width: '31.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  hwButtonMintActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981'
  },
  hwIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  hwIconCircleActive: {
    backgroundColor: '#10B981'
  },
  hwIconCircleBeige: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F5F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  hwBtnTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center'
  },
  hwBtnSub: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
    textAlign: 'center'
  },
  glosaCockpitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    marginBottom: 8
  },
  glosaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  glosaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  glosaTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669'
  },
  signalCountdownBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99
  },
  signalCountdownText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  glosaSpeedCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8
  },
  speedBox: {
    flex: 1,
    alignItems: 'center'
  },
  speedBoxRecommended: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingVertical: 4
  },
  speedBoxLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6B7280'
  },
  speedBoxLabelMint: {
    fontSize: 8,
    fontWeight: '800',
    color: '#059669'
  },
  speedBoxCurrent: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827'
  },
  speedBoxTarget: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669'
  },
  speedUnit: {
    fontSize: 10,
    color: '#6B7280'
  },
  speedUnitMint: {
    fontSize: 10,
    color: '#059669'
  },
  glosaAdviceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  returnVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginTop: 8
  },
  returnVehicleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
