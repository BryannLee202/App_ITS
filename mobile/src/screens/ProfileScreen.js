import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export default function ProfileScreen() {
  const [user, setUser] = useState({
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@uth.edu.vn',
    licenseNumber: 'GPLX Hạng B2 - 790123456789',
    cccdNumber: '079201008899',
    isEkycVerified: true,
    walletBalance: 1500000,
    ecoPoints: 340,
    memberTier: 'HỘI VIÊN DIAMOND GREEN'
  });

  const handleOpenSurvey = () => {
    const surveyUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfq1tFb8DmWn5QNuS5tkb6U5QXKND7s4JFDFg3F_8oXnberlA/viewform';
    Linking.openURL(surveyUrl).catch(() => {
      Alert.alert('Không thể mở liên kết', surveyUrl);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBig}>
          <Ionicons name="person" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.profileName}>{user.fullName}</Text>
        <Text style={styles.profilePhone}>{user.phone} • {user.email}</Text>

        <View style={styles.tierPill}>
          <Ionicons name="ribbon" size={12} color="#FFFFFF" />
          <Text style={styles.tierText}>{user.memberTier}</Text>
        </View>
      </View>

      {/* eKYC Verification Banner */}
      <View style={styles.ekycCard}>
        <View style={styles.ekycHeader}>
          <View style={styles.ekycTitleRow}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.secondary} />
            <Text style={styles.ekycTitle}>XÁC THỰC DANH TÍNH SỐ (eKYC AI)</Text>
          </View>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>ĐÃ XÁC THỰC</Text>
          </View>
        </View>

        <View style={styles.ekycBody}>
          <View style={styles.ekycItem}>
            <Text style={styles.ekycLabel}>Giấy phép lái xe</Text>
            <Text style={styles.ekycValue}>{user.licenseNumber}</Text>
          </View>
          <View style={styles.ekycItem}>
            <Text style={styles.ekycLabel}>CCCD gắn chip</Text>
            <Text style={styles.ekycValue}>{user.cccdNumber}</Text>
          </View>
        </View>
        <Text style={styles.ekycNote}>
          ✓ Đủ điều kiện tự nhận xe 24/7 không cần gặp chủ xe hoặc cọc tiền mặt.
        </Text>
      </View>

      {/* Wallet & Eco Points */}
      <View style={styles.walletRow}>
        <View style={styles.walletBox}>
          <Text style={styles.walletLabel}>Số dư ví ITS</Text>
          <Text style={styles.walletVal}>{user.walletBalance.toLocaleString('vi-VN')} đ</Text>
          <TouchableOpacity style={styles.rechargeBtn}>
            <Text style={styles.rechargeText}>+ Nạp tiền ví</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.walletBox, { backgroundColor: COLORS.secondaryMuted }]}>
          <Text style={styles.walletLabel}>Điểm Xanh Eco Points</Text>
          <Text style={[styles.walletVal, { color: COLORS.secondaryDark }]}>{user.ecoPoints} Pts</Text>
          <TouchableOpacity style={[styles.rechargeBtn, { backgroundColor: COLORS.secondaryDark }]}>
            <Text style={styles.rechargeText}>Đổi voucher</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Survey & Feedback Banner (Linking to user's Google Form) */}
      <TouchableOpacity style={styles.surveyCard} onPress={handleOpenSurvey} activeOpacity={0.88}>
        <View style={styles.surveyIconCircle}>
          <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.surveyContent}>
          <Text style={styles.surveyTitle}>PHIẾU KHẢO SÁT CHẤT LƯỢNG DỊCH VỤ ITS</Text>
          <Text style={styles.surveySub}>
            Đóng góp ý kiến nâng cấp hạ tầng giao thông thông minh kết nối Metro Tuyến 1
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </TouchableOpacity>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="car-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.menuText}>Hợp đồng thuê phương tiện điện tử</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="speedometer-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.menuText}>Báo cáo tiết giảm phát thải CO₂ cá nhân</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="school-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.menuText}>Chuyên đề ITS - ĐH GTVT TP.HCM (UTH)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Ionicons name="headset-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.menuText}>Tổng đài hỗ trợ khẩn cấp 24/7</Text>
          </View>
          <Text style={styles.hotlineText}>1900 8899</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 90
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md
  },
  avatarBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    marginBottom: SPACING.sm
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  profilePhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
    marginTop: SPACING.sm
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  ekycCard: {
    backgroundColor: COLORS.secondaryMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#C5DCF0'
  },
  ekycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D4E4F2',
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.sm
  },
  ekycTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  ekycTitle: {
    color: COLORS.secondaryDark,
    fontSize: 11,
    fontWeight: '800'
  },
  verifiedTag: {
    backgroundColor: COLORS.secondaryDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  ekycBody: {
    marginBottom: SPACING.xs
  },
  ekycItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3
  },
  ekycLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  ekycValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  ekycNote: {
    fontSize: 10,
    color: COLORS.secondaryDark,
    fontWeight: '700',
    marginTop: 4
  },
  walletRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  walletBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  walletLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  walletVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginVertical: 4
  },
  rechargeBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginTop: 4
  },
  rechargeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  surveyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryLight
  },
  surveyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  surveyContent: {
    flex: 1
  },
  surveyTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 0.4
  },
  surveySub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600'
  },
  menuSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  menuText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  hotlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger
  }
});
