import React, { useState, useEffect, useRef } from 'react';
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

const HERO_PROMOS = [
  {
    id: 'promo-1',
    title: 'Đồng Hành Sinh Viên UTH',
    subtitle: 'Trợ giá 50.000đ khi xuất phát từ các trạm ĐH GTVT TP.HCM',
    tag: '🎓 CHUYÊN ĐỀ UTH',
    voucherCode: 'UTH50K',
    btnText: 'Nhận trợ giá',
    bgColor: '#6F4E37',     // Nâu Cà Phê Warm Coffee
    accentColor: '#F6EFE9', // Be Sữa Foam
    icon: 'school'
  },
  {
    id: 'promo-2',
    title: 'Hành Trình Xanh: Giảm 20%',
    subtitle: 'Mọi dòng xe máy điện & ô tô tự lái tiết kiệm chi phí hôm nay',
    tag: '⚡ HÀNH TRÌNH XANH',
    voucherCode: 'ECOGO20',
    btnText: 'Lưu mã ngay',
    bgColor: '#4E3322',     // Deep Roasted Espresso
    accentColor: '#FAF7F2', // Warm Vanilla Milk
    icon: 'leaf'
  },
  {
    id: 'promo-3',
    title: 'Gói Quà Bạn Mới: Giảm 30%',
    subtitle: 'Ưu đãi chuyến đi đầu tiên cho thành viên mới gia nhập EcoGo',
    tag: '🎁 BẠN MỚI',
    voucherCode: 'BANMOI30',
    btnText: 'Nhận ưu đãi',
    bgColor: '#8C6239',     // Warm Roasted Latte
    accentColor: '#FAF7F2',
    icon: 'gift'
  },
  {
    id: 'promo-4',
    title: 'Dã Ngoại Cuối Tuần: Giảm 200K',
    subtitle: 'Thuê ô tô tự lái theo ngày - Tự do khám phá không lo tiền cọc',
    tag: '🏖️ CUỐI TUẦN',
    voucherCode: 'CUOITUAN200',
    btnText: 'Đặt xe ngay',
    bgColor: '#5D4037',     // Roasted Mocha
    accentColor: '#F6EFE9', // Be Sữa
    icon: 'compass'
  }
];

const HOT_VOUCHERS = [
  {
    code: 'BANMOI30',
    title: 'Giảm 30% chuyến đầu tiên',
    desc: 'Tối đa 80.000đ • Mọi dòng xe ô tô & xe máy',
    tag: 'BẠN MỚI',
    tagBg: '#ECFDF5',
    tagColor: '#059669',
    claimedPct: 88,
    expiry: 'Còn 3 ngày'
  },
  {
    code: 'ECOGO20',
    title: 'Giảm 20% Toàn Hệ Thống',
    desc: 'Tối đa 120.000đ • Áp dụng thuê giờ & ngày',
    tag: 'HOT NHẤT',
    tagBg: '#FEF2F2',
    tagColor: '#DC2626',
    claimedPct: 76,
    expiry: 'Còn 5 ngày'
  },
  {
    code: 'UTH50K',
    title: 'Giảm 50K Trạm ĐH GTVT',
    desc: 'Dành riêng SV & Giảng viên trường UTH',
    tag: 'ĐỘC QUYỀN UTH',
    tagBg: '#EFF6FF',
    tagColor: '#2563EB',
    claimedPct: 65,
    expiry: 'Hết tháng 11'
  },
  {
    code: 'FREESHIP',
    title: 'Miễn Phí Giao Xe Tận Nhà',
    desc: 'Giao nhanh 20 phút bán kính 5km quanh Hub',
    tag: '0Đ GIAO XE',
    tagBg: '#F0FDF4',
    tagColor: '#16A34A',
    claimedPct: 82,
    expiry: 'Còn 7 ngày'
  },
  {
    code: 'CUOITUAN200',
    title: 'Giảm 200K Thuê Ngày 24H',
    desc: 'Áp dụng cho gói thuê ô tô dịp cuối tuần',
    tag: 'DÃ NGOẠI',
    tagBg: '#F5F3FF',
    tagColor: '#7C3AED',
    claimedPct: 58,
    expiry: 'Cuối tuần'
  },
  {
    code: 'GIOVANG25',
    title: 'Flash Sale: Giảm 25.000đ',
    desc: 'Khung giờ vàng 11h-13h & 17h-19h hàng ngày',
    tag: 'GIỜ VÀNG',
    tagBg: '#FFFBEB',
    tagColor: '#D97706',
    claimedPct: 94,
    expiry: 'Hôm nay'
  }
];

const WEEKLY_CHECKIN_DAYS = [
  { day: 1, label: 'Thứ 2', reward: '+10 Xu', done: true },
  { day: 2, label: 'Thứ 3', reward: '+20 Xu', done: true },
  { day: 3, label: 'Thứ 4', reward: 'Voucher 15%', isToday: true, current: true },
  { day: 4, label: 'Thứ 5', reward: '+30 Xu' },
  { day: 5, label: 'Thứ 6', reward: '+50 Xu' },
  { day: 6, label: 'Thứ 7', reward: 'Free Ship' },
  { day: 7, label: 'CN', reward: '🎁 100K', isGrand: true }
];

