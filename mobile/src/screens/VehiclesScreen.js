import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import ApiService from '../services/api';
import { DEFAULT_VEHICLES } from '../data/defaultVehicles';
import { useLanguage } from '../i18n';

const SORT_OPTIONS = [
  { id: 'PRICE_ASC', label: 'Giá thấp nhất', shortLabel: 'Giá thấp nhất', icon: 'arrow-down-outline' },
  { id: 'PRICE_DESC', label: 'Giá cao nhất', shortLabel: 'Giá cao nhất', icon: 'arrow-up-outline' },
  { id: 'RANGE_DESC', label: 'Pin đi xa nhất', shortLabel: 'Pin xa nhất', icon: 'battery-charging-outline' },
  { id: 'RATING_DESC', label: 'Đánh giá cao nhất', shortLabel: 'Đánh giá cao', icon: 'star-outline' }
];

const FUEL_OPTIONS = [
  { id: 'ALL', label: 'Tất cả', icon: null },
  { id: 'ELECTRIC', label: 'Xe điện', icon: 'flash-outline' },
  { id: 'HYBRID', label: 'Hybrid', icon: 'leaf-outline' },
  { id: 'GASOLINE', label: 'Xăng', icon: 'flame-outline' }
];

const SEAT_OPTIONS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: '2', label: '2 chỗ' },
  { id: '4_5', label: '4–5 chỗ' },
  { id: '7', label: '6–7 chỗ' }
];

const PRICE_OPTIONS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'UNDER_50K', label: '< 50k/h' },
  { id: 'UNDER_100K', label: '< 100k/h' },
  { id: 'UNDER_200K', label: '< 200k/h' },
  { id: 'ABOVE_200K', label: '> 200k/h' }
];

// Component cuộn ngang hỗ trợ kéo chuột, lăn chuột trên Web & vuốt chạm mượt trên Mobile
const DragHorizontalScroll = ({ children, contentContainerStyle }) => {
  const scrollRef = useRef(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const webProps =
    Platform.OS === 'web'
      ? {
          onWheel: (e) => {
            if (scrollRef.current) {
              const node = scrollRef.current.getScrollableNode
                ? scrollRef.current.getScrollableNode()
                : scrollRef.current;
              if (node && typeof node.scrollLeft === 'number' && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                node.scrollLeft += e.deltaY;
              }
            }
          },
          onMouseDown: (e) => {
            if (scrollRef.current) {
              const node = scrollRef.current.getScrollableNode
                ? scrollRef.current.getScrollableNode()
                : scrollRef.current;
              if (node) {
                dragState.current = {
                  isDown: true,
                  startX: e.pageX,
                  scrollLeft: node.scrollLeft || 0
                };
              }
            }
          },
          onMouseMove: (e) => {
            if (!dragState.current.isDown || !scrollRef.current) return;
            const node = scrollRef.current.getScrollableNode
              ? scrollRef.current.getScrollableNode()
              : scrollRef.current;
            if (node) {
              const walk = (e.pageX - dragState.current.startX) * 1.25;
              node.scrollLeft = dragState.current.scrollLeft - walk;
            }
          },
          onMouseUp: () => {
            dragState.current.isDown = false;
          },
          onMouseLeave: () => {
            dragState.current.isDown = false;
          }
        }
      : {};

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={contentContainerStyle}
      {...webProps}
    >
      {children}
    </ScrollView>
  );
};

