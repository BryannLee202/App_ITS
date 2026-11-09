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
import { FONTS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import GreenSM3DIcons from '../components/GreenSM3DIcons';
import ApiService from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả xe' },
  { id: 'CAR', label: 'Ô tô tự lái' },
  { id: 'MOTORBIKE', label: 'Xe máy điện' }
];

const SAVED_PLACES = [
  {
    id: 'place-1',
    name: 'Ga Quốc Nội (Ga T3) - Sân Bay Quốc Tế Tân Sơn Nhất',
    address: 'Phường Tân Sơn, Thành phố Hồ Chí Minh, VNM',
    distance: '13,6 km',
    icon: 'airplane-outline'
  },
  {
    id: 'place-2',
    name: 'EcoGo Mobility Hub - ĐH Giao Thông Vận Tải (UTH)',
    address: 'Số 2 Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM',
    distance: '0,6 km',
    icon: 'school-outline'
  },
  {
    id: 'place-3',
    name: 'Ga Trung Tâm Metro Bến Thành',
    address: 'Đường Trần Hưng Đạo, Phường Bến Thành, Quận 1, TP.HCM',
    distance: '8,8 km',
    icon: 'train-outline'
  },
  {
    id: 'place-4',
    name: 'Saigon Centre & Takashimaya',
    address: '65 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
    distance: '8,2 km',
    icon: 'time-outline'
  },
  {
    id: 'place-5',
    name: 'Khu Đô Thị Tân Cảng & Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM',
    distance: '1,4 km',
    icon: 'time-outline'
  }
];

