import React, { useState } from 'react';
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

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DigitalKeyScreen from './src/screens/DigitalKeyScreen';
import TripsHistoryScreen from './src/screens/TripsHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const TABS = [
  { id: 'HOME', label: 'Trang chủ', icon: 'home-outline', activeIcon: 'home' },
  { id: 'MAP', label: 'Bản đồ Hub', icon: 'map-outline', activeIcon: 'map' },
  { id: 'KEY', label: 'Khóa số', icon: 'key-outline', activeIcon: 'key', isCenter: true },
  { id: 'TRIPS', label: 'Chuyến đi', icon: 'document-text-outline', activeIcon: 'document-text' },
  { id: 'PROFILE', label: 'Tài khoản', icon: 'person-outline', activeIcon: 'person' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [viewMode, setViewMode] = useState('PHONE'); // 'PHONE' | 'WIDE'

  const { width: windowWidth } = useWindowDimensions();
  const isDesktopBrowser = Platform.OS === 'web' && windowWidth >= 768;

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

      {/* Top Mode Switcher on Desktop Browser */}
      {isDesktopBrowser && (
        <View style={styles.desktopToolbar}>
          <View style={styles.toolbarBrand}>
            <View style={styles.mintStatusDot} />
            <Text style={styles.toolbarTitle}>
              ITS SMART VEHICLE RENTAL • APPLE WHITE & MINT EDITION
            </Text>
          </View>

          <View style={styles.modeToggleGroup}>
            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'PHONE' && styles.modeBtnActive]}
              onPress={() => setViewMode('PHONE')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={13}
                color={viewMode === 'PHONE' ? '#FFFFFF' : '#4B5563'}
              />
              <Text style={[styles.modeBtnText, viewMode === 'PHONE' && styles.modeBtnTextActive]}>
                Tỉ lệ Điện thoại (414×896)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'WIDE' && styles.modeBtnActive]}
              onPress={() => setViewMode('WIDE')}
            >
              <Ionicons
                name="desktop-outline"
                size={13}
                color={viewMode === 'WIDE' ? '#FFFFFF' : '#4B5563'}
              />
              <Text style={[styles.modeBtnText, viewMode === 'WIDE' && styles.modeBtnTextActive]}>
                Toàn màn hình Web
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

          {/* Apple-Style Docked Bottom Tab Bar */}
          <View style={styles.bottomTabBar}>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;

              if (tab.isCenter) {
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={styles.centerKeyTabWrap}
                    activeOpacity={0.9}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <View style={[styles.centerKeyCircle, isActive && styles.centerKeyCircleActive]}>
                      <Ionicons name="key" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.tabButton}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <View style={[styles.tabIconPill, isActive && styles.tabIconPillActive]}>
                    <Ionicons
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={19}
                      color={isActive ? '#059669' : '#6B7280'}
                    />
                  </View>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </View>

      {/* Voucher & Rewards Modal */}
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
                <Text style={styles.rewardsTag}>KHO VOUCHER XANH ITS</Text>
                <Text style={styles.rewardsTitle}>Ưu Đãi Thuê Xe Tự Lái</Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowRewardsModal(false)}
              >
                <Ionicons name="close" size={18} color="#111827" />
              </TouchableOpacity>
            </View>

            {[
              {
                code: 'XANH20',
                title: 'Giảm 20% Thuê Ô Tô Điện (Tối đa 120K)',
                desc: 'Áp dụng cho VinFast VF 3, VF e34, VF 8 và Hyundai Ioniq 5'
              },
              {
                code: 'UTH50K',
                title: 'Giảm Trực Tiếp 50.000đ Tại Hub UTH',
                desc: 'Dành riêng cho Sinh viên & Giảng viên ĐH GTVT TP.HCM'
              },
              {
                code: 'FREEDELIVERY',
                title: 'Miễn Phí Giao Xe Tận Nơi (Trị giá 50K)',
                desc: 'Giao nhận xe tận nhà trong bán kính 5km quanh 6 trạm ITS Hub'
              }
            ].map(item => (
              <View key={item.code} style={styles.voucherCard}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={styles.voucherCodePill}>
                    <Text style={styles.voucherCodeText}>{item.code}</Text>
                  </View>
                  <Text style={styles.voucherItemTitle}>{item.title}</Text>
                  <Text style={styles.voucherItemDesc}>{item.desc}</Text>
                </View>

                <TouchableOpacity
                  style={styles.copyVoucherBtn}
                  onPress={() => setCopiedCode(item.code)}
                >
                  <Text style={styles.copyVoucherText}>
                    {copiedCode === item.code ? 'Đã lưu' : 'Dùng mã'}
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
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  desktopToolbar: {
    width: '100%',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  mintStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981'
  },
  toolbarTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.4
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 3,
    borderRadius: 10,
    gap: 4
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5
  },
  modeBtnActive: {
    backgroundColor: '#10B981'
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563'
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  appShell: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5F5F7'
  },
  phoneSimulatorShell: {
    width: 420,
    maxWidth: '100%',
    marginVertical: 12,
    borderRadius: 38,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 14
  },
  wideWebShell: {
    maxWidth: 1080,
    width: '100%'
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7'
  },
  mainContentArea: {
    flex: 1
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 66,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 6
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4
  },
  tabIconPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 99
  },
  tabIconPillActive: {
    backgroundColor: '#ECFDF5'
  },
  centerKeyTabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14
  },
  centerKeyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5
  },
  centerKeyCircleActive: {
    backgroundColor: '#10B981'
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2
  },
  tabLabelActive: {
    color: '#059669',
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  rewardsModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  rewardsTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  rewardsTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F2EB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5DEC9'
  },
  voucherCodePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4
  },
  voucherCodeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  voucherItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827'
  },
  voucherItemDesc: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2
  },
  copyVoucherBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981'
  },
  copyVoucherText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669'
  }
});
