import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
      const [vehRes, glosaRes] = await Promise.all([
        ApiService.getVehicles(selectedCategory),
        ApiService.getGreenWaveAdvisory(300, 42)
      ]);
      setVehicles(vehRes.vehicles || []);
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
            1. COMPACT APPLE WHITE HEADER & QUICK BOOKING BOX
           ============================================================ */}
        <View style={styles.topHeaderSection}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.userGreetingLeft}
              activeOpacity={0.85}
              onPress={onNavigateToProfile}
            >
              <Text style={styles.greetingSub}>Chào Minh Tài · GPLX B2</Text>
              <Text style={styles.greetingTitle}>Bạn cần thuê xe ở đâu?</Text>
            </TouchableOpacity>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.headerCircleBtn}
                activeOpacity={0.85}
                onPress={onOpenRewards}
              >
                <Ionicons name="pricetag-outline" size={16} color="#1D1D1F" />
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

          {/* Compact Booking Widget */}
          <View style={styles.smartBookingCard}>
            {/* 2-Tab Mode Switcher */}
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

            {/* Combined Station & Time Row (Compact, Easy to Tap) */}
            <TouchableOpacity
              style={styles.stationSelectorRow}
              activeOpacity={0.85}
              onPress={() => setShowDestinationModal(true)}
            >
              <View style={[styles.mintDotOuter, { backgroundColor: theme.primarySoft }]}>
                <View style={[styles.mintDotInner, { backgroundColor: theme.primary }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stationSelectedName} numberOfLines={1}>
                  {selectedPlace ? selectedPlace.name : 'ĐH Giao Thông Vận Tải (UTH)'}
                </Text>
                <Text style={styles.stationTimeSub} numberOfLines={1}>
                  {rentalPackageTab === 'DAILY'
                    ? 'Nhận 15:30 hôm nay → 15:30 ngày mai (24h)'
                    : 'Nhận 15:30 hôm nay → 19:30 hôm nay (4h)'}
                </Text>
              </View>
              <View style={[styles.changeHubPill, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.changeHubLink, { color: theme.primary }]}>Đổi trạm</Text>
              </View>
            </TouchableOpacity>

            {/* Quick Search Input */}
            <View style={styles.quickSearchBox}>
              <Ionicons name="search-outline" size={16} color="#8E8E93" />
              <TextInput
                style={styles.quickSearchInput}
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Tìm dòng xe (Ioniq 5, CX-5, Corolla Cross...)"
                placeholderTextColor="#8E8E93"
              />
              {destinationQuery.length > 0 && (
                <TouchableOpacity onPress={() => setDestinationQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#8E8E93" />
                </TouchableOpacity>
              )}
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
            2. SPACIOUS 2x2 QUICK FEATURE GRID (NO CRAMPED PHOTOS/TEXT)
           ============================================================ */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresGrid}>
            {/* Tile 1: Self-Drive Cars */}
            <TouchableOpacity
              style={[
                styles.featureTile,
                { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }
              ]}
              activeOpacity={0.88}
              onPress={() => setSelectedCategory('CAR')}
            >
              <View style={[styles.featureIconBox, { backgroundColor: '#FFFFFF' }]}>
                <Ionicons name="car-sport-outline" size={20} color={theme.primary} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle} numberOfLines={1}>
                  Ô tô tự lái
                </Text>
                <Text style={[styles.featureSub, { color: theme.primary }]} numberOfLines={1}>
                  Từ 85.000đ/giờ
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tile 2: Electric Scooters */}
            <TouchableOpacity
              style={[
                styles.featureTile,
                { backgroundColor: theme.beigeSoft, borderColor: theme.beigeBorder }
              ]}
              activeOpacity={0.88}
              onPress={() => setSelectedCategory('MOTORBIKE')}
            >
              <View style={[styles.featureIconBox, { backgroundColor: '#FFFFFF' }]}>
                <Ionicons name="bicycle-outline" size={20} color="#8C6239" />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle} numberOfLines={1}>
                  Xe máy điện
                </Text>
                <Text style={[styles.featureSub, { color: '#8C6239' }]} numberOfLines={1}>
                  Từ 22.000đ/giờ
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tile 3: Doorstep Delivery */}
            <TouchableOpacity
              style={styles.featureTileWhite}
              activeOpacity={0.88}
              onPress={() => vehicles[0] && handleOpenBooking(vehicles[0])}
            >
              <View style={[styles.featureIconBox, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="navigate-outline" size={19} color={theme.primary} />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle} numberOfLines={1}>
                  Giao xe tận nơi
                </Text>
                <Text style={styles.featureSubMuted} numberOfLines={1}>
                  Miễn phí 5km
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tile 4: Green Wave GLOSA Advisory */}
            <TouchableOpacity
              style={styles.featureTileWhite}
              activeOpacity={0.88}
              onPress={onNavigateToMap}
            >
              <View style={[styles.featureIconBox, { backgroundColor: theme.beigeSoft }]}>
                <Ionicons name="speedometer-outline" size={19} color="#8C6239" />
              </View>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle} numberOfLines={1}>
                  Làn sóng xanh
                </Text>
                <Text style={[styles.featureSub, { color: theme.primary }]} numberOfLines={1}>
                  {glosaAdvisory ? `${glosaAdvisory.recommendedSpeedKmh} km/h · Đèn 28s` : '45 km/h · Đèn 28s'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================
            3. UNIFIED VEHICLE LIST (EASY TO SCAN, NO DUPLICATED PHOTOS)
           ============================================================ */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeaderRow}>
            <Text style={styles.sectionMainTitle}>
              Xe sẵn sàng gần bạn ({filteredVehicles.length})
            </Text>
            <TouchableOpacity onPress={onNavigateToMap}>
              <Text style={[styles.seeMapLink, { color: theme.primary }]}>Xem bản đồ</Text>
            </TouchableOpacity>
          </View>

          {/* Clean Category Filter Pills */}
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

        <View style={{ height: 96 }} />
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
    paddingBottom: 24
  },

  /* ============================================================
     1. COMPACT APPLE WHITE HEADER & BOOKING BOX
     ============================================================ */
  topHeaderSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBECE8'
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  userGreetingLeft: {
    flex: 1
  },
  greetingSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '500'
  },
  greetingTitle: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.3,
    marginTop: 1
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },

  smartBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  packageTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F1',
    padding: 3,
    borderRadius: 11,
    marginBottom: 10
  },
  pkgTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8
  },
  pkgTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  pkgTabText: {
    fontFamily: FONTS.family,
    fontSize: 12,
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
    paddingVertical: 6,
    gap: 10,
    marginBottom: 8
  },
  mintDotOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mintDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  stationSelectedName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  stationTimeSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 2
  },
  changeHubPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99
  },
  changeHubLink: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700'
  },
  quickSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F3',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    gap: 8
  },
  quickSearchInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#1D1D1F'
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
    fontWeight: '600'
  },
  toastMsg: {
    fontFamily: FONTS.family,
    color: '#D1D1D6',
    fontSize: 12,
    marginTop: 1
  },

  /* ============================================================
     2. SPACIOUS 2x2 QUICK FEATURE TILES (ZERO TEXT WRAPPING)
     ============================================================ */
  featuresSection: {
    paddingHorizontal: 16,
    marginTop: 12
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8
  },
  featureTile: {
    width: '48.8%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10
  },
  featureTileWhite: {
    width: '48.8%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBECE8',
    gap: 10
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureTextCol: {
    flex: 1
  },
  featureTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  featureSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1
  },
  featureSubMuted: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
    marginTop: 1
  },

  /* ============================================================
     3. UNIFIED VEHICLE CATALOG
     ============================================================ */
  catalogSection: {
    marginTop: 16
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10
  },
  sectionMainTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.2
  },
  seeMapLink: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600'
  },
  catFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  catPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
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
