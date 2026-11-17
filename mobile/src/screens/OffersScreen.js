import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import ApiService from '../services/api';

// Danh mục biểu tượng chính (giống ảnh mẫu người dùng)
const OFFER_CATEGORIES = [
  { id: 'ALL', label: 'Tất cả', icon: 'apps', color: '#7C3AED', bg: '#EDE9FE' },
  { id: 'ECOGO', label: 'ECOGO', icon: 'flash', color: '#6F4E37', bg: '#F5EFEB' },
  { id: 'HOME', label: 'Gia dụng', icon: 'cube-outline', color: '#2563EB', bg: '#DBEAFE' },
  { id: 'SHOPPING', label: 'Mua sắm', icon: 'cart-outline', color: '#9333EA', bg: '#F3E8FF' },
  { id: 'SERVICES', label: 'Dịch vụ', icon: 'pricetag-outline', color: '#059669', bg: '#D1FAE5' },
  { id: 'FOOD', label: 'Ăn uống', icon: 'cafe-outline', color: '#DC2626', bg: '#FEE2E2' }
];

// Danh mục bộ lọc UrBox
const URBOX_FILTERS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'AIRPORT', label: 'Airport Service' },
  { id: 'BEAUTY', label: 'Beauty - Health' },
  { id: 'UTILITIES', label: 'Utilities' },
  { id: 'FOOD', label: 'Ẩm thực & Cafe' }
];

// Danh sách Quà tặng độc quyền (Exclusive Gifts Carousel)
const EXCLUSIVE_GIFTS = [
  {
    id: 'ex_vexere',
    brand: 'Vexere',
    brandLogo: 'bus',
    brandColor: '#0284C7',
    title: 'Giảm 25% tối đa 50K dành cho khách hàng mới',
    category: 'SERVICES',
    coins: 50,
    originalValue: '50.000đ',
    badge: 'ĐỘC QUYỀN',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1',
    expiry: 'Còn 15 ngày',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    code: 'VEXERE50K',
    desc: 'Áp dụng cho đặt vé xe khách, limousine, tàu hỏa và máy bay tại ứng dụng Vexere.'
  },
  {
    id: 'ex_roadtrip_shield',
    brand: 'EcoGo Care & Roadside',
    brandLogo: 'shield-checkmark',
    brandColor: '#2563EB',
    title: 'Gói Cứu Hộ Khẩn Cấp 24/7 & Bảo Hiểm Chuyến Đi 0Đ',
    category: 'ECOGO',
    coins: 50,
    originalValue: '350.000đ',
    badge: 'AN TÂM 100%',
    badgeBg: '#DBEAFE',
    badgeColor: '#1E40AF',
    expiry: 'Còn 30 ngày',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    code: 'ECOCARE247',
    desc: 'Bảo hiểm thân vỏ toàn diện và đội cứu hộ di động 24/7 hỗ trợ thay lốp, cứu hộ pin trên toàn quốc.'
  },
  {
    id: 'ex_ecogo_50k',
    brand: 'EcoGo Mobility',
    brandLogo: 'car-sport',
    brandColor: '#6F4E37',
    title: 'Giảm 50.000đ cho chuyến đi ô tô điện đầu tiên',
    category: 'ECOGO',
    coins: 50,
    originalValue: '50.000đ',
    badge: 'ECOGO VIP',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    expiry: 'Hết tháng',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80',
    code: 'ECOGO50K',
    desc: 'Áp dụng cho mọi dòng xe VinFast VF3, VF5, VF8, VF9 tự lái trên hệ thống EcoGo Smart Mobility.'
  },
  {
    id: 'ex_vinfast_charge',
    brand: 'Trạm Sạc VinFast',
    brandLogo: 'flash',
    brandColor: '#16A34A',
    title: 'Tặng 30kWh Sạc Siêu Nhanh Miễn Phí',
    category: 'ECOGO',
    coins: 80,
    originalValue: '115.000đ',
    badge: 'XANH 100%',
    badgeBg: '#DCFCE7',
    badgeColor: '#16A34A',
    expiry: 'Còn 30 ngày',
    image: 'https://images.unsplash.com/photo-1558441719-72f10b277c22?auto=format&fit=crop&w=600&q=80',
    code: 'VINFAST30KWH',
    desc: 'Nạp năng lượng xanh miễn phí tại hơn 3.000 cổng sạc VinFast phủ khắp 63 tỉnh thành.'
  }
];

