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

export default function ProfileScreen({
  onOpenGreenRace,
  onLogout,
  onNavigateToTrips,
  theme = THEME_PRESETS.BE_SUA_CAFE,
  language = 'vi',
  toggleLanguage
}) {
  const [user] = useState({
    fullName: 'Minh Tài',
    phone: '+84386726647',
    email: 'minhtai@uth.edu.vn',
    licenseNumber: 'GPLX B2 - 790123456789',
    memberRank: 'Eco Elite Ambassador',
    membershipId: 'ESG-ITS-2026-8891',
    co2KgSaved: 42.8,
    co2TreesPerDay: 2.1,
    glosaKmSaved: 38,
    ecoCoins: 180,
    greenFundContribution: '125.000đ',
    totalKm: 142,
    year2026Km: 142
  });

  const [showGSMContractModal, setShowGSMContractModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifySlideIndex, setVerifySlideIndex] = useState(0);

  const VERIFY_SLIDES = [
    {
      id: 'email_gplx',
      icon: 'mail-open',
      title: 'Xác thực Email & GPLX B2',
      desc: 'Xác thực email để nhận hóa đơn, hợp đồng thuê xe tự lái và khôi phục tài khoản khi cần thiết',
      badge: 'Đã duyệt ✓'
    },
    {
      id: 'ekyc_uth',
      icon: 'card',
      title: 'Hồ sơ GPLX Ô tô B2 & eKYC UTH',
      desc: 'Đã đối soát CSDL giao thông • Miễn tiền cọc 15.000.000đ dành riêng cho sinh viên & GV UTH',
      badge: 'Hợp lệ ✓'
    },
    {
      id: 'vneid_sync',
      icon: 'shield-checkmark',
      title: 'Định danh số VNeID Mức 2',
      desc: 'Tích hợp CCCD gắn chip, mở khóa ô tô tự lái bằng bảo mật sinh trắc học và chữ ký số OTP',
      badge: 'Đã liên kết ✓'
    }
  ];

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
            1. TOP PROFILE HEADER ("Minh Tài" + Rank Badge + "+84386726647")
           ============================================================ */}
        <View style={styles.topUserRow}>
          <View style={[styles.avatarCyanCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={28} color="#FFFFFF" />
            <View style={styles.avatarVerifiedBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.userInfoCol}>
            <View style={styles.userNameRow}>
              <Text style={styles.userNameText}>{user.fullName}</Text>
              <TouchableOpacity
                style={styles.headerRankBadge}
                onPress={onOpenGreenRace}
                activeOpacity={0.8}
              >
                <Ionicons name="ribbon" size={11} color="#D4AF37" />
                <Text style={styles.headerRankText}>{user.memberRank}</Text>
                <Text style={styles.headerRankDivider}>•</Text>
                <Text style={styles.headerRankCoins}>{user.ecoCoins} Xu</Text>
                <Ionicons name="chevron-forward" size={10} color="#D4AF37" />
              </TouchableOpacity>
            </View>

            <View style={styles.userSubRow}>
              <Text style={styles.userPhoneText}>{user.phone}</Text>
              <Text style={styles.userSubDot}>•</Text>
              <TouchableOpacity
                style={styles.gplxVerifiedPill}
                onPress={() => setShowVerificationModal(true)}
                activeOpacity={0.75}
              >
                <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                <Text style={styles.gplxVerifiedText}>GPLX B2 Đã duyệt</Text>
                <Ionicons name="chevron-forward" size={10} color="#15803D" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ============================================================
            2. EMAIL / eKYC VERIFICATION BANNER CARD (INTERACTIVE LIKE REAL APPS)
           ============================================================ */}
        <TouchableOpacity
          style={styles.emailVerifyCard}
          activeOpacity={0.88}
          onPress={() => setShowVerificationModal(true)}
        >
          <View style={[styles.envelope3DBox, { backgroundColor: theme.primarySoft || '#F5EFEB' }]}>
            <Ionicons name={VERIFY_SLIDES[verifySlideIndex].icon} size={24} color={theme.primary} />
            <View style={styles.shieldCyanBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#15803D" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.emailVerifyTitle}>{VERIFY_SLIDES[verifySlideIndex].title}</Text>
              <View style={styles.verifySlideBadge}>
                <Text style={styles.verifySlideBadgeText}>{VERIFY_SLIDES[verifySlideIndex].badge}</Text>
              </View>
            </View>
            <Text style={styles.emailVerifyDesc}>
              {VERIFY_SLIDES[verifySlideIndex].desc}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
        </TouchableOpacity>

        {/* Carousel Pagination Dots */}
        <View style={styles.carouselDotsRow}>
          {VERIFY_SLIDES.map((slide, idx) => (
            <TouchableOpacity
              key={slide.id}
              onPress={() => setVerifySlideIndex(idx)}
              activeOpacity={0.7}
              style={[
                styles.dotBase,
                verifySlideIndex === idx
                  ? [styles.dotActiveCyan, { backgroundColor: theme.primary }]
                  : styles.dotInactive
              ]}
            />
          ))}
        </View>

        {/* ============================================================
            3. QUẢN LÝ CHUYẾN ĐI & HỢP ĐỒNG ĐIỆN TỬ (ĐẨY LÊN TRÊN CÙNG)
           ============================================================ */}
        <View style={styles.quickActionsContainer}>
          {onNavigateToTrips && (
            <TouchableOpacity
              style={[
                styles.tripHistoryBanner,
                { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }
              ]}
              activeOpacity={0.88}
              onPress={onNavigateToTrips}
            >
              <View style={[styles.tripBannerIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="car-sport" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.tripBannerHeaderRow}>
                  <Text style={[styles.tripBannerTitle, { color: theme.primaryDark || theme.primary }]}>
                    Lịch sử chuyến đi
                  </Text>
                  <View style={styles.tripKmPill}>
                    <Text style={styles.tripKmText}>142 km đã đi</Text>
                  </View>
                </View>
                <Text style={styles.tripBannerSub}>
                  Chi tiết hành trình ô tô tự lái, hóa đơn điện tử & giảm 42.8kg CO₂
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.primary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.contractBanner}
            activeOpacity={0.88}
            onPress={() => setShowGSMContractModal(true)}
          >
            <View style={[styles.contractBannerIcon, { backgroundColor: theme.beigeSoft || '#F5EFEB' }]}>
              <Ionicons name="document-text" size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.tripBannerHeaderRow}>
                <Text style={styles.contractBannerTitle}>
                  Hợp đồng thuê xe & Hóa đơn VAT
                </Text>
                <View style={styles.activeContractBadge}>
                  <Ionicons name="shield-checkmark" size={10} color="#15803D" />
                  <Text style={styles.activeContractBadgeText}>Hợp lệ</Text>
                </View>
              </View>
              <Text style={styles.contractBannerSub}>
                Hợp đồng điện tử UTH ITS, quy chế tự lái & hoàn cọc minh bạch
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>
        </View>

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

          <TouchableOpacity style={[styles.accountTypeCard, { backgroundColor: theme.primarySoft }]} activeOpacity={0.9}>
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

          <TouchableOpacity style={styles.menuListRow} activeOpacity={0.7} onPress={toggleLanguage}>
            <Ionicons name="language-outline" size={20} color={theme.primary} />
            <Text style={styles.menuListText}>
              {language === 'vi' ? 'Ngôn ngữ: Tiếng Việt (VI)' : 'Language: English (EN)'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: theme.primary, fontWeight: '700' }}>
                {language === 'vi' ? 'VI' : 'EN'}
              </Text>
              <Ionicons name="swap-horizontal" size={16} color={theme.primary} />
            </View>
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

      {/* ============================================================
          MODAL: TRUNG TÂM XÁC THỰC EMAIL & HỒ SƠ GPLX B2 (eKYC ITS)
         ============================================================ */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.verifyModalContainer}>
          {/* Header */}
          <View style={styles.verifyModalHeader}>
            <TouchableOpacity
              onPress={() => setShowVerificationModal(false)}
              style={styles.verifyCloseBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#1A1D1F" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.verifyModalHeaderTitle}>Hồ sơ Lái xe & Định danh eKYC</Text>
              <Text style={styles.verifyModalHeaderSub}>Hệ thống ITS Đại học Giao thông Vận tải UTH</Text>
            </View>
            <View style={styles.verifyBadgeHeader}>
              <Ionicons name="shield-checkmark" size={12} color="#15803D" />
              <Text style={styles.verifyBadgeHeaderText}>Đã duyệt</Text>
            </View>
          </View>

          <ScrollView style={styles.verifyModalScroll} showsVerticalScrollIndicator={false}>
            {/* Status Executive Hero Card */}
            <View style={styles.verifyHeroCard}>
              <View style={styles.verifyHeroCircle}>
                <Ionicons name="car-sport" size={26} color="#D4AF37" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.verifyLevelRow}>
                  <Text style={styles.verifyLevelLabel}>CẤP ĐỘ PHÊ DUYỆT</Text>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelPillText}>CẤP 2 - CAO NHẤT</Text>
                  </View>
                </View>
                <Text style={styles.verifyHeroTitle}>Đủ điều kiện thuê tự lái 24/7</Text>
                <Text style={styles.verifyHeroDesc}>
                  Tài khoản đã hoàn tất kiểm tra hồ sơ thực địa và liên kết với Trung tâm điều hành ITS UTH. Miễn thế chấp 15.000.000đ khi nhận xe.
                </Text>
              </View>
            </View>

            {/* Mục 1: Giấy phép lái xe ô tô (GPLX B2) */}
            <View style={styles.verifySectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBox, { backgroundColor: theme.primarySoft || '#F5EFEB' }]}>
                  <Ionicons name="card" size={18} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionHeading}>Giấy phép lái xe (GPLX)</Text>
                  <Text style={styles.sectionSubHeading}>Đã xác thực và đối soát với cơ sở dữ liệu Bộ GTVT</Text>
                </View>
                <View style={styles.verifiedTagGreen}>
                  <Ionicons name="checkmark" size={11} color="#15803D" />
                  <Text style={styles.verifiedTagGreenText}>Hợp lệ</Text>
                </View>
              </View>

              <View style={styles.verifyInfoTable}>
                <View style={styles.verifyTableRow}>
                  <Text style={styles.verifyTableLabel}>Số GPLX</Text>
                  <Text style={styles.verifyTableValBold}>790123456789</Text>
                </View>
                <View style={styles.verifyTableDivider} />

                <View style={styles.verifyTableRow}>
                  <Text style={styles.verifyTableLabel}>Họ và tên tài xế</Text>
                  <Text style={styles.verifyTableValBold}>LÊ NGUYỄN MINH TÀI</Text>
                </View>
                <View style={styles.verifyTableDivider} />

                <View style={styles.verifyTableRow}>
                  <Text style={styles.verifyTableLabel}>Hạng xe được phép</Text>
                  <Text style={styles.verifyTableVal}>Hạng B2 (Ô tô tự lái dưới 9 chỗ)</Text>
                </View>
                <View style={styles.verifyTableDivider} />

                <View style={styles.verifyTableRow}>
                  <Text style={styles.verifyTableLabel}>Ngày cấp - Hết hạn</Text>
                  <Text style={styles.verifyTableVal}>15/08/2022 - 15/08/2032 (Còn 6 năm)</Text>
                </View>
                <View style={styles.verifyTableDivider} />

                <View style={styles.verifyTableRow}>
                  <Text style={styles.verifyTableLabel}>Nơi cấp</Text>
                  <Text style={styles.verifyTableVal}>Sở Giao thông Vận tải TP.HCM</Text>
                </View>
              </View>

              {/* Photos of Driving License Preview */}
              <Text style={styles.subCardTitle}>Hình ảnh hồ sơ đã lưu trữ (OCR AI):</Text>
              <View style={styles.idPhotoPairRow}>
                <View style={styles.idPhotoCard}>
                  <View style={styles.idPhotoPlaceholder}>
                    <Ionicons name="image-outline" size={24} color="#6F4E37" />
                    <Text style={styles.idPhotoLabel}>Mặt trước GPLX</Text>
                    <View style={styles.ocrScannedPill}>
                      <Ionicons name="scan-outline" size={10} color="#15803D" />
                      <Text style={styles.ocrScannedText}>AI Scanned</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.idPhotoCard}>
                  <View style={styles.idPhotoPlaceholder}>
                    <Ionicons name="qr-code-outline" size={24} color="#6F4E37" />
                    <Text style={styles.idPhotoLabel}>Mặt sau (QR Code)</Text>
                    <View style={styles.ocrScannedPill}>
                      <Ionicons name="checkmark-done" size={10} color="#15803D" />
                      <Text style={styles.ocrScannedText}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.reUploadBtn}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Cập nhật GPLX', 'Hệ thống eKYC ITS: Vui lòng chuẩn bị bản gốc GPLX B2 để quét ảnh mới khi bạn gia hạn hoặc đổi phôi bằng lái.')}
              >
                <Ionicons name="camera-reverse-outline" size={16} color={theme.primary} />
                <Text style={[styles.reUploadBtnText, { color: theme.primary }]}>Quét lại ảnh GPLX mới</Text>
              </TouchableOpacity>
            </View>

            {/* Mục 2: Xác thực Email nhận Hóa đơn & Hợp đồng */}
            <View style={styles.verifySectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBox, { backgroundColor: theme.primarySoft || '#F5EFEB' }]}>
                  <Ionicons name="mail" size={18} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionHeading}>Email nhận Hóa đơn & Hợp đồng</Text>
                  <Text style={styles.sectionSubHeading}>Tự động gửi PDF hợp đồng thuê và hóa đơn VAT</Text>
                </View>
                <View style={styles.verifiedTagGreen}>
                  <Ionicons name="checkmark" size={11} color="#15803D" />
                  <Text style={styles.verifiedTagGreenText}>Đã xác thực</Text>
                </View>
              </View>

              <View style={styles.emailDisplayBox}>
                <View style={styles.emailLeftRow}>
                  <Ionicons name="at-outline" size={18} color="#6F767E" />
                  <Text style={styles.emailDisplayText}>{user.email}</Text>
                </View>
                <View style={styles.uthBadgePill}>
                  <Text style={styles.uthBadgePillText}>Cán bộ / SV UTH</Text>
                </View>
              </View>

              <View style={styles.emailActionsRow}>
                <TouchableOpacity
                  style={styles.emailActionBtn}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Kiểm tra Email', 'Hệ thống đã gửi một thư kiểm tra đến ' + user.email + '. Vui lòng kiểm tra hộp thư đến hoặc mục Spam.')}
                >
                  <Ionicons name="paper-plane-outline" size={15} color={theme.primary} />
                  <Text style={[styles.emailActionBtnText, { color: theme.primary }]}>Gửi thử email xác nhận</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emailActionBtn, { borderColor: '#EBE3D7' }]}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Đổi Email', 'Vui lòng liên hệ quản trị viên ITS Cơ sở 1 Bình Thạnh để cập nhật email tên miền sinh viên @uth.edu.vn.')}
                >
                  <Ionicons name="pencil-outline" size={15} color="#6F767E" />
                  <Text style={[styles.emailActionBtnText, { color: '#6F767E' }]}>Thay đổi</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mục 3: Căn cước công dân & Định danh VNeID */}
            <View style={styles.verifySectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBox, { backgroundColor: theme.primarySoft || '#F5EFEB' }]}>
                  <Ionicons name="finger-print" size={18} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionHeading}>Định danh điện tử VNeID</Text>
                  <Text style={styles.sectionSubHeading}>Liên kết Bộ Công An & Căn cước công dân gắn chip</Text>
                </View>
                <View style={styles.verifiedTagGreen}>
                  <Ionicons name="checkmark" size={11} color="#15803D" />
                  <Text style={styles.verifiedTagGreenText}>Mức 2</Text>
                </View>
              </View>

              <View style={styles.verifyInfoTable}>
                <View style={styles.verifyTableRow}>
                  <Text style={styles.verifyTableLabel}>Số CCCD</Text>
                  <Text style={styles.verifyTableValBold}>079201018891</Text>
                </View>
                <View style={styles.verifyTableDivider} />
                <View style={styles.verifyTableRow}>
                  <Text style={styles.verifyTableLabel}>Trạng thái VNeID</Text>
                  <Text style={[styles.verifyTableVal, { color: '#15803D', fontWeight: '700' }]}>Đã tích hợp sinh trắc học</Text>
                </View>
              </View>
            </View>

            {/* Security note */}
            <View style={styles.securityNoteBox}>
              <Ionicons name="lock-closed" size={14} color="#8C6239" />
              <Text style={styles.securityNoteText}>
                Hồ sơ định danh được mã hóa AES-256 bit và chỉ sử dụng cho mục đích bảo hiểm chuyến đi và nhận xe tự lái theo quy định pháp luật.
              </Text>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Bottom Bar */}
          <View style={styles.verifyModalBottomBar}>
            <TouchableOpacity
              style={[styles.verifyPrimaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => setShowVerificationModal(false)}
              activeOpacity={0.88}
            >
              <Text style={styles.verifyPrimaryBtnText}>Đóng & Quay lại</Text>
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
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  headerRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B180D',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 4
  },
  headerRankText: {
    fontFamily: FONTS.family,
    color: '#FAF7F2',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2
  },
  headerRankDivider: {
    fontFamily: FONTS.family,
    color: 'rgba(212, 175, 55, 0.5)',
    fontSize: 9
  },
  headerRankCoins: {
    fontFamily: FONTS.family,
    color: '#D4AF37',
    fontSize: 9.5,
    fontWeight: '800'
  },
  userSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6
  },
  userSubDot: {
    fontFamily: FONTS.family,
    color: '#C4C4C4',
    fontSize: 11
  },
  gplxVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    gap: 3
  },
  gplxVerifiedText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D'
  },
  quickActionsContainer: {
    gap: 10,
    marginBottom: 16
  },
  tripBannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  tripKmPill: {
    backgroundColor: 'rgba(111, 78, 55, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  tripKmText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#6F4E37'
  },
  contractBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  contractBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contractBannerTitle: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  contractBannerSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 1
  },
  activeContractBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    gap: 2
  },
  activeContractBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D'
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
  verifySlideBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  verifySlideBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D'
  },
  dotBase: {
    height: 4,
    borderRadius: 2
  },
  verifyModalContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  verifyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3D7',
    gap: 10
  },
  verifyCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  verifyModalHeaderTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  verifyModalHeaderSub: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#6F767E',
    marginTop: 1
  },
  verifyBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3
  },
  verifyBadgeHeaderText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D'
  },
  verifyModalScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14
  },
  verifyHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B180D',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    gap: 14,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  verifyHeroCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3E2515',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center'
  },
  verifyLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  verifyLevelLabel: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    color: '#BDB3A7',
    letterSpacing: 0.5
  },
  levelPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#D4AF37'
  },
  levelPillText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800',
    color: '#FAF7F2'
  },
  verifyHeroTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#FAF7F2',
    marginBottom: 3
  },
  verifyHeroDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#DCD4C7',
    lineHeight: 16
  },
  verifySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionHeading: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  sectionSubHeading: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 1
  },
  verifiedTagGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3
  },
  verifiedTagGreenText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D'
  },
  verifyInfoTable: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0E8DC'
  },
  verifyTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  verifyTableLabel: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#6F767E'
  },
  verifyTableVal: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#1A1D1F',
    fontWeight: '600'
  },
  verifyTableValBold: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#1A1D1F',
    fontWeight: '800'
  },
  verifyTableDivider: {
    height: 1,
    backgroundColor: '#EBE3D7',
    marginVertical: 4
  },
  subCardTitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4E3322',
    marginTop: 12,
    marginBottom: 8
  },
  idPhotoPairRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  idPhotoCard: {
    flex: 1,
    backgroundColor: '#F5EFEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    padding: 10,
    alignItems: 'center'
  },
  idPhotoPlaceholder: {
    alignItems: 'center',
    gap: 4
  },
  idPhotoLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  ocrScannedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 2
  },
  ocrScannedText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D'
  },
  reUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    backgroundColor: '#FAF7F2',
    gap: 6
  },
  reUploadBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700'
  },
  emailDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0E8DC',
    marginBottom: 10
  },
  emailLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  emailDisplayText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  uthBadgePill: {
    backgroundColor: 'rgba(111, 78, 55, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5
  },
  uthBadgePillText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#6F4E37'
  },
  emailActionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  emailActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    backgroundColor: '#FFFFFF',
    gap: 5
  },
  emailActionBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700'
  },
  securityNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5EFEB',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    marginBottom: 10
  },
  securityNoteText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    lineHeight: 16
  },
  verifyModalBottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  verifyPrimaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  verifyPrimaryBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700'
  },
  understandBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  tripHistoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    gap: 12
  },
  tripBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tripBannerTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700'
  },
  tripBannerSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 2
  }
});
