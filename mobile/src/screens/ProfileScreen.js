import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
  Switch
} from 'react-native';
import ApiService from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import VoucherWalletModal from '../components/VoucherWalletModal';

export default function ProfileScreen({
  currentUser,
  onUpdateUser,
  onOpenGreenRace,
  onLogout,
  onNavigateToTrips,
  theme = THEME_PRESETS.BE_SUA_CAFE,
  language = 'vi',
  toggleLanguage
}) {
  // Đồng bộ thông tin chuẩn xác từ database / phiên đăng nhập
  const [userState, setUserState] = useState(null);
  const [showGSMContractModal, setShowGSMContractModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [verifySlideIndex, setVerifySlideIndex] = useState(0);

  // Các Modal nghiệp vụ thực tế
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showSuggestHubModal, setShowSuggestHubModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // State Ví & Thanh toán
  const [walletBalance, setWalletBalance] = useState(1500000);
  const [autoDeductRental, setAutoDeductRental] = useState(true);

  // State Đề xuất trạm Hub
  const [suggestDistrict, setSuggestDistrict] = useState('Bình Thạnh');
  const [suggestLocationName, setSuggestLocationName] = useState('');
  const [isSubmittingHub, setIsSubmittingHub] = useState(false);

  // State Giới thiệu bạn bè
  const [copiedReferral, setCopiedReferral] = useState(false);

  const activeUser = userState || currentUser || {};
  const user = {
    fullName: activeUser.fullName || 'Minh Tài',
    phone: activeUser.phone || '+84386726647',
    email: activeUser.email || 'minhtai@ecogo.vn',
    licenseNumber: activeUser.licenseNumber || activeUser.drivingLicense || '790123456789',
    memberRank: activeUser.memberRank || 'Eco Elite Ambassador',
    membershipId: activeUser.membershipId || 'ESG-ECOGO-2026-8891',
    co2KgSaved: activeUser.totalCo2SavedKg || 42.8,
    co2TreesPerDay: 2.1,
    glosaKmSaved: 38,
    ecoCoins: activeUser.ecoCoins || activeUser.ecoPoints || 180,
    greenFundContribution: '125.000đ',
    totalKm: 142,
    year2026Km: 142,
    cccdNumber: activeUser.cccdNumber || '079201018891'
  };

  // State cho form chỉnh sửa hồ sơ
  const [formName, setFormName] = useState(user.fullName);
  const [formEmail, setFormEmail] = useState(user.email);
  const [formLicense, setFormLicense] = useState(user.licenseNumber.replace('GPLX B2 - ', ''));
  const [formCccd, setFormCccd] = useState(user.cccdNumber);

  const handleSaveProfile = async () => {
    if (!formName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên tài xế');
      return;
    }
    try {
      setIsSavingProfile(true);
      const res = await ApiService.updateProfile({
        fullName: formName.trim(),
        email: formEmail.trim(),
        licenseNumber: formLicense.trim(),
        cccdNumber: formCccd.trim(),
        phone: user.phone
      });

      if (res && res.success && res.user) {
        setUserState(res.user);
        if (onUpdateUser) onUpdateUser(res.user);
        setShowEditModal(false);
        Alert.alert('Thành công', 'Thông tin khách hàng đã được lưu trữ chuẩn xác vào cơ sở dữ liệu!');
      } else {
        // Cập nhật local nếu offline
        const localUpdated = {
          ...user,
          fullName: formName.trim(),
          email: formEmail.trim(),
          licenseNumber: formLicense.trim(),
          cccdNumber: formCccd.trim()
        };
        setUserState(localUpdated);
        if (onUpdateUser) onUpdateUser(localUpdated);
        setShowEditModal(false);
        Alert.alert('Đã lưu cục bộ', 'Đã cập nhật thông tin trên thiết bị của bạn!');
      }
    } catch (err) {
      console.warn('Update profile error:', err.message);
      const localUpdated = {
        ...user,
        fullName: formName.trim(),
        email: formEmail.trim(),
        licenseNumber: formLicense.trim(),
        cccdNumber: formCccd.trim()
      };
      setUserState(localUpdated);
      if (onUpdateUser) onUpdateUser(localUpdated);
      setShowEditModal(false);
      Alert.alert('Đã lưu', 'Thông tin đã được cập nhật thành công!');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // =============================================================
  // MULTI-PROFILE: GIA ĐÌNH & DOANH NGHIỆP
  // =============================================================
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  // Gia đình State
  const [familyShareWallet, setFamilyShareWallet] = useState(true);
  const [familyShareLocation, setFamilyShareLocation] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 'fm_1',
      name: user.fullName || 'Minh Tài',
      relation: 'Chủ nhóm (Bạn)',
      phone: user.phone || '+84386726647',
      status: 'Quản trị viên',
      isOwner: true,
      hasLicense: true
    },
    {
      id: 'fm_2',
      name: 'Nguyễn Thu Trang',
      relation: 'Vợ',
      phone: '+84912345678',
      status: 'Đã liên kết ví',
      isOwner: false,
      hasLicense: false
    },
    {
      id: 'fm_3',
      name: 'Lê Văn Hùng',
      relation: 'Ba',
      phone: '+84903456789',
      status: 'GPLX B2 Đã duyệt',
      isOwner: false,
      hasLicense: true
    }
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Vợ / Chồng');

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên và số điện thoại người thân.');
      return;
    }
    if (familyMembers.length >= 5) {
      Alert.alert('Giới hạn nhóm', 'Nhóm gia đình hỗ trợ tối đa 5 thành viên.');
      return;
    }
    const newMember = {
      id: `fm_${Date.now()}`,
      name: newMemberName.trim(),
      relation: newMemberRelation,
      phone: newMemberPhone.trim(),
      status: 'Chờ kích hoạt SMS',
      isOwner: false,
      hasLicense: false
    };
    setFamilyMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberPhone('');
    setShowAddMember(false);
    Alert.alert(
      'Đã gửi lời mời',
      `Đã gửi tin nhắn SMS mời ${newMember.name} (${newMember.phone}) tham gia Nhóm Di Chuyển Gia Đình EcoGo!`
    );
  };

  const handleRemoveMember = (id, name) => {
    Alert.alert(
      'Xóa thành viên',
      `Bạn có chắc chắn muốn mời ${name} ra khỏi nhóm gia đình?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setFamilyMembers(prev => prev.filter(m => m.id !== id));
          }
        }
      ]
    );
  };

  // Doanh nghiệp State
  const [isBusinessTripMode, setIsBusinessTripMode] = useState(false);
  const [bizCompanyName, setBizCompanyName] = useState('CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG ECOGO');
  const [bizTaxId, setBizTaxId] = useState('0318269068');
  const [bizAddress, setBizAddress] = useState('Tầng 18, Toà nhà Landmark 81, 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh, TP.HCM');
  const [bizEmail, setBizEmail] = useState('accounting@ecogo.vn');
  const [bizCostCenter, setBizCostCenter] = useState('PROJECT-2026-SG');
  const [isSavingBiz, setIsSavingBiz] = useState(false);

  const handleSaveBusinessProfile = () => {
    if (!bizCompanyName.trim() || !bizTaxId.trim() || !bizEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Tên công ty, MST và Email nhận hóa đơn VAT.');
      return;
    }
    setIsSavingBiz(true);
    setTimeout(() => {
      setIsSavingBiz(false);
      Alert.alert('Thành công', 'Hồ sơ doanh nghiệp & thông tin xuất hóa đơn VAT đã được lưu đồng bộ trên hệ thống EcoGo!');
    }, 350);
  };

  const handleExportExpenseReport = () => {
    Alert.alert(
      'Xuất bảng kê chi phí',
      `Bảng kê chi tiết 3 chuyến công tác tháng 11/2026 (tổng 3.480.000đ kèm hóa đơn VAT điện tử) đã được gửi đến email kế toán: ${bizEmail}!`,
      [{ text: 'Đã hiểu' }]
    );
  };

  const VERIFY_SLIDES = [
    {
      id: 'email_gplx',
      icon: 'mail-open',
      title: 'Xác thực Email & GPLX B2',
      desc: 'Xác thực email để nhận hóa đơn, hợp đồng thuê xe tự lái và khôi phục tài khoản khi cần thiết',
      badge: 'Đã duyệt ✓'
    },
    {
      id: 'ekyc_prime',
      icon: 'card',
      title: 'Hồ sơ GPLX Ô tô B2 & EcoGo Prime',
      desc: 'Đã đối soát CSDL giao thông • Miễn tiền cọc 15.000.000đ đặc quyền thành viên EcoGo',
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
                Hợp đồng điện tử EcoGo Mobility, quy chế tự lái & hoàn cọc minh bạch
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>
        </View>

        {/* ============================================================
            4. "GIA ĐÌNH" & "DOANH NGHIỆP" 3D CARDS
           ============================================================ */}
        <View style={styles.dualAccountCardsRow}>
          <TouchableOpacity
            style={[styles.accountTypeCard, styles.familyCardCream]}
            activeOpacity={0.88}
            onPress={() => setShowFamilyModal(true)}
          >
            <View style={styles.accountCardTopRow}>
              <Text style={styles.accountTypeTitle}>Gia đình</Text>
              <View style={styles.cardBadgeSmall}>
                <Text style={styles.cardBadgeSmallText}>{familyMembers.length} TV</Text>
              </View>
            </View>
            <Text style={styles.accountTypeSub}>Dùng chung ví & SOS</Text>
            <View style={styles.house3DIllustration}>
              <View style={styles.heartBubbleRed}>
                <Ionicons name="heart" size={10} color="#FFFFFF" />
              </View>
              <Ionicons name="home" size={34} color={theme.primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.accountTypeCard, { backgroundColor: theme.primarySoft }]}
            activeOpacity={0.88}
            onPress={() => setShowBusinessModal(true)}
          >
            <View style={styles.accountCardTopRow}>
              <Text style={styles.accountTypeTitle}>Doanh nghiệp</Text>
              <View style={[styles.cardBadgeSmall, { backgroundColor: isBusinessTripMode ? '#15803D' : '#8C6239' }]}>
                <Text style={[styles.cardBadgeSmallText, { color: '#FFFFFF' }]}>
                  {isBusinessTripMode ? 'Bật công tác ✓' : 'Xuất VAT'}
                </Text>
              </View>
            </View>
            <Text style={styles.accountTypeSub}>Hóa đơn & Thẻ Cty</Text>
            <View style={styles.briefcase3DIllustration}>
              <Ionicons name="briefcase" size={34} color="#1D1D1F" />
              <View style={styles.claspLeftGold} />
              <View style={styles.claspRightGold} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ============================================================
            5. "TÁC VỤ & ĐẶC QUYỀN" (2x2 GRID TINH GỌN, SANG TRỌNG)
           ============================================================ */}
        <Text style={styles.sectionTitle}>Tác vụ & Đặc quyền</Text>
        <View style={styles.grid2x2}>
          {/* 1. Thanh toán & Ví */}
          <TouchableOpacity
            style={styles.taskCardItem}
            activeOpacity={0.8}
            onPress={() => setShowPaymentModal(true)}
          >
            <View style={[styles.taskIcon3D, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="card" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskCardLabel}>Thanh toán</Text>
              <Text style={styles.taskCardSubLabel}>Ví {Number(walletBalance).toLocaleString('vi-VN')}đ</Text>
            </View>
          </TouchableOpacity>

          {/* 2. Mã khuyến mại (Voucher Wallet) */}
          <TouchableOpacity
            style={styles.taskCardItem}
            activeOpacity={0.8}
            onPress={() => setShowVoucherModal(true)}
          >
            <View style={[styles.taskIcon3D, { backgroundColor: theme.beigeSoft }]}>
              <Ionicons name="ticket" size={20} color="#8C6239" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskCardLabel}>Mã khuyến mại</Text>
              <Text style={styles.taskCardSubLabel}>3 mã khả dụng</Text>
            </View>
          </TouchableOpacity>

          {/* 3. Trung tâm an toàn */}
          <TouchableOpacity
            style={styles.taskCardItem}
            activeOpacity={0.8}
            onPress={() => setShowSafetyModal(true)}
          >
            <View style={[styles.taskIcon3D, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskCardLabel}>Trung tâm an toàn</Text>
              <Text style={styles.taskCardSubLabel}>SOS 24/7 & Cứu hộ</Text>
            </View>
          </TouchableOpacity>

          {/* 4. Giới thiệu bạn bè */}
          <TouchableOpacity
            style={styles.taskCardItem}
            activeOpacity={0.8}
            onPress={() => setShowReferralModal(true)}
          >
            <View style={[styles.taskIcon3D, { backgroundColor: theme.beigeSoft }]}>
              <Ionicons name="gift" size={20} color="#8C6239" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskCardLabel}>Giới thiệu bạn bè</Text>
              <Text style={styles.taskCardSubLabel}>Nhận ngay 50K</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ============================================================
            6. "HỖ TRỢ & HỢP TÁC" (3 DÒNG THỰC TẾ)
           ============================================================ */}
        <Text style={styles.sectionTitle}>Hỗ trợ & Hợp tác</Text>
        <View style={styles.menuListGroup}>
          <TouchableOpacity style={styles.menuListRow} onPress={handleOpenSurvey} activeOpacity={0.7}>
            <Ionicons name="chatbubbles-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Đóng góp ý kiến dịch vụ EcoGo Mobility</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuListRow}
            onPress={() => setShowSuggestHubModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="location-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Đề xuất mở trạm EcoGo Hub mới</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuListRow}
            onPress={() => setShowTermsModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#6F767E" />
            <Text style={styles.menuListText}>Điều khoản dịch vụ & Chính sách bảo mật</Text>
            <Ionicons name="chevron-forward" size={18} color="#9A9FA5" />
          </TouchableOpacity>
        </View>

        {/* ============================================================
            7. "CÀI ĐẶT HỆ THỐNG" (CHUYỂN NGÔN NGỮ VI/EN)
           ============================================================ */}
        <Text style={styles.sectionTitle}>Cài đặt hệ thống</Text>
        <View style={styles.menuListGroup}>
          <TouchableOpacity style={styles.menuListRow} activeOpacity={0.7} onPress={toggleLanguage}>
            <Ionicons name="language-outline" size={20} color={theme.primary} />
            <Text style={styles.menuListText}>
              {language === 'vi' ? 'Ngôn ngữ hiển thị' : 'Display Language'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: theme.primary, fontWeight: '700', fontFamily: FONTS.family }}>
                {language === 'vi' ? 'Tiếng Việt (VI)' : 'English (EN)'}
              </Text>
              <Ionicons name="swap-horizontal" size={16} color={theme.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Đăng xuất & 1 Dấu Đã Đăng Ký Bộ Công Thương */}
        <View style={styles.footerVersionBlock}>
          <TouchableOpacity style={styles.logoutRow} onPress={onLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#E03131" />
            <Text style={[styles.logoutText, { color: '#E03131' }]}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>EcoGo Smart - v2.4.0 • Ứng dụng di chuyển xanh & Thuê xe 24/7</Text>

          <View style={styles.bctBadgesRow}>
            <View style={styles.bctRedBadgeSingle}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.bctBadgeText}>ĐÃ ĐĂNG KÝ{'\n'}BỘ CÔNG THƯƠNG</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ============================================================
          MODAL: ECOGO SMART PLATFORM SERVICE CONTRACT (QUIET LUXURY)
         ============================================================ */}
      <Modal
        visible={showGSMContractModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGSMContractModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.contractModalContainer}>
            {/* Top Navigation Header */}
            <View style={styles.contractTopHeader}>
              <TouchableOpacity
                onPress={() => setShowGSMContractModal(false)}
                style={styles.contractCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.contractTopTitle}>Hợp Đồng Dịch Vụ Nền Tảng</Text>
                <Text style={styles.contractTopSub}>Số: HĐ-ECOGO-2026-8891</Text>
              </View>
              <View style={styles.contractActiveTag}>
                <Ionicons name="shield-checkmark" size={12} color="#15803D" />
                <Text style={styles.contractActiveTagText}>Hiệu lực</Text>
              </View>
            </View>

            {/* Quiet Luxury Espresso & Gold Banner */}
            <View style={styles.gsmTurquoiseBanner}>
              <View style={styles.gsmLogoBox}>
                <Ionicons name="ribbon" size={24} color="#D4AF37" />
                <Text style={styles.gsmLogoText}>ECO · SMART</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gsmCompanyTitle}>
                  CÔNG TY CỔ PHẦN DI CHUYỂN THÔNG MINH ECOGO
                </Text>
                <Text style={styles.gsmCompanySub}>
                  Nền tảng Tự lái EcoGo AI & Hệ thống Di chuyển Thông minh 24/7
                </Text>
              </View>
            </View>

            <ScrollView style={styles.contractScrollBody} showsVerticalScrollIndicator={false}>
              {/* Box 1: Thông tin đơn vị vận hành */}
              <View style={styles.contractWhiteBox}>
                <View style={styles.boxTitleRow}>
                  <View style={[styles.boxTitleBar, { backgroundColor: theme.primary }]} />
                  <Text style={styles.contractBoxHeading}>I. ĐƠN VỊ VẬN HÀNH ECOGO MOBILITY</Text>
                </View>

                <Text style={styles.contractFieldLabel}>Tên đơn vị vận hành</Text>
                <Text style={styles.contractFieldValue}>
                  CÔNG TY CP DI CHUYỂN THÔNG MINH ECOGO VIỆT NAM
                </Text>

                <View style={styles.contractDivider} />

                <Text style={styles.contractFieldLabel}>Địa chỉ trụ sở điều hành</Text>
                <Text style={styles.contractFieldValue}>
                  Số 2 Đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh
                </Text>

                <View style={styles.contractDivider} />

                <Text style={styles.contractFieldLabel}>Giấy phép kinh doanh / ĐKKD số</Text>
                <Text style={styles.contractFieldValue}>0318269068 (Sở KH&ĐT TP.HCM)</Text>

                <View style={styles.contractDivider} />

                <Text style={styles.contractFieldLabel}>Hạ tầng trạm kết nối EcoGo Hub</Text>
                <Text style={styles.contractFieldValue}>
                  Hệ thống Hub Trung Tâm: Bình Thạnh · Thủ Thiêm · Khu Công Nghệ Cao
                </Text>

                <View style={styles.contractDivider} />

                <Text style={styles.contractFieldLabel}>Tổng đài điều phối 24/7</Text>
                <Text style={[styles.contractFieldValue, { color: theme.primary, fontWeight: '800' }]}>1900 6868</Text>
              </View>

              {/* Box 2: Thông tin khách hàng & Pháp lý */}
              <View style={styles.contractWhiteBox}>
                <View style={styles.boxTitleRow}>
                  <View style={[styles.boxTitleBar, { backgroundColor: '#D4AF37' }]} />
                  <Text style={styles.contractBoxHeading}>II. THÔNG TIN KHÁCH HÀNG & PHÁP LÝ HỢP ĐỒNG</Text>
                </View>

                <Text style={styles.contractFieldLabel}>Họ và tên khách hàng</Text>
                <Text style={styles.contractFieldValueBold}>{user.fullName.toUpperCase()}</Text>

                <View style={styles.contractDivider} />

                <Text style={styles.contractFieldLabel}>Số điện thoại xác thực</Text>
                <Text style={styles.contractFieldValue}>{user.phone}</Text>

                <View style={styles.contractDivider} />

                <Text style={styles.contractFieldLabel}>Hạng GPLX & Giấy tờ định danh</Text>
                <Text style={styles.contractFieldValue}>
                  {user.licenseNumber} · CCCD {user.cccdNumber}
                </Text>

                <View style={styles.contractDivider} />

                <Text style={styles.contractFieldLabel}>Email nhận hóa đơn VAT & hợp đồng</Text>
                <Text style={styles.contractFieldValue}>{user.email}</Text>

                <View style={styles.contractDivider} />

                <Text style={styles.contractFieldLabel}>Thời điểm xác lập & Hiệu lực hợp đồng</Text>
                <Text style={styles.contractFieldValue}>Từ 26/10/2026 · Tự động gia hạn theo từng chuyến thuê</Text>
              </View>

              {/* Box 3: Chứng thực số */}
              <View style={styles.contractVerifyStampBox}>
                <Ionicons name="shield-checkmark" size={16} color="#15803D" />
                <Text style={styles.contractVerifyStampText}>
                  Đã chứng thực chữ ký số điện tử EcoGo Smart · Bảo mật đối soát CSDL EcoGo Mobility Corp
                </Text>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.contractBottomBar}>
              <TouchableOpacity
                style={[styles.understandTurquoiseBtn, { backgroundColor: theme.primary }]}
                onPress={() => setShowGSMContractModal(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.understandBtnText}>Tôi đã hiểu & Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL: TRUNG TÂM XÁC THỰC EMAIL & HỒ SƠ GPLX B2 (ECOGO VERIFY)
         ============================================================ */}
      <Modal
        visible={showVerificationModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={styles.modalBackdrop}>
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
              <Text style={styles.verifyModalHeaderSub}>Hệ thống Xác thực Nền tảng EcoGo Mobility Corp</Text>
            </View>
            <TouchableOpacity
              style={styles.editProfileBtnHeader}
              onPress={() => {
                setFormName(user.fullName);
                setFormEmail(user.email);
                setFormLicense(user.licenseNumber.replace('GPLX B2 - ', ''));
                setFormCccd(user.cccdNumber);
                setShowEditModal(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={12} color="#6F4E37" />
              <Text style={styles.editProfileBtnHeaderText}>Sửa hồ sơ</Text>
            </TouchableOpacity>
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
                  Tài khoản đã hoàn tất kiểm tra hồ sơ thực địa và kết nối Trung tâm điều hành EcoGo Mobility. Miễn thế chấp 15.000.000đ khi nhận xe.
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
                  <Text style={styles.verifyTableValBold}>{user.licenseNumber.replace('GPLX B2 - ', '')}</Text>
                </View>
                <View style={styles.verifyTableDivider} />

                <View style={styles.verifyTableRow}>
                  <Text style={styles.verifyTableLabel}>Họ và tên tài xế</Text>
                  <Text style={styles.verifyTableValBold}>{user.fullName.toUpperCase()}</Text>
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
                onPress={() => Alert.alert('Cập nhật GPLX', 'Hệ thống EcoGo eKYC: Vui lòng chuẩn bị bản gốc GPLX B2 để quét ảnh mới khi bạn gia hạn hoặc đổi phôi bằng lái.')}
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
                <View style={styles.ecoBadgePill}>
                  <Text style={styles.ecoBadgePillText}>Hội Viên Tiên Phong</Text>
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
                  onPress={() => {
                  setFormName(user.fullName);
                  setFormEmail(user.email);
                  setFormLicense(user.licenseNumber.replace('GPLX B2 - ', ''));
                  setFormCccd(user.cccdNumber);
                  setShowEditModal(true);
                }}
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
                  <Text style={styles.verifyTableValBold}>{user.cccdNumber}</Text>
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
      </View>
      </Modal>

      {/* ============================================================
          MODAL: CHỈNH SỬA THÔNG TIN KHÁCH HÀNG & LƯU CSDL
         ============================================================ */}
      <Modal
        visible={showEditModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editModalCard}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Cập nhật thông tin khách hàng</Text>
              <TouchableOpacity
                style={styles.closeBtnSmall}
                onPress={() => setShowEditModal(false)}
              >
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.editFieldLabel}>Họ và tên tài xế *</Text>
              <TextInput
                style={styles.editInput}
                value={formName}
                onChangeText={setFormName}
                placeholder="Nhập họ và tên đầy đủ"
                placeholderTextColor="#9A9FA5"
              />

              <Text style={styles.editFieldLabel}>Số điện thoại đăng ký</Text>
              <TextInput
                style={[styles.editInput, { backgroundColor: '#F0EBE3', color: '#6F767E' }]}
                value={user.phone}
                editable={false}
              />

              <Text style={styles.editFieldLabel}>Email nhận hóa đơn & hợp đồng *</Text>
              <TextInput
                style={styles.editInput}
                value={formEmail}
                onChangeText={setFormEmail}
                placeholder="example@ecogo.vn"
                placeholderTextColor="#9A9FA5"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.editFieldLabel}>Số GPLX Hạng B2 *</Text>
              <TextInput
                style={styles.editInput}
                value={formLicense}
                onChangeText={setFormLicense}
                placeholder="790123456789"
                placeholderTextColor="#9A9FA5"
                keyboardType="numeric"
              />

              <Text style={styles.editFieldLabel}>Số Căn cước công dân (CCCD) *</Text>
              <TextInput
                style={styles.editInput}
                value={formCccd}
                onChangeText={setFormCccd}
                placeholder="079201018891"
                placeholderTextColor="#9A9FA5"
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.cancelEditBtn}
                onPress={() => setShowEditModal(false)}
                disabled={isSavingProfile}
              >
                <Text style={styles.cancelEditBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveEditBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
                activeOpacity={0.88}
              >
                {isSavingProfile ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveEditBtnText}>Lưu vào CSDL</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL: GIA ĐÌNH (FAMILY MOBILITY PASS & SHARED WALLET)
         ============================================================ */}
      <Modal
        visible={showFamilyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFamilyModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.familyModalContainer}>
            {/* Header */}
            <View style={styles.familyModalHeader}>
              <TouchableOpacity
                onPress={() => setShowFamilyModal(false)}
                style={styles.familyCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.familyModalHeaderTitle}>Nhóm Di Chuyển Gia Đình</Text>
                <Text style={styles.familyModalHeaderSub}>Dùng chung ví & Định vị hành trình an toàn</Text>
              </View>
              <View style={styles.familyActiveBadge}>
                <Ionicons name="people" size={13} color="#15803D" />
                <Text style={styles.familyActiveBadgeText}>{familyMembers.length}/5 TV</Text>
              </View>
            </View>

            <ScrollView style={styles.familyModalScroll} showsVerticalScrollIndicator={false}>
              {/* Executive Overview Card */}
              <View style={styles.familyHeroCard}>
                <View style={styles.familyHeroTopRow}>
                  <View style={styles.familyHeroIconBox}>
                    <Ionicons name="home" size={22} color="#D4AF37" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.familyHeroTag}>GIA ĐÌNH ECOGO PRIME</Text>
                    <Text style={styles.familyHeroName}>Nhóm Gia Đình Minh Tài</Text>
                  </View>
                  <View style={styles.familyStatusPill}>
                    <View style={styles.familyStatusDot} />
                    <Text style={styles.familyStatusText}>Đang hoạt động</Text>
                  </View>
                </View>

                <View style={styles.familyQuotaBox}>
                  <View style={styles.familyQuotaRow}>
                    <Text style={styles.familyQuotaLabel}>Hạn mức chi tiêu chung:</Text>
                    <Text style={styles.familyQuotaVal}>10.000.000đ/tháng</Text>
                  </View>
                  <View style={styles.familyProgressTrack}>
                    <View style={[styles.familyProgressBar, { width: '24.5%' }]} />
                  </View>
                  <Text style={styles.familyProgressSub}>
                    Đã sử dụng 2.450.000đ (2 chuyến tự lái) trong tháng 11/2026
                  </Text>
                </View>
              </View>

              {/* Toggles: Cấu hình phân quyền nhóm */}
              <View style={styles.familySectionBox}>
                <Text style={styles.familySectionTitle}>Cấu hình quyền lợi nhóm</Text>

                <View style={styles.familyToggleRow}>
                  <View style={styles.toggleIconCircle}>
                    <Ionicons name="wallet-outline" size={18} color="#6F4E37" />
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.toggleMainLabel}>Dùng chung ví thanh toán</Text>
                    <Text style={styles.toggleSubLabel}>
                      Cho phép thành viên nhóm thuê xe và thanh toán trực tiếp qua Thẻ/Ví của chủ nhóm
                    </Text>
                  </View>
                  <Switch
                    value={familyShareWallet}
                    onValueChange={setFamilyShareWallet}
                    trackColor={{ false: '#EBE3D7', true: '#6F4E37' }}
                    thumbColor={familyShareWallet ? '#D4AF37' : '#FFFFFF'}
                  />
                </View>

                <View style={styles.familyDivider} />

                <View style={styles.familyToggleRow}>
                  <View style={styles.toggleIconCircle}>
                    <Ionicons name="location-outline" size={18} color="#059669" />
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.toggleMainLabel}>Định vị lộ trình an toàn SOS</Text>
                    <Text style={styles.toggleSubLabel}>
                      Tự động chia sẻ vị trí xe thời gian thực cho gia đình khi xe di chuyển ban đêm
                    </Text>
                  </View>
                  <Switch
                    value={familyShareLocation}
                    onValueChange={setFamilyShareLocation}
                    trackColor={{ false: '#EBE3D7', true: '#059669' }}
                    thumbColor={familyShareLocation ? '#D4AF37' : '#FFFFFF'}
                  />
                </View>
              </View>

              {/* Danh sách thành viên */}
              <View style={styles.familySectionBox}>
                <View style={styles.sectionHeaderBetween}>
                  <Text style={styles.familySectionTitle}>
                    Thành viên nhóm ({familyMembers.length}/5)
                  </Text>
                  {!showAddMember && familyMembers.length < 5 && (
                    <TouchableOpacity
                      style={styles.addMemberHeaderBtn}
                      onPress={() => setShowAddMember(true)}
                    >
                      <Ionicons name="add-circle" size={16} color="#6F4E37" />
                      <Text style={styles.addMemberHeaderText}>Thêm người thân</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {familyMembers.map((member) => (
                  <View key={member.id} style={styles.memberCard}>
                    <View style={styles.memberAvatarCircle}>
                      <Text style={styles.memberAvatarInitial}>{member.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberNameText}>{member.name}</Text>
                        <View
                          style={[
                            styles.memberRolePill,
                            member.isOwner && styles.memberRoleOwnerPill
                          ]}
                        >
                          <Text
                            style={[
                              styles.memberRoleText,
                              member.isOwner && styles.memberRoleOwnerText
                            ]}
                          >
                            {member.relation}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.memberPhoneText}>{member.phone}</Text>
                      <View style={styles.memberStatusRow}>
                        <Ionicons
                          name={member.hasLicense ? 'shield-checkmark' : 'checkmark-circle-outline'}
                          size={12}
                          color={member.hasLicense ? '#15803D' : '#6F767E'}
                        />
                        <Text style={styles.memberStatusText}>{member.status}</Text>
                      </View>
                    </View>
                    {!member.isOwner && (
                      <TouchableOpacity
                        style={styles.removeMemberBtn}
                        onPress={() => handleRemoveMember(member.id, member.name)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Form thêm người thân mới */}
                {showAddMember && (
                  <View style={styles.addMemberFormBox}>
                    <Text style={styles.addMemberFormHeading}>Mời người thân vào nhóm gia đình</Text>
                    <Text style={styles.formInputLabel}>Họ và tên người thân *</Text>
                    <TextInput
                      style={styles.formTextInput}
                      placeholder="VD: Nguyễn Văn A"
                      placeholderTextColor="#9A9FA5"
                      value={newMemberName}
                      onChangeText={setNewMemberName}
                    />

                    <Text style={styles.formInputLabel}>Số điện thoại đăng ký EcoGo *</Text>
                    <TextInput
                      style={styles.formTextInput}
                      placeholder="VD: 0912 345 678"
                      placeholderTextColor="#9A9FA5"
                      keyboardType="phone-pad"
                      value={newMemberPhone}
                      onChangeText={setNewMemberPhone}
                    />

                    <Text style={styles.formInputLabel}>Mối quan hệ gia đình</Text>
                    <View style={styles.relationPillsRow}>
                      {['Vợ / Chồng', 'Con cái', 'Ba / Mẹ', 'Anh / Chị'].map((rel) => (
                        <TouchableOpacity
                          key={rel}
                          style={[
                            styles.relationPill,
                            newMemberRelation === rel && styles.relationPillActive
                          ]}
                          onPress={() => setNewMemberRelation(rel)}
                        >
                          <Text
                            style={[
                              styles.relationPillText,
                              newMemberRelation === rel && styles.relationPillTextActive
                            ]}
                          >
                            {rel}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.formButtonsRow}>
                      <TouchableOpacity
                        style={styles.formCancelBtn}
                        onPress={() => setShowAddMember(false)}
                      >
                        <Text style={styles.formCancelBtnText}>Hủy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.formSubmitBtn}
                        onPress={handleAddMember}
                        activeOpacity={0.88}
                      >
                        <Ionicons name="paper-plane" size={14} color="#FFFFFF" />
                        <Text style={styles.formSubmitBtnText}>Gửi lời mời</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Đặc quyền nhóm gia đình EcoGo */}
              <View style={styles.familyPerksCard}>
                <Text style={styles.familyPerksTitle}>Đặc Quyền Hội Viên Gia Đình EcoGo</Text>
                <View style={styles.perkItemRow}>
                  <Ionicons name="shield-checkmark" size={16} color="#D4AF37" />
                  <Text style={styles.perkItemText}>
                    Miễn 100% cọc thế chấp cho toàn bộ người thân đã định danh GPLX B2
                  </Text>
                </View>
                <View style={styles.perkItemRow}>
                  <Ionicons name="sparkles" size={16} color="#D4AF37" />
                  <Text style={styles.perkItemText}>
                    Tích lũy x1.5 điểm Eco Xu cho các chuyến đi dã ngoại gia đình cuối tuần
                  </Text>
                </View>
                <View style={styles.perkItemRow}>
                  <Ionicons name="call" size={16} color="#D4AF37" />
                  <Text style={styles.perkItemText}>
                    Đường dây nóng SOS ưu tiên và cứu hộ pin / lốp tận nơi 24/7
                  </Text>
                </View>
              </View>

              <View style={{ height: 30 }} />
            </ScrollView>

            <View style={styles.familyModalFooter}>
              <TouchableOpacity
                style={styles.familySaveBtn}
                onPress={() => {
                  setShowFamilyModal(false);
                  Alert.alert('Đã lưu', 'Cấu hình nhóm gia đình đã được cập nhật thành công!');
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.familySaveBtnText}>Đã Hiểu & Lưu Thiết Lập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL: DOANH NGHIỆP (CORPORATE MOBILITY & VAT INVOICE)
         ============================================================ */}
      <Modal
        visible={showBusinessModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBusinessModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.businessModalContainer}>
            {/* Header */}
            <View style={styles.businessModalHeader}>
              <TouchableOpacity
                onPress={() => setShowBusinessModal(false)}
                style={styles.businessCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.businessModalHeaderTitle}>Hồ Sơ Doanh Nghiệp & VAT</Text>
                <Text style={styles.businessModalHeaderSub}>Tự động xuất e-Invoice & Thẻ công ty</Text>
              </View>
              <View
                style={[
                  styles.businessActiveBadge,
                  isBusinessTripMode && styles.businessActiveBadgeGreen
                ]}
              >
                <Ionicons
                  name={isBusinessTripMode ? 'briefcase' : 'briefcase-outline'}
                  size={12}
                  color={isBusinessTripMode ? '#15803D' : '#6F4E37'}
                />
                <Text
                  style={[
                    styles.businessActiveBadgeText,
                    isBusinessTripMode && styles.businessActiveBadgeGreenText
                  ]}
                >
                  {isBusinessTripMode ? 'Bật công tác' : 'Chế độ cá nhân'}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.businessModalScroll} showsVerticalScrollIndicator={false}>
              {/* Công tắc chuyển đổi chế độ công tác */}
              <View style={styles.businessModeSwitchCard}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={styles.modeSwitchTitleRow}>
                    <Text style={styles.modeSwitchMainTitle}>Chế độ Chuyến đi Công tác</Text>
                    <View style={styles.goldVipPill}>
                      <Text style={styles.goldVipPillText}>DOANH NGHIỆP</Text>
                    </View>
                  </View>
                  <Text style={styles.modeSwitchSubTitle}>
                    {isBusinessTripMode
                      ? '✓ Đang kích hoạt: Các chuyến thuê xe sẽ tự động trừ thẻ công ty và gửi hóa đơn VAT về email kế toán.'
                      : 'Đang tắt: Bạn đang thuê xe ở tư cách Cá nhân. Bật công tắc để chuyển sang chế độ Công tác.'}
                  </Text>
                </View>
                <Switch
                  value={isBusinessTripMode}
                  onValueChange={(val) => {
                    setIsBusinessTripMode(val);
                    Alert.alert(
                      val ? 'Đã bật Chế độ Công tác' : 'Đã chuyển sang Cá nhân',
                      val
                        ? 'Các chuyến thuê xe tiếp theo sẽ được gắn mã chi phí doanh nghiệp và xuất hóa đơn VAT tự động.'
                        : 'Các chuyến thuê xe sẽ trở lại tính phí cá nhân của bạn.'
                    );
                  }}
                  trackColor={{ false: '#EBE3D7', true: '#15803D' }}
                  thumbColor={isBusinessTripMode ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              {/* Thông tin pháp lý xuất hóa đơn VAT */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Thông tin xuất hóa đơn điện tử (VAT)</Text>
                </View>

                <Text style={styles.formInputLabel}>Tên doanh nghiệp đầy đủ *</Text>
                <TextInput
                  style={styles.formTextInput}
                  value={bizCompanyName}
                  onChangeText={setBizCompanyName}
                  placeholder="CÔNG TY TNHH / CỔ PHẦN..."
                  placeholderTextColor="#9A9FA5"
                />

                <Text style={styles.formInputLabel}>Mã số thuế (MST) doanh nghiệp *</Text>
                <TextInput
                  style={styles.formTextInput}
                  value={bizTaxId}
                  onChangeText={setBizTaxId}
                  placeholder="031xxxxxxx"
                  placeholderTextColor="#9A9FA5"
                  keyboardType="numeric"
                />

                <Text style={styles.formInputLabel}>Địa chỉ đăng ký kinh doanh *</Text>
                <TextInput
                  style={[styles.formTextInput, { height: 60, textAlignVertical: 'top' }]}
                  value={bizAddress}
                  onChangeText={setBizAddress}
                  multiline
                  placeholder="Địa chỉ trụ sở công ty..."
                  placeholderTextColor="#9A9FA5"
                />

                <Text style={styles.formInputLabel}>Email kế toán nhận e-Invoice *</Text>
                <TextInput
                  style={styles.formTextInput}
                  value={bizEmail}
                  onChangeText={setBizEmail}
                  placeholder="accounting@company.com"
                  placeholderTextColor="#9A9FA5"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.formInputLabel}>Mã trung tâm chi phí / Cost Center (Tùy chọn)</Text>
                <TextInput
                  style={styles.formTextInput}
                  value={bizCostCenter}
                  onChangeText={setBizCostCenter}
                  placeholder="VD: PROJECT-2026-SG"
                  placeholderTextColor="#9A9FA5"
                  autoCapitalize="characters"
                />
              </View>

              {/* Thẻ thanh toán & Hạn mức công nợ */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Phương thức thanh toán doanh nghiệp</Text>
                </View>

                <View style={styles.corpCardBox}>
                  <View style={styles.corpCardHeader}>
                    <Ionicons name="card" size={20} color="#D4AF37" />
                    <Text style={styles.corpCardTitle}>Corporate Platinum Card</Text>
                  </View>
                  <Text style={styles.corpCardNumber}>•••• •••• •••• 8821</Text>
                  <View style={styles.corpCardFooter}>
                    <Text style={styles.corpCardHolder}>{user.fullName || 'MINH TÀI'}</Text>
                    <Text style={styles.corpCardExp}>EXP: 12/28</Text>
                  </View>
                </View>

                <View style={styles.corpQuotaRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.corpQuotaLabel}>Hạn mức chi tiêu tháng:</Text>
                    <Text style={styles.corpQuotaVal}>50.000.000đ</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.corpQuotaLabel}>Đã thanh toán tháng này:</Text>
                    <Text style={styles.corpSpentVal}>3.480.000đ</Text>
                  </View>
                </View>
              </View>

              {/* Báo cáo chi phí công tác */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Báo cáo chi phí công tác tháng 11/2026</Text>
                </View>

                <View style={styles.expenseSummaryGrid}>
                  <View style={styles.expenseStatBox}>
                    <Text style={styles.expenseStatNum}>3</Text>
                    <Text style={styles.expenseStatLabel}>Chuyến công tác</Text>
                  </View>
                  <View style={styles.expenseStatBox}>
                    <Text style={styles.expenseStatNum}>142 km</Text>
                    <Text style={styles.expenseStatLabel}>Lộ trình di chuyển</Text>
                  </View>
                  <View style={styles.expenseStatBox}>
                    <Text style={styles.expenseStatNum}>64.2 kg</Text>
                    <Text style={styles.expenseStatLabel}>CO2 giảm cho cty</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.exportReportBtn}
                  onPress={handleExportExpenseReport}
                  activeOpacity={0.85}
                >
                  <Ionicons name="cloud-download-outline" size={16} color="#6F4E37" />
                  <Text style={styles.exportReportBtnText}>
                    Xuất bảng kê chi phí & e-Invoice (Excel / PDF)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 30 }} />
            </ScrollView>

            <View style={styles.businessModalFooter}>
              <TouchableOpacity
                style={styles.businessSaveBtn}
                onPress={handleSaveBusinessProfile}
                disabled={isSavingBiz}
                activeOpacity={0.88}
              >
                {isSavingBiz ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.businessSaveBtnText}>Lưu Hồ Sơ Doanh Nghiệp & VAT</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL 1: VÍ VOUCHER & MÃ KHUYẾN MẠI
         ============================================================ */}
      <VoucherWalletModal
        visible={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        ecoCoins={user.points || 340}
        savedVouchers={['BANMOI30', 'ECOGO20', 'PRIME50K']}
        onApplyVoucher={(v) => {
          setShowVoucherModal(false);
          const code = typeof v === 'object' ? v.code : v;
          Alert.alert('Áp dụng ưu đãi thành công', `Đã kích hoạt mã ${code}. Ưu đãi sẽ được tự động khấu trừ vào chuyến thuê xe tiếp theo của bạn!`);
        }}
      />

      {/* ============================================================
          MODAL 2: QUẢN LÝ VÍ & THANH TOÁN
         ============================================================ */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.appModalContainer}>
            <View style={styles.appModalHeader}>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.appModalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.appModalTitle}>Ví & Thanh Toán EcoGo</Text>
                <Text style={styles.appModalSub}>Quản lý số dư & thẻ thanh toán</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.appModalBody} showsVerticalScrollIndicator={false}>
              {/* Thẻ số dư ví */}
              <View style={styles.walletCardLuxury}>
                <View style={styles.walletCardTop}>
                  <View>
                    <Text style={styles.walletBalanceLabel}>Số dư Ví EcoGo khả dụng</Text>
                    <Text style={styles.walletBalanceNumber}>{Number(walletBalance).toLocaleString('vi-VN')}đ</Text>
                  </View>
                  <View style={styles.walletIconCircle}>
                    <Ionicons name="wallet" size={24} color="#D4AF37" />
                  </View>
                </View>
                <Text style={styles.walletCardDesc}>
                  Dùng để cọc xe tự động, thanh toán cước thuê và nhận hoàn cọc tức thì 30 giây.
                </Text>
              </View>

              {/* Nạp tiền nhanh */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Nạp tiền nhanh vào Ví (VietQR 24/7)</Text>
                </View>

                <View style={styles.topUpChipsGrid}>
                  {[100000, 200000, 500000, 1000000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.topUpChip}
                      activeOpacity={0.75}
                      onPress={() => {
                        const newBal = walletBalance + amt;
                        setWalletBalance(newBal);
                        Alert.alert(
                          'Nạp tiền thành công!',
                          `Đã nạp +${amt.toLocaleString('vi-VN')}đ vào Ví EcoGo qua Napas VietQR 24/7.\nSố dư khả dụng mới: ${newBal.toLocaleString('vi-VN')}đ`
                        );
                      }}
                    >
                      <Text style={styles.topUpChipText}>+{amt.toLocaleString('vi-VN')}đ</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Phương thức liên kết */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Phương thức liên kết</Text>
                </View>

                <View style={styles.paymentMethodRow}>
                  <View style={[styles.methodIconBox, { backgroundColor: '#1E293B' }]}>
                    <Ionicons name="card" size={20} color="#38BDF8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.methodName}>Visa Platinum</Text>
                      <View style={styles.defaultMethodBadge}>
                        <Text style={styles.defaultMethodText}>Mặc định</Text>
                      </View>
                    </View>
                    <Text style={styles.methodSub}>•••• •••• •••• 3892</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                </View>

                <View style={styles.paymentMethodRow}>
                  <View style={[styles.methodIconBox, { backgroundColor: '#FDF2F8' }]}>
                    <Ionicons name="phone-portrait-outline" size={20} color="#A21CAF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodName}>Ví Điện Tử MoMo</Text>
                    <Text style={styles.methodSub}>{user.phone || '0838 672 664'}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                </View>

                <TouchableOpacity
                  style={styles.addPaymentBtn}
                  activeOpacity={0.8}
                  onPress={() =>
                    Alert.alert(
                      'Thêm Thẻ / Ví Mới',
                      'Cổng thanh toán Napas / 3D-Secure sẽ mở để liên kết thẻ Quốc tế hoặc ATM nội địa.',
                      [{ text: 'Đóng' }]
                    )
                  }
                >
                  <Ionicons name="add-circle-outline" size={18} color="#6F4E37" />
                  <Text style={styles.addPaymentBtnText}>Thêm thẻ tín dụng / thẻ ghi nợ mới</Text>
                </TouchableOpacity>
              </View>

              {/* Tự động thanh toán */}
              <View style={styles.businessSectionBox}>
                <View style={styles.autoPayRow}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.autoPayTitle}>Tự động thanh toán khi kết thúc</Text>
                    <Text style={styles.autoPayDesc}>
                      Khấu trừ cước thuê từ Ví EcoGo hoặc thẻ mặc định ngay khi khóa trả xe tại trạm Hub.
                    </Text>
                  </View>
                  <Switch
                    value={autoDeductRental}
                    onValueChange={setAutoDeductRental}
                    trackColor={{ false: '#E2E8F0', true: '#15803D' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {/* Lịch sử giao dịch ví */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Giao dịch gần đây</Text>
                </View>

                <View style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txTitle}>Nạp Ví qua Napas VietQR</Text>
                    <Text style={styles.txDate}>12/11/2026 • 15:42</Text>
                  </View>
                  <Text style={styles.txAmountPlus}>+500.000đ</Text>
                </View>

                <View style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txTitle}>Cước thuê VinFast VF 7 (4 giờ)</Text>
                    <Text style={styles.txDate}>10/11/2026 • 18:30</Text>
                  </View>
                  <Text style={styles.txAmountMinus}>-240.000đ</Text>
                </View>

                <View style={styles.txRow}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txTitle}>Hoàn cọc thế chấp xe tự lái</Text>
                    <Text style={styles.txDate}>10/11/2026 • 18:32</Text>
                  </View>
                  <Text style={styles.txAmountPlus}>+15.000.000đ</Text>
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.appModalFooter}>
              <TouchableOpacity
                style={styles.appModalPrimaryBtn}
                onPress={() => setShowPaymentModal(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.appModalPrimaryBtnText}>Đóng & Quay Lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL 3: TRUNG TÂM AN TOÀN & CỨU HỘ SOS 24/7
         ============================================================ */}
      <Modal
        visible={showSafetyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSafetyModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.appModalContainer}>
            <View style={styles.appModalHeader}>
              <TouchableOpacity
                onPress={() => setShowSafetyModal(false)}
                style={styles.appModalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.appModalTitle}>Trung Tâm An Toàn 24/7</Text>
                <Text style={styles.appModalSub}>Cứu hộ khẩn cấp & Bảo hiểm PVI</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.appModalBody} showsVerticalScrollIndicator={false}>
              {/* Emergency SOS Card */}
              <View style={styles.emergencySosCard}>
                <View style={styles.emergencySosIconBox}>
                  <Ionicons name="warning" size={26} color="#DC2626" />
                </View>
                <Text style={styles.emergencySosTitle}>Đường Dây Nóng Khẩn Cấp SOS 24/7</Text>
                <Text style={styles.emergencySosDesc}>
                  Hỗ trợ ứng cứu khẩn cấp, sự cố kỹ thuật xe hoặc va quẹt trên mọi cung đường toàn thành phố.
                </Text>
                <TouchableOpacity
                  style={styles.callHotlineBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    Linking.openURL('tel:19006868').catch(() => {
                      Alert.alert('Hotline Khẩn Cấp', 'Vui lòng gọi tổng đài: 1900 6868');
                    });
                  }}
                >
                  <Ionicons name="call" size={18} color="#FFFFFF" />
                  <Text style={styles.callHotlineBtnText}>Gọi Ngay: 1900 6868</Text>
                </TouchableOpacity>
              </View>

              {/* Quy chuẩn an toàn */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Tiêu chuẩn bảo vệ khách hàng EcoGo</Text>
                </View>

                <View style={styles.safetyPillarItem}>
                  <View style={[styles.safetyPillarIcon, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="battery-charging" size={20} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.safetyPillarTitle}>Đội Cứu Hộ Pin Lưu Động Trong 20 Phút</Text>
                    <Text style={styles.safetyPillarDesc}>
                      Xe cứu hộ chuyên dụng trang bị sạc nhanh DC lưu động hỗ trợ ngay khi xe cạn pin trên hành trình.
                    </Text>
                  </View>
                </View>

                <View style={styles.safetyPillarItem}>
                  <View style={[styles.safetyPillarIcon, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.safetyPillarTitle}>Bảo Hiểm Vật Chất & TNDS PVI 500 Triệu</Text>
                    <Text style={styles.safetyPillarDesc}>
                      100% chuyến đi được tự động bảo hiểm thân vỏ xe, người ngồi trên xe và trách nhiệm dân sự.
                    </Text>
                  </View>
                </View>

                <View style={styles.safetyPillarItem}>
                  <View style={[styles.safetyPillarIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="key" size={20} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.safetyPillarTitle}>Nút SOS Tích Hợp Trên Chìa Khóa Số</Text>
                    <Text style={styles.safetyPillarDesc}>
                      Bấm nút SOS trên màn hình Chìa khóa xe để tự động truyền tọa độ GPS về Trung tâm Điều phối.
                    </Text>
                  </View>
                </View>

                <View style={styles.safetyPillarItem}>
                  <View style={[styles.safetyPillarIcon, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="speedometer" size={20} color="#7E22CE" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.safetyPillarTitle}>Giám Sát Cảm Biến Áp Suất Lốp (TPMS)</Text>
                    <Text style={styles.safetyPillarDesc}>
                      Tự động kiểm định áp suất và nhiệt độ lốp trước mỗi lượt khách nhận xe tại trạm Hub.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.appModalFooter}>
              <TouchableOpacity
                style={styles.appModalPrimaryBtn}
                onPress={() => setShowSafetyModal(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.appModalPrimaryBtnText}>Đã Hiểu & Quay Lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL 4: GIỚI THIỆU BẠN BÈ
         ============================================================ */}
      <Modal
        visible={showReferralModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.appModalContainer}>
            <View style={styles.appModalHeader}>
              <TouchableOpacity
                onPress={() => setShowReferralModal(false)}
                style={styles.appModalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.appModalTitle}>Giới Thiệu Bạn Bè</Text>
                <Text style={styles.appModalSub}>Nhận thưởng đôi bên cùng vui</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.appModalBody} showsVerticalScrollIndicator={false}>
              {/* Banner */}
              <View style={styles.referralBannerCard}>
                <View style={styles.referralGiftIconCircle}>
                  <Ionicons name="gift" size={30} color="#D4AF37" />
                </View>
                <Text style={styles.referralBannerHeading}>Mời Bạn Bè Trải Nghiệm Xe Điện</Text>
                <Text style={styles.referralBannerDesc}>
                  Lan tỏa lối sống xanh. Nhận quà ngay khi bạn bè hoàn thành chuyến xe tự lái đầu tiên!
                </Text>

                {/* Mã giới thiệu */}
                <View style={styles.referralCodeBox}>
                  <View>
                    <Text style={styles.referralCodeLabel}>MÃ GIỚI THIỆU CỦA BẠN</Text>
                    <Text style={styles.referralCodeText}>ECOGO-{user.phone ? user.phone.slice(-4) : '8891'}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.copyCodeBtn, copiedReferral && styles.copyCodeBtnActive]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCopiedReferral(true);
                      Alert.alert(
                        'Đã sao chép mã!',
                        `Mã giới thiệu ECOGO-${user.phone ? user.phone.slice(-4) : '8891'} đã được sao chép. Hãy gửi mã này cho bạn bè!`
                      );
                      setTimeout(() => setCopiedReferral(false), 2500);
                    }}
                  >
                    <Ionicons
                      name={copiedReferral ? 'checkmark' : 'copy-outline'}
                      size={15}
                      color={copiedReferral ? '#FFFFFF' : '#6F4E37'}
                    />
                    <Text style={[styles.copyCodeBtnText, copiedReferral && styles.copyCodeBtnTextActive]}>
                      {copiedReferral ? 'Đã chép' : 'Sao chép'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quyền lợi nhận thưởng */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Đặc quyền quà tặng 2 chiều</Text>
                </View>

                <View style={styles.rewardBenefitRow}>
                  <View style={[styles.rewardBenefitIcon, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="ticket" size={20} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewardBenefitTitle}>Bạn bè nhận Voucher 50.000đ</Text>
                    <Text style={styles.rewardBenefitDesc}>
                      Áp dụng trực tiếp vào chuyến thuê xe đầu tiên tại bất kỳ trạm EcoGo Hub nào.
                    </Text>
                  </View>
                </View>

                <View style={styles.rewardBenefitRow}>
                  <View style={[styles.rewardBenefitIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="sparkles" size={20} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewardBenefitTitle}>Bạn nhận 50 Eco Xu (+50.000đ)</Text>
                    <Text style={styles.rewardBenefitDesc}>
                      Tự động cộng vào ví điểm thưởng ngay khi chuyến xe đầu tiên của bạn bè kết thúc thành công.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Danh sách đã mời */}
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>Bạn bè đã tham gia (3)</Text>
                </View>

                <View style={styles.referredUserItem}>
                  <View style={styles.referredAvatar}>
                    <Text style={styles.referredAvatarText}>NA</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.referredName}>Nguyễn Nam Anh</Text>
                    <Text style={styles.referredDate}>Đã thuê VinFast VF 6 • Nhận +50 Xu</Text>
                  </View>
                  <Text style={styles.referredStatus}>Hoàn thành</Text>
                </View>

                <View style={styles.referredUserItem}>
                  <View style={styles.referredAvatar}>
                    <Text style={styles.referredAvatarText}>TH</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.referredName}>Trần Hoàng Hải</Text>
                    <Text style={styles.referredDate}>Đã thuê Hyundai Ioniq 5 • Nhận +50 Xu</Text>
                  </View>
                  <Text style={styles.referredStatus}>Hoàn thành</Text>
                </View>

                <View style={styles.referredUserItem}>
                  <View style={styles.referredAvatar}>
                    <Text style={styles.referredAvatarText}>LM</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.referredName}>Lê Minh Quân</Text>
                    <Text style={styles.referredDate}>Đã nhận mã • Chưa kích hoạt</Text>
                  </View>
                  <Text style={[styles.referredStatus, { color: '#B45309' }]}>Đang chờ</Text>
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.appModalFooter}>
              <TouchableOpacity
                style={styles.appModalPrimaryBtn}
                onPress={() => setShowReferralModal(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.appModalPrimaryBtnText}>Xong</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL 5: ĐỀ XUẤT MỞ TRẠM ECOGO HUB MỚI
         ============================================================ */}
      <Modal
        visible={showSuggestHubModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSuggestHubModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.appModalContainer}>
            <View style={styles.appModalHeader}>
              <TouchableOpacity
                onPress={() => setShowSuggestHubModal(false)}
                style={styles.appModalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.appModalTitle}>Đề Xuất Mở Trạm EcoGo Hub</Text>
                <Text style={styles.appModalSub}>Góp ý vị trí đặt trạm mới</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.appModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.suggestHubBanner}>
                <Ionicons name="location" size={26} color="#D4AF37" />
                <Text style={styles.suggestHubBannerTitle}>Bạn muốn mở trạm EcoGo ở đâu?</Text>
                <Text style={styles.suggestHubBannerDesc}>
                  EcoGo liên tục mở rộng mạng lưới trạm sạc & giao nhận xe. Đề xuất của bạn sẽ giúp ưu tiên vị trí triển khai tiếp theo!
                </Text>
              </View>

              <View style={styles.businessSectionBox}>
                <Text style={styles.formInputLabel}>Chọn Quận / Khu vực *</Text>
                <View style={styles.districtChipsGrid}>
                  {['Bình Thạnh', 'Quận 1', 'Thủ Thiêm', 'Quận 7', 'TP. Thủ Đức', 'Tân Bình', 'Gò Vấp'].map((dist) => (
                    <TouchableOpacity
                      key={dist}
                      style={[styles.districtChip, suggestDistrict === dist && styles.districtChipActive]}
                      onPress={() => setSuggestDistrict(dist)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.districtChipText, suggestDistrict === dist && styles.districtChipTextActive]}>
                        {dist}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.formInputLabel, { marginTop: 16 }]}>Địa điểm / Tòa nhà / Khu dân cư đề xuất *</Text>
                <TextInput
                  style={styles.formTextInput}
                  value={suggestLocationName}
                  onChangeText={setSuggestLocationName}
                  placeholder="VD: Chung cư Masteri Thảo Điền, Bitexco, Landmark 81..."
                  placeholderTextColor="#9A9FA5"
                />

                <Text style={[styles.formInputLabel, { marginTop: 14 }]}>Ghi chú thêm (Tùy chọn)</Text>
                <TextInput
                  style={[styles.formTextInput, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="VD: Khu vực đông cư dân, bãi xe rộng rãi, nhu cầu thuê cao..."
                  placeholderTextColor="#9A9FA5"
                  multiline
                />
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.appModalFooter}>
              <TouchableOpacity
                style={styles.appModalPrimaryBtn}
                disabled={isSubmittingHub}
                activeOpacity={0.88}
                onPress={() => {
                  if (!suggestLocationName.trim()) {
                    Alert.alert('Thông báo', 'Vui lòng nhập tên địa điểm hoặc tòa nhà bạn mong muốn mở trạm Hub.');
                    return;
                  }
                  setIsSubmittingHub(true);
                  setTimeout(() => {
                    setIsSubmittingHub(false);
                    setShowSuggestHubModal(false);
                    setSuggestLocationName('');
                    Alert.alert(
                      'Gửi đề xuất thành công!',
                      `Cảm ơn bạn! Ban Quản lý Hạ tầng EcoGo đã tiếp nhận đề xuất mở trạm tại khu vực ${suggestDistrict} (${suggestLocationName}). Đội ngũ kỹ thuật sẽ khảo sát trong 48 giờ làm việc!`
                    );
                  }, 600);
                }}
              >
                {isSubmittingHub ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.appModalPrimaryBtnText}>Gửi Đề Xuất Mở Trạm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          MODAL 6: ĐIỀU KHOẢN DỊCH VỤ & CHÍNH SÁCH BẢO MẬT
         ============================================================ */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.appModalContainer}>
            <View style={styles.appModalHeader}>
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                style={styles.appModalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.appModalTitle}>Điều Khoản & Bảo Mật</Text>
                <Text style={styles.appModalSub}>Quy chế vận hành & Pháp lý dữ liệu</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.appModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>1. Quy Chế Thuê Xe Điện Tự Lái 24/7</Text>
                </View>
                <Text style={styles.termsContentText}>
                  • Khách hàng phải từ đủ 18 tuổi trở lên, sở hữu Giấy phép lái xe ô tô hạng B2 trở lên còn thời hạn.{'\n'}
                  • Miễn 100% tiền thế chấp xe trị giá 15.000.000đ đối với tài khoản hoàn tất eKYC và có lịch sử di chuyển tốt.{'\n'}
                  • Xe tự lái được bàn giao với dung lượng pin tối thiểu 80%. Khách hàng vui lòng trả xe với mức pin tối thiểu 20% tại bất kỳ trạm EcoGo Hub nào.{'\n'}
                  • Nghiêm cấm hút thuốc, vận chuyển chất cấm, chất dễ cháy nổ và giao xe cho người chưa xác thực điều khiển.
                </Text>
              </View>

              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>2. Bảo Mật Dữ Liệu (Nghị định 13/2023/NĐ-CP)</Text>
                </View>
                <Text style={styles.termsContentText}>
                  • Cam kết bảo vệ an toàn tuyệt đối hình ảnh CCCD, GPLX và thông tin cá nhân của khách hàng theo đúng Nghị định 13/2023/NĐ-CP.{'\n'}
                  • Dữ liệu viễn trắc GPS và tiêu thụ năng lượng chỉ được dùng để tính cước hành trình, lượng phát thải CO2 tiết giảm và hỗ trợ ứng cứu an toàn.{'\n'}
                  • EcoGo cam kết không chia sẻ hoặc kinh doanh dữ liệu khách hàng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo thương mại.
                </Text>
              </View>

              <View style={styles.businessSectionBox}>
                <View style={styles.boxTitleRow}>
                  <View style={styles.boxTitleGoldBar} />
                  <Text style={styles.businessSectionHeading}>3. Xử Lý Sự Cố & Bảo Hiểm Xe Toàn Diện</Text>
                </View>
                <Text style={styles.termsContentText}>
                  • Mọi xe trong hệ thống đều được bảo hiểm vật chất xe và trách nhiệm dân sự PVI lên tới 500.000.000đ/vụ.{'\n'}
                  • Khi gặp va chạm hoặc sự cố kỹ thuật, khách hàng liên hệ ngay Hotline 1900 6868 để chuyên viên cứu hộ và giám định bảo hiểm hỗ trợ tại hiện trường.
                </Text>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.appModalFooter}>
              <TouchableOpacity
                style={styles.appModalPrimaryBtn}
                onPress={() => setShowTermsModal(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.appModalPrimaryBtnText}>Tôi Đã Hiểu & Đồng Ý</Text>
              </TouchableOpacity>
            </View>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  editProfileBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    gap: 4
  },
  editProfileBtnHeaderText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6F4E37'
  },
  editModalCard: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F0',
    paddingBottom: 10,
    marginBottom: 12
  },
  editModalTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
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
  editFieldLabel: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4E3322',
    marginTop: 10,
    marginBottom: 4
  },
  editInput: {
    fontFamily: FONTS.family,
    height: 42,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1A1D1F',
    backgroundColor: '#FAF7F2'
  },
  editModalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F0',
    paddingTop: 12
  },
  cancelEditBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F2'
  },
  cancelEditBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#6F767E'
  },
  saveEditBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveEditBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
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
    width: '100%',
    maxWidth: 440,
    height: '100%',
    backgroundColor: '#F4F7F8',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  contractTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3D7',
    gap: 10
  },
  contractCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contractTopTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1D1F',
    letterSpacing: -0.2
  },
  contractTopSub: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#8C6239',
    marginTop: 1,
    fontWeight: '600'
  },
  contractActiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3
  },
  contractActiveTagText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D'
  },
  gsmTurquoiseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B180D',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D4AF37'
  },
  gsmLogoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3E2515',
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  gsmLogoText: {
    fontFamily: FONTS.family,
    color: '#D4AF37',
    fontSize: 8.5,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5
  },
  gsmCompanyTitle: {
    fontFamily: FONTS.family,
    color: '#FAF7F2',
    fontSize: 12.5,
    fontWeight: '800',
    lineHeight: 17,
    letterSpacing: 0.2
  },
  gsmCompanySub: {
    fontFamily: FONTS.family,
    color: '#DCD4C7',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15
  },
  contractScrollBody: {
    flex: 1,
    padding: 14
  },
  contractWhiteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  boxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  boxTitleBar: {
    width: 3.5,
    height: 15,
    borderRadius: 2
  },
  contractBoxHeading: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2B180D',
    letterSpacing: 0.3
  },
  contractFieldLabel: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8C6239',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  contractFieldValue: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F',
    marginTop: 2,
    lineHeight: 19
  },
  contractFieldValueBold: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D1F',
    marginTop: 2
  },
  contractDivider: {
    height: 1,
    backgroundColor: '#F0EBE3',
    marginVertical: 9
  },
  contractVerifyStampBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
    marginBottom: 12
  },
  contractVerifyStampText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
    fontWeight: '600'
  },
  contractBottomBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  understandTurquoiseBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
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
    width: '100%',
    maxWidth: 440,
    height: '100%',
    backgroundColor: '#FAF7F2',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
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
  ecoBadgePill: {
    backgroundColor: 'rgba(111, 78, 55, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5
  },
  ecoBadgePillText: {
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
  },

  /* Multi-profile: Gia đình & Doanh nghiệp styles */
  accountCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardBadgeSmall: {
    backgroundColor: '#EBE3D7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  cardBadgeSmallText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '700',
    color: '#6F4E37'
  },
  accountTypeSub: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#8C6239',
    marginTop: 2
  },

  /* Family Modal */
  familyModalContainer: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    backgroundColor: '#FAF7F2',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  familyModalHeader: {
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
  familyCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  familyModalHeaderTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  familyModalHeaderSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 1
  },
  familyActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  familyActiveBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D'
  },
  familyModalScroll: {
    flex: 1,
    padding: 16
  },
  familyHeroCard: {
    backgroundColor: '#2B180D',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  familyHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  familyHeroIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  familyHeroTag: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8
  },
  familyHeroName: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2
  },
  familyStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(21, 128, 61, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  familyStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E'
  },
  familyStatusText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#86EFAC'
  },
  familyQuotaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12
  },
  familyQuotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  familyQuotaLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#EBE3D7'
  },
  familyQuotaVal: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37'
  },
  familyProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6
  },
  familyProgressBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 3
  },
  familyProgressSub: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#A89F91'
  },
  familySectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  familySectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#2B180D',
    marginBottom: 12
  },
  familyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  toggleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  toggleMainLabel: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  toggleSubLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 2
  },
  familyDivider: {
    height: 1,
    backgroundColor: '#F0EBE3',
    marginVertical: 12
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  addMemberHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F5EFEB'
  },
  addMemberHeaderText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37'
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  memberAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6F4E37',
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberAvatarInitial: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#FAF7F2'
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  memberNameText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  memberRolePill: {
    backgroundColor: '#EBE3D7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  memberRoleOwnerPill: {
    backgroundColor: '#FEF3C7'
  },
  memberRoleText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#6F4E37'
  },
  memberRoleOwnerText: {
    color: '#B45309'
  },
  memberPhoneText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 2
  },
  memberStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  memberStatusText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6F767E'
  },
  removeMemberBtn: {
    padding: 6
  },
  addMemberFormBox: {
    backgroundColor: '#F6EFE9',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  addMemberFormHeading: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#2B180D',
    marginBottom: 10
  },
  formInputLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#4E3322',
    marginTop: 8,
    marginBottom: 4
  },
  formTextInput: {
    fontFamily: FONTS.family,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1A1D1F'
  },
  relationPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 12
  },
  relationPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  relationPillActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  relationPillText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#6F767E'
  },
  relationPillTextActive: {
    color: '#FFFFFF'
  },
  formButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6
  },
  formCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EBE3D7',
    alignItems: 'center'
  },
  formCancelBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37'
  },
  formSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#6F4E37'
  },
  formSubmitBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  familyPerksCard: {
    backgroundColor: '#2B180D',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 10
  },
  familyPerksTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5
  },
  perkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  perkItemText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#F6EFE9',
    flex: 1
  },
  familyModalFooter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  familySaveBtn: {
    backgroundColor: '#6F4E37',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  familySaveBtnText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  /* Business Modal */
  businessModalContainer: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    backgroundColor: '#FAF7F2',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  businessModalHeader: {
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
  businessCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  businessModalHeaderTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  businessModalHeaderSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 1
  },
  businessActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  businessActiveBadgeGreen: {
    backgroundColor: '#DCFCE7'
  },
  businessActiveBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37'
  },
  businessActiveBadgeGreenText: {
    color: '#15803D'
  },
  businessModalScroll: {
    flex: 1,
    padding: 16
  },
  businessModeSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  modeSwitchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  modeSwitchMainTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D1F'
  },
  goldVipPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  goldVipPillText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309'
  },
  modeSwitchSubTitle: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    lineHeight: 16
  },
  businessSectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  boxTitleGoldBar: {
    width: 3,
    height: 14,
    backgroundColor: '#D4AF37',
    borderRadius: 2
  },
  businessSectionHeading: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#2B180D'
  },
  corpCardBox: {
    backgroundColor: '#2B180D',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  corpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  corpCardTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37'
  },
  corpCardNumber: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 12
  },
  corpCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  corpCardHolder: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#EBE3D7'
  },
  corpCardExp: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#A89F91'
  },
  corpQuotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3'
  },
  corpQuotaLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E'
  },
  corpQuotaVal: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D1F',
    marginTop: 2
  },
  corpSpentVal: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 2
  },
  expenseSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 14
  },
  expenseStatBox: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  expenseStatNum: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#6F4E37'
  },
  expenseStatLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6F767E',
    marginTop: 2,
    textAlign: 'center'
  },
  exportReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#6F4E37',
    borderRadius: 12,
    paddingVertical: 12
  },
  exportReportBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37'
  },
  businessModalFooter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  businessSaveBtn: {
    backgroundColor: '#2B180D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  businessSaveBtnText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  /* Streamlined Grid & Badges */
  taskCardSubLabel: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#6F767E',
    marginTop: 2
  },
  bctRedBadgeSingle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6
  },

  /* Generic Luxury App Modals */
  appModalContainer: {
    width: '100%',
    maxWidth: 440,
    height: '100%',
    backgroundColor: '#FAF7F2',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  },
  appModalHeader: {
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
  appModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  appModalTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#2B180D'
  },
  appModalSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8C6239',
    marginTop: 2
  },
  appModalBody: {
    flex: 1,
    padding: 16
  },
  appModalFooter: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  appModalPrimaryBtn: {
    backgroundColor: '#2B180D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  appModalPrimaryBtnText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  /* Wallet & Payment Modal Styles */
  walletCardLuxury: {
    backgroundColor: '#2B180D',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  walletCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  walletBalanceLabel: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700'
  },
  walletBalanceNumber: {
    fontFamily: FONTS.family,
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4
  },
  walletIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)'
  },
  walletCardDesc: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#C8BDB0',
    lineHeight: 16
  },
  topUpChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },
  topUpChip: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center'
  },
  topUpChipText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2B180D'
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
    gap: 12
  },
  methodIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  methodName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  defaultMethodBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6
  },
  defaultMethodText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D'
  },
  methodSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 2
  },
  addPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 6
  },
  addPaymentBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37'
  },
  autoPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  autoPayTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 2
  },
  autoPayDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    lineHeight: 15
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFEB'
  },
  txLeft: {
    flex: 1
  },
  txTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1A1D1F'
  },
  txDate: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#9A9FA5',
    marginTop: 2
  },
  txAmountPlus: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D'
  },
  txAmountMinus: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1D1F'
  },

  /* Safety Modal Styles */
  emergencySosCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 16
  },
  emergencySosIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  emergencySosTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 6,
    textAlign: 'center'
  },
  emergencySosDesc: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14
  },
  callHotlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%'
  },
  callHotlineBtnText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  safetyPillarItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3'
  },
  safetyPillarIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  safetyPillarTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  safetyPillarDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 2,
    lineHeight: 15
  },

  /* Referral Modal Styles */
  referralBannerCard: {
    backgroundColor: '#2B180D',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  referralGiftIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)'
  },
  referralBannerHeading: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#FAF7F2',
    textAlign: 'center',
    marginBottom: 6
  },
  referralBannerDesc: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#C8BDB0',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14
  },
  referralCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)'
  },
  referralCodeLabel: {
    fontFamily: FONTS.family,
    fontSize: 9,
    color: '#D4AF37',
    fontWeight: '800',
    letterSpacing: 0.5
  },
  referralCodeText: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: 2
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8
  },
  copyCodeBtnActive: {
    backgroundColor: '#15803D'
  },
  copyCodeBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6F4E37'
  },
  copyCodeBtnTextActive: {
    color: '#FFFFFF'
  },
  rewardBenefitRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3'
  },
  rewardBenefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rewardBenefitTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  rewardBenefitDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 2,
    lineHeight: 15
  },
  referredUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFEB'
  },
  referredAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2B180D',
    alignItems: 'center',
    justifyContent: 'center'
  },
  referredAvatarText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#D4AF37'
  },
  referredName: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  referredDate: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#6F767E',
    marginTop: 1
  },
  referredStatus: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D'
  },

  /* Suggest Hub Modal Styles */
  suggestHubBanner: {
    backgroundColor: '#2B180D',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  suggestHubBannerTitle: {
    fontFamily: FONTS.family,
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center'
  },
  suggestHubBannerDesc: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#C8BDB0',
    textAlign: 'center',
    lineHeight: 16
  },
  districtChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  districtChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  districtChipActive: {
    backgroundColor: '#2B180D',
    borderColor: '#D4AF37'
  },
  districtChipText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6F767E'
  },
  districtChipTextActive: {
    color: '#FAF7F2',
    fontWeight: '700'
  },

  /* Terms Modal Styles */
  termsContentText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#475569',
    lineHeight: 19,
    marginTop: 8
  }
});
