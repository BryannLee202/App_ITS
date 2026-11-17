import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';

const PROMO_STORAGE_KEY = 'ecogo_promo_last_shown_date';
let hasShownInitialAdOnSession = false;

const getTodayKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const hasShownPromoToday = () => {
  if (hasShownInitialAdOnSession) return true;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(PROMO_STORAGE_KEY) === getTodayKey();
    } catch (e) {
      return false;
    }
  }
  return false;
};

const markPromoShownToday = () => {
  hasShownInitialAdOnSession = true;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(PROMO_STORAGE_KEY, getTodayKey());
    } catch (e) {}
  }
};

// 5 Chiến dịch Quảng cáo với Ảnh chụp thực tế (Photorealistic) & Điều hướng trực tiếp
const PROMO_CAMPAIGNS = [
  {
    id: 'promo_car_vf3',
    brand: 'ECOGO SMART',
    badge: 'TỪ 45K / GIỜ',
    eyebrow: 'Ô TÔ ĐIỆN TỰ LÁI 24/7',
    titlePrimary: 'Trải nghiệm xe điện',
    titleHighlight: 'Miễn 100% cọc thế chấp',
    subtitle: 'Giao xe tận cửa · Mở khóa kỹ thuật số qua điện thoại',
    btnText: 'Xem danh sách ô tô',
    targetScreen: 'VEHICLES',
    targetCategory: 'CAR',
    image: require('../../assets/promos/promo_car.jpg')
  },
  {
    id: 'promo_bike_10k',
    brand: 'ECOGO CITY',
    badge: 'ĐỒNG GIÁ 10K',
    eyebrow: 'XE MÁY ĐIỆN ĐÔ THỊ',
    titlePrimary: 'Di chuyển phố phường',
    titleHighlight: 'Đồng giá chỉ từ 10.000đ',
    subtitle: 'Pin đầy 100% · Đổi pin nhanh chóng tại mọi trạm Hub',
    btnText: 'Chọn xe máy điện ngay',
    targetScreen: 'VEHICLES',
    targetCategory: 'MOTORBIKE',
    image: require('../../assets/promos/promo_bike.jpg')
  },
  {
    id: 'promo_charging_free',
    brand: 'ECOGO x V-GREEN',
    badge: 'SẠC PIN 0Đ',
    eyebrow: 'MẠNG LƯỚI 3.000+ TRẠM SẠC',
    titlePrimary: 'Nạp năng lượng xanh',
    titleHighlight: 'Miễn phí sạc nhanh 0đ',
    subtitle: 'Tìm trạm sạc gần nhất và kiểm tra trụ trống theo thời gian thực',
    btnText: 'Mở bản đồ trạm sạc',
    targetScreen: 'MAP',
    targetCategory: null,
    image: require('../../assets/promos/promo_charge.jpg')
  },
  {
    id: 'promo_roadtrip_weekend',
    brand: 'ECOGO LUXURY',
    badge: 'ƯU ĐÃI 35%',
    eyebrow: 'HÀNH TRÌNH CUỐI TUẦN',
    titlePrimary: 'Thuê xe du lịch dài ngày',
    titleHighlight: 'Giảm ngay 35% cuối tuần',
    subtitle: 'Không giới hạn số km · Bảo hiểm toàn diện chuyến đi',
    btnText: 'Khám phá xe hạng sang',
    targetScreen: 'VEHICLES',
    targetCategory: 'LUXURY',
    image: require('../../assets/promos/promo_roadtrip.jpg')
  },
  {
    id: 'promo_referral_500k',
    brand: 'ECOGO REWARDS',
    badge: 'THƯỞNG 500K',
    eyebrow: 'ĐẶC QUYỀN THÀNH VIÊN',
    titlePrimary: 'Giới thiệu bạn đồng hành',
    titleHighlight: 'Nhận ngay 500.000đ thuê xe',
    subtitle: 'Tích lũy thêm EcoXu quy đổi phí cầu đường và gói rửa xe',
    btnText: 'Xem đặc quyền & ưu đãi',
    targetScreen: 'OFFERS',
    targetCategory: null,
    image: require('../../assets/promos/promo_referral.jpg')
  }
];

