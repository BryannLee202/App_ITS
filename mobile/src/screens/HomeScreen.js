import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import GreenSM3DIcons from '../components/GreenSM3DIcons';
import ApiService from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả đội xe' },
  { id: 'CAR', label: 'Ô tô tự lái' },
  { id: 'MOTORBIKE', label: 'Xe máy điện' }
];

const SAVED_PLACES = [
  {
    id: 'place-1',
    name: 'EcoGo Mobility Hub - ĐH Giao Thông Vận Tải (UTH)',
    address: 'Số 2 Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM',
    distance: '0,4 km',
    icon: 'school-outline'
  },
  {
    id: 'place-2',
    name: 'EcoGo Multimodal Station - Ga Trung Tâm Bến Thành',
    address: 'Quảng trường Quách Thị Trang, Phường Bến Thành, Quận 1, TP.HCM',
    distance: '6,8 km',
    icon: 'train-outline'
  },
  {
    id: 'place-3',
    name: 'EcoGo Smart Station - Khu Đô Thị Tân Cảng & Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM',
    distance: '1,4 km',
    icon: 'business-outline'
  },
  {
    id: 'place-4',
    name: 'EcoGo Airport Hub - Sân Bay Quốc Tế Tân Sơn Nhất',
    address: 'Đường Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
    distance: '8,5 km',
    icon: 'airplane-outline'
  },
  {
    id: 'place-5',
    name: 'EcoGo Eco Station - Khu Đô Thị Mới Thủ Thiêm',
    address: 'Đại lộ Mai Chí Thọ, Phường An Khánh, TP. Thủ Đức, TP.HCM',
    distance: '4,2 km',
    icon: 'leaf-outline'
  }
];