export default function VehiclesScreen({
  theme = THEME_PRESETS.BE_SUA_CAFE,
  initialCategory = 'CAR',
  onNavigateToKey,
  onNavigateHome,
  appliedVoucherCode,
  onClearAppliedVoucher
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [vehicles, setVehicles] = useState(DEFAULT_VEHICLES);
  const [loading, setLoading] = useState(false);
  const VALID_CATEGORIES = ['CAR', 'LUXURY', 'MOTORBIKE', 'BICYCLE'];
  const normalizeCategory = (cat) => (VALID_CATEGORIES.includes(cat) ? cat : 'CAR');

  const [refreshing, setRefreshing] = useState(false);
  const [categoryMode, setCategoryMode] = useState(normalizeCategory(initialCategory));

  useEffect(() => {
    if (initialCategory) {
      setCategoryMode(normalizeCategory(initialCategory));
      resetSecondaryFilters();
    }
  }, [initialCategory]);
  
  // Advanced Filter states
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [fuelFilter, setFuelFilter] = useState('ALL');
  const [seatsFilter, setSeatsFilter] = useState('ALL');
  const [priceMaxFilter, setPriceMaxFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('PRICE_ASC');

  // Modals
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingToast, setBookingToast] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const resetSecondaryFilters = () => {
    setBrandFilter('ALL');
    setFuelFilter('ALL');
    setSeatsFilter('ALL');
    setPriceMaxFilter('ALL');
    setSearchQuery('');
  };

  const resetAllFilters = () => {
    resetSecondaryFilters();
    setSortBy('PRICE_ASC');
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getVehicles('ALL');
      if (res && res.vehicles && res.vehicles.length > 0) {
        setVehicles(res.vehicles);
      } else {
        setVehicles(DEFAULT_VEHICLES);
      }
    } catch (err) {
      console.warn('Error fetching vehicles, falling back to local dataset:', err.message);
      setVehicles(DEFAULT_VEHICLES);
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
      if (a === 'Mercedes-Benz') return -1;
      if (b === 'Mercedes-Benz') return 1;
      if (a === 'Honda') return -1;
      if (b === 'Honda') return 1;
      return a.localeCompare(b);
    });
    return ['ALL', ...brands];
  }, [vehicles, categoryMode]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (brandFilter !== 'ALL') count++;
    if (fuelFilter !== 'ALL') count++;
    if (seatsFilter !== 'ALL') count++;
    if (priceMaxFilter !== 'ALL') count++;
    if (sortBy !== 'PRICE_ASC') count++;
    return count;
  }, [brandFilter, fuelFilter, seatsFilter, priceMaxFilter, sortBy]);

  const filteredVehicles = useMemo(() => {
    let list = vehicles.filter((v) => v.category === categoryMode);

    // 1. Brand filter
    if (brandFilter !== 'ALL') {
      list = list.filter((v) => v.brand?.toLowerCase() === brandFilter.toLowerCase());
    }

    // 2. Fuel / Power type filter
    if (fuelFilter !== 'ALL') {
      list = list.filter((v) => v.powerType === fuelFilter);
    }

    // 3. Seats filter
    if (seatsFilter !== 'ALL') {
      if (seatsFilter === '2') {
        list = list.filter((v) => v.seats <= 2);
      } else if (seatsFilter === '4_5') {
        list = list.filter((v) => v.seats >= 4 && v.seats <= 5);
      } else if (seatsFilter === '7') {
        list = list.filter((v) => v.seats >= 6);
      }
    }

    // 4. Price filter
    if (priceMaxFilter !== 'ALL') {
      if (priceMaxFilter === 'UNDER_50K') {
        list = list.filter((v) => v.hourlyPrice <= 50000);
      } else if (priceMaxFilter === 'UNDER_100K') {
        list = list.filter((v) => v.hourlyPrice <= 100000);
      } else if (priceMaxFilter === 'UNDER_200K') {
        list = list.filter((v) => v.hourlyPrice <= 200000);
      } else if (priceMaxFilter === 'ABOVE_200K') {
        list = list.filter((v) => v.hourlyPrice > 200000);
      }
    }

    // 5. Search query
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

    // 6. Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return (a.hourlyPrice || 0) - (b.hourlyPrice || 0);
      if (sortBy === 'PRICE_DESC') return (b.hourlyPrice || 0) - (a.hourlyPrice || 0);
      if (sortBy === 'RANGE_DESC') return (b.rangeKm || 0) - (a.rangeKm || 0);
      if (sortBy === 'RATING_DESC') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    return list;
  }, [vehicles, categoryMode, brandFilter, fuelFilter, seatsFilter, priceMaxFilter, searchQuery, sortBy]);

  const totalInCategory = vehicles.filter((v) => v.category === categoryMode).length;

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

  // Bộ lọc thông minh theo từng phân khúc phương tiện (Không trùng lặp, không emoji thô)
  const quickChips = useMemo(() => {
    const chips = [];
    const addedLabels = new Set();
    const pushUnique = (chip) => {
      if (!addedLabels.has(chip.label)) {
        addedLabels.add(chip.label);
        chips.push(chip);
      }
    };

    pushUnique({
      id: 'ALL_RESET',
      label: 'Tất cả',
      icon: 'apps-outline',
      active: activeFiltersCount === 0,
      onPress: resetAllFilters
    });

    if (categoryMode === 'CAR') {
      pushUnique({
        id: 'QUICK_EV',
        label: 'Thuần điện',
        icon: 'flash-outline',
        active: fuelFilter === 'ELECTRIC',
        onPress: () => setFuelFilter((prev) => (prev === 'ELECTRIC' ? 'ALL' : 'ELECTRIC'))
      });
      pushUnique({
        id: 'QUICK_HEV',
        label: 'Hybrid',
        icon: 'leaf-outline',
        active: fuelFilter === 'HYBRID',
        onPress: () => setFuelFilter((prev) => (prev === 'HYBRID' ? 'ALL' : 'HYBRID'))
      });
      pushUnique({
        id: 'QUICK_5SEATS',
        label: '4–5 chỗ',
        icon: 'people-outline',
        active: seatsFilter === '4_5',
        onPress: () => setSeatsFilter((prev) => (prev === '4_5' ? 'ALL' : '4_5'))
      });
      pushUnique({
        id: 'QUICK_7SEATS',
        label: '7 chỗ',
        icon: 'people-outline',
        active: seatsFilter === '7',
        onPress: () => setSeatsFilter((prev) => (prev === '7' ? 'ALL' : '7'))
      });
      pushUnique({
        id: 'QUICK_PRICE',
        label: 'Dưới 100k/h',
        icon: 'pricetag-outline',
        active: priceMaxFilter === 'UNDER_100K',
        onPress: () => setPriceMaxFilter((prev) => (prev === 'UNDER_100K' ? 'ALL' : 'UNDER_100K'))
      });
    } else if (categoryMode === 'LUXURY') {
      pushUnique({
        id: 'QUICK_EV',
        label: 'Xe điện VIP',
        icon: 'flash-outline',
        active: fuelFilter === 'ELECTRIC',
        onPress: () => setFuelFilter((prev) => (prev === 'ELECTRIC' ? 'ALL' : 'ELECTRIC'))
      });
      pushUnique({
        id: 'QUICK_VIP_SEATS',
        label: '6–7 chỗ',
        icon: 'people-outline',
        active: seatsFilter === '7',
        onPress: () => setSeatsFilter((prev) => (prev === '7' ? 'ALL' : '7'))
      });
    } else if (categoryMode === 'MOTORBIKE') {
      pushUnique({
        id: 'QUICK_EV',
        label: 'Xe máy điện',
        icon: 'flash-outline',
        active: fuelFilter === 'ELECTRIC',
        onPress: () => setFuelFilter((prev) => (prev === 'ELECTRIC' ? 'ALL' : 'ELECTRIC'))
      });
      pushUnique({
        id: 'QUICK_PRICE_MOTO',
        label: 'Dưới 30k/h',
        icon: 'pricetag-outline',
        active: priceMaxFilter === 'UNDER_50K',
        onPress: () => setPriceMaxFilter((prev) => (prev === 'UNDER_50K' ? 'ALL' : 'UNDER_50K'))
      });
    } else if (categoryMode === 'BICYCLE') {
      pushUnique({
        id: 'QUICK_EBIKE',
        label: 'Trợ lực điện',
        icon: 'flash-outline',
        active: fuelFilter === 'ELECTRIC',
        onPress: () => setFuelFilter((prev) => (prev === 'ELECTRIC' ? 'ALL' : 'ELECTRIC'))
      });
      pushUnique({
        id: 'QUICK_CHEAP_BIKE',
        label: '10.000đ/h',
        icon: 'pricetag-outline',
        active: priceMaxFilter === 'UNDER_50K',
        onPress: () => setPriceMaxFilter((prev) => (prev === 'UNDER_50K' ? 'ALL' : 'UNDER_50K'))
      });
    }

    // Hãng xe (tự động lọc trùng)
    availableBrands.filter((b) => b !== 'ALL').forEach((brand) => {
      pushUnique({
        id: `BRAND_${brand}`,
        label: brand,
        active: brandFilter === brand,
        onPress: () => setBrandFilter((prev) => (prev === brand ? 'ALL' : brand))
      });
    });

    return chips;
  }, [categoryMode, fuelFilter, seatsFilter, priceMaxFilter, brandFilter, availableBrands, activeFiltersCount]);

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

      {/* 1. Sleek Compact Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeftCol}>
          <Text style={styles.headerSub}>ECOGO MOBILITY FLEET</Text>
          <Text style={styles.headerTitle}>
            {isEn ? '24/7 Self-Drive Fleet' : 'Thuê Xe Tự Lái 24/7'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.homeLinkBtn}
          onPress={onNavigateHome}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={14} color="#6F4E37" />
          <Text style={styles.homeLinkText}>{isEn ? 'Home' : 'Trang chủ'}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. TẦNG 1: SEARCH BAR GỘP CHUNG VỚI NÚT LỌC CHUYÊN SÂU */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={16} color="#8C7A6B" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              categoryMode === 'CAR'
                ? (isEn ? 'Search cars (VF 3, VF 5, Vios...)' : 'Tìm xe ô tô (VF 3, VF 5, Vios, CX-5...)')
                : categoryMode === 'LUXURY'
                ? (isEn ? 'Search luxury (S 450, Maybach, Taycan...)' : 'Tìm xe VIP (S 450, Maybach, Taycan...)')
                : categoryMode === 'MOTORBIKE'
                ? (isEn ? 'Search scooters (Vision, Air Blade, SH...)' : 'Tìm xe máy (Vision, Air Blade, SH...)')
                : (isEn ? 'Search e-bikes (DrgnFly, Giant, Trek...)' : 'Tìm xe đạp (DrgnFly, Giant, Trek...)')
            }
            placeholderTextColor="#9C8B7E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#8C7A6B" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterTriggerBtn, activeFiltersCount > 0 && styles.filterTriggerBtnActive]}
          activeOpacity={0.85}
          onPress={() => setShowFilterDrawer(true)}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={activeFiltersCount > 0 ? '#FAF7F2' : '#4E3322'}
          />
          <Text style={[styles.filterTriggerText, activeFiltersCount > 0 && styles.filterTriggerTextActive]}>
            {isEn ? 'Filter' : 'Lọc'}
          </Text>
          {activeFiltersCount > 0 && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. TẦNG 2A: PHÂN LOẠI PHƯƠNG TIỆN (HỖ TRỢ KÉO/LĂN CHUỘT & VUỐT NGANG) */}
      <View style={styles.categoryContainer}>
        <DragHorizontalScroll contentContainerStyle={styles.categoryScroll}>
          {/* CAR */}
          <TouchableOpacity
            style={[styles.catCapsule, categoryMode === 'CAR' && styles.catCapsuleActive]}
            onPress={() => {
              setCategoryMode('CAR');
              resetSecondaryFilters();
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name={categoryMode === 'CAR' ? 'car-sport' : 'car-sport-outline'}
              size={14}
              color={categoryMode === 'CAR' ? '#FAF7F2' : '#6F4E37'}
            />
            <Text style={[styles.catText, categoryMode === 'CAR' && styles.catTextActive]}>
              {isEn ? 'Cars' : 'Ô tô'} ({vehicles.filter((v) => v.category === 'CAR').length})
            </Text>
          </TouchableOpacity>

          {/* LUXURY */}
          <TouchableOpacity
            style={[styles.catCapsule, categoryMode === 'LUXURY' && styles.catCapsuleActive]}
            onPress={() => {
              setCategoryMode('LUXURY');
              resetSecondaryFilters();
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name={categoryMode === 'LUXURY' ? 'diamond' : 'diamond-outline'}
              size={13}
              color={categoryMode === 'LUXURY' ? '#D4AF37' : '#B45309'}
            />
            <Text style={[styles.catText, categoryMode === 'LUXURY' && styles.catTextActive]}>
              {isEn ? 'Luxury' : 'Hạng sang'} ({vehicles.filter((v) => v.category === 'LUXURY').length})
            </Text>
          </TouchableOpacity>

          {/* MOTORBIKE */}
          <TouchableOpacity
            style={[styles.catCapsule, categoryMode === 'MOTORBIKE' && styles.catCapsuleActive]}
            onPress={() => {
              setCategoryMode('MOTORBIKE');
              resetSecondaryFilters();
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name={categoryMode === 'MOTORBIKE' ? 'speedometer' : 'speedometer-outline'}
              size={14}
              color={categoryMode === 'MOTORBIKE' ? '#FAF7F2' : '#6F4E37'}
            />
            <Text style={[styles.catText, categoryMode === 'MOTORBIKE' && styles.catTextActive]}>
              {isEn ? 'Scooters' : 'Xe máy'} ({vehicles.filter((v) => v.category === 'MOTORBIKE').length})
            </Text>
          </TouchableOpacity>

          {/* BICYCLE */}
          <TouchableOpacity
            style={[styles.catCapsule, categoryMode === 'BICYCLE' && styles.catCapsuleActive]}
            onPress={() => {
              setCategoryMode('BICYCLE');
              resetSecondaryFilters();
            }}
            activeOpacity={0.85}
          >
            <Ionicons
              name={categoryMode === 'BICYCLE' ? 'leaf' : 'leaf-outline'}
              size={14}
              color={categoryMode === 'BICYCLE' ? '#FAF7F2' : '#52735E'}
            />
            <Text style={[styles.catText, categoryMode === 'BICYCLE' && styles.catTextActive]}>
              {isEn ? 'E-Bikes' : 'Xe đạp'} ({vehicles.filter((v) => v.category === 'BICYCLE').length})
            </Text>
          </TouchableOpacity>
        </DragHorizontalScroll>
      </View>

      {/* 4. TẦNG 2B: BỘ LỌC NHANH THÔNG MINH THEO PHÂN KHÚC (KÉO/CUỘN MƯỢT) */}
      <View style={styles.quickChipsContainer}>
        <DragHorizontalScroll contentContainerStyle={styles.quickChipsScroll}>
          {quickChips.map((chip) => (
            <TouchableOpacity
              key={chip.id}
              style={[styles.quickChip, chip.active && styles.quickChipActive]}
              onPress={chip.onPress}
              activeOpacity={0.78}
            >
              {chip.icon && (
                <Ionicons
                  name={chip.icon}
                  size={12}
                  color={chip.active ? '#FAF7F2' : '#6F4E37'}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text style={[styles.quickChipText, chip.active && styles.quickChipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </DragHorizontalScroll>
      </View>

      {/* 5. MICRO STATUS ROW: SỐ XE & NÚT SẮP XẾP */}
      <View style={styles.microStatusRow}>
        <Text style={styles.microStatusText}>
          Hiển thị <Text style={{ fontWeight: '800', color: '#2B180D' }}>{filteredVehicles.length}</Text>/{totalInCategory} xe
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {activeFiltersCount > 0 && (
            <TouchableOpacity
              style={styles.microResetBtn}
              activeOpacity={0.75}
              onPress={resetAllFilters}
            >
              <Ionicons name="refresh" size={11} color="#6F4E37" />
              <Text style={styles.microResetText}>Xóa lọc</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.microSortBtn}
            activeOpacity={0.8}
            onPress={() => setShowFilterDrawer(true)}
          >
            <Ionicons name="swap-vertical" size={12} color="#6F4E37" />
            <Text style={styles.microSortText}>
              {SORT_OPTIONS.find((s) => s.id === sortBy)?.shortLabel || 'Giá thấp nhất'}
            </Text>
            <Ionicons name="chevron-down" size={11} color="#8C7A6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. VEHICLE LIST */}
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
            colors={['#6F4E37']}
            tintColor="#6F4E37"
          />
        }
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6F4E37" />
            <Text style={{ fontFamily: FONTS.family, fontSize: 12, color: '#8C7A6B', marginTop: 10 }}>
              Đang tải danh sách xe EcoGo...
            </Text>
          </View>
        ) : filteredVehicles.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="car-outline" size={44} color="#C4B5A5" />
            <Text style={styles.emptyTitle}>Không tìm thấy xe phù hợp</Text>
            <Text style={styles.emptySub}>
              Vui lòng thử điều chỉnh bộ lọc hoặc xóa bớt tiêu chí tìm kiếm.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={resetAllFilters}
            >
              <Text style={styles.emptyResetText}>Xem tất cả xe ({totalInCategory})</Text>
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

      {/* =========================================================================
          MODAL: BỘ LỌC & SẮP XẾP CHUYÊN SÂU (ADVANCED FILTER DRAWER)
         ========================================================================= */}
      <Modal
        visible={showFilterDrawer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterDrawer(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setShowFilterDrawer(false)}
          />
          <View style={styles.drawerSheet}>
            {/* Sheet Handle */}
            <View style={styles.drawerHandleBar} />

            {/* Header */}
            <View style={styles.drawerHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="options-outline" size={18} color="#4E3322" />
                <Text style={styles.drawerTitle}>Bộ lọc & Sắp xếp</Text>
              </View>
              <TouchableOpacity
                style={styles.drawerCloseBtn}
                onPress={() => setShowFilterDrawer(false)}
                activeOpacity={0.75}
              >
                <Ionicons name="close" size={17} color="#2B180D" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Filter Options */}
            <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
              {/* 1. SẮP XẾP (Lưới 2x2 gọn gàng) */}
              <Text style={[styles.filterSectionTitle, { marginTop: 4 }]}>Tiêu chí sắp xếp</Text>
              <View style={styles.sortOptionsGrid}>
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = sortBy === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.sortChipItem, isSelected && styles.sortChipItemSelected]}
                      onPress={() => setSortBy(opt.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={14}
                        color={isSelected ? '#FAF7F2' : '#6F4E37'}
                      />
                      <Text
                        style={[styles.sortChipText, isSelected && styles.sortChipTextSelected]}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 2. LOẠI NĂNG LƯỢNG */}
              <Text style={styles.filterSectionTitle}>Nhiên liệu & Năng lượng</Text>
              <View style={styles.filterChipsRow}>
                {FUEL_OPTIONS.map((f) => {
                  const isSelected = fuelFilter === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.drawerPill, isSelected && styles.drawerPillActive]}
                      onPress={() => setFuelFilter(f.id)}
                      activeOpacity={0.8}
                    >
                      {f.icon && (
                        <Ionicons
                          name={f.icon}
                          size={12}
                          color={isSelected ? '#FAF7F2' : '#6F4E37'}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text style={[styles.drawerPillText, isSelected && styles.drawerPillTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 3. SỐ CHỖ NGỒI (CHỈ HIỆN KHI CHỌN Ô TÔ / XE HẠNG SANG) */}
              {(categoryMode === 'CAR' || categoryMode === 'LUXURY') && (
                <>
                  <Text style={styles.filterSectionTitle}>Số chỗ ngồi</Text>
                  <View style={styles.filterChipsRow}>
                    {SEAT_OPTIONS.map((s) => {
                      const isSelected = seatsFilter === s.id;
                      return (
                        <TouchableOpacity
                          key={s.id}
                          style={[styles.drawerPill, isSelected && styles.drawerPillActive]}
                          onPress={() => setSeatsFilter(s.id)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.drawerPillText, isSelected && styles.drawerPillTextActive]}>
                            {s.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* 4. MỨC GIÁ THUÊ */}
              <Text style={styles.filterSectionTitle}>Khoảng giá thuê</Text>
              <View style={styles.filterChipsRow}>
                {PRICE_OPTIONS.map((p) => {
                  const isSelected = priceMaxFilter === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.drawerPill, isSelected && styles.drawerPillActive]}
                      onPress={() => setPriceMaxFilter(p.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.drawerPillText, isSelected && styles.drawerPillTextActive]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 5. HÃNG SẢN XUẤT */}
              <Text style={styles.filterSectionTitle}>Hãng sản xuất</Text>
              <View style={styles.filterChipsRow}>
                {availableBrands.map((b) => {
                  const isSelected = brandFilter === b;
                  return (
                    <TouchableOpacity
                      key={b}
                      style={[styles.drawerPill, isSelected && styles.drawerPillActive]}
                      onPress={() => setBrandFilter(b)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.drawerPillText, isSelected && styles.drawerPillTextActive]}>
                        {b === 'ALL' ? 'Tất cả hãng' : b}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ height: 14 }} />
            </ScrollView>

            {/* Sticky Bottom Actions */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity
                style={styles.drawerResetBtn}
                onPress={resetAllFilters}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={14} color="#6F4E37" />
                <Text style={styles.drawerResetText}>Thiết lập lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerApplyBtn}
                onPress={() => setShowFilterDrawer(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.drawerApplyText}>
                  Áp dụng ({filteredVehicles.length} xe)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    paddingTop: 10,
    paddingBottom: 6
  },
  headerLeftCol: {
    flex: 1
  },
  headerSub: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8C7A6B',
    letterSpacing: 0.8
  },
  headerTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '800',
    color: '#2B180D',
    letterSpacing: -0.3,
    marginTop: 1
  },
  homeLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
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

  /* TẦNG 1: SEARCH & FILTER BUTTON ON ONE ROW */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EAE4DC'
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#2B180D',
    marginLeft: 7,
    paddingVertical: 0
  },
  filterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EAE4DC',
    gap: 4
  },
  filterTriggerBtnActive: {
    backgroundColor: '#4E3322',
    borderColor: '#4E3322'
  },
  filterTriggerText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#4E3322'
  },
  filterTriggerTextActive: {
    color: '#FAF7F2',
    fontWeight: '800'
  },
  activeBadge: {
    backgroundColor: '#D97706',
    borderRadius: 99,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 2
  },
  activeBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF'
  },

  /* TẦNG 2A: CATEGORY CAPSULE TABS */
  categoryContainer: {
    marginBottom: 8
  },
  categoryScroll: {
    paddingLeft: 16,
    paddingRight: 28,
    gap: 8,
    alignItems: 'center'
  },
  catCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5D6C9',
    gap: 6
  },
  catCapsuleActive: {
    backgroundColor: '#4E3322',
    borderColor: '#4E3322'
  },
  catText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37'
  },
  catTextActive: {
    color: '#FAF7F2',
    fontWeight: '800'
  },

  /* TẦNG 2B: QUICK CHIPS 1 DÒNG */
  quickChipsContainer: {
    marginBottom: 10
  },
  quickChipsScroll: {
    paddingLeft: 16,
    paddingRight: 28,
    gap: 7,
    alignItems: 'center'
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D6C9'
  },
  quickChipActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  quickChipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#6F4E37'
  },
  quickChipTextActive: {
    color: '#FAF7F2',
    fontWeight: '800'
  },

  /* MICRO STATUS ROW */
  microStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  microStatusText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8C7A6B'
  },
  microResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    gap: 2
  },
  microResetText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6F4E37'
  },
  microSortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    gap: 4
  },
  microSortText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6F4E37'
  },

  /* VEHICLE LIST SCROLL */
  scrollList: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 110
  },

  /* EMPTY STATE */
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
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

  /* =========================================================================
     MODAL DRAWER STYLES
     ========================================================================= */
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 18, 12, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  drawerSheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '78%',
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 10
  },
  drawerHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5C7B6',
    alignSelf: 'center',
    marginBottom: 10
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE2D5'
  },
  drawerTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#2B180D'
  },
  drawerCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerBody: {
    marginTop: 8,
    flexShrink: 1
  },
  filterSectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#4E3322',
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.1
  },
  sortOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sortChipItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 11,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5D6C9',
    gap: 6
  },
  sortChipItemSelected: {
    backgroundColor: '#4E3322',
    borderColor: '#4E3322'
  },
  sortChipText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#5C4A3C',
    flex: 1
  },
  sortChipTextSelected: {
    fontWeight: '700',
    color: '#FAF7F2'
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  drawerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5D6C9'
  },
  drawerPillActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  drawerPillText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#5C4A3C'
  },
  drawerPillTextActive: {
    color: '#FAF7F2',
    fontWeight: '800'
  },
  drawerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  drawerResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    gap: 4
  },
  drawerResetText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37'
  },
  drawerApplyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: '#4E3322'
  },
  drawerApplyText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#FAF7F2'
  }
});