// Danh sách Quà tặng UrBox (UrBox Partner Vouchers)
const URBOX_GIFTS = [
  {
    id: 'ub_alluvia_1000k',
    brand: 'ALLUVIA',
    filterCategory: 'FOOD',
    title: '[UrBox Voucher] Alluvia Chocolate 1.000.000 đ',
    coins: 1000,
    originalValue: '1.000.000đ',
    expiry: 'Còn 45 ngày',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    code: 'ALLUVIA1TR',
    desc: 'Hộp quà socola thủ công nghệ nhân Alluvia Chocolatier chế tác từ hạt cacao thuần Việt.'
  },
  {
    id: 'ub_alluvia_500k',
    brand: 'ALLUVIA',
    filterCategory: 'FOOD',
    title: '[UrBox Voucher] Alluvia Chocolate 500.000 đ',
    coins: 500,
    originalValue: '500.000đ',
    expiry: 'Còn 45 ngày',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    code: 'ALLUVIA500K',
    desc: 'Bộ sưu tập thanh socola đen cao cấp kết hợp hương vị hoa quả nhiệt đới phong phú.'
  },
  {
    id: 'ub_alluvia_300k',
    brand: 'ALLUVIA',
    filterCategory: 'FOOD',
    title: '[UrBox Voucher] Alluvia Chocolate 300.000 đ',
    coins: 300,
    originalValue: '300.000đ',
    expiry: 'Còn 45 ngày',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
    code: 'ALLUVIA300K',
    desc: 'Voucher thanh toán trực tiếp tại hệ thống showroom Alluvia Chocolate trên toàn quốc.'
  },
  {
    id: 'ub_alluvia_200k',
    brand: 'ALLUVIA',
    filterCategory: 'FOOD',
    title: '[UrBox Voucher] Alluvia Chocolate 200.000 đ',
    coins: 200,
    originalValue: '200.000đ',
    expiry: 'Còn 45 ngày',
    image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=600&q=80',
    code: 'ALLUVIA200K',
    desc: 'Voucher áp dụng cho mọi đơn hàng socola viên tươi hảo hạng Alluvia.'
  },
  {
    id: 'ub_airport_lounge',
    brand: 'SASCO Lounge',
    filterCategory: 'AIRPORT',
    title: '[UrBox] Vé Phòng Chờ VIP Hạng Thương Gia TSN',
    coins: 450,
    originalValue: '450.000đ',
    expiry: 'Còn 60 ngày',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    code: 'SASCOVIP',
    desc: 'Trải nghiệm buffet ẩm thực quốc tế, ghế massage thư giãn và không gian làm việc sang trọng trước chuyến bay.'
  },
  {
    id: 'ub_menard_spa',
    brand: 'Menard Japan',
    filterCategory: 'BEAUTY',
    title: '[UrBox] Gói Chăm Sóc Da Mặt Cao Cấp Menard',
    coins: 350,
    originalValue: '550.000đ',
    expiry: 'Còn 30 ngày',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    code: 'MENARDSPA',
    desc: 'Liệu trình massage và chăm sóc chuyên sâu với tinh chất linh chi Nhật Bản tại Menard Spa.'
  }
];

// Danh sách Quà tặng khác & EcoGo Perks
const OTHER_GIFTS = [
  {
    id: 'oth_w_facewash',
    brand: 'W Facewash',
    category: 'SERVICES',
    title: 'W FACEWASH - VOUCHER ƯU ĐÃI 50% FACEWASH',
    coins: 50,
    originalValue: '150.000đ',
    badge: 'GIẢM 50%',
    badgeBg: '#FEE2E2',
    badgeColor: '#DC2626',
    expiry: 'Còn 12 ngày',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    code: 'WFASH50',
    desc: 'Voucher giảm 50% trọn gói dịch vụ rửa mặt và chăm sóc da thư giãn tại viện chăm sóc W Facewash.'
  },
  {
    id: 'oth_yensao',
    brand: 'Nhà Yến Ba Phi',
    category: 'SHOPPING',
    title: 'Voucher giảm 5% trên tổng hoá đơn Yến Sào',
    coins: 50,
    originalValue: '200.000đ',
    badge: 'QUÀ CAO CẤP',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    expiry: 'Còn 25 ngày',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    code: 'YENBAPHI5',
    desc: 'Áp dụng cho các hộp quà yến sào tinh chế nguyên chất rút lông xuất khẩu của thương hiệu Ba Phi.'
  },
  {
    id: 'oth_moovtek_5k',
    brand: 'EcoGo Mobility',
    category: 'ECOGO',
    title: 'Ưu đãi 5K cho tất cả dịch vụ EcoGo Mobility',
    coins: 50,
    originalValue: '5.000đ',
    badge: 'BẤT KỲ XE NÀO',
    badgeBg: '#EDE9FE',
    badgeColor: '#7C3AED',
    expiry: 'Còn 30 ngày',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    code: 'ECOGO5K',
    desc: 'Giảm 5.000đ cho mọi chuyến thuê xe máy điện hoặc ô tô điện tự lái EcoGo.'
  },
  {
    id: 'oth_moovtek_10k',
    brand: 'EcoGo Mobility',
    category: 'ECOGO',
    title: 'Ưu đãi 10K cho tất cả dịch vụ EcoGo Mobility',
    coins: 100,
    originalValue: '10.000đ',
    badge: 'GIẢM 10K',
    badgeBg: '#EDE9FE',
    badgeColor: '#7C3AED',
    expiry: 'Còn 30 ngày',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    code: 'ECOGO10K',
    desc: 'Giảm trực tiếp 10.000đ khi thanh toán đơn thuê xe tự lái trong ngày.'
  },
  {
    id: 'oth_highlands',
    brand: 'Highlands Coffee',
    category: 'FOOD',
    title: 'Voucher 30.000đ thưởng thức Phin Sữa Đá Highlands',
    coins: 40,
    originalValue: '30.000đ',
    badge: 'COFFEE LOVER',
    badgeBg: '#FEE2E2',
    badgeColor: '#DC2626',
    expiry: 'Còn 18 ngày',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    code: 'HIGHLANDS30K',
    desc: 'Áp dụng tại chuỗi Highlands Coffee toàn quốc khi mua đồ uống size M hoặc L.'
  },
  {
    id: 'oth_cgv',
    brand: 'CGV Cinemas',
    category: 'SERVICES',
    title: 'Vé xem phim 2D kèm combo bắp nước cuối tuần',
    coins: 120,
    originalValue: '135.000đ',
    badge: 'ENTERTAINMENT',
    badgeBg: '#FEF2F2',
    badgeColor: '#EF4444',
    expiry: 'Còn 14 ngày',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    code: 'CGVFILM2D',
    desc: 'Đổi vé xem phim chuẩn quốc tế 2D tại mọi cụm rạp CGV trên cả nước.'
  }
];

