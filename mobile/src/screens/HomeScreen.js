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
import ApiService from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả xe' },
  { id: 'CAR', label: 'Ô tô tự lái' },
  { id: 'MOTORBIKE', label: 'Xe máy điện' }
];

const SAVED_PLACES = [
  {
    id: 'place-1',
    name: 'ĐH Giao Thông Vận Tải (UTH) - Cơ sở chính',
    address: 'Số 2 Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM',
    distance: '0,4 km',
    icon: 'location-outline'
  },
  {
    id: 'place-2',
    name: 'Ga Trung Tâm Bến Thành - Quận 1',
    address: 'Quảng trường Quách Thị Trang, Phường Bến Thành, Quận 1, TP.HCM',
    distance: '6,8 km',
    icon: 'train-outline'
  },
  {
    id: 'place-3',
    name: 'Khu Đô Thị Tân Cảng & Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM',
    distance: '1,4 km',
    icon: 'business-outline'
  },
  {
    id: 'place-4',
    name: 'Sân Bay Quốc Tế Tân Sơn Nhất (Ga Quốc Nội)',
    address: 'Đường Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
    distance: '8,5 km',
    icon: 'airplane-outline'
  },
  {
    id: 'place-5',
    name: 'Khu Đô Thị Mới Thủ Thiêm - Sala',
    address: 'Đại lộ Mai Chí Thọ, Phường An Khánh, TP. Thủ Đức, TP.HCM',
    distance: '4,2 km',
    icon: 'leaf-outline'
  }
];

// Real studio photography for Bento service cards (0% vector cartoon look)
const BENTO_PHOTOS = {
  car: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=700&q=80',
  scooter: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
  delivery: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'
};

