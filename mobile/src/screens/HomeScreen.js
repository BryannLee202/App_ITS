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
  { id: 'CAR', label: 'Ô tô điện / Hybrid', icon: 'car-sport' },
  { id: 'MOTORBIKE', label: 'Xe máy điện', icon: 'bicycle' }
];

export default function HomeScreen({ navigation, onNavigateToKey }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
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
        '🎉 Thuê Xe Thành Công!',
        `Hợp đồng điện tử ${res.trip.contractNumber} đã được ký.\nChìa khóa số Digital Key đã sẵn sàng trong tab "Điều khiển".`,
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar & Quick Location */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              placeholder="Tìm dòng xe, hãng xe (VinFast VF8, Klara...)"
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.locationRow}>
            <View style={styles.locBadge}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.locText}>Khu vực: TP.HCM (Trục UTH - Mai Chí Thọ)</Text>
            </View>
            <View style={styles.selfPickupPill}>
              <Ionicons name="key-outline" size={12} color={COLORS.secondaryDark} />
              <Text style={styles.selfPickupText}>Tự nhận xe 24/7</Text>
            </View>
          </View>
        </View>

        {/* ITS Corridor Green Wave Banner */}
        <View style={styles.itsBanner}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerTag}>
              <Ionicons name="leaf-outline" size={12} color="#FFFFFF" />
              <Text style={styles.bannerTagText}>ITS ECO-MOBILITY</Text>
            </View>
            <Text style={styles.bannerTitle}>Hành lang Làn Sóng Xanh</Text>
            <Text style={styles.bannerSub}>
              Tối ưu vận tốc 45 km/h, giảm 20% phát thải CO₂ kết nối Metro Tuyến 1
            </Text>
          </View>
          <View style={styles.bannerRightCircle}>
            <Ionicons name="speedometer-outline" size={32} color={COLORS.secondary} />
          </View>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.categoryContainer}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={isSelected ? '#FFFFFF' : COLORS.textSecondary}
                />
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Fleet Count Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phương tiện sẵn sàng ({filteredVehicles.length})</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={16} color={COLORS.primary} />
            <Text style={styles.filterBtnText}>Bộ lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicles List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải đội xe thông minh...</Text>
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

      {/* Booking Modal (Moovtek/Mioto style) */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {selectedVehicle && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selectedVehicle.name}</Text>
                    <Text style={styles.modalPlate}>Biển số: {selectedVehicle.plateNumber}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={20} color={COLORS.textSecondary} />
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
                    <Text style={styles.priceRowLabel}>Thời gian</Text>
                    <Text style={styles.priceRowVal}>{durationHours} giờ</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Tiền đặt cọc (Thế chấp)</Text>
                    <Text style={[styles.priceRowVal, { color: COLORS.secondaryDark, fontWeight: '700' }]}>0 đ (Miễn cọc)</Text>
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
                  activeOpacity={0.85}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="key" size={18} color="#FFFFFF" />
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
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: 90
  },
  searchSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderRadius: RADIUS.md,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm
  },
  locBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  locText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  selfPickupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4
  },
  selfPickupText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondaryDark
  },
  itsBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: '#1E1B4B',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  bannerLeft: {
    flex: 1,
    marginRight: SPACING.md
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    marginBottom: 4
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  bannerSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16
  },
  bannerRightCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    gap: SPACING.sm
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  categoryTextActive: {
    color: '#FFFFFF'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  filterBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600'
  },
  centerBox: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 13,
    color: COLORS.textSecondary
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '90%'
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.borderDark,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  modalPlate: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2
  },
  modalCloseBtn: {
    padding: 4
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  hoursRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md
  },
  hourChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  hourChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  hourChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  hourChipTextActive: {
    color: '#FFFFFF'
  },
  priceBreakdown: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.md
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  priceRowLabel: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  priceRowVal: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  confirmBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    gap: 8
  },
  confirmBookingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