const LUCKY_WHEEL_SECTORS = [
  { label: 'Giảm 50K UTH', code: 'UTH50K', type: 'VOUCHER', color: '#6F4E37' },
  { label: '+50 Xu Eco', coins: 50, type: 'COIN', color: '#D97706' },
  { label: 'Giảm 20%', code: 'ECOGO20', type: 'VOUCHER', color: '#8C6239' },
  { label: '+100 Xu Eco', coins: 100, type: 'COIN', color: '#4E3322' },
  { label: 'Free Ship 5KM', code: 'FREESHIP', type: 'VOUCHER', color: '#7C3AED' },
  { label: 'Bạn Mới 30%', code: 'BANMOI30', type: 'VOUCHER', color: '#059669' }
];

const SAVED_PLACES = [
  {
    id: 'hub-uth-01',
    shortName: 'UTH · Cơ sở 1 Võ Oanh',
    name: 'ĐH Giao Thông Vận Tải (UTH) - Cơ sở 1 Bình Thạnh',
    address: 'Số 2 Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM',
    distance: '0,4 km',
    availableVehicles: 8,
    availableCars: 5,
    availableBikes: 3,
    hasCharger: 'Sạc nhanh 150kW + Đổi pin 24/7',
    category: 'CAMPUS',
    icon: 'school-outline'
  },
  {
    id: 'hub-uth-03',
    shortName: 'UTH · Cơ sở 3 Tô Ký (Q.12)',
    name: 'ĐH Giao Thông Vận Tải (UTH) - Cơ sở 3 Tân Triều',
    address: 'Hẻm 70 Tô Ký, Phường Tân Chánh Hiệp, Quận 12, TP.HCM',
    distance: '7,2 km',
    availableVehicles: 6,
    availableCars: 3,
    availableBikes: 3,
    hasCharger: 'Sạc nhanh 120kW',
    category: 'CAMPUS',
    icon: 'school-outline'
  },
  {
    id: 'hub-dhdhqg-01',
    shortName: 'KTX ĐHQG TP.HCM (Khu B)',
    name: 'EcoGo Hub - Làng Đại Học Quốc Gia TP.HCM',
    address: 'Đường Tô Vĩnh Diện, Phường Đông Hòa, TP. Dĩ An & TP. Thủ Đức',
    distance: '12,4 km',
    availableVehicles: 15,
    availableCars: 5,
    availableBikes: 10,
    hasCharger: 'Sạc nhanh 120kW + Tủ đổi pin',
    category: 'CAMPUS',
    icon: 'school-outline'
  },
  {
    id: 'hub-chuvanan-01',
    shortName: 'Chu Văn An · Học Viện Cán Bộ',
    name: 'EcoGo Hub - Chu Văn An & Học Viện Cán Bộ',
    address: '85 Chu Văn An, Phường 26, Quận Bình Thạnh, TP.HCM',
    distance: '0,8 km',
    availableVehicles: 7,
    availableCars: 4,
    availableBikes: 3,
    hasCharger: 'Siêu sạc 180kW',
    category: 'CENTRAL',
    icon: 'location-outline'
  },
  {
    id: 'hub-landmark-01',
    shortName: 'Landmark 81 · Tân Cảng',
    name: 'EcoGo Station - Vinhomes Central Park & Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM',
    distance: '1,4 km',
    availableVehicles: 11,
    availableCars: 7,
    availableBikes: 4,
    hasCharger: 'Siêu sạc 250kW',
    category: 'CENTRAL',
    icon: 'business-outline'
  },
  {
    id: 'hub-metro-01',
    shortName: 'Ga Metro Bến Thành (Quận 1)',
    name: 'EcoGo Multimodal - Ga Trung Tâm Metro Bến Thành',
    address: 'Quảng trường Quách Thị Trang, Phường Bến Thành, Quận 1, TP.HCM',
    distance: '4,8 km',
    availableVehicles: 14,
    availableCars: 9,
    availableBikes: 5,
    hasCharger: 'Sạc nhanh 150kW',
    category: 'CENTRAL',
    icon: 'train-outline'
  },
  {
    id: 'hub-nguyenhue-01',
    shortName: 'Phố Đi Bộ Nguyễn Huệ (Q.1)',
    name: 'EcoGo Station - Phố Đi Bộ & UBND Thành Phố',
    address: '68 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    distance: '4,2 km',
    availableVehicles: 8,
    availableCars: 6,
    availableBikes: 2,
    hasCharger: 'Siêu sạc 250kW',
    category: 'CENTRAL',
    icon: 'trail-sign-outline'
  },
  {
    id: 'hub-tsn-01',
    shortName: 'Sân Bay Tân Sơn Nhất',
    name: 'EcoGo Airport Hub - Ga Quốc Nội & Quốc Tế TSN',
    address: 'Ga Quốc Nội, Đường Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
    distance: '6,5 km',
    availableVehicles: 12,
    availableCars: 12,
    availableBikes: 0,
    hasCharger: 'Sạc nhanh 180kW',
    category: 'AIRPORT',
    icon: 'airplane-outline'
  },
  {
    id: 'hub-thuthiem-01',
    shortName: 'KĐT Sala Thủ Thiêm',
    name: 'EcoGo Station - KĐT Sala & Đại Lộ Mai Chí Thọ',
    address: '10 Mai Chí Thọ, Phường An Lợi Đông, TP. Thủ Đức, TP.HCM',
    distance: '3,8 km',
    availableVehicles: 9,
    availableCars: 6,
    availableBikes: 3,
    hasCharger: 'Siêu sạc 250kW + Đổi pin',
    category: 'AIRPORT',
    icon: 'leaf-outline'
  },
  {
    id: 'charger-thaodien-01',
    shortName: 'Thảo Điền Pearl & Metro An Phú',
    name: 'EcoGo Hub - Thảo Điền Pearl & Ga Metro An Phú',
    address: '12 Quốc Hương, Phường Thảo Điền, TP. Thủ Đức, TP.HCM',
    distance: '3,1 km',
    availableVehicles: 5,
    availableCars: 3,
    availableBikes: 2,
    hasCharger: 'Sạc nhanh 180kW',
    category: 'AIRPORT',
    icon: 'storefront-outline'
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
  onOpenGreenRace,
  appliedVoucherCode,
  onClearAppliedVoucher
}) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [rentalPackageTab, setRentalPackageTab] = useState('HOURLY'); // 'HOURLY' | 'DAILY'
  const [glosaAdvisory, setGlosaAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Gamification, Vouchers & Event states
  const [savedVouchers, setSavedVouchers] = useState(['BANMOI30', 'ECOGO20', 'UTH50K']);
  const [selectedVoucherForBooking, setSelectedVoucherForBooking] = useState('BANMOI30');
  const [activePromoIdx, setActivePromoIdx] = useState(0);
  const [ecoCoins, setEcoCoins] = useState(180);
  const [ecoStreak, setEcoStreak] = useState(3);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [showLuckySpinModal, setShowLuckySpinModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDegree, setSpinDegree] = useState(0);
  const [spinResult, setSpinResult] = useState(null);

  // Modals, Filters & Scrolling
  const mainScrollRef = useRef(null);
  const [filterByStation, setFilterByStation] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const [stationCategoryTab, setStationCategoryTab] = useState('ALL');
  const [selectedPlace, setSelectedPlace] = useState(SAVED_PLACES[0]);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingToast, setBookingToast] = useState(null);

  // Handle external voucher application from Wallet Modal
  useEffect(() => {
    if (appliedVoucherCode) {
      if (!savedVouchers.includes(appliedVoucherCode)) {
        setSavedVouchers((prev) => [...prev, appliedVoucherCode]);
      }
      setSelectedVoucherForBooking(appliedVoucherCode);
      const targetVehicle = filteredVehicles[0] || vehicles[0];
      if (targetVehicle) {
        setBookingVehicle(targetVehicle);
        setShowBookingModal(true);
      }
      setBookingToast({
        title: `🎉 Đã kích hoạt mã ${appliedVoucherCode}!`,
        message: 'Mã ưu đãi đã được áp dụng trực tiếp vào đơn đặt xe của bạn.'
      });
      setTimeout(() => setBookingToast(null), 2500);
      if (onClearAppliedVoucher) onClearAppliedVoucher();
    }
  }, [appliedVoucherCode, vehicles]);

  // Dynamic realistic pickup & return times
  const formatTimeRange = (tab) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const startHour = pad(now.getHours());
    const startMin = pad(Math.floor(now.getMinutes() / 5) * 5);
    const startTimeStr = `${startHour}:${startMin}`;

    if (tab === 'DAILY') {
      return `Nhận ${startTimeStr} hôm nay → ${startTimeStr} ngày mai (24h)`;
    }
    const endH = (now.getHours() + 4) % 24;
    const endTimeStr = `${pad(endH)}:${startMin}`;
    const nextDay = now.getHours() + 4 >= 24 ? 'ngày mai' : 'hôm nay';
    return `Nhận ${startTimeStr} hôm nay → ${endTimeStr} ${nextDay} (4h)`;
  };

  // Auto-slide hero promo banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePromoIdx((prev) => (prev + 1) % HERO_PROMOS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSaveVoucher = (code) => {
    if (savedVouchers.includes(code)) {
      setBookingToast({
        title: 'Mã đã có trong ví ưu đãi',
        message: `Mã ${code} đã sẵn sàng trong mục thanh toán khi bạn đặt xe.`
      });
    } else {
      setSavedVouchers((prev) => [...prev, code]);
      setBookingToast({
        title: '🎉 Đã lưu mã thành công!',
        message: `Đã thêm mã ${code} vào ví ưu đãi của bạn. Chạm "Dùng ngay" để áp dụng.`
      });
    }
    setTimeout(() => setBookingToast(null), 3000);
  };

  const handleUseVoucher = (code) => {
    if (!savedVouchers.includes(code)) {
      setSavedVouchers((prev) => [...prev, code]);
    }
    setSelectedVoucherForBooking(code);
    const targetVehicle = filteredVehicles[0] || vehicles[0];
    if (targetVehicle) {
      setBookingVehicle(targetVehicle);
      setShowBookingModal(true);
    } else {
      setBookingToast({
        title: 'Đã kích hoạt mã ' + code,
        message: 'Vui lòng chọn dòng xe bạn thích bên dưới để đặt xe và nhận giảm giá.'
      });
      setTimeout(() => setBookingToast(null), 2500);
    }
  };

  const handleCheckin = () => {
    if (checkedInToday) return;
    setCheckedInToday(true);
    setEcoCoins((prev) => prev + 25);
    if (!savedVouchers.includes('ECOGO20')) {
      setSavedVouchers((prev) => [...prev, 'ECOGO20']);
    }
    setBookingToast({
      title: '🌟 Điểm danh thành công! (+25 Xu Eco)',
      message: 'Chuỗi 3 ngày liên tiếp. Mở khóa thêm Voucher giảm 20% ECOGO20!'
    });
    setTimeout(() => setBookingToast(null), 2500);
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);

    const randomSectorIdx = Math.floor(Math.random() * LUCKY_WHEEL_SECTORS.length);
    const prize = LUCKY_WHEEL_SECTORS[randomSectorIdx];
    const targetDeg = 360 * 5 + randomSectorIdx * 60;
    setSpinDegree(targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(prize);
      if (prize.type === 'COIN') {
        setEcoCoins((prev) => prev + prize.coins);
      } else if (prize.type === 'VOUCHER' && prize.code) {
        if (!savedVouchers.includes(prize.code)) {
          setSavedVouchers((prev) => [...prev, prize.code]);
        }
      }
    }, 2800);
  };

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
    if (filterByStation && selectedPlace) {
      const matchStation = v.stationId === selectedPlace.id;
      const anyMatchInStation = vehicles.some((item) => item.stationId === selectedPlace.id);
      if (anyMatchInStation && !matchStation) return false;
    }
    if (!vehicleSearchQuery.trim()) return true;
    const q = vehicleSearchQuery.toLowerCase();
    return (
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.brand && v.brand.toLowerCase().includes(q)) ||
      (v.plateNumber && v.plateNumber.toLowerCase().includes(q)) ||
      (v.type && v.type.toLowerCase().includes(q))
    );
  });

  const filteredStations = SAVED_PLACES.filter((p) => {
    if (stationCategoryTab === 'CAMPUS' && p.category !== 'CAMPUS') return false;
    if (stationCategoryTab === 'CENTRAL' && p.category !== 'CENTRAL') return false;
    if (stationCategoryTab === 'AIRPORT' && p.category !== 'AIRPORT') return false;

    if (!stationSearchQuery.trim()) return true;
    const q = stationSearchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      <ScrollView
        ref={mainScrollRef}
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
                style={styles.coinPill}
                activeOpacity={0.85}
                onPress={() => setShowLuckySpinModal(true)}
              >
                <Text style={styles.coinPillEmoji}>🪙</Text>
                <Text style={styles.coinPillText}>{ecoCoins} Xu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerVoucherPill}
                activeOpacity={0.85}
                onPress={onOpenRewards}
              >
                <Ionicons name="ticket" size={14} color="#6F4E37" />
                <Text style={styles.headerVoucherPillText}>Ví ưu đãi ({savedVouchers.length})</Text>
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

          {/* Compact Smart Booking Hub */}
          <View style={styles.smartBookingCard}>
            {/* 2-Tab Mode Switcher */}
            <View style={styles.packageTabsRow}>
              {[
                { id: 'HOURLY', label: 'Thuê theo giờ', icon: 'time-outline' },
                { id: 'DAILY', label: 'Thuê theo ngày (24h)', icon: 'calendar-outline' }
              ].map((tab) => {
                const active = rentalPackageTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.pkgTabBtn, active && styles.pkgTabBtnActive]}
                    onPress={() => setRentalPackageTab(tab.id)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={14}
                      color={active ? theme.primary : '#8E8E93'}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.pkgTabText, active && [styles.pkgTabTextActive, { color: theme.primary }]]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Station Selector Box (Spacious, Clear, Zero Truncation) */}
            <TouchableOpacity
              style={styles.stationCardBox}
              activeOpacity={0.88}
              onPress={() => setShowDestinationModal(true)}
            >
              <View style={styles.stationTopHeaderRow}>
                <View style={styles.stationHeaderLeftWrap}>
                  <View style={[styles.stationPinCircle, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons name="location" size={13} color={theme.primary} />
                  </View>
                  <Text style={[styles.stationSubLabel, { color: theme.primary }]}>ĐIỂM NHẬN & TRẢ XE</Text>
                </View>
                <View style={[styles.changeHubPill, { backgroundColor: theme.primarySoft }]}>
                  <Text style={[styles.changeHubLink, { color: theme.primary }]}>Đổi trạm</Text>
                  <Ionicons name="chevron-forward" size={11} color={theme.primary} />
                </View>
              </View>

              <Text style={styles.stationMainTitleText} numberOfLines={2}>
                {selectedPlace?.name || 'ĐH Giao Thông Vận Tải (UTH) - Cơ sở 1 Bình Thạnh'}
              </Text>

              <View style={styles.stationMetaRow}>
                <View style={styles.pulseLiveContainer}>
                  <View style={styles.pulseLiveDot} />
                  <Text style={styles.pulseLiveText}>
                    {selectedPlace?.availableVehicles || 8} xe sẵn sàng
                  </Text>
                </View>
                <Text style={styles.metaDotSep}>•</Text>
                <Text style={styles.stationDistPill}>Cách {selectedPlace?.distance || '0,4 km'}</Text>
                <Text style={styles.metaDotSep}>•</Text>
                <Ionicons name="time-outline" size={12} color="#8C6239" style={{ marginRight: 2 }} />
                <Text style={styles.stationTimeSummaryText} numberOfLines={1}>
                  {formatTimeRange(rentalPackageTab)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Quick Search Input */}
            <View style={styles.quickSearchBox}>
              <Ionicons name="search-outline" size={16} color="#8C6239" />
              <TextInput
                style={styles.quickSearchInput}
                value={vehicleSearchQuery}
                onChangeText={setVehicleSearchQuery}
                placeholder="Tìm dòng xe (VF 8, Ioniq 5, Feliz S, Klara S...)"
                placeholderTextColor="#A89F91"
              />
              {vehicleSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setVehicleSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#8C6239" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Booking Toast with Close Action */}
        {bookingToast && (
          <View style={[styles.toastBanner, { backgroundColor: '#2B180D' }]}>
            <Ionicons name="checkmark-circle" size={18} color="#D4AF37" />
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <Text style={styles.toastTitle}>{bookingToast.title}</Text>
              <Text style={styles.toastMsg}>{bookingToast.message}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setBookingToast(null)}
              style={styles.toastCloseBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color="#A89F91" />
            </TouchableOpacity>
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
            VOUCHER HOT TRONG NGÀY (LƯU MÃ TRONG 1 CHẠM)
           ============================================================ */}
        <View style={styles.vouchersHubSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="pricetags" size={18} color={theme.primary} />
              <Text style={styles.sectionMainTitle}>Voucher Hot Hôm Nay</Text>
              <View style={styles.hotFlameBadge}>
                <Text style={styles.hotFlameText}>🔥 HOT</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onOpenRewards}>
              <Text style={[styles.seeMapLink, { color: theme.primary }]}>
                Ví ưu đãi ({savedVouchers.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vouchersScrollContent}
          >
            {HOT_VOUCHERS.map((v) => {
              const isSaved = savedVouchers.includes(v.code);
              return (
                <View key={v.code} style={styles.voucherTicketCard}>
                  {/* Left Ticket Header & Badge */}
                  <View style={styles.vTicketTop}>
                    <View style={[styles.vTagBadge, { backgroundColor: v.tagBg }]}>
                      <Text style={[styles.vTagText, { color: v.tagColor }]}>{v.tag}</Text>
                    </View>
                    <Text style={styles.vExpiryText}>{v.expiry}</Text>
                  </View>

                  <Text style={styles.vTicketTitle}>{v.title}</Text>
                  <Text style={styles.vTicketDesc} numberOfLines={2}>{v.desc}</Text>

                  {/* Progress bar */}
                  <View style={styles.vProgressRow}>
                    <View style={styles.vProgressBarOuter}>
                      <View style={[styles.vProgressBarInner, { width: `${v.claimedPct}%` }]} />
                    </View>
                    <Text style={styles.vProgressText}>Đã nhận {v.claimedPct}%</Text>
                  </View>

                  {/* Action row */}
                  <View style={styles.vTicketBottomRow}>
                    <TouchableOpacity
                      style={[
                        styles.vSaveBtn,
                        isSaved && styles.vSaveBtnSaved
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleSaveVoucher(v.code)}
                    >
                      <Ionicons
                        name={isSaved ? 'checkmark-circle' : 'bookmark-outline'}
                        size={13}
                        color={isSaved ? '#FFFFFF' : theme.primary}
                      />
                      <Text style={[styles.vSaveBtnText, isSaved && styles.vSaveBtnTextSaved]}>
                        {isSaved ? 'Đã lưu' : 'Lưu mã'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.vUseNowBtn}
                      activeOpacity={0.85}
                      onPress={() => handleUseVoucher(v.code)}
                    >
                      <Text style={styles.vUseNowText}>Dùng ngay</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ============================================================
            GAMIFICATION: ECO-STREAK 7 NGÀY & VÒNG QUAY MAY MẮN
           ============================================================ */}
        <View style={styles.streakSection}>
          <View style={styles.streakCard}>
            <View style={styles.streakTopRow}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="sparkles" size={16} color="#F59E0B" />
                  <Text style={styles.streakTitle}>Điểm danh 7 ngày nhận quà</Text>
                </View>
                <Text style={styles.streakSub}>
                  {checkedInToday
                    ? '🎉 Bạn đã điểm danh hôm nay! Chuỗi 3 ngày liên tiếp.'
                    : 'Điểm danh liên tục để mở khóa Voucher 100K & Cúp Hiệp Sĩ Xanh.'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.luckySpinPillBtn}
                activeOpacity={0.85}
                onPress={() => setShowLuckySpinModal(true)}
              >
                <Text style={{ fontSize: 16 }}>🎡</Text>
                <Text style={styles.luckySpinPillText}>Vòng quay</Text>
              </TouchableOpacity>
            </View>

            {/* 7 Day Pills */}
            <View style={styles.checkinDaysRow}>
              {WEEKLY_CHECKIN_DAYS.map((d) => {
                const isClaimed = d.done || (d.isToday && checkedInToday);
                return (
                  <View
                    key={d.day}
                    style={[
                      styles.dayBox,
                      d.isToday && styles.dayBoxToday,
                      isClaimed && styles.dayBoxClaimed,
                      d.isGrand && styles.dayBoxGrand
                    ]}
                  >
                    <Text style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>
                      {d.label}
                    </Text>
                    <View style={styles.dayIconWrap}>
                      {isClaimed ? (
                        <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                      ) : (
                        <Text style={[styles.dayRewardText, d.isGrand && { color: '#D97706', fontWeight: '800' }]}>
                          {d.reward}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Checkin Action Button */}
            <TouchableOpacity
              style={[
                styles.checkinCtaBtn,
                checkedInToday && styles.checkinCtaBtnDone
              ]}
              activeOpacity={0.85}
              disabled={checkedInToday}
              onPress={handleCheckin}
            >
              <Ionicons
                name={checkedInToday ? 'checkmark-circle' : 'calendar'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.checkinCtaText}>
                {checkedInToday
                  ? 'Đã điểm danh hôm nay (+25 Xu Eco)'
                  : 'Điểm danh nhận quà ngay (+25 Xu Eco)'}
              </Text>
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

          {/* Active Station Filter Banner */}
          {filterByStation && selectedPlace && (
            <View style={styles.stationFilterBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Ionicons name="location" size={15} color="#6F4E37" />
                <Text style={styles.stationFilterBannerText} numberOfLines={1}>
                  Xe tại: <Text style={{ fontWeight: '800', color: '#2B180D' }}>{selectedPlace.shortName}</Text> ({filteredVehicles.length} xe)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.clearStationFilterBtn}
                activeOpacity={0.8}
                onPress={() => setFilterByStation(false)}
              >
                <Text style={styles.clearStationFilterText}>Xem tất cả trạm</Text>
                <Ionicons name="close-circle" size={14} color="#8C6239" />
              </TouchableOpacity>
            </View>
          )}

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
        <View style={styles.destModalOverlay}>
          <View style={styles.destModalContainer}>
          {/* Top Navigation Bar */}
          <View style={styles.destHeaderBar}>
            <TouchableOpacity
              style={styles.destBackBtn}
              onPress={() => setShowDestinationModal(false)}
            >
              <Ionicons name="arrow-back" size={22} color="#2B180D" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.currentLocTitle} numberOfLines={1}>
                Chọn điểm nhận & trả xe
              </Text>
              <Text style={styles.currentLocSub}>Mạng lưới giao nhận & trạm sạc TP.HCM</Text>
            </View>
          </View>

          {/* Search Input for Stations */}
          <View style={styles.destInputRow}>
            <View style={styles.destInputWrap}>
              <Ionicons name="search-outline" size={18} color="#8C6239" />
              <TextInput
                style={styles.destTextInput}
                value={stationSearchQuery}
                onChangeText={setStationSearchQuery}
                placeholder="Tìm trạm theo tên, trường học, quận..."
                placeholderTextColor="#A89F91"
              />
              {stationSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setStationSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#8C6239" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Station Category Filter Pills */}
          <View style={styles.stationCategoryScroll}>
            {[
              { id: 'ALL', label: 'Tất cả (10)' },
              { id: 'CAMPUS', label: 'Trường ĐH & UTH' },
              { id: 'CENTRAL', label: 'Trung tâm & Q.1' },
              { id: 'AIRPORT', label: 'Sân bay & Thủ Đức' }
            ].map((cat) => {
              const active = stationCategoryTab === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.stCatPill,
                    active && [styles.stCatPillActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
                  ]}
                  onPress={() => setStationCategoryTab(cat.id)}
                >
                  <Text style={[styles.stCatText, active && styles.stCatTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List of Real-World Stations */}
          <ScrollView style={styles.placesScroll} showsVerticalScrollIndicator={false}>
            {filteredStations.map((place) => {
              const isSelected = selectedPlace?.id === place.id;
              return (
                <View
                  key={place.id}
                  style={[
                    styles.stationItemCard,
                    isSelected && [styles.stationItemCardActive, { borderColor: theme.primary, backgroundColor: theme.beigeSoft }]
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => {
                      setSelectedPlace(place);
                      setFilterByStation(true);
                      setShowDestinationModal(false);
                      setBookingToast({
                        title: `📍 Đã chọn: ${place.shortName}`,
                        message: `${place.availableCars} ô tô & ${place.availableBikes} xe máy sẵn sàng phục vụ bạn.`
                      });
                      setTimeout(() => {
                        mainScrollRef.current?.scrollTo({ y: 350, animated: true });
                      }, 250);
                      setTimeout(() => setBookingToast(null), 3000);
                    }}
                  >
                    <View style={styles.stCardTopRow}>
                      <View style={[styles.placeIconCircle, { backgroundColor: theme.primarySoft }]}>
                        <Ionicons name={place.icon} size={18} color={theme.primary} />
                      </View>

                      <View style={{ flex: 1, marginHorizontal: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={styles.placeNameText} numberOfLines={1}>
                            {place.shortName}
                          </Text>
                          {isSelected && (
                            <View style={[styles.selectedPillBadge, { backgroundColor: theme.primary }]}>
                              <Text style={styles.selectedPillText}>Đang chọn</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.placeAddrText} numberOfLines={2}>
                          {place.address}
                        </Text>
                      </View>

                      <View style={styles.stDistBadge}>
                        <Ionicons name="navigate-outline" size={11} color="#6F4E37" />
                        <Text style={styles.stDistText}>{place.distance}</Text>
                      </View>
                    </View>

                    {/* Realtime Vehicle & Charging Badges */}
                    <View style={styles.stTagsRow}>
                      <View style={styles.stTagVehicle}>
                        <Ionicons name="car-outline" size={12} color="#4E3322" />
                        <Text style={styles.stTagVehicleText}>{place.availableCars} ô tô</Text>
                      </View>
                      <View style={styles.stTagVehicle}>
                        <Ionicons name="bicycle-outline" size={12} color="#8C6239" />
                        <Text style={styles.stTagVehicleText}>{place.availableBikes} xe máy</Text>
                      </View>
                      {place.hasCharger ? (
                        <View style={styles.stTagCharger}>
                          <Ionicons name="flash" size={11} color="#B45309" />
                          <Text style={styles.stTagChargerText}>{place.hasCharger}</Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>

                  {/* 2 Direct 1-Touch Action Buttons */}
                  <View style={styles.stActionBtnRow}>
                    <TouchableOpacity
                      style={styles.stViewVehiclesBtn}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedPlace(place);
                        setFilterByStation(true);
                        setShowDestinationModal(false);
                        setBookingToast({
                          title: `📍 Trạm: ${place.shortName}`,
                          message: `Đang hiển thị xe sẵn sàng đón bạn tại trạm này.`
                        });
                        setTimeout(() => {
                          mainScrollRef.current?.scrollTo({ y: 350, animated: true });
                        }, 250);
                        setTimeout(() => setBookingToast(null), 3000);
                      }}
                    >
                      <Ionicons name="eye-outline" size={13} color="#4E3322" />
                      <Text style={styles.stViewVehiclesText}>
                        Xem xe tại trạm ({place.availableVehicles || 8})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.stQuickBookBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedPlace(place);
                        setFilterByStation(true);
                        setShowDestinationModal(false);
                        const bestVeh = vehicles.find((v) => v.stationId === place.id) || vehicles[0];
                        if (bestVeh) {
                          setBookingVehicle(bestVeh);
                          setShowBookingModal(true);
                        }
                      }}
                    >
                      <Ionicons name="key" size={12} color="#D4AF37" />
                      <Text style={styles.stQuickBookText}>Thuê nhanh →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {/* Sandbox Notice Banner */}
            <View style={styles.demoNoticeBox}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#6F4E37" />
              <Text style={styles.demoNoticeText}>
                Hệ thống trạm thực tế TP.HCM phục vụ demo: Sau khi chọn điểm nhận xe, bạn có thể hoàn tất quy trình đặt xe và trải nghiệm tính năng cấp mã khóa Bluetooth BLE trực tiếp trên ứng dụng.
              </Text>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
        </View>
      </Modal>

      {/* ============================================================
          LUCKY SPIN WHEEL MODAL (VÒNG QUAY MAY MẮN)
         ============================================================ */}
      <Modal
        visible={showLuckySpinModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isSpinning && setShowLuckySpinModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.luckySpinCard}>
            <View style={styles.luckySpinHeader}>
              <View>
                <Text style={styles.luckySpinTitle}>Vòng Quay May Mắn</Text>
                <Text style={styles.luckySpinSub}>1 lượt quay miễn phí mỗi ngày • 100% trúng quà</Text>
              </View>
              <TouchableOpacity
                style={styles.closeSpinBtn}
                disabled={isSpinning}
                onPress={() => setShowLuckySpinModal(false)}
              >
                <Ionicons name="close" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Wheel graphic */}
            <View style={styles.wheelCenterWrap}>
              <View style={styles.wheelArrowDown}>
                <Ionicons name="triangle" size={24} color="#EF4444" style={{ transform: [{ rotate: '180deg' }] }} />
              </View>

              <View
                style={[
                  styles.wheelDisc,
                  {
                    transform: [{ rotate: `${spinDegree}deg` }]
                  }
                ]}
              >
                {LUCKY_WHEEL_SECTORS.map((sec, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.wheelSectorLabel,
                      {
                        transform: [
                          { rotate: `${idx * 60 + 30}deg` },
                          { translateY: -64 }
                        ]
                      }
                    ]}
                  >
                    <Text style={[styles.wheelSectorText, { color: sec.color }]}>{sec.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.wheelCenterHub}>
                <Ionicons name="sparkles" size={16} color="#F59E0B" />
              </View>
            </View>

            {/* Spin Result Banner */}
            {spinResult && (
              <View style={styles.spinResultBanner}>
                <Text style={{ fontSize: 24 }}>🎉</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spinResultTitle}>Chúc mừng bạn!</Text>
                  <Text style={styles.spinResultText}>
                    Bạn đã nhận được: {spinResult.label} ({spinResult.type === 'COIN' ? `+${spinResult.coins} Xu vào ví` : `Mã: ${spinResult.code}`})
                  </Text>
                </View>
              </View>
            )}

            {/* Spin Action Button */}
            <TouchableOpacity
              style={[
                styles.spinActionBtn,
                isSpinning && styles.spinActionBtnDisabled
              ]}
              activeOpacity={0.85}
              disabled={isSpinning}
              onPress={handleSpinWheel}
            >
              <Ionicons name={isSpinning ? 'reload-outline' : 'play'} size={18} color="#FFFFFF" />
              <Text style={styles.spinActionBtnText}>
                {isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY (MIỄN PHÍ)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Multi-Step Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        vehicle={bookingVehicle}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
        initialVoucherCode={selectedVoucherForBooking}
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
  stationCardBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    marginBottom: 10
  },
  stationTopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  stationHeaderLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  stationPinCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stationSubLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6
  },
  changeHubPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12
  },
  changeHubLink: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700'
  },
  stationMainTitleText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#2B180D',
    marginBottom: 8,
    lineHeight: 19
  },
  stationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6
  },
  pulseLiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  pulseLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669'
  },
  pulseLiveText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#047857'
  },
  metaDotSep: {
    fontSize: 11,
    color: '#BDB3A6'
  },
  stationDistPill: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#6F4E37'
  },
  stationTimeSummaryText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: '#6E6E73'
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
  stationFilterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5EFEB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E0D5',
    gap: 8
  },
  stationFilterBannerText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F4E37'
  },
  clearStationFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E0D5'
  },
  clearStationFilterText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#8C6239'
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
  destModalOverlay: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    alignItems: 'center'
  },
  destModalContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    paddingTop: 14,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center'
  },
  destHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DE'
  },
  destBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8E0D5'
  },
  currentLocTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '700',
    color: '#2B180D'
  },
  currentLocSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8C6239',
    marginTop: 2
  },
  destInputRow: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  destInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8E0D5'
  },
  destTextInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#2B180D'
  },
  stationCategoryScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10
  },
  stCatPill: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E0D5'
  },
  stCatPillActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  stCatText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#8C6239'
  },
  stCatTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  placesScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4
  },
  stationItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    marginBottom: 10,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1
  },
  stationItemCardActive: {
    borderColor: '#6F4E37',
    borderWidth: 1.5
  },
  stCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  placeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeNameText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#2B180D'
  },
  selectedPillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  selectedPillText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  placeAddrText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 3,
    lineHeight: 16
  },
  stDistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8
  },
  stDistText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37'
  },
  stTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F7F3EE',
    flexWrap: 'wrap'
  },
  stTagVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  stTagVehicleText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#4E3322'
  },
  stTagCharger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  stTagChargerText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309'
  },
  stActionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EAE1'
  },
  stViewVehiclesBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E8E0D5'
  },
  stViewVehiclesText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#4E3322'
  },
  stQuickBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#4E3322'
  },
  stQuickBookText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  demoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#E8E0D5',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 16
  },
  demoNoticeText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F4E37',
    lineHeight: 16
  },

  /* Header Coins & Badges */
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 4
  },
  coinPillEmoji: {
    fontSize: 13
  },
  coinPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309'
  },
  headerVoucherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 4
  },
  headerVoucherPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37'
  },
  toastCloseBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },

  /* ============================================================
     HERO PROMO BANNER CAROUSEL
     ============================================================ */
  promoCarouselContainer: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 4
  },
  heroPromoCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
    minHeight: 132
  },
  promoLeftCol: {
    flex: 1,
    paddingRight: 10
  },
  promoTagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6
  },
  promoTagText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.4
  },
  promoTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3
  },
  promoSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 15,
    marginBottom: 10
  },
  promoActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  promoCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5
  },
  promoCtaText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A'
  },
  promoQuickApplyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6
  },
  promoQuickApplyText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textDecorationLine: 'underline'
  },
  promoRightGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80
  },
  promoIconHalo: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  promoCodePillText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)'
  },
  promoDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8
  },
  promoDot: {
    height: 5,
    borderRadius: 3
  },
  promoDotActive: {
    width: 18,
    backgroundColor: '#6F4E37'
  },
  promoDotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1'
  },

  /* ============================================================
     HOT VOUCHERS HUB SECTION
     ============================================================ */
  vouchersHubSection: {
    marginTop: 18,
    paddingTop: 4
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  hotFlameBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  hotFlameText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626'
  },
  vouchersScrollContent: {
    paddingHorizontal: 16,
    gap: 12
  },
  voucherTicketCard: {
    width: 236,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between'
  },
  vTicketTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  vTagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  vTagText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800'
  },
  vExpiryText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500'
  },
  vTicketTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3
  },
  vTicketDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 10
  },
  vProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12
  },
  vProgressBarOuter: {
    flex: 1,
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden'
  },
  vProgressBarInner: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3
  },
  vProgressText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600'
  },
  vTicketBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  vSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4
  },
  vSaveBtnSaved: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  vSaveBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37'
  },
  vSaveBtnTextSaved: {
    color: '#FFFFFF'
  },
  vUseNowBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    borderRadius: 8
  },
  vUseNowText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  /* ============================================================
     GAMIFICATION: STREAK & CHECKIN
     ============================================================ */
  streakSection: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 6
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  streakTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  streakTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  streakSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16
  },
  luckySpinPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 4
  },
  luckySpinPillText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8'
  },
  checkinDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 12
  },
  dayBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  dayBoxToday: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF'
  },
  dayBoxClaimed: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0'
  },
  dayBoxGrand: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A'
  },
  dayLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4
  },
  dayLabelToday: {
    color: '#1D4ED8',
    fontWeight: '700'
  },
  dayIconWrap: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dayRewardText: {
    fontFamily: FONTS.family,
    fontSize: 8,
    fontWeight: '700',
    color: '#334155'
  },
  checkinCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6F4E37',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6
  },
  checkinCtaBtnDone: {
    backgroundColor: '#64748B'
  },
  checkinCtaText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  /* ============================================================
     LUCKY SPIN MODAL
     ============================================================ */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  luckySpinCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8
  },
  luckySpinHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  luckySpinTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  luckySpinSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  closeSpinBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  wheelCenterWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative'
  },
  wheelArrowDown: {
    position: 'absolute',
    top: -12,
    zIndex: 10
  },
  wheelDisc: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F8FAFC',
    borderWidth: 6,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  wheelSectorLabel: {
    position: 'absolute',
    width: 90,
    alignItems: 'center'
  },
  wheelSectorText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800'
  },
  wheelCenterHub: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 5
  },
  spinResultBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 10,
    gap: 10,
    marginVertical: 10
  },
  spinResultTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46'
  },
  spinResultText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#047857',
    marginTop: 1
  },
  spinActionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6F4E37',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8
  },
  spinActionBtnDisabled: {
    backgroundColor: '#94A3B8'
  },
  spinActionBtnText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5
  }
});
