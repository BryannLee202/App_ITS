import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';

export default function HomeScreen({ onNavigateToKey }) {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Booking Modal State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [durationHours, setDurationHours] = useState(3);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getVehicles();
      setVehicles(res.vehicles || []);
    } catch (err) {
      console.warn('Error loading vehicles:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDurationHours(3);
    setModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedVehicle) return;
    try {
      setBookingLoading(true);
      const res = await ApiService.bookVehicle({
        vehicleId: selectedVehicle.id,
        rentalType: 'HOURLY',
        durationHours,
        pickupStationId: selectedVehicle.stationId || 'hub-uth-01'
      });

      setModalVisible(false);
      Alert.alert(
        'Đặt Xe Thành Công',
        `Hợp đồng điện tử ${res.trip.contractNumber} đã kích hoạt.\nChìa khóa số 3D Digital Key đã sẵn sàng.`,
        [
          {
            text: 'Mở Buồng Lái Ngay',
            onPress: () => {
              if (onNavigateToKey) onNavigateToKey();
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('Thông báo', err.message || 'Không thể tạo hợp đồng');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedFilter === 'CAR') return v.category === 'CAR';
    if (selectedFilter === 'MOTORBIKE') return v.category === 'MOTORBIKE';
    return (
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================================================
            1. LAYERED WAVE HERO CARD & 3D PILL SEARCH (CENTER IMAGE REF)
        ========================================================= */}
        <View style={styles.waveHeroCard}>
          {/* Decorative Soft Wave Layers at Bottom of Hero Card */}
          <View style={styles.waveBackLayer} />
          <View style={styles.waveFrontLayer} />
          <View style={styles.waveFloatingSphereWhite} />
          <View style={styles.waveFloatingCupPeach} />

          {/* Top Micro Header Row */}
          <View style={styles.waveCardTopRow}>
            <View style={styles.microBrandRow}>
              <View style={styles.amberDot} />
              <Text style={styles.microBrandText}>ITS SMART MOBILITY</Text>
            </View>
            <View style={styles.microStatusRow}>
              <View style={styles.peachTinyDot} />
              <Text style={styles.microLocationText}>UTH • TP.HCM</Text>
            </View>
          </View>

          {/* Extruded 3D Tactile Search Pill */}
          <View style={styles.tactileSearchPill}>
            <TextInput
              placeholder="Bạn muốn đi đâu, thuê xe gì?"
              placeholderTextColor="#A6968E"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={16} color="#A6968E" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.searchSkyBlueKnob}>
              <Ionicons name="search" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Center Minimalist Title Over Waves */}
          <View style={styles.waveCenterTitleWrap}>
            <Text style={styles.waveCenterCode}>SOOT • EV MOBILITY</Text>
            <Text style={styles.waveCenterSub}>Chạm mở khóa 24/7 • Không thế chấp cọc</Text>
          </View>
        </View>

        {/* =========================================================
            2. BENTO ROW: CONCENTRIC DIAL CARD + SPLIT PEACH/IVORY CARD
        ========================================================= */}
        <View style={styles.bentoSplitRow}>
          {/* Left Vertical Card: Concentric Color Ring Dial (Middle-Left Ref) */}
          <TouchableOpacity
            style={styles.bentoLeftDialCard}
            activeOpacity={0.9}
            onPress={onNavigateToKey}
          >
            <View style={styles.miniCardDotsRow}>
              <View style={styles.amberDot} />
              <View style={styles.greyMiniDash} />
            </View>

            {/* 3D Concentric Ring with Raised Center Knob */}
            <View style={styles.concentricOuterPlate}>
              <View style={styles.concentricRingSplit}>
                <View style={styles.ringHalfPeach} />
                <View style={styles.ringHalfBlue} />
                <View style={styles.concentricCenterKnob}>
                  <Ionicons name="key" size={16} color="#DF8268" />
                </View>
              </View>
            </View>

            <Text style={styles.dialCardLabel}>Digital Key</Text>
            <Text style={styles.dialCardSub}>BLE 5.2</Text>

            <View style={styles.bottomTinyKnobs}>
              <View style={styles.yellowKnobTiny} />
              <View style={styles.whiteKnobTiny} />
            </View>
          </TouchableOpacity>

          {/* Right Split Peach & Ivory Card (Top-Right Image Ref) */}
          <View style={styles.bentoRightSplitCard}>
            {/* Left Peach Half */}
            <TouchableOpacity
              style={styles.splitPeachHalf}
              activeOpacity={0.9}
              onPress={() => setSelectedFilter('CAR')}
            >
              <View style={styles.peachTopHeader}>
                <View style={styles.whiteMicroDot} />
                <Text style={styles.peachHeaderTitle}>Ô TÔ EV</Text>
              </View>

              {/* 3D White Tactile Extruded Circle Knob */}
              <View style={styles.extrudedWhiteKnobLarge}>
                <Ionicons name="car-sport" size={20} color="#DF8268" />
              </View>

              <Text style={styles.peachActionTitle}>Thuê tự lái</Text>

              {/* Bottom Tactile Micro Pills */}
              <View style={styles.peachMicroPillsRow}>
                <View style={styles.microWhitePill}>
                  <Text style={styles.microPillText}>0đ cọc</Text>
                </View>
                <View style={styles.microWhitePill}>
                  <Text style={styles.microPillText}>24/7</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Right Ivory Half */}
            <TouchableOpacity
              style={styles.splitIvoryHalf}
              activeOpacity={0.9}
              onPress={() => setSelectedFilter('MOTORBIKE')}
            >
              <View style={styles.ivoryTopHeader}>
                <View style={styles.skyBlueSphere} />
                <View>
                  <Text style={styles.ivoryTitleBold}>Xe máy điện</Text>
                  <Text style={styles.ivorySubMuted}>Đổi pin 0đ</Text>
                </View>
              </View>

              {/* Floating Pill Bar inside Ivory Half */}
              <View style={styles.floatingMiniBar}>
                <Text style={styles.floatingMiniBarText}>Từ 22.000đ/h</Text>
                <View style={styles.tinyBlueDotBtn}>
                  <Ionicons name="flash" size={9} color="#FFFFFF" />
                </View>
              </View>

              {/* Raised White Circle + Pastel Pills */}
              <View style={styles.ivoryBottomRow}>
                <View style={styles.extrudedWhiteKnobMedium}>
                  <Ionicons name="bicycle" size={16} color="#6E92B5" />
                </View>
                <View style={styles.pastelButtonsPair}>
                  <View style={styles.pastelBlueCapsule} />
                  <View style={styles.pastelPeachCapsule} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================
            3. STACKED TACTILE KNOB CONSOLE (CENTER-BOTTOM IMAGE REF)
        ========================================================= */}
        <View style={styles.stackedConsoleWrapper}>
          {/* Offset Split Backing Card (Cream + Terracotta Peach) */}
          <View style={styles.consoleBackingCard}>
            <View style={styles.backingLeftCream}>
              <Text style={styles.backingHintText}>✦ 6 Trạm Hub ĐH GTVT & Metro</Text>
            </View>
            <View style={styles.backingRightTerracotta} />
          </View>

          {/* Foreground Floating Ivory Console Card */}
          <View style={styles.consoleForegroundCard}>
            <View style={styles.consoleHeaderRow}>
              <View style={styles.microBrandRow}>
                <View style={styles.amberDot} />
                <Text style={styles.consoleTitle}>DỊCH VỤ GIAO THÔNG THÔNG MINH</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFilter('ALL')}>
                <Text style={styles.resetFilterText}>Tất cả ({vehicles.length})</Text>
              </TouchableOpacity>
            </View>

            {/* Inset Search/Filter Track Bar */}
            <View style={styles.insetTrackBar}>
              <TouchableOpacity
                style={[styles.trackTab, selectedFilter === 'ALL' && styles.trackTabActive]}
                onPress={() => setSelectedFilter('ALL')}
              >
                <Text style={[styles.trackTabText, selectedFilter === 'ALL' && styles.trackTabTextActive]}>
                  Tất cả đội xe
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.trackTab, selectedFilter === 'CAR' && styles.trackTabActive]}
                onPress={() => setSelectedFilter('CAR')}
              >
                <Text style={[styles.trackTabText, selectedFilter === 'CAR' && styles.trackTabTextActive]}>
                  Ô tô điện EV
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.trackTab, selectedFilter === 'MOTORBIKE' && styles.trackTabActive]}
                onPress={() => setSelectedFilter('MOTORBIKE')}
              >
                <Text style={[styles.trackTabText, selectedFilter === 'MOTORBIKE' && styles.trackTabTextActive]}>
                  Xe máy điện
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4 Tactile 3D Extruded Circular Knobs */}
            <View style={styles.tactileKnobsGrid}>
              <TouchableOpacity
                style={styles.knobColumn}
                onPress={() => setSelectedFilter('CAR')}
              >
                <View style={[styles.knobOuterRing, styles.knobRingPeach]}>
                  <View style={styles.knobInnerCap}>
                    <Ionicons name="car-sport" size={18} color="#DF8268" />
                  </View>
                </View>
                <Text style={styles.knobTitle}>Thuê tự lái</Text>
                <Text style={styles.knobSub}>Ô tô EV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.knobColumn}
                onPress={() => setSelectedFilter('MOTORBIKE')}
              >
                <View style={styles.knobOuterRing}>
                  <View style={styles.knobInnerCap}>
                    <Ionicons name="bicycle" size={18} color="#6E92B5" />
                  </View>
                </View>
                <Text style={styles.knobTitle}>Xe máy điện</Text>
                <Text style={styles.knobSub}>Đổi pin 0đ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.knobColumn}
                onPress={onNavigateToKey}
              >
                <View style={styles.knobOuterRing}>
                  <View style={styles.knobInnerCap}>
                    <Ionicons name="key" size={18} color="#C4684F" />
                  </View>
                </View>
                <Text style={styles.knobTitle}>Khóa BLE</Text>
                <Text style={styles.knobSub}>Mở 1 chạm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.knobColumn}
                onPress={() => setSelectedFilter('ALL')}
              >
                <View style={styles.knobOuterSquares}>
                  <View style={styles.miniSquareBtn}>
                    <Ionicons name="flash" size={13} color="#DF8268" />
                  </View>
                  <View style={styles.miniSquareBtn}>
                    <Ionicons name="gift" size={13} color="#6E92B5" />
                  </View>
                </View>
                <Text style={styles.knobTitle}>Ưu đãi -20%</Text>
                <Text style={styles.knobSub}>Hội viên</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* =========================================================
            4. TRIPLE CONCENTRIC 3D DIAL GAUGES (BOTTOM-LEFT IMAGE REF)
        ========================================================= */}
        <View style={styles.tripleGaugesCard}>
          <View style={styles.waveCardTopRow}>
            <View style={styles.microBrandRow}>
              <View style={styles.amberDot} />
              <Text style={styles.microBrandText}>ĐỒNG HỒ ĐIỀU VẬN LÀN SÓNG XANH GLOSA</Text>
            </View>
          </View>
          <Text style={styles.gaugesSubtitle}>
            Trục UTH – Điện Biên Phủ – Mai Chí Thọ • Đồng bộ đèn tín hiệu thời gian thực
          </Text>

          <View style={styles.threeDialsRow}>
            {/* Dial 1: Peach + Slate Blue */}
            <View style={styles.dialItem}>
              <View style={styles.dialOuterDual}>
                <View style={styles.dialHalfBlue} />
                <View style={styles.dialCenter3DSphere}>
                  <Text style={styles.sphereValText}>45</Text>
                </View>
              </View>
              <Text style={styles.dialLabel}>km/h GLOSA</Text>
            </View>

            {/* Dial 2: Medium Terracotta Coral */}
            <View style={styles.dialItem}>
              <View style={styles.dialOuterCoral}>
                <View style={styles.dialInnerCoralRing}>
                  <View style={styles.dialCenter3DSphereSmall}>
                    <Text style={styles.sphereValTextSmall}>92%</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.dialLabel}>Pin Đội Xe</Text>
            </View>

            {/* Dial 3: Large Deep Terracotta Rose */}
            <View style={styles.dialItem}>
              <View style={styles.dialOuterDeepRose}>
                <View style={styles.dialInnerRoseRing}>
                  <View style={styles.dialCenter3DSphere}>
                    <Text style={styles.sphereValText}>-18%</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.dialLabel}>Giảm CO₂</Text>
            </View>
          </View>
        </View>

        {/* =========================================================
            5. VEHICLE CATALOG LIST
        ========================================================= */}
        <View style={styles.catalogHeaderRow}>
          <Text style={styles.catalogTitle}>
            Đội xe sẵn sàng ({filteredVehicles.length})
          </Text>
          <View style={styles.filterBadgePill}>
            <View style={styles.amberDot} />
            <Text style={styles.filterBtnText}>Nhận xe tự động</Text>
          </View>
        </View>

        <View style={isDesktop ? styles.desktopCardGrid : styles.mobileCardList}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#DF8268" />
              <Text style={styles.loadingText}>Đang đồng bộ đội xe...</Text>
            </View>
          ) : (
            filteredVehicles.map((veh) => (
              <VehicleCard
                key={veh.id}
                vehicle={veh}
                style={
                  isDesktop
                    ? { width: width > 1050 ? '31.8%' : '48.5%', marginHorizontal: 0 }
                    : null
                }
                onSelect={handleOpenBooking}
                onBook={handleOpenBooking}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Tactile Soft UI Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderStrip}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalContractTitle}>HỢP ĐỒNG THUÊ XE THÔNG MINH</Text>
                <Text style={styles.modalVehicleName}>{selectedVehicle?.name}</Text>
                <Text style={styles.modalPlateText}>Biển số: {selectedVehicle?.plateNumber}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseKnob}
              >
                <Ionicons name="close" size={18} color="#2C221E" />
              </TouchableOpacity>
            </View>

            {selectedVehicle && (
              <>
                <Text style={styles.modalSectionLabel}>Chọn thời lượng thuê (theo giờ):</Text>
                <View style={styles.durationRow}>
                  {[1, 2, 3, 5, 8, 24].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.durationChip,
                        durationHours === h && styles.durationChipActive
                      ]}
                      onPress={() => setDurationHours(h)}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          durationHours === h && styles.durationTextActive
                        ]}
                      >
                        {h} Giờ
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <CO2Widget
                  eco={{
                    distanceKm: Math.round(durationHours * 22),
                    co2SavedKg: Math.round(durationHours * 2.64 * 10) / 10,
                    treesEquivalent: Math.round(durationHours * 0.13 * 100) / 100,
                    ecoPointsEarned: durationHours * 26
                  }}
                />

                <View style={styles.priceSheet}>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Đơn giá thuê ({durationHours} giờ)</Text>
                    <Text style={styles.sheetValue}>
                      {(selectedVehicle.hourlyPrice * durationHours).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Bảo hiểm & Phí ITS Hub</Text>
                    <Text style={styles.sheetValue}>Miễn phí (0 đ)</Text>
                  </View>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Tiền thế chấp (eKYC Đã xác thực)</Text>
                    <Text style={[styles.sheetValue, { color: '#6E92B5' }]}>0 đ (Miễn cọc)</Text>
                  </View>
                  <View style={[styles.priceSheetRow, styles.totalPriceRow]}>
                    <Text style={styles.totalPriceLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalPriceValue}>
                      {(selectedVehicle.hourlyPrice * durationHours).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.modalSubmitText}>KÝ HỢP ĐỒNG & NHẬN KHÓA 3D</Text>
                      <View style={styles.submitKnobCircle}>
                        <Ionicons name="key" size={14} color="#DF8268" />
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFE5DC'
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 105
  },

  /* ==========================================
     1. LAYERED WAVE HERO CARD
  ========================================== */
  waveHeroCard: {
    marginHorizontal: 16,
    backgroundColor: '#FDFBF7',
    borderRadius: 28,
    padding: 18,
    minHeight: 195,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 6
  },
  waveBackLayer: {
    position: 'absolute',
    bottom: -28,
    left: -20,
    right: -20,
    height: 92,
    backgroundColor: '#9AB8D4',
    borderTopLeftRadius: 90,
    borderTopRightRadius: 110,
    opacity: 0.55
  },
  waveFrontLayer: {
    position: 'absolute',
    bottom: -36,
    left: -10,
    right: -30,
    height: 82,
    backgroundColor: '#6E92B5',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 70
  },
  waveFloatingSphereWhite: {
    position: 'absolute',
    bottom: 18,
    left: 38,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDFBF7',
    shadowColor: '#2C221E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4
  },
  waveFloatingCupPeach: {
    position: 'absolute',
    bottom: 14,
    right: 26,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5BFA9',
    borderWidth: 3,
    borderColor: '#FDFBF7',
    shadowColor: '#2C221E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4
  },
  waveCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 3
  },
  microBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  amberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F2C97D'
  },
  microBrandText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A6A63',
    letterSpacing: 0.8
  },
  microStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  peachTinyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DF8268'
  },
  microLocationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A6968E'
  },
  tactileSearchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 46,
    borderRadius: 23,
    paddingLeft: 16,
    paddingRight: 6,
    zIndex: 3,
    borderWidth: 1,
    borderColor: '#F7EFE6',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 5
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C221E',
    fontWeight: '600'
  },
  clearBtn: {
    paddingHorizontal: 6
  },
  searchSkyBlueKnob: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#86B4D9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6E92B5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5
  },
  waveCenterTitleWrap: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    zIndex: 3
  },
  waveCenterCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5C4B43',
    letterSpacing: 2.2
  },
  waveCenterSub: {
    fontSize: 11,
    color: '#8C7A70',
    marginTop: 3,
    fontWeight: '600'
  },

  /* ==========================================
     2. BENTO ROW: LEFT DIAL + RIGHT SPLIT CARD
  ========================================== */
  bentoSplitRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12
  },
  bentoLeftDialCard: {
    width: '33%',
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5
  },
  miniCardDotsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greyMiniDash: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2D5C8'
  },
  concentricOuterPlate: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FBF6EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  concentricRingSplit: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5BFA9'
  },
  ringHalfPeach: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '55%',
    backgroundColor: '#F5BFA9'
  },
  ringHalfBlue: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#86B4D9'
  },
  concentricCenterKnob: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3
  },
  dialCardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C221E'
  },
  dialCardSub: {
    fontSize: 10,
    color: '#A6968E',
    fontWeight: '600'
  },
  bottomTinyKnobs: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 6,
    marginTop: 6
  },
  yellowKnobTiny: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F2C97D'
  },
  whiteKnobTiny: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F2ECE4'
  },

  /* Right Split Peach / Ivory Card */
  bentoRightSplitCard: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FDFBF7',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5
  },
  splitPeachHalf: {
    width: '46%',
    backgroundColor: '#F5C2AF',
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  peachTopHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  whiteMicroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDFBF7'
  },
  peachHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5C3A2E',
    letterSpacing: 0.5
  },
  extrudedWhiteKnobLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    shadowColor: '#8C4A32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4
  },
  peachActionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C221E',
    marginBottom: 6
  },
  peachMicroPillsRow: {
    flexDirection: 'row',
    gap: 4
  },
  microWhitePill: {
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8
  },
  microPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7A5448'
  },

  splitIvoryHalf: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    padding: 12,
    justifyContent: 'space-between'
  },
  ivoryTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  skyBlueSphere: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#98C4E6',
    shadowColor: '#6E92B5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  ivoryTitleBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C221E'
  },
  ivorySubMuted: {
    fontSize: 10,
    color: '#A6968E',
    fontWeight: '600'
  },
  floatingMiniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F5EFE8',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3
  },
  floatingMiniBarText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2C221E'
  },
  tinyBlueDotBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#86B4D9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ivoryBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  extrudedWhiteKnobMedium: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5EFE8',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3
  },
  pastelButtonsPair: {
    flexDirection: 'row',
    gap: 6
  },
  pastelBlueCapsule: {
    width: 22,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#98C4E6'
  },
  pastelPeachCapsule: {
    width: 28,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F5BFA9'
  },

  /* ==========================================
     3. STACKED TACTILE KNOB CONSOLE
  ========================================== */
  stackedConsoleWrapper: {
    marginHorizontal: 16,
    marginTop: 20,
    paddingBottom: 22,
    position: 'relative'
  },
  consoleBackingCard: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 0,
    height: 90,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3
  },
  backingLeftCream: {
    width: '50%',
    backgroundColor: '#F9ECE4',
    justifyContent: 'flex-end',
    padding: 12
  },
  backingHintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C756A'
  },
  backingRightTerracotta: {
    width: '50%',
    backgroundColor: '#E59B82'
  },
  consoleForegroundCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 26,
    padding: 16,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6
  },
  consoleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  consoleTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2C221E',
    letterSpacing: 0.5
  },
  resetFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DF8268'
  },
  insetTrackBar: {
    flexDirection: 'row',
    backgroundColor: '#F4ECE2',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16
  },
  trackTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 11,
    alignItems: 'center'
  },
  trackTabActive: {
    backgroundColor: '#FDFBF7',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2
  },
  trackTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8C7A70'
  },
  trackTabTextActive: {
    color: '#2C221E',
    fontWeight: '800'
  },
  tactileKnobsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  knobColumn: {
    alignItems: 'center',
    width: '23%'
  },
  knobOuterRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F7F0E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4
  },
  knobRingPeach: {
    backgroundColor: '#FCE3D7'
  },
  knobInnerCap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  knobOuterSquares: {
    width: 56,
    height: 56,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  miniSquareBtn: {
    width: 25,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3
  },
  knobTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2C221E',
    textAlign: 'center'
  },
  knobSub: {
    fontSize: 9,
    color: '#A6968E',
    fontWeight: '600',
    marginTop: 1
  },

  /* ==========================================
     4. TRIPLE CONCENTRIC 3D DIAL GAUGES
  ========================================== */
  tripleGaugesCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FDFBF7',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5
  },
  gaugesSubtitle: {
    fontSize: 11,
    color: '#8C7A70',
    marginBottom: 16,
    fontWeight: '600'
  },
  threeDialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  dialItem: {
    alignItems: 'center'
  },
  dialOuterDual: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#F5C2AF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  dialHalfBlue: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    top: 0,
    width: '55%',
    backgroundColor: '#7FA5C9'
  },
  dialOuterCoral: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F2BAA6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4
  },
  dialInnerCoralRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DF8E74',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dialOuterDeepRose: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E5A898',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4
  },
  dialInnerRoseRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#C97B68',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dialCenter3DSphere: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4
  },
  dialCenter3DSphereSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  sphereValText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#2C221E'
  },
  sphereValTextSmall: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2C221E'
  },
  dialLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5C4B43',
    marginTop: 8
  },

  /* ==========================================
     5. CATALOG SECTION
  ========================================== */
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 12
  },
  catalogTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2C221E'
  },
  filterBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6A63'
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#7A6A63'
  },
  desktopCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    rowGap: 16,
    width: '100%',
    paddingBottom: 40
  },
  mobileCardList: {
    width: '100%',
    paddingBottom: 24
  },

  /* ==========================================
     6. BOOKING MODAL (SOFT UI)
  ========================================== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 34, 30, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FDFBF7',
    borderRadius: 28,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#2C221E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12
  },
  modalHeaderStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  modalContractTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DF8268',
    letterSpacing: 0.8
  },
  modalVehicleName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2C221E',
    marginTop: 2
  },
  modalPlateText: {
    fontSize: 11,
    color: '#7A6A63',
    marginTop: 2,
    fontWeight: '600'
  },
  modalCloseKnob: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5EFE8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C4B43',
    marginBottom: 8
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F5EFE8',
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  durationChipActive: {
    backgroundColor: '#DF8268',
    borderColor: '#F5BFA9'
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6A63'
  },
  durationTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  priceSheet: {
    backgroundColor: '#F7F1E8',
    borderRadius: 18,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  priceSheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  sheetLabel: {
    fontSize: 11,
    color: '#7A6A63',
    fontWeight: '600'
  },
  sheetValue: {
    fontSize: 11,
    color: '#2C221E',
    fontWeight: '800'
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#E6D9CE',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  totalPriceLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2C221E'
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DF8268'
  },
  modalSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DF8268',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 10,
    marginTop: 8,
    shadowColor: '#DF8268',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  submitKnobCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
