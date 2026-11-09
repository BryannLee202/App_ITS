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
  Alert,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VehicleCard from '../components/VehicleCard';
import CO2Widget from '../components/CO2Widget';
import ApiService from '../services/api';

export default function HomeScreen({
  onNavigateToKey,
  onNavigateToMap,
  onNavigateToTrips,
  onOpenRewards
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [rentalMode, setRentalMode] = useState('HOURLY'); // 'HOURLY' | 'DAILY'

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
      console.warn('Error loading vehicles:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDurationHours(rentalMode === 'DAILY' ? 24 : 3);
    setModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedVehicle) return;
    try {
      setBookingLoading(true);
      const res = await ApiService.bookVehicle({
        vehicleId: selectedVehicle.id,
        rentalType: durationHours >= 24 ? 'DAILY' : 'HOURLY',
        durationHours,
        pickupStationId: selectedVehicle.stationId || 'hub-uth-01'
      });

      setModalVisible(false);
      Alert.alert(
        'Đặt Xe Thành Công',
        `Hợp đồng điện tử ${res.trip.contractNumber} đã kích hoạt.\nChìa khóa số Digital Key đã sẵn sàng để mở cửa xe.`,
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
      Alert.alert('Thông báo', err.message || 'Không thể tạo hợp đồng');
    } finally {
      setBookingLoading(false);
    }
  };

  const carCount = vehicles.filter((v) => v.category === 'CAR').length;
  const bikeCount = vehicles.filter((v) => v.category === 'MOTORBIKE').length;

  const filteredVehicles = vehicles.filter((v) => {
    const matchCategory =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'CAR' && v.category === 'CAR') ||
      (selectedFilter === 'MOTORBIKE' && v.category === 'MOTORBIKE');
    const matchSearch =
      !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================================================
            TẦNG 1: HEADER VỊ TRÍ NHẬN XE & THANH TÌM KIẾM THỰC DỤNG
        ========================================================= */}
        <View style={styles.headerCard}>
          {/* Top Location & eKYC Status Bar */}
          <View style={styles.locationTopBar}>
            <TouchableOpacity
              style={styles.stationSelector}
              activeOpacity={0.8}
              onPress={onNavigateToMap}
            >
              <View style={styles.locationPinCircle}>
                <Ionicons name="location" size={14} color="#DF8268" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stationSmallLabel}>Trạm nhận xe gần bạn</Text>
                <View style={styles.stationNameRow}>
                  <Text style={styles.stationNameText} numberOfLines={1}>
                    ĐH Giao thông Vận tải (UTH Cơ sở 1)
                  </Text>
                  <Ionicons name="chevron-down" size={14} color="#7A6A63" />
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.ekycVerifiedBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#527394" />
              <Text style={styles.ekycVerifiedText}>eKYC Đã duyệt</Text>
            </View>
          </View>

          {/* Search Capsule Bar */}
          <View style={styles.searchCapsule}>
            <Ionicons name="search" size={18} color="#7A6A63" style={styles.searchIcon} />
            <TextInput
              placeholder="Bạn muốn đi đâu, tìm dòng xe nào (VF8, VF3, Klara...)"
              placeholderTextColor="#A6968E"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#A6968E" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* =========================================================
            TẦNG 2: BỘ ĐÔI THẺ HERO CHỦ LỰC (CHUẨN BỐ CỤC GREEN SM)
        ========================================================= */}
        <View style={styles.heroCardsRow}>
          {/* Thẻ Trái: Thuê Ô tô Tự lái */}
          <TouchableOpacity
            style={[
              styles.heroCard,
              styles.heroCardCar,
              selectedFilter === 'CAR' && styles.heroCardSelectedBlue
            ]}
            activeOpacity={0.9}
            onPress={() => setSelectedFilter('CAR')}
          >
            <View style={styles.heroInfoCol}>
              <View style={styles.heroTagBlue}>
                <Ionicons name="shield-checkmark" size={11} color="#FFFFFF" />
                <Text style={styles.heroTagTextWhite}>0đ thế chấp</Text>
              </View>
              <Text style={styles.heroTitle}>Thuê Ô tô Tự lái</Text>
              <Text style={styles.heroSubtitle}>Nhận xe 24/7 • Mở khóa App</Text>
              <View style={styles.heroPriceRow}>
                <Text style={styles.heroPriceHighlight}>Từ 60.000đ</Text>
                <Text style={styles.heroPriceUnit}>/giờ</Text>
              </View>
            </View>

            <View style={styles.heroPhotoFrame}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=500&q=80'
                }}
                style={styles.heroVehiclePhoto}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>

          {/* Thẻ Phải: Thuê Xe máy điện */}
          <TouchableOpacity
            style={[
              styles.heroCard,
              styles.heroCardBike,
              selectedFilter === 'MOTORBIKE' && styles.heroCardSelectedCoral
            ]}
            activeOpacity={0.9}
            onPress={() => setSelectedFilter('MOTORBIKE')}
          >
            <View style={styles.heroInfoCol}>
              <View style={styles.heroTagCoral}>
                <Ionicons name="flash" size={11} color="#FFFFFF" />
                <Text style={styles.heroTagTextWhite}>Đổi pin 0đ</Text>
              </View>
              <Text style={styles.heroTitle}>Xe máy điện</Text>
              <Text style={styles.heroSubtitle}>Cốp rộng • Đi học & Đi làm</Text>
              <View style={styles.heroPriceRow}>
                <Text style={[styles.heroPriceHighlight, { color: '#C4684F' }]}>Từ 22.000đ</Text>
                <Text style={styles.heroPriceUnit}>/giờ</Text>
              </View>
            </View>

            <View style={styles.heroPhotoFrame}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=500&q=80'
                }}
                style={styles.heroVehiclePhoto}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* =========================================================
            TẦNG 3: LƯỚI 8 DỊCH VỤ TIỆN ÍCH (2 HÀNG x 4 Ô RÕ RÀNG)
        ========================================================= */}
        <View style={styles.servicesCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Dịch vụ & Tiện ích thông minh</Text>
            <TouchableOpacity onPress={onOpenRewards}>
              <Text style={styles.sectionActionLink}>Xem ưu đãi ▸</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.servicesGrid}>
            {/* 1. Thuê theo giờ */}
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => {
                setRentalMode('HOURLY');
                setSelectedFilter('ALL');
              }}
            >
              <View style={styles.promoBadgeCoral}>
                <Text style={styles.promoBadgeText}>-20%</Text>
              </View>
              <View style={[styles.serviceIconTile, { backgroundColor: '#FCEEE9' }]}>
                <Ionicons name="time" size={24} color="#DF8268" />
                <View style={styles.subCornerBadge}>
                  <Ionicons name="car-sport" size={10} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.serviceLabel}>Thuê theo giờ</Text>
            </TouchableOpacity>

            {/* 2. Thuê theo ngày */}
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => {
                setRentalMode('DAILY');
                setSelectedFilter('CAR');
              }}
            >
              <View style={[styles.serviceIconTile, { backgroundColor: '#EBF2F8' }]}>
                <Ionicons name="calendar" size={24} color="#6E92B5" />
                <View style={[styles.subCornerBadge, { backgroundColor: '#6E92B5' }]}>
                  <Ionicons name="sunny" size={10} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.serviceLabel}>Thuê theo ngày</Text>
            </TouchableOpacity>

            {/* 3. Chìa khóa số */}
            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToKey}>
              <View style={[styles.serviceIconTile, { backgroundColor: '#FDF6E4' }]}>
                <Ionicons name="key" size={24} color="#D49B35" />
                <View style={[styles.subCornerBadge, { backgroundColor: '#D49B35' }]}>
                  <Ionicons name="bluetooth" size={10} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.serviceLabel}>Chìa khóa số</Text>
            </TouchableOpacity>

            {/* 4. Trạm sạc & Hub */}
            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToMap}>
              <View style={[styles.serviceIconTile, { backgroundColor: '#EBF2F8' }]}>
                <Ionicons name="map" size={24} color="#527394" />
                <View style={[styles.subCornerBadge, { backgroundColor: '#527394' }]}>
                  <Ionicons name="flash" size={10} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.serviceLabel}>Bản đồ 6 Hub</Text>
            </TouchableOpacity>

            {/* 5. Làn sóng xanh GLOSA */}
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() =>
                Alert.alert(
                  'Hành lang Làn Sóng Xanh GLOSA',
                  'Tuyến UTH – Điện Biên Phủ – Mai Chí Thọ đang đồng bộ chu kỳ đèn 90s.\n\nVận tốc khuyến nghị: 45 km/h giúp xe qua trạm không phải dừng đèn đỏ, tiết kiệm 18.5% pin.'
                )
              }
            >
              <View style={styles.promoBadgeBlue}>
                <Text style={styles.promoBadgeText}>45km/h</Text>
              </View>
              <View style={[styles.serviceIconTile, { backgroundColor: '#E8F4EC' }]}>
                <Ionicons name="speedometer" size={24} color="#4C8C64" />
              </View>
              <Text style={styles.serviceLabel}>Làn sóng xanh</Text>
            </TouchableOpacity>

            {/* 6. Kết nối Metro & Bus */}
            <TouchableOpacity style={styles.serviceItem} onPress={onNavigateToMap}>
              <View style={[styles.serviceIconTile, { backgroundColor: '#EBF2F8' }]}>
                <Ionicons name="bus" size={24} color="#6E92B5" />
              </View>
              <Text style={styles.serviceLabel}>Metro & VinBus</Text>
            </TouchableOpacity>

            {/* 7. Hội viên Xanh */}
            <TouchableOpacity style={styles.serviceItem} onPress={onOpenRewards}>
              <View style={styles.promoBadgeGold}>
                <Text style={[styles.promoBadgeText, { color: '#7A5418' }]}>MỚI</Text>
              </View>
              <View style={[styles.serviceIconTile, { backgroundColor: '#FDF6E4' }]}>
                <Ionicons name="diamond" size={24} color="#D49B35" />
              </View>
              <Text style={styles.serviceLabel}>Hội viên Xanh</Text>
            </TouchableOpacity>

            {/* 8. Ưu đãi & Quà tặng */}
            <TouchableOpacity style={styles.serviceItem} onPress={onOpenRewards}>
              <View style={[styles.serviceIconTile, { backgroundColor: '#FCEEE9' }]}>
                <Ionicons name="gift" size={24} color="#DF8268" />
              </View>
              <Text style={styles.serviceLabel}>Ví Voucher</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================================
            TẦNG 4: KỆ TRƯỢT NGANG "XE GẦN BẠN NHẬN NGAY" (CAROUSEL)
        ========================================================= */}
        <View style={styles.nearbySection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.nearbyTitleRow}>
              <Ionicons name="sparkles" size={16} color="#DF8268" />
              <Text style={styles.sectionTitle}>Xe gần bạn • Mở khóa nhận ngay</Text>
            </View>
            <TouchableOpacity onPress={onNavigateToMap}>
              <Text style={styles.sectionActionLink}>Xem bản đồ ▸</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          >
            {vehicles.slice(0, 5).map((veh) => (
              <TouchableOpacity
                key={veh.id}
                style={styles.miniVehicleCard}
                activeOpacity={0.9}
                onPress={() => handleOpenBooking(veh)}
              >
                <View style={styles.miniImageWrap}>
                  <Image source={{ uri: veh.thumbnail }} style={styles.miniImage} />
                  <View style={styles.miniPriceBadge}>
                    <Text style={styles.miniPriceText}>
                      {Math.round(veh.hourlyPrice / 1000)}k/giờ
                    </Text>
                  </View>
                  <View style={styles.miniRatingPill}>
                    <Ionicons name="star" size={10} color="#F2C97D" />
                    <Text style={styles.miniRatingText}>{veh.rating}</Text>
                  </View>
                </View>

                <View style={styles.miniCardBody}>
                  <View style={styles.miniNameRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#6E92B5" />
                    <Text style={styles.miniVehName} numberOfLines={1}>
                      {veh.name}
                    </Text>
                  </View>
                  <Text style={styles.miniDistanceText}>
                    📍 {veh.stationId === 'hub-uth-01' ? 'Trạm UTH • 0.4 km' : 'Ga Metro • 1.1 km'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* =========================================================
            TẦNG 5: DANH MỤC ĐỘI XE CHI TIẾT & BỘ LỌC 3 TAB RÕ RÀNG
        ========================================================= */}
        <View style={styles.catalogSection}>
          {/* ITS GLOSA Status Strip */}
          <View style={styles.glosaBannerStrip}>
            <View style={styles.glosaIconCircle}>
              <Ionicons name="pulse" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.glosaBannerTitle}>
                Hành lang Làn sóng xanh: UTH – Điện Biên Phủ – Mai Chí Thọ
              </Text>
              <Text style={styles.glosaBannerSub}>
                Vận tốc đồng bộ đèn xanh: 45 km/h • Giảm 18.5% tiêu hao Pin
              </Text>
            </View>
          </View>

          {/* 3-Tab Clear Filter Bar */}
          <View style={styles.filterTabsRow}>
            <TouchableOpacity
              style={[styles.filterTabBtn, selectedFilter === 'ALL' && styles.filterTabBtnActive]}
              onPress={() => setSelectedFilter('ALL')}
            >
              <Ionicons
                name="grid-outline"
                size={14}
                color={selectedFilter === 'ALL' ? '#FFFFFF' : '#7A6A63'}
              />
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'ALL' && styles.filterTabTextActive
                ]}
              >
                Tất cả xe ({vehicles.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTabBtn, selectedFilter === 'CAR' && styles.filterTabBtnActive]}
              onPress={() => setSelectedFilter('CAR')}
            >
              <Ionicons
                name="car-sport-outline"
                size={15}
                color={selectedFilter === 'CAR' ? '#FFFFFF' : '#7A6A63'}
              />
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'CAR' && styles.filterTabTextActive
                ]}
              >
                Ô tô điện ({carCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTabBtn,
                selectedFilter === 'MOTORBIKE' && styles.filterTabBtnActive
              ]}
              onPress={() => setSelectedFilter('MOTORBIKE')}
            >
              <Ionicons
                name="bicycle-outline"
                size={15}
                color={selectedFilter === 'MOTORBIKE' ? '#FFFFFF' : '#7A6A63'}
              />
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'MOTORBIKE' && styles.filterTabTextActive
                ]}
              >
                Xe máy điện ({bikeCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Vehicle Cards List / Responsive Grid */}
          <View style={isDesktop ? styles.desktopCardGrid : styles.mobileCardList}>
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#DF8268" />
                <Text style={styles.loadingText}>Đang tải danh sách đội xe...</Text>
              </View>
            ) : (
              filteredVehicles.map((veh) => (
                <VehicleCard
                  key={veh.id}
                  vehicle={veh}
                  style={
                    isDesktop
                      ? { width: width > 1050 ? '31.8%' : '48.5%', marginHorizontal: 0 }
                      : null
                  }
                  onSelect={handleOpenBooking}
                  onBook={handleOpenBooking}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderStrip}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalContractTitle}>XÁC NHẬN HỢP ĐỒNG THUÊ XE</Text>
                <Text style={styles.modalVehicleName}>{selectedVehicle?.name}</Text>
                <Text style={styles.modalPlateText}>Biển số: {selectedVehicle?.plateNumber}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseKnob}
              >
                <Ionicons name="close" size={18} color="#2C221E" />
              </TouchableOpacity>
            </View>

            {selectedVehicle && (
              <>
                <Text style={styles.modalSectionLabel}>Chọn thời gian thuê:</Text>
                <View style={styles.durationRow}>
                  {[1, 2, 3, 5, 8, 24].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.durationChip,
                        durationHours === h && styles.durationChipActive
                      ]}
                      onPress={() => setDurationHours(h)}
                    >
                      <Text
                        style={[
                          styles.durationText,
                          durationHours === h && styles.durationTextActive
                        ]}
                      >
                        {h === 24 ? '1 Ngày (24h)' : `${h} Giờ`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <CO2Widget
                  eco={{
                    distanceKm: Math.round(durationHours * 22),
                    co2SavedKg: Math.round(durationHours * 2.64 * 10) / 10,
                    treesEquivalent: Math.round(durationHours * 0.13 * 100) / 100,
                    ecoPointsEarned: durationHours * 26
                  }}
                />

                <View style={styles.priceSheet}>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Đơn giá thuê ({durationHours} giờ)</Text>
                    <Text style={styles.sheetValue}>
                      {(selectedVehicle.hourlyPrice * durationHours).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Bảo hiểm chuyến đi & Phí trạm Hub</Text>
                    <Text style={styles.sheetValue}>Miễn phí (0 đ)</Text>
                  </View>
                  <View style={styles.priceSheetRow}>
                    <Text style={styles.sheetLabel}>Tiền thế chấp (eKYC Đã xác thực)</Text>
                    <Text style={[styles.sheetValue, { color: '#6E92B5' }]}>0 đ (Miễn cọc)</Text>
                  </View>
                  <View style={[styles.priceSheetRow, styles.totalPriceRow]}>
                    <Text style={styles.totalPriceLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalPriceValue}>
                      {(selectedVehicle.hourlyPrice * durationHours).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleConfirmBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.modalSubmitText}>XÁC NHẬN ĐẶT XE & NHẬN KHÓA SỐ</Text>
                      <View style={styles.submitKnobCircle}>
                        <Ionicons name="key" size={14} color="#DF8268" />
                      </View>
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
    backgroundColor: '#EFE5DC'
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 36
  },

  /* ==========================================
     TẦNG 1: HEADER VỊ TRÍ & TÌM KIẾM
  ========================================== */
  headerCard: {
    marginHorizontal: 16,
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4
  },
  locationTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  stationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8
  },
  locationPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCEEE9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stationSmallLabel: {
    fontSize: 10,
    color: '#8C7A70',
    fontWeight: '600'
  },
  stationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  stationNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C221E'
  },
  ekycVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4
  },
  ekycVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#527394'
  },
  searchCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F0E8',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E6D9CE'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C221E',
    fontWeight: '600'
  },
  clearBtn: {
    paddingLeft: 6
  },

  /* ==========================================
     TẦNG 2: BỘ ĐÔI THẺ HERO CHỦ LỰC
  ========================================== */
  heroCardsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 12
  },
  heroCard: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
    minHeight: 118
  },
  heroCardCar: {
    backgroundColor: '#EBF2F8'
  },
  heroCardBike: {
    backgroundColor: '#FCEEE9'
  },
  heroCardSelectedBlue: {
    borderColor: '#6E92B5',
    borderWidth: 2
  },
  heroCardSelectedCoral: {
    borderColor: '#DF8268',
    borderWidth: 2
  },
  heroInfoCol: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'space-between'
  },
  heroTagBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#6E92B5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginBottom: 6
  },
  heroTagCoral: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DF8268',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginBottom: 6
  },
  heroTagTextWhite: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2C221E'
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#7A6A63',
    fontWeight: '600',
    marginTop: 2
  },
  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6
  },
  heroPriceHighlight: {
    fontSize: 13,
    fontWeight: '900',
    color: '#527394'
  },
  heroPriceUnit: {
    fontSize: 10,
    color: '#7A6A63',
    fontWeight: '600',
    marginLeft: 2
  },
  heroPhotoFrame: {
    width: 82,
    height: 76,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FDFBF7',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3
  },
  heroVehiclePhoto: {
    width: '100%',
    height: '100%'
  },

  /* ==========================================
     TẦNG 3: LƯỚI 8 DỊCH VỤ TIỆN ÍCH
  ========================================== */
  servicesCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FDFBF7',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.11,
    shadowRadius: 16,
    elevation: 4
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2C221E'
  },
  sectionActionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DF8268'
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16
  },
  serviceItem: {
    width: '23%',
    alignItems: 'center',
    position: 'relative'
  },
  serviceIconTile: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative'
  },
  subCornerBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DF8268',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FDFBF7'
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C221E',
    marginTop: 7,
    textAlign: 'center'
  },
  promoBadgeCoral: {
    position: 'absolute',
    top: -6,
    right: 4,
    backgroundColor: '#DF8268',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 5
  },
  promoBadgeBlue: {
    position: 'absolute',
    top: -6,
    right: 2,
    backgroundColor: '#6E92B5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 5
  },
  promoBadgeGold: {
    position: 'absolute',
    top: -6,
    right: 6,
    backgroundColor: '#F2C97D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 5
  },
  promoBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF'
  },

  /* ==========================================
     TẦNG 4: KỆ TRƯỢT NGANG XE GẦN BẠN
  ========================================== */
  nearbySection: {
    marginTop: 16,
    paddingHorizontal: 16
  },
  nearbyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  carouselContainer: {
    gap: 12,
    paddingBottom: 6
  },
  miniVehicleCard: {
    width: 168,
    backgroundColor: '#FDFBF7',
    borderRadius: 18,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3
  },
  miniImageWrap: {
    width: '100%',
    height: 96,
    borderRadius: 13,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3EAE0'
  },
  miniImage: {
    width: '100%',
    height: '100%'
  },
  miniPriceBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#DF8268',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8
  },
  miniPriceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  miniRatingPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 34, 30, 0.78)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 7,
    gap: 3
  },
  miniRatingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  miniCardBody: {
    paddingTop: 8,
    paddingHorizontal: 2
  },
  miniNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  miniVehName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C221E',
    flex: 1
  },
  miniDistanceText: {
    fontSize: 10,
    color: '#7A6A63',
    marginTop: 3,
    fontWeight: '600'
  },

  /* ==========================================
     TẦNG 5: DANH MỤC ĐỘI XE & BỘ LỌC
  ========================================== */
  catalogSection: {
    marginTop: 14
  },
  glosaBannerStrip: {
    marginHorizontal: 16,
    backgroundColor: '#EBF2F8',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 14
  },
  glosaIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6E92B5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  glosaBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C221E'
  },
  glosaBannerSub: {
    fontSize: 11,
    color: '#527394',
    fontWeight: '600',
    marginTop: 1
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    gap: 8
  },
  filterTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  filterTabBtnActive: {
    backgroundColor: '#DF8268',
    borderColor: '#F5BFA9'
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6A63'
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#7A6A63'
  },
  desktopCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    rowGap: 16,
    width: '100%'
  },
  mobileCardList: {
    width: '100%'
  },

  /* ==========================================
     MODAL ĐẶT XE
  ========================================== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 34, 30, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FDFBF7',
    borderRadius: 28,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#2C221E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12
  },
  modalHeaderStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  modalContractTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DF8268',
    letterSpacing: 0.8
  },
  modalVehicleName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2C221E',
    marginTop: 2
  },
  modalPlateText: {
    fontSize: 11,
    color: '#7A6A63',
    marginTop: 2,
    fontWeight: '600'
  },
  modalCloseKnob: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5EFE8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C4B43',
    marginBottom: 8
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  durationChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#F5EFE8',
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  durationChipActive: {
    backgroundColor: '#DF8268',
    borderColor: '#F5BFA9'
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A6A63'
  },
  durationTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  priceSheet: {
    backgroundColor: '#F7F1E8',
    borderRadius: 18,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  priceSheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  sheetLabel: {
    fontSize: 11,
    color: '#7A6A63',
    fontWeight: '600'
  },
  sheetValue: {
    fontSize: 11,
    color: '#2C221E',
    fontWeight: '800'
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#E6D9CE',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  totalPriceLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2C221E'
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DF8268'
  },
  modalSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DF8268',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 10,
    marginTop: 8,
    shadowColor: '#DF8268',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  submitKnobCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
