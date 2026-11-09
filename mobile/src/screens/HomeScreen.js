import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import ApiService from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả xe' },
  { id: 'CAR', label: 'Ô tô điện' },
  { id: 'MOTORBIKE', label: 'Xe máy điện' }
];

export default function HomeScreen({
  onSelectVehicle,
  onNavigateToKey,
  onNavigateToMap,
  onNavigateToTrips,
  onNavigateToProfile,
  onOpenRewards
}) {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState(null);
  const [rentalPackageMode, setRentalPackageMode] = useState('HOURLY'); // 'HOURLY' | 'DAILY'
  const [searchQuery, setSearchQuery] = useState('');
  const [glosaAdvisory, setGlosaAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      const stationList = stRes.stations || [];
      setStations(stationList);
      if (!selectedStation && stationList.length > 0) {
        setSelectedStation(stationList[0]);
      }
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
      message: `Chìa khóa số của ${bookingVehicle?.name} (${bookingVehicle?.plateNumber}) đã sẵn sàng.`
    });
    loadInitialData();
    setTimeout(() => {
      setBookingToast(null);
      if (onNavigateToKey) onNavigateToKey();
    }, 1400);
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      !searchQuery.trim() ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
            tintColor="#111111"
          />
        }
      >
        {/* ============================================================
            1. NATURAL EDITORIAL HEADER (Apple / Uber Style)
           ============================================================ */}
        <View style={styles.headerContainer}>
          <View style={styles.topGreetingRow}>
            <View>
              <Text style={styles.greetingSub}>Chào Nguyễn Văn An · GPLX B2</Text>
              <Text style={styles.greetingHeadline}>Bạn cần thuê xe ở đâu?</Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.iconCircleBtn} onPress={onOpenRewards}>
                <Ionicons name="pricetag-outline" size={18} color="#111111" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarCircleBtn} onPress={onNavigateToProfile}>
                <Text style={styles.avatarInitials}>VA</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ============================================================
              2. CLEAN WHITE BOOKING WIDGET (Mioto / Turo Style)
             ============================================================ */}
          <View style={styles.bookingCard}>
            {/* Segmented Mode Selector */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentBtn, rentalPackageMode === 'HOURLY' && styles.segmentBtnActive]}
                onPress={() => setRentalPackageMode('HOURLY')}
              >
                <Text style={[styles.segmentText, rentalPackageMode === 'HOURLY' && styles.segmentTextActive]}>
                  Thuê theo giờ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, rentalPackageMode === 'DAILY' && styles.segmentBtnActive]}
                onPress={() => setRentalPackageMode('DAILY')}
              >
                <Text style={[styles.segmentText, rentalPackageMode === 'DAILY' && styles.segmentTextActive]}>
                  Thuê theo ngày (24h)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Location Picker Row */}
            <TouchableOpacity style={styles.fieldRow} onPress={onNavigateToMap}>
              <View style={styles.pinDotWrap}>
                <View style={styles.pinDotInner} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Điểm nhận & trả xe</Text>
                <Text style={styles.fieldValue} numberOfLines={1}>
                  {selectedStation
                    ? selectedStation.name.replace('ITS Mobility Hub - ', '')
                    : 'ĐH Giao thông Vận tải (UTH), Bình Thạnh'}
                </Text>
              </View>
              <Text style={styles.mapActionLink}>Bản đồ</Text>
            </TouchableOpacity>

            <View style={styles.fieldDivider} />

            {/* Time Window Row */}
            <View style={styles.timeColumnsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Nhận xe</Text>
                <Text style={styles.fieldValue}>Hôm nay, 15:30</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={{ flex: 1, paddingLeft: 14 }}>
                <Text style={styles.fieldLabel}>Trả xe</Text>
                <Text style={styles.fieldValue}>
                  {rentalPackageMode === 'HOURLY' ? 'Hôm nay, 19:30 (4h)' : 'Ngày mai, 15:30 (1 ngày)'}
                </Text>
              </View>
            </View>

            {/* Search Input Inside Booking Card */}
            <View style={styles.searchBarWrap}>
              <Ionicons name="search-outline" size={17} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Tìm theo tên xe (VF 8, VF 3, Ioniq 5, Klara S)..."
                placeholderTextColor="#8E8E93"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Booking Toast Notification */}
        {bookingToast && (
          <View style={styles.toastBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{bookingToast.title}</Text>
              <Text style={styles.toastMsg}>{bookingToast.message}</Text>
            </View>
          </View>
        )}

        {/* ============================================================
            3. CLEAN CATEGORY PILLS & VOUCHER STRIP
           ============================================================ */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
          >
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.filterPillSecondary} onPress={onNavigateToKey}>
              <View style={styles.liveGreenDot} />
              <Text style={styles.filterPillSecondaryText}>
                Làn sóng xanh: {glosaAdvisory ? `${glosaAdvisory.recommendedSpeedKmh} km/h` : '45 km/h'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterPillSecondary} onPress={onOpenRewards}>
              <Text style={styles.filterPillSecondaryText}>Mã ưu đãi -20%</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ============================================================
            4. HORIZONTAL QUICK UNLOCK ("Gần vị trí của bạn")
           ============================================================ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Xe gần bạn</Text>
          <TouchableOpacity onPress={onNavigateToMap}>
            <Text style={styles.sectionAction}>Xem trên bản đồ</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCardsRow}
        >
          {vehicles.slice(0, 5).map((veh, idx) => (
            <TouchableOpacity
              key={veh.id}
              style={styles.compactCard}
              activeOpacity={0.92}
              onPress={() => handleOpenBooking(veh)}
            >
              <View style={styles.compactImgContainer}>
                <Image source={{ uri: veh.thumbnail }} style={styles.compactImg} resizeMode="cover" />
                <View style={styles.compactDistanceBadge}>
                  <Text style={styles.compactDistanceText}>Cách {120 + idx * 50}m</Text>
                </View>
              </View>

              <View style={styles.compactInfo}>
                <Text style={styles.compactName} numberOfLines={1}>{veh.name}</Text>
                <Text style={styles.compactMeta}>
                  Pin {Math.round(veh.telematics?.batteryLevelPct || 90)}% · {veh.seats} chỗ
                </Text>
                <View style={styles.compactBottomRow}>
                  <Text style={styles.compactPrice}>
                    {veh.hourlyPrice.toLocaleString('vi-VN')}đ<Text style={styles.compactUnit}>/giờ</Text>
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#111111" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ============================================================
            5. MAIN EDITORIAL FLEET LIST
           ============================================================ */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>
            Đội xe sẵn sàng ({filteredVehicles.length})
          </Text>
          <Text style={styles.sectionSubNote}>Miễn cọc 100%</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#111111" style={{ marginVertical: 32 }} />
        ) : (
          filteredVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={handleOpenBooking}
              onBook={handleOpenBooking}
            />
          ))
        )}

        <View style={{ height: 28 }} />
      </ScrollView>

      {/* Multi-Step Booking & e-Contract Checkout Modal */}
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
    backgroundColor: '#F7F7F9'
  },
  scrollContent: {
    paddingBottom: 24
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBED'
  },
  topGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  greetingSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '500'
  },
  greetingHeadline: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.4,
    marginTop: 2
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  segmentText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: '#6E6E73'
  },
  segmentTextActive: {
    color: '#111111',
    fontWeight: '600'
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 12
  },
  pinDotWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pinDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488'
  },
  fieldLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500'
  },
  fieldValue: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginTop: 2
  },
  mapActionLink: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488'
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#F2F2F5',
    marginVertical: 12
  },
  timeColumnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F2F2F5'
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#111111'
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
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
  filterSection: {
    marginTop: 14,
    marginBottom: 6
  },
  pillsScroll: {
    paddingHorizontal: 16,
    gap: 8
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  filterPillActive: {
    backgroundColor: '#111111',
    borderColor: '#111111'
  },
  filterPillText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: '#111111'
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  filterPillSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 6
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D9488'
  },
  filterPillSecondaryText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: '#48484A'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 12
  },
  sectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3
  },
  sectionAction: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488'
  },
  sectionSubNote: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '500'
  },
  horizontalCardsRow: {
    paddingHorizontal: 16,
    gap: 12
  },
  compactCard: {
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBEBED'
  },
  compactImgContainer: {
    width: '100%',
    height: 118,
    backgroundColor: '#F6F5F2',
    position: 'relative'
  },
  compactImg: {
    width: '100%',
    height: '100%'
  },
  compactDistanceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99
  },
  compactDistanceText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#111111'
  },
  compactInfo: {
    padding: 12
  },
  compactName: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#111111'
  },
  compactMeta: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
  },
  compactBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F5'
  },
  compactPrice: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#111111'
  },
  compactUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6E6E73'
  }
});
