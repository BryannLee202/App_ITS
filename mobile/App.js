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
              <View style={styles.brandInnerDot} />
            </View>
            <Text style={styles.brandTitleText}>SOOT • ITS TACTILE MOBILITY</Text>
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
                Khung Điện thoại (3D Soft UI)
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
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />

          {/* Screen Body */}
          <View style={styles.screenBody}>
            {renderContent()}
          </View>

          {/* Tactile Soft Neumorphic Bottom Capsule Navigation Bar */}
          <View style={styles.bottomNavWrapper}>
            <View style={styles.capsuleNav}>
              {/* Home Tab */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('HOME')}
                activeOpacity={0.85}
              >
                {currentTab === 'HOME' ? (
                  <View style={styles.activeTactileKnob}>
                    <View style={styles.activeKnobCore}>
                      <Ionicons name="home" size={16} color="#DF8268" />
                    </View>
                  </View>
                ) : (
                  <Ionicons name="home-outline" size={20} color="#8C7A70" />
                )}
              </TouchableOpacity>

              {/* Map Hub Tab */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('MAP')}
                activeOpacity={0.85}
              >
                {currentTab === 'MAP' ? (
                  <View style={styles.activeTactileKnob}>
                    <View style={styles.activeKnobCore}>
                      <Ionicons name="map" size={16} color="#6E92B5" />
                    </View>
                  </View>
                ) : (
                  <Ionicons name="map-outline" size={20} color="#8C7A70" />
                )}
              </TouchableOpacity>

              {/* Center 3D Extruded Digital Key Dial */}
              <TouchableOpacity
                style={styles.centerKeyTabItem}
                onPress={() => setCurrentTab('KEY')}
                activeOpacity={0.88}
              >
                <View style={[styles.centerKeyOuterPlate, currentTab === 'KEY' && styles.centerKeyActivePlate]}>
                  <View style={styles.centerKeyInnerSphere}>
                    <Ionicons name="key" size={18} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Trips History Tab */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('TRIPS')}
                activeOpacity={0.85}
              >
                {currentTab === 'TRIPS' ? (
                  <View style={styles.activeTactileKnob}>
                    <View style={styles.activeKnobCore}>
                      <Ionicons name="time" size={16} color="#DF8268" />
                    </View>
                  </View>
                ) : (
                  <Ionicons name="time-outline" size={20} color="#8C7A70" />
                )}
              </TouchableOpacity>

              {/* Profile Account Tab */}
              <TouchableOpacity
                style={styles.navTabItem}
                onPress={() => setCurrentTab('PROFILE')}
                activeOpacity={0.85}
              >
                {currentTab === 'PROFILE' ? (
                  <View style={styles.activeTactileKnob}>
                    <View style={styles.activeKnobCore}>
                      <Ionicons name="person" size={16} color="#6E92B5" />
                    </View>
                  </View>
                ) : (
                  <Ionicons name="person-outline" size={20} color="#8C7A70" />
                )}
              </TouchableOpacity>
            </View>

            {/* Right Floating 3D Petal Dial Button (Matches middle-right circle in reference image) */}
            <TouchableOpacity
              style={styles.floatingPetalWheelBtn}
              activeOpacity={0.88}
              onPress={() => setShowRewardsModal(true)}
            >
              <View style={styles.petalInnerPlate}>
                <View style={styles.petalBlueSlice} />
                <View style={styles.petalPeachSlice} />
                <View style={styles.petalCenterDot} />
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Tactile Soft UI Eco-Rewards Modal */}
      <Modal visible={showRewardsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rewardsModalBox}>
            <View style={styles.modalPetalBadge}>
              <View style={styles.petalBlueSlice} />
              <View style={styles.petalPeachSlice} />
              <View style={styles.petalCenterDot} />
            </View>
            <Text style={styles.rewardsTitle}>HỘI VIÊN XANH • SOOT ELITE</Text>
            <Text style={styles.rewardsSub}>
              Tích lũy 120 điểm Eco • Tiết kiệm 18.5 kg CO₂ trong tháng
            </Text>

            <View style={styles.rewardsCardPill}>
              <View>
                <Text style={styles.pillLabel}>Ưu đãi khả dụng</Text>
                <Text style={styles.pillVal}>Giảm 20% phí thuê xe điện</Text>
              </View>
              <View style={styles.applyTag}>
                <Text style={styles.applyTagText}>Đang bật</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeRewardsBtn}
              onPress={() => setShowRewardsModal(false)}
            >
              <Text style={styles.closeRewardsBtnText}>Đóng bảng</Text>
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
    paddingVertical: 14
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
    maxWidth: 900,
    marginBottom: 12,
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
    borderRadius: 13,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5
  },
  brandInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DF8268'
  },
  brandTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2C221E',
    letterSpacing: 1
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
    width: 425,
    height: '92vh',
    maxHeight: 890,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#FDFBF7',
    shadowColor: '#6E503E',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 18,
    position: 'relative'
  },
  expandedDeviceFrame: {
    maxWidth: 1100,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FDFBF7',
    shadowColor: '#6E503E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
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
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
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
    backgroundColor: '#FDFBF7',
    height: 62,
    borderRadius: 31,
    paddingHorizontal: 8,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10
  },
  navTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46
  },
  activeTactileKnob: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5C2AF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DF8268',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  activeKnobCore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3
  },
  centerKeyTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16
  },
  centerKeyOuterPlate: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6
  },
  centerKeyActivePlate: {
    backgroundColor: '#F5C2AF'
  },
  centerKeyInnerSphere: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DF8268',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DF8268',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5
  },
  floatingPetalWheelBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#7A5C49',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8
  },
  petalInnerPlate: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5EFE8',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  petalBlueSlice: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '52%',
    backgroundColor: '#6E92B5'
  },
  petalPeachSlice: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '52%',
    backgroundColor: '#F5BFA9'
  },
  petalCenterDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FDFBF7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3
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
    maxWidth: 360,
    backgroundColor: '#FDFBF7',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#2C221E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 12
  },
  modalPetalBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  rewardsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2C221E',
    marginBottom: 6,
    letterSpacing: 0.6
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
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 18
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
    borderRadius: 20,
    alignItems: 'center'
  },
  closeRewardsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
