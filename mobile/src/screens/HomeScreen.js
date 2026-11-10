import React, { useState, useEffect } from 'react';
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
    title: 'Thứ 4 Ngày Xanh: Giảm 50%',
    subtitle: 'Mọi dòng xe máy điện & ô tô tự lái tiết kiệm nửa giá hôm nay',
    tag: '⚡ SIÊU HỘI TUẦN',
    voucherCode: 'XANH20',
    btnText: 'Lưu mã ngay',
    bgColor: '#00695C',
    accentColor: '#80CBC4',
    icon: 'leaf'
  },
  {
    id: 'promo-2',
    title: 'Gói Quà Bạn Mới 500.000đ',
    subtitle: 'Tặng combo 5 voucher cho 5 chuyến đi xanh đầu tiên',
    tag: '🎁 BẠN MỚI',
    voucherCode: 'CHAOXANH',
    btnText: 'Nhận 500K',
    bgColor: '#0284C7',
    accentColor: '#BAE6FD',
    icon: 'gift'
  },
  {
    id: 'promo-3',
    title: 'Đồng Hành Sinh Viên UTH',
    subtitle: 'Trợ giá 50.000đ khi xuất phát từ các trạm ĐH GTVT TP.HCM',
    tag: '🎓 CHUYÊN ĐỀ UTH',
    voucherCode: 'UTH50K',
    btnText: 'Nhận trợ giá',
    bgColor: '#C2410C',
    accentColor: '#FFEDD5',
    icon: 'school'
  },
  {
    id: 'promo-4',
    title: 'Dã Ngoại Cuối Tuần: Giảm 200K',
    subtitle: 'Thuê ô tô tự lái theo ngày - Tự do khám phá không lo tiền cọc',
    tag: '🏖️ CUỐI TUẦN',
    voucherCode: 'THUENGAY200',
    btnText: 'Đặt xe ngay',
    bgColor: '#6D28D9',
    accentColor: '#DDD6FE',
    icon: 'compass'
  }
];