export default function HomePromoPopupModal({
  onNavigateToVehicles,
  onNavigateToMap,
  onNavigateToOffers,
  onOpenReferral
}) {
  const [visible, setVisible] = useState(false);
  const [currentAd, setCurrentAd] = useState(PROMO_CAMPAIGNS[0]);

  const pickRandomAd = () => {
    const randomIndex = Math.floor(Math.random() * PROMO_CAMPAIGNS.length);
    setCurrentAd(PROMO_CAMPAIGNS[randomIndex]);
    markPromoShownToday();
    setVisible(true);
  };

  const handleDismiss = () => {
    markPromoShownToday();
    setVisible(false);
  };

  useEffect(() => {
    // Chỉ hiện tối đa 1 lần duy nhất mỗi ngày, không tự bật lại khi chuyển tab hay F5
    if (!hasShownPromoToday()) {
      const timer = setTimeout(() => {
        pickRandomAd();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Điều hướng chính xác tới mục/chức năng liên quan khi nhấn vào banner hoặc nút CTA
  const handleActionClick = () => {
    markPromoShownToday();
    setVisible(false);
    if (!currentAd) return;

    if (currentAd.targetScreen === 'VEHICLES' && onNavigateToVehicles) {
      onNavigateToVehicles(currentAd.targetCategory || 'CAR');
    } else if (currentAd.targetScreen === 'MAP' && onNavigateToMap) {
      onNavigateToMap();
    } else if (currentAd.targetScreen === 'OFFERS' && onNavigateToOffers) {
      onNavigateToOffers();
    } else if (onOpenReferral) {
      onOpenReferral();
    }
  };

  if (!visible || !currentAd) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable style={styles.popupWrapper} onPress={(e) => e.stopPropagation && e.stopPropagation()}>
          {/* Full-bleed Real Photo Editorial Card — Bấm toàn vùng đều điều hướng */}
          <TouchableOpacity
            style={styles.posterCard}
            activeOpacity={0.94}
            onPress={handleActionClick}
          >
            {/* Ảnh chụp thực tế sắc nét tràn viền */}
            <Image
              source={currentAd.image}
              style={styles.posterImage}
              resizeMode="cover"
            />

            {/* Thanh thương hiệu & nhãn nổi phía trên ảnh */}
            <View style={styles.topOverlayRow}>
              <View style={styles.brandGlassPill}>
                <Ionicons name="sparkles" size={12} color="#D4AF37" />
                <Text style={styles.brandGlassText}>{currentAd.brand}</Text>
              </View>
              <View style={styles.badgeGoldPill}>
                <Text style={styles.badgeGoldText}>{currentAd.badge}</Text>
              </View>
            </View>

            {/* Lớp phủ chuyển sắc mềm dưới chân ảnh (Không che ảnh bằng hộp đen thô) */}
            <View style={styles.bottomScrimLayer}>
              <View style={styles.scrimTopFade} />
              <View style={styles.scrimMidFade} />
              <View style={styles.scrimContentBox}>
                <Text style={styles.eyebrowText}>{currentAd.eyebrow}</Text>
                <Text style={styles.titlePrimaryText}>{currentAd.titlePrimary}</Text>
                <Text style={styles.titleHighlightText}>{currentAd.titleHighlight}</Text>
                <Text style={styles.subtitleText}>{currentAd.subtitle}</Text>

                {/* Nút CTA Champagne Gold sang trọng */}
                <TouchableOpacity
                  style={styles.ctaButton}
                  activeOpacity={0.88}
                  onPress={handleActionClick}
                >
                  <Text style={styles.ctaButtonText}>{currentAd.btnText}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#2B180D" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Nút Đóng (X) nổi bên dưới */}
          <TouchableOpacity
            style={styles.closeCircleBtn}
            activeOpacity={0.75}
            onPress={handleDismiss}
          >
            <View style={styles.closeCircleInner}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissTodayBtn}
            activeOpacity={0.75}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissTodayText}>Không hiện lại hôm nay</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 12, 8, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  popupWrapper: {
    width: '100%',
    maxWidth: 348,
    alignItems: 'center'
  },
  posterCard: {
    width: '100%',
    height: 455,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#2B180D',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 14
  },
  posterImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%'
  },
  topOverlayRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10
  },
  brandGlassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 16, 10, 0.68)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 5
  },
  brandGlassText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6
  },
  badgeGoldPill: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  badgeGoldText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '900',
    color: '#2B180D',
    letterSpacing: 0.4
  },
  bottomScrimLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  scrimTopFade: {
    height: 28,
    backgroundColor: 'rgba(24, 14, 9, 0.28)'
  },
  scrimMidFade: {
    height: 24,
    backgroundColor: 'rgba(24, 14, 9, 0.62)'
  },
  scrimContentBox: {
    backgroundColor: 'rgba(24, 14, 9, 0.88)',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 18
  },
  eyebrowText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  titlePrimaryText: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 23
  },
  titleHighlightText: {
    fontFamily: FONTS.family,
    fontSize: 21,
    fontWeight: '900',
    color: '#FDE047',
    lineHeight: 26,
    marginBottom: 5
  },
  subtitleText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: 'rgba(250, 247, 242, 0.86)',
    lineHeight: 16,
    marginBottom: 14
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 13,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  ctaButtonText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '900',
    color: '#2B180D',
    letterSpacing: 0.3
  },
  closeCircleBtn: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeCircleInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 14, 9, 0.55)'
  },
  dismissTodayBtn: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(24, 14, 9, 0.5)'
  },
  dismissTodayText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)'
  }
});
