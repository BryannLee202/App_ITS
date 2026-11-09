import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DigitalKeyScreen from './src/screens/DigitalKeyScreen';
import TripsHistoryScreen from './src/screens/TripsHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState('HOME');
  const [viewMode, setViewMode] = useState('MOBILE'); // 'MOBILE' | 'EXPANDED'
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const isPhoneMockup = isDesktop && viewMode === 'MOBILE';

  const renderContent = () => {
    switch (currentTab) {
      case 'HOME':
        return (
          <HomeScreen
            onNavigateToKey={() => setCurrentTab('KEY')}
            onNavigateToMap={() => setCurrentTab('MAP')}
            onNavigateToTrips={() => setCurrentTab('TRIPS')}
            onOpenRewards={() => setShowRewardsModal(true)}
          />
        );
      case 'MAP':
        return <MapScreen onSelectVehicle={() => setCurrentTab('HOME')} />;
      case 'KEY':
        return <DigitalKeyScreen onNavigateHome={() => setCurrentTab('HOME')} />;
      case 'TRIPS':
        return <TripsHistoryScreen onNavigateToKey={() => setCurrentTab('KEY')} />;
      case 'PROFILE':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onNavigateToKey={() => setCurrentTab('KEY')}
            onNavigateToMap={() => setCurrentTab('MAP')}
            onNavigateToTrips={() => setCurrentTab('TRIPS')}
            onOpenRewards={() => setShowRewardsModal(true)}
          />
        );
    }
  };

  return (
    <View style={isDesktop ? styles.desktopBackdrop : styles.mobileRoot}>
      {/* Desktop Mode Switcher Bar */}
      {isDesktop && (
        <View style={styles.desktopSwitcherBar}>
          <View style={styles.brandBadge}>
            <View style={styles.brandIconMini}>
              <Ionicons name="car-sport" size={14} color="#DF8268" />
            </View>
            <Text style={styles.brandTitleText}>UTH SMART MOBILITY • HỆ THỐNG ĐẶT THUÊ XE XANH</Text>
          </View>

          <View style={styles.switchButtonContainer}>
            <TouchableOpacity
              style={[styles.switchBtn, viewMode === 'MOBILE' && styles.switchBtnActive]}
              onPress={() => setViewMode('MOBILE')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={14}
                color={viewMode === 'MOBILE' ? '#DF8268' : '#7A6A63'}
              />
              <Text style={[styles.switchBtnText, viewMode === 'MOBILE' && styles.switchBtnTextActive]}>
                Tỉ lệ Điện thoại (Chuẩn App)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchBtn, viewMode === 'EXPANDED' && styles.switchBtnActive]}
              onPress={() => setViewMode('EXPANDED')}
            >
              <Ionicons
                name="laptop-outline"
                size={14}
                color={viewMode === 'EXPANDED' ? '#DF8268' : '#7A6A63'}
              />
              <Text style={[styles.switchBtnText, viewMode === 'EXPANDED' && styles.switchBtnTextActive]}>
                Giao diện Web Mở rộng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main App Container */}
      <View
        style={[
          styles.mainAppWrapper,
          isPhoneMockup && styles.phoneDeviceFrame,
          isDesktop && viewMode === 'EXPANDED' && styles.expandedDeviceFrame
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />

          {/* Screen Body */}
          <View style={styles.screenBody}>
            {renderContent()}
          </View>

          {/* Clear, Labeled Bottom Navigation Bar (Never overlaps content) */}
          <View style={styles.bottomNavContainer}>
            <View style={styles.capsuleNav}>
              {/* 1. Trang chủ */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('HOME')}
                activeOpacity={0.85}
              >
                <View style={[styles.iconPill, currentTab === 'HOME' && styles.iconPillActive]}>
                  <Ionicons
                    name={currentTab === 'HOME' ? 'compass' : 'compass-outline'}
                    size={20}
                    color={currentTab === 'HOME' ? '#DF8268' : '#8C7A70'}
                  />
                </View>
                <Text style={[styles.navLabel, currentTab === 'HOME' && styles.navLabelActive]}>
                  Trang chủ
                </Text>
              </TouchableOpacity>

              {/* 2. Bản đồ Hub */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('MAP')}
                activeOpacity={0.85}
              >
                <View style={[styles.iconPill, currentTab === 'MAP' && styles.iconPillActiveBlue]}>
                  <Ionicons
                    name={currentTab === 'MAP' ? 'location' : 'location-outline'}
                    size={20}
                    color={currentTab === 'MAP' ? '#6E92B5' : '#8C7A70'}
                  />
                </View>
                <Text style={[styles.navLabel, currentTab === 'MAP' && styles.navLabelActiveBlue]}>
                  Trạm Hub
                </Text>
              </TouchableOpacity>

              {/* 3. Chìa khóa số (Center Prominent Action) */}
              <TouchableOpacity
                style={styles.centerKeyTabItem}
                onPress={() => setCurrentTab('KEY')}
                activeOpacity={0.9}
              >
                <View style={[styles.centerKeyOuter, currentTab === 'KEY' && styles.centerKeyOuterActive]}>
                  <Ionicons name="key" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.navLabelCenter, currentTab === 'KEY' && styles.navLabelActive]}>
                  Khóa số
                </Text>
              </TouchableOpacity>

              {/* 4. Chuyến đi */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('TRIPS')}
                activeOpacity={0.85}
              >
                <View style={[styles.iconPill, currentTab === 'TRIPS' && styles.iconPillActive]}>
                  <Ionicons
                    name={currentTab === 'TRIPS' ? 'document-text' : 'document-text-outline'}
                    size={20}
                    color={currentTab === 'TRIPS' ? '#DF8268' : '#8C7A70'}
                  />
                </View>
                <Text style={[styles.navLabel, currentTab === 'TRIPS' && styles.navLabelActive]}>
                  Chuyến đi
                </Text>
              </TouchableOpacity>

              {/* 5. Tài khoản */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('PROFILE')}
                activeOpacity={0.85}
              >
                <View style={[styles.iconPill, currentTab === 'PROFILE' && styles.iconPillActiveBlue]}>
                  <Ionicons
                    name={currentTab === 'PROFILE' ? 'person' : 'person-outline'}
                    size={20}
                    color={currentTab === 'PROFILE' ? '#6E92B5' : '#8C7A70'}
                  />
                </View>
                <Text style={[styles.navLabel, currentTab === 'PROFILE' && styles.navLabelActiveBlue]}>
                  Tài khoản
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Rewards & Voucher Modal */}
      <Modal visible={showRewardsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rewardsModalBox}>
            <View style={styles.rewardsIconBadge}>
              <Ionicons name="gift" size={28} color="#DF8268" />
            </View>
            <Text style={styles.rewardsTitle}>HỘI VIÊN XANH • ƯU ĐÃI ĐẶT XE</Text>
            <Text style={styles.rewardsSub}>
              Bạn đang có 120 điểm Eco • Đã tiết kiệm 18.5 kg CO₂ trong tháng này
            </Text>

            <View style={styles.rewardsCardPill}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pillLabel}>Mã giảm giá tự động</Text>
                <Text style={styles.pillVal}>Giảm 20% thuê xe điện theo giờ</Text>
              </View>
              <View style={styles.applyTag}>
                <Text style={styles.applyTagText}>Đã áp dụng</Text>
              </View>
            </View>

            <View style={styles.rewardsCardPill}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pillLabel}>Đặc quyền sinh viên & giảng viên UTH</Text>
                <Text style={[styles.pillVal, { color: '#6E92B5' }]}>Miễn 100% tiền cọc thế chấp</Text>
              </View>
              <View style={styles.applyTag}>
                <Text style={styles.applyTagText}>Đã kích hoạt</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeRewardsBtn}
              onPress={() => setShowRewardsModal(false)}
            >
              <Text style={styles.closeRewardsBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopBackdrop: {
    flex: 1,
    backgroundColor: '#E5D8CE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12
  },
  mobileRoot: {
    flex: 1,
    backgroundColor: '#EFE5DC'
  },
  desktopSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1080,
    marginBottom: 10,
    paddingHorizontal: 16
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandIconMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  brandTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C221E',
    letterSpacing: 0.5
  },
  switchButtonContainer: {
    flexDirection: 'row',
    backgroundColor: '#DFD1C5',
    borderRadius: 20,
    padding: 3,
    gap: 4
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6
  },
  switchBtnActive: {
    backgroundColor: '#FDFBF7',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A6A63'
  },
  switchBtnTextActive: {
    color: '#2C221E',
    fontWeight: '800'
  },
  mainAppWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#EFE5DC'
  },
  phoneDeviceFrame: {
    width: 430,
    height: '92vh',
    maxHeight: 900,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 7,
    borderColor: '#FDFBF7',
    shadowColor: '#6E503E',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 16
  },
  expandedDeviceFrame: {
    maxWidth: 1080,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FDFBF7',
    shadowColor: '#6E503E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 10
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#EFE5DC'
  },
  screenBody: {
    flex: 1,
    width: '100%'
  },
  bottomNavContainer: {
    backgroundColor: '#FDFBF7',
    borderTopWidth: 1,
    borderTopColor: '#E6D9CE',
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 8,
    shadowColor: '#5C4438',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10
  },
  capsuleNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%'
  },
  navTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2
  },
  iconPill: {
    width: 40,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  iconPillActive: {
    backgroundColor: '#FCEEE9'
  },
  iconPillActiveBlue: {
    backgroundColor: '#EBF2F8'
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8C7A70'
  },
  navLabelActive: {
    color: '#DF8268',
    fontWeight: '800'
  },
  navLabelActiveBlue: {
    color: '#6E92B5',
    fontWeight: '800'
  },
  centerKeyTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16
  },
  centerKeyOuter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DF8268',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FDFBF7',
    shadowColor: '#DF8268',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 2
  },
  centerKeyOuterActive: {
    backgroundColor: '#6E92B5',
    shadowColor: '#6E92B5'
  },
  navLabelCenter: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5C4B43'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 34, 30, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  rewardsModalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FDFBF7',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#2C221E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 12
  },
  rewardsIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FCEEE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  rewardsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2C221E',
    marginBottom: 6,
    letterSpacing: 0.4
  },
  rewardsSub: {
    fontSize: 12,
    color: '#7A6A63',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '600'
  },
  rewardsCardPill: {
    width: '100%',
    backgroundColor: '#F6F0E8',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 10
  },
  pillLabel: {
    fontSize: 11,
    color: '#7A6A63',
    fontWeight: '600'
  },
  pillVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DF8268',
    marginTop: 2
  },
  applyTag: {
    backgroundColor: '#EBF2F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  applyTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#527394'
  },
  closeRewardsBtn: {
    width: '100%',
    backgroundColor: '#DF8268',
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 6
  },
  closeRewardsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
