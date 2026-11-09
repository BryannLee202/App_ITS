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
import { COLORS } from '../styles/theme';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';
import { initSocket } from '../services/socket';

export default function DigitalKeyScreen() {
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Chìa khóa số kết nối BLE 5.2 & Cloud an toàn.');

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
    advisoryMessage: 'Duy trì 45 km/h đón làn sóng xanh GLOSA',
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
        <Text style={styles.loadingText}>Đang đồng bộ khóa số 3D Digital Key...</Text>
      </View>
    );
  }

  if (!activeTrip) {
    return (
      <View style={styles.noTripContainer}>
        <View style={styles.noTripCircle}>
          <Ionicons name="key" size={40} color="#DF8268" />
        </View>
        <Text style={styles.noTripTitle}>Chưa có phương tiện đang mở khóa</Text>
        <Text style={styles.noTripSub}>
          Chọn một chiếc xe từ trang Khám phá để kích hoạt bảng điều khiển xúc giác 3D Digital Key.
        </Text>
        <TouchableOpacity style={styles.reloadBtn} onPress={loadActiveTrip}>
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.reloadBtnText}>Kiểm tra lại hợp đồng</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const veh = activeTrip.vehicle || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* =========================================================
          1. TOP VEHICLE STATUS CARD (SOFT IVORY & SLATE WAVE)
      ========================================================= */}
      <View style={styles.topHeaderCard}>
        <View style={styles.headerWaveAccent} />
        <View style={styles.topRow}>
          <View>
            <View style={styles.bleRow}>
              <View style={styles.amberDot} />
              <Text style={styles.bleTagText}>DIGITAL KEY 3D • {activeTrip.contractNumber}</Text>
            </View>
            <Text style={styles.vehTitle}>{veh.name || 'VinFast VF 8 Plus'}</Text>
            <Text style={styles.plateSub}>Biển số: {veh.plateNumber || '51K-882.91'}</Text>
          </View>
          <View style={styles.lockStatePill}>
            <View
              style={[
                styles.stateDot,
                { backgroundColor: telematics.isLocked ? '#DF8268' : '#6E92B5' }
              ]}
            />
            <Text style={styles.lockStateText}>
              {telematics.isLocked ? 'ĐÃ KHÓA' : 'ĐANG MỞ'}
            </Text>
          </View>
        </View>

        <View style={styles.statusToastPill}>
          <Ionicons name="radio-outline" size={14} color="#6E92B5" />
          <Text style={styles.statusToastText} numberOfLines={1}>
            {statusMessage}
          </Text>
        </View>
      </View>

      {/* =========================================================
          2. DUAL VERTICAL TACTILE REMOTE STRIPS + GLOSA CONSOLE
             (MATCHES MIDDLE-LEFT VERTICAL REMOTES IN REF IMAGE)
      ========================================================= */}
      <View style={styles.tactileCockpitGrid}>
        {/* Left Vertical Remote Strip (Warm Peach with 3D Rotary Knob) */}
        <View style={styles.verticalRemotePeach}>
          <View style={styles.remoteTopDots}>
            <View style={styles.amberSphereSmall} />
            <View style={styles.whiteMiniDot} />
          </View>

          {/* Large 3D Rippled Tactile Rotary Knob (Engine Start/Stop) */}
          <TouchableOpacity
            style={styles.rotaryDialOuter}
            activeOpacity={0.85}
            disabled={actionLoading}
            onPress={() =>
              handleControlCommand(telematics.isEngineOn ? 'STOP_ENGINE' : 'START_ENGINE')
            }
          >
            <View style={styles.rotaryDialMiddle}>
              <View style={styles.rotaryDialInner}>
                <Ionicons
                  name="power"
                  size={22}
                  color={telematics.isEngineOn ? '#6E92B5' : '#FFFFFF'}
                />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.rotaryLabel}>
            {telematics.isEngineOn ? 'ĐANG NỔ MÁY' : 'KHỞI ĐỘNG'}
          </Text>

          {/* 4 Soft Raised Tactile Micro Buttons at Bottom */}
          <View style={styles.fourMicroGrid}>
            <TouchableOpacity
              style={styles.microTactileSquare}
              onPress={() => handleControlCommand('LOCK')}
            >
              <Ionicons name="lock-closed" size={15} color="#7A5448" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.microTactileSquare}
              onPress={() => handleControlCommand('UNLOCK')}
            >
              <Ionicons name="lock-open" size={15} color="#6E92B5" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.microTactileSquare}
              onPress={() => handleControlCommand('HORN')}
            >
              <Ionicons name="volume-high" size={15} color="#DF8268" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.microTactileSquare}
              onPress={() => handleControlCommand('TRUNK')}
            >
              <Ionicons name="car" size={15} color="#7A5448" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Middle Slim Vertical Tactile Strip (Crescent Switches & Sphere Knob) */}
        <View style={styles.verticalRemoteSlim}>
          <View style={styles.slimTopSection}>
            <View style={styles.crescentSwitch}>
              <Ionicons name="snow-outline" size={13} color="#6E92B5" />
            </View>
            <View style={styles.crescentSwitch}>
              <Ionicons name="sunny-outline" size={13} color="#DF8268" />
            </View>
          </View>

          <View style={styles.slimWaveDivider} />

          <View style={styles.slimBottomTerracotta}>
            <Text style={styles.slimTempText}>22°C</Text>
            <TouchableOpacity
              style={styles.slimBottomWhiteSphere}
              onPress={() => handleControlCommand('UNLOCK')}
            >
              <Ionicons name="bluetooth" size={14} color="#DF8268" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Telemetry & GLOSA Bento Card (Matches Bottom-Right Soft Card) */}
        <View style={styles.rightGlosaCard}>
          <View style={styles.glosaTopRow}>
            <View style={styles.amberDot} />
            <Text style={styles.glosaHeaderTitle}>GLOSA GREEN WAVE</Text>
          </View>

          {/* Speed Comparison Dials */}
          <View style={styles.speedDialsRow}>
            <View style={styles.speedPillBox}>
              <Text style={styles.speedNum}>{Math.round(telematics.speedKmh || 42)}</Text>
              <Text style={styles.speedUnit}>km/h hiện tại</Text>
            </View>
            <View style={[styles.speedPillBox, styles.speedPillRecommended]}>
              <Text style={[styles.speedNum, { color: '#6E92B5' }]}>
                {glosa.recommendedSpeedKmh || 45}
              </Text>
              <Text style={styles.speedUnit}>km/h xanh</Text>
            </View>
          </View>

          <Text style={styles.glosaAdviceText}>{glosa.advisoryMessage}</Text>

          {/* 4 Tactile Command Capsules */}
          <View style={styles.fourCommandCapsules}>
            <TouchableOpacity
              style={[
                styles.cmdCapsule,
                !telematics.isLocked && styles.cmdCapsuleActiveBlue
              ]}
              onPress={() => handleControlCommand('UNLOCK')}
            >
              <Ionicons
                name="lock-open-outline"
                size={15}
                color={!telematics.isLocked ? '#FFFFFF' : '#2C221E'}
              />
              <Text
                style={[
                  styles.cmdCapsuleText,
                  !telematics.isLocked && { color: '#FFFFFF' }
                ]}
              >
                Mở khóa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cmdCapsule,
                telematics.isLocked && styles.cmdCapsuleActiveCoral
              ]}
              onPress={() => handleControlCommand('LOCK')}
            >
              <Ionicons
                name="lock-closed-outline"
                size={15}
                color={telematics.isLocked ? '#FFFFFF' : '#2C221E'}
              />
              <Text
                style={[
                  styles.cmdCapsuleText,
                  telematics.isLocked && { color: '#FFFFFF' }
                ]}
              >
                Khóa xe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cmdCapsule}
              onPress={() => handleControlCommand('HORN')}
            >
              <Ionicons name="notifications-outline" size={15} color="#DF8268" />
              <Text style={styles.cmdCapsuleText}>Tìm xe</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cmdCapsule}
              onPress={() => handleControlCommand('TRUNK')}
            >
              <Ionicons name="briefcase-outline" size={15} color="#6E92B5" />
              <Text style={styles.cmdCapsuleText}>Mở cốp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* =========================================================
          3. ECO IMPACT & GEOFENCED RETURN BUTTON
      ========================================================= */}
      <View style={styles.bottomSection}>
        <CO2Widget eco={eco} />

        <TouchableOpacity
          style={styles.returnVehicleBtn}
          activeOpacity={0.88}
          onPress={handleReturnVehicle}
        >
          <Text style={styles.returnVehicleText}>KẾT THÚC CHUYẾN & TRẢ XE TẠI HUB</Text>
          <View style={styles.returnKnobWhite}>
            <Ionicons name="checkmark" size={16} color="#DF8268" />
          </View>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 110
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6
  },
  noTripTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2C221E',
    marginBottom: 8
  },
  noTripSub: {
    fontSize: 12,
    color: '#7A6A63',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '600'
  },
  reloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DF8268',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    gap: 8
  },
  reloadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },

  /* 1. Top Header Card */
  topHeaderCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 26,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
    marginBottom: 16
  },
  headerWaveAccent: {
    position: 'absolute',
    right: -30,
    bottom: -35,
    width: 150,
    height: 90,
    borderRadius: 60,
    backgroundColor: '#EBF2F8'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  bleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  amberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F2C97D'
  },
  bleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A6A63',
    letterSpacing: 0.6
  },
  vehTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2C221E'
  },
  plateSub: {
    fontSize: 11,
    color: '#8C7A70',
    fontWeight: '700',
    marginTop: 2
  },
  lockStatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F0E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  lockStateText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2C221E'
  },
  statusToastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F0E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 14,
    gap: 8
  },
  statusToastText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C4B43',
    flex: 1
  },

  /* 2. Tactile Cockpit Grid (Vertical Remotes + Right Card) */
  tactileCockpitGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  verticalRemotePeach: {
    width: 104,
    backgroundColor: '#F7D3C2',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#FDFBF7',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 5
  },
  remoteTopDots: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  amberSphereSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F2C97D'
  },
  whiteMiniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FDFBF7'
  },
  rotaryDialOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E89D82',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#7A422E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6
  },
  rotaryDialMiddle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DF8268',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F7D3C2'
  },
  rotaryDialInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4
  },
  rotaryLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#5C3A2E',
    marginBottom: 8,
    textAlign: 'center'
  },
  fourMicroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 6,
    width: '100%'
  },
  microTactileSquare: {
    width: 36,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 2
  },

  /* Middle Slim Strip */
  verticalRemoteSlim: {
    width: 54,
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5
  },
  slimTopSection: {
    paddingVertical: 12,
    alignItems: 'center',
    gap: 10
  },
  crescentSwitch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F6F0E8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 4
  },
  slimWaveDivider: {
    height: 22,
    backgroundColor: '#D6E2EE',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  },
  slimBottomTerracotta: {
    flex: 1,
    backgroundColor: '#E59B82',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10
  },
  slimTempText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FDFBF7'
  },
  slimBottomWhiteSphere: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },

  /* Right GLOSA & Command Card */
  rightGlosaCard: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5
  },
  glosaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  glosaHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#7A6A63',
    letterSpacing: 0.5
  },
  speedDialsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8
  },
  speedPillBox: {
    flex: 1,
    backgroundColor: '#F6F0E8',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  speedPillRecommended: {
    backgroundColor: '#EBF2F8'
  },
  speedNum: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2C221E'
  },
  speedUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7A6A63',
    marginTop: 2
  },
  glosaAdviceText: {
    fontSize: 11,
    color: '#5C4B43',
    fontWeight: '700',
    lineHeight: 15,
    marginBottom: 10
  },
  fourCommandCapsules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8
  },
  cmdCapsule: {
    width: '48%',
    backgroundColor: '#F6F0E8',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  cmdCapsuleActiveBlue: {
    backgroundColor: '#6E92B5',
    borderColor: '#94B4D1'
  },
  cmdCapsuleActiveCoral: {
    backgroundColor: '#DF8268',
    borderColor: '#F5BFA9'
  },
  cmdCapsuleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2C221E'
  },

  /* 3. Bottom Section */
  bottomSection: {
    marginTop: 4
  },
  returnVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DF8268',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 26,
    marginTop: 14,
    shadowColor: '#DF8268',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
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
