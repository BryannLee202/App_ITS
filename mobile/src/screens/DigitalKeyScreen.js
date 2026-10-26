import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import GreenWaveBadge from '../components/GreenWaveBadge';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';
import { initSocket } from '../services/socket';

export default function DigitalKeyScreen() {
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Chìa khóa số kết nối BLE & Cloud an toàn.');

  // Live telematics
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
    advisoryMessage: 'Duy trì tốc độ 45 km/h để đón trọn làn sóng xanh',
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

    // Connect to WebSocket telematics stream
    const cleanup = initSocket(
      (telemetryData) => {
        if (telemetryData.telematics) {
          setTelematics(prev => ({ ...prev, ...telemetryData.telematics }));
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
          setTelematics(prev => ({ ...prev, ...ackData.telematics }));
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
        setTelematics(prev => ({ ...prev, ...res.telematics }));
      }
    } catch (err) {
      Alert.alert('Lỗi lệnh điều khiển', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnVehicle = () => {
    if (!activeTrip) return;

    Alert.alert(
      'Xác Nhận Trả Xe Tại Trạm',
      'Hệ thống ITS sẽ kiểm tra Geofencing (bán kính <= 150m từ trạm) và khóa xe tự động.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác Nhận Trả Xe',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await ApiService.completeTrip(activeTrip.id, activeTrip.returnStationId);
              Alert.alert('🎉 Trả Xe Thành Công!', res.message);
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
        <Text style={styles.loadingText}>Đang đồng bộ khóa số Digital Key...</Text>
      </View>
    );
  }

  if (!activeTrip) {
    return (
      <View style={styles.noTripContainer}>
        <View style={styles.noTripCircle}>
          <Ionicons name="key-outline" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.noTripTitle}>Chưa có xe đang thuê</Text>
        <Text style={styles.noTripSub}>
          Chọn phương tiện yêu thích từ trang Khám phá để kích hoạt Chìa khóa số thông minh (Digital Key).
        </Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={loadActiveTrip}
        >
          <Text style={styles.exploreBtnText}>Làm mới trạng thái</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vehicle = activeTrip.vehicle || { name: 'VinFast VF 8 Plus', plateNumber: '51K-882.91' };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cockpit Header */}
      <View style={styles.cockpitHeader}>
        <View>
          <Text style={styles.cockpitSubtitle}>TRUNG TÂM ĐIỀU KHIỂN SỐ (DIGITAL KEY)</Text>
          <Text style={styles.cockpitTitle}>{vehicle.name}</Text>
          <View style={styles.plateTag}>
            <Text style={styles.plateText}>{vehicle.plateNumber}</Text>
          </View>
        </View>
        <View style={styles.bleIndicator}>
          <Ionicons name="bluetooth" size={16} color={COLORS.secondary} />
          <Text style={styles.bleText}>BLE Đã kết nối</Text>
        </View>
      </View>

      {/* Vehicle Status Cockpit Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusCol}>
            <Text style={styles.statusLabel}>Trạng thái khóa</Text>
            <View style={styles.statusValRow}>
              <Ionicons
                name={telematics.isLocked ? "lock-closed" : "lock-open"}
                size={16}
                color={telematics.isLocked ? COLORS.warning : COLORS.success}
              />
              <Text style={[styles.statusValText, { color: telematics.isLocked ? COLORS.warning : COLORS.success }]}>
                {telematics.isLocked ? 'ĐÃ KHÓA' : 'ĐÃ MỞ KHÓA'}
              </Text>
            </View>
          </View>

          <View style={styles.statusCol}>
            <Text style={styles.statusLabel}>Động cơ</Text>
            <View style={styles.statusValRow}>
              <Ionicons
                name="power"
                size={16}
                color={telematics.isEngineOn ? COLORS.success : COLORS.textMuted}
              />
              <Text style={[styles.statusValText, { color: telematics.isEngineOn ? COLORS.success : COLORS.textMuted }]}>
                {telematics.isEngineOn ? 'ĐANG CHẠY' : 'ĐÃ TẮT'}
              </Text>
            </View>
          </View>

          <View style={styles.statusCol}>
            <Text style={styles.statusLabel}>Mức Pin EV</Text>
            <View style={styles.statusValRow}>
              <Ionicons name="battery-charging" size={16} color={COLORS.secondary} />
              <Text style={[styles.statusValText, { color: COLORS.secondary }]}>
                {Math.round(telematics.batteryLevelPct)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Status Notification Banner */}
        <View style={styles.alertBanner}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.primaryLight} />
          <Text style={styles.alertBannerText}>{statusMessage}</Text>
        </View>
      </View>

      {/* 4 Big Circular Remote Controls (BonbonCar style) */}
      <Text style={styles.sectionHeader}>THAO TÁC TỪ XA QUA IOT / BLE</Text>
      <View style={styles.controlsGrid}>
        {/* Unlock Button */}
        <TouchableOpacity
          style={[styles.controlCircleBtn, !telematics.isLocked && styles.btnActive]}
          activeOpacity={0.8}
          onPress={() => handleControlCommand('UNLOCK')}
          disabled={actionLoading}
        >
          <Ionicons name="lock-open-outline" size={28} color="#FFFFFF" />
          <Text style={styles.controlBtnLabel}>MỞ KHÓA</Text>
        </TouchableOpacity>

        {/* Lock Button */}
        <TouchableOpacity
          style={[styles.controlCircleBtn, telematics.isLocked && styles.btnActiveWarning]}
          activeOpacity={0.8}
          onPress={() => handleControlCommand('LOCK')}
          disabled={actionLoading}
        >
          <Ionicons name="lock-closed-outline" size={28} color="#FFFFFF" />
          <Text style={styles.controlBtnLabel}>KHÓA CỬA</Text>
        </TouchableOpacity>

        {/* Horn / Hazard Button */}
        <TouchableOpacity
          style={styles.controlCircleBtn}
          activeOpacity={0.8}
          onPress={() => handleControlCommand('HORN')}
          disabled={actionLoading}
        >
          <Ionicons name="volume-high-outline" size={28} color="#FFFFFF" />
          <Text style={styles.controlBtnLabel}>CÒI / NHÁY ĐÈN</Text>
        </TouchableOpacity>

        {/* Engine Start/Stop Button */}
        <TouchableOpacity
          style={[styles.controlCircleBtn, telematics.isEngineOn && styles.btnEngineOn]}
          activeOpacity={0.8}
          onPress={() => handleControlCommand(telematics.isEngineOn ? 'ENGINE_STOP' : 'ENGINE_START')}
          disabled={actionLoading}
        >
          <Ionicons name="power-outline" size={28} color="#FFFFFF" />
          <Text style={styles.controlBtnLabel}>
            {telematics.isEngineOn ? 'TẮT MÁY' : 'KHỞI ĐỘNG'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ITS Green Wave Live Advisory */}
      <GreenWaveBadge glosa={glosa} />

      {/* Environmental & Carbon Metrics */}
      <CO2Widget eco={eco} />

      {/* End Trip / Return Button with Geofencing */}
      <TouchableOpacity
        style={styles.returnBtn}
        activeOpacity={0.85}
        onPress={handleReturnVehicle}
        disabled={actionLoading}
      >
        <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
        <Text style={styles.returnBtnText}>KẾT THÚC CHUYẾN & TRẢ XE TẠI TRẠM</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cockpitBg
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 90
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.cockpitBg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: SPACING.md,
    fontSize: 13
  },
  noTripContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl
  },
  noTripCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg
  },
  noTripTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  noTripSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.xl
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 12,
    borderRadius: RADIUS.md
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  cockpitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg
  },
  cockpitSubtitle: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  cockpitTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2
  },
  plateTag: {
    backgroundColor: COLORS.cockpitCard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.cockpitBorder
  },
  plateText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  bleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4
  },
  bleText: {
    color: COLORS.secondaryLight,
    fontSize: 10,
    fontWeight: '700'
  },
  statusCard: {
    backgroundColor: COLORS.cockpitCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cockpitBorder,
    marginBottom: SPACING.lg
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statusCol: {
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4
  },
  statusValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statusValText: {
    fontSize: 12,
    fontWeight: '800'
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 53, 177, 0.15)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginTop: SPACING.md,
    gap: 6
  },
  alertBannerText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '500',
    flex: 1
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: SPACING.md
  },
  controlsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg
  },
  controlCircleBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.cockpitCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.cockpitBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  btnActive: {
    backgroundColor: COLORS.secondaryDark,
    borderColor: COLORS.secondaryLight
  },
  btnActiveWarning: {
    backgroundColor: '#B45309',
    borderColor: COLORS.warning
  },
  btnEngineOn: {
    backgroundColor: '#047857',
    borderColor: '#34D399'
  },
  controlBtnLabel: {
    color: '#CBD5E1',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center'
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    gap: 8
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});