export default function HomeScreen({
  theme = THEME_PRESETS.COBALT,
  onSelectVehicle,
  onNavigateToKey,
  onNavigateToMap,
  onNavigateToTrips,
  onNavigateToProfile,
  onOpenRewards,
  onOpenGreenRace
}) {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [rentalPackageTab, setRentalPackageTab] = useState('HOURLY'); // 'HOURLY' | 'DAILY' | 'INTERCITY'
  const [glosaAdvisory, setGlosaAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(SAVED_PLACES[0]);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingToast, setBookingToast] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, [selectedCategory]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vehRes, stRes, glosaRes] = await Promise.all([
        ApiService.getVehicles(selectedCategory),
        ApiService.getStations(),
        ApiService.getGreenWaveAdvisory(300, 42)
      ]);
      setVehicles(vehRes.vehicles || []);
      setStations(stRes.stations || []);
      setGlosaAdvisory(glosaRes.data || null);
    } catch (err) {
      console.warn('Error loading home data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenBooking = (vehicle) => {
    setBookingVehicle(vehicle);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setBookingToast({
      title: 'Đặt thuê xe thành công!',
      message: `Xe ${bookingVehicle?.name} (${bookingVehicle?.plateNumber}) đã kích hoạt khóa số BLE 5.2.`
    });
    loadInitialData();
    setTimeout(() => {
      setBookingToast(null);
      if (onNavigateToKey) onNavigateToKey();
    }, 1400);
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (!destinationQuery.trim()) return true;
    const q = destinationQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.plateNumber.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadInitialData();
            }}
            tintColor={theme.primary}
          />
        }
      >
        {/* ============================================================
            1. CRISP SNOW WHITE HEADER + SMART BOOKING WIDGET
           ============================================================ */}
        <View style={styles.topHeaderSection}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.userGreetingLeft}
              activeOpacity={0.85}
              onPress={onNavigateToProfile}
            >
              <View style={[styles.avatarJadeCircle, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarInitials}>MT</Text>
                <View style={styles.onlineStatusDot} />
              </View>
              <View>
                <View style={styles.greetingNameRow}>
                  <Text style={styles.greetingTitle}>Chào Minh Tài</Text>
                  <View style={[styles.ekycBadge, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons name="shield-checkmark" size={11} color={theme.primary} />
                    <Text style={[styles.ekycBadgeText, { color: theme.primary }]}>
                      GPLX B2 • 0đ Cọc
                    </Text>
                  </View>
                </View>
                <Text style={styles.greetingSub}>EcoGo Smart Mobility • ĐH GTVT (UTH)</Text>
              </View>
            </TouchableOpacity>

            {/* Right Header Actions: EcoGo Race Trophy Pill + Voucher Button */}
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.ecoPtsHeaderPill}
                activeOpacity={0.85}
                onPress={onOpenGreenRace}
              >
                <Ionicons name="trophy" size={14} color="#D97706" />
                <Text style={styles.ecoPtsHeaderText}>340 Pts</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: theme.primarySoft }]}
                activeOpacity={0.85}
                onPress={onOpenRewards}
              >
                <Ionicons name="gift-outline" size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ============================================================
              2. SMART STATION & DURATION BOOKING CARD
             ============================================================ */}
          <View style={styles.smartBookingCard}>
            {/* Package Mode Tabs */}
            <View style={styles.packageTabsRow}>
              {[
                { id: 'HOURLY', label: 'Theo giờ (Từ 22k/h)', icon: 'flash' },
                { id: 'DAILY', label: 'Trọn ngày (24h)', icon: 'calendar' },
                { id: 'INTERCITY', label: 'Liên tỉnh (-20%)', icon: 'navigate' }
              ].map((tab) => {
                const active = rentalPackageTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.pkgTabBtn,
                      active && { backgroundColor: theme.primary }
                    ]}
                    onPress={() => setRentalPackageTab(tab.id)}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={12}
                      color={active ? '#FFFFFF' : '#475569'}
                    />
                    <Text style={[styles.pkgTabText, active && styles.pkgTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pickup Hub Selector Row */}
            <TouchableOpacity
              style={styles.stationSelectorRow}
              activeOpacity={0.88}
              onPress={() => setShowDestinationModal(true)}
            >
              <View style={[styles.stationPinCircle, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="location" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stationLabelOverline}>TRẠM NHẬN & TRẢ XE TỰ ĐỘNG 24/7</Text>
                <Text style={styles.stationSelectedName} numberOfLines={1}>
                  {selectedPlace ? selectedPlace.name : 'EcoGo Hub - ĐH GTVT (UTH)'}
                </Text>
              </View>
              <View style={[styles.changeHubPill, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.changeHubPillText, { color: theme.primary }]}>Đổi trạm</Text>
                <Ionicons name="chevron-forward" size={12} color={theme.primary} />
              </View>
            </TouchableOpacity>

            {/* Time Window + Search Input Row */}
            <View style={styles.timeAndSearchRow}>
              <TouchableOpacity
                style={styles.timeSlotChip}
                onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
              >
                <Ionicons name="time-outline" size={15} color="#D97706" />
                <View>
                  <Text style={styles.timeSlotLabel}>Thời gian nhận</Text>
                  <Text style={styles.timeSlotVal}>
                    {rentalPackageTab === 'DAILY' ? 'Hôm nay • 24 giờ' : 'Hôm nay • 4 giờ'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.quickSearchBox}>
                <Ionicons name="search-outline" size={16} color="#64748B" />
                <TextInput
                  style={styles.quickSearchInput}
                  value={destinationQuery}
                  onChangeText={setDestinationQuery}
                  placeholder="Tìm Ioniq 5, CX-5, Cross..."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Booking Toast */}
        {bookingToast && (
          <View style={[styles.toastBanner, { backgroundColor: theme.primary }]}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{bookingToast.title}</Text>
              <Text style={styles.toastMsg}>{bookingToast.message}</Text>
            </View>
          </View>
        )}

        {/* ============================================================
            3. ASYMMETRIC 3-BLOCK BENTO GRID (ROYAL COBALT & WARM AMBER)
           ============================================================ */}
        <View style={styles.bentoSection}>
          <View style={styles.bentoRow}>
            {/* Left Tall Bento Card: Self-Drive Cars */}
            <TouchableOpacity
              style={[styles.bentoTallCard, { backgroundColor: theme.primarySoft }]}
              activeOpacity={0.9}
              onPress={() => setSelectedCategory('CAR')}
            >
              <View style={[styles.bentoTallGlow, { backgroundColor: theme.glow }]} />
              <View style={[styles.bentoTopChipJade, { backgroundColor: theme.primary }]}>
                <Text style={styles.bentoTopChipText}>MỞ KHÓA BLE 24/7</Text>
              </View>
              <Text style={styles.bentoTallTitle}>Ô Tô Tự Lái</Text>
              <Text style={styles.bentoTallSub}>
                Hyundai Ioniq 5, Mazda CX-5, Toyota Cross HEV
              </Text>
              <Text style={[styles.bentoTallPrice, { color: theme.primary }]}>
                Từ 85.000đ/giờ
              </Text>

              <View style={styles.bentoTallIllustration}>
                <GreenSM3DIcons type="CAR_CYAN_3D" accentColor={theme.primary} />
              </View>
            </TouchableOpacity>

            {/* Right Stacked Column: 2 Horizontal Bento Cards */}
            <View style={styles.bentoRightCol}>
              {/* Top Right: Electric Motorbikes (Warm Amber Cream) */}
              <TouchableOpacity
                style={styles.bentoSmallCardSand}
                activeOpacity={0.9}
                onPress={() => setSelectedCategory('MOTORBIKE')}
              >
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <View style={styles.bentoTopChipSand}>
                    <Text style={styles.bentoTopChipSandText}>ĐỔI PIN 0Đ</Text>
                  </View>
                  <Text style={styles.bentoSmallTitle}>Xe Máy Điện</Text>
                  <Text style={styles.bentoSmallSub}>Yamaha & Honda e:</Text>
                  <Text style={styles.bentoSmallPriceSand}>22.000đ/giờ</Text>
                </View>
                <GreenSM3DIcons type="SCOOTER_3D" accentColor={theme.primary} />
              </TouchableOpacity>

              {/* Bottom Right: Doorstep Delivery (Crisp White Card) */}
              <TouchableOpacity
                style={styles.bentoSmallCardMint}
                activeOpacity={0.9}
                onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
              >
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <View style={[styles.bentoTopChipWhite, { backgroundColor: theme.primarySoft }]}>
                    <Text style={[styles.bentoTopChipWhiteText, { color: theme.primary }]}>
                      BÁN KÍNH 5KM
                    </Text>
                  </View>
                  <Text style={styles.bentoSmallTitle}>Giao Xe Tận Nơi</Text>
                  <Text style={styles.bentoSmallSub}>Nhận xe sau 15 phút</Text>
                  <Text style={[styles.bentoSmallPriceJade, { color: theme.primary }]}>
                    Miễn phí giao
                  </Text>
                </View>
                <GreenSM3DIcons type="DELIVERY_BOX_3D" accentColor={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Streamlined 4-Pill Quick Utility Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.utilityPillsRow}
          >
            <TouchableOpacity style={styles.utilityPill} onPress={onNavigateToKey}>
              <View style={[styles.utilityIconCircle, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="key" size={14} color={theme.primary} />
              </View>
              <Text style={styles.utilityPillText}>Khóa thông minh BLE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.utilityPill} onPress={onNavigateToMap}>
              <View style={[styles.utilityIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="flash" size={14} color="#D97706" />
              </View>
              <Text style={styles.utilityPillText}>6 Trạm sạc & Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.utilityPill} onPress={onOpenGreenRace}>
              <View style={[styles.utilityIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="trophy" size={14} color="#0284C7" />
              </View>
              <Text style={styles.utilityPillText}>Chứng nhận EcoGo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.utilityPill} onPress={onOpenRewards}>
              <View style={[styles.utilityIconCircle, { backgroundColor: '#FCE7F3' }]}>
                <Ionicons name="pricetag" size={14} color="#DB2777" />
              </View>
              <Text style={styles.utilityPillText}>Voucher giảm 20%</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ============================================================
            4. DIGITAL COCKPIT GLOSA RADAR (MIDNIGHT NAVY & ELECTRIC BLUE)
           ============================================================ */}
        <TouchableOpacity
          style={[styles.glosaRadarCard, { backgroundColor: theme.cockpitBg }]}
          activeOpacity={0.92}
          onPress={onNavigateToMap}
        >
          <View style={styles.glosaRadarLeft}>
            <View style={styles.glosaLiveBadgeRow}>
              <View style={styles.glosaPulseDot} />
              <Text style={styles.glosaLiveTag}>RADAR ĐIỀU ĐỘ GIAO THÔNG ITS (GLOSA)</Text>
            </View>
            <Text style={styles.glosaCorridorTitle}>
              Trục ĐH GTVT (UTH) ➔ Điện Biên Phủ ➔ Mai Chí Thọ
            </Text>
            <Text style={styles.glosaCorridorSub}>
              {glosaAdvisory?.advisoryMessage ||
                'Duy trì 45 km/h để qua 4 nút giao liên tiếp không phải dừng đèn đỏ'}
            </Text>
          </View>

          <View style={[styles.glosaSpeedCircle, { borderColor: theme.primaryLight }]}>
            <Text style={styles.glosaSpeedNum}>
              {glosaAdvisory ? glosaAdvisory.recommendedSpeedKmh : 45}
            </Text>
            <Text style={styles.glosaSpeedUnit}>km/h</Text>
            <View style={[styles.glosaGreenTimerPill, { backgroundColor: theme.primary }]}>
              <Text style={styles.glosaGreenTimerText}>
                Đèn {glosaAdvisory ? glosaAdvisory.secondsToSignalChange : 28}s
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ============================================================
            5. WIDE SHOWROOM TELEMETRY CAROUSEL ("Xe sẵn sàng gần bạn")
           ============================================================ */}
        <View style={styles.showroomCarouselSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionMainTitle}>Xe sẵn sàng gần bạn</Text>
              <Text style={styles.sectionSubTitle}>
                Đã kiểm định áp suất lốp 34 PSI & dung lượng pin trước chuyến đi
              </Text>
            </View>
            <TouchableOpacity onPress={onNavigateToMap}>
              <Text style={[styles.seeMapLink, { color: theme.primary }]}>Bản đồ Hub &gt;</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wideShowroomRow}
          >
            {filteredVehicles.map((veh, idx) => {
              const batteryPct = Math.round(veh.telematics?.batteryLevelPct || 92);
              const distMeters = 250 + idx * 180;
              const tirePsi = veh.telematics?.tirePressurePsi?.fl || 34;

              return (
                <TouchableOpacity
                  key={veh.id}
                  style={styles.wideShowroomCard}
                  activeOpacity={0.92}
                  onPress={() => handleOpenBooking(veh)}
                >
                  {/* 16:10 Showroom Image */}
                  <View style={styles.wideImgWrap}>
                    <Image source={{ uri: veh.thumbnail }} style={styles.wideImg} resizeMode="cover" />

                    {/* Top Left Telemetry Pill */}
                    <View style={styles.wideTelemetryPill}>
                      <Ionicons name="flash" size={11} color={theme.primary} />
                      <Text style={styles.wideTelemetryText}>
                        Pin {batteryPct}% • {veh.rangeKm} km
                      </Text>
                    </View>

                    {/* Top Right Distance Pill */}
                    <View style={styles.wideDistPill}>
                      <Ionicons name="location" size={10} color="#FFFFFF" />
                      <Text style={styles.wideDistText}>Cách {distMeters}m</Text>
                    </View>

                    {/* Bottom Left Plate & Rating */}
                    <View style={styles.wideBottomOverlay}>
                      <View style={styles.widePlateBadge}>
                        <Text style={styles.widePlateText}>{veh.plateNumber}</Text>
                      </View>
                      <View style={styles.wideRatingPill}>
                        <Ionicons name="star" size={11} color="#F59E0B" />
                        <Text style={styles.wideRatingText}>{veh.rating}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Card Details & IoT Pre-Check */}
                  <View style={styles.wideCardBody}>
                    <Text style={styles.wideVehName} numberOfLines={1}>
                      {veh.name}
                    </Text>

                    <View style={styles.iotPrecheckRow}>
                      <View style={styles.iotCheckChip}>
                        <Ionicons name="checkmark-circle" size={12} color={theme.primary} />
                        <Text style={styles.iotCheckText}>Lốp {tirePsi} PSI</Text>
                      </View>
                      <View style={styles.iotCheckChip}>
                        <Ionicons name="bluetooth" size={11} color={theme.primary} />
                        <Text style={styles.iotCheckText}>BLE 5.2</Text>
                      </View>
                      <View style={styles.iotCheckChip}>
                        <Ionicons name="people-outline" size={12} color="#475569" />
                        <Text style={styles.iotCheckText}>{veh.seats} chỗ</Text>
                      </View>
                    </View>

                    <View style={styles.wideCardFooter}>
                      <View>
                        <Text style={[styles.widePriceMain, { color: theme.primary }]}>
                          {veh.hourlyPrice.toLocaleString('vi-VN')}đ
                          <Text style={styles.widePriceUnit}>/giờ</Text>
                        </Text>
                        <Text style={styles.widePriceDay}>
                          {veh.dailyPrice.toLocaleString('vi-VN')}đ/ngày
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.wideBookBtn, { backgroundColor: theme.primary }]}
                        onPress={() => handleOpenBooking(veh)}
                      >
                        <Text style={styles.wideBookBtnText}>Đặt thuê</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ============================================================
            6. FULL FLEET CATALOG WITH CATEGORY FILTER
           ============================================================ */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeaderRow}>
            <Text style={styles.sectionMainTitle}>
              Danh mục phương tiện tại trạm ({filteredVehicles.length})
            </Text>
            <View style={styles.catFilterRow}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catPill,
                      active && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 28 }} />
          ) : (
            filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                accentColor={theme.primary}
                onSelect={handleOpenBooking}
                onBook={handleOpenBooking}
              />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ============================================================
          MODAL 1: STATION & DESTINATION SELECTOR
         ============================================================ */}
      <Modal
        visible={showDestinationModal}
        animationType="slide"
        onRequestClose={() => setShowDestinationModal(false)}
      >
        <View style={styles.destModalContainer}>
          <View style={styles.destHeaderBar}>
            <TouchableOpacity
              style={styles.destBackBtn}
              onPress={() => setShowDestinationModal(false)}
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>

            <View style={[styles.currentLocDotOuter, { backgroundColor: theme.primary }]}>
              <View style={styles.currentLocDotInner} />
            </View>
            <Text style={styles.currentLocTitle} numberOfLines={1}>
              Chọn Trạm EcoGo Hub Nhận & Trả Xe
            </Text>
          </View>

          <View style={styles.destInputRow}>
            <View style={[styles.destInputWrap, { borderColor: theme.primary }]}>
              <Ionicons name="location" size={18} color={theme.primary} />
              <TextInput
                style={styles.destTextInput}
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Tìm trạm Hub hoặc địa điểm..."
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

          <ScrollView style={styles.placesScroll}>
            {SAVED_PLACES.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeItemRow}
                onPress={() => {
                  setSelectedPlace(place);
                  setShowDestinationModal(false);
                }}
              >
                <View style={styles.placeLeftCol}>
                  <View style={[styles.placeIconCircle, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons name={place.icon} size={16} color={theme.primary} />
                  </View>
                  <Text style={[styles.placeDistText, { color: theme.primary }]}>
                    {place.distance}
                  </Text>
                </View>

                <View style={styles.placeCenterCol}>
                  <Text style={styles.placeNameText}>{place.name}</Text>
                  <Text style={styles.placeAddrText} numberOfLines={2}>
                    {place.address}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.destBottomPillsBar}>
            <TouchableOpacity
              style={[styles.destBottomPill, { backgroundColor: theme.primarySoft }]}
              onPress={() => {
                setShowDestinationModal(false);
                if (onNavigateToMap) onNavigateToMap();
              }}
            >
              <Ionicons name="map-outline" size={16} color={theme.primary} />
              <Text style={[styles.destBottomPillText, { color: theme.primary }]}>
                Xem toàn bộ 6 Trạm trên Bản đồ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Multi-Step Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        vehicle={bookingVehicle}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    paddingBottom: 30
  },

  /* ============================================================
     1. CRISP SNOW WHITE HEADER & SMART BOOKING CARD
     ============================================================ */
  topHeaderSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  userGreetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  avatarJadeCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative'
  },
  avatarInitials: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  greetingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap'
  },
  greetingTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  ekycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    gap: 3
  },
  ekycBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700'
  },
  greetingSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  ecoPtsHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 5
  },
  ecoPtsHeaderText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309'
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },

  /* SMART BOOKING WIDGET */
  smartBookingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  packageTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    padding: 3,
    borderRadius: 12,
    marginBottom: 10,
    gap: 3
  },
  pkgTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 4
  },
  pkgTabText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#475569'
  },
  pkgTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  stationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 8
  },
  stationPinCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stationLabelOverline: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3
  },
  stationSelectedName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1
  },
  changeHubPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 2
  },
  changeHubPillText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700'
  },
  timeAndSearchRow: {
    flexDirection: 'row',
    gap: 8
  },
  timeSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6
  },
  timeSlotLabel: {
    fontFamily: FONTS.family,
    fontSize: 9,
    color: '#92400E',
    fontWeight: '600'
  },
  timeSlotVal: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#78350F'
  },
  quickSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6
  },
  quickSearchInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#0F172A',
    paddingVertical: 6
  },

  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    gap: 10
  },
  toastTitle: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  toastMsg: {
    fontFamily: FONTS.family,
    color: '#EFF6FF',
    fontSize: 11,
    marginTop: 1
  },

  /* ============================================================
     3. ASYMMETRIC BENTO GRID
     ============================================================ */
  bentoSection: {
    paddingHorizontal: 16,
    marginTop: 14
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10
  },
  bentoTallCard: {
    flex: 1.05,
    height: 196,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  bentoTallGlow: {
    position: 'absolute',
    bottom: -24,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.45
  },
  bentoTopChipJade: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    marginBottom: 8
  },
  bentoTopChipText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  bentoTallTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  bentoTallSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#475569',
    marginTop: 3,
    lineHeight: 15
  },
  bentoTallPrice: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6
  },
  bentoTallIllustration: {
    position: 'absolute',
    bottom: 2,
    right: 6
  },
  bentoRightCol: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10
  },
  bentoSmallCardSand: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  bentoSmallCardMint: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  bentoTopChipSand: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4
  },
  bentoTopChipSandText: {
    fontFamily: FONTS.family,
    fontSize: 8,
    fontWeight: '800',
    color: '#92400E'
  },
  bentoTopChipWhite: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4
  },
  bentoTopChipWhiteText: {
    fontFamily: FONTS.family,
    fontSize: 8,
    fontWeight: '800'
  },
  bentoSmallTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  bentoSmallSub: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#475569',
    marginTop: 1
  },
  bentoSmallPriceSand: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 3
  },
  bentoSmallPriceJade: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3
  },

  /* STREAMLINED 4-PILL UTILITY ROW */
  utilityPillsRow: {
    paddingTop: 12,
    gap: 8
  },
  utilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6
  },
  utilityIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  utilityPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A'
  },

  /* ============================================================
     4. DIGITAL COCKPIT GLOSA RADAR CARD
     ============================================================ */
  glosaRadarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 14,
    gap: 12
  },
  glosaRadarLeft: {
    flex: 1
  },
  glosaLiveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  glosaPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#38BDF8'
  },
  glosaLiveTag: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800',
    color: '#7DD3FC',
    letterSpacing: 0.4
  },
  glosaCorridorTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  glosaCorridorSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 3,
    lineHeight: 15
  },
  glosaSpeedCircle: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  glosaSpeedNum: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22
  },
  glosaSpeedUnit: {
    fontFamily: FONTS.family,
    fontSize: 9,
    color: '#93C5FD',
    fontWeight: '600'
  },
  glosaGreenTimerPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 2
  },
  glosaGreenTimerText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700'
  },

  /* ============================================================
     5. WIDE SHOWROOM TELEMETRY CAROUSEL
     ============================================================ */
  showroomCarouselSection: {
    marginTop: 18
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  sectionMainTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  sectionSubTitle: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  seeMapLink: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700'
  },
  wideShowroomRow: {
    paddingHorizontal: 16,
    gap: 14
  },
  wideShowroomCard: {
    width: 266,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  wideImgWrap: {
    width: '100%',
    height: 144,
    backgroundColor: '#F1F5F9',
    position: 'relative'
  },
  wideImg: {
    width: '100%',
    height: '100%'
  },
  wideTelemetryPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 4
  },
  wideTelemetryText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A'
  },
  wideDistPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 3
  },
  wideDistText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  wideBottomOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  widePlateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  widePlateText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A'
  },
  wideRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 3
  },
  wideRatingText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  wideCardBody: {
    padding: 12
  },
  wideVehName: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  iotPrecheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 10
  },
  iotCheckChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 3
  },
  iotCheckText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#475569'
  },
  wideCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10
  },
  widePriceMain: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800'
  },
  widePriceUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B'
  },
  widePriceDay: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1
  },
  wideBookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  wideBookBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  /* ============================================================
     6. FULL FLEET CATALOG
     ============================================================ */
  catalogSection: {
    marginTop: 22
  },
  catalogHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 12
  },
  catFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  catPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  catPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

  /* ============================================================
     STATION SELECTOR MODAL
     ============================================================ */
  destModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 16
  },
  destHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10
  },
  destBackBtn: {
    padding: 4
  },
  currentLocDotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  currentLocDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF'
  },
  currentLocTitle: {
    fontFamily: FONTS.family,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  destInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14
  },
  destInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    gap: 10,
    backgroundColor: '#F8FAFC'
  },
  destTextInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 14,
    color: '#0F172A'
  },
  placesScroll: {
    flex: 1,
    paddingHorizontal: 16
  },
  placeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12
  },
  placeLeftCol: {
    alignItems: 'center',
    width: 48
  },
  placeIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeDistText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700'
  },
  placeCenterCol: {
    flex: 1
  },
  placeNameText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19
  },
  placeAddrText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  destBottomPillsBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  destBottomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8
  },
  destBottomPillText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700'
  }
});
