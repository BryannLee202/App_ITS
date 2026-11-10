import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';

export default function ProfileScreen({ onOpenGreenRace, onLogout, theme = THEME_PRESETS.MINT }) {
  const [user] = useState({
    fullName: 'Minh Tài',
    phone: '+84386726647',
    email: 'minhtai@uth.edu.vn',
    licenseNumber: 'GPLX B2 - 790123456789',
    co2TreesPerDay: 2,
    greenFundContribution: '125.000 VNĐ',
    totalKm: 142,
    year2026Km: 142
  });

  const [showGSMContractModal, setShowGSMContractModal] = useState(false);

  const handleOpenSurvey = () => {
    const surveyUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfq1tFb8DmWn5QNuS5tkb6U5QXKND7s4JFDFg3F_8oXnberlA/viewform';
    Linking.openURL(surveyUrl).catch(() => {
      Alert.alert('Không thể mở liên kết', surveyUrl);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================
            1. TOP PROFILE HEADER ("Minh Tài >" + "+84386726647")
           ============================================================ */}
        <View style={styles.topUserRow}>
          <View style={[styles.avatarCyanCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={30} color="#FFFFFF" />
            <View style={styles.avatarWarnBadge}>
              <Text style={styles.avatarWarnText}>!</Text>
            </View>
          </View>

          <View style={styles.userInfoCol}>
            <View style={styles.userNameRow}>
              <Text style={styles.userNameText}>{user.fullName}</Text>
              <Ionicons name="chevron-forward" size={18} color="#6F767E" />
            </View>
            <Text style={styles.userPhoneText}>{user.phone}</Text>
          </View>
        </View>

        {/* ============================================================
            2. EMAIL / eKYC VERIFICATION BANNER CARD
           ============================================================ */}
        <View style={styles.emailVerifyCard}>
          <View style={styles.envelope3DBox}>
            <Ionicons name="mail-open" size={26} color={theme.primary} />
            <View style={styles.shieldCyanBadge}>
              <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emailVerifyTitle}>Xác thực Email & GPLX B2</Text>
            <Text style={styles.emailVerifyDesc}>
              Xác thực email để nhận hóa đơn, hợp đồng thuê xe tự lái và khôi phục tài khoản khi cần thiết
            </Text>
          </View>
        </View>

        {/* Carousel Pagination Dots */}
        <View style={styles.carouselDotsRow}>
          <View style={styles.dotInactive} />
          <View style={styles.dotActiveCyan} />
          <View style={styles.dotInactive} />
        </View>

        {/* ============================================================
            3. GREEN RACE HERO CARD (EXACT REPLICA OF 18:57 SCREENSHOT)
           ============================================================ */}
        <TouchableOpacity
          style={styles.greenRaceCard}
          activeOpacity={0.93}
          onPress={onOpenGreenRace}
        >
          {/* Top Ribbon "ECOGO RACE" & "Xem tiến trình >" */}
          <View style={styles.greenRaceTopBar}>
            <View style={styles.greenRaceRibbon}>
              <Text style={styles.greenRaceRibbonText}>ECOGO RACE</Text>
            </View>

            <TouchableOpacity style={styles.progressBtnPill} onPress={onOpenGreenRace}>
              <Text style={[styles.progressBtnText, { color: theme.primary }]}>Xem tiến trình</Text>
              <Ionicons name="chevron-forward" size={13} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Center Body: Left Hexagon Leaf Emblem | Right CO2 Counter */}
          <View style={styles.greenRaceBodyRow}>
            <View style={styles.emblemCol}>
              <View style={styles.hexOuterBronze}>
                <View style={styles.hexInnerWhite}>
                  <Ionicons name="leaf" size={28} color="#689F38" />
                </View>
              </View>
              <View style={styles.seedlingPill}>
                <Text style={styles.seedlingPillText}>Người Ươm Mầm</Text>
              </View>
            </View>

            <View style={styles.co2CounterCol}>
              <Text style={styles.co2HeaderLabel}>Đã giảm lượng CO₂ tương đương</Text>
              <View style={styles.amberCounterPill}>
                <Text style={styles.amberCounterNumber}>{user.co2TreesPerDay}</Text>
              </View>
              <Text style={styles.co2SubLabel}>cây xanh quang hợp/ngày</Text>
            </View>
          </View>

          {/* Bottom 3-Column Metrics Box */}
          <View style={styles.greenRaceMetricsBox}>
            <View style={styles.grMetricCol}>
              <Text style={styles.grMetricLabel}>
                Đã đóng góp quỹ Vì Tương{'\n'}Lai Xanh
              </Text>
              <Text style={styles.grMetricVal}>{user.greenFundContribution}</Text>
            </View>

            <View style={styles.grMetricCol}>
              <Text style={styles.grMetricLabel}>Tổng KM{'\n'}đã đi</Text>
              <Text style={styles.grMetricVal}>{user.totalKm}</Text>
            </View>

            <View style={styles.grMetricCol}>
              <Text style={styles.grMetricLabel}>KM tích luỹ{'\n'}năm 2026</Text>
              <Text style={styles.grMetricVal}>{user.year2026Km}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ============================================================
            4. "GIA ĐÌNH" & "DOANH NGHIỆP" 3D CARDS
           ============================================================ */}
        <View style={styles.dualAccountCardsRow}>
          <TouchableOpacity style={[styles.accountTypeCard, styles.familyCardCream]} activeOpacity={0.9}>
            <Text style={styles.accountTypeTitle}>Gia đình</Text>
            <View style={styles.house3DIllustration}>
              <View style={styles.heartBubbleRed}>
                <Ionicons name="heart" size={10} color="#FFFFFF" />
              </View>
              <Ionicons name="home" size={38} color={theme.primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.accountTypeCard, styles.businessCardAqua]} activeOpacity={0.9}>
            <Text style={styles.accountTypeTitle}>Doanh nghiệp</Text>
            <View style={styles.briefcase3DIllustration}>
              <Ionicons name="briefcase" size={38} color="#1D1D1F" />
              <View style={styles.claspLeftGold} />
              <View style={styles.claspRightGold} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ============================================================
            5. "TÁC VỤ" (2x2 GRID)
           ============================================================ */}
        <Text style={styles.sectionTitle}>Tác vụ</Text>
        <View style={styles.grid2x2}>
          <TouchableOpacity style={styles.taskCardItem}>
            <View style={[styles.taskIcon3D, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="card" size={20} color={theme.primary} />
            </View>
            <Text style={styles.taskCardLabel}>Thanh toán</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskCardItem}>
            <View style={[styles.taskIcon3D, { backgroundColor: theme.beigeSoft }]}>
              <Ionicons name="ticket" size={20} color="#8C6239" />
            </View>
            <Text style={styles.taskCardLabel}>Mã khuyến mại</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskCardItem} onPress={handleOpenSurvey}>
            <View style={[styles.taskIcon3D, { backgroundColor: theme.beigeSoft }]}>
              <Ionicons name="headset" size={20} color="#D97706" />
            </View>
            <Text style={styles.taskCardLabel}>Trung tâm hỗ trợ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskCardItem}>
            <View style={[styles.taskIcon3D, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
            </View>
            <Text style={styles.taskCardLabel}>Trung tâm an toàn</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================
            6. "TIỆN ÍCH & ƯU ĐÃI" (2x2 GRID + GIFT BANNER)
           ============================================================ */}
        <Text style={styles.sectionTitle}>Tiện ích & Ưu đãi</Text>
        <View style={styles.grid2x2}>
          <TouchableOpacity style={styles.taskCardItem} onPress={onOpenGreenRace}>
            <View style={[styles.greenCircleIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="ribbon" size={18} color={theme.primary} />
            </View>
            <Text style={styles.taskCardLabel}>Hạng thành viên</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskCardItem}>
            <View style={[styles.greenCircleIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="shield" size={18} color={theme.primary} />
            </View>
            <Text style={styles.taskCardLabel}>Hội viên</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskCardItem}>
            <View style={[styles.greenCircleIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="gift" size={18} color={theme.primary} />
            </View>
            <Text style={styles.taskCardLabel}>Thẻ quà tặng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.taskCardItem}>
            <View style={[styles.greenCircleIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="person-add" size={18} color={theme.primary} />
            </View>
            <Text style={styles.taskCardLabel}>Giới thiệu bạn bè</Text>
          </TouchableOpacity>
        </View>

        {/* Gift Promo Banner */}
        <TouchableOpacity style={styles.giftPromoBanner} activeOpacity={0.9}>
          <View style={styles.giftBannerIconBox}>
            <Text style={styles.giftBannerPercent}>%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.giftBannerTitle}>Quà tặng xịn tặng người thân</Text>
            <Text style={styles.giftBannerSub}>Quà nho nhỏ, cho niềm vui to</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#1A1D1F" />
        </TouchableOpacity>

        {/* ============================================================
            7. "HỖ TRỢ & HỢP TÁC" + "CÀI ĐẶT CHUNG"
           ============================================================ */}
        <Text style={styles.sectionTitle}>Hỗ trợ & Hợp tác</Text>
        <View style={styles.menuListGroup}>
          <TouchableOpacity style={styles.menuListRow} onPress={handleOpenSurvey}>
            <Ionicons name="id-card-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Khảo sát chất lượng dịch vụ ITS (UTH)</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuListRow}>
            <Ionicons name="map-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Đóng góp bản đồ trạm ITS Hub</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuListRow}>
            <Ionicons name="information-circle-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Điều khoản & Chính sách</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuListRow}
            onPress={() => setShowGSMContractModal(true)}
          >
            <Ionicons name="document-text-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Hợp đồng sử dụng dịch vụ</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuListRow}>
            <Ionicons name="shield-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Kiểm soát quyền riêng tư</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Cài đặt chung</Text>
        <View style={styles.menuListGroup}>
          <TouchableOpacity style={styles.menuListRow}>
            <Ionicons name="earth-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Quốc gia (Việt Nam)</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuListRow}>
            <Ionicons name="language-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Ngôn ngữ (Tiếng Việt)</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuListRow}>
            <Ionicons name="receipt-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Hóa đơn điện tử</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>
        </View>

        {/* Logout & Version + Bộ Công Thương Badges */}
        <View style={styles.footerVersionBlock}>
          <TouchableOpacity style={styles.logoutRow} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color="#1A1D1F" />
            <Text style={styles.logoutText}>Đăng xuất (Chạy lại màn hình mở App)</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>EcoGo Smart - v2.4.0 • Ứng dụng di chuyển xanh & Thuê xe 24/7</Text>

          <View style={styles.bctBadgesRow}>
            <View style={styles.bctBlueBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.bctBadgeText}>ĐÃ THÔNG BÁO{'\n'}BỘ CÔNG THƯƠNG</Text>
            </View>
            <View style={styles.bctRedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.bctBadgeText}>ĐÃ ĐĂNG KÝ{'\n'}BỘ CÔNG THƯƠNG</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ============================================================
          MODAL: ECOGO SMART PLATFORM SERVICE CONTRACT
         ============================================================ */}
      <Modal
        visible={showGSMContractModal}
        animationType="slide"
        onRequestClose={() => setShowGSMContractModal(false)}
      >
        <View style={styles.contractModalContainer}>
          <View style={styles.contractTopHeader}>
            <TouchableOpacity onPress={() => setShowGSMContractModal(false)}>
              <Ionicons name="close" size={24} color="#1A1D1F" />
            </TouchableOpacity>
            <Text style={styles.contractTopTitle}>Hợp đồng dịch vụ sử dụng nền tảng</Text>
          </View>

          {/* Turquoise Banner */}
          <View style={styles.gsmTurquoiseBanner}>
            <View style={styles.gsmLogoBox}>
              <Ionicons name="leaf" size={22} color="#F59E0B" />
              <Text style={styles.gsmLogoText}>ECOGO</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gsmCompanyTitle}>
                CÔNG TY CỔ PHẦN DI CHUYỂN THÔNG MINH ECOGO VIỆT NAM
              </Text>
              <Text style={styles.gsmCompanySub}>Hợp đồng dịch vụ sử dụng nền tảng EcoGo Smart</Text>
            </View>
          </View>

          <ScrollView style={styles.contractScrollBody}>
            <View style={styles.contractWhiteBox}>
              <Text style={styles.contractBoxHeading}>Thông tin của EcoGo Smart</Text>

              <Text style={styles.contractFieldLabel}>Tên đơn vị vận hành</Text>
              <Text style={styles.contractFieldValue}>
                CÔNG TY CỔ PHẦN DI CHUYỂN THÔNG MINH ECOGO VIỆT NAM
              </Text>

              <View style={styles.contractDivider} />

              <Text style={styles.contractFieldLabel}>Địa chỉ trụ sở</Text>
              <Text style={styles.contractFieldValue}>
                Số 2 Đường Võ Oanh, Phường 25, Quận Bình Thạnh, Thành phố Hồ Chí Minh
              </Text>

              <View style={styles.contractDivider} />

              <Text style={styles.contractFieldLabel}>Giấy chứng nhận đăng ký doanh nghiệp số</Text>
              <Text style={styles.contractFieldValue}>0318269068</Text>

              <View style={styles.contractDivider} />

              <Text style={styles.contractFieldLabel}>Tổng đài hỗ trợ 24/7</Text>
              <Text style={styles.contractFieldValue}>1900 6868</Text>
            </View>

            <View style={styles.contractWhiteBox}>
              <Text style={styles.contractBoxHeading}>Thông tin của người dùng</Text>

              <Text style={styles.contractFieldLabel}>Họ tên</Text>
              <Text style={styles.contractFieldValue}>{user.fullName}</Text>

              <View style={styles.contractDivider} />

              <Text style={styles.contractFieldLabel}>Số điện thoại</Text>
              <Text style={styles.contractFieldValue}>{user.phone}</Text>

              <View style={styles.contractDivider} />

              <Text style={styles.contractFieldLabel}>Thời điểm xác lập và có hiệu lực của Hợp đồng</Text>
              <Text style={styles.contractFieldValue}>26/10/2026</Text>
            </View>
          </ScrollView>

          <View style={styles.contractBottomBar}>
            <TouchableOpacity
              style={styles.understandTurquoiseBtn}
              onPress={() => setShowGSMContractModal(false)}
            >
              <Text style={styles.understandBtnText}>Tôi đã hiểu</Text>
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
    backgroundColor: '#F7F7F5'
  },
  scrollContent: {
    padding: 16
  },
  topUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12
  },
  avatarCyanCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0CA678',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'relative'
  },
  avatarWarnBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  avatarWarnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900'
  },
  userInfoCol: {
    flex: 1
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  userNameText: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  userPhoneText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6F767E',
    marginTop: 2
  },
  emailVerifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  envelope3DBox: {
    width: 46,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  shieldCyanBadge: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 1
  },
  emailVerifyTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  emailVerifyDesc: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F767E',
    marginTop: 3,
    lineHeight: 17
  },
  carouselDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 12
  },
  dotInactive: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0'
  },
  dotActiveCyan: {
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0CA678'
  },
  greenRaceCard: {
    backgroundColor: '#EBFBF5',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#C3FAE8',
    marginBottom: 16
  },
  greenRaceTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 12
  },
  greenRaceRibbon: {
    backgroundColor: '#C3FAE8',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomRightRadius: 18
  },
  greenRaceRibbonText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#087F5B'
  },
  progressBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    marginTop: 6,
    gap: 2
  },
  progressBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#0CA678'
  },
  greenRaceBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  emblemCol: {
    alignItems: 'center',
    width: 124
  },
  hexOuterBronze: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#D97706',
    borderWidth: 3,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6
  },
  hexInnerWhite: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  seedlingPill: {
    backgroundColor: '#558B2F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    marginTop: 8
  },
  seedlingPillText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  co2CounterCol: {
    flex: 1,
    alignItems: 'flex-end'
  },
  co2HeaderLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#087F5B',
    textAlign: 'right'
  },
  amberCounterPill: {
    backgroundColor: '#FDE68A',
    width: 110,
    paddingVertical: 4,
    borderRadius: 99,
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#FCD34D'
  },
  amberCounterNumber: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '800',
    color: '#B45309'
  },
  co2SubLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#087F5B'
  },
  greenRaceMetricsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  grMetricCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  grMetricLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#1D1D1F',
    textAlign: 'center',
    lineHeight: 13
  },
  grMetricVal: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#0CA678',
    marginTop: 4
  },
  dualAccountCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  accountTypeCard: {
    flex: 1,
    height: 98,
    borderRadius: 18,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  familyCardCream: {
    backgroundColor: '#F6F3EC'
  },
  businessCardAqua: {
    backgroundColor: '#EBFBF5'
  },
  accountTypeTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  house3DIllustration: {
    position: 'absolute',
    bottom: 6,
    right: 10,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  heartBubbleRed: {
    backgroundColor: '#EF4444',
    padding: 4,
    borderRadius: 6,
    marginRight: -6,
    marginTop: 4,
    zIndex: 2
  },
  briefcase3DIllustration: {
    position: 'absolute',
    bottom: 6,
    right: 12
  },
  claspLeftGold: {
    position: 'absolute',
    top: 16,
    left: 8,
    width: 4,
    height: 7,
    borderRadius: 2,
    backgroundColor: '#FACC15'
  },
  claspRightGold: {
    position: 'absolute',
    top: 16,
    right: 8,
    width: 4,
    height: 7,
    borderRadius: 2,
    backgroundColor: '#FACC15'
  },
  sectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 10,
    marginTop: 4
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 16
  },
  taskCardItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 10
  },
  taskIcon3D: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  greenCircleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  taskCardLabel: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F',
    flex: 1
  },
  giftPromoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3EC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    gap: 12
  },
  giftBannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FBC02D',
    alignItems: 'center',
    justifyContent: 'center'
  },
  giftBannerPercent: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900'
  },
  giftBannerTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  giftBannerSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#475569',
    marginTop: 2
  },
  menuListGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 18
  },
  menuListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12
  },
  menuListText: {
    fontFamily: FONTS.family,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1D1F'
  },
  footerVersionBlock: {
    alignItems: 'center',
    marginTop: 10
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  logoutText: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  versionText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F767E',
    marginBottom: 14
  },
  bctBadgesRow: {
    flexDirection: 'row',
    gap: 12
  },
  bctBlueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6
  },
  bctRedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6
  },
  bctBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800'
  },
  contractModalContainer: {
    flex: 1,
    backgroundColor: '#F4F7F8'
  },
  contractTopHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10
  },
  contractTopTitle: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  gsmTurquoiseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0CA678',
    padding: 16,
    gap: 14
  },
  gsmLogoBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  gsmLogoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2
  },
  gsmCompanyTitle: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18
  },
  gsmCompanySub: {
    fontFamily: FONTS.family,
    color: '#EAF6F0',
    fontSize: 12,
    marginTop: 4
  },
  contractScrollBody: {
    padding: 16
  },
  contractWhiteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14
  },
  contractBoxHeading: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 12
  },
  contractFieldLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F767E'
  },
  contractFieldValue: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D1F',
    marginTop: 3,
    lineHeight: 20
  },
  contractDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10
  },
  contractBottomBar: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  understandTurquoiseBtn: {
    backgroundColor: '#1D1D1F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  understandBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
