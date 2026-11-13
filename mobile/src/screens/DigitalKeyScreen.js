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
import CancelTripModal from '../components/CancelTripModal';
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
  const [activeQuickCommand, setActiveQuickCommand] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
      setActiveQuickCommand(command);
      const res = await ApiService.controlVehicle(activeTrip.id, command);
      if (res.telematics) setTelematics(res.telematics);
      if (res.message) setStatusToast(res.message);
    } catch (err) {
      setStatusToast(err.message || 'Không thể gửi lệnh điều khiển');
    } finally {
      setCommandLoading(false);
      setTimeout(() => setActiveQuickCommand(null), 1200);
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
        <ActivityIndicator size="large" color="#6F4E37" />
        <Text style={styles.loadingText}>Đang kết nối chìa khóa số BLE 5.2...</Text>
      </View>
    );
  }

  if (!activeTrip) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="key" size={32} color="#D4AF37" />
        </View>
        <Text style={styles.emptyTitle}>Chưa có phương tiện đang kích hoạt</Text>
        <Text style={styles.emptyDesc}>
          Chọn một xe trên trang Khám phá hoặc Bản đồ để ký hợp đồng điện tử và nhận chìa khóa số mở xe tự động 24/7.
        </Text>
        <TouchableOpacity style={styles.goHomeBtn} onPress={onNavigateHome} activeOpacity={0.88}>
          <Ionicons name="car-sport" size={16} color="#FAF7F2" />
          <Text style={styles.goHomeBtnText}>Tìm xe và nhận khóa ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vehicle = activeTrip.vehicle || {};
  const isLocked = telematics ? telematics.isLocked : false;
  const isEngineOn = telematics ? telematics.isEngineOn : true;
  const batteryPct = Math.round(telematics?.batteryLevelPct || 94);
  const currentSpeed = Math.round(telematics?.speedKmh || 35);
  const rangeRemainingKm = Math.round((vehicle.rangeKm || 450) * (batteryPct / 100));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Dignified Vehicle Identity & Contract Header */}
      <View style={styles.headerBlock}>
        {/* Top Status & Contract Badge Row */}
        <View style={styles.headerTopRow}>
          <View style={styles.liveConnectionPill}>
            <View style={styles.greenPulseDot} />
            <Text style={styles.liveConnectionText}>BLE 5.2 • TRỰC TUYẾN</Text>
          </View>
          <View style={styles.contractBadgePill}>
            <Ionicons name="document-text-outline" size={11} color="#6F4E37" />
            <Text style={styles.contractBadgeText} numberOfLines={1}>
              {activeTrip.contractNumber || 'HD-ECOGO-2026-9812'}
            </Text>
          </View>
        </View>

        {/* Vehicle Name and Plate Row */}
        <View style={styles.vehicleNameRow}>
          <Text style={styles.vehicleTitle} numberOfLines={1}>{vehicle.name}</Text>
          <View style={styles.plateCapsule}>
            <Text style={styles.plateCapsuleText}>{vehicle.plateNumber || '51K-554.12'}</Text>
          </View>
        </View>

        {/* Meta summary status */}
        <View style={styles.subMetaRow}>
          <View style={styles.metaStatusChip}>
            <Ionicons
              name={isLocked ? 'lock-closed' : 'lock-open'}
              size={12}
              color={isLocked ? '#8C7A6B' : '#2D8A4E'}
            />
            <Text style={[styles.metaStatusText, !isLocked && { color: '#2D8A4E', fontWeight: '800' }]}>
              {isLocked ? 'Cửa đang khóa' : 'Cửa đã mở khóa'}
            </Text>
          </View>
          <Text style={styles.metaDotDivider}>•</Text>
          <View style={styles.metaStatusChip}>
            <Ionicons name="flash" size={12} color="#D4AF37" />
            <Text style={styles.metaStatusText}>Pin {batteryPct}% ({rangeRemainingKm} km)</Text>
          </View>
        </View>
      </View>

      {/* 2. Showroom Vehicle Showcase Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: vehicle.thumbnail }}
            style={styles.vehPhoto}
            resizeMode="cover"
          />
          {/* Floating Luxury Status Indicator */}
          <View style={styles.floatingSignalBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#D4AF37" />
            <Text style={styles.floatingSignalText} numberOfLines={1}>
              {statusToast}
            </Text>
          </View>
        </View>

        {/* 4-Pod Automotive Instrument Telemetry Grid */}
        <View style={styles.metricsGrid}>
          {/* Gauge 1: Battery SoC */}
          <View style={styles.metricPod}>
            <View style={styles.podIconBadge}>
              <Ionicons name="battery-charging" size={14} color="#2D8A4E" />
            </View>
            <Text style={styles.metricVal}>{batteryPct}%</Text>
            <Text style={styles.metricLbl}>Dung lượng pin</Text>
          </View>

          <View style={styles.podVerticalDivider} />

          {/* Gauge 2: Remaining Range */}
          <View style={styles.metricPod}>
            <View style={styles.podIconBadge}>
              <Ionicons name="navigate" size={14} color="#6F4E37" />
            </View>
            <Text style={styles.metricVal}>{rangeRemainingKm} km</Text>
            <Text style={styles.metricLbl}>Quãng đường</Text>
          </View>

          <View style={styles.podVerticalDivider} />

          {/* Gauge 3: Live Velocity */}
          <View style={styles.metricPod}>
            <View style={styles.podIconBadge}>
              <Ionicons name="speedometer" size={14} color="#6F4E37" />
            </View>
            <Text style={styles.metricVal}>{currentSpeed} km/h</Text>
            <Text style={styles.metricLbl}>Vận tốc live</Text>
          </View>

          <View style={styles.podVerticalDivider} />

          {/* Gauge 4: Cabin Climate */}
          <View style={styles.metricPod}>
            <View style={styles.podIconBadge}>
              <Ionicons name="thermometer" size={14} color="#0284C7" />
            </View>
            <Text style={styles.metricVal}>22°C</Text>
            <Text style={styles.metricLbl}>Nhiệt độ cabin</Text>
          </View>
        </View>
      </View>

      {/* 3. Automotive Remote Controls Card */}
      <View style={styles.controlsCard}>
        <View style={styles.controlsHeaderRow}>
          <Text style={styles.cardSectionTitle}>Điều khiển phương tiện thông minh</Text>
          <View style={styles.securitySealBadge}>
            <Ionicons name="finger-print-outline" size={12} color="#6F4E37" />
            <Text style={styles.securitySealText}>Xác thực mã hóa</Text>
          </View>
        </View>

        {/* Master Primary Controls (Lock / Engine) */}
        <View style={styles.primaryActionsRow}>
          {/* Master 1: Door Lock / Unlock */}
          <TouchableOpacity
            style={[
              styles.primaryActionBtn,
              !isLocked ? styles.lockBtnUnlocked : styles.lockBtnLocked
            ]}
            disabled={commandLoading}
            onPress={() => handleControl(isLocked ? 'UNLOCK' : 'LOCK')}
            activeOpacity={0.88}
          >
            <View style={styles.primaryIconWrapper}>
              <Ionicons
                name={isLocked ? 'lock-closed' : 'lock-open'}
                size={22}
                color={!isLocked ? '#D4AF37' : '#6F4E37'}
              />
            </View>
            <View style={styles.primaryTextCol}>
              <Text style={[styles.primaryActionTitle, !isLocked && styles.primaryActionTitleLight]}>
                {isLocked ? 'Khóa Cửa Xe' : 'Cửa Xe: Đã Mở'}
              </Text>
              <Text style={[styles.primaryActionSub, !isLocked && styles.primaryActionSubLight]}>
                {isLocked ? 'Chạm để mở khóa BLE' : 'Chạm để khóa an toàn'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Master 2: Engine Start / Stop */}
          <TouchableOpacity
            style={[
              styles.primaryActionBtn,
              isEngineOn ? styles.engineBtnOn : styles.engineBtnOff
            ]}
            disabled={commandLoading}
            onPress={() => handleControl(isEngineOn ? 'ENGINE_STOP' : 'ENGINE_START')}
            activeOpacity={0.88}
          >
            <View style={styles.primaryIconWrapper}>
              <Ionicons
                name="power"
                size={22}
                color={isEngineOn ? '#2D8A4E' : '#6F4E37'}
              />
            </View>
            <View style={styles.primaryTextCol}>
              <Text style={[styles.primaryActionTitle, isEngineOn && styles.primaryActionTitleLight]}>
                {isEngineOn ? 'Động Cơ: Bật' : 'Khởi Động Xe'}
              </Text>
              <Text style={[styles.primaryActionSub, isEngineOn && styles.primaryActionSubLight]}>
                {isEngineOn ? 'Sẵn sàng lăn bánh' : 'Khởi động máy nổ'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 4 Secondary Quick Micro-Controls */}
        <View style={styles.secondaryGrid}>
          {/* Quick 1: Trunk */}
          <TouchableOpacity
            style={[
              styles.secBtn,
              activeQuickCommand === 'TRUNK_OPEN' && styles.secBtnActive
            ]}
            onPress={() => handleControl('TRUNK_OPEN')}
            activeOpacity={0.85}
          >
            <View style={styles.secIconCircle}>
              <Ionicons name="car-sport" size={18} color="#6F4E37" />
            </View>
            <Text style={styles.secBtnLabel}>Mở cốp</Text>
            <Text style={styles.secBtnMicro}>Điện tự động</Text>
          </TouchableOpacity>

          {/* Quick 2: Pre-cool AC */}
          <TouchableOpacity
            style={[
              styles.secBtn,
              activeQuickCommand === 'AC_PRECOOL' && styles.secBtnActive
            ]}
            onPress={() => handleControl('AC_PRECOOL')}
            activeOpacity={0.85}
          >
            <View style={styles.secIconCircle}>
              <Ionicons name="snow" size={18} color="#0284C7" />
            </View>
            <Text style={styles.secBtnLabel}>Làm mát</Text>
            <Text style={styles.secBtnMicro}>22°C Eco</Text>
          </TouchableOpacity>

          {/* Quick 3: Flash Headlights */}
          <TouchableOpacity
            style={[
              styles.secBtn,
              activeQuickCommand === 'FLASH_LIGHTS' && styles.secBtnActive
            ]}
            onPress={() => handleControl('FLASH_LIGHTS')}
            activeOpacity={0.85}
          >
            <View style={styles.secIconCircle}>
              <Ionicons name="flash" size={18} color="#D4AF37" />
            </View>
            <Text style={styles.secBtnLabel}>Nháy đèn</Text>
            <Text style={styles.secBtnMicro}>Tìm xe bãi</Text>
          </TouchableOpacity>

          {/* Quick 4: Horn / Locate */}
          <TouchableOpacity
            style={[
              styles.secBtn,
              activeQuickCommand === 'HORN' && styles.secBtnActive
            ]}
            onPress={() => handleControl('HORN')}
            activeOpacity={0.85}
          >
            <View style={styles.secIconCircle}>
              <Ionicons name="volume-high" size={18} color="#6F4E37" />
            </View>
            <Text style={styles.secBtnLabel}>Còi xe</Text>
            <Text style={styles.secBtnMicro}>Bíp định vị</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. ITS GLOSA Green Wave Telematics Advisory Card */}
      {glosa && (
        <View style={styles.glosaCard}>
          <View style={styles.glosaTopRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={styles.glosaHeaderGroup}>
                <Ionicons name="speedometer-outline" size={15} color="#6F4E37" />
                <Text style={styles.glosaTitle}>Làn sóng xanh thông minh (GLOSA)</Text>
              </View>
              <Text style={styles.glosaSub}>Hành lang Điện Biên Phủ – Ngã tư Hàng Xanh</Text>
            </View>

            <View style={styles.glosaSignalBadge}>
              <View style={styles.liveGreenDot} />
              <Text style={styles.glosaSignalText}>
                Đèn xanh {glosa.secondsToSignalChange || 28}s
              </Text>
            </View>
          </View>

          <View style={styles.glosaSpeedBox}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.glosaSpeedLabel}>Vận tốc tối ưu qua nút giao không dừng</Text>
              <Text style={styles.glosaAdviceMsg}>
                {glosa.advisoryMessage || 'Duy trì tốc độ 42 km/h để vượt qua nút giao tiếp theo khi đèn xanh'}
              </Text>
            </View>
            <View style={styles.speedCapsule}>
              <Text style={styles.glosaSpeedValue}>{glosa.recommendedSpeedKmh || 42}</Text>
              <Text style={styles.glosaSpeedUnit}>km/h</Text>
            </View>
          </View>
        </View>
      )}

      {/* 5. CO2 Green Footprint Impact Widget */}
      <CO2Widget eco={eco} accentColor="#6F4E37" softBg="#F5EFEB" />

      {/* 6. End Rental & Return Vehicle CTA or Cancel Booking */}
      <View style={styles.actionButtonGroup}>
        <TouchableOpacity
          style={styles.returnBtn}
          activeOpacity={0.88}
          onPress={handleCompleteTrip}
        >
          <Ionicons name="checkmark-done-circle" size={18} color="#D4AF37" />
          <Text style={styles.returnBtnText}>Kết thúc chuyến & Trả xe tại trạm UTH</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBookingBtn}
          activeOpacity={0.85}
          onPress={() => setShowCancelModal(true)}
        >
          <Ionicons name="close-circle-outline" size={17} color="#6F4E37" />
          <Text style={styles.cancelBookingBtnText}>Hủy Đặt Xe & Yêu Cầu Hoàn Tiền (100% Cọc)</Text>
        </TouchableOpacity>
      </View>

      {/* Safety Spacing for Bottom Tab Bar */}
      <View style={{ height: 130 }} />

      {/* Modal Cancel Trip & Auto Refund */}
      <CancelTripModal
        visible={showCancelModal}
        trip={activeTrip}
        vehicle={vehicle}
        onClose={() => setShowCancelModal(false)}
        onCancelSuccess={() => {
          setShowCancelModal(false);
          loadActiveTrip();
          if (onNavigateHome) onNavigateHome();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FAF7F2'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#6F4E37'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#FAF7F2'
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#D4AF37'
  },
  emptyTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#2B180D',
    textAlign: 'center',
    letterSpacing: -0.2
  },
  emptyDesc: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#8C7A6B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 16
  },
  goHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E3322',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  goHomeBtnText: {
    fontFamily: FONTS.family,
    color: '#FAF7F2',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6
  },

  /* Header Identity Block */
  headerBlock: {
    marginBottom: 12
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  liveConnectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2D8A4E',
    marginRight: 5
  },
  liveConnectionText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#2D8A4E',
    letterSpacing: 0.4
  },
  contractBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  contractBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#6F4E37',
    marginLeft: 4,
    maxWidth: 160
  },
  vehicleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2
  },
  vehicleTitle: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '800',
    color: '#2B180D',
    marginRight: 8,
    letterSpacing: -0.2
  },
  plateCapsule: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D4AF37'
  },
  plateCapsuleText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D',
    letterSpacing: 0.6
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  metaStatusChip: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metaStatusText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F4E37',
    fontWeight: '600',
    marginLeft: 4
  },
  metaDotDivider: {
    fontSize: 11,
    color: '#C4B5A5',
    marginHorizontal: 8
  },

  /* Showcase Hero Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    marginBottom: 12,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F5EFEB',
    position: 'relative'
  },
  vehPhoto: {
    width: '100%',
    height: '100%'
  },
  floatingSignalBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 24, 13, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14
  },
  floatingSignalText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#FAF7F2',
    marginLeft: 6,
    flex: 1
  },

  /* 4-Pod Telemetry Gauges */
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: '#FAF7F2'
  },
  metricPod: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4
  },
  podIconBadge: {
    marginBottom: 3
  },
  podVerticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EBE3D7'
  },
  metricVal: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#2B180D',
    letterSpacing: -0.1
  },
  metricLbl: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    color: '#8C7A6B',
    marginTop: 2
  },

  /* Automotive Remote Controls Card */
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    marginBottom: 12,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2
  },
  controlsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  cardSectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#2B180D'
  },
  securitySealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8
  },
  securitySealText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6F4E37',
    marginLeft: 3,
    letterSpacing: 0.4
  },
  primaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginHorizontal: 3
  },
  lockBtnUnlocked: {
    backgroundColor: '#2B180D'
  },
  lockBtnLocked: {
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  engineBtnOn: {
    backgroundColor: '#4E3322'
  },
  engineBtnOff: {
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  primaryIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  primaryTextCol: {
    flex: 1
  },
  primaryActionTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2B180D'
  },
  primaryActionTitleLight: {
    color: '#FAF7F2'
  },
  primaryActionSub: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    color: '#8C7A6B',
    marginTop: 1
  },
  primaryActionSubLight: {
    color: '#D4AF37'
  },

  /* 4 Secondary Quick Micro-Controls */
  secondaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  secBtn: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  secBtnActive: {
    backgroundColor: '#F5EFEB',
    borderColor: '#D4AF37'
  },
  secIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  secBtnLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#2B180D'
  },
  secBtnMicro: {
    fontFamily: FONTS.family,
    fontSize: 9,
    color: '#8C7A6B',
    marginTop: 1
  },

  /* ITS GLOSA Smart Wave Card */
  glosaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    marginBottom: 10,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2
  },
  glosaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  glosaHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  glosaTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2B180D',
    marginLeft: 6
  },
  glosaSub: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#8C7A6B',
    marginTop: 2
  },
  glosaSignalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2D8A4E',
    marginRight: 5
  },
  glosaSignalText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#2D8A4E'
  },
  glosaSpeedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  glosaSpeedLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D'
  },
  glosaAdviceMsg: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#6F4E37',
    marginTop: 2,
    lineHeight: 14.5
  },
  speedCapsule: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  glosaSpeedValue: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '800',
    color: '#2B180D'
  },
  glosaSpeedUnit: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '700',
    color: '#8C7A6B'
  },

  /* Action Button Group (Return & Cancel) */
  actionButtonGroup: {
    marginTop: 10
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4E3322',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  returnBtnText: {
    fontFamily: FONTS.family,
    color: '#FAF7F2',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.2
  },
  cancelBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EFEB',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  cancelBookingBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37',
    marginLeft: 6,
    letterSpacing: 0.2
  }
});
