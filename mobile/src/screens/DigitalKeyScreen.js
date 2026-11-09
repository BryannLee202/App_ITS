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
import { FONTS, THEME_PRESETS } from '../styles/theme';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';

const SOCKET_URL = 'http://localhost:5000';

export default function DigitalKeyScreen({ theme = THEME_PRESETS.MINT, onNavigateHome }) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [telematics, setTelematics] = useState(null);
  const [glosa, setGlosa] = useState(null);
  const [eco, setEco] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(false);
  const [statusToast, setStatusToast] = useState('Đã kết nối Bluetooth Low Energy 5.2');

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
      setStatusToast(res.message || 'Đã khóa xe và kết thúc chuyến đi.');
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
        <ActivityIndicator size="large" color="#111111" />
        <Text style={styles.loadingText}>Đang kết nối khóa xe...</Text>
      </View>
    );
  }

  if (!activeTrip) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="key-outline" size={32} color="#111111" />
        </View>
        <Text style={styles.emptyTitle}>Chưa có chuyến đi đang hoạt động</Text>
        <Text style={styles.emptyDesc}>
          Chọn một xe trên trang Khám phá hoặc Bản đồ để nhận chìa khóa số mở cửa xe tự động 24/7.
        </Text>
        <TouchableOpacity style={styles.goHomeBtn} onPress={onNavigateHome}>
          <Text style={styles.goHomeBtnText}>Tìm xe gần bạn</Text>
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
      {/* 1. Minimal Tesla-Style Vehicle Header */}
      <View style={styles.headerBlock}>
        <View>
          <Text style={styles.vehicleTitle}>{vehicle.name}</Text>
          <View style={styles.subStatusRow}>
            <View style={styles.connectedDot} />
            <Text style={styles.subStatusText}>
              {vehicle.plateNumber} · {isLocked ? 'Đang khóa' : 'Đã mở khóa'} · Pin {batteryPct}%
            </Text>
          </View>
        </View>

        <View style={styles.contractPill}>
          <Text style={styles.contractPillText}>{activeTrip.contractNumber}</Text>
        </View>
      </View>

      {/* 2. Showroom Vehicle Card */}
      <View style={styles.heroCard}>
        <View style={styles.photoContainer}>
          <Image source={{ uri: vehicle.thumbnail }} style={styles.vehPhoto} resizeMode="cover" />
        </View>

        <View style={styles.statusToastRow}>
          <Ionicons name="checkmark-circle" size={15} color={theme.primary} />
          <Text style={styles.statusToastText} numberOfLines={1}>{statusToast}</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>{batteryPct}%</Text>
            <Text style={styles.metricLbl}>Dung lượng pin</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>{Math.round((vehicle.rangeKm || 420) * (batteryPct / 100))} km</Text>
            <Text style={styles.metricLbl}>Quãng đường</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>{currentSpeed} km/h</Text>
            <Text style={styles.metricLbl}>Vận tốc</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>22°C</Text>
            <Text style={styles.metricLbl}>Nhiệt độ cabin</Text>
          </View>
        </View>
      </View>

      {/* 3. Primary Controls (Lock / Unlock / Start Engine) */}
      <View style={styles.controlsCard}>
        <Text style={styles.cardSectionTitle}>Điều khiển phương tiện</Text>

        {/* Primary Lock / Engine Bar */}
        <View style={styles.primaryActionsRow}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, !isLocked && styles.primaryActionBtnActive]}
            disabled={commandLoading}
            onPress={() => handleControl(isLocked ? 'UNLOCK' : 'LOCK')}
          >
            <Ionicons
              name={isLocked ? 'lock-closed-outline' : 'lock-open-outline'}
              size={20}
              color={!isLocked ? '#FFFFFF' : '#111111'}
            />
            <Text style={[styles.primaryActionText, !isLocked && styles.primaryActionTextActive]}>
              {isLocked ? 'Mở khóa xe' : 'Khóa cửa xe'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryActionBtn,
              isEngineOn && { backgroundColor: theme.primary }
            ]}
            disabled={commandLoading}
            onPress={() => handleControl(isEngineOn ? 'ENGINE_STOP' : 'ENGINE_START')}
          >
            <Ionicons
              name="power"
              size={20}
              color={isEngineOn ? '#FFFFFF' : '#111111'}
            />
            <Text style={[styles.primaryActionText, isEngineOn && styles.primaryActionTextActive]}>
              {isEngineOn ? 'Động cơ: Bật' : 'Khởi động xe'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Quick Controls (4 Clean Items) */}
        <View style={styles.secondaryGrid}>
          <TouchableOpacity style={styles.secBtn} onPress={() => handleControl('TRUNK_OPEN')}>
            <Ionicons name="car-outline" size={20} color="#111111" />
            <Text style={styles.secBtnLabel}>Mở cốp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secBtn} onPress={() => handleControl('AC_PRECOOL')}>
            <Ionicons name="snow-outline" size={20} color="#111111" />
            <Text style={styles.secBtnLabel}>Làm mát</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secBtn} onPress={() => handleControl('FLASH_LIGHTS')}>
            <Ionicons name="sunny-outline" size={20} color="#111111" />
            <Text style={styles.secBtnLabel}>Nháy đèn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secBtn} onPress={() => handleControl('HORN')}>
            <Ionicons name="volume-medium-outline" size={20} color="#111111" />
            <Text style={styles.secBtnLabel}>Tìm xe</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. ITS Green Wave Advisory Card */}
      {glosa && (
        <View style={styles.glosaCard}>
          <View style={styles.glosaTopRow}>
            <View>
              <Text style={styles.glosaTitle}>Hỗ trợ làn sóng xanh (GLOSA)</Text>
              <Text style={styles.glosaSub}>Trục Điện Biên Phủ – Mai Chí Thọ</Text>
            </View>
            <View style={styles.glosaSignalBadge}>
              <View style={styles.liveGreenDot} />
              <Text style={styles.glosaSignalText}>
                Đèn {glosa.signalState === 'GREEN' ? 'xanh' : 'đỏ'} {glosa.secondsToSignalChange}s
              </Text>
            </View>
          </View>

          <View style={styles.glosaSpeedBox}>
            <View>
              <Text style={styles.glosaSpeedLabel}>Vận tốc khuyến nghị qua nút giao</Text>
              <Text style={styles.glosaAdviceMsg}>{glosa.advisoryMessage}</Text>
            </View>
            <Text style={styles.glosaSpeedValue}>{glosa.recommendedSpeedKmh} km/h</Text>
          </View>
        </View>
      )}

      {/* 5. CO2 Impact Widget */}
      <CO2Widget eco={eco} accentColor={theme.primary} softBg={theme.primarySoft} />

      {/* 6. Return Vehicle CTA */}
      <TouchableOpacity
        style={styles.returnBtn}
        activeOpacity={0.85}
        onPress={handleCompleteTrip}
      >
        <Text style={styles.returnBtnText}>Kết thúc chuyến & Trả xe tại trạm</Text>
      </TouchableOpacity>

      <View style={{ height: 96 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5'
  },
  scrollContent: {
    padding: 16
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F7F7F5'
  },
  loadingText: {
    fontFamily: FONTS.family,
    marginTop: 12,
    fontSize: 13,
    color: '#6E6E73'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#F7F7F5'
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  emptyTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  emptyDesc: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6E6E73',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19
  },
  goHomeBtn: {
    backgroundColor: '#1D1D1F',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20
  },
  goHomeBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  vehicleTitle: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.4
  },
  subStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0CA678'
  },
  subStatusText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6E6E73',
    fontWeight: '500'
  },
  contractPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBEBED'
  },
  contractPillText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#6E6E73'
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBEBED',
    marginBottom: 14
  },
  photoContainer: {
    width: '100%',
    height: 175,
    backgroundColor: '#F6F5F2'
  },
  vehPhoto: {
    width: '100%',
    height: '100%'
  },
  statusToastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F5',
    gap: 6
  },
  statusToastText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#111111',
    fontWeight: '500',
    flex: 1
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14
  },
  metricCol: {
    flex: 1,
    alignItems: 'center'
  },
  metricDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#EBEBED'
  },
  metricVal: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#111111'
  },
  metricLbl: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2
  },
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBEBED',
    marginBottom: 14
  },
  cardSectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F7',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8
  },
  primaryActionBtnActive: {
    backgroundColor: '#1D1D1F'
  },
  primaryActionBtnMint: {
    backgroundColor: '#0CA678'
  },
  primaryActionText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#111111'
  },
  primaryActionTextActive: {
    color: '#FFFFFF'
  },
  secondaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  secBtn: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  secBtnLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: '#111111'
  },
  glosaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBEBED',
    marginBottom: 10
  },
  glosaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  glosaTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#111111'
  },
  glosaSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 1
  },
  glosaSignalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBFBF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 6
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0CA678'
  },
  glosaSignalText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#0CA678'
  },
  glosaSpeedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F3EC',
    borderRadius: 12,
    padding: 12
  },
  glosaSpeedLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  glosaAdviceMsg: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 2,
    maxWidth: 230
  },
  glosaSpeedValue: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '700',
    color: '#0CA678'
  },
  returnBtn: {
    backgroundColor: '#1D1D1F',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  returnBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  }
});
