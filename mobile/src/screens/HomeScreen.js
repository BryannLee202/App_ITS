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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';

export default function HomeScreen({ onNavigateToKey }) {
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
      console.warn('Load vehicles error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (vehicle) => {
    setSelectedVehicle(vehicle);
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
        pickupStationId: selectedVehicle.stationId
      });

      setModalVisible(false);
      Alert.alert(
        'Thuê Xe Thành Công',
        `Hợp đồng điện tử ${res.trip.contractNumber} đã được ký.\nChìa khóa số Digital Key đã kích hoạt trong tab Điều Khiển.`,
        [
          {
            text: 'Mở Điều Khiển Xe Ngay',
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

  const filteredVehicles = vehicles.filter(v => {
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
        {/* =========================================
            1. TOP FLOATING SEARCH BAR (XANH SM STYLE)
        ========================================= */}
        <View style={styles.topSearchWrapper}>
          <View style={styles.searchPill}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              placeholder="Bạn muốn đi đâu, thuê xe gì?"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* =========================================
            2. "GẦN BẠN" HORIZONTAL CAROUSEL
        ========================================= */}
        <View style={styles.nearbySection}>
          <View style={styles.nearbyHeaderRow}>
            <View style={styles.nearbyTitleGroup}>
              <Ionicons name="sparkles" size={15} color="#00BFA5" />
              <Text style={styles.nearbyTitle}>Đội xe thông minh gần đây đang sẵn sàng</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Quick Vehicle Mini Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselRow}
          >
            {vehicles.slice(0, 4).map((veh) => (
              <TouchableOpacity
                key={veh.id}
                style={styles.miniCard}
                activeOpacity={0.88}
                onPress={() => handleOpenBooking(veh)}
              >
                <View style={styles.miniCardImageWrap}>
                  <Image source={{ uri: veh.thumbnail }} style={styles.miniCardImage} />
                  <View style={styles.priceTagOver}>
                    <Text style={styles.priceTagOverText}>
                      {veh.hourlyPrice >= 100000 
                        ? `${Math.round(veh.hourlyPrice / 1000)}k/h` 
                        : `${veh.hourlyPrice.toLocaleString('vi-VN')}đ/h`}
                    </Text>
                  </View>
                  <View style={styles.miniRatingTag}>
                    <Ionicons name="star" size={10} color="#F59E0B" />
                    <Text style={styles.miniRatingText}>{veh.rating}</Text>
                  </View>
                </View>
                <View style={styles.miniCardContent}>
                  <View style={styles.verifiedRow}>
                    <Ionicons name="checkmark-circle" size={11} color="#00BFA5" />
                    <Text style={styles.miniVehName} numberOfLines={1}>{veh.name}</Text>
                  </View>
                  <Text style={styles.miniDistText}>
                    📍 {veh.stationId === 'hub-uth-01' ? 'UTH Cơ sở 2 • 0.6 km' : 'Ga Metro • 1.1 km'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Filter Pill Buttons */}
          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={[styles.filterPill, selectedFilter === 'ALL' && styles.filterPillActive]}
              onPress={() => setSelectedFilter('ALL')}
            >
              <Text style={[styles.filterPillText, selectedFilter === 'ALL' && styles.filterPillTextActive]}>
                Tất cả xe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, selectedFilter === 'CAR' && styles.filterPillActive]}
              onPress={() => setSelectedFilter('CAR')}
            >
              <Text style={[styles.filterPillText, selectedFilter === 'CAR' && styles.filterPillTextActive]}>
                Ô tô điện EV
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, selectedFilter === 'MOTORBIKE' && styles.filterPillActive]}
              onPress={() => setSelectedFilter('MOTORBIKE')}
            >
              <Text style={[styles.filterPillText, selectedFilter === 'MOTORBIKE' && styles.filterPillTextActive]}>
                Xe máy điện
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================
            3. TWO BIG HERO ACTION CARDS (XANH SM STYLE)
        ========================================= */}
        <View style={styles.bigHeroCardsRow}>
          {/* Card 1: Thuê xe tự lái (Cyan Gradient) */}
          <TouchableOpacity
            style={styles.heroActionCardLeft}
            activeOpacity={0.88}
            onPress={() => setSelectedFilter('CAR')}
          >
            <View style={styles.heroTextCol}>
              <Text style={styles.heroCardTitle}>Thuê xe tự lái</Text>
              <Text style={styles.heroCardSub}>Nhận xe 24/7</Text>
              <View style={styles.heroTagPill}>
                <Text style={styles.heroTagText}>0đ cọc</Text>
              </View>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80' }}
              style={styles.heroCarImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Card 2: Xe máy điện / Đổi pin (Peach-Mint Gradient) */}
          <TouchableOpacity
            style={styles.heroActionCardRight}
            activeOpacity={0.88}
            onPress={() => setSelectedFilter('MOTORBIKE')}
          >
            <View style={styles.heroTextCol}>
              <Text style={styles.heroCardTitle}>Xe máy điện</Text>
              <Text style={styles.heroCardSub}>Đổi pin miễn phí</Text>
              <View style={[styles.heroTagPill, { backgroundColor: '#FEEFD6' }]}>
                <Text style={[styles.heroTagText, { color: '#B45309' }]}>Từ 22k/h</Text>
              </View>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?auto=format&fit=crop&w=400&q=80' }}
              style={styles.heroCarImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* =========================================
            4. "DỊCH VỤ KHÁC" (GRID OF 8 ROUNDED ICONS)
        ========================================= */}
        <View style={styles.servicesSection}>
          <View style={styles.servicesHeaderRow}>
            <Text style={styles.servicesSectionTitle}>Dịch vụ giao thông thông minh</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.servicesGrid}>
            {/* Row 1 */}
            <TouchableOpacity style={styles.serviceItem} onPress={() => setSelectedFilter('MOTORBIKE')}>
              <View style={styles.serviceIconWrap}>
                <Ionicons name="bicycle" size={26} color="#00BFA5" />
              </View>
              <Text style={styles.serviceLabel}>Xe máy điện</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} onPress={() => setSelectedFilter('CAR')}>
              <View style={styles.badgeTopCorner}>
                <Text style={styles.badgeTopCornerText}>-20%</Text>
              </View>
              <View style={styles.serviceIconWrap}>
                <Ionicons name="car-sport" size={26} color="#0EA5E9" />
              </View>
              <Text style={styles.serviceLabel}>Xe tự lái EV</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIconWrap}>
                <Ionicons name="bus" size={26} color="#10B981" />
              </View>
              <Text style={styles.serviceLabel}>VinBus & Metro</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={[styles.badgeTopCorner, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.badgeTopCornerText, { color: '#B45309' }]}>MỚI</Text>
              </View>
              <View style={styles.serviceIconWrap}>
                <Ionicons name="diamond" size={26} color="#F59E0B" />
              </View>
              <Text style={styles.serviceLabel}>Hội viên ITS</Text>
            </TouchableOpacity>

            {/* Row 2 */}
            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToKey}>
              <View style={styles.serviceIconWrap}>
                <Ionicons name="key" size={26} color="#6366F1" />
              </View>
              <Text style={styles.serviceLabel}>Digital Key</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIconWrap}>
                <Ionicons name="battery-charging" size={26} color="#00BFA5" />
              </View>
              <Text style={styles.serviceLabel}>Trạm sạc Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIconWrap}>
                <Ionicons name="git-network" size={26} color="#0284C7" />
              </View>
              <Text style={styles.serviceLabel}>Làn sóng xanh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem}>
              <View style={styles.serviceIconWrap}>
                <Ionicons name="gift" size={26} color="#EC4899" />
              </View>
              <Text style={styles.serviceLabel}>Thẻ quà tặng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================
            5. ITS GREEN WAVE CORRIDOR TICKER
        ========================================= */}
        <View style={styles.corridorBanner}>
          <View style={styles.corridorLeft}>
            <View style={styles.corridorTagRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.corridorTagTitle}>HÀNH LANG LÀN SÓNG XANH GLOSA</Text>
            </View>
            <Text style={styles.corridorName}>Trục UTH - Điện Biên Phủ - Mai Chí Thọ</Text>
            <Text style={styles.corridorDetail}>Vận tốc đồng bộ 45 km/h • Giảm 18.5% pin</Text>
          </View>
          <View style={styles.gaugePill}>
            <Text style={styles.gaugeNumber}>45</Text>
            <Text style={styles.gaugeLabel}>km/h</Text>
          </View>
        </View>

        {/* =========================================
            6. VEHICLE CATALOG LIST
        ========================================= */}
        <View style={styles.catalogHeaderRow}>
          <Text style={styles.catalogTitle}>
            Danh mục xe sẵn sàng ({filteredVehicles.length})
          </Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={14} color="#00BFA5" />
            <Text style={styles.filterBtnText}>Lọc</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#00BFA5" />
            <Text style={styles.loadingText}>Đang đồng bộ đội xe...</Text>
          </View>
        ) : (
          filteredVehicles.map((veh) => (
            <VehicleCard
              key={veh.id}
              vehicle={veh}
              onSelect={handleOpenBooking}
              onBook={handleOpenBooking}
            />
          ))
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderStrip}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalContractTitle}>HỢP ĐỒNG THUÊ XE THÔNG MINH</Text>
                <Text style={styles.modalVehicleName}>{selectedVehicle?.name}</Text>
                <Text style={styles.modalPlateText}>Biển số: {selectedVehicle?.plateNumber}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseIcon}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedVehicle && (
              <>
                <Text style={styles.modalSectionLabel}>Chọn thời gian thuê (theo giờ):</Text>
                <View style={styles.durationRow}>
                  {[1, 2, 3, 5, 8, 24].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.durationChip, durationHours === h && styles.durationChipActive]}
                      onPress={() => setDurationHours(h)}
                    >
                      <Text style={[styles.durationText, durationHours === h && styles.durationTextActive]}>
                        {h} Giờ
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Eco Impact Widget */}
                <CO2Widget
                  eco={{
                    distanceKm: Math.round(durationHours * 22),
                    co2SavedKg: Math.round(durationHours * 2.64 * 10) / 10,
                    treesEquivalent: Math.round((durationHours * 2.64 / 20) * 100) / 100,
                    ecoPointsEarned: durationHours * 26
                  }}
                />

                {/* Price Breakdown */}
                <View style={styles.priceSheet}>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Đơn giá</Text>
                    <Text style={styles.sheetValue}>{selectedVehicle.hourlyPrice.toLocaleString('vi-VN')} đ/giờ</Text>
                  </View>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Thời gian</Text>
                    <Text style={styles.sheetValue}>{durationHours} giờ</Text>
                  </View>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Ký quỹ thế chấp (eKYC)</Text>
                    <Text style={[styles.sheetValue, { color: '#00BFA5', fontWeight: '800' }]}>0 đ (Miễn cọc)</Text>
                  </View>
                  <View style={[styles.priceSheetRow, styles.totalPriceRow]}>
                    <Text style={styles.totalPriceLabel}>TỔNG THANH TOÁN:</Text>
                    <Text style={styles.totalPriceValue}>
                      {(selectedVehicle.hourlyPrice * durationHours).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  activeOpacity={0.88}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="key-outline" size={17} color="#FFFFFF" />
                      <Text style={styles.modalSubmitText}>KÝ SỐ VÀ NHẬN XE NGAY</Text>
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
    backgroundColor: '#F5F7F9'
  },
  scrollContent: {
    paddingBottom: 95
  },
  topSearchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500'
  },
  nearbySection: {
    paddingHorizontal: 16,
    marginTop: 8
  },
  nearbyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  nearbyTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  nearbyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B'
  },
  carouselRow: {
    gap: 10,
    paddingBottom: 6
  },
  miniCard: {
    width: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  miniCardImageWrap: {
    width: '100%',
    height: 90,
    position: 'relative',
    backgroundColor: '#F1F5F9'
  },
  miniCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  priceTagOver: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  priceTagOverText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  miniRatingTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3
  },
  miniRatingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  miniCardContent: {
    padding: 8
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  miniVehName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1
  },
  miniDistText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterPillActive: {
    backgroundColor: '#00BFA5',
    borderColor: '#00BFA5'
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  bigHeroCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 10
  },
  heroActionCardLeft: {
    flex: 1,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#E6F8F6',
    borderWidth: 1,
    borderColor: '#C7F1EC',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden'
  },
  heroActionCardRight: {
    flex: 1,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#FFF7EB',
    borderWidth: 1,
    borderColor: '#FEEFD6',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden'
  },
  heroTextCol: {
    justifyContent: 'center',
    zIndex: 2
  },
  heroCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  heroCardSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2
  },
  heroTagPill: {
    backgroundColor: '#C7F1EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  heroTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#008E7B'
  },
  heroCarImage: {
    width: 68,
    height: 52,
    borderRadius: 6
  },
  servicesSection: {
    paddingHorizontal: 16,
    marginTop: 18
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  servicesSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B'
  },
  seeAllText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14
  },
  serviceItem: {
    width: '22%',
    alignItems: 'center',
    position: 'relative'
  },
  serviceIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 6,
    textAlign: 'center'
  },
  badgeTopCorner: {
    position: 'absolute',
    top: -4,
    right: 0,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    zIndex: 5
  },
  badgeTopCornerText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#DC2626'
  },
  corridorBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  corridorLeft: {
    flex: 1
  },
  corridorTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00BFA5'
  },
  corridorTagTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5EEAD4',
    letterSpacing: 0.5
  },
  corridorName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  corridorDetail: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2
  },
  gaugePill: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#00BFA5'
  },
  gaugeNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  gaugeLabel: {
    color: '#5EEAD4',
    fontSize: 8,
    fontWeight: '700',
    marginTop: -2
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 8
  },
  catalogTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B'
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  filterBtnText: {
    fontSize: 12,
    color: '#00BFA5',
    fontWeight: '700'
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: 16
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    maxHeight: '90%'
  },
  modalHeaderStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12
  },
  modalContractTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00BFA5',
    letterSpacing: 0.6
  },
  modalVehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2
  },
  modalPlateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  modalCloseIcon: {
    padding: 4
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  durationChipActive: {
    backgroundColor: '#00BFA5',
    borderColor: '#00BFA5'
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  durationTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  priceSheet: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  priceSheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  sheetLabel: {
    fontSize: 11,
    color: '#64748B'
  },
  sheetValue: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '700'
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  totalPriceLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B'
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00BFA5'
  },
  modalSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BFA5',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginTop: 8
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});
