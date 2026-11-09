import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from './src/styles/theme';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DigitalKeyScreen from './src/screens/DigitalKeyScreen';
import TripsHistoryScreen from './src/screens/TripsHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const TABS = [
  { id: 'HOME', label: 'Khám phá', icon: 'search-outline', activeIcon: 'search' },
  { id: 'MAP', label: 'Bản đồ', icon: 'map-outline', activeIcon: 'map' },
  { id: 'KEY', label: 'Khóa xe', icon: 'key-outline', activeIcon: 'key' },
  { id: 'TRIPS', label: 'Chuyến đi', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'PROFILE', label: 'Tài khoản', icon: 'person-outline', activeIcon: 'person' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [viewMode, setViewMode] = useState('PHONE'); // 'PHONE' | 'WIDE'

  const { width: windowWidth } = useWindowDimensions();
  const isDesktopBrowser = Platform.OS === 'web' && windowWidth >= 768;

  // Inject Plus Jakarta Sans & Inter on Web for authentic editorial typography
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const id = 'google-font-plus-jakarta';
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap';
        document.head.appendChild(link);
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <HomeScreen
            onNavigateToKey={() => setActiveTab('KEY')}
            onNavigateToMap={() => setActiveTab('MAP')}
            onNavigateToTrips={() => setActiveTab('TRIPS')}
            onNavigateToProfile={() => setActiveTab('PROFILE')}
            onOpenRewards={() => setShowRewardsModal(true)}
          />
        );
      case 'MAP':
        return <MapScreen onNavigateToKey={() => setActiveTab('KEY')} />;
      case 'KEY':
        return <DigitalKeyScreen onNavigateHome={() => setActiveTab('HOME')} />;
      case 'TRIPS':
        return <TripsHistoryScreen onNavigateToKey={() => setActiveTab('KEY')} />;
      case 'PROFILE':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.outerViewport}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Minimalist Top Mode Switcher on Desktop Browser */}
      {isDesktopBrowser && (
        <View style={styles.desktopToolbar}>
          <View style={styles.toolbarBrand}>
            <View style={styles.statusDot} />
            <Text style={styles.toolbarTitle}>ITS Mobility · UTH</Text>
          </View>

          <View style={styles.modeToggleGroup}>
            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'PHONE' && styles.modeBtnActive]}
              onPress={() => setViewMode('PHONE')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={13}
                color={viewMode === 'PHONE' ? '#111111' : '#6E6E73'}
              />
              <Text style={[styles.modeBtnText, viewMode === 'PHONE' && styles.modeBtnTextActive]}>
                Điện thoại
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'WIDE' && styles.modeBtnActive]}
              onPress={() => setViewMode('WIDE')}
            >
              <Ionicons
                name="expand-outline"
                size={13}
                color={viewMode === 'WIDE' ? '#111111' : '#6E6E73'}
              />
              <Text style={[styles.modeBtnText, viewMode === 'WIDE' && styles.modeBtnTextActive]}>
                Mở rộng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main App Shell */}
      <View
        style={[
          styles.appShell,
          isDesktopBrowser && viewMode === 'PHONE' && styles.phoneSimulatorShell,
          isDesktopBrowser && viewMode === 'WIDE' && styles.wideWebShell
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.mainContentArea}>{renderContent()}</View>

          {/* Flat iOS 18 / Uber Style Bottom Tab Bar */}
          <View style={styles.bottomTabBar}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.tabButton}
                  activeOpacity={0.7}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={21}
                    color={isActive ? '#111111' : '#8E8E93'}
                  />
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </View>

      {/* Clean Voucher & Promotions Modal */}
      <Modal
        visible={showRewardsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rewardsModalCard}>
            <View style={styles.rewardsHeader}>
              <View>
                <Text style={styles.rewardsTitle}>Mã ưu đãi hiện có</Text>
                <Text style={styles.rewardsSub}>Áp dụng khi đặt thuê xe tự lái</Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowRewardsModal(false)}
              >
                <Ionicons name="close" size={18} color="#111111" />
              </TouchableOpacity>
            </View>

            {[
              {
                code: 'XANH20',
                title: 'Giảm 20% chuyến xe điện (Tối đa 120.000đ)',
                desc: 'Áp dụng cho VinFast VF 3, VF e34, VF 8 và Hyundai Ioniq 5'
              },
              {
                code: 'UTH50K',
                title: 'Giảm 50.000đ tại Trạm ĐH GTVT (UTH)',
                desc: 'Ưu đãi dành cho sinh viên và giảng viên trường ĐH GTVT TP.HCM'
              },
              {
                code: 'FREEDELIVERY',
                title: 'Miễn phí giao nhận xe tận nơi',
                desc: 'Miễn 100% phí giao xe trong bán kính 5km quanh trạm Hub'
              }
            ].map(item => (
              <View key={item.code} style={styles.voucherCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.voucherCodeText}>{item.code}</Text>
                  <Text style={styles.voucherItemTitle}>{item.title}</Text>
                  <Text style={styles.voucherItemDesc}>{item.desc}</Text>
                </View>

                <TouchableOpacity
                  style={styles.copyVoucherBtn}
                  onPress={() => setCopiedCode(item.code)}
                >
                  <Text style={styles.copyVoucherText}>
                    {copiedCode === item.code ? 'Đã lưu' : 'Sao chép'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerViewport: {
    flex: 1,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  desktopToolbar: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  toolbarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0D9488'
  },
  toolbarTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#111111'
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    padding: 2,
    borderRadius: 8,
    gap: 2
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5
  },
  modeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2
  },
  modeBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: '#6E6E73'
  },
  modeBtnTextActive: {
    color: '#111111',
    fontWeight: '600'
  },
  appShell: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F7F7F9'
  },
  phoneSimulatorShell: {
    width: 414,
    maxWidth: '100%',
    marginVertical: 14,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#DCDCE0',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 10
  },
  wideWebShell: {
    maxWidth: 1024,
    width: '100%'
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F9'
  },
  mainContentArea: {
    flex: 1
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBEBED',
    paddingHorizontal: 4
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6
  },
  tabLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 3
  },
  tabLabelActive: {
    color: '#111111',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  rewardsModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  rewardsTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#111111'
  },
  rewardsSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
  },
  closeModalBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBEBED'
  },
  voucherCodeText: {
    fontFamily: FONTS.family,
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2
  },
  voucherItemTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#111111'
  },
  voucherItemDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 2
  },
  copyVoucherBtn: {
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  copyVoucherText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