const HOT_VOUCHERS = [
  {
    code: 'CHAOXANH',
    title: 'Giảm 30% chuyến đầu tiên',
    desc: 'Tối đa 80.000đ • Mọi dòng xe ô tô & xe máy',
    tag: 'BẠN MỚI',
    tagBg: '#ECFDF5',
    tagColor: '#059669',
    claimedPct: 88,
    expiry: 'Còn 3 ngày'
  },
  {
    code: 'XANH20',
    title: 'Giảm 20% Toàn Hệ Thống',
    desc: 'Tối đa 120.000đ • Áp dụng thuê giờ & ngày',
    tag: 'HOT NHẤT',
    tagBg: '#FEF2F2',
    tagColor: '#DC2626',
    claimedPct: 76,
    expiry: 'Còn 5 ngày'
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
    code: 'THUENGAY200',
    title: 'Giảm 200K Thuê Ngày 24H',
    desc: 'Áp dụng cho gói thuê ô tô dịp cuối tuần',
    tag: 'DÃ NGOẠI',
    tagBg: '#F5F3FF',
    tagColor: '#7C3AED',
    claimedPct: 58,
    expiry: 'Cuối tuần'
  },
  {
    code: 'FREESHIP5KM',
    title: 'Miễn Phí Giao Xe Tận Nhà',
    desc: 'Giao nhanh 20 phút bán kính 5km quanh Hub',
    tag: '0Đ GIAO XE',
    tagBg: '#F0FDF4',
    tagColor: '#16A34A',
    claimedPct: 82,
    expiry: 'Còn 7 ngày'
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
  { label: 'Giảm 50%', code: 'XANH50', type: 'VOUCHER', color: '#10B981' },
  { label: '+50 Xu Eco', coins: 50, type: 'COIN', color: '#3B82F6' },
  { label: 'Giảm 20%', code: 'XANH20', type: 'VOUCHER', color: '#F59E0B' },
  { label: '+100 Xu Eco', coins: 100, type: 'COIN', color: '#8B5CF6' },
  { label: 'Free Ship 5KM', code: 'FREESHIP5KM', type: 'VOUCHER', color: '#06B6D4' },
  { label: 'Xe 0 Đồng', code: 'CHAOXANH', type: 'VOUCHER', color: '#EF4444' }
];

const SAVED_PLACES = [
  {
    id: 'place-1',
    name: 'ĐH Giao Thông Vận Tải (UTH) - Cơ sở chính',
    address: 'Số 2 Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM',
    distance: '0,4 km',
    icon: 'location-outline'
  },
  {
    id: 'place-2',
    name: 'Ga Trung Tâm Bến Thành - Quận 1',
    address: 'Quảng trường Quách Thị Trang, Phường Bến Thành, Quận 1, TP.HCM',
    distance: '6,8 km',
    icon: 'train-outline'
  },
  {
    id: 'place-3',
    name: 'Khu Đô Thị Tân Cảng & Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM',
    distance: '1,4 km',
    icon: 'business-outline'
  },
  {
    id: 'place-4',
    name: 'Sân Bay Quốc Tế Tân Sơn Nhất (Ga Quốc Nội)',
    address: 'Đường Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
    distance: '8,5 km',
    icon: 'airplane-outline'
  },
  {
    id: 'place-5',
    name: 'Khu Đô Thị Mới Thủ Thiêm - Sala',
    address: 'Đại lộ Mai Chí Thọ, Phường An Khánh, TP. Thủ Đức, TP.HCM',
    distance: '4,2 km',
    icon: 'leaf-outline'
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
  onOpenGreenRace
}) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [rentalPackageTab, setRentalPackageTab] = useState('HOURLY'); // 'HOURLY' | 'DAILY'
  const [glosaAdvisory, setGlosaAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Gamification, Vouchers & Event states
  const [savedVouchers, setSavedVouchers] = useState(['CHAOXANH', 'XANH20']);
  const [selectedVoucherForBooking, setSelectedVoucherForBooking] = useState('CHAOXANH');
  const [activePromoIdx, setActivePromoIdx] = useState(0);
  const [ecoCoins, setEcoCoins] = useState(180);
  const [ecoStreak, setEcoStreak] = useState(3);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [showLuckySpinModal, setShowLuckySpinModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDegree, setSpinDegree] = useState(0);
  const [spinResult, setSpinResult] = useState(null);

  // Modals
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(SAVED_PLACES[0]);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingToast, setBookingToast] = useState(null);

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
      setTimeout(() => setBookingToast(null), 3000);
    }
  };

  const handleCheckin = () => {
    if (checkedInToday) return;
    setCheckedInToday(true);
    setEcoCoins((prev) => prev + 25);
    if (!savedVouchers.includes('XANH20')) {
      setSavedVouchers((prev) => [...prev, 'XANH20']);
    }
    setBookingToast({
      title: '🌟 Điểm danh thành công! (+25 Xu Eco)',
      message: 'Chuỗi 3 ngày liên tiếp. Mở khóa thêm Voucher giảm 20%!'
    });
    setTimeout(() => setBookingToast(null), 3500);
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
    if (!destinationQuery.trim()) return true;
    const q = destinationQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.plateNumber.toLowerCase().includes(q)
    );
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
                style={styles.headerCircleBtn}
                activeOpacity={0.85}
                onPress={onOpenRewards}
              >
                <Ionicons name="pricetag-outline" size={16} color="#1D1D1F" />
                {savedVouchers.length > 0 && (
                  <View style={styles.savedVoucherBadge}>
                    <Text style={styles.savedVoucherBadgeText}>{savedVouchers.length}</Text>
                  </View>
                )}
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

          {/* Compact Booking Widget */}
          <View style={styles.smartBookingCard}>
            {/* 2-Tab Mode Switcher */}
            <View style={styles.packageTabsRow}>
              {[
                { id: 'HOURLY', label: 'Thuê theo giờ' },
                { id: 'DAILY', label: 'Thuê theo ngày (24h)' }
              ].map((tab) => {
                const active = rentalPackageTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.pkgTabBtn, active && styles.pkgTabBtnActive]}
                    onPress={() => setRentalPackageTab(tab.id)}
                  >
                    <Text style={[styles.pkgTabText, active && styles.pkgTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Combined Station & Time Row (Compact, Easy to Tap) */}
            <TouchableOpacity
              style={styles.stationSelectorRow}
              activeOpacity={0.85}
              onPress={() => setShowDestinationModal(true)}
            >
              <View style={[styles.mintDotOuter, { backgroundColor: theme.primarySoft }]}>
                <View style={[styles.mintDotInner, { backgroundColor: theme.primary }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stationSelectedName} numberOfLines={1}>
                  {selectedPlace ? selectedPlace.name : 'ĐH Giao Thông Vận Tải (UTH)'}
                </Text>
                <Text style={styles.stationTimeSub} numberOfLines={1}>
                  {rentalPackageTab === 'DAILY'
                    ? 'Nhận 15:30 hôm nay → 15:30 ngày mai (24h)'
                    : 'Nhận 15:30 hôm nay → 19:30 hôm nay (4h)'}
                </Text>
              </View>
              <View style={[styles.changeHubPill, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.changeHubLink, { color: theme.primary }]}>Đổi trạm</Text>
              </View>
            </TouchableOpacity>

            {/* Quick Search Input */}
            <View style={styles.quickSearchBox}>
              <Ionicons name="search-outline" size={16} color="#8E8E93" />
              <TextInput
                style={styles.quickSearchInput}
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Tìm dòng xe (Ioniq 5, CX-5, Corolla Cross...)"
                placeholderTextColor="#8E8E93"
              />
              {destinationQuery.length > 0 && (
                <TouchableOpacity onPress={() => setDestinationQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Booking Toast */}
        {bookingToast && (
          <View style={[styles.toastBanner, { backgroundColor: '#1D1D1F' }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.primaryLight} />
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{bookingToast.title}</Text>
              <Text style={styles.toastMsg}>{bookingToast.message}</Text>
            </View>
          </View>
        )}

        {/* ============================================================
            PROMO BANNER CAROUSEL (SỰ KIỆN & FLASH SALE HOT)
           ============================================================ */}
        <View style={styles.promoCarouselContainer}>
          {(() => {
            const promo = HERO_PROMOS[activePromoIdx];
            return (
              <View style={[styles.heroPromoCard, { backgroundColor: promo.bgColor }]}>
                <View style={styles.promoLeftCol}>
                  <View style={[styles.promoTagBadge, { backgroundColor: promo.accentColor }]}>
                    <Text style={styles.promoTagText}>{promo.tag}</Text>
                  </View>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.promoSub} numberOfLines={2}>{promo.subtitle}</Text>
                  
                  <View style={styles.promoActionRow}>
                    <TouchableOpacity
                      style={styles.promoCtaBtn}
                      activeOpacity={0.85}
                      onPress={() => handleSaveVoucher(promo.voucherCode)}
                    >
                      <Ionicons
                        name={savedVouchers.includes(promo.voucherCode) ? 'checkmark-circle' : 'gift-outline'}
                        size={14}
                        color="#0F172A"
                      />
                      <Text style={styles.promoCtaText}>
                        {savedVouchers.includes(promo.voucherCode) ? 'Đã lưu' : promo.btnText}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.promoQuickApplyBtn}
                      activeOpacity={0.85}
                      onPress={() => handleUseVoucher(promo.voucherCode)}
                    >
                      <Text style={styles.promoQuickApplyText}>Dùng ngay →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.promoRightGraphic}>
                  <View style={[styles.promoIconHalo, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                    <Ionicons name={promo.icon} size={36} color="#FFFFFF" />
                  </View>
                  <Text style={styles.promoCodePillText}>Mã: {promo.voucherCode}</Text>
                </View>
              </View>
            );
          })()}

          {/* Dots Indicator */}
          <View style={styles.promoDotsRow}>
            {HERO_PROMOS.map((p, idx) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setActivePromoIdx(idx)}
                style={[
                  styles.promoDot,
                  activePromoIdx === idx ? styles.promoDotActive : styles.promoDotInactive
                ]}
              />
            ))}
          </View>
        </View>

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
              <Ionicons name="pricetags" size={18} color="#059669" />
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
                        color={isSaved ? '#FFFFFF' : '#059669'}
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
                        <Ionicons name="checkmark-circle" size={18} color="#059669" />
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
        <View style={styles.destModalContainer}>
          <View style={styles.destHeaderBar}>
            <TouchableOpacity
              style={styles.destBackBtn}
              onPress={() => setShowDestinationModal(false)}
            >
              <Ionicons name="arrow-back" size={22} color="#1D1D1F" />
            </TouchableOpacity>
            <Text style={styles.currentLocTitle} numberOfLines={1}>
              Chọn điểm nhận & trả xe
            </Text>
          </View>

          <View style={styles.destInputRow}>
            <View style={styles.destInputWrap}>
              <Ionicons name="search-outline" size={18} color="#8E8E93" />
              <TextInput
                style={styles.destTextInput}
                value={destinationQuery}
                onChangeText={setDestinationQuery}
                placeholder="Tìm trạm hoặc địa chỉ..."
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          <ScrollView style={styles.placesScroll}>
            {SAVED_PLACES.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeItemRow}
                onPress={() => {
                  setSelectedPlace(place);
                  setShowDestinationModal(false);
                }}
              >
                <View style={styles.placeLeftCol}>
                  <View style={[styles.placeIconCircle, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons name={place.icon} size={16} color={theme.primary} />
                  </View>
                  <Text style={styles.placeDistText}>{place.distance}</Text>
                </View>

                <View style={styles.placeCenterCol}>
                  <Text style={styles.placeNameText}>{place.name}</Text>
                  <Text style={styles.placeAddrText} numberOfLines={2}>
                    {place.address}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  stationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
    marginBottom: 8
  },
  mintDotOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mintDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  stationSelectedName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  stationTimeSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 2
  },
  changeHubPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99
  },
  changeHubLink: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700'
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
  destModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 14
  },
  destHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10
  },
  destBackBtn: {
    padding: 4
  },
  currentLocTitle: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  destInputRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBECE8'
  },
  destInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8
  },
  destTextInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 14,
    color: '#1D1D1F'
  },
  placesScroll: {
    flex: 1,
    paddingHorizontal: 16
  },
  placeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F0',
    gap: 12
  },
  placeLeftCol: {
    alignItems: 'center',
    width: 48
  },
  placeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeDistText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6E6E73',
    marginTop: 4,
    fontWeight: '600'
  },
  placeCenterCol: {
    flex: 1
  },
  placeNameText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  placeAddrText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
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
  savedVoucherBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  savedVoucherBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
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
    backgroundColor: '#059669'
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
    backgroundColor: '#059669',
    borderColor: '#059669'
  },
  vSaveBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
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
    backgroundColor: '#059669',
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
    backgroundColor: '#059669',
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
