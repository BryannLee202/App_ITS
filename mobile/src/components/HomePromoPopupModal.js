import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  AppState
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Biến phiên toàn cục: Đảm bảo quảng cáo chỉ hiện 1 lần lúc vào app,
// và TUYỆT ĐỐI KHÔNG hiện lại khi người dùng chuyển qua lại các chức năng/tab trong app.
// CHỈ HIỆN KHI THIẾT BỊ THỰC SỰ OUT RA KHỎI APP VÀ VÀO LẠI!
let hasShownInitialAdOnSession = false;
let wasAppBackgrounded = false;

// 5 Chiến dịch Quảng cáo đồ họa Vector Cute chuẩn thuần EcoGo Smart
const PROMO_CAMPAIGNS = [
  {
    id: 'promo_bike_10k',
    brand: 'ECOGO SMART',
    tagline: 'ĐẠI TIỆC ĐỒNG GIÁ',
    titlePrimary: 'XE MÁY ĐỒNG GIÁ',
    titleHighlight: 'CHỈ 10K',
    subtitle: 'VI VU THẢ GA · KHÔNG LO VỀ GIÁ',
    cardBg: '#7C3AED',
    stageBg: '#FDE047',
    btnBg: '#FACC15',
    btnTextColor: '#4C1D95',
    btnText: 'ĐẶT CHUYẾN NGAY!',
    speechText: 'Đồng giá 10K',
    speechIcon: 'bicycle',
    speechColor: '#7C3AED',
    type: 'BIKE',
    vectorType: 'BIKE'
  },
  {
    id: 'promo_car_vf3',
    brand: 'VINFAST x ECOGO',
    tagline: 'TRẢI NGHIỆM ĐẲNG CẤP',
    titlePrimary: 'THUÊ Ô TÔ ĐIỆN TỰ LÁI',
    titleHighlight: 'CHỈ TỪ 45K/H',
    subtitle: 'MIỄN 100% CỌC · MỞ KHÓA TỰ ĐỘNG',
    cardBg: '#4E3322',
    stageBg: '#FEF08A',
    btnBg: '#D4AF37',
    btnTextColor: '#2B180D',
    btnText: 'THUÊ XE TỰ LÁI NGAY!',
    speechText: 'Thuê từ 45K/h',
    speechIcon: 'car-sport',
    speechColor: '#4E3322',
    type: 'CAR',
    vectorType: 'CAR'
  },
  {
    id: 'promo_roadtrip_weekend',
    brand: 'ECOGO ROADTRIP',
    tagline: 'HÀNH TRÌNH KHÁM PHÁ',
    titlePrimary: 'THUÊ XE CUỐI TUẦN',
    titleHighlight: 'GIẢM NGAY 35%',
    subtitle: 'GIAO XE TẬN CỬA · TỰ DO VI VU',
    cardBg: '#1E3A8A',
    stageBg: '#BAE6FD',
    btnBg: '#FACC15',
    btnTextColor: '#0F172A',
    btnText: 'LÊN XE VI VU NGAY!',
    speechText: 'Vi vu cuối tuần',
    speechIcon: 'compass',
    speechColor: '#1E3A8A',
    type: 'CAR',
    vectorType: 'ROADTRIP'
  },
  {
    id: 'promo_charging_free',
    brand: 'V-GREEN x ECOGO',
    tagline: 'TIẾP SỨC HÀNH TRÌNH XANH',
    titlePrimary: 'MIỄN PHÍ SẠC PIN 0Đ',
    titleHighlight: '3.000+ TRẠM SẠC',
    subtitle: 'SẠC SIÊU NHANH TRÊN TOÀN QUỐC',
    cardBg: '#065F46',
    stageBg: '#A7F3D0',
    btnBg: '#FACC15',
    btnTextColor: '#064E3B',
    btnText: 'TÌM TRẠM SẠC NGAY!',
    speechText: 'Sạc Pin 0Đ',
    speechIcon: 'flash',
    speechColor: '#065F46',
    type: 'CAR',
    vectorType: 'CHARGE'
  },
  {
    id: 'promo_referral_500k',
    brand: 'ECOGO REWARDS',
    tagline: 'CHIA SẺ HÀNH TRÌNH',
    titlePrimary: 'GIỚI THIỆU BẠN MỚI',
    titleHighlight: 'NHẬN NGAY 500K',
    subtitle: 'TẶNG 500.000Đ THUÊ XE VÀO VÍ',
    cardBg: '#312E81',
    stageBg: '#FED7AA',
    btnBg: '#FACC15',
    btnTextColor: '#1E1B4B',
    btnText: 'NHẬN 500K THUÊ XE!',
    speechText: 'Thưởng 500K',
    speechIcon: 'gift',
    speechColor: '#312E81',
    type: 'CAR',
    vectorType: 'GIFT'
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
    // 1. Chỉ hiện MỘT LẦN DUY NHẤT khi người dùng khởi động/vào app ban đầu
    if (!hasShownInitialAdOnSession) {
      hasShownInitialAdOnSession = true;
      const timer = setTimeout(() => {
        pickRandomAd();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // 2. Lắng nghe sự kiện THIẾT BỊ OUT RA APP VÀ VÀO LẠI
    // (Bấm Home, chuyển sang app khác, khóa màn hình, hoặc chuyển tab trình duyệt)
    // Tuyệt đối KHÔNG kích hoạt khi chuyển qua lại giữa các màn hình trong nội bộ app!
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        wasAppBackgrounded = true;
      } else if (nextAppState === 'active') {
        if (wasAppBackgrounded) {
          wasAppBackgrounded = false;
          // Người dùng vừa thực sự out ra app rồi quay lại -> Đổi ngẫu nhiên quảng cáo khác
          pickRandomAd();
        }
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    // Xử lý trên nền tảng Web: document.visibilityState
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined') {
        if (document.visibilityState === 'hidden') {
          wasAppBackgrounded = true;
        } else if (document.visibilityState === 'visible') {
          if (wasAppBackgrounded) {
            wasAppBackgrounded = false;
            pickRandomAd();
          }
        }
      }
    };

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      appStateSub.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        <View style={styles.popupWrapper}>
          {/* Main Card Container with Vibrant Flat Background */}
          <View style={[styles.cardContainer, { backgroundColor: currentAd.cardBg }]}>
            
            {/* 1. Top Brand Header Bar */}
            <View style={styles.topBrandRow}>
              <View style={styles.brandBadgePill}>
                <Ionicons name="sparkles" size={13} color="#FACC15" />
                <Text style={styles.brandBadgeText}>{currentAd.brand}</Text>
              </View>
              <View style={styles.taglinePill}>
                <Text style={styles.taglineText}>{currentAd.tagline}</Text>
              </View>
            </View>

            {/* 2. Direct Typography Header (Crisp Gold & White - No dark box!) */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.titlePrimary}>{currentAd.titlePrimary}</Text>
              <Text style={styles.titleHighlight}>{currentAd.titleHighlight}</Text>
              <Text style={styles.subtitle}>{currentAd.subtitle}</Text>
            </View>

            {/* 3. Illustrative Cute Stage (No AI photo, Pure Vector & Cute Mascot) */}
            <View style={[styles.illustrativeStage, { backgroundColor: currentAd.stageBg }]}>
              
              {/* Floating Speech Bubble */}
              <View style={styles.speechBubbleContainer}>
                <Ionicons name={currentAd.speechIcon} size={16} color={currentAd.speechColor} />
                <Text style={[styles.speechBubbleText, { color: currentAd.speechColor }]}>
                  {currentAd.speechText}
                </Text>
              </View>

              {/* Vector Artwork according to type */}
              {currentAd.vectorType === 'BIKE' && (
                <View style={styles.vectorBikeContainer}>
                  {/* Cute Scooter Silhouette with Headlight & Mascot */}
                  <View style={styles.scooterBody}>
                    <View style={styles.scooterHandlebar}>
                      <View style={styles.scooterMirrorL} />
                      <View style={styles.scooterHeadlight}>
                        <View style={styles.scooterHeadlightGlow} />
                      </View>
                      <View style={styles.scooterMirrorR} />
                    </View>
                    <View style={styles.scooterShield}>
                      <Text style={styles.scooterBrandMini}>ECO</Text>
                    </View>
                    <View style={styles.scooterSeat}>
                      <Text style={styles.riderMascotEmoji}>🛵😎</Text>
                    </View>
                    <View style={styles.scooterWheelsRow}>
                      <View style={styles.scooterWheel}>
                        <View style={styles.scooterWheelHub} />
                      </View>
                      <View style={styles.scooterChassisBeam} />
                      <View style={styles.scooterWheel}>
                        <View style={styles.scooterWheelHub} />
                      </View>
                    </View>
                  </View>
                  <View style={styles.groundShadow} />
                </View>
              )}

              {currentAd.vectorType === 'CAR' && (
                <View style={styles.vectorCarContainer}>
                  {/* Cute Electric Car with Smiling Driver & Bluetooth Key */}
                  <View style={styles.carRoof}>
                    <View style={styles.carWindow}>
                      <Text style={styles.carDriverFace}>😊</Text>
                    </View>
                  </View>
                  <View style={styles.carChassis}>
                    <View style={styles.carHeadlight}>
                      <View style={styles.carBeam} />
                    </View>
                    <View style={styles.carEcoBadge}>
                      <Text style={styles.carEcoText}>🌱</Text>
                    </View>
                    <View style={styles.carTaillight} />
                  </View>
                  <View style={styles.carWheelsRow}>
                    <View style={styles.carWheel}>
                      <View style={styles.carWheelRim} />
                    </View>
                    <View style={styles.carWheel}>
                      <View style={styles.carWheelRim} />
                    </View>
                  </View>
                  <View style={styles.smartKeyFloating}>
                    <Ionicons name="key" size={14} color="#D97706" />
                    <Ionicons name="bluetooth" size={12} color="#2563EB" />
                  </View>
                  <View style={styles.groundShadow} />
                </View>
              )}

              {currentAd.vectorType === 'ROADTRIP' && (
                <View style={styles.vectorRoadtripContainer}>
                  {/* Coastal Road with Cute SUV & Surfboard */}
                  <View style={styles.sunCircle}>
                    <Text style={styles.sunEmoji}>☀️</Text>
                  </View>
                  <View style={styles.mountainBackdrop}>
                    <View style={styles.mountainPeak1} />
                    <View style={styles.mountainPeak2} />
                  </View>
                  <View style={styles.roadtripCar}>
                    <View style={styles.luggageRack}>
                      <Text style={styles.luggageItem}>🎒🏕️</Text>
                    </View>
                    <View style={styles.roadtripRoof}>
                      <Text style={styles.roadtripFace}>😎</Text>
                    </View>
                    <View style={styles.roadtripBody} />
                    <View style={styles.carWheelsRow}>
                      <View style={styles.carWheel}>
                        <View style={styles.carWheelRim} />
                      </View>
                      <View style={styles.carWheel}>
                        <View style={styles.carWheelRim} />
                      </View>
                    </View>
                  </View>
                  <View style={styles.roadStripe} />
                  <View style={styles.groundShadow} />
                </View>
              )}

              {currentAd.vectorType === 'CHARGE' && (
                <View style={styles.vectorChargeContainer}>
                  {/* High-tech EV Station Totem & Energy Bolt */}
                  <View style={styles.stationTotem}>
                    <View style={styles.stationScreen}>
                      <Text style={styles.stationScreenText}>⚡ 100%</Text>
                    </View>
                    <View style={styles.stationPort} />
                  </View>
                  <View style={styles.stationCableCurve} />
                  <View style={styles.chargingCarMini}>
                    <Text style={styles.chargingCarEmoji}>🚗🔋</Text>
                  </View>
                  <View style={styles.floatingEnergySparks}>
                    <Text style={styles.spark1}>⚡</Text>
                    <Text style={styles.spark2}>🌿</Text>
                  </View>
                  <View style={styles.groundShadow} />
                </View>
              )}

              {currentAd.vectorType === 'GIFT' && (
                <View style={styles.vectorGiftContainer}>
                  {/* 3D-styled Golden Chest Bursting with Coins & Keys */}
                  <View style={styles.giftBoxWrapper}>
                    <Text style={styles.giftBoxIcon}>🎁</Text>
                    <View style={styles.coinsBurstRow}>
                      <Text style={styles.coinParticle}>🪙</Text>
                      <Text style={styles.coinParticleCenter}>⚡500K</Text>
                      <Text style={styles.coinParticle}>🔑</Text>
                    </View>
                    <View style={styles.confettiRow}>
                      <Text style={styles.confettiStar}>✨</Text>
                      <Text style={styles.confettiStar}>🎉</Text>
                    </View>
                  </View>
                  <View style={styles.groundShadow} />
                </View>
              )}

            </View>

            {/* 4. Big Action CTA Button */}
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

          {/* 5. Circular Close Button (X) Floating Underneath */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  popupWrapper: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center'
  },
  cardContainer: {
    width: '100%',
    borderRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)'
  },
  topBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8
  },
  brandBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4
  },
  brandBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6
  },
  taglinePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  taglineText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FEF08A',
    letterSpacing: 0.3
  },

  /* HEADER TYPOGRAPHY */
  headerTextContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 4
  },
  titlePrimary: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  titleHighlight: {
    fontFamily: FONTS.family,
    fontSize: 30,
    fontWeight: '900',
    color: '#FDE047',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginVertical: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  subtitle: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
    letterSpacing: 0.4
  },

  /* ILLUSTRATIVE STAGE */
  illustrativeStage: {
    width: '100%',
    height: 165,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)'
  },
  speechBubbleContainer: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10
  },
  speechBubbleText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '900'
  },

  /* VECTOR BIKE */
  vectorBikeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  scooterBody: {
    alignItems: 'center',
    position: 'relative'
  },
  scooterHandlebar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  scooterMirrorL: {
    width: 6,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginRight: 6
  },
  scooterHeadlight: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scooterHeadlightGlow: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FEF08A'
  },
  scooterMirrorR: {
    width: 6,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginLeft: 6
  },
  scooterShield: {
    width: 48,
    height: 34,
    backgroundColor: '#8B5CF6',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  scooterBrandMini: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FDE047'
  },
  scooterSeat: {
    position: 'absolute',
    top: -12,
    left: 20
  },
  riderMascotEmoji: {
    fontSize: 40
  },
  scooterWheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  scooterWheel: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E293B',
    borderWidth: 3,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scooterWheelHub: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDE047'
  },
  scooterChassisBeam: {
    width: 38,
    height: 6,
    backgroundColor: '#6D28D9'
  },

  /* VECTOR CAR */
  vectorCarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  carRoof: {
    width: 70,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 14,
    borderWidth: 2,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  carWindow: {
    width: 52,
    height: 22,
    backgroundColor: '#BAE6FD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  carDriverFace: {
    fontSize: 16
  },
  carChassis: {
    width: 120,
    height: 32,
    backgroundColor: '#0284C7',
    borderRadius: 12,
    marginTop: -2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#38BDF8'
  },
  carHeadlight: {
    width: 16,
    height: 12,
    backgroundColor: '#FEF08A',
    borderRadius: 4,
    position: 'relative'
  },
  carBeam: {
    position: 'absolute',
    left: -14,
    top: 2,
    width: 12,
    height: 8,
    backgroundColor: 'rgba(254, 240, 138, 0.4)',
    borderRadius: 2
  },
  carEcoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6
  },
  carEcoText: {
    fontSize: 11
  },
  carTaillight: {
    width: 10,
    height: 10,
    backgroundColor: '#EF4444',
    borderRadius: 3
  },
  carWheelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 90,
    marginTop: -8
  },
  carWheel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 2.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  carWheelRim: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDE047'
  },
  smartKeyFloating: {
    position: 'absolute',
    left: 20,
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderRadius: 12,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },

  /* VECTOR ROADTRIP */
  vectorRoadtripContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  sunCircle: {
    position: 'absolute',
    top: 8,
    left: 18
  },
  sunEmoji: {
    fontSize: 22
  },
  mountainBackdrop: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    opacity: 0.4
  },
  mountainPeak1: {
    width: 70,
    height: 40,
    borderLeftWidth: 35,
    borderRightWidth: 35,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0284C7'
  },
  mountainPeak2: {
    width: 90,
    height: 50,
    borderLeftWidth: 45,
    borderRightWidth: 45,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0369A1',
    marginLeft: -20
  },
  roadtripCar: {
    alignItems: 'center'
  },
  luggageRack: {
    marginBottom: -4,
    zIndex: 5
  },
  luggageItem: {
    fontSize: 16
  },
  roadtripRoof: {
    width: 65,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  roadtripFace: {
    fontSize: 14
  },
  roadtripBody: {
    width: 105,
    height: 28,
    backgroundColor: '#EA580C',
    borderRadius: 10,
    marginTop: -2
  },
  roadStripe: {
    position: 'absolute',
    bottom: 12,
    width: '80%',
    height: 3,
    backgroundColor: '#FDE047',
    borderRadius: 2
  },

  /* VECTOR CHARGE */
  vectorChargeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    gap: 12
  },
  stationTotem: {
    width: 38,
    height: 80,
    backgroundColor: '#064E3B',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#34D399',
    alignItems: 'center',
    paddingTop: 8
  },
  stationScreen: {
    backgroundColor: '#047857',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4
  },
  stationScreenText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#6EE7B7'
  },
  stationPort: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FDE047',
    marginTop: 18
  },
  stationCableCurve: {
    width: 30,
    height: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#10B981',
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }]
  },
  chargingCarMini: {
    alignItems: 'center'
  },
  chargingCarEmoji: {
    fontSize: 36
  },
  floatingEnergySparks: {
    position: 'absolute',
    top: 10,
    left: 20
  },
  spark1: {
    fontSize: 18
  },
  spark2: {
    fontSize: 14
  },

  /* VECTOR GIFT */
  vectorGiftContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  giftBoxWrapper: {
    alignItems: 'center'
  },
  giftBoxIcon: {
    fontSize: 48
  },
  coinsBurstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },
  coinParticle: {
    fontSize: 14
  },
  coinParticleCenter: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D97706'
  },
  confettiRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4
  },
  confettiStar: {
    fontSize: 16
  },

  /* COMMON GROUND SHADOW */
  groundShadow: {
    width: 100,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    marginTop: 4
  },

  /* CTA BUTTON */
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  ctaButtonText: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8
  },

  /* CLOSE BUTTON */
  closeCircleBtn: {
    marginTop: 18,
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  }
});
