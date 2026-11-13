import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import ApiService from '../services/api';

const SORT_OPTIONS = [
  { id: 'PRICE_ASC', label: 'Giá thuê thấp nhất', shortLabel: 'Giá thấp nhất' },
  { id: 'PRICE_DESC', label: 'Giá thuê cao nhất', shortLabel: 'Giá cao nhất' },
  { id: 'RANGE_DESC', label: 'Quãng đường pin xa nhất', shortLabel: 'Pin xa nhất' },
  { id: 'RATING_DESC', label: 'Đánh giá cao nhất (4.9+ ★)', shortLabel: 'Đánh giá cao' }
];

export default function VehiclesScreen({
  theme = THEME_PRESETS.BE_SUA_CAFE,
  initialCategory = 'CAR',
  onNavigateToKey,
  onNavigateHome,
  appliedVoucherCode,
  onClearAppliedVoucher
}) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryMode, setCategoryMode] = useState(initialCategory || 'CAR');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('PRICE_ASC');
  const [showSortModal, setShowSortModal] = useState(false);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingToast, setBookingToast] = useState(null);

  // Sync category if prop changes
  useEffect(() => {
    if (initialCategory) {
      setCategoryMode(initialCategory);
      setBrandFilter('ALL');
    }
  }, [initialCategory]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getVehicles('ALL');
      setVehicles(res.vehicles || []);
    } catch (err) {
      console.warn('Error fetching vehicles:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const availableBrands = useMemo(() => {
    const list = vehicles.filter((v) => v.category === categoryMode && v.brand);
    const brands = Array.from(new Set(list.map((v) => v.brand))).sort((a, b) => {
      if (a === 'VinFast') return -1;
      if (b === 'VinFast') return 1;
      return a.localeCompare(b);
    });
    return ['ALL', ...brands];
  }, [vehicles, categoryMode]);

  const filteredVehicles = useMemo(() => {
    let list = vehicles.filter((v) => v.category === categoryMode);

    if (brandFilter !== 'ALL') {
      list = list.filter((v) => v.brand?.toLowerCase() === brandFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          (v.name && v.name.toLowerCase().includes(q)) ||
          (v.brand && v.brand.toLowerCase().includes(q)) ||
          (v.model && v.model.toLowerCase().includes(q)) ||
          (v.plateNumber && v.plateNumber.toLowerCase().includes(q))
      );
    }

    list = [...list].sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return (a.hourlyPrice || 0) - (b.hourlyPrice || 0);
      if (sortBy === 'PRICE_DESC') return (b.hourlyPrice || 0) - (a.hourlyPrice || 0);
      if (sortBy === 'RANGE_DESC') return (b.rangeKm || 0) - (a.rangeKm || 0);
      if (sortBy === 'RATING_DESC') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    return list;
  }, [vehicles, categoryMode, brandFilter, searchQuery, sortBy]);

  const handleOpenBooking = (vehicle) => {
    setBookingVehicle(vehicle);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (result) => {
    setShowBookingModal(false);
    const vName = result?.vehicle?.name || bookingVehicle?.name || 'Phương tiện';
    const vPlate = result?.vehicle?.plateNumber || bookingVehicle?.plateNumber || '';
    setBookingToast({
      title: 'Ký hợp đồng & Thanh toán thành công',
      message: `${vName} (${vPlate}) đã sẵn sàng mở khóa Digital Key 24/7.`
    });
    setTimeout(() => {
      setBookingToast(null);
      if (onNavigateToKey) onNavigateToKey();
    }, 1400);
  };

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      {bookingToast && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#2D8A4E" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.toastTitle}>{bookingToast.title}</Text>
            <Text style={styles.toastSub}>{bookingToast.message}</Text>
          </View>
        </View>
      )}

      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftCol}>
          <Text style={styles.headerSub}>ECOGO MOBILITY FLEET</Text>
          <Text style={styles.headerTitle}>Thuê Xe Tự Lái 24/7</Text>
        </View>
        <TouchableOpacity
          style={styles.homeLinkBtn}
          onPress={onNavigateHome}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={15} color="#6F4E37" />
          <Text style={styles.homeLinkText}>Trang chủ</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Top Category Switcher Tabs */}
      <View style={styles.categoryToggleRow}>
        <TouchableOpacity
          style={[
            styles.categoryToggleBtn,
            categoryMode === 'CAR' && styles.categoryToggleBtnActive
          ]}
          onPress={() => {
            setCategoryMode('CAR');
            setBrandFilter('ALL');
          }}
          activeOpacity={0.85}
        >
          <Ionicons
            name="car-sport"
            size={16}
            color={categoryMode === 'CAR' ? '#FAF7F2' : '#6F4E37'}
          />
          <Text
            style={[
              styles.categoryToggleText,
              categoryMode === 'CAR' && styles.categoryToggleTextActive
            ]}
          >
            Ô tô tự lái ({vehicles.filter((v) => v.category === 'CAR').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryToggleBtn,
            categoryMode === 'MOTORBIKE' && styles.categoryToggleBtnActive
          ]}
          onPress={() => {
            setCategoryMode('MOTORBIKE');
            setBrandFilter('ALL');
          }}
          activeOpacity={0.85}
        >
          <Ionicons
            name="bicycle"
            size={16}
            color={categoryMode === 'MOTORBIKE' ? '#FAF7F2' : '#6F4E37'}
          />
          <Text
            style={[
              styles.categoryToggleText,
              categoryMode === 'MOTORBIKE' && styles.categoryToggleTextActive
            ]}
          >
            Xe máy điện ({vehicles.filter((v) => v.category === 'MOTORBIKE').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#8C7A6B" />
        <TextInput
          style={styles.searchInput}
          placeholder={
            categoryMode === 'CAR'
              ? 'Tìm xe ô tô (VF 8, Ioniq 5, CX-5, Corolla Cross...)'
              : 'Tìm xe máy điện (Feliz S, Klara S, Evo 200...)'
          }
          placeholderTextColor="#9C8B7E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#8C7A6B" />
          </TouchableOpacity>
        )}
      </View>

      {/* 4. Single-Line Brand Filter Bar */}
      <View style={styles.brandBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandScroll}
        >
          {availableBrands.map((brand) => {
            const active = brandFilter === brand;
            const count =
              brand === 'ALL'
                ? vehicles.filter((v) => v.category === categoryMode).length
                : vehicles.filter((v) => v.category === categoryMode && v.brand === brand).length;
            return (
              <TouchableOpacity
                key={brand}
                style={[styles.brandChip, active && styles.brandChipActive]}
                onPress={() => setBrandFilter(brand)}
                activeOpacity={0.8}
              >
                <Text style={[styles.brandChipText, active && styles.brandChipTextActive]}>
                  {brand === 'ALL' ? 'Tất cả hãng' : brand}
                </Text>
                <View style={[styles.brandCountBadge, active && styles.brandCountBadgeActive]}>
                  <Text style={[styles.brandCountText, active && styles.brandCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Meta Counter & Sort Dropdown */}
      <View style={styles.metaRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.metaCountText}>
            <Text style={{ fontWeight: '800', color: '#2B180D' }}>{filteredVehicles.length}</Text> xe khả dụng
          </Text>
          {(brandFilter !== 'ALL' || searchQuery.trim().length > 0 || sortBy !== 'PRICE_ASC') && (
            <TouchableOpacity
              style={styles.resetFilterBtn}
              activeOpacity={0.7}
              onPress={() => {
                setBrandFilter('ALL');
                setSearchQuery('');
                setSortBy('PRICE_ASC');
              }}
            >
              <Ionicons name="refresh" size={11} color="#6F4E37" />
              <Text style={styles.resetFilterText}>Đặt lại</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.sortDropdownBtn}
          activeOpacity={0.8}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical" size={13} color="#6F4E37" />
          <Text style={styles.sortDropdownText}>
            {SORT_OPTIONS.find((s) => s.id === sortBy)?.shortLabel || 'Giá thấp nhất'}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#8C7A6B" />
        </TouchableOpacity>
      </View>

      {/* 6. Vehicle List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadVehicles();
            }}
            tintColor="#6F4E37"
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#6F4E37" style={{ marginVertical: 36 }} />
        ) : filteredVehicles.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="car-outline" size={44} color="#A89F91" />
            <Text style={styles.emptyTitle}>Không tìm thấy xe phù hợp</Text>
            <Text style={styles.emptySub}>
              Vui lòng thử tìm kiếm từ khóa khác hoặc chuyển sang hãng xe khác.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={() => {
                setBrandFilter('ALL');
                setSearchQuery('');
              }}
            >
              <Text style={styles.emptyResetText}>Xem tất cả xe</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              accentColor={theme.primary || '#6F4E37'}
              onSelect={handleOpenBooking}
              onBook={handleOpenBooking}
            />
          ))
        )}
      </ScrollView>

      {/* Sort Options Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.sortModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <TouchableOpacity
            style={styles.sortModalSheet}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation && e.stopPropagation()}
          >
            <View style={styles.sortSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="swap-vertical" size={17} color="#6F4E37" />
                <Text style={styles.sortSheetTitle}>Sắp xếp danh sách xe</Text>
              </View>
              <TouchableOpacity
                style={styles.sortCloseBtn}
                onPress={() => setShowSortModal(false)}
                activeOpacity={0.75}
              >
                <Ionicons name="close" size={18} color="#2B180D" />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((opt) => {
              const isSelected = sortBy === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.sortOptionItem, isSelected && styles.sortOptionItemSelected]}
                  onPress={() => {
                    setSortBy(opt.id);
                    setShowSortModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sortOptionLabel, isSelected && styles.sortOptionLabelSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color="#6F4E37" />}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Booking Modal */}
      {showBookingModal && bookingVehicle && (
        <BookingModal
          visible={showBookingModal}
          vehicle={bookingVehicle}
          appliedVoucherCode={appliedVoucherCode}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  toastTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#1B5E20'
  },
  toastSub: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#2E7D32',
    marginTop: 1
  },

  /* Header */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8
  },
  headerLeftCol: {
    flex: 1
  },
  headerSub: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#8C7A6B',
    letterSpacing: 0.6
  },
  headerTitle: {
    fontFamily: FONTS.family,
    fontSize: 19,
    fontWeight: '800',
    color: '#2B180D',
    letterSpacing: -0.3,
    marginTop: 2
  },
  homeLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  homeLinkText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37',
    marginLeft: 4
  },

  /* Category Switcher Tabs */
  categoryToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 8
  },
  categoryToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    gap: 6
  },
  categoryToggleBtnActive: {
    backgroundColor: '#4E3322',
    borderColor: '#4E3322'
  },
  categoryToggleText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6F4E37'
  },
  categoryToggleTextActive: {
    color: '#FAF7F2',
    fontWeight: '800'
  },

  /* Search */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#2B180D',
    marginLeft: 8,
    paddingVertical: 0
  },

  /* Brand Filter Bar */
  brandBarWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8
  },
  brandScroll: {
    gap: 6,
    paddingVertical: 2
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  brandChipActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  brandChipText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#7E6B5C'
  },
  brandChipTextActive: {
    color: '#FAF7F2',
    fontWeight: '800'
  },
  brandCountBadge: {
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#F5EFEB'
  },
  brandCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)'
  },
  brandCountText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6F4E37'
  },
  brandCountTextActive: {
    color: '#FAF7F2'
  },

  /* Meta Row */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  metaCountText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#8C7A6B'
  },
  resetFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3
  },
  resetFilterText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#6F4E37'
  },
  sortDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    gap: 4
  },
  sortDropdownText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37'
  },

  /* Scroll list */
  scrollList: {
    flex: 1,
    paddingHorizontal: 16
  },
  scrollContent: {
    paddingBottom: 120
  },

  /* Empty state */
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#2B180D',
    marginTop: 10
  },
  emptySub: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#8C7A6B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16.5
  },
  emptyResetBtn: {
    backgroundColor: '#4E3322',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12
  },
  emptyResetText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#FAF7F2'
  },

  /* Sort modal */
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 18, 12, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sortModalSheet: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  sortSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3D7'
  },
  sortSheetTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#2B180D'
  },
  sortCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  sortOptionItemSelected: {
    borderColor: '#6F4E37',
    backgroundColor: '#F5EFEB'
  },
  sortOptionLabel: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#5C4A3C'
  },
  sortOptionLabelSelected: {
    fontWeight: '800',
    color: '#2B180D'
  }
});
