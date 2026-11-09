import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  useWindowDimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/styles/theme';

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
        return <HomeScreen onNavigateToKey={() => setCurrentTab('KEY')} />;
      case 'MAP':
        return <MapScreen onSelectVehicle={() => setCurrentTab('HOME')} />;
      case 'KEY':
        return <DigitalKeyScreen />;
      case 'TRIPS':
        return <TripsHistoryScreen onNavigateToKey={() => setCurrentTab('KEY')} />;
      case 'PROFILE':
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigateToKey={() => setCurrentTab('KEY')} />;
    }
  };

  return (
    <View style={isDesktop ? styles.desktopBackdrop : styles.mobileRoot}>
      {/* Desktop Mode Switcher Bar */}
      {isDesktop && (
        <View style={styles.desktopSwitcherBar}>
          <View style={styles.brandBadge}>
            <View style={styles.brandIconMini}>
              <Ionicons name="leaf" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitleText}>GREEN SM MOBILITY • UTH ITS</Text>
          </View>

          <View style={styles.switchButtonContainer}>
            <TouchableOpacity
              style={[styles.switchBtn, viewMode === 'MOBILE' && styles.switchBtnActive]}
              onPress={() => setViewMode('MOBILE')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={14}
                color={viewMode === 'MOBILE' ? '#00BFA5' : '#64748B'}
              />
              <Text style={[styles.switchBtnText, viewMode === 'MOBILE' && styles.switchBtnTextActive]}>
                Mô phỏng Điện thoại (Chuẩn Green SM)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchBtn, viewMode === 'EXPANDED' && styles.switchBtnActive]}
              onPress={() => setViewMode('EXPANDED')}
            >
              <Ionicons
                name="laptop-outline"
                size={14}
                color={viewMode === 'EXPANDED' ? '#00BFA5' : '#64748B'}
              />
              <Text style={[styles.switchBtnText, viewMode === 'EXPANDED' && styles.switchBtnTextActive]}>
                Giao diện Rộng (Desktop)
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
        {/* Dynamic Island / Notch on Desktop Phone Simulator */}
        {isPhoneMockup && (
          <View style={styles.phoneDynamicIsland}>
            <View style={styles.islandCamera} />
            <View style={styles.islandSpeaker} />
          </View>
        )}

        <SafeAreaView style={[styles.safeArea, currentTab === 'KEY' && styles.safeAreaDark]}>
          <StatusBar barStyle={currentTab === 'KEY' ? 'light-content' : 'dark-content'} />

          {/* Screen Body */}
          <View style={styles.screenBody}>
            {renderContent()}
          </View>

          {/* Authentic Green SM Floating Capsule Bottom Navigation Bar */}
          <View style={styles.bottomNavWrapper}>
            <View style={[styles.capsuleNav, currentTab === 'KEY' && styles.capsuleNavDark]}>
              {/* Home Tab */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('HOME')}
                activeOpacity={0.8}
              >
                {currentTab === 'HOME' ? (
                  <View style={styles.activeGlowingCircle}>
                    <Ionicons name="home" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <Ionicons name="home-outline" size={22} color="#94A3B8" />
                )}
              </TouchableOpacity>

              {/* Map Hub Tab */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('MAP')}
                activeOpacity={0.8}
              >
                {currentTab === 'MAP' ? (
                  <View style={styles.activeGlowingCircle}>
                    <Ionicons name="map" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <Ionicons name="map-outline" size={22} color="#94A3B8" />
                )}
              </TouchableOpacity>

              {/* Center Digital Key Cockpit Tab */}
              <TouchableOpacity
                style={styles.centerKeyTabItem}
                onPress={() => setCurrentTab('KEY')}
                activeOpacity={0.85}
              >
                <View style={[styles.centerKeyBubble, currentTab === 'KEY' && styles.centerKeyBubbleActive]}>
                  <Ionicons name="key" size={22} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Trips History Tab */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('TRIPS')}
                activeOpacity={0.8}
              >
                {currentTab === 'TRIPS' ? (
                  <View style={styles.activeGlowingCircle}>
                    <Ionicons name="time" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <Ionicons name="time-outline" size={22} color="#94A3B8" />
                )}
              </TouchableOpacity>

              {/* Profile Account Tab */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('PROFILE')}
                activeOpacity={0.8}
              >
                {currentTab === 'PROFILE' ? (
                  <View style={styles.activeGlowingCircle}>
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </View>
                ) : (
                  <Ionicons name="person-outline" size={22} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Signature Floating Green SM Golden Trophy (Rewards / Hội Viên) */}
            <TouchableOpacity
              style={styles.floatingTrophyBtn}
              activeOpacity={0.85}
              onPress={() => setShowRewardsModal(true)}
            >
              <Text style={{ fontSize: 20 }}>🏆</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Rewards / Eco-Points Popup Modal */}
      <Modal visible={showRewardsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rewardsModalBox}>
            <View style={styles.trophyHeaderIcon}>
              <Text style={{ fontSize: 36 }}>🏆</Text>
            </View>
            <Text style={styles.rewardsTitle}>HỘI VIÊN GREEN SM ELITE</Text>
            <Text style={styles.rewardsSub}>
              Tích lũy 120 điểm Xanh • Giảm 18.5 kg CO₂ trong tháng này
            </Text>

            <View style={styles.rewardsCardPill}>
              <View>
                <Text style={styles.pillLabel}>Voucher giảm giá</Text>
                <Text style={styles.pillVal}>-20% cho chuyến kế tiếp</Text>
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
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14
  },
  mobileRoot: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  desktopSwitcherBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 900,
    marginBottom: 10,
    paddingHorizontal: 16
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandIconMini: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#00BFA5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5
  },
  switchButtonContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  switchBtnTextActive: {
    color: '#00BFA5',
    fontWeight: '700'
  },
  mainAppWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFC'
  },
  phoneDeviceFrame: {
    width: 420,
    height: '92vh',
    maxHeight: 890,
    borderRadius: 42,
    overflow: 'hidden',
    borderWidth: 9,
    borderColor: '#1E293B',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 16,
    position: 'relative'
  },
  expandedDeviceFrame: {
    maxWidth: 1100,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  phoneDynamicIsland: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 110,
    height: 24,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14
  },
  islandCamera: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#1E293B'
  },
  islandSpeaker: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155'
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  safeAreaDark: {
    backgroundColor: '#0F172A'
  },
  screenBody: {
    flex: 1,
    width: '100%'
  },
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 200
  },
  capsuleNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    height: 58,
    borderRadius: 29,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 10
  },
  capsuleNavDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155'
  },
  navTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44
  },
  activeGlowingCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#00BFA5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.38,
    shadowRadius: 6,
    elevation: 4
  },
  centerKeyTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16
  },
  centerKeyBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00BFA5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  centerKeyBubbleActive: {
    backgroundColor: '#008E7B'
  },
  floatingTrophyBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  rewardsModalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12
  },
  trophyHeaderIcon: {
    marginBottom: 10
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: 0.5
  },
  rewardsSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  rewardsCardPill: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18
  },
  pillLabel: {
    fontSize: 11,
    color: '#64748B'
  },
  pillVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00BFA5',
    marginTop: 2
  },
  applyTag: {
    backgroundColor: '#E0F7F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  applyTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#008E7B'
  },
  closeRewardsBtn: {
    width: '100%',
    backgroundColor: '#00BFA5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  closeRewardsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
