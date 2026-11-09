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
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import ApiService from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả xe', icon: 'apps' },
  { id: 'CAR', label: 'Ô tô điện', icon: 'car-sport' },
  { id: 'MOTORBIKE', label: 'Xe máy điện', icon: 'bicycle' }
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

  // Booking Modal State
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

  const handleBookingSuccess = (res) => {
    setShowBookingModal(false);
    setBookingToast({
      title: 'Ký Hợp Đồng & Mở Khóa Thành Công!',
      message: `Xe ${bookingVehicle?.name} (${bookingVehicle?.plateNumber}) đã kích hoạt Digital Key BLE 5.2.`
    });
    loadInitialData();
    setTimeout(() => {
      setBookingToast(null);
      if (onNavigateToKey) onNavigateToKey();
    }, 1500);
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
            tintColor="#10B981"
          />
        }
      >
        {/* ============================================================
            TIER 1: APPLE WHITE & MINT GREEN HEADER + BOOKING WIDGET
           ============================================================ */}
        <View style={styles.topHeaderSection}>
          <View style={styles.brandBarRow}>
            <View style={styles.brandBadgeGroup}>
              <View style={styles.mintBrandLogo}>
                <Ionicons name="car-sport" size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.brandTitle}>ITS GREEN MOBILITY</Text>
                <Text style={styles.brandSub}>Hệ thống Thuê Xe Tự Lái Thông Minh • UTH</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.ekycVerifiedBadge} onPress={onNavigateToProfile}>
              <Ionicons name="shield-checkmark" size={13} color="#059669" />
              <Text style={styles.ekycVerifiedText}>eKYC B2</Text>
            </TouchableOpacity>
          </View>

          {/* Mioto / Green SM Style Interactive Booking Widget Card */}
          <View style={styles.bookingSearchWidget}>
            {/* Package Switcher: Hourly vs Daily */}
            <View style={styles.widgetPackageTabs}>
              <TouchableOpacity
                style={[styles.pkgTab, rentalPackageMode === 'HOURLY' && styles.pkgTabActive]}
                onPress={() => setRentalPackageMode('HOURLY')}
              >
                <Ionicons
                  name="flash"
                  size={13}
                  color={rentalPackageMode === 'HOURLY' ? '#059669' : '#6B7280'}
                />
                <Text style={[styles.pkgTabText, rentalPackageMode === 'HOURLY' && styles.pkgTabTextActive]}>
                  Thuê theo giờ (Từ 22k/h)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pkgTab, rentalPackageMode === 'DAILY' && styles.pkgTabActive]}
                onPress={() => setRentalPackageMode('DAILY')}
              >
                <Ionicons
                  name="calendar"
                  size={13}
                  color={rentalPackageMode === 'DAILY' ? '#059669' : '#6B7280'}
                />
                <Text style={[styles.pkgTabText, rentalPackageMode === 'DAILY' && styles.pkgTabTextActive]}>
                  Thuê trọn ngày (24h)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pickup Station Row */}
            <TouchableOpacity style={styles.stationSelectorRow} onPress={onNavigateToMap}>
              <View style={styles.stationIconPin}>
                <Ionicons name="location" size={16} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stationSmallLabel}>TRẠM NHẬN & TRẢ XE TỰ ĐỘNG 24/7</Text>
                <Text style={styles.stationMainValue} numberOfLines={1}>
                  {selectedStation ? selectedStation.name : 'ĐH Giao Thông Vận Tải (UTH) - Bình Thạnh'}
                </Text>
              </View>
              <View style={styles.changeMapChip}>
                <Text style={styles.changeMapChipText}>Bản đồ</Text>
                <Ionicons name="chevron-forward" size={12} color="#059669" />
              </View>
            </TouchableOpacity>

            {/* Time & Search Input Row */}
            <View style={styles.searchFilterRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Tìm dòng xe: VF 8, VF 3, Ioniq 5, Klara S..."
                  placeholderTextColor="#9CA3AF"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Booking Toast Notification */}
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
            TIER 2: 2 LUXURY HERO CARDS (MINT GREEN & CHAMPAGNE BEIGE)
           ============================================================ */}
        <View style={styles.heroDualRow}>
          {/* Left Hero: Ô tô điện tự lái (Mint Green Surface) */}
          <TouchableOpacity
            style={[styles.heroCard, styles.heroCardMint]}
            activeOpacity={0.9}
            onPress={() => setSelectedCategory('CAR')}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroPillMint}>
                <Text style={styles.heroPillMintText}>0đ CỌC • 24/7</Text>
              </View>
              <Ionicons name="arrow-up-right-box-outline" size={14} color="#059669" />
            </View>
            <Text style={styles.heroTitle}>Thuê Ô Tô Điện</Text>
            <Text style={styles.heroSubtitle}>VF 3, VF 8, Ioniq 5 • Mở khóa BLE</Text>
            <Text style={styles.heroPriceMint}>Từ 60.000đ/giờ</Text>

            <View style={styles.heroPhotoFrame}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80' }}
                style={styles.heroPhoto}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>

          {/* Right Hero: Xe máy điện (Champagne Beige Surface) */}
          <TouchableOpacity
            style={[styles.heroCard, styles.heroCardBeige]}
            activeOpacity={0.9}
            onPress={() => setSelectedCategory('MOTORBIKE')}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.heroPillBeige}>
                <Text style={styles.heroPillBeigeText}>ĐỔI PIN MIỄN PHÍ</Text>
              </View>
              <Ionicons name="flash" size={14} color="#786B59" />
            </View>
            <Text style={styles.heroTitle}>Xe Máy Điện</Text>
            <Text style={styles.heroSubtitle}>Klara S, Feliz S • Sinh viên UTH</Text>
            <Text style={styles.heroPriceBeige}>Từ 22.000đ/giờ</Text>

            <View style={styles.heroPhotoFrame}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80' }}
                style={styles.heroPhoto}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* ============================================================
            TIER 3: 8 CORE FUNCTIONAL SERVICES (APPLE SQUIRCLES)
           ============================================================ */}
        <View style={styles.servicesCard}>
          <View style={styles.servicesHeader}>
            <Text style={styles.servicesTitle}>Tiện Ích Giao Thông Thông Minh ITS</Text>
            <Text style={styles.servicesSub}>Chuẩn Xanh SM & Mioto</Text>
          </View>

          <View style={styles.servicesGrid}>
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => {
                setRentalPackageMode('HOURLY');
                setSelectedCategory('CAR');
              }}
            >
              <View style={[styles.squircleIcon, styles.squircleMint]}>
                <Ionicons name="time" size={20} color="#059669" />
                <View style={styles.miniTagMint}>
                  <Text style={styles.miniTagText}>24/7</Text>
                </View>
              </View>
              <Text style={styles.serviceLabel}>Thuê Theo Giờ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => {
                setRentalPackageMode('DAILY');
                setSelectedCategory('CAR');
              }}
            >
              <View style={[styles.squircleIcon, styles.squircleBeige]}>
                <Ionicons name="calendar" size={20} color="#786B59" />
                <View style={styles.miniTagBeige}>
                  <Text style={styles.miniTagText}>-15%</Text>
                </View>
              </View>
              <Text style={styles.serviceLabel}>Thuê Trọn Ngày</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToKey}>
              <View style={[styles.squircleIcon, styles.squircleMint]}>
                <Ionicons name="key" size={20} color="#059669" />
                <View style={styles.miniTagMint}>
                  <Text style={styles.miniTagText}>BLE</Text>
                </View>
              </View>
              <Text style={styles.serviceLabel}>Khóa Số IoT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToMap}>
              <View style={[styles.squircleIcon, styles.squircleBeige]}>
                <Ionicons name="map" size={20} color="#786B59" />
                <View style={styles.miniTagBeige}>
                  <Text style={styles.miniTagText}>6 Hub</Text>
                </View>
              </View>
              <Text style={styles.serviceLabel}>Bản Đồ Trạm</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToKey}>
              <View style={[styles.squircleIcon, styles.squircleMint]}>
                <Ionicons name="speedometer" size={20} color="#059669" />
                <View style={styles.miniTagMint}>
                  <Text style={styles.miniTagText}>45km/h</Text>
                </View>
              </View>
              <Text style={styles.serviceLabel}>Làn Sóng Xanh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={onOpenRewards}>
              <View style={[styles.squircleIcon, styles.squircleBeige]}>
                <Ionicons name="gift" size={20} color="#786B59" />
                <View style={styles.miniTagBeige}>
                  <Text style={styles.miniTagText}>-20%</Text>
                </View>
              </View>
              <Text style={styles.serviceLabel}>Kho Voucher</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToTrips}>
              <View style={[styles.squircleIcon, styles.squircleMint]}>
                <Ionicons name="document-text" size={20} color="#059669" />
              </View>
              <Text style={styles.serviceLabel}>Hợp Đồng Số</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToProfile}>
              <View style={[styles.squircleIcon, styles.squircleBeige]}>
                <Ionicons name="leaf" size={20} color="#786B59" />
              </View>
              <Text style={styles.serviceLabel}>Chứng Chỉ CO₂</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================
            TIER 4: ITS GREEN WAVE LIVE TELEMETRY STRIP
           ============================================================ */}
        {glosaAdvisory && (
          <TouchableOpacity
            style={styles.glosaBanner}
            activeOpacity={0.9}
            onPress={onNavigateToKey}
          >
            <View style={styles.glosaIconBox}>
              <Ionicons name="pulse" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.glosaTopLine}>
                <Text style={styles.glosaTag}>GLOSA • TRỤC ĐIỆN BIÊN PHỦ - MAI CHÍ THỌ</Text>
                <View style={styles.glosaLiveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.glosaLiveText}>ĐÈN XANH {glosaAdvisory.secondsToSignalChange}S</Text>
                </View>
              </View>
              <Text style={styles.glosaMainAdvice}>
                Khuyến nghị chạy <Text style={styles.glosaSpeedHighlight}>{glosaAdvisory.recommendedSpeedKmh} km/h</Text> để qua ngã tư không dừng đèn đỏ
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ============================================================
            TIER 5: HORIZONTAL INSTANT UNLOCK CAROUSEL
           ============================================================ */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Xe Sẵn Sàng Mở Khóa Ngay</Text>
            <Text style={styles.sectionSub}>Đang đỗ tại trạm • Pin trên 85% • Không cần đặt cọc</Text>
          </View>
          <TouchableOpacity onPress={onNavigateToMap}>
            <Text style={styles.seeMapLink}>Xem bản đồ →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollRow}
        >
          {vehicles.slice(0, 5).map((veh, idx) => (
            <TouchableOpacity
              key={veh.id}
              style={styles.nearbyCard}
              activeOpacity={0.9}
              onPress={() => handleOpenBooking(veh)}
            >
              <View style={styles.nearbyImgWrap}>
                <Image source={{ uri: veh.thumbnail }} style={styles.nearbyImg} resizeMode="cover" />
                <View style={styles.distanceTag}>
                  <Ionicons name="walk" size={10} color="#059669" />
                  <Text style={styles.distanceText}>{110 + idx * 45}m</Text>
                </View>
                <View style={styles.batteryMiniTag}>
                  <Ionicons name="battery-charging" size={10} color="#FFFFFF" />
                  <Text style={styles.batteryMiniText}>{Math.round(veh.telematics?.batteryLevelPct || 90)}%</Text>
                </View>
              </View>

              <View style={styles.nearbyBody}>
                <Text style={styles.nearbyName} numberOfLines={1}>{veh.name}</Text>
                <Text style={styles.nearbyPlate}>{veh.plateNumber} • {veh.seats} chỗ</Text>
                <View style={styles.nearbyFooter}>
                  <Text style={styles.nearbyPrice}>
                    {veh.hourlyPrice.toLocaleString('vi-VN')}đ<Text style={styles.nearbyUnit}>/h</Text>
                  </Text>
                  <View style={styles.instantBtnMini}>
                    <Text style={styles.instantBtnMiniText}>Thuê</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ============================================================
            TIER 6: FLEET CATALOG & CATEGORY FILTER
           ============================================================ */}
        <View style={styles.catalogHeader}>
          <Text style={styles.sectionTitle}>Danh Mục Đội Xe ITS ({filteredVehicles.length})</Text>

          <View style={styles.categoryFilterBar}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon}
                    size={13}
                    color={active ? '#FFFFFF' : '#4B5563'}
                  />
                  <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 30 }} />
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

      {/* Real Multi-Step Booking & e-Contract Checkout Modal */}
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
    backgroundColor: '#F5F5F7'
  },
  scrollContent: {
    paddingBottom: 20
  },
  topHeaderSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2
  },
  brandBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  brandBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  mintBrandLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.3
  },
  brandSub: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600'
  },
  ekycVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 4
  },
  ekycVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669'
  },
  bookingSearchWidget: {
    backgroundColor: '#F5F2EB',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5DEC9'
  },
  widgetPackageTabs: {
    flexDirection: 'row',
    backgroundColor: '#EAE5D9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10
  },
  pkgTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5
  },
  pkgTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1
  },
  pkgTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280'
  },
  pkgTabTextActive: {
    color: '#059669',
    fontWeight: '800'
  },
  stationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8
  },
  stationIconPin: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stationSmallLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.4
  },
  stationMainValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 1
  },
  changeMapChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2
  },
  changeMapChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669'
  },
  searchFilterRow: {
    flexDirection: 'row'
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    fontWeight: '600'
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    gap: 10
  },
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  toastMsg: {
    color: '#ECFDF5',
    fontSize: 11,
    marginTop: 1
  },
  heroDualRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10
  },
  heroCard: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    overflow: 'hidden'
  },
  heroCardMint: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  heroCardBeige: {
    backgroundColor: '#F5F2EB',
    borderColor: '#E5DEC9'
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  heroPillMint: {
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  heroPillMintText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800'
  },
  heroPillBeige: {
    backgroundColor: '#786B59',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  heroPillBeigeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800'
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827'
  },
  heroSubtitle: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 1
  },
  heroPriceMint: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669',
    marginTop: 4,
    marginBottom: 8
  },
  heroPriceBeige: {
    fontSize: 12,
    fontWeight: '900',
    color: '#786B59',
    marginTop: 4,
    marginBottom: 8
  },
  heroPhotoFrame: {
    width: '100%',
    height: 78,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF'
  },
  heroPhoto: {
    width: '100%',
    height: '100%'
  },
  servicesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  servicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  servicesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827'
  },
  servicesSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669'
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14
  },
  serviceItem: {
    width: '25%',
    alignItems: 'center'
  },
  squircleIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    position: 'relative',
    borderWidth: 1
  },
  squircleMint: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5'
  },
  squircleBeige: {
    backgroundColor: '#F5F2EB',
    borderColor: '#E5DEC9'
  },
  miniTagMint: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6
  },
  miniTagBeige: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#786B59',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6
  },
  miniTagText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '800'
  },
  serviceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center'
  },
  glosaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    gap: 10
  },
  glosaIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  glosaTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  glosaTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3
  },
  glosaLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    gap: 4
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981'
  },
  glosaLiveText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#059669'
  },
  glosaMainAdvice: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '600',
    marginTop: 3
  },
  glosaSpeedHighlight: {
    color: '#059669',
    fontWeight: '900'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827'
  },
  sectionSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1
  },
  seeMapLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669'
  },
  horizontalScrollRow: {
    paddingHorizontal: 16,
    gap: 12
  },
  nearbyCard: {
    width: 195,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  nearbyImgWrap: {
    width: '100%',
    height: 108,
    backgroundColor: '#F5F2EB',
    position: 'relative'
  },
  nearbyImg: {
    width: '100%',
    height: '100%'
  },
  distanceTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 3
  },
  distanceText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  batteryMiniTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 3
  },
  batteryMiniText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  nearbyBody: {
    padding: 10
  },
  nearbyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827'
  },
  nearbyPlate: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2
  },
  nearbyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  nearbyPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669'
  },
  nearbyUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280'
  },
  instantBtnMini: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  instantBtnMiniText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669'
  },
  catalogHeader: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12
  },
  categoryFilterBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 5
  },
  catChipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563'
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  }
});
