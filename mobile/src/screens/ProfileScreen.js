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

  const [toastMessage, setToastMessage] = useState(null);

  const handleTopUp = () => {
    setUser(prev => ({ ...prev, walletBalance: prev.walletBalance + 500000 }));
    setToastMessage('Đã nạp +500.000đ vào Ví ITS GreenPay thành công!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenSurvey = () => {
    const surveyUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfq1tFb8DmWn5QNuS5tkb6U5QXKND7s4JFDFg3F_8oXnberlA/viewform';
    Linking.openURL(surveyUrl).catch(() => {
      Alert.alert('Không thể mở liên kết', surveyUrl);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBig}>
          <Ionicons name="person" size={34} color="#059669" />
          <View style={styles.verifiedCheckDot}>
            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.profileName}>{user.fullName}</Text>
        <Text style={styles.profilePhone}>{user.phone} • {user.email}</Text>

        <View style={styles.tierPill}>
          <Ionicons name="diamond" size={11} color="#FFFFFF" />
          <Text style={styles.tierText}>{user.memberTier}</Text>
        </View>
      </View>

      {toastMessage && (
        <View style={styles.toastBox}>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* eKYC Verification Card */}
      <View style={styles.ekycCard}>
        <View style={styles.ekycHeader}>
          <View style={styles.ekycTitleRow}>
            <Ionicons name="shield-checkmark" size={17} color="#059669" />
            <Text style={styles.ekycTitle}>HỒ SƠ ĐỊNH DANH SỐ eKYC AI</Text>
          </View>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>ĐÃ XÁC THỰC</Text>
          </View>
        </View>

        <View style={styles.ekycBody}>
          <View style={styles.ekycItem}>
            <Text style={styles.ekycLabel}>Giấy phép lái xe quốc gia</Text>
            <Text style={styles.ekycValue}>{user.licenseNumber}</Text>
          </View>
          <View style={styles.ekycItem}>
            <Text style={styles.ekycLabel}>CCCD gắn chip (VNeID)</Text>
            <Text style={styles.ekycValue}>{user.cccdNumber}</Text>
          </View>
        </View>
        <View style={styles.ekycPrivilegeBox}>
          <Ionicons name="key-outline" size={13} color="#059669" />
          <Text style={styles.ekycNote}>
            Đặc quyền: Nhận xe tự động 24/7 và miễn 100% tiền đặt cọc thế chấp.
          </Text>
        </View>
      </View>

      {/* Wallet & Eco Points (Mint & Champagne Beige) */}
      <View style={styles.walletRow}>
        <View style={styles.walletBox}>
          <View style={styles.walletTopIconRow}>
            <Text style={styles.walletLabel}>Ví ITS GreenPay</Text>
            <Ionicons name="wallet-outline" size={15} color="#059669" />
          </View>
          <Text style={styles.walletVal}>{user.walletBalance.toLocaleString('vi-VN')}đ</Text>
          <TouchableOpacity style={styles.rechargeBtn} onPress={handleTopUp}>
            <Text style={styles.rechargeText}>+ Nạp nhanh 500k</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.walletBox, styles.walletBoxBeige]}>
          <View style={styles.walletTopIconRow}>
            <Text style={styles.walletLabelBeige}>Điểm Thưởng Xanh</Text>
            <Ionicons name="leaf-outline" size={15} color="#786B59" />
          </View>
          <Text style={[styles.walletVal, { color: '#059669' }]}>{user.ecoPoints} Eco Pts</Text>
          <TouchableOpacity style={styles.rechargeBtnBeige}>
            <Text style={styles.rechargeText}>Đổi ưu đãi -20%</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Survey & Feedback Banner (Linking to user's Google Form) */}
      <TouchableOpacity style={styles.surveyCard} onPress={handleOpenSurvey} activeOpacity={0.88}>
        <View style={styles.surveyIconCircle}>
          <Ionicons name="clipboard-outline" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.surveyContent}>
          <Text style={styles.surveyTitle}>KHẢO SÁT CHẤT LƯỢNG HẠ TẦNG ITS</Text>
          <Text style={styles.surveySub}>
            Đóng góp ý kiến nghiên cứu kết nối giao thông xanh ĐH GTVT TP.HCM (UTH)
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#059669" />
      </TouchableOpacity>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="document-text-outline" size={18} color="#059669" />
            </View>
            <Text style={styles.menuText}>Hợp đồng thuê phương tiện điện tử</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="leaf-outline" size={18} color="#059669" />
            </View>
            <Text style={styles.menuText}>Báo cáo tiết giảm phát thải CO₂ cá nhân</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconWrapBeige}>
              <Ionicons name="school-outline" size={18} color="#786B59" />
            </View>
            <Text style={styles.menuText}>Chuyên đề ITS - ĐH GTVT TP.HCM (UTH)</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconWrapBeige}>
              <Ionicons name="call-outline" size={18} color="#786B59" />
            </View>
            <Text style={styles.menuText}>Tổng đài cứu hộ & kỹ thuật 24/7</Text>
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
    backgroundColor: '#F5F5F7'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12
  },
  avatarBig: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 10,
    position: 'relative'
  },
  verifiedCheckDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827'
  },
  profilePhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 5,
    marginTop: 10
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  ekycCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  ekycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    marginBottom: 10
  },
  ekycTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  ekycTitle: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '900'
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  verifiedTagText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '800'
  },
  ekycBody: {
    marginBottom: 8
  },
  ekycItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  ekycLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600'
  },
  ekycValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827'
  },
  ekycPrivilegeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6
  },
  ekycNote: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    flex: 1
  },
  walletRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  walletBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  walletBoxBeige: {
    backgroundColor: '#F5F2EB',
    borderColor: '#E5DEC9'
  },
  walletTopIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  walletLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700'
  },
  walletLabelBeige: {
    fontSize: 11,
    color: '#786B59',
    fontWeight: '700'
  },
  walletVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginVertical: 6
  },
  rechargeBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 2
  },
  rechargeBtnBeige: {
    backgroundColor: '#111827',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 2
  },
  rechargeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  surveyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  surveyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#10B981',
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
    color: '#059669'
  },
  surveySub: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 2,
    fontWeight: '600'
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuIconWrapBeige: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F5F2EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700'
  },
  hotlineText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#059669'
  }
});