export default function HomeScreen({
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
  const [glosaAdvisory, setGlosaAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(SAVED_PLACES[1]);
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
      message: `Xe ${bookingVehicle?.name} (${bookingVehicle?.plateNumber}) đã mở khóa Digital Key.`
    });
    loadInitialData();
    setTimeout(() => {
      setBookingToast(null);
      if (onNavigateToKey) onNavigateToKey();
    }, 1400);
  };

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
            tintColor="#18B6B4"
          />
        }
      >
        {/* ============================================================
            1. TOP 3D MAP BACKDROP & FLOATING SEARCH PILL (GREEN SM 18:56)
           ============================================================ */}
        <View style={styles.topMapBackdrop}>
          {/* Subtle 3D Urban Road Grid Pattern */}
          <View style={styles.roadLineDiagonal1} />
          <View style={styles.roadLineDiagonal2} />
          <View style={styles.buildingBlock1} />
          <View style={styles.buildingBlock2} />

          {/* Floating White Pill Search Bar */}
          <TouchableOpacity
            style={styles.floatingSearchPill}
            activeOpacity={0.92}
            onPress={() => setShowDestinationModal(true)}
          >
            <Ionicons name="search-outline" size={22} color="#1A1D1F" />
            <Text style={styles.searchPlaceholderText} numberOfLines={1}>
              {destinationQuery ? destinationQuery : 'Bạn muốn đi đâu, thuê xe gì?'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Booking Toast */}
        {bookingToast && (
          <View style={styles.toastBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{bookingToast.title}</Text>
              <Text style={styles.toastMsg}>{bookingToast.message}</Text>
            </View>
          </View>
        )}

        {/* ============================================================
            2. SPARKLE RECOMMENDATION CAROUSEL (EXACT GREEN SM CARD STYLE)
           ============================================================ */}
        <View style={styles.sparkleSection}>
          <View style={styles.sparkleHeaderRow}>
            <Text style={styles.sparkleHeadline}>
              ✦ Cần xe ngay? Đội xe điện gần đây đang chờ bạn.
            </Text>
            <TouchableOpacity onPress={onNavigateToMap}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#6F767E" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoCardsRow}
          >
            {vehicles.map((veh, idx) => {
              const priceK = `${Math.round(veh.hourlyPrice / 1000)}K`;
              const oldPriceK = `${Math.round((veh.hourlyPrice * 1.25) / 1000)}K`;
              const distKm = (0.4 + idx * 0.3).toFixed(1);
              return (
                <TouchableOpacity
                  key={veh.id}
                  style={styles.promoSquareWrap}
                  activeOpacity={0.9}
                  onPress={() => handleOpenBooking(veh)}
                >
                  <View style={[styles.promoImageSquare, idx === 0 && styles.promoImageRedBorder]}>
                    <Image source={{ uri: veh.thumbnail }} style={styles.promoImg} resizeMode="cover" />

                    {/* Top Left Promo Price Tag */}
                    <View style={styles.promoPriceOverlay}>
                      <Text style={styles.promoBigPrice}>{priceK}</Text>
                      <Text style={styles.promoOldPrice}>{oldPriceK}</Text>
                    </View>

                    {/* Bottom Left Frosted Star Rating Pill */}
                    <View style={styles.starOverlayPill}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.starOverlayText}>{veh.rating}</Text>
                    </View>
                  </View>

                  {/* Verified Checkmark + Title + Distance */}
                  <View style={styles.promoTitleLine}>
                    <Ionicons name="checkmark-circle" size={14} color="#2E7D5B" style={{ marginTop: 2 }} />
                    <Text style={styles.promoItemTitle} numberOfLines={2}>
                      {veh.name} - {veh.plateNumber}
                    </Text>
                  </View>
                  <View style={styles.promoDistLine}>
                    <Ionicons name="navigate-outline" size={11} color="#6F767E" />
                    <Text style={styles.promoDistText}>{distKm} km • Pin {Math.round(veh.telematics?.batteryLevelPct || 90)}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 2 White Pill Action Buttons ("Đặt thuê ngay" | "Xem ưu đãi") */}
          <View style={styles.dualActionPillsRow}>
            <TouchableOpacity
              style={styles.whiteActionPill}
              onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
            >
              <Text style={styles.whiteActionPillText}>Đặt thuê ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whiteActionPill}
              onPress={onOpenRewards}
            >
              <Text style={styles.whiteActionPillText}>Xem ưu đãi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================
            3. TWO BIG SOFT-GRADIENT HERO CARDS ("Đặt xe" & "Thuê tự lái")
           ============================================================ */}
        <View style={styles.bigHeroRow}>
          {/* Left Hero: Soft Cyan-Aqua Tint + 3D Cyan EV Car */}
          <TouchableOpacity
            style={[styles.bigHeroCard, styles.bigHeroAqua]}
            activeOpacity={0.9}
            onPress={() => setSelectedCategory('CAR')}
          >
            <View style={styles.aquaInnerGlow} />
            <Text style={styles.bigHeroTitle}>Đặt xe tự lái</Text>
            <Text style={styles.bigHeroSub}>Mở khóa BLE 24/7</Text>
            <View style={styles.bigHeroIllustrationRight}>
              <GreenSM3DIcons type="CAR_CYAN_3D" />
            </View>
          </TouchableOpacity>

          {/* Right Hero: Soft Warm Cream Tint + 3D Scooter & Key */}
          <TouchableOpacity
            style={[styles.bigHeroCard, styles.bigHeroCream]}
            activeOpacity={0.9}
            onPress={() => setSelectedCategory('MOTORBIKE')}
          >
            <View style={styles.creamInnerGlow} />
            <Text style={styles.bigHeroTitle}>Thuê theo giờ</Text>
            <Text style={styles.bigHeroSub}>Chỉ từ 22.000đ/h</Text>
            <View style={styles.bigHeroIllustrationRight}>
              <View style={styles.comboRightIcons}>
                <GreenSM3DIcons type="SCOOTER_3D" />
                <View style={{ marginLeft: -10, marginTop: 10 }}>
                  <GreenSM3DIcons type="SMARTKEY_3D" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ============================================================
            4. "DỊCH VỤ KHÁC" - 8 WHITE SQUIRCLES WITH 3D ISOMETRIC ICONS
           ============================================================ */}
        <View style={styles.otherServicesSection}>
          <View style={styles.otherServicesHeader}>
            <Text style={styles.otherServicesTitle}>Dịch vụ khác</Text>
            <TouchableOpacity onPress={onNavigateToMap}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid8Container}>
            {/* Row 1 */}
            <TouchableOpacity
              style={styles.gridTileCard}
              activeOpacity={0.85}
              onPress={() => setSelectedCategory('MOTORBIKE')}
            >
              <GreenSM3DIcons type="SCOOTER_3D" />
              <Text style={styles.gridTileLabel}>Xe máy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridTileCard}
              activeOpacity={0.85}
              onPress={onNavigateToMap}
            >
              <View style={styles.badgeYellowFloating}>
                <Text style={styles.badgeYellowText}>-20%</Text>
              </View>
              <GreenSM3DIcons type="INTERCITY_MAP_3D" />
              <Text style={styles.gridTileLabel}>Liên tỉnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridTileCard}
              activeOpacity={0.85}
              onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
            >
              <GreenSM3DIcons type="DELIVERY_BOX_3D" />
              <Text style={styles.gridTileLabel}>Giao xe tận nơi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridTileCard}
              activeOpacity={0.85}
              onPress={onOpenGreenRace}
            >
              <View style={styles.badgeYellowFloating}>
                <Text style={styles.badgeYellowText}>MỚI</Text>
              </View>
              <GreenSM3DIcons type="MEMBER_DIAMOND_3D" />
              <Text style={styles.gridTileLabel}>Hội viên</Text>
            </TouchableOpacity>

            {/* Row 2 */}
            <TouchableOpacity
              style={styles.gridTileCard}
              activeOpacity={0.85}
              onPress={onNavigateToKey}
            >
              <GreenSM3DIcons type="SMARTKEY_3D" />
              <Text style={styles.gridTileLabel}>Thuê xe tự lái</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridTileCard}
              activeOpacity={0.85}
              onPress={onNavigateToMap}
            >
              <GreenSM3DIcons type="VINBUS_3D" />
              <Text style={styles.gridTileLabel}>Buýt & Metro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridTileCard}
              activeOpacity={0.85}
              onPress={() => setSelectedCategory('CAR')}
            >
              <GreenSM3DIcons type="SHOWROOM_3D" />
              <Text style={styles.gridTileLabel}>Thuê xe{'\n'}dài hạn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridTileCard}
              activeOpacity={0.85}
              onPress={onOpenRewards}
            >
              <GreenSM3DIcons type="GIFTCARD_3D" />
              <Text style={styles.gridTileLabel}>Thẻ quà tặng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================
            5. ECOGO SMART FLEET PROMOTIONAL BANNER + FULL FLEET CATALOG
           ============================================================ */}
        <TouchableOpacity
          style={styles.vf8BannerCard}
          activeOpacity={0.92}
          onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.vf8BannerTag}>ECOGO SMART • ĐỘI XE ĐỜI MỚI</Text>
            <Text style={styles.vf8BannerTitle}>HYUNDAI IONIQ 5 & TOYOTA HEV</Text>
            <Text style={styles.vf8BannerSub}>
              Làn sóng xanh GLOSA {glosaAdvisory ? `${glosaAdvisory.recommendedSpeedKmh} km/h` : '45 km/h'} • Mở khóa BLE
            </Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80' }}
            style={styles.vf8BannerImg}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Category Filter & Full Vehicle List */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeaderRow}>
            <Text style={styles.otherServicesTitle}>Đội xe tự lái sẵn sàng ({vehicles.length})</Text>
            <View style={styles.catFilterRow}>
              {CATEGORIES.map(cat => {
                const active = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catPill, active && styles.catPillActive]}
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
            <ActivityIndicator size="large" color="#2E7D5B" style={{ marginVertical: 28 }} />
          ) : (
            vehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSelect={handleOpenBooking}
                onBook={handleOpenBooking}
              />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ============================================================
          MODAL 1: EXACT GREEN SM DESTINATION SEARCH ("Bạn muốn đi đâu?")
         ============================================================ */}
      <Modal
        visible={showDestinationModal}
        animationType="slide"
        onRequestClose={() => setShowDestinationModal(false)}
      >
        <View style={styles.destModalContainer}>
          {/* Top Current Location Row */}
          <View style={styles.destHeaderBar}>
            <TouchableOpacity
              style={styles.destBackBtn}
              onPress={() => setShowDestinationModal(false)}
            >
              <Ionicons name="arrow-back" size={22} color="#1A1D1F" />
            </TouchableOpacity>

            <View style={styles.currentLocDotOuter}>
              <View style={styles.currentLocDotInner} />
            </View>
            <Text style={styles.currentLocTitle} numberOfLines={1}>
              {selectedPlace ? selectedPlace.name : 'Sử dụng vị trí hiện tại'}
            </Text>

            <View style={styles.vnFlagBox}>
              <View style={styles.vnFlagRed}>
                <Ionicons name="star" size={9} color="#FACC15" />
              </View>
              <Text style={styles.vnCitySub}>Hồ Chí...</Text>
            </View>
          </View>

          {/* Cyan-Bordered Destination Input + Plus Button */}
          <View style={styles.destInputRow}>
            <View style={styles.destInputWrap}>
              <View style={styles.yellowSquareStop}>
                <View style={styles.yellowSquareInner} />
              </View>
              <TextInput
                style={styles.destTextInput}
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Bạn muốn đi đâu?"
                placeholderTextColor="#6F767E"
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.cyanPlusBtn}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Saved & Suggested Places List */}
          <ScrollView style={styles.placesScroll}>
            {SAVED_PLACES.filter(
              p =>
                !destinationQuery.trim() ||
                p.name.toLowerCase().includes(destinationQuery.toLowerCase()) ||
                p.address.toLowerCase().includes(destinationQuery.toLowerCase())
            ).map(place => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeItemRow}
                onPress={() => {
                  setSelectedPlace(place);
                  setDestinationQuery(place.name);
                  setShowDestinationModal(false);
                }}
              >
                <View style={styles.placeLeftCol}>
                  <View style={styles.placeIconCircle}>
                    <Ionicons name={place.icon} size={16} color="#6F767E" />
                  </View>
                  <Text style={styles.placeDistText}>{place.distance}</Text>
                </View>

                <View style={styles.placeCenterCol}>
                  <Text style={styles.placeNameText}>{place.name}</Text>
                  <Text style={styles.placeAddrText} numberOfLines={2}>{place.address}</Text>
                </View>

                <View style={styles.placeRightCol}>
                  <Ionicons name="heart-outline" size={18} color="#6F767E" />
                  <Ionicons name="ellipsis-vertical" size={16} color="#9A9FA5" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bottom Floating Pills ("❤️ Địa chỉ đã lưu" | "🗺️ Tìm trên bản đồ") */}
          <View style={styles.destBottomPillsBar}>
            <TouchableOpacity
              style={styles.destBottomPill}
              onPress={() => setShowDestinationModal(false)}
            >
              <Ionicons name="heart" size={16} color="#EF4444" />
              <Text style={styles.destBottomPillText}>Địa chỉ đã lưu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.destBottomPill}
              onPress={() => {
                setShowDestinationModal(false);
                if (onNavigateToMap) onNavigateToMap();
              }}
            >
              <Ionicons name="map-outline" size={16} color="#1A1D1F" />
              <Text style={styles.destBottomPillText}>Tìm trên bản đồ</Text>
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
    backgroundColor: '#F4F7F5'
  },
  scrollContent: {
    paddingBottom: 30
  },
  topMapBackdrop: {
    backgroundColor: '#DDE7E1',
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden'
  },
  roadLineDiagonal1: {
    position: 'absolute',
    top: -20,
    left: 40,
    width: 14,
    height: 180,
    backgroundColor: '#EFF4F1',
    transform: [{ rotate: '35deg' }],
    opacity: 0.75
  },
  roadLineDiagonal2: {
    position: 'absolute',
    top: -10,
    right: 60,
    width: 10,
    height: 180,
    backgroundColor: '#EFF4F1',
    transform: [{ rotate: '-28deg' }],
    opacity: 0.75
  },
  buildingBlock1: {
    position: 'absolute',
    top: 8,
    left: 110,
    width: 65,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#C8D6CE',
    opacity: 0.5,
    transform: [{ rotate: '15deg' }]
  },
  buildingBlock2: {
    position: 'absolute',
    top: 12,
    right: 24,
    width: 80,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#C8D6CE',
    opacity: 0.5,
    transform: [{ rotate: '-12deg' }]
  },
  floatingSearchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 99,
    paddingHorizontal: 18,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  searchPlaceholderText: {
    fontFamily: FONTS.family,
    fontSize: 15,
    color: '#5C6B63',
    fontWeight: '500',
    flex: 1
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D5B',
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
    color: '#EAF6F0',
    fontSize: 11,
    marginTop: 1
  },
  sparkleSection: {
    backgroundColor: '#EAEFE9',
    paddingTop: 14,
    paddingBottom: 16
  },
  sparkleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  sparkleHeadline: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F',
    flex: 1,
    marginRight: 10,
    lineHeight: 22
  },
  promoCardsRow: {
    paddingHorizontal: 16,
    gap: 12
  },
  promoSquareWrap: {
    width: 128
  },
  promoImageSquare: {
    width: 128,
    height: 128,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    marginBottom: 8
  },
  promoImageRedBorder: {
    borderWidth: 2,
    borderColor: '#EF4444'
  },
  promoImg: {
    width: '100%',
    height: '100%'
  },
  promoPriceOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3
  },
  promoBigPrice: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  promoOldPrice: {
    fontFamily: FONTS.family,
    color: '#FEE2E2',
    fontSize: 9,
    textDecorationLine: 'line-through'
  },
  starOverlayPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 29, 31, 0.68)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 3
  },
  starOverlayText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  promoTitleLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4
  },
  promoItemTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F',
    flex: 1,
    lineHeight: 17
  },
  promoDistLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  promoDistText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F767E'
  },
  dualActionPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10
  },
  whiteActionPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  whiteActionPillText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F'
  },
  bigHeroRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 12
  },
  bigHeroCard: {
    flex: 1,
    height: 116,
    borderRadius: 20,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  bigHeroAqua: {
    backgroundColor: '#EAF6F0'
  },
  bigHeroCream: {
    backgroundColor: '#FDF6EC'
  },
  aquaInnerGlow: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#A7F3D0',
    opacity: 0.45
  },
  creamInnerGlow: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FDE68A',
    opacity: 0.4
  },
  bigHeroTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  bigHeroSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#52606D',
    marginTop: 2,
    fontWeight: '500'
  },
  bigHeroIllustrationRight: {
    position: 'absolute',
    bottom: 2,
    right: 4
  },
  comboRightIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  otherServicesSection: {
    paddingHorizontal: 16,
    marginTop: 20
  },
  otherServicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  otherServicesTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  seeAllText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F'
  },
  grid8Container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12
  },
  gridTileCard: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  badgeYellowFloating: {
    position: 'absolute',
    top: -6,
    right: 2,
    backgroundColor: '#FEF08A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  badgeYellowText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  gridTileLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: '#1A1D1F',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14
  },
  vf8BannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6F0',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#B7E4CE'
  },
  vf8BannerTag: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D5B'
  },
  vf8BannerTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#14532D',
    marginTop: 2
  },
  vf8BannerSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#1E563F',
    marginTop: 2
  },
  vf8BannerImg: {
    width: 110,
    height: 64,
    borderRadius: 12,
    marginLeft: 10
  },
  catalogSection: {
    marginTop: 20
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
  catPillActive: {
    backgroundColor: '#2E7D5B',
    borderColor: '#2E7D5B'
  },
  catPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  catPillTextActive: {
    color: '#FFFFFF'
  },
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
    backgroundColor: '#1A1D1F',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D1F'
  },
  vnFlagBox: {
    alignItems: 'center'
  },
  vnFlagRed: {
    width: 26,
    height: 18,
    borderRadius: 3,
    backgroundColor: '#DA251D',
    alignItems: 'center',
    justifyContent: 'center'
  },
  vnCitySub: {
    fontSize: 9,
    color: '#6F767E',
    marginTop: 2
  },
  destInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14
  },
  destInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2E7D5B',
    paddingHorizontal: 12,
    gap: 10,
    backgroundColor: '#FFFFFF'
  },
  yellowSquareStop: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  yellowSquareInner: {
    width: 6,
    height: 6,
    backgroundColor: '#FFFFFF'
  },
  destTextInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 14,
    color: '#1A1D1F'
  },
  cyanPlusBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2E7D5B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placesScroll: {
    flex: 1,
    paddingHorizontal: 16
  },
  placeItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12
  },
  placeLeftCol: {
    alignItems: 'center',
    width: 46
  },
  placeIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeDistText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#1A1D1F',
    marginTop: 4,
    fontWeight: '500'
  },
  placeCenterCol: {
    flex: 1
  },
  placeNameText: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1D1F',
    lineHeight: 20
  },
  placeAddrText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6F767E',
    marginTop: 3,
    lineHeight: 18
  },
  placeRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4
  },
  destBottomPillsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF'
  },
  destBottomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6
  },
  destBottomPillText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F'
  }
});
