import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import VehicleCard from '../components/VehicleCard';
import BookingModal from '../components/BookingModal';
import VoucherWalletModal from '../components/VoucherWalletModal';
import ApiService from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả xe' },
  { id: 'CAR', label: 'Ô tô tự lái' },
  { id: 'MOTORBIKE', label: 'Xe máy điện' }
];

const SORT_OPTIONS = [
  { id: 'PRICE_ASC', label: 'Giá thấp → cao', shortLabel: 'Giá thấp nhất', icon: 'trending-up-outline' },
  { id: 'PRICE_DESC', label: 'Giá cao → thấp', shortLabel: 'Giá cao nhất', icon: 'trending-down-outline' },
  { id: 'RANGE_DESC', label: 'Pin / Tầm xa nhất', shortLabel: 'Pin xa nhất', icon: 'battery-charging-outline' },
  { id: 'RATING_DESC', label: 'Đánh giá cao nhất', shortLabel: 'Đánh giá cao', icon: 'star-outline' }
];

const HERO_PROMOS = [
  {
    id: 'promo-1',
    title: 'Đặc Quyền Hội Viên Prime',
    subtitle: 'Trợ giá 50.000đ khi xuất phát từ hệ thống trạm EcoGo Hub toàn thành phố',
    tag: '⭐ ĐẶC QUYỀN PRIME',
    voucherCode: 'PRIME50K',
    btnText: 'Nhận ưu đãi',
    bgColor: '#6F4E37',     // Nâu Cà Phê Warm Coffee
    accentColor: '#F6EFE9', // Be Sữa Foam
    icon: 'star'
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
    code: 'PRIME50K',
    title: 'Giảm 50K Thành Viên Prime',
    desc: 'Đặc quyền cho khách hàng thân thiết EcoGo Mobility',
    tag: 'ĐẶC QUYỀN PRIME',
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

const DEFAULT_CHECKIN_DAYS = [
  { day: 1, label: 'Thứ 2', reward: '+15 Xu' },
  { day: 2, label: 'Thứ 3', reward: '+20 Xu' },
  { day: 3, label: 'Thứ 4', reward: 'Voucher 20%' },
  { day: 4, label: 'Thứ 5', reward: '+30 Xu & 50K' },
  { day: 5, label: 'Thứ 6', reward: '+50 Xu' },
  { day: 6, label: 'Thứ 7', reward: 'Free Ship' },
  { day: 7, label: 'CN', reward: '🎁 100K', isGrand: true }
];

const LUCKY_WHEEL_SECTORS = [
  { label: 'Giảm 50K Prime', code: 'PRIME50K', type: 'VOUCHER', color: '#6F4E37' },
  { label: '+50 Xu Eco', coins: 50, type: 'COIN', color: '#D97706' },
  { label: 'Giảm 20%', code: 'ECOGO20', type: 'VOUCHER', color: '#8C6239' },
  { label: '+100 Xu Eco', coins: 100, type: 'COIN', color: '#4E3322' },
  { label: 'Free Ship 5KM', code: 'FREESHIP', type: 'VOUCHER', color: '#7C3AED' },
  { label: 'Bạn Mới 30%', code: 'BANMOI30', type: 'VOUCHER', color: '#059669' }
];

const SAVED_PLACES = [
  {
    id: 'hub-landmark-01',
    shortName: 'EcoGo · Hub Landmark',
    name: 'EcoGo Hub Landmark - Điện Biên Phủ, Bình Thạnh',
    address: 'Số 208 Nguyễn Hữu Cảnh / Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
    distance: '0,4 km',
    availableVehicles: 8,
    availableCars: 5,
    availableBikes: 3,
    hasCharger: 'Sạc nhanh 150kW + Đổi pin 24/7',
    category: 'CAMPUS',
    icon: 'business-outline'
  },
  {
    id: 'hub-tech-03',
    shortName: 'EcoGo · Hub Khu Công Nghệ',
    name: 'EcoGo Hub Tech - Khu Công Nghệ Cao, TP. Thủ Đức',
    address: 'Đường D1, Khu Công Nghệ Cao, Tăng Nhơn Phú B, TP. Thủ Đức, TP.HCM',
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
  theme = THEME_PRESETS.BE_SUA_CAFE,
  onSelectVehicle,
  onNavigateToVehicles,
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
  const [liveGlosa, setLiveGlosa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Gamification, Vouchers & Event states
  const [savedVouchers, setSavedVouchers] = useState(['BANMOI30', 'ECOGO20', 'PRIME50K']);
  const [selectedVoucherForBooking, setSelectedVoucherForBooking] = useState('BANMOI30');
  const [activePromoIdx, setActivePromoIdx] = useState(0);
  const [ecoCoins, setEcoCoins] = useState(180);
  const [ecoStreak, setEcoStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkinDays, setCheckinDays] = useState(DEFAULT_CHECKIN_DAYS);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [nextReward, setNextReward] = useState(null);
  const [showLuckySpinModal, setShowLuckySpinModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDegree, setSpinDegree] = useState(0);
  const [spinResult, setSpinResult] = useState(null);

  // Modals, Filters & Scrolling
  const mainScrollRef = useRef(null);
  const [filterByStation, setFilterByStation] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showDoorstepModal, setShowDoorstepModal] = useState(false);
  const [showGlosaModal, setShowGlosaModal] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const [stationCategoryTab, setStationCategoryTab] = useState('ALL');
  const [selectedPlace, setSelectedPlace] = useState(SAVED_PLACES[0]);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [bookingDeliveryMode, setBookingDeliveryMode] = useState('STATION'); // 'STATION' | 'DOORSTEP'
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showVoucherWalletModal, setShowVoucherWalletModal] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState('AVAILABLE');
  const [bookingToast, setBookingToast] = useState(null);

  // Dedicated Fleet Catalog View State ('CAR' | 'MOTORBIKE' | null)
  const [catalogMode, setCatalogMode] = useState(null);
  const [catalogBrand, setCatalogBrand] = useState('ALL');
  const [catalogSortBy, setCatalogSortBy] = useState('PRICE_ASC'); // 'PRICE_ASC' | 'PRICE_DESC' | 'RANGE_DESC' | 'RATING_DESC'
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);

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

  // Live IoT & AI GLOSA Realtime Heartbeat (<2s latency)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveGlosa = async () => {
      try {
        const res = await ApiService.getRealtimeGLOSA(10.8018, 106.7142, 38);
        if (res && res.data && isMounted) {
          setLiveGlosa(res.data);
          setGlosaAdvisory(res.data.telematics);
        }
      } catch (e) {
        // network fallback
      }
    };

    fetchLiveGlosa();
    const interval = setInterval(fetchLiveGlosa, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 1-second Countdown Ticker for Traffic Light
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveGlosa((prev) => {
        if (!prev || !prev.nearestIntersection) return prev;
        const currentSec = prev.nearestIntersection.secondsRemaining;
        if (currentSec <= 1) {
          return prev;
        }
        return {
          ...prev,
          nearestIntersection: {
            ...prev.nearestIntersection,
            secondsRemaining: currentSec - 1
          }
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleCheckin = async () => {
    if (checkedInToday || checkinLoading) return;
    try {
      setCheckinLoading(true);
      const res = await ApiService.executeCheckIn('user-001');
      if (res.success) {
        setCheckedInToday(true);
        if (res.user) {
          setEcoStreak(res.user.currentStreak);
          setEcoCoins(res.user.ecoCoins);
        }
        if (res.cycleDays) setCheckinDays(res.cycleDays);
        if (res.reward && res.reward.voucher) {
          setSavedVouchers((prev) => Array.from(new Set([...prev, res.reward.voucher])));
        }
        setBookingToast({
          title: `🌟 Điểm danh Ngày ${res.reward.day} thành công!`,
          message: res.message
        });
      }
    } catch (err) {
      setBookingToast({
        title: 'Thông báo',
        message: err.message || 'Hôm nay bạn đã hoàn thành điểm danh rồi!'
      });
    } finally {
      setCheckinLoading(false);
      setTimeout(() => setBookingToast(null), 3500);
    }
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
      const [vehRes, glosaRes, checkinRes] = await Promise.all([
        ApiService.getVehicles(selectedCategory),
        ApiService.getGreenWaveAdvisory(300, 42),
        ApiService.getCheckInStatus('user-001').catch(() => null)
      ]);
      setVehicles(vehRes.vehicles || []);
      setGlosaAdvisory(glosaRes.data || null);
      if (checkinRes && checkinRes.success) {
        if (checkinRes.cycleDays) setCheckinDays(checkinRes.cycleDays);
        setCheckedInToday(checkinRes.checkedInToday);
        setEcoStreak(checkinRes.currentStreak);
        setNextReward(checkinRes.nextReward);
        if (checkinRes.ecoCoins != null) setEcoCoins(checkinRes.ecoCoins);
        if (checkinRes.vouchers && checkinRes.vouchers.length > 0) {
          setSavedVouchers((prev) => Array.from(new Set([...prev, ...checkinRes.vouchers])));
        }
      }
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

  const handleBookingSuccess = (result) => {
    setShowBookingModal(false);
    const vName = result?.vehicle?.name || bookingVehicle?.name || 'Phương tiện';
    const vPlate = result?.vehicle?.plateNumber || bookingVehicle?.plateNumber || '';
    const cNumber = result?.trip?.contractNumber ? ` • ${result.trip.contractNumber}` : '';
    setBookingToast({
      title: 'Ký hợp đồng & Thanh toán thành công',
      message: `${vName} (${vPlate})${cNumber} đã sẵn sàng mở khóa Digital Key 24/7.`
    });
    loadInitialData();
    setTimeout(() => {
      setBookingToast(null);
      if (onNavigateToKey) onNavigateToKey();
    }, 1400);
  };

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedCategory && selectedCategory !== 'ALL' && v.category !== selectedCategory) {
      return false;
    }
    if (selectedCategory === 'CAR' && catalogBrand && catalogBrand !== 'ALL' && v.brand && v.brand.toLowerCase() !== catalogBrand.toLowerCase()) {
      return false;
    }
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

  // Dedicated Fleet Catalog dynamic brands & filtered/sorted vehicle list
  const availableBrands = useMemo(() => {
    if (!catalogMode) return ['ALL'];
    const brands = Array.from(
      new Set(
        vehicles
          .filter((v) => v.category === catalogMode && v.brand)
          .map((v) => v.brand)
      )
    );
    return ['ALL', ...brands];
  }, [vehicles, catalogMode]);

  const catalogVehicles = useMemo(() => {
    if (!catalogMode) return [];
    let list = vehicles.filter((v) => v.category === catalogMode);

    if (catalogBrand !== 'ALL') {
      list = list.filter((v) => v.brand?.toLowerCase() === catalogBrand.toLowerCase());
    }

    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      list = list.filter(
        (v) =>
          (v.name && v.name.toLowerCase().includes(q)) ||
          (v.brand && v.brand.toLowerCase().includes(q)) ||
          (v.model && v.model.toLowerCase().includes(q)) ||
          (v.plateNumber && v.plateNumber.toLowerCase().includes(q))
      );
    }

    list = [...list].sort((a, b) => {
      if (catalogSortBy === 'PRICE_ASC') {
        return (a.hourlyPrice || 0) - (b.hourlyPrice || 0);
      }
      if (catalogSortBy === 'PRICE_DESC') {
        return (b.hourlyPrice || 0) - (a.hourlyPrice || 0);
      }
      if (catalogSortBy === 'RANGE_DESC') {
        return (b.rangeKm || 0) - (a.rangeKm || 0);
      }
      if (catalogSortBy === 'RATING_DESC') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return list;
  }, [vehicles, catalogMode, catalogBrand, catalogSearch, catalogSortBy]);

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
                onPress={() => {
                  setWalletInitialTab('SHOP');
                  setShowVoucherWalletModal(true);
                }}
              >
                <Text style={styles.coinPillEmoji}>🪙</Text>
                <Text style={styles.coinPillText}>{ecoCoins} Xu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerVoucherPill}
                activeOpacity={0.85}
                onPress={() => {
                  setWalletInitialTab('AVAILABLE');
                  setShowVoucherWalletModal(true);
                }}
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
                {selectedPlace?.name || 'EcoGo Hub Landmark - Điện Biên Phủ, Bình Thạnh'}
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
              activeOpacity={0.85}
              onPress={() => onNavigateToVehicles && onNavigateToVehicles('CAR')}
            >
              <View style={[styles.featureIconBox, { backgroundColor: '#FFFFFF' }]}>
                <Ionicons name="car-sport" size={20} color={theme.primary} />
              </View>
              <View style={styles.featureTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.featureTitle} numberOfLines={1}>
                    Ô tô tự lái
                  </Text>
                  <Ionicons name="chevron-forward" size={13} color="#8C6239" />
                </View>
                <Text style={[styles.featureSub, { color: theme.primary }]} numberOfLines={1}>
                  Từ 85k/h · {vehicles.filter((v) => v.category === 'CAR').length} xe →
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tile 2: Electric Scooters */}
            <TouchableOpacity
              style={[
                styles.featureTile,
                { backgroundColor: theme.beigeSoft, borderColor: theme.beigeBorder }
              ]}
              activeOpacity={0.85}
              onPress={() => onNavigateToVehicles && onNavigateToVehicles('MOTORBIKE')}
            >
              <View style={[styles.featureIconBox, { backgroundColor: '#FFFFFF' }]}>
                <Ionicons name="bicycle" size={20} color="#8C6239" />
              </View>
              <View style={styles.featureTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.featureTitle} numberOfLines={1}>
                    Xe máy điện
                  </Text>
                  <Ionicons name="chevron-forward" size={13} color="#8C6239" />
                </View>
                <Text style={[styles.featureSub, { color: '#8C6239' }]} numberOfLines={1}>
                  Từ 22k/h · {vehicles.filter((v) => v.category === 'MOTORBIKE').length} xe →
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tile 3: Doorstep Delivery */}
            <TouchableOpacity
              style={styles.featureTileWhite}
              activeOpacity={0.85}
              onPress={() => setShowDoorstepModal(true)}
            >
              <View style={[styles.featureIconBox, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="navigate" size={19} color={theme.primary} />
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
              activeOpacity={0.85}
              onPress={() => setShowGlosaModal(true)}
            >
              <View style={[styles.featureIconBox, { backgroundColor: theme.beigeSoft }]}>
                <Ionicons name="speedometer" size={19} color="#8C6239" />
              </View>
              <View style={styles.featureTextCol}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={styles.featureTitle} numberOfLines={1}>
                    Làn sóng xanh
                  </Text>
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 3.5,
                      backgroundColor:
                        liveGlosa?.nearestIntersection?.signalState === 'RED'
                          ? '#EF4444'
                          : liveGlosa?.nearestIntersection?.signalState === 'YELLOW'
                          ? '#F59E0B'
                          : '#22C55E'
                    }}
                  />
                </View>
                <Text style={[styles.featureSub, { color: theme.primary }]} numberOfLines={1}>
                  {liveGlosa
                    ? `${liveGlosa.telematics?.recommendedSpeedKmh || 42} km/h · ${
                        liveGlosa.nearestIntersection?.signalState === 'GREEN'
                          ? 'Xanh'
                          : liveGlosa.nearestIntersection?.signalState === 'YELLOW'
                          ? 'Vàng'
                          : 'Đỏ'
                      } ${liveGlosa.nearestIntersection?.secondsRemaining || 24}s`
                    : (glosaAdvisory ? `${glosaAdvisory.recommendedSpeedKmh} km/h · Đèn 28s` : '42 km/h · Đèn 28s')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
              {checkinDays.map((d) => {
                const isClaimed = d.done;
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
                        <Ionicons name="checkmark-circle" size={18} color="#6F4E37" />
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
              disabled={checkedInToday || checkinLoading}
              onPress={handleCheckin}
            >
              <Ionicons
                name={checkedInToday ? 'checkmark-circle' : 'calendar'}
                size={16}
                color={checkedInToday ? '#8C6239' : '#FFFFFF'}
              />
              <Text style={[styles.checkinCtaText, checkedInToday && { color: '#8C6239' }]}>
                {checkedInToday
                  ? 'Đã điểm danh hôm nay (Quay lại ngày mai)'
                  : (checkinLoading ? 'Đang xác thực điểm danh...' : `Điểm danh nhận quà ngay (+${nextReward?.coins || 25} Xu Eco)`)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Fleet Access Card */}
        <TouchableOpacity
          style={styles.fleetAccessCard}
          onPress={() => onNavigateToVehicles && onNavigateToVehicles('CAR')}
          activeOpacity={0.88}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={styles.fleetAccessTagBadge}>
              <Text style={styles.fleetAccessTagText}>DÀN XE THUÊ 24/7</Text>
            </View>
            <Text style={styles.fleetAccessTitle}>Dàn Xe Sẵn Sàng Gần Bạn</Text>
            <Text style={styles.fleetAccessDesc}>
              Khám phá 15 dòng ô tô tự lái & xe máy điện tại các trạm Hub TP.HCM. 0đ cọc bảo chứng.
            </Text>
          </View>
          <View style={styles.fleetAccessBtnCircle}>
            <Ionicons name="arrow-forward" size={18} color="#FAF7F2" />
          </View>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
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
              { id: 'CAMPUS', label: 'Trạm Đô Thị & Hub' },
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

      {/* ============================================================
          MODAL: DOORSTEP DELIVERY INFO & BOOKING (GIAO XE TẬN NƠI)
         ============================================================ */}
      <Modal
        visible={showDoorstepModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDoorstepModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard480}>
            {/* Header */}
            <View style={styles.modalCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.featureIconBox, { backgroundColor: '#F5EFEB' }]}>
                  <Ionicons name="navigate" size={18} color="#6F4E37" />
                </View>
                <View>
                  <Text style={styles.modalCardTitle}>Giao Xe Tận Nơi EcoGo</Text>
                  <Text style={styles.modalCardSub}>Miễn phí giao nhận trong bán kính 5km</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowDoorstepModal(false)}
              >
                <Ionicons name="close" size={20} color="#2B180D" />
              </TouchableOpacity>
            </View>

            {/* 3 Value Pillars */}
            <View style={styles.doorstepBenefitList}>
              <View style={styles.doorstepBenefitRow}>
                <Ionicons name="checkmark-circle" size={18} color="#6F4E37" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.doorstepBenefitTitle}>Miễn phí 100% trong 5km</Text>
                  <Text style={styles.doorstepBenefitSub}>Áp dụng cho mọi đơn thuê xe tự lái xuất phát từ 10 Hub trạm TP.HCM</Text>
                </View>
              </View>

              <View style={styles.doorstepBenefitRow}>
                <Ionicons name="time" size={18} color="#6F4E37" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.doorstepBenefitTitle}>Giao nhanh 15 – 30 phút</Text>
                  <Text style={styles.doorstepBenefitSub}>Nhân viên kỹ thuật đưa xe đến đúng sảnh chung cư, trường học hoặc cơ quan của bạn</Text>
                </View>
              </View>

              <View style={styles.doorstepBenefitRow}>
                <Ionicons name="shield-checkmark" size={18} color="#D4AF37" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.doorstepBenefitTitle}>Kiểm định an toàn & Pin đầy đủ</Text>
                  <Text style={styles.doorstepBenefitSub}>Khử khuẩn sạch sẽ, pin đảm bảo trên 90%, bàn giao Digital Key 24/7</Text>
                </View>
              </View>
            </View>

            {/* Quick Vehicle Picker List */}
            <View style={{ marginVertical: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontFamily: FONTS.family, fontSize: 12, fontWeight: '700', color: '#2B180D' }}>
                  Chọn nhanh dòng xe muốn nhận:
                </Text>
                <Text style={{ fontFamily: FONTS.family, fontSize: 11, color: '#8C6239', fontWeight: '600' }}>
                  {vehicles.length} xe sẵn sàng
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
              >
                {vehicles.map((veh) => (
                  <TouchableOpacity
                    key={veh.id}
                    style={styles.doorstepVehPillCard}
                    activeOpacity={0.82}
                    onPress={() => {
                      setShowDoorstepModal(false);
                      setBookingDeliveryMode('DOORSTEP');
                      setSelectedVoucherForBooking('FREESHIP');
                      handleOpenBooking(veh);
                      setBookingToast({
                        title: `🚀 Giao tận nơi: ${veh.name}`,
                        message: 'Mã miễn phí giao nhận FREESHIP đã áp dụng thành công!'
                      });
                      setTimeout(() => setBookingToast(null), 3000);
                    }}
                  >
                    <Image
                      source={{ uri: veh.thumbnail || veh.images?.[0] }}
                      style={styles.doorstepVehThumb}
                      resizeMode="cover"
                    />
                    <View style={{ padding: 6 }}>
                      <Text style={styles.doorstepVehName} numberOfLines={1}>
                        {veh.name}
                      </Text>
                      <Text style={styles.doorstepVehPrice}>
                        {(veh.hourlyPrice || 85000).toLocaleString('vi-VN')}đ/h
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Main Action Button: Browse all vehicles for doorstep delivery */}
            <TouchableOpacity
              style={styles.modalPrimaryActionBtn}
              activeOpacity={0.88}
              onPress={() => {
                setShowDoorstepModal(false);
                setBookingDeliveryMode('DOORSTEP');
                setSelectedVoucherForBooking('FREESHIP');
                setCatalogMode('CAR');
                setCatalogBrand('ALL');
                setCatalogSortBy('PRICE_ASC');
                setCatalogSearch('');
                setBookingToast({
                  title: '🚚 Danh Sách Xe Giao Tận Nơi',
                  message: 'Miễn phí 5km toàn TP.HCM · Mã FREESHIP đã sẵn sàng cho mọi xe!'
                });
                setTimeout(() => setBookingToast(null), 3000);
              }}
            >
              <Ionicons name="car-sport" size={15} color="#D4AF37" />
              <Text style={styles.modalPrimaryActionText}>
                Xem Toàn Bộ {vehicles.length} Xe & Đặt Giao Tận Nơi →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL: ECOGO SMARTWAVE GREEN WAVE AI TELEMATICS (LÀN SÓNG XANH)
         ============================================================ */}
      <Modal
        visible={showGlosaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGlosaModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard480}>
            {/* Header */}
            <View style={styles.modalCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.featureIconBox, { backgroundColor: '#F5EFEB' }]}>
                  <Ionicons name="speedometer" size={18} color="#6F4E37" />
                </View>
                <View>
                  <Text style={styles.modalCardTitle}>EcoGo SmartWave (Làn Sóng Xanh AI)</Text>
                  <Text style={styles.modalCardSub}>Cố vấn tốc độ & định vị nút giao thời gian thực</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowGlosaModal(false)}
              >
                <Ionicons name="close" size={20} color="#2B180D" />
              </TouchableOpacity>
            </View>

            {/* Current Real-time Street & Intersection */}
            <View style={styles.glosaCurrentStreetCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="navigate-circle" size={16} color="#6F4E37" />
                <Text style={styles.glosaCurrentStreetTitle}>
                  Tuyến đường: <Text style={{ fontWeight: '800', color: '#2B180D' }}>{liveGlosa?.currentStreet || 'Đường Võ Oanh'}</Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={styles.glosaNextInterName} numberOfLines={1}>
                  Đến: {liveGlosa?.nearestIntersection?.name || 'Nút giao D1 - Điện Biên Phủ'}
                </Text>
                <View style={styles.glosaDistBadge}>
                  <Text style={styles.glosaDistBadgeText}>
                    {liveGlosa?.nearestIntersection?.distanceMeters || 280}m
                  </Text>
                </View>
              </View>
            </View>

            {/* Live Telemetry Display */}
            <View style={styles.glosaLiveCard}>
              <View style={styles.glosaSpeedBox}>
                <Text style={styles.glosaSpeedVal}>
                  {liveGlosa?.telematics?.recommendedSpeedKmh || 42}
                </Text>
                <Text style={styles.glosaSpeedUnit}>km/h</Text>
                <Text style={styles.glosaSpeedLbl}>Vận tốc tối ưu AI</Text>
              </View>

              <View style={styles.glosaDividerV} />

              <View style={styles.glosaSignalBox}>
                <View style={styles.glosaSignalDotRow}>
                  <View
                    style={[
                      styles.glosaLightDot,
                      {
                        backgroundColor:
                          liveGlosa?.nearestIntersection?.signalState === 'RED'
                            ? '#EF4444'
                            : liveGlosa?.nearestIntersection?.signalState === 'YELLOW'
                            ? '#F59E0B'
                            : '#22C55E'
                      }
                    ]}
                  />
                  <Text
                    style={[
                      styles.glosaSignalText,
                      {
                        color:
                          liveGlosa?.nearestIntersection?.signalState === 'RED'
                            ? '#EF4444'
                            : liveGlosa?.nearestIntersection?.signalState === 'YELLOW'
                            ? '#D97706'
                            : '#15803D'
                      }
                    ]}
                  >
                    {liveGlosa?.nearestIntersection?.signalState === 'RED'
                      ? 'Đèn Đỏ'
                      : liveGlosa?.nearestIntersection?.signalState === 'YELLOW'
                      ? 'Đèn Vàng'
                      : 'Đèn Xanh'}
                  </Text>
                </View>
                <Text style={styles.glosaCountdownVal}>
                  còn {liveGlosa?.nearestIntersection?.secondsRemaining || 24}s
                </Text>
                <Text style={styles.glosaSpeedLbl}>
                  Chu kỳ {liveGlosa?.nearestIntersection?.cycleSec || 75}s
                </Text>
              </View>
            </View>

            {/* AI Realtime Advice */}
            <View style={styles.glosaAdviceBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Ionicons name="sparkles" size={14} color="#D4AF37" />
                <Text style={styles.glosaAdviceTitle}>Khuyến nghị từ AI Cố Vấn:</Text>
              </View>
              <Text style={styles.glosaAdviceMsg}>
                {liveGlosa?.telematics?.advisoryMessage || 'Duy trì tốc độ 40 - 45 km/h để qua đèn xanh liên tục không phải dừng.'}
              </Text>
            </View>

            {/* Nearby Intersections Radar Preview */}
            <View style={{ marginVertical: 8 }}>
              <Text style={{ fontFamily: FONTS.family, fontSize: 11, fontWeight: '700', color: '#4E3322', marginBottom: 6 }}>
                Trực quan tín hiệu các nút giao thông minh phía trước:
              </Text>
              <View style={{ gap: 6 }}>
                {(liveGlosa?.nearbyIntersections || [
                  { id: '1', name: 'Nút giao D1 - Điện Biên Phủ', distanceMeters: 120, signalState: 'GREEN', secondsRemaining: 24 },
                  { id: '2', name: 'Ngã tư Hàng Xanh', distanceMeters: 514, signalState: 'GREEN', secondsRemaining: 18 },
                  { id: '3', name: 'Cầu Sài Gòn - Thảo Điền', distanceMeters: 1108, signalState: 'RED', secondsRemaining: 12 }
                ]).slice(0, 3).map((inter) => {
                  const isGreen = inter.signalState === 'GREEN';
                  const isYellow = inter.signalState === 'YELLOW';
                  return (
                    <View key={inter.id} style={styles.glosaInterRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.glosaInterRowName} numberOfLines={1}>{inter.name}</Text>
                        <Text style={styles.glosaInterRowDist}>Cách {inter.distanceMeters}m</Text>
                      </View>
                      <View
                        style={[
                          styles.glosaInterSignalChip,
                          {
                            backgroundColor: isGreen ? '#DCFCE7' : isYellow ? '#FEF3C7' : '#FEE2E2',
                            borderColor: isGreen ? '#86EFAC' : isYellow ? '#FDE68A' : '#FCA5A5'
                          }
                        ]}
                      >
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: isGreen ? '#16A34A' : isYellow ? '#D97706' : '#DC2626'
                          }}
                        />
                        <Text
                          style={[
                            styles.glosaInterSignalChipText,
                            { color: isGreen ? '#15803D' : isYellow ? '#B45309' : '#B91C1C' }
                          ]}
                        >
                          {isGreen ? 'Xanh' : isYellow ? 'Vàng' : 'Đỏ'} {inter.secondsRemaining}s
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Core Benefits */}
            <View style={styles.glosaBenefitRow}>
              <Ionicons name="leaf-outline" size={15} color="#6F4E37" />
              <Text style={styles.glosaBenefitText}>
                Tiết kiệm <Text style={{ fontWeight: '700', color: '#2B180D' }}>22.5% pin</Text> & giảm <Text style={{ fontWeight: '700', color: '#2B180D' }}>30% thời gian</Text> chờ đợi tại TP.HCM.
              </Text>
            </View>

            {/* CTA Buttons */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                style={styles.modalSecondaryActionBtn}
                onPress={() => setShowGlosaModal(false)}
              >
                <Text style={styles.modalSecondaryActionText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryActionBtn, { flex: 1, marginTop: 0 }]}
                activeOpacity={0.88}
                onPress={() => {
                  setShowGlosaModal(false);
                  if (onNavigateToMap) onNavigateToMap();
                }}
              >
                <Ionicons name="map-outline" size={15} color="#FFFFFF" />
                <Text style={styles.modalPrimaryActionText}>Xem Bản Đồ Hành Lang →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL: QUIET LUXURY SORT SELECTOR SHEET
         ============================================================ */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.sortModalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sortModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="swap-vertical" size={16} color="#4E3322" />
                <Text style={styles.sortModalTitle}>Sắp xếp danh sách xe</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={18} color="#2B180D" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, marginVertical: 10 }}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = catalogSortBy === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.sortOptionRow,
                      isSelected && styles.sortOptionRowSelected
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCatalogSortBy(opt.id);
                      setShowSortModal(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={[styles.sortOptionIconBox, isSelected && styles.sortOptionIconBoxSelected]}>
                        <Ionicons
                          name={opt.icon}
                          size={16}
                          color={isSelected ? '#4E3322' : '#8C6239'}
                        />
                      </View>
                      <Text style={[styles.sortOptionLabel, isSelected && styles.sortOptionLabelSelected]}>
                        {opt.label}
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? '#4E3322' : '#C7BAAE'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Multi-Step Booking Modal */}
      <BookingModal
        visible={showBookingModal}
        vehicle={bookingVehicle}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
        initialVoucherCode={selectedVoucherForBooking}
        initialDeliveryMode={bookingDeliveryMode}
        onSwitchVehicle={() => {
          setShowBookingModal(false);
          setCatalogMode('CAR');
        }}
      />

      {/* Unified Voucher & Eco Coins Redemption Wallet Modal */}
      <VoucherWalletModal
        visible={showVoucherWalletModal}
        initialTab={walletInitialTab}
        ecoCoins={ecoCoins}
        savedVouchers={savedVouchers}
        onClose={() => setShowVoucherWalletModal(false)}
        onDeductCoins={(amount) => {
          setEcoCoins((prev) => Math.max(0, prev - amount));
        }}
        onSaveVoucher={(code) => {
          if (!savedVouchers.includes(code)) {
            setSavedVouchers((prev) => [...prev, code]);
          }
        }}
        onApplyVoucher={(code) => {
          setSelectedVoucherForBooking(code);
          const targetVehicle = filteredVehicles[0] || vehicles[0];
          if (targetVehicle) {
            setBookingVehicle(targetVehicle);
            setShowBookingModal(true);
          }
          setBookingToast({
            title: `🏷️ Đã chọn mã ${code}`,
            message: `Mã ưu đãi ${code} đã sẵn sàng trong đơn thuê xe!`
          });
          setTimeout(() => setBookingToast(null), 3000);
        }}
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
  featureTileActive: {
    backgroundColor: '#F5EFEB',
    borderColor: '#6F4E37',
    borderWidth: 1.5,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
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
    color: '#6F4E37'
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
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  dayBoxToday: {
    borderColor: '#6F4E37',
    backgroundColor: '#F5EFEB',
    borderWidth: 1.5
  },
  dayBoxClaimed: {
    backgroundColor: '#F5EFEB',
    borderColor: '#E8DFD8'
  },
  dayBoxGrand: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  dayLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#8C6239',
    fontWeight: '600',
    marginBottom: 4
  },
  dayLabelToday: {
    color: '#4E3322',
    fontWeight: '800'
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
    color: '#6F4E37'
  },
  checkinCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4E3322',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6
  },
  checkinCtaBtnDone: {
    backgroundColor: '#EFE8DE',
    borderWidth: 1,
    borderColor: '#E8DFD8'
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
  },

  /* ============================================================
     DOORSTEP & GLOSA 480PX QUIET LUXURY MODAL STYLES
     ============================================================ */
  modalCard480: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  modalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DE'
  },
  modalCardTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#2B180D'
  },
  modalCardSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8C6239',
    marginTop: 2
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  doorstepBenefitList: {
    marginVertical: 14,
    gap: 10
  },
  doorstepBenefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  doorstepBenefitTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#2B180D'
  },
  doorstepBenefitSub: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6E6E73',
    marginTop: 2,
    lineHeight: 14
  },
  modalPrimaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4E3322',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 7,
    marginTop: 6
  },
  modalPrimaryActionText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  modalSecondaryActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalSecondaryActionText: {
    fontFamily: FONTS.family,
    color: '#6F4E37',
    fontSize: 12,
    fontWeight: '700'
  },
  glosaLiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  glosaSpeedBox: {
    flex: 1,
    alignItems: 'center'
  },
  glosaSpeedVal: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '800',
    color: '#2B180D'
  },
  glosaSpeedUnit: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#8C6239'
  },
  glosaSpeedLbl: {
    fontFamily: FONTS.family,
    fontSize: 9,
    color: '#8C6239',
    marginTop: 2
  },
  glosaDividerV: {
    width: 1,
    height: 48,
    backgroundColor: '#E8DFD8',
    marginHorizontal: 10
  },
  glosaSignalBox: {
    flex: 1.2,
    alignItems: 'center'
  },
  glosaSignalDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  glosaLightDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  glosaSignalText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D'
  },
  glosaCountdownVal: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#2B180D',
    marginTop: 2
  },
  glosaBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5EFEB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8DFD8'
  },
  glosaBenefitText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F4E37',
    lineHeight: 15
  },

  /* ============================================================
     DEDICATED FLEET CATALOG SCREEN (QUIET LUXURY STYLING)
     ============================================================ */
  catalogScreenContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  catalogScreenScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32
  },
  catScreenHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    marginBottom: 14,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  catBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    marginBottom: 12
  },
  catBackBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#2B180D'
  },
  catTitleWrap: {
    marginBottom: 14
  },
  catTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  catBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catScreenMainTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '800',
    color: '#2B180D'
  },
  catScreenSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8C6239',
    marginTop: 4
  },
  catModeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FAF7F2',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catModeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10
  },
  catModeToggleBtnActive: {
    backgroundColor: '#4E3322'
  },
  catModeToggleText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37'
  },
  catModeToggleTextActive: {
    color: '#FFFFFF'
  },
  catSearchContainer: {
    marginBottom: 12
  },
  catSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    gap: 8
  },
  catSearchInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#2B180D',
    padding: 0
  },
  catFilterGroup: {
    marginBottom: 12
  },
  catFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8
  },
  catFilterGroupTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#4E3322'
  },
  catBrandScroll: {
    gap: 8,
    paddingRight: 10
  },
  catBrandChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catBrandChipActive: {
    backgroundColor: '#4E3322',
    borderColor: '#4E3322'
  },
  catBrandText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#6F4E37'
  },
  catBrandTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  catSortScroll: {
    gap: 8,
    paddingRight: 10
  },
  catSortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catSortChipActive: {
    backgroundColor: '#F5EFEB',
    borderColor: '#6F4E37'
  },
  catSortText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#6F4E37'
  },
  catSortTextActive: {
    color: '#4E3322',
    fontWeight: '800'
  },
  catResultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 2
  },
  catResultMetaText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F4E37'
  },
  catResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#E8DFD8'
  },
  catResetBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#8C6239'
  },
  catVehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    marginBottom: 16,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4
  },
  catPhotoBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5EFEB',
    position: 'relative'
  },
  catPhotoImage: {
    width: '100%',
    height: '100%'
  },
  catCardBadgeTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catCardBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#2B180D'
  },
  catCardBadgeTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catCardBadgeStatus: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D'
  },
  catCardBody: {
    padding: 14
  },
  catCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  catCardBrandName: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#8C6239',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  catCardTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#2B180D',
    marginTop: 2
  },
  catCardRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FAF7F2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catCardRatingText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D'
  },
  catCardTripsText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#8C6239'
  },
  catSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10
  },
  catSpecPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF7F2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catSpecPillText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#4E3322'
  },
  catLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12
  },
  catLocationText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F4E37'
  },
  catFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFE8DE'
  },
  catPriceHourly: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '800',
    color: '#2B180D'
  },
  catPriceUnit: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#8C6239'
  },
  catPriceDaily: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#8C6239',
    marginTop: 2
  },
  catBookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4E3322',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  catBookNowText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  catEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    marginTop: 10
  },
  catEmptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catEmptyTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#2B180D',
    marginBottom: 6
  },
  catEmptySub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#8C6239',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  catEmptyActionBtn: {
    backgroundColor: '#4E3322',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12
  },
  catEmptyActionText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  inlineBrandFilterRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 2
  },
  inlineBrandScroll: {
    gap: 6,
    paddingVertical: 2
  },
  inlineBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  inlineBrandPillActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  inlineBrandText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#7E6B5C'
  },
  inlineBrandTextActive: {
    color: '#FAF7F2',
    fontWeight: '800'
  },
  inlineBrandCountBadge: {
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#F5EFEB'
  },
  inlineBrandCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)'
  },
  inlineBrandCountText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6F4E37'
  },
  inlineBrandCountTextActive: {
    color: '#FAF7F2'
  },
  doorstepVehPillCard: {
    width: 130,
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    overflow: 'hidden'
  },
  doorstepVehThumb: {
    width: '100%',
    height: 70,
    backgroundColor: '#E8DFD8'
  },
  doorstepVehName: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#2B180D'
  },
  doorstepVehPrice: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#6F4E37',
    marginTop: 2
  },
  doorstepActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5EFEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DFD8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  doorstepActiveBannerText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F4E37'
  },

  /* ============================================================
     AI IOT GLOSA REALTIME TELEMATICS DASHBOARD STYLES
     ============================================================ */
  glosaCurrentStreetCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    marginVertical: 8
  },
  glosaCurrentStreetTitle: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F4E37'
  },
  glosaNextInterName: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#2B180D'
  },
  glosaDistBadge: {
    backgroundColor: '#4E3322',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  glosaDistBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  glosaAdviceBox: {
    backgroundColor: '#FDFBF7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    padding: 10,
    marginVertical: 6
  },
  glosaAdviceTitle: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#8C6239'
  },
  glosaAdviceMsg: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#2B180D',
    lineHeight: 16
  },
  glosaInterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  glosaInterRowName: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#2B180D'
  },
  glosaInterRowDist: {
    fontFamily: FONTS.family,
    fontSize: 9,
    color: '#8C6239',
    marginTop: 1
  },
  glosaInterSignalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1
  },
  glosaInterSignalChipText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700'
  },

  /* ============================================================
     COMPACT SMART FILTER & SORT MODAL STYLES
     ============================================================ */
  catBrandBarWrapper: {
    marginBottom: 8
  },
  catBrandScrollCompact: {
    gap: 8,
    paddingRight: 10,
    paddingVertical: 2
  },
  catBrandChipCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catBrandChipCompactActive: {
    backgroundColor: '#4E3322',
    borderColor: '#4E3322'
  },
  catBrandTextCompact: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#6F4E37'
  },
  catBrandTextCompactActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  catBrandCountBadge: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  catBrandCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.3)'
  },
  catBrandCountText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#8C6239'
  },
  catBrandCountTextActive: {
    color: '#FFFFFF'
  },
  catMetaRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 8
  },
  catCountTextCompact: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F4E37'
  },
  catResetBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#E8DFD8'
  },
  catResetBtnTextCompact: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#8C6239'
  },
  catSortDropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12
  },
  catSortDropdownText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#4E3322'
  },
  sortModalSheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8
  },
  sortModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DE'
  },
  sortModalTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#2B180D'
  },
  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  sortOptionRowSelected: {
    backgroundColor: '#F5EFEB',
    borderColor: '#4E3322'
  },
  sortOptionIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  sortOptionIconBoxSelected: {
    backgroundColor: '#FAF7F2',
    borderColor: '#4E3322'
  },
  sortOptionLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#6F4E37'
  },
  sortOptionLabelSelected: {
    fontWeight: '800',
    color: '#2B180D'
  },

  fleetAccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  fleetAccessTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  fleetAccessTagText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6F4E37',
    letterSpacing: 0.6
  },
  fleetAccessTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#2B180D',
    marginBottom: 3
  },
  fleetAccessDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8C7A6B',
    lineHeight: 16
  },
  fleetAccessBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4E3322',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
});
