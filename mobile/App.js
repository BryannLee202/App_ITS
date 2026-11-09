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
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from './src/styles/theme';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DigitalKeyScreen from './src/screens/DigitalKeyScreen';
import TripsHistoryScreen from './src/screens/TripsHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Unified 5-Tab Dock for EcoGo Smart (Center Elevated BLE Smart Key)
const DOCK_TABS = [
  { id: 'HOME', icon: 'compass-outline', activeIcon: 'compass', label: 'Khám phá' },
  { id: 'MAP', icon: 'map-outline', activeIcon: 'map', label: 'Bản đồ Hub' },
  { id: 'KEY', icon: 'key', activeIcon: 'key', label: 'Khóa BLE', isCenterKey: true },
  { id: 'TRIPS', icon: 'receipt-outline', activeIcon: 'receipt', label: 'Hành trình' },
  { id: 'PROFILE', icon: 'person-outline', activeIcon: 'person', label: 'Tài khoản' }
];

const ECOGO_RACE_BADGES = [
  {
    id: 'badge_10_trips',
    title: 'Chứng nhận\n10 Chuyến Xanh',
    outerColor: '#86EFAC',
    innerBg: '#EAF6F0',
    icon: 'car-sport',
    iconColor: '#2E7D5B',
    progress: '3/10 chuyến'
  },
  {
    id: 'badge_plastic',
    title: 'Chứng nhận\nGiảm Phát Thải CO₂',
    outerColor: '#FCD34D',
    innerBg: '#FFFBEB',
    icon: 'leaf',
    iconColor: '#2E7D5B',
    progress: '42.8 kg CO₂'
  },
  {
    id: 'badge_ocean',
    title: 'Chứng nhận\nLàn Sóng Xanh ITS',
    outerColor: '#6EE7B7',
    innerBg: '#ECFDF5',
    icon: 'speedometer',
    iconColor: '#047857',
    progress: '50 km GLOSA'
  },
  {
    id: 'badge_forest',
    title: 'Chứng nhận\nBảo Tồn Rừng Xanh',
    outerColor: '#4ADE80',
    innerBg: '#F0FDF4',
    icon: 'earth',
    iconColor: '#15803D',
    progress: '150 km xanh'
  },
  {
    id: 'badge_polar',
    title: 'Chứng nhận\nĐại Sứ Net-Zero UTH',
    outerColor: '#FBBF24',
    innerBg: '#FEF3C7',
    icon: 'ribbon',
    iconColor: '#B45309',
    progress: '500 km xanh'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showGreenRaceModal, setShowGreenRaceModal] = useState(false);
  const [showGreenRaceTerms, setShowGreenRaceTerms] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [viewMode, setViewMode] = useState('PHONE'); // 'PHONE' | 'WIDE'

  const { width: windowWidth } = useWindowDimensions();
  const isDesktopBrowser = Platform.OS === 'web' && windowWidth >= 768;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const id = 'google-font-plus-jakarta';
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href =
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap';
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
            onOpenGreenRace={() => setShowGreenRaceModal(true)}
          />
        );
      case 'MAP':
        return <MapScreen onNavigateToKey={() => setActiveTab('KEY')} />;
      case 'KEY':
        return <DigitalKeyScreen onNavigateHome={() => setActiveTab('HOME')} />;
      case 'TRIPS':
        return <TripsHistoryScreen onNavigateToKey={() => setActiveTab('KEY')} />;
      case 'PROFILE':
        return (
          <ProfileScreen
            onOpenGreenRace={() => setShowGreenRaceModal(true)}
            onOpenRewards={() => setShowRewardsModal(true)}
            onNavigateToMap={() => setActiveTab('MAP')}
          />
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.outerViewport}>
      <StatusBar barStyle="dark-content" backgroundColor="#EAF6F0" />

      {/* Top Mode Switcher on Desktop Browser */}
      {isDesktopBrowser && (
        <View style={styles.desktopToolbar}>
          <View style={styles.toolbarBrand}>
            <View style={styles.statusDot} />
            <Text style={styles.toolbarTitle}>ECOGO SMART · Thuê xe tự động 24/7 (UTH)</Text>
          </View>

          <View style={styles.modeToggleGroup}>
            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'PHONE' && styles.modeBtnActive]}
              onPress={() => setViewMode('PHONE')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={13}
                color={viewMode === 'PHONE' ? '#2E7D5B' : '#64748B'}
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
                color={viewMode === 'WIDE' ? '#2E7D5B' : '#64748B'}
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

          {/* =========================================================================
              ORIGINAL ECOGO SMART UNIFIED FLOATING DOCK (5 TABS + CENTER SMART KEY)
             ========================================================================= */}
          <View style={styles.floatingBottomDock} pointerEvents="box-none">
            <View style={styles.unifiedGlassDock}>
              {DOCK_TABS.map((tab) => {
                const isActive = activeTab === tab.id;

                if (tab.isCenterKey) {
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      style={styles.centerKeySlot}
                      activeOpacity={0.88}
                      onPress={() => setActiveTab('KEY')}
                    >
                      <View
                        style={[
                          styles.centerKeyCircle,
                          isActive && styles.centerKeyCircleActive
                        ]}
                      >
                        <Ionicons name="key" size={22} color="#FFFFFF" />
                      </View>
                      <Text
                        style={[
                          styles.dockTabLabel,
                          { marginTop: 3 },
                          isActive && styles.dockTabLabelActive
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={styles.dockTabBtn}
                    activeOpacity={0.8}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    <View
                      style={[
                        styles.dockIconPill,
                        isActive && styles.dockIconPillActive
                      ]}
                    >
                      <Ionicons
                        name={isActive ? tab.activeIcon : tab.icon}
                        size={20}
                        color={isActive ? '#2E7D5B' : '#64748B'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.dockTabLabel,
                        isActive && styles.dockTabLabelActive
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* =========================================================================
          MODAL 1: ECOGO RACE ESG GAMIFICATION MODAL
         ========================================================================= */}
      <Modal
        visible={showGreenRaceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGreenRaceModal(false)}
      >
        <View style={styles.greenRaceOverlay}>
          <View style={styles.greenRaceScreen}>
            <View style={styles.grHeader}>
              <TouchableOpacity
                style={styles.grBackBtn}
                onPress={() => {
                  setShowLeaderboard(false);
                  setShowGreenRaceModal(false);
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#18221D" />
              </TouchableOpacity>

              <View style={styles.grTitleWrap}>
                <Ionicons name="leaf" size={18} color="#2E7D5B" style={{ transform: [{ scaleX: -1 }] }} />
                <Text style={styles.grTitleText}>ECOGO RACE</Text>
                <Ionicons name="leaf" size={18} color="#2E7D5B" />
              </View>

              <TouchableOpacity
                style={styles.grMoreBtn}
                onPress={() => setShowGreenRaceTerms(true)}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color="#18221D" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.grScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {!showLeaderboard ? (
                <>
                  <View style={styles.badgesGrid}>
                    {ECOGO_RACE_BADGES.map((badge) => (
                      <TouchableOpacity
                        key={badge.id}
                        style={styles.badgeItem}
                        activeOpacity={0.85}
                        onPress={() => {
                          setShowGreenRaceModal(false);
                          setActiveTab('HOME');
                        }}
                      >
                        <View style={styles.laurelShieldWrap}>
                          <Ionicons
                            name="leaf-outline"
                            size={24}
                            color="#D97706"
                            style={styles.laurelLeft}
                          />
                          <Ionicons
                            name="leaf-outline"
                            size={24}
                            color="#D97706"
                            style={styles.laurelRight}
                          />

                          <View
                            style={[
                              styles.shieldOuter,
                              { borderColor: badge.outerColor, backgroundColor: badge.innerBg }
                            ]}
                          >
                            <View style={styles.shieldInner}>
                              <Ionicons name={badge.icon} size={26} color={badge.iconColor} />
                            </View>
                          </View>

                          <View style={styles.shieldRibbon}>
                            <Text style={styles.shieldRibbonText}>{badge.progress}</Text>
                          </View>
                        </View>

                        <Text style={styles.badgeTitleText}>{badge.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.grProgressBanner}>
                    <View style={styles.grSeedlingTag}>
                      <Ionicons name="leaf" size={14} color="#FFF" />
                      <Text style={styles.grSeedlingTagText}>Hạng hiện tại: Người Ươm Mầm (340 EcoPts)</Text>
                    </View>
                    <Text style={styles.grProgressSub}>
                      Hoàn thành các chuyến thuê xe tự lái tại hệ thống trạm EcoGo Smart (UTH) để mở khóa
                      trọn bộ chứng nhận ESG và nhận ưu đãi giảm giá trực tiếp.
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.leaderboardBox}>
                  <Text style={styles.lbHeaderTitle}>Bảng Xếp Hạng EcoGo Tháng 11/2026</Text>
                  <Text style={styles.lbHeaderSub}>Top thành viên giảm phát thải CO₂ nhiều nhất</Text>

                  {[
                    { rank: 1, name: 'Nguyễn Hoàng Nam', km: '1,420 km', trees: '68 cây', badge: '🏆' },
                    { rank: 2, name: 'Trần Minh Anh', km: '1,180 km', trees: '54 cây', badge: '🥈' },
                    { rank: 3, name: 'Lê Quốc Bảo', km: '940 km', trees: '42 cây', badge: '🥉' },
                    { rank: 18, name: 'Minh Tài (Bạn)', km: '142 km', trees: '6 cây', badge: '🌱', isMe: true }
                  ].map((row) => (
                    <View
                      key={row.rank}
                      style={[styles.lbRow, row.isMe && styles.lbRowMe]}
                    >
                      <Text style={styles.lbRank}>{row.badge} #{row.rank}</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.lbName, row.isMe && { color: '#2E7D5B', fontWeight: '800' }]}>
                          {row.name}
                        </Text>
                        <Text style={styles.lbMeta}>Tích lũy: {row.km}</Text>
                      </View>
                      <View style={styles.lbTreesPill}>
                        <Text style={styles.lbTreesText}>{row.trees}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.grFooterCtas}>
              <TouchableOpacity
                style={styles.grTurquoiseBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setShowGreenRaceModal(false);
                  setActiveTab('HOME');
                }}
              >
                <Text style={styles.grTurquoiseBtnText}>
                  ĐẶT XE ECOGO ĐỂ MỞ KHÓA CHỨNG NHẬN
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.grGoldBtn}
                activeOpacity={0.85}
                onPress={() => setShowLeaderboard(!showLeaderboard)}
              >
                <View style={styles.grCrownFloating}>
                  <Text style={{ fontSize: 16 }}>👑</Text>
                </View>
                <Text style={styles.grGoldBtnText}>
                  {showLeaderboard ? 'XEM BỘ SƯU TẬP CHỨNG NHẬN' : 'XEM BẢNG XẾP HẠNG THÁNG'}
                </Text>
              </TouchableOpacity>
            </View>

            {showGreenRaceTerms && (
              <TouchableOpacity
                style={styles.grTermsBackdrop}
                activeOpacity={1}
                onPress={() => setShowGreenRaceTerms(false)}
              >
                <View style={styles.grTermsSheet}>
                  <View style={styles.grTermsHandle} />
                  <TouchableOpacity
                    style={styles.grTermsRow}
                    onPress={() => setShowGreenRaceTerms(false)}
                  >
                    <Ionicons name="document-text-outline" size={22} color="#18221D" />
                    <Text style={styles.grTermsRowText}>Xem Thể lệ Chương trình EcoGo Race</Text>
                    <Ionicons name="chevron-forward" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MODAL 2: VOUCHERS & PROMOTIONS MODAL
         ========================================================================= */}
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
                <Text style={styles.rewardsTitle}>Ví Ưu Đãi EcoGo Smart</Text>
                <Text style={styles.rewardsSub}>Áp dụng cho Thuê theo giờ, Thuê theo ngày & Liên tỉnh</Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowRewardsModal(false)}
              >
                <Ionicons name="close" size={18} color="#18221D" />
              </TouchableOpacity>
            </View>

            {[
              {
                code: 'XANH20',
                title: 'Giảm 20% chuyến xe EcoGo (Tối đa 120.000đ)',
                desc: 'Áp dụng cho Hyundai Ioniq 5, Toyota Cross HEV, Mazda CX-5 & Honda CR-V'
              },
              {
                code: 'UTH50K',
                title: 'Giảm 50.000đ tại Trạm ĐH GTVT (UTH)',
                desc: 'Ưu đãi dành cho sinh viên và giảng viên trường ĐH GTVT TP.HCM'
              },
              {
                code: 'FREEDELIVERY',
                title: 'Miễn phí giao nhận xe tận nơi',
                desc: 'Miễn 100% phí giao xe trong bán kính 5km quanh trạm EcoGo Hub'
              }
            ].map((item) => (
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
                    {copiedCode === item.code ? 'Đã lưu' : 'Dùng ngay'}
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
    backgroundColor: '#E4EDE8',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  desktopToolbar: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFEAE3',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D5B'
  },
  toolbarTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#18221D'
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F0F5F2',
    padding: 3,
    borderRadius: 10,
    gap: 4
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
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
    color: '#64748B'
  },
  modeBtnTextActive: {
    color: '#2E7D5B',
    fontWeight: '700'
  },
  appShell: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F4F7F5'
  },
  phoneSimulatorShell: {
    width: 414,
    maxWidth: '100%',
    marginVertical: 12,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 12
  },
  wideWebShell: {
    maxWidth: 1024,
    width: '100%'
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F5',
    position: 'relative'
  },
  mainContentArea: {
    flex: 1
  },

  /* =========================================================================
     UNIFIED FLOATING GLASS DOCK (5 TABS + CENTER SMART KEY)
     ========================================================================= */
  floatingBottomDock: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    zIndex: 50
  },
  unifiedGlassDock: {
    height: 66,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#E2ECE7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    shadowColor: '#143326',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 8
  },
  dockTabBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dockIconPill: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dockIconPillActive: {
    backgroundColor: '#EAF6F0'
  },
  dockTabLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2
  },
  dockTabLabelActive: {
    color: '#2E7D5B',
    fontWeight: '800'
  },
  centerKeySlot: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18
  },
  centerKeyCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D5B',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },
  centerKeyCircleActive: {
    backgroundColor: '#1E563F',
    borderColor: '#A7F3D0'
  },

  /* =========================================================================
     ECOGO RACE MODAL STYLES
     ========================================================================= */
  greenRaceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  greenRaceScreen: {
    width: '100%',
    maxWidth: 414,
    height: '100%',
    backgroundColor: '#F2F9F5',
    justifyContent: 'space-between',
    position: 'relative'
  },
  grHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#E3F3EA'
  },
  grBackBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  grTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  grTitleText: {
    fontFamily: FONTS.family,
    fontSize: 19,
    fontWeight: '800',
    color: '#1E563F',
    letterSpacing: 0.5
  },
  grMoreBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  grScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 22,
    paddingBottom: 24
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 26,
    columnGap: 10
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center'
  },
  laurelShieldWrap: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8
  },
  laurelLeft: {
    position: 'absolute',
    left: -4,
    bottom: 10,
    transform: [{ rotate: '-25deg' }]
  },
  laurelRight: {
    position: 'absolute',
    right: -4,
    bottom: 10,
    transform: [{ scaleX: -1 }, { rotate: '-25deg' }]
  },
  shieldOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  shieldInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shieldRibbon: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  shieldRibbonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800'
  },
  badgeTitleText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#18221D',
    textAlign: 'center',
    lineHeight: 16
  },
  grProgressBanner: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C6EBD8',
    alignItems: 'center'
  },
  grSeedlingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 6,
    marginBottom: 8
  },
  grSeedlingTagText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  grProgressSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#5C6B63',
    textAlign: 'center',
    lineHeight: 18
  },
  leaderboardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C6EBD8'
  },
  lbHeaderTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#18221D',
    textAlign: 'center'
  },
  lbHeaderSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#5C6B63',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F4F7F5',
    marginBottom: 8
  },
  lbRowMe: {
    backgroundColor: '#EAF6F0',
    borderWidth: 1,
    borderColor: '#2E7D5B'
  },
  lbRank: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#18221D',
    width: 48
  },
  lbName: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#18221D'
  },
  lbMeta: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#5C6B63',
    marginTop: 2
  },
  lbTreesPill: {
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99
  },
  lbTreesText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  grFooterCtas: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FDF6EC',
    gap: 12
  },
  grTurquoiseBtn: {
    backgroundColor: '#2E7D5B',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  grTurquoiseBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3
  },
  grGoldBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  grCrownFloating: {
    position: 'absolute',
    top: -10,
    left: -6,
    transform: [{ rotate: '-18deg' }]
  },
  grGoldBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3
  },
  grTermsBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  grTermsSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28
  },
  grTermsHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16
  },
  grTermsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12
  },
  grTermsRowText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '600',
    color: '#18221D'
  },

  /* =========================================================================
     VOUCHERS MODAL STYLES
     ========================================================================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  rewardsModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
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
    fontWeight: '800',
    color: '#18221D'
  },
  rewardsSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#5C6B63',
    marginTop: 2
  },
  closeModalBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3FAF6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#B7E4CE'
  },
  voucherCodeText: {
    fontFamily: FONTS.family,
    color: '#2E7D5B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2
  },
  voucherItemTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#18221D'
  },
  voucherItemDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#5C6B63',
    marginTop: 2
  },
  copyVoucherBtn: {
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  copyVoucherText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
