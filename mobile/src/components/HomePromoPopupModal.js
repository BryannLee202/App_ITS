import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 5 Chiến dịch Quảng cáo sinh động & ngẫu nhiên (Random Ads)
const PROMO_CAMPAIGNS = [
  {
    id: 'promo_bike_10k',
    brand: 'MOOVTEK · ECOGO',
    tagline: 'ĐẠI TIỆC ĐỒNG GIÁ THÁNG 11',
    title: 'XE MÁY ĐỒNG GIÁ\nCHỈ 10K',
    subtitle: 'VI VU THẢ GA\nKHÔNG LO VỀ GIÁ',
    bgGradient: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    cardBg: '#7C3AED',
    btnBg: '#FACC15',
    btnTextColor: '#4C1D95',
    btnText: 'ĐẶT CHUYẾN NGAY!',
    badge: 'ĐỒNG GIÁ 10K',
    badgeColor: '#F59E0B',
    type: 'BIKE',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
    vectorType: 'BIKE'
  },
  {
    id: 'promo_referral_500k',
    brand: 'ECOGO REWARDS',
    tagline: 'CHIA SẺ HÀNH TRÌNH XANH',
    title: 'GIỚI THIỆU BẠN MỚI\nNHẬN NGAY 500K',
    subtitle: 'TẶNG 500.000Đ VÀO VÍ\n+ 100 ECOCOIN TÍCH LŨY',
    bgGradient: ['#1E1B4B', '#312E81', '#4338CA'],
    cardBg: '#312E81',
    btnBg: '#FACC15',
    btnTextColor: '#1E1B4B',
    btnText: 'NHẬN THƯỞNG 500K!',
    badge: 'THƯỞNG KHỦNG',
    badgeColor: '#10B981',
    type: 'OFFERS',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    vectorType: 'GIFT'
  },
  {
    id: 'promo_car_vf3',
    brand: 'VINFAST x ECOGO',
    tagline: 'TRẢI NGHIỆM ĐẲNG CẤP 24/7',
    title: 'THUÊ Ô TÔ ĐIỆN TỰ LÁI\nCHỈ TỪ 45K/GIỜ',
    subtitle: 'MIỄN 100% CỌC THẾ CHẤP\nMỞ KHÓA TỰ ĐỘNG QUA BLUETOOTH',
    bgGradient: ['#4E3322', '#6F4E37', '#8C6239'],
    cardBg: '#4E3322',
    btnBg: '#D4AF37',
    btnTextColor: '#2B180D',
    btnText: 'THUÊ XE TỰ LÁI NGAY!',
    badge: 'HOT TREND 2026',
    badgeColor: '#D4AF37',
    type: 'CAR',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80',
    vectorType: 'CAR'
  },
  {
    id: 'promo_urbox_deals',
    brand: 'URBOX x ECOGO MOBILITY',
    tagline: 'ĐỔI QUÀ ECOCOIN KHÔNG GIỚI HẠN',
    title: 'ĐỔI VOUCHER CAO CẤP\nCHỈ TỪ 25 XU',
    subtitle: 'HIGHLANDS · ALLUVIA CHOCOLATE\nVEXERE & CGV CINEMAS',
    bgGradient: ['#065F46', '#047857', '#059669'],
    cardBg: '#065F46',
    btnBg: '#FACC15',
    btnTextColor: '#064E3B',
    btnText: 'SĂN DEAL ĐỔI QUÀ!',
    badge: 'GIỜ VÀNG SĂN DEAL',
    badgeColor: '#F59E0B',
    type: 'OFFERS',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    vectorType: 'DEAL'
  },
  {
    id: 'promo_roadtrip_weekend',
    brand: 'ECOGO ROADTRIP · VINFAST EV',
    tagline: 'TIẾP SỨC HÀNH TRÌNH KHÁM PHÁ',
    title: 'THUÊ XE CUỐI TUẦN\nGIẢM NGAY 35%',
    subtitle: 'GIAO XE TẬN CỬA MIỄN PHÍ\nKHÔNG GIỚI HẠN KM · TỰ DO VI VU',
    bgGradient: ['#0F172A', '#1E3A8A', '#2563EB'],
    cardBg: '#1E3A8A',
    btnBg: '#FACC15',
    btnTextColor: '#0F172A',
    btnText: 'LÊN XE VI VU NGAY!',
    badge: 'DEAL HOT CUỐI TUẦN',
    badgeColor: '#F59E0B',
    type: 'CAR',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    vectorType: 'ROADTRIP'
  }
];

