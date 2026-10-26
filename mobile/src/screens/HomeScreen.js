import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import Header from '../components/Header';
import VehicleCard from '../components/VehicleCard';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả xe', icon: 'apps' },
  { id: 'CAR', label: 'Ô tô điện EV', icon: 'car-sport' },
  { id: 'MOTORBIKE', label: 'Xe máy điện', icon: 'bicycle' }
];

export default function HomeScreen({ onNavigateToKey }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking Card State (Mioto / Moovtek style)
  const [bookingMode, setBookingMode] = useState('SELF_DRIVE'); // 'SELF_DRIVE' or 'STATION_HUB'
  const [pickupLocation, setPickupLocation] = useState('ĐH GTVT (UTH) - Cơ sở 2, Bình Thạnh');
  const [rentalTimeRange, setRentalTimeRange] = useState('08:00 - 20:00 (12 giờ)');

  // Booking Modal State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [durationHours, setDurationHours] = useState(3);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, [selectedCategory]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getVehicles(selectedCategory);
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
        '🎉 Ký Hợp Đồng & Nhận Xe Thành Công!',
        `Hợp đồng điện tử ${res.trip.contractNumber} đã có hiệu lực.\nChìa khóa số Digital Key BLE đã mở khóa trong tab "Điều khiển".`,
        [
          {
            text: 'Mở Chìa Khóa Số Ngay',
            onPress: () => {
              if (onNavigateToKey) onNavigateToKey();
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('Lỗi đặt xe', err.message || 'Không thể thực hiện đặt xe');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header user={{ fullName: 'Nguyễn Văn An', isEkycVerified: true }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================================
            1. MIOTO / MOOVTEK HERO SEARCH CARD
        ========================================= */}
        <View style={styles.heroBookingCard}>
          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabsRow}>
            <TouchableOpacity
              style={[styles.modeTab, bookingMode === 'SELF_DRIVE' && styles.modeTabActive]}
              onPress={() => setBookingMode('SELF_DRIVE')}
            >
              <Ionicons
                name="key-outline"
                size={14}
                color={bookingMode === 'SELF_DRIVE' ? '#4F46E5' : '#64748B'}
              />
              <Text style={[styles.modeTabText, bookingMode === 'SELF_DRIVE' && styles.modeTabTextActive]}>
                Tự nhận xe 24/7
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, bookingMode === 'STATION_HUB' && styles.modeTabActive]}
              onPress={() => setBookingMode('STATION_HUB')}
            >
              <Ionicons
                name="business-outline"
                size={14}
                color={bookingMode === 'STATION_HUB' ? '#4F46E5' : '#64748B'}
              />
              <Text style={[styles.modeTabText, bookingMode === 'STATION_HUB' && styles.modeTabTextActive]}>
                Theo Trạm Hub ITS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location Row */}
          <View style={styles.bookingInputRow}>
            <View style={styles.inputIconCircle}>
              <Ionicons name="location" size={16} color="#4F46E5" />
            </View>
            <View style={styles.inputTextField}>
              <Text style={styles.inputSubLabel}>ĐỊA ĐIỂM NHẬN XE</Text>
              <Text style={styles.inputMainValue} numberOfLines={1}>{pickupLocation}</Text>
            </View>
          </View>

          <View style={styles.inputDivider} />

          {/* Time Row */}
          <View style={styles.bookingInputRow}>
            <View style={[styles.inputIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="calendar-outline" size={16} color="#059669" />
            </View>
            <View style={styles.inputTextField}>
              <Text style={styles.inputSubLabel}>THỜI GIAN THUÊ XE</Text>
              <Text style={styles.inputMainValue}>{rentalTimeRange}</Text>
            </View>
            <View style={styles.noDepositTag}>
              <Text style={styles.noDepositTagText}>0đ Cọc</Text>
            </View>
          </View>

          {/* Quick Search Button */}
          <TouchableOpacity
            style={styles.heroSearchBtn}
            activeOpacity={0.88}
            onPress={() => {}}
          >
            <Ionicons name="search" size={16} color="#FFFFFF" />
            <Text style={styles.heroSearchBtnText}>TÌM KIẾM XE NGAY</Text>
          </TouchableOpacity>
        </View>

        {/* =========================================
            2. ITS LIVE CORRIDOR TICKER BANNER
        ========================================= */}
        <View style={styles.itsBanner}>
          <View style={styles.itsBadgeLeft}>
            <View style={styles.pulseDot} />
            <Text style={styles.itsBadgeTitle}>HÀNH LANG LÀN SÓNG XANH GLOSA</Text>
          </View>
          <View style={styles.itsBannerBody}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itsCorridorName}>Trục UTH - Điện Biên Phủ - Mai Chí Thọ</Text>
              <Text style={styles.itsCorridorDesc}>Vận tốc khuyến nghị 45 km/h • Giảm 18.5% pin</Text>
            </View>
            <View style={styles.speedCircleBadge}>
              <Text style={styles.speedNum}>45</Text>
              <Text style={styles.speedUnit}>km/h</Text>
            </View>
          </View>
        </View>

        {/* =========================================
            3. CATEGORY FILTER PILLS
        ========================================= */}
        <View style={styles.categoriesRow}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isSelected ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* =========================================
            4. FLEET SECTION HEADER
        ========================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Phương tiện sẵn sàng ({filteredVehicles.length})
          </Text>
          <TouchableOpacity style={styles.filterActionBtn}>
            <Ionicons name="funnel-outline" size={13} color="#4F46E5" />
            <Text style={styles.filterActionText}>Bộ lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicles List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Đang cập nhật đội xe thông minh...</Text>
          </View>
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
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {selectedVehicle && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedVehicle.name}</Text>
                    <Text style={styles.modalPlate}>Biển số: {selectedVehicle.plateNumber}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Duration Picker */}
                <Text style={styles.inputLabel}>Chọn thời gian thuê (theo giờ):</Text>
                <View style={styles.hoursRow}>
                  {[1, 2, 3, 5, 8, 24].map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.hourChip, durationHours === h && styles.hourChipActive]}
                      onPress={() => setDurationHours(h)}
                    >
                      <Text style={[styles.hourChipText, durationHours === h && styles.hourChipTextActive]}>
                        {h} giờ
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* ITS Eco Impact Widget inside modal */}
                <CO2Widget
                  eco={{
                    distanceKm: Math.round(durationHours * 22),
                    co2SavedKg: Math.round(durationHours * 2.64 * 10) / 10,
                    treesEquivalent: Math.round((durationHours * 2.64 / 20) * 100) / 100,
                    ecoPointsEarned: durationHours * 26
                  }}
                />

                {/* Price Breakdown */}
                <View style={styles.priceBreakdown}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Đơn giá thuê</Text>
                    <Text style={styles.priceRowVal}>{selectedVehicle.hourlyPrice.toLocaleString('vi-VN')} đ/giờ</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Thời gian thuê</Text>
                    <Text style={styles.priceRowVal}>{durationHours} giờ</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Tiền đặt cọc (eKYC duyệt)</Text>
                    <Text style={[styles.priceRowVal, { color: '#059669', fontWeight: '800' }]}>0 đ (Miễn cọc)</Text>
                  </View>
                  <View style={[styles.priceRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.totalVal}>
                      {(selectedVehicle.hourlyPrice * durationHours).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.confirmBookingBtn}
                  activeOpacity={0.88}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="key" size={17} color="#FFFFFF" />
                      <Text style={styles.confirmBookingText}>Ký Hợp Đồng & Nhận Xe Ngay</Text>
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
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    paddingBottom: 90
  },
  heroBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  modeTabTextActive: {
    color: '#4F46E5',
    fontWeight: '700'
  },
  bookingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  inputTextField: {
    flex: 1
  },
  inputSubLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5
  },
  inputMainValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1
  },
  noDepositTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  noDepositTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309'
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8
  },
  heroSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  heroSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  itsBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12
  },
  itsBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34D399'
  },
  itsBadgeTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A7F3D0',
    letterSpacing: 0.5
  },
  itsBannerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itsCorridorName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  itsCorridorDesc: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2
  },
  speedCircleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#6366F1'
  },
  speedNum: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  speedUnit: {
    color: '#818CF8',
    fontSize: 8,
    fontWeight: '700',
    marginTop: -2
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6
  },
  categoryChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  categoryChipTextActive: {
    color: '#FFFFFF'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  filterActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  filterActionText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700'
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748B'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '90%'
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A'
  },
  modalPlate: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
    marginTop: 2
  },
  modalCloseBtn: {
    padding: 4
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8
  },
  hoursRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  hourChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  hourChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  hourChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  hourChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  priceBreakdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  priceRowLabel: {
    fontSize: 12,
    color: '#64748B'
  },
  priceRowVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600'
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4F46E5'
  },
  confirmBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8
  },
  confirmBookingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
