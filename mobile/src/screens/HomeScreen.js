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
import { COLORS } from '../styles/theme';
import Header from '../components/Header';
import VehicleCard from '../components/VehicleCard';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả phương tiện', icon: 'grid-outline' },
  { id: 'CAR', label: 'Ô tô thuần điện (EV)', icon: 'car-sport-outline' },
  { id: 'MOTORBIKE', label: 'Xe máy điện đô thị', icon: 'bicycle-outline' }
];

export default function HomeScreen({ onNavigateToKey }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Formal booking state
  const [bookingMode, setBookingMode] = useState('SELF_DRIVE');
  const [pickupLocation, setPickupLocation] = useState('Trường ĐH Giao Thông Vận Tải (UTH) - Cơ sở 2, Q. Bình Thạnh');
  const [rentalTimeRange, setRentalTimeRange] = useState('08:00 - 20:00 (Thời lượng: 12 giờ)');

  // Modal State
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
        'XÁC NHẬN HỢP ĐỒNG ĐIỆN TỬ',
        `Hợp đồng thuê phương tiện số ${res.trip.contractNumber} đã được xác thực ký số điện tử thành công.\n\nChìa khóa điều khiển từ xa (Digital Key) đã kích hoạt trên tab Điều Khiển.`,
        [
          {
            text: 'Truy Cập Buồng Lái Điều Khiển',
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
            1. GREEN SM STYLE HERO BOOKING CARD
        ========================================= */}
        <View style={styles.heroDispatchCard}>
          <View style={styles.cardHeaderStrip}>
            <Text style={styles.cardHeaderTitle}>PHƯƠNG THỨC GIAO NHẬN VÀ LỊCH TRÌNH</Text>
            <View style={styles.systemTag}>
              <Text style={styles.systemTagText}>GSM ECO PROTOCOL</Text>
            </View>
          </View>

          {/* Mode Switch Tabs */}
          <View style={styles.modeTabsRow}>
            <TouchableOpacity
              style={[styles.modeTab, bookingMode === 'SELF_DRIVE' && styles.modeTabActive]}
              onPress={() => setBookingMode('SELF_DRIVE')}
            >
              <Ionicons
                name="key-outline"
                size={13}
                color={bookingMode === 'SELF_DRIVE' ? '#00A896' : '#4A6B74'}
              />
              <Text style={[styles.modeTabText, bookingMode === 'SELF_DRIVE' && styles.modeTabTextActive]}>
                Tự nhận xe số hóa 24/7 (BLE)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, bookingMode === 'STATION_HUB' && styles.modeTabActive]}
              onPress={() => setBookingMode('STATION_HUB')}
            >
              <Ionicons
                name="business-outline"
                size={13}
                color={bookingMode === 'STATION_HUB' ? '#00A896' : '#4A6B74'}
              />
              <Text style={[styles.modeTabText, bookingMode === 'STATION_HUB' && styles.modeTabTextActive]}>
                Giao nhận tại Trạm Hub Metro
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location Field */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldIconBox}>
              <Ionicons name="location-outline" size={15} color="#00A896" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>ĐỊA ĐIỂM NHẬN VÀ HOÀN TRẢ PHƯƠNG TIỆN</Text>
              <Text style={styles.fieldValue} numberOfLines={1}>{pickupLocation}</Text>
            </View>
          </View>

          <View style={styles.fieldSeparator} />

          {/* Time & Policy Field */}
          <View style={styles.fieldRow}>
            <View style={[styles.fieldIconBox, { backgroundColor: '#E6F8F6' }]}>
              <Ionicons name="time-outline" size={15} color="#00A896" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>KHUNG GIỜ KHAI THÁC DỊCH VỤ</Text>
              <Text style={styles.fieldValue}>{rentalTimeRange}</Text>
            </View>
            <View style={styles.policyTag}>
              <Ionicons name="shield-checkmark" size={10} color="#00A896" />
              <Text style={styles.policyTagText}>BẢO CHỨNG eKYC</Text>
            </View>
          </View>

          {/* Action Button - Green SM Cyan Mint */}
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.88}
            onPress={() => {}}
          >
            <Ionicons name="search" size={14} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>TRA CỨU DANH MỤC PHƯƠNG TIỆN KHẢ DỤNG</Text>
          </TouchableOpacity>
        </View>

        {/* =========================================
            2. ITS CORRIDOR INSTRUMENT BANNER
        ========================================= */}
        <View style={styles.corridorBanner}>
          <View style={styles.corridorHeader}>
            <View style={styles.statusIndicator} />
            <Text style={styles.corridorTitle}>HÀNH LANG TỐI ƯU TÍN HIỆU LÀN SÓNG XANH (GLOSA)</Text>
          </View>
          <View style={styles.corridorBody}>
            <View style={{ flex: 1 }}>
              <Text style={styles.corridorRoute}>Trục Giao Thông: ĐH GTVT (UTH) - Mai Chí Thọ</Text>
              <Text style={styles.corridorDetail}>
                Vận tốc thiết kế đồng bộ: 45 km/h • Giảm thiểu 18.5% tiêu hao pin
              </Text>
            </View>
            <View style={styles.gaugeBox}>
              <Text style={styles.gaugeValue}>45</Text>
              <Text style={styles.gaugeUnit}>KM/H</Text>
            </View>
          </View>
        </View>

        {/* =========================================
            3. CATEGORY SELECTOR (FORMAL TABS)
        ========================================= */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon}
                  size={13}
                  color={isSelected ? '#FFFFFF' : '#4A6B74'}
                />
                <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            DANH MỤC ĐỘI XE KHẢ DỤNG ({filteredVehicles.length})
          </Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={13} color="#00A896" />
            <Text style={styles.filterButtonText}>Tùy chọn lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#00A896" />
            <Text style={styles.loadingText}>Đang đồng bộ dữ liệu đội xe...</Text>
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

      {/* Formal Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderStrip}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalContractTitle}>HỢP ĐỒNG THUÊ PHƯƠNG TIỆN ĐIỆN TỬ</Text>
                <Text style={styles.modalVehicleName}>{selectedVehicle?.name}</Text>
                <Text style={styles.modalPlateText}>Biển số đăng ký: {selectedVehicle?.plateNumber}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseIcon}>
                <Ionicons name="close" size={18} color="#4A6B74" />
              </TouchableOpacity>
            </View>

            {selectedVehicle && (
              <>
                <Text style={styles.modalSectionLabel}>THỜI LƯỢNG KHAI THÁC (THEO GIỜ):</Text>
                <View style={styles.durationRow}>
                  {[1, 2, 3, 5, 8, 24].map(h => (
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

                {/* Eco Impact Evaluation */}
                <CO2Widget
                  eco={{
                    distanceKm: Math.round(durationHours * 22),
                    co2SavedKg: Math.round(durationHours * 2.64 * 10) / 10,
                    treesEquivalent: Math.round((durationHours * 2.64 / 20) * 100) / 100,
                    ecoPointsEarned: durationHours * 26
                  }}
                />

                {/* Formal Price Sheet */}
                <View style={styles.priceSheet}>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Đơn giá niêm yết</Text>
                    <Text style={styles.sheetValue}>{selectedVehicle.hourlyPrice.toLocaleString('vi-VN')} VNĐ / giờ</Text>
                  </View>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Thời lượng đăng ký</Text>
                    <Text style={styles.sheetValue}>{durationHours} giờ</Text>
                  </View>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Ký quỹ thế chấp (eKYC bảo đảm)</Text>
                    <Text style={[styles.sheetValue, { color: '#00A896', fontWeight: '800' }]}>0 VNĐ (Miễn ký quỹ)</Text>
                  </View>
                  <View style={[styles.priceSheetRow, styles.totalPriceRow]}>
                    <Text style={styles.totalPriceLabel}>TỔNG CHI PHÍ TẠM TÍNH:</Text>
                    <Text style={styles.totalPriceValue}>
                      {(selectedVehicle.hourlyPrice * durationHours).toLocaleString('vi-VN')} VNĐ
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
                      <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.modalSubmitText}>KÝ SỐ VÀ NHẬN QUYỀN ĐIỀU KHIỂN</Text>
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
    paddingBottom: 85
  },
  heroDispatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeaderStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8
  },
  cardHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.6
  },
  systemTag: {
    backgroundColor: '#E0F7F4',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4
  },
  systemTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#008E7B'
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  modeTabTextActive: {
    color: '#00BFA5',
    fontWeight: '800'
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  fieldIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#E0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  fieldContent: {
    flex: 1
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2
  },
  policyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7F4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3
  },
  policyTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#008E7B',
    letterSpacing: 0.4
  },
  fieldSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BFA5',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  corridorBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  corridorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00BFA5'
  },
  corridorTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5EEAD4',
    letterSpacing: 0.5
  },
  corridorBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  corridorRoute: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  corridorDetail: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2
  },
  gaugeBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00BFA5'
  },
  gaugeValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  gaugeUnit: {
    color: '#5EEAD4',
    fontSize: 8,
    fontWeight: '700'
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 6
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5
  },
  categoryTabActive: {
    backgroundColor: '#00BFA5',
    borderColor: '#00BFA5'
  },
  categoryTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
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
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  filterButtonText: {
    fontSize: 11,
    color: '#00BFA5',
    fontWeight: '700'
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 8,
    fontSize: 11,
    color: '#4A6B74'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 37, 51, 0.75)',
    justifyContent: 'center',
    padding: 16
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D5EBE7',
    maxHeight: '90%'
  },
  modalHeaderStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF6F5',
    paddingBottom: 10,
    marginBottom: 12
  },
  modalContractTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00A896',
    letterSpacing: 0.8
  },
  modalVehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A2533',
    marginTop: 2
  },
  modalPlateText: {
    fontSize: 11,
    color: '#00897B',
    fontWeight: '700'
  },
  modalCloseIcon: {
    padding: 4
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4A6B74',
    marginBottom: 6,
    letterSpacing: 0.5
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F4F9F8',
    borderWidth: 1,
    borderColor: '#D5EBE7'
  },
  durationChipActive: {
    backgroundColor: '#00A896',
    borderColor: '#00A896'
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A6B74'
  },
  durationTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  priceSheet: {
    backgroundColor: '#F4F9F8',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#D5EBE7'
  },
  priceSheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  sheetLabel: {
    fontSize: 11,
    color: '#4A6B74'
  },
  sheetValue: {
    fontSize: 11,
    color: '#0A2533',
    fontWeight: '700'
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#D5EBE7',
    paddingTop: 6,
    marginTop: 4,
    marginBottom: 0
  },
  totalPriceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A2533'
  },
  totalPriceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00A896'
  },
  modalSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A896',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
    marginTop: 6
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8
  }
});