export default function HomePromoPopupModal({
  onNavigateToVehicles,
  onNavigateToOffers,
  onOpenReferral
}) {
  const [visible, setVisible] = useState(false);
  const [currentAd, setCurrentAd] = useState(PROMO_CAMPAIGNS[0]);

  // Chọn ngẫu nhiên quảng cáo mỗi lần khởi động hoặc khi người dùng quay lại ứng dụng
  const pickRandomAd = () => {
    const randomIndex = Math.floor(Math.random() * PROMO_CAMPAIGNS.length);
    setCurrentAd(PROMO_CAMPAIGNS[randomIndex]);
    setVisible(true);
  };

  useEffect(() => {
    // Hiển thị sau 600ms khi mở trang chủ
    const timer = setTimeout(() => {
      pickRandomAd();
    }, 600);

    // Lắng nghe khi người dùng out ra (chuyển tab/thu nhỏ ứng dụng) rồi quay lại (focus)
    const handleWindowFocus = () => {
      // Khi out ra vào lại thì đổi ngẫu nhiên sang quảng cáo khác
      const randomIndex = Math.floor(Math.random() * PROMO_CAMPAIGNS.length);
      setCurrentAd(PROMO_CAMPAIGNS[randomIndex]);
      setVisible(true);
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('focus', handleWindowFocus);
    }

    return () => {
      clearTimeout(timer);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('focus', handleWindowFocus);
      }
    };
  }, []);

  const handleActionClick = () => {
    setVisible(false);
    if (!currentAd) return;

    if (currentAd.type === 'BIKE' && onNavigateToVehicles) {
      onNavigateToVehicles('BIKE');
    } else if (currentAd.type === 'CAR' && onNavigateToVehicles) {
      onNavigateToVehicles('CAR');
    } else if (currentAd.type === 'OFFERS' && onNavigateToOffers) {
      onNavigateToOffers();
    } else if (onNavigateToVehicles) {
      onNavigateToVehicles('CAR');
    }
  };

  if (!visible || !currentAd) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.backdrop}>
        {/* Ad Container Box */}
        <View style={styles.popupWrapper}>
          <View style={[styles.cardContainer, { backgroundColor: currentAd.cardBg }]}>
            {/* Top Brand Bar */}
            <View style={styles.topBrandRow}>
              <View style={styles.brandBadgePill}>
                <Ionicons name="sparkles" size={12} color="#FACC15" />
                <Text style={styles.brandBadgeText}>{currentAd.brand}</Text>
              </View>
              <View style={styles.taglinePill}>
                <Text style={styles.taglineText}>{currentAd.tagline}</Text>
              </View>
            </View>

            {/* Mascot & Graphic Container */}
            <View style={styles.graphicBox}>
              {/* Main Photo Banner */}
              <Image
                source={{ uri: currentAd.image }}
                style={styles.adBannerImg}
                resizeMode="cover"
              />

              {/* Character Mascot Illustration Overlay */}
              <View style={styles.mascotBadgeOverlay}>
                {currentAd.vectorType === 'BIKE' && (
                  <View style={styles.mascotSpeechBubble}>
                    <Ionicons name="bicycle" size={18} color="#7C3AED" />
                    <Text style={styles.mascotSpeechText}>Đồng giá 10K</Text>
                  </View>
                )}
                {currentAd.vectorType === 'CAR' && (
                  <View style={styles.mascotSpeechBubble}>
                    <Ionicons name="car-sport" size={18} color="#4E3322" />
                    <Text style={styles.mascotSpeechText}>Thuê từ 45K/h</Text>
                  </View>
                )}
                {currentAd.vectorType === 'GIFT' && (
                  <View style={styles.mascotSpeechBubble}>
                    <Ionicons name="gift" size={18} color="#D97706" />
                    <Text style={styles.mascotSpeechText}>Thưởng 500K</Text>
                  </View>
                )}
                {currentAd.vectorType === 'DEAL' && (
                  <View style={styles.mascotSpeechBubble}>
                    <Ionicons name="pricetag" size={18} color="#059669" />
                    <Text style={styles.mascotSpeechText}>Deal từ 25 Xu</Text>
                  </View>
                )}
                {currentAd.vectorType === 'ROADTRIP' && (
                  <View style={styles.mascotSpeechBubble}>
                    <Ionicons name="compass" size={18} color="#2563EB" />
                    <Text style={styles.mascotSpeechText}>Vi vu cuối tuần</Text>
                  </View>
                )}
              </View>

              {/* Graphic Highlight Card */}
              <View style={styles.graphicTextCard}>
                <Text style={styles.adHeadlineTitle}>{currentAd.title}</Text>
                <Text style={styles.adHeadlineSub}>{currentAd.subtitle}</Text>
              </View>
            </View>

            {/* Big Action CTA Button (Giống hệt nút ĐẶT CHUYẾN NGAY trong ảnh) */}
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: currentAd.btnBg }]}
              activeOpacity={0.88}
              onPress={handleActionClick}
            >
              <Text style={[styles.ctaButtonText, { color: currentAd.btnTextColor }]}>
                {currentAd.btnText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Circular Close Button (X) Floating Underneath (Giống hệt ảnh mẫu) */}
          <TouchableOpacity
            style={styles.closeCircleBtn}
            activeOpacity={0.75}
            onPress={() => setVisible(false)}
          >
            <View style={styles.closeCircleInner}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  popupWrapper: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center'
  },
  cardContainer: {
    width: '100%',
    borderRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  topBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12
  },
  brandBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  brandBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  taglinePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  taglineText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FEF08A'
  },
  graphicBox: {
    width: '100%',
    height: 310,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    justifyContent: 'flex-end'
  },
  adBannerImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%'
  },
  mascotBadgeOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10
  },
  mascotSpeechBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  mascotSpeechText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '900',
    color: '#1A1D1F'
  },
  graphicTextCard: {
    backgroundColor: 'rgba(15, 12, 28, 0.88)',
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center'
  },
  adHeadlineTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '900',
    color: '#FACC15',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3
  },
  adHeadlineSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
    opacity: 0.95
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  ctaButtonText: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  // Nút đóng tròn phía dưới
  closeCircleBtn: {
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeCircleInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  }
});