export default function OffersScreen({
  theme = THEME_PRESETS.BE_SUA_CAFE,
  currentUser,
  onNavigateToVehicles,
  onApplyVoucher,
  onOpenVoucherWallet,
  onUpdateUser
}) {
  const [userCoins, setUserCoins] = useState(
    (currentUser && (currentUser.ecoCoins || currentUser.ecoPoints)) || 180
  );
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [urboxFilter, setUrboxFilter] = useState('ALL');
  const [activeTabMode, setActiveTabMode] = useState('DISCOVER'); // 'DISCOVER' | 'MY_VOUCHERS'

  // Modal Đổi Quà
  const [selectedGift, setSelectedGift] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Modal Thành Công
  const [redeemedVoucher, setRedeemedVoucher] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Modal Điểm Danh 7 Ngày Nhận Coin
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInStreak, setCheckInStreak] = useState(3);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Danh sách voucher đã đổi của tôi
  const [myVouchers, setMyVouchers] = useState([
    {
      code: 'BANMOI30',
      title: 'Gói Chào Bạn Mới - Giảm 30%',
      brand: 'EcoGo Mobility',
      expiry: 'Còn 5 ngày',
      claimedAt: '17/11/2026'
    },
    {
      code: 'ECOGO20',
      title: 'Hành Trình Xanh - Giảm 20%',
      brand: 'EcoGo Mobility',
      expiry: 'Còn 7 ngày',
      claimedAt: '16/11/2026'
    }
  ]);

  // Đồng bộ số dư Coin nếu user thay đổi
  useEffect(() => {
    if (currentUser && (currentUser.ecoCoins || currentUser.ecoPoints)) {
      setUserCoins(currentUser.ecoCoins || currentUser.ecoPoints);
    }
  }, [currentUser]);

  // Xử lý bắt đầu đổi voucher
  const handleStartRedeem = (gift) => {
    setSelectedGift(gift);
    setShowRedeemModal(true);
  };

  // Xác nhận đổi voucher
  const handleConfirmRedeem = () => {
    if (!selectedGift) return;

    if (userCoins < selectedGift.coins) {
      Alert.alert(
        'Chưa đủ EcoCoin',
        `Bạn hiện có ${userCoins} EcoCoin. Cần thêm ${selectedGift.coins - userCoins} EcoCoin nữa để đổi ưu đãi này! Hãy tham gia điểm danh hàng ngày hoặc hoàn thành thêm chuyến đi xanh để tích lũy nhé.`
      );
      return;
    }

    setIsRedeeming(true);
    setTimeout(() => {
      const remainingCoins = userCoins - selectedGift.coins;
      setUserCoins(remainingCoins);

      // Cập nhật lên CSDL / User State
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          ecoCoins: remainingCoins
        };
        if (onUpdateUser) onUpdateUser(updatedUser);
      }

      // Thêm vào ví voucher của tôi
      const newVoucherItem = {
        code: selectedGift.code,
        title: selectedGift.title,
        brand: selectedGift.brand,
        expiry: selectedGift.expiry || 'Còn 30 ngày',
        claimedAt: new Date().toLocaleDateString('vi-VN'),
        desc: selectedGift.desc,
        image: selectedGift.image
      };

      setMyVouchers((prev) => [newVoucherItem, ...prev]);
      setIsRedeeming(false);
      setShowRedeemModal(false);
      setRedeemedVoucher(newVoucherItem);
      setShowSuccessModal(true);
    }, 800);
  };

  // Điểm danh nhận Coin
  const handleDailyCheckIn = () => {
    if (hasCheckedInToday) {
      Alert.alert('Đã điểm danh', 'Hôm nay bạn đã nhận thưởng rồi. Hãy quay lại vào ngày mai nhé!');
      return;
    }
    const bonus = 25;
    const newBalance = userCoins + bonus;
    setUserCoins(newBalance);
    setHasCheckedInToday(true);
    setCheckInStreak((prev) => prev + 1);

    if (currentUser && onUpdateUser) {
      onUpdateUser({ ...currentUser, ecoCoins: newBalance });
    }

    Alert.alert('🎉 Nhận thưởng thành công!', `Bạn đã nhận được +${bonus} EcoCoin từ chương trình Điểm Danh Chuỗi Xanh 7 Ngày!`);
    setShowCheckInModal(false);
  };

  // Lọc theo từ khóa tìm kiếm và danh mục
  const filterList = (list) => {
    return list.filter((item) => {
      const matchCat =
        selectedCategory === 'ALL' ||
        item.category === selectedCategory ||
        (selectedCategory === 'ECOGO' && item.brand.includes('EcoGo'));
      const matchKeyword =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchKeyword;
    });
  };

  const filteredUrBox = URBOX_GIFTS.filter((item) => {
    const matchUrbox = urboxFilter === 'ALL' || item.filterCategory === urboxFilter;
    const matchKeyword =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchUrbox && matchKeyword;
  });

  return (
    <View style={styles.container}>
      {/* ============================================================
          1. HEADER TÍCH ĐIỂM ECOCOIN (GIỐNG MẪU NGƯỜI DÙNG)
         ============================================================ */}
      <View style={styles.headerHeroGradient}>
        {/* Header Top Bar */}
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerAppBrand}>EcoGo Rewards & Deals</Text>
            <Text style={styles.headerAppSub}>Trung tâm Ưu đãi & Đổi quà sinh thái</Text>
          </View>
          <TouchableOpacity
            style={styles.dailyCheckInPill}
            activeOpacity={0.85}
            onPress={() => setShowCheckInModal(true)}
          >
            <Ionicons name="calendar" size={13} color="#D4AF37" />
            <Text style={styles.dailyCheckInPillText}>Điểm danh +25</Text>
          </TouchableOpacity>
        </View>

        {/* Big Coin Counter Card */}
        <View style={styles.coinCounterCard}>
          <View style={styles.coinCircleBig}>
            <Text style={styles.coinLetterM}>⚡</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.coinBalanceRow}>
              <Text style={styles.coinBalanceNumber}>{userCoins}</Text>
              <Text style={styles.coinUnitText}>EcoCoin</Text>
            </View>
            <Text style={styles.coinPromptText}>Hãy thu thập thật nhiều EcoCoin bạn nhé!</Text>
          </View>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => setActiveTabMode(activeTabMode === 'DISCOVER' ? 'MY_VOUCHERS' : 'DISCOVER')}
          >
            <Ionicons
              name={activeTabMode === 'DISCOVER' ? 'wallet-outline' : 'sparkles-outline'}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.historyBtnText}>
              {activeTabMode === 'DISCOVER' ? 'Ví ưu đãi' : 'Khám phá'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3 Quick Navigation Pills Card (Giống hệt ảnh 1 của người dùng) */}
        <View style={styles.quickNavFloatContainer}>
          <TouchableOpacity
            style={styles.quickNavItem}
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                'Bảng Xếp Hạng EcoGo',
                'Bạn đang xếp hạng: Eco Elite Ambassador (Top 5% người dùng đóng góp giảm phát thải CO2 nhiều nhất tháng này)!'
              )
            }
          >
            <View style={[styles.quickNavIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="ribbon" size={16} color="#9333EA" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.quickNavTitle}>Xếp hạng</Text>
              <Text style={styles.quickNavSub}>Eco Elite VIP</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.quickNavDivider} />

          <TouchableOpacity
            style={styles.quickNavItem}
            activeOpacity={0.8}
            onPress={() => setShowCheckInModal(true)}
          >
            <View style={[styles.quickNavIconBox, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="disc" size={16} color="#DB2777" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.quickNavTitle}>Thử thách</Text>
              <Text style={styles.quickNavSub}>Nhận EcoCoin</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.quickNavDivider} />

          <TouchableOpacity
            style={styles.quickNavItem}
            activeOpacity={0.8}
            onPress={() => {
              if (onOpenVoucherWallet) onOpenVoucherWallet();
              else setActiveTabMode('MY_VOUCHERS');
            }}
          >
            <View style={[styles.quickNavIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="ticket" size={16} color="#7C3AED" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.quickNavTitle}>Ưu đãi</Text>
              <Text style={styles.quickNavSub}>Bạn có {myVouchers.length} ưu đãi</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {activeTabMode === 'MY_VOUCHERS' ? (
          /* ============================================================
              MỤC: VÍ ƯU ĐÃI CỦA TÔI (MY VOUCHERS)
             ============================================================ */
          <View style={styles.myVouchersContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionMainTitle}>Ưu đãi của tôi ({myVouchers.length})</Text>
              <TouchableOpacity
                onPress={() => setActiveTabMode('DISCOVER')}
                style={styles.backToDiscoverBtn}
              >
                <Text style={styles.backToDiscoverText}>+ Đổi thêm ưu đãi mới</Text>
              </TouchableOpacity>
            </View>

            {myVouchers.length === 0 ? (
              <View style={styles.emptyVoucherBox}>
                <Ionicons name="ticket-outline" size={48} color="#D1C4B5" />
                <Text style={styles.emptyVoucherTitle}>Chưa có voucher nào trong ví</Text>
                <Text style={styles.emptyVoucherSub}>
                  Hãy chọn các ưu đãi từ danh sách bên dưới để đổi quà bằng EcoCoin nhé!
                </Text>
              </View>
            ) : (
              myVouchers.map((item, idx) => (
                <View key={idx} style={styles.myVoucherCard}>
                  <View style={styles.myVoucherLeftCutout} />
                  <View style={styles.myVoucherRightCutout} />

                  <View style={styles.myVoucherCardInner}>
                    <View style={styles.myVoucherBrandRow}>
                      <View style={styles.myVoucherBrandPill}>
                        <Text style={styles.myVoucherBrandText}>{item.brand}</Text>
                      </View>
                      <Text style={styles.myVoucherExpiry}>{item.expiry}</Text>
                    </View>

                    <Text style={styles.myVoucherTitle}>{item.title}</Text>
                    <Text style={styles.myVoucherDesc} numberOfLines={2}>
                      {item.desc || 'Áp dụng khi thanh toán đặt xe hoặc đối tác liên kết.'}
                    </Text>

                    <View style={styles.myVoucherCodeRow}>
                      <View style={styles.myVoucherCodeBox}>
                        <Text style={styles.myVoucherCodeText}>{item.code}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.copyCodeBtn}
                        onPress={() => {
                          if (onApplyVoucher) {
                            onApplyVoucher(item.code);
                            Alert.alert('Đã áp dụng', `Mã ${item.code} đã được áp dụng vào chuyến đi tiếp theo của bạn!`);
                            if (onNavigateToVehicles) onNavigateToVehicles('CAR');
                          } else {
                            Alert.alert('Đã sao chép mã', `Mã ưu đãi ${item.code} đã được lưu vào bộ nhớ tạm!`);
                          }
                        }}
                      >
                        <Ionicons name="copy-outline" size={14} color="#6F4E37" />
                        <Text style={styles.copyCodeBtnText}>Dùng ngay</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* ============================================================
              MỤC: KHÁM PHÁ ƯU ĐÃI (DISCOVER / REWARDS CATALOG)
             ============================================================ */
          <>
            {/* Search Bar */}
            <View style={styles.searchBarRow}>
              <View style={styles.searchInputBox}>
                <Ionicons name="search" size={17} color="#9A9FA5" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm ưu đãi, thương hiệu..."
                  placeholderTextColor="#9A9FA5"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#9A9FA5" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category Icons Row (Giống ảnh 1) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {OFFER_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItemBtn,
                      isSelected && styles.categoryItemBtnActive
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <View
                      style={[
                        styles.categoryIconCircle,
                        { backgroundColor: cat.bg }
                      ]}
                    >
                      <Ionicons name={cat.icon} size={22} color={cat.color} />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && styles.categoryLabelActive
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Flash Sale Banner (Feature Mới & Cải tiến) */}
            <View style={styles.flashSaleBanner}>
              <View style={styles.flashSaleLeft}>
                <View style={styles.flashSaleTagRow}>
                  <Text style={styles.flashSaleTag}>⚡ GIỜ VÀNG SĂN DEAL</Text>
                  <Text style={styles.flashSaleTimer}>02:45:18</Text>
                </View>
                <Text style={styles.flashSaleTitle}>Giảm 50% số xu đổi voucher</Text>
                <Text style={styles.flashSaleSub}>Dành riêng cho thành viên EcoGo hôm nay</Text>
              </View>
              <View style={styles.flashSaleRight}>
                <View style={styles.flashSaleCoinPill}>
                  <Text style={styles.flashSaleCoinVal}>Từ 25 Xu</Text>
                </View>
              </View>
            </View>

            {/* ============================================================
                SECTION 1: QUÀ TẶNG ĐỘC QUYỀN (HORIZONTAL CAROUSEL - GIỐNG ẢNH 1)
               ============================================================ */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionMainTitle}>Quà tặng độc quyền</Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory('ALL')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionViewAllText}>Xem thêm</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.exclusiveScrollContent}
            >
              {filterList(EXCLUSIVE_GIFTS).map((item) => (
                <View key={item.id} style={styles.exclusiveCard}>
                  {/* Card Image with Real Graphic */}
                  <View style={styles.exclusiveImgContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.exclusiveImg}
                      resizeMode="cover"
                    />
                    <View style={styles.exclusiveBadgeOverlay}>
                      <Text style={[styles.exclusiveBadgeText, { color: item.badgeColor }]}>
                        {item.badge}
                      </Text>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View style={styles.exclusiveCardBody}>
                    <View style={styles.brandRow}>
                      <Ionicons name={item.brandLogo} size={13} color={item.brandColor} />
                      <Text style={styles.brandNameText}>{item.brand}</Text>
                    </View>

                    <Text style={styles.exclusiveCardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.exclusiveBottomRow}>
                      <View style={styles.coinPriceRow}>
                        <Text style={styles.coinPriceVal}>{item.coins}</Text>
                        <View style={styles.coinMiniIcon}>
                          <Text style={styles.coinMiniText}>⚡</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.redeemYellowBtn}
                        activeOpacity={0.85}
                        onPress={() => handleStartRedeem(item)}
                      >
                        <Text style={styles.redeemYellowBtnText}>Đổi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* ============================================================
                SECTION 2: QUÀ TẶNG URBOX (GRID 2 CỘT - GIỐNG ẢNH 2)
               ============================================================ */}
            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
              <Text style={styles.sectionMainTitle}>Quà tặng UrBox</Text>
              <TouchableOpacity
                onPress={() => setUrboxFilter('ALL')}
                activeOpacity={0.7}
              >
                <Text style={styles.sectionViewAllText}>Xem thêm</Text>
              </TouchableOpacity>
            </View>

            {/* UrBox Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.urboxFilterScroll}
              contentContainerStyle={styles.urboxFilterContent}
            >
              {URBOX_FILTERS.map((f) => {
                const isActive = urboxFilter === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[
                      styles.urboxFilterPill,
                      isActive && styles.urboxFilterPillActive
                    ]}
                    onPress={() => setUrboxFilter(f.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.urboxFilterText,
                        isActive && styles.urboxFilterTextActive
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* UrBox 2-Column Grid */}
            <View style={styles.twoColGrid}>
              {filteredUrBox.map((item) => (
                <View key={item.id} style={styles.gridItemCard}>
                  {/* Photo Container */}
                  <View style={styles.gridImgContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.gridImg}
                      resizeMode="cover"
                    />
                    <View style={styles.urboxLogoWatermark}>
                      <Text style={styles.urboxWatermarkText}>UrBox eGIFT</Text>
                    </View>
                  </View>

                  {/* Body */}
                  <View style={styles.gridCardBody}>
                    <Text style={styles.gridBrandName}>{item.brand}</Text>
                    <Text style={styles.gridCardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.gridBottomRow}>
                      <View style={styles.coinPriceRow}>
                        <Text style={styles.coinPriceVal}>{item.coins}</Text>
                        <View style={styles.coinMiniIcon}>
                          <Text style={styles.coinMiniText}>⚡</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.redeemYellowBtn}
                        activeOpacity={0.85}
                        onPress={() => handleStartRedeem(item)}
                      >
                        <Text style={styles.redeemYellowBtnText}>Đổi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* ============================================================
                SECTION 3: QUÀ TẶNG KHÁC & ECOGO PERKS (GRID 2 CỘT - GIỐNG ẢNH 3)
               ============================================================ */}
            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
              <Text style={styles.sectionMainTitle}>Quà tặng khác</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.sectionViewAllText}>Xem thêm</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.twoColGrid}>
              {filterList(OTHER_GIFTS).map((item) => (
                <View key={item.id} style={styles.gridItemCard}>
                  <View style={styles.gridImgContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.gridImg}
                      resizeMode="cover"
                    />
                    {item.badge && (
                      <View style={styles.gridBadgeOverlay}>
                        <Text style={styles.gridBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.gridCardBody}>
                    <Text style={styles.gridBrandName}>{item.brand}</Text>
                    <Text style={styles.gridCardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <View style={styles.gridBottomRow}>
                      <View style={styles.coinPriceRow}>
                        <Text style={styles.coinPriceVal}>{item.coins}</Text>
                        <View style={styles.coinMiniIcon}>
                          <Text style={styles.coinMiniText}>⚡</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.redeemYellowBtn}
                        activeOpacity={0.85}
                        onPress={() => handleStartRedeem(item)}
                      >
                        <Text style={styles.redeemYellowBtnText}>Đổi</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ============================================================
          MODAL 1: XÁC NHẬN ĐỔI VOUCHER BẰNG ECOCOIN
         ============================================================ */}
      <Modal
        visible={showRedeemModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedeemModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.redeemModalCard}>
            {selectedGift && (
              <>
                <View style={styles.redeemModalHeader}>
                  <Text style={styles.redeemModalTitle}>Xác nhận đổi quà</Text>
                  <TouchableOpacity
                    style={styles.closeBtnSmall}
                    onPress={() => setShowRedeemModal(false)}
                  >
                    <Ionicons name="close" size={20} color="#1A1D1F" />
                  </TouchableOpacity>
                </View>

                <Image
                  source={{ uri: selectedGift.image }}
                  style={styles.redeemPreviewImg}
                  resizeMode="cover"
                />

                <Text style={styles.redeemGiftBrand}>{selectedGift.brand}</Text>
                <Text style={styles.redeemGiftTitle}>{selectedGift.title}</Text>
                <Text style={styles.redeemGiftDesc}>{selectedGift.desc}</Text>

                <View style={styles.redeemCostTable}>
                  <View style={styles.redeemCostRow}>
                    <Text style={styles.redeemCostLabel}>Giá trị quà tặng:</Text>
                    <Text style={styles.redeemCostValBold}>{selectedGift.originalValue}</Text>
                  </View>
                  <View style={styles.redeemCostDivider} />

                  <View style={styles.redeemCostRow}>
                    <Text style={styles.redeemCostLabel}>EcoCoin cần đổi:</Text>
                    <View style={styles.costCoinPill}>
                      <Text style={styles.costCoinVal}>{selectedGift.coins} EcoCoin</Text>
                    </View>
                  </View>
                  <View style={styles.redeemCostDivider} />

                  <View style={styles.redeemCostRow}>
                    <Text style={styles.redeemCostLabel}>Số dư hiện tại của bạn:</Text>
                    <Text
                      style={[
                        styles.redeemCostVal,
                        userCoins < selectedGift.coins && { color: '#DC2626' }
                      ]}
                    >
                      {userCoins} EcoCoin
                    </Text>
                  </View>
                </View>

                {userCoins < selectedGift.coins && (
                  <View style={styles.notEnoughAlert}>
                    <Ionicons name="alert-circle" size={15} color="#DC2626" />
                    <Text style={styles.notEnoughAlertText}>
                      Bạn còn thiếu {selectedGift.coins - userCoins} EcoCoin để đổi quà này.
                    </Text>
                  </View>
                )}

                <View style={styles.redeemModalFooter}>
                  <TouchableOpacity
                    style={styles.redeemCancelBtn}
                    onPress={() => setShowRedeemModal(false)}
                  >
                    <Text style={styles.redeemCancelText}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.redeemConfirmBtn,
                      userCoins < selectedGift.coins && styles.redeemConfirmBtnDisabled
                    ]}
                    onPress={handleConfirmRedeem}
                    disabled={isRedeeming || userCoins < selectedGift.coins}
                  >
                    {isRedeeming ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.redeemConfirmText}>Xác nhận đổi ngay</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL 2: ĐỔI THÀNH CÔNG & HIỂN THỊ MÃ VOUCHER
         ============================================================ */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-done" size={32} color="#15803D" />
            </View>

            <Text style={styles.successModalTitle}>Đổi quà thành công!</Text>
            <Text style={styles.successModalSub}>
              Mã ưu đãi đã được lưu trực tiếp vào Ví Voucher của bạn.
            </Text>

            {redeemedVoucher && (
              <View style={styles.ticketCard}>
                <Text style={styles.ticketBrand}>{redeemedVoucher.brand}</Text>
                <Text style={styles.ticketTitle}>{redeemedVoucher.title}</Text>

                <View style={styles.barcodeBox}>
                  <View style={styles.simulatedBarcodeLines}>
                    {[1, 3, 2, 4, 1, 3, 2, 4, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3].map((w, i) => (
                      <View
                        key={i}
                        style={{
                          width: w * 2,
                          height: 38,
                          backgroundColor: '#1A1D1F',
                          marginHorizontal: 1.5
                        }}
                      />
                    ))}
                  </View>
                  <Text style={styles.ticketCodeNumber}>{redeemedVoucher.code}</Text>
                </View>

                <Text style={styles.ticketExpiry}>Hạn dùng: {redeemedVoucher.expiry}</Text>
              </View>
            )}

            <View style={styles.successActionCol}>
              <TouchableOpacity
                style={styles.applyNowBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setShowSuccessModal(false);
                  if (onApplyVoucher && redeemedVoucher) {
                    onApplyVoucher(redeemedVoucher.code);
                  }
                  if (onNavigateToVehicles) {
                    onNavigateToVehicles('CAR');
                  }
                }}
              >
                <Ionicons name="car-sport" size={18} color="#FFFFFF" />
                <Text style={styles.applyNowBtnText}>Dùng để đặt xe ngay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeSuccessBtn}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.closeSuccessBtnText}>Đóng & Lưu trong Ví</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL 3: ĐIỂM DANH CHUỖI XANH 7 NGÀY NHẬN ECOCOIN
         ============================================================ */}
      <Modal
        visible={showCheckInModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCheckInModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.checkInModalCard}>
            <View style={styles.checkInModalHeader}>
              <View>
                <Text style={styles.checkInModalTitle}>Điểm danh nhận EcoCoin</Text>
                <Text style={styles.checkInModalSub}>Duy trì thói quen xanh mỗi ngày</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtnSmall}
                onPress={() => setShowCheckInModal(false)}
              >
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            <View style={styles.streakBannerRow}>
              <Ionicons name="flame" size={22} color="#F97316" />
              <Text style={styles.streakBannerText}>
                Chuỗi điểm danh liên tục: <Text style={{ fontWeight: '800' }}>{checkInStreak} Ngày</Text>
              </Text>
            </View>

            {/* 7 Days Grid */}
            <View style={styles.sevenDaysGrid}>
              {[
                { day: 1, label: 'Thứ 2', coins: '+15', checked: true },
                { day: 2, label: 'Thứ 3', coins: '+20', checked: true },
                { day: 3, label: 'Thứ 4', coins: '+25', checked: true },
                { day: 4, label: 'Thứ 5', coins: '+30', checked: hasCheckedInToday, today: true },
                { day: 5, label: 'Thứ 6', coins: '+40' },
                { day: 6, label: 'Thứ 7', coins: '+50' },
                { day: 7, label: 'CN', coins: '🎁 100K', isGrand: true }
              ].map((d) => (
                <View
                  key={d.day}
                  style={[
                    styles.dayTile,
                    d.checked && styles.dayTileChecked,
                    d.today && !d.checked && styles.dayTileToday,
                    d.isGrand && styles.dayTileGrand
                  ]}
                >
                  <Text style={[styles.dayLabel, d.checked && { color: '#15803D' }]}>{d.label}</Text>
                  <View
                    style={[
                      styles.dayCoinCircle,
                      d.checked && { backgroundColor: '#DCFCE7' }
                    ]}
                  >
                    {d.checked ? (
                      <Ionicons name="checkmark" size={14} color="#15803D" />
                    ) : (
                      <Text style={styles.dayCoinText}>{d.coins}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.checkInActionBtn,
                hasCheckedInToday && styles.checkInActionBtnDisabled
              ]}
              activeOpacity={0.88}
              onPress={handleDailyCheckIn}
              disabled={hasCheckedInToday}
            >
              <Text style={styles.checkInActionText}>
                {hasCheckedInToday ? '✓ Hôm nay bạn đã nhận +25 Xu' : 'Điểm danh ngay (+25 EcoCoin)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  // Header Hero
  headerHeroGradient: {
    backgroundColor: '#7C3AED',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingHorizontal: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  headerTitleBox: {},
  headerAppBrand: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  headerAppSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1
  },
  dailyCheckInPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.6)',
    gap: 4
  },
  dailyCheckInPillText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  // Big Coin Card
  coinCounterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 14
  },
  coinCircleBig: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4
  },
  coinLetterM: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '900',
    color: '#713F12'
  },
  coinBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6
  },
  coinBalanceNumber: {
    fontFamily: FONTS.family,
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  coinUnitText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FEF08A'
  },
  coinPromptText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4
  },
  historyBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  // Quick Nav 3-Pills
  quickNavFloatContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
    marginTop: 2
  },
  quickNavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  quickNavIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickNavTitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  quickNavSub: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    color: '#6F767E',
    marginTop: 1
  },
  quickNavDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F0E8DC',
    marginHorizontal: 6
  },
  // Scroll Body
  scrollBody: {
    flex: 1,
    paddingHorizontal: 16
  },
  // Search
  searchBarRow: {
    marginTop: 14,
    marginBottom: 12
  },
  searchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#1A1D1F',
    padding: 0
  },
  // Categories
  categoryScroll: {
    marginHorizontal: -16,
    marginBottom: 16
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 12
  },
  categoryItemBtn: {
    alignItems: 'center',
    width: 64
  },
  categoryItemBtnActive: {
    transform: [{ scale: 1.05 }]
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  categoryLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#6F767E',
    textAlign: 'center'
  },
  categoryLabelActive: {
    color: '#7C3AED',
    fontWeight: '800'
  },
  // Flash Sale Banner
  flashSaleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2E1065',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A855F7'
  },
  flashSaleLeft: {
    flex: 1
  },
  flashSaleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  flashSaleTag: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '900',
    color: '#FACC15',
    letterSpacing: 0.5
  },
  flashSaleTimer: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  flashSaleTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  flashSaleSub: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
  },
  flashSaleRight: {},
  flashSaleCoinPill: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  flashSaleCoinVal: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#713F12'
  },
  // Section Titles
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sectionMainTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1D1F'
  },
  sectionViewAllText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7C3AED'
  },
  // Exclusive Carousel (Quà tặng độc quyền)
  exclusiveScrollContent: {
    gap: 14,
    paddingRight: 16
  },
  exclusiveCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3
  },
  exclusiveImgContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
    position: 'relative'
  },
  exclusiveImg: {
    width: '100%',
    height: '100%'
  },
  exclusiveBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  exclusiveBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800'
  },
  exclusiveCardBody: {
    padding: 10
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4
  },
  brandNameText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6F767E'
  },
  exclusiveCardTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1D1F',
    lineHeight: 16,
    height: 32
  },
  exclusiveBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  coinPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  coinPriceVal: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '900',
    color: '#7C3AED'
  },
  coinMiniIcon: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center'
  },
  coinMiniText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#713F12'
  },
  redeemYellowBtn: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2
  },
  redeemYellowBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#713F12'
  },
  // UrBox Filters
  urboxFilterScroll: {
    marginBottom: 14
  },
  urboxFilterContent: {
    gap: 8
  },
  urboxFilterPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  urboxFilterPillActive: {
    backgroundColor: '#7C3AED'
  },
  urboxFilterText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED'
  },
  urboxFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  // 2-Column Grid
  twoColGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  gridItemCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2
  },
  gridImgContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#F3F4F6',
    position: 'relative'
  },
  gridImg: {
    width: '100%',
    height: '100%'
  },
  urboxLogoWatermark: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  urboxWatermarkText: {
    fontFamily: FONTS.family,
    fontSize: 8.5,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  gridBadgeOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  gridBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 8.5,
    fontWeight: '800',
    color: '#DC2626'
  },
  gridCardBody: {
    padding: 10
  },
  gridBrandName: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 2
  },
  gridCardTitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A1D1F',
    lineHeight: 15,
    height: 30
  },
  gridBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  // My Vouchers Screen
  myVouchersContainer: {
    paddingTop: 10
  },
  backToDiscoverBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  backToDiscoverText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED'
  },
  emptyVoucherBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptyVoucherTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#4E3322',
    marginTop: 12
  },
  emptyVoucherSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#8C7A68',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18
  },
  myVoucherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8DEC8',
    position: 'relative',
    overflow: 'hidden'
  },
  myVoucherLeftCutout: {
    position: 'absolute',
    left: -8,
    top: '50%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FAF7F2',
    zIndex: 10
  },
  myVoucherRightCutout: {
    position: 'absolute',
    right: -8,
    top: '50%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FAF7F2',
    zIndex: 10
  },
  myVoucherCardInner: {
    padding: 14
  },
  myVoucherBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  myVoucherBrandPill: {
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  myVoucherBrandText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#6F4E37'
  },
  myVoucherExpiry: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#B45309',
    fontWeight: '600'
  },
  myVoucherTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 4
  },
  myVoucherDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    lineHeight: 16,
    marginBottom: 10
  },
  myVoucherCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F0E8DC'
  },
  myVoucherCodeBox: {},
  myVoucherCodeText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '900',
    color: '#6F4E37',
    letterSpacing: 1
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DEC8',
    gap: 4
  },
  copyCodeBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37'
  },
  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  redeemModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6
  },
  redeemModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  redeemModalTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D1F'
  },
  closeBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  redeemPreviewImg: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    marginBottom: 10
  },
  redeemGiftBrand: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED'
  },
  redeemGiftTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1D1F',
    marginTop: 2
  },
  redeemGiftDesc: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#6F767E',
    marginTop: 4,
    lineHeight: 16
  },
  redeemCostTable: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  redeemCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3
  },
  redeemCostLabel: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#6F767E'
  },
  redeemCostValBold: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1D1F'
  },
  costCoinPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  costCoinVal: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED'
  },
  redeemCostVal: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D'
  },
  redeemCostDivider: {
    height: 0.5,
    backgroundColor: '#EBE3D7',
    marginVertical: 4
  },
  notEnoughAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 10
  },
  notEnoughAlertText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626'
  },
  redeemModalFooter: {
    flexDirection: 'row',
    gap: 10
  },
  redeemCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  redeemCancelText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#6F767E'
  },
  redeemConfirmBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center'
  },
  redeemConfirmBtnDisabled: {
    backgroundColor: '#D8B4FE'
  },
  redeemConfirmText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  // Success Modal
  successModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center'
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  successModalTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1D1F'
  },
  successModalSub: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#6F767E',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E8DEC8',
    marginBottom: 16,
    alignItems: 'center'
  },
  ticketBrand: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED'
  },
  ticketTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D1F',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10
  },
  barcodeBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    width: '100%'
  },
  simulatedBarcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  ticketCodeNumber: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1D1F',
    letterSpacing: 2
  },
  ticketExpiry: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#8C7A68',
    marginTop: 8
  },
  successActionCol: {
    width: '100%',
    gap: 8
  },
  applyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6F4E37',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6
  },
  applyNowBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  closeSuccessBtn: {
    alignItems: 'center',
    paddingVertical: 10
  },
  closeSuccessBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#6F767E'
  },
  // Check-In Modal
  checkInModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20
  },
  checkInModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  checkInModalTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D1F'
  },
  checkInModalSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 1
  },
  streakBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: 8,
    borderRadius: 10,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  streakBannerText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#C2410C'
  },
  sevenDaysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  dayTile: {
    width: 44,
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  dayTileChecked: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC'
  },
  dayTileToday: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FACC15'
  },
  dayTileGrand: {
    borderColor: '#A855F7'
  },
  dayLabel: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '600',
    color: '#6F767E',
    marginBottom: 4
  },
  dayCoinCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E8DEC8'
  },
  dayCoinText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED'
  },
  checkInActionBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkInActionBtnDisabled: {
    backgroundColor: '#15803D'
  },
  checkInActionText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