export default function HomeScreen({
  theme = THEME_PRESETS.MINT,
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
  const [rentalPackageTab, setRentalPackageTab] = useState('HOURLY'); // 'HOURLY' | 'DAILY'
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
      title: 'Đặt xe thành công',
      message: `${bookingVehicle?.name} (${bookingVehicle?.plateNumber}) đã sẵn sàng mở khóa.`
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
            1. CLEAN APPLE WHITE EDITORIAL HEADER (NO CLUTTERED PILLS)
           ============================================================ */}
        <View style={styles.topHeaderSection}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.userGreetingLeft}
              activeOpacity={0.85}
              onPress={onNavigateToProfile}
            >
              <View>
                <Text style={styles.greetingSub}>Chào Minh Tài · GPLX B2</Text>
                <Text style={styles.greetingTitle}>Bạn cần thuê xe ở đâu?</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.headerCircleBtn}
                activeOpacity={0.85}
                onPress={onOpenRewards}
              >
                <Ionicons name="pricetag-outline" size={17} color="#1D1D1F" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.avatarCircle, { backgroundColor: '#1D1D1F' }]}
                activeOpacity={0.85}
                onPress={onNavigateToProfile}
              >
                <Text style={styles.avatarInitials}>MT</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ============================================================
              2. MINIMAL BOOKING & SEARCH CARD (APPLE / UBER STYLE)
             ============================================================ */}
          <View style={styles.smartBookingCard}>
            {/* Clean 2-Segment Switcher */}
            <View style={styles.packageTabsRow}>
              {[
                { id: 'HOURLY', label: 'Thuê theo giờ' },
                { id: 'DAILY', label: 'Thuê theo ngày (24h)' }
              ].map((tab) => {
                const active = rentalPackageTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.pkgTabBtn, active && styles.pkgTabBtnActive]}
                    onPress={() => setRentalPackageTab(tab.id)}
                  >
                    <Text style={[styles.pkgTabText, active && styles.pkgTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pickup Location Row */}
            <TouchableOpacity
              style={styles.stationSelectorRow}
              activeOpacity={0.85}
              onPress={() => setShowDestinationModal(true)}
            >
              <View style={[styles.mintDotOuter, { backgroundColor: theme.primarySoft }]}>
                <View style={[styles.mintDotInner, { backgroundColor: theme.primary }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stationLabelSub}>Điểm nhận & trả xe</Text>
                <Text style={styles.stationSelectedName} numberOfLines={1}>
                  {selectedPlace ? selectedPlace.name : 'ĐH Giao Thông Vận Tải (UTH)'}
                </Text>
              </View>
              <Text style={[styles.changeHubLink, { color: theme.primary }]}>Bản đồ</Text>
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            {/* Pickup & Return Time Columns */}
            <View style={styles.timeColumnsRow}>
              <TouchableOpacity
                style={styles.timeCol}
                onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
              >
                <Text style={styles.timeColLabel}>Nhận xe</Text>
                <Text style={styles.timeColValue}>Hôm nay, 15:30</Text>
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity
                style={styles.timeCol}
                onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
              >
                <Text style={styles.timeColLabel}>Trả xe</Text>
                <Text style={styles.timeColValue}>
                  {rentalPackageTab === 'DAILY' ? 'Ngày mai, 15:30 (24h)' : 'Hôm nay, 19:30 (4h)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Minimal Search Input */}
            <View style={styles.quickSearchBox}>
              <Ionicons name="search-outline" size={16} color="#8E8E93" />
              <TextInput
                style={styles.quickSearchInput}
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Tìm theo dòng xe (Ioniq 5, CX-5, Corolla Cross...)"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>
        </View>

        {/* Booking Toast */}
        {bookingToast && (
          <View style={[styles.toastBanner, { backgroundColor: '#1D1D1F' }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.primaryLight} />
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{bookingToast.title}</Text>
              <Text style={styles.toastMsg}>{bookingToast.message}</Text>
            </View>
          </View>
        )}

        {/* ============================================================
            3. BENTO SERVICE GRID WITH 100% REAL STUDIO PHOTOS
               (Soft Mint #EBFBF5 + Warm Oat Beige #F6F3EC + Pure White)
           ============================================================ */}
        <View style={styles.bentoSection}>
          <View style={styles.bentoRow}>
            {/* Left Tall Card: Self-Drive Cars (Soft Pastel Mint + Real Studio Car Photo) */}
            <TouchableOpacity
              style={[
                styles.bentoTallCard,
                { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }
              ]}
              activeOpacity={0.92}
              onPress={() => setSelectedCategory('CAR')}
            >
              <View>
                <Text style={styles.bentoTallTitle}>Ô tô tự lái</Text>
                <Text style={styles.bentoTallSub}>Hyundai, Mazda, Toyota</Text>
                <Text style={[styles.bentoTallPrice, { color: theme.primary }]}>
                  Từ 85.000đ/giờ
                </Text>
              </View>

              <View style={styles.bentoTallPhotoWrap}>
                <Image
                  source={{ uri: BENTO_PHOTOS.car }}
                  style={styles.bentoPhotoImg}
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>

            {/* Right Stacked Column: Warm Oat Beige + Crisp Apple White */}
            <View style={styles.bentoRightCol}>
              {/* Top Right: Electric Scooters (Warm Oat Beige + Real Scooter Photo) */}
              <TouchableOpacity
                style={[
                  styles.bentoSmallCard,
                  { backgroundColor: theme.beigeSoft, borderColor: theme.beigeBorder }
                ]}
                activeOpacity={0.92}
                onPress={() => setSelectedCategory('MOTORBIKE')}
              >
                <View style={styles.bentoSmallTextCol}>
                  <Text style={styles.bentoSmallTitle}>Xe máy điện</Text>
                  <Text style={styles.bentoSmallSub}>Yamaha & Honda</Text>
                  <Text style={styles.bentoSmallPriceBeige}>Từ 22.000đ/h</Text>
                </View>
                <Image
                  source={{ uri: BENTO_PHOTOS.scooter }}
                  style={styles.bentoSmallPhoto}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              {/* Bottom Right: Doorstep Delivery (Pure White + Real Handover Photo) */}
              <TouchableOpacity
                style={styles.bentoSmallCardWhite}
                activeOpacity={0.92}
                onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
              >
                <View style={styles.bentoSmallTextCol}>
                  <Text style={styles.bentoSmallTitle}>Giao xe tận nơi</Text>
                  <Text style={styles.bentoSmallSub}>Bán kính 5km</Text>
                  <Text style={[styles.bentoSmallPriceMint, { color: theme.primary }]}>
                    Miễn phí giao
                  </Text>
                </View>
                <Image
                  source={{ uri: BENTO_PHOTOS.delivery }}
                  style={styles.bentoSmallPhoto}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ============================================================
            4. CLEAN LIGHT GLOSA TRAFFIC BAR (NO DARK CYBER DASHBOARD)
           ============================================================ */}
        <TouchableOpacity
          style={[
            styles.glosaLightCard,
            { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }
          ]}
          activeOpacity={0.9}
          onPress={onNavigateToMap}
        >
          <View style={styles.glosaLeftCol}>
            <View style={styles.glosaTitleRow}>
              <View style={[styles.liveDot, { backgroundColor: theme.primary }]} />
              <Text style={styles.glosaLightTitle}>
                Làn sóng xanh · Võ Oanh → Điện Biên Phủ
              </Text>
            </View>
            <Text style={styles.glosaLightSub}>
              {glosaAdvisory?.advisoryMessage ||
                'Đèn xanh còn 28s · Duy trì tốc độ ổn định để qua nút giao không dừng'}
            </Text>
          </View>

          <View style={styles.glosaWhiteSpeedPill}>
            <Text style={[styles.glosaSpeedValue, { color: theme.primary }]}>
              {glosaAdvisory ? glosaAdvisory.recommendedSpeedKmh : 45}
            </Text>
            <Text style={styles.glosaSpeedUnitText}>km/h</Text>
          </View>
        </TouchableOpacity>

        {/* ============================================================
            5. HORIZONTAL NEARBY VEHICLES ("Xe gần bạn")
           ============================================================ */}
        <View style={styles.showroomCarouselSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionMainTitle}>Xe gần bạn</Text>
            <TouchableOpacity onPress={onNavigateToMap}>
              <Text style={[styles.seeMapLink, { color: theme.primary }]}>Xem trên bản đồ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wideShowroomRow}
          >
            {filteredVehicles.map((veh, idx) => {
              const batteryPct = Math.round(veh.telematics?.batteryLevelPct || 92);
              const distMeters = 120 + idx * 140;

              return (
                <TouchableOpacity
                  key={veh.id}
                  style={styles.wideShowroomCard}
                  activeOpacity={0.92}
                  onPress={() => handleOpenBooking(veh)}
                >
                  <View style={styles.wideImgWrap}>
                    <Image source={{ uri: veh.thumbnail }} style={styles.wideImg} resizeMode="cover" />

                    {/* Single Clean Frosted Distance Pill */}
                    <View style={styles.frostedDistPill}>
                      <Text style={styles.frostedDistText}>Cách {distMeters}m</Text>
                    </View>
                  </View>

                  <View style={styles.wideCardBody}>
                    <Text style={styles.wideVehName} numberOfLines={1}>
                      {veh.name}
                    </Text>
                    <Text style={styles.wideVehMeta}>
                      Pin {batteryPct}% · {veh.seats} chỗ · {veh.plateNumber}
                    </Text>

                    <View style={styles.wideCardFooter}>
                      <Text style={styles.widePriceMain}>
                        {veh.hourlyPrice.toLocaleString('vi-VN')}đ
                        <Text style={styles.widePriceUnit}> / giờ</Text>
                      </Text>

                      <View style={styles.ratingInline}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingInlineText}>{veh.rating}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ============================================================
            6. FULL FLEET LIST WITH APPLE CHARCOAL FILTER PILLS
           ============================================================ */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeaderRow}>
            <Text style={styles.sectionMainTitle}>Danh mục xe sẵn sàng</Text>
            <View style={styles.catFilterRow}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catPill,
                      active && { backgroundColor: '#1D1D1F', borderColor: '#1D1D1F' }
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
            <ActivityIndicator size="large" color="#1D1D1F" style={{ marginVertical: 28 }} />
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
              <Ionicons name="arrow-back" size={22} color="#1D1D1F" />
            </TouchableOpacity>
            <Text style={styles.currentLocTitle} numberOfLines={1}>
              Chọn điểm nhận & trả xe
            </Text>
          </View>

          <View style={styles.destInputRow}>
            <View style={styles.destInputWrap}>
              <Ionicons name="search-outline" size={18} color="#8E8E93" />
              <TextInput
                style={styles.destTextInput}
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Tìm trạm hoặc địa chỉ..."
                placeholderTextColor="#8E8E93"
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
                  <Text style={styles.placeDistText}>{place.distance}</Text>
                </View>

                <View style={styles.placeCenterCol}>
                  <Text style={styles.placeNameText}>{place.name}</Text>
                  <Text style={styles.placeAddrText} numberOfLines={2}>
                    {place.address}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    backgroundColor: '#F7F7F5'
  },
  scrollContent: {
    paddingBottom: 30
  },

  /* ============================================================
     1. APPLE WHITE EDITORIAL HEADER
     ============================================================ */
  topHeaderSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBECE8'
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  userGreetingLeft: {
    flex: 1
  },
  greetingSub: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6E6E73',
    fontWeight: '500'
  },
  greetingTitle: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.4,
    marginTop: 2
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },

  /* ============================================================
     2. MINIMAL BOOKING & SEARCH CARD
     ============================================================ */
  smartBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBECE8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2
  },
  packageTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F1',
    padding: 4,
    borderRadius: 12,
    marginBottom: 14
  },
  pkgTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9
  },
  pkgTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1
  },
  pkgTabText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: '#6E6E73'
  },
  pkgTabTextActive: {
    color: '#1D1D1F',
    fontWeight: '600'
  },
  stationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 10
  },
  mintDotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mintDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  stationLabelSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8E8E93'
  },
  stationSelectedName: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 1
  },
  changeHubLink: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600'
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F2F2F0',
    marginVertical: 12
  },
  timeColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  timeCol: {
    flex: 1
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EBECE8',
    marginHorizontal: 14
  },
  timeColLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8E8E93'
  },
  timeColValue: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 2
  },
  quickSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F3',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    gap: 8
  },
  quickSearchInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#1D1D1F'
  },

  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    gap: 10
  },
  toastTitle: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  toastMsg: {
    fontFamily: FONTS.family,
    color: '#D1D1D6',
    fontSize: 12,
    marginTop: 1
  },

  /* ============================================================
     3. BENTO GRID WITH REAL STUDIO VEHICLE PHOTOGRAPHY
     ============================================================ */
  bentoSection: {
    paddingHorizontal: 16,
    marginTop: 16
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10
  },
  bentoTallCard: {
    flex: 1.05,
    height: 204,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    justifyContent: 'space-between',
    overflow: 'hidden'
  },
  bentoTallTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.2
  },
  bentoTallSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
  },
  bentoTallPrice: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4
  },
  bentoTallPhotoWrap: {
    width: '100%',
    height: 98,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF'
  },
  bentoPhotoImg: {
    width: '100%',
    height: '100%'
  },
  bentoRightCol: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10
  },
  bentoSmallCard: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    overflow: 'hidden'
  },
  bentoSmallCardWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EBECE8',
    overflow: 'hidden'
  },
  bentoSmallTextCol: {
    flex: 1,
    paddingRight: 8
  },
  bentoSmallTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  bentoSmallSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 2
  },
  bentoSmallPriceBeige: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#8C6239',
    marginTop: 4
  },
  bentoSmallPriceMint: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4
  },
  bentoSmallPhoto: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F2F2F0'
  },

  /* ============================================================
     4. CLEAN LIGHT GLOSA TRAFFIC BAR
     ============================================================ */
  glosaLightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 12
  },
  glosaLeftCol: {
    flex: 1
  },
  glosaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  glosaLightTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  glosaLightSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 3,
    lineHeight: 16
  },
  glosaWhiteSpeedPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 62
  },
  glosaSpeedValue: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20
  },
  glosaSpeedUnitText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6E6E73',
    fontWeight: '500'
  },

  /* ============================================================
     5. HORIZONTAL NEARBY VEHICLES
     ============================================================ */
  showroomCarouselSection: {
    marginTop: 22
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  sectionMainTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.3
  },
  seeMapLink: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600'
  },
  wideShowroomRow: {
    paddingHorizontal: 16,
    gap: 12
  },
  wideShowroomCard: {
    width: 248,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  wideImgWrap: {
    width: '100%',
    height: 142,
    backgroundColor: '#F2F2F0',
    position: 'relative'
  },
  wideImg: {
    width: '100%',
    height: '100%'
  },
  frostedDistPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99
  },
  frostedDistText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  wideCardBody: {
    padding: 12
  },
  wideVehName: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  wideVehMeta: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 3
  },
  wideCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F0'
  },
  widePriceMain: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  widePriceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6E6E73'
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  ratingInlineText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F'
  },

  /* ============================================================
     6. FULL FLEET CATALOG
     ============================================================ */
  catalogSection: {
    marginTop: 24
  },
  catalogHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10
  },
  catFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  catPillText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: '#6E6E73'
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600'
  },

  /* ============================================================
     MODAL STYLES
     ============================================================ */
  destModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 14
  },
  destHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10
  },
  destBackBtn: {
    padding: 4
  },
  currentLocTitle: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  destInputRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBECE8'
  },
  destInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8
  },
  destTextInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 14,
    color: '#1D1D1F'
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
    borderBottomColor: '#F2F2F0',
    gap: 12
  },
  placeLeftCol: {
    alignItems: 'center',
    width: 48
  },
  placeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeDistText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6E6E73',
    marginTop: 4,
    fontWeight: '600'
  },
  placeCenterCol: {
    flex: 1
  },
  placeNameText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  placeAddrText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
  }
});
