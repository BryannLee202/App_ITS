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
import { FONTS, THEME_PRESETS } from './src/styles/theme';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DigitalKeyScreen from './src/screens/DigitalKeyScreen';
import TripsHistoryScreen from './src/screens/TripsHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const DOCK_TABS = [
  { id: 'HOME', icon: 'search-outline', activeIcon: 'search', label: 'Khám phá' },
  { id: 'MAP', icon: 'map-outline', activeIcon: 'map', label: 'Bản đồ' },
  { id: 'KEY', icon: 'key-outline', activeIcon: 'key', label: 'Khóa xe', isCenterKey: true },
  { id: 'TRIPS', icon: 'calendar-outline', activeIcon: 'calendar', label: 'Chuyến đi' },
  { id: 'PROFILE', icon: 'person-outline', activeIcon: 'person', label: 'Tài khoản' }
];

const ECOGO_RACE_BADGES = [
  {
    id: 'badge_10_trips',
    title: 'Chứng nhận\n10 Chuyến Xanh',
    outerColor: '#38D9A9',
    innerBg: '#EBFBF5',
    icon: 'car-sport',
    iconColor: '#0CA678',
    progress: '3/10 chuyến'
  },
  {
    id: 'badge_plastic',
    title: 'Chứng nhận\nGiảm Phát Thải CO₂',
    outerColor: '#FBBF24',
    innerBg: '#FFFBEB',
    icon: 'leaf',
    iconColor: '#D97706',
    progress: '42.8 kg CO₂'
  },
  {
    id: 'badge_ocean',
    title: 'Chứng nhận\nLàn Sóng Xanh ITS',
    outerColor: '#38BDF8',
    innerBg: '#F0F9FF',
    icon: 'speedometer',
    iconColor: '#0284C7',
    progress: '50 km GLOSA'
  },
  {
    id: 'badge_forest',
    title: 'Chứng nhận\nDi Chuyển Thông Minh',
    outerColor: '#818CF8',
    innerBg: '#EEF2FF',
    icon: 'earth',
    iconColor: '#4F46E5',
    progress: '150 km xanh'
  },
  {
    id: 'badge_polar',
    title: 'Chứng nhận\nĐại Sứ EcoGo UTH',
    outerColor: '#F59E0B',
    innerBg: '#FEF3C7',
    icon: 'ribbon',
    iconColor: '#B45309',
    progress: '500 km xanh'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [themeKey, setThemeKey] = useState('MINT'); // 'MINT' | 'MONOCHROME' | 'TERRACOTTA' | 'SKY'
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showGreenRaceModal, setShowGreenRaceModal] = useState(false);
  const [showGreenRaceTerms, setShowGreenRaceTerms] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [viewMode, setViewMode] = useState('PHONE'); // 'PHONE' | 'WIDE'

  const theme = THEME_PRESETS[themeKey] || THEME_PRESETS.MINT;

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
      const styleId = 'ecogo-clean-focus';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
          * { -webkit-tap-highlight-color: transparent; }
          *:focus, *:focus-visible { outline: none !important; }
        `;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <HomeScreen
            theme={theme}
            onNavigateToKey={() => setActiveTab('KEY')}
            onNavigateToMap={() => setActiveTab('MAP')}
            onNavigateToTrips={() => setActiveTab('TRIPS')}
            onNavigateToProfile={() => setActiveTab('PROFILE')}
            onOpenRewards={() => setShowRewardsModal(true)}
            onOpenGreenRace={() => setShowGreenRaceModal(true)}
          />
        );
      case 'MAP':
        return <MapScreen theme={theme} onNavigateToKey={() => setActiveTab('KEY')} />;
      case 'KEY':
        return <DigitalKeyScreen theme={theme} onNavigateHome={() => setActiveTab('HOME')} />;
      case 'TRIPS':
        return <TripsHistoryScreen theme={theme} onNavigateToKey={() => setActiveTab('KEY')} />;
      case 'PROFILE':
        return (
          <ProfileScreen
            theme={theme}
            onOpenGreenRace={() => setShowGreenRaceModal(true)}
            onOpenRewards={() => setShowRewardsModal(true)}
            onNavigateToMap={() => setActiveTab('MAP')}
          />
        );
      default:
        return <HomeScreen theme={theme} />;
    }
  };

  return (
    <View style={styles.outerViewport}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Mode & Live Color Switcher on Desktop Browser */}
      {isDesktopBrowser && (
        <View style={styles.desktopToolbar}>
          <View style={styles.toolbarBrand}>
            <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
            <Text style={styles.toolbarTitle}>ECOGO SMART · Thuê xe tự động 24/7 (UTH)</Text>
          </View>

          {/* 4-Color Live Theme Switcher */}
          <View style={styles.themePickerRow}>
            <Text style={styles.themePickerLabel}>Màu giao diện:</Text>
            {Object.values(THEME_PRESETS).map((preset) => {
              const isSelected = theme.id === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.themeChip,
                    isSelected && {
                      backgroundColor: preset.primarySoft,
                      borderColor: preset.primary
                    }
                  ]}
                  onPress={() => setThemeKey(preset.id)}
                >
                  <View style={[styles.themeColorDot, { backgroundColor: preset.primary }]} />
                  <Text
                    style={[
                      styles.themeChipText,
                      isSelected && { color: preset.primary, fontWeight: '700' }
                    ]}
                  >
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.modeToggleGroup}>
            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'PHONE' && styles.modeBtnActive]}
              onPress={() => setViewMode('PHONE')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={13}
                color={viewMode === 'PHONE' ? theme.primary : '#64748B'}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === 'PHONE' && { color: theme.primary, fontWeight: '700' }
                ]}
              >
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
                color={viewMode === 'WIDE' ? theme.primary : '#64748B'}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  viewMode === 'WIDE' && { color: theme.primary, fontWeight: '700' }
                ]}
              >
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
              UNIFIED FLOATING GLASS DOCK (5 TABS + CENTER SMART KEY)
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
                          { backgroundColor: '#1D1D1F', shadowColor: '#000000' },
                          isActive && { backgroundColor: theme.primary, borderColor: '#FFFFFF' }
                        ]}
                      >
                        <Ionicons name="key" size={20} color="#FFFFFF" />
                      </View>
                      <Text
                        style={[
                          styles.dockTabLabel,
                          { marginTop: 3 },
                          isActive && { color: '#1D1D1F', fontWeight: '700' }
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
                        isActive && { backgroundColor: theme.primarySoft }
                      ]}
                    >
                      <Ionicons
                        name={isActive ? tab.activeIcon : tab.icon}
                        size={20}
                        color={isActive ? theme.primary : '#64748B'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.dockTabLabel,
                        isActive && { color: theme.primary, fontWeight: '800' }
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
          MODAL 1: ECOGO RACE GAMIFICATION MODAL
         ========================================================================= */}
      <Modal
        visible={showGreenRaceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGreenRaceModal(false)}
      >
        <View style={styles.greenRaceOverlay}>
          <View style={styles.greenRaceScreen}>
            <View style={[styles.grHeader, { backgroundColor: theme.primarySoft }]}>
              <TouchableOpacity
                style={styles.grBackBtn}
                onPress={() => {
                  setShowLeaderboard(false);
                  setShowGreenRaceModal(false);
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#0F172A" />
              </TouchableOpacity>

              <View style={styles.grTitleWrap}>
                <Ionicons name="trophy" size={18} color="#F59E0B" />
                <Text style={[styles.grTitleText, { color: theme.primaryDark }]}>ECOGO RACE</Text>
                <Ionicons name="sparkles" size={16} color="#F59E0B" />
              </View>

              <TouchableOpacity
                style={styles.grMoreBtn}
                onPress={() => setShowGreenRaceTerms(true)}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color="#0F172A" />
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
                            color="#F59E0B"
                            style={styles.laurelLeft}
                          />
                          <Ionicons
                            name="leaf-outline"
                            size={24}
                            color="#F59E0B"
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

                          <View style={[styles.shieldRibbon, { backgroundColor: theme.primary }]}>
                            <Text style={styles.shieldRibbonText}>{badge.progress}</Text>
                          </View>
                        </View>

                        <Text style={styles.badgeTitleText}>{badge.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={[styles.grProgressBanner, { borderColor: theme.primaryBorder }]}>
                    <View style={[styles.grSeedlingTag, { backgroundColor: theme.primary }]}>
                      <Ionicons name="trophy" size={14} color="#FFF" />
                      <Text style={styles.grSeedlingTagText}>Hạng hiện tại: Thành Viên Tiên Phong (340 Pts)</Text>
                    </View>
                    <Text style={styles.grProgressSub}>
                      Hoàn thành các chuyến thuê xe tự lái tại hệ thống trạm EcoGo Smart (UTH) để mở khóa
                      trọn bộ chứng nhận và nhận ưu đãi giảm giá trực tiếp.
                    </Text>
                  </View>
                </>
              ) : (
                <View style={[styles.leaderboardBox, { borderColor: theme.primaryBorder }]}>
                  <Text style={styles.lbHeaderTitle}>Bảng Xếp Hạng EcoGo Tháng 11/2026</Text>
                  <Text style={styles.lbHeaderSub}>Top thành viên tích lũy điểm thưởng nhiều nhất</Text>

                  {[
                    { rank: 1, name: 'Nguyễn Hoàng Nam', km: '1,420 km', trees: '680 Pts', badge: '🏆' },
                    { rank: 2, name: 'Trần Minh Anh', km: '1,180 km', trees: '540 Pts', badge: '🥈' },
                    { rank: 3, name: 'Lê Quốc Bảo', km: '940 km', trees: '420 Pts', badge: '🥉' },
                    { rank: 18, name: 'Minh Tài (Bạn)', km: '142 km', trees: '340 Pts', badge: '⭐', isMe: true }
                  ].map((row) => (
                    <View
                      key={row.rank}
                      style={[
                        styles.lbRow,
                        row.isMe && {
                          backgroundColor: theme.primarySoft,
                          borderWidth: 1,
                          borderColor: theme.primary
                        }
                      ]}
                    >
                      <Text style={styles.lbRank}>{row.badge} #{row.rank}</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={[
                            styles.lbName,
                            row.isMe && { color: theme.primary, fontWeight: '800' }
                          ]}
                        >
                          {row.name}
                        </Text>
                        <Text style={styles.lbMeta}>Tích lũy: {row.km}</Text>
                      </View>
                      <View style={[styles.lbTreesPill, { backgroundColor: theme.primary }]}>
                        <Text style={styles.lbTreesText}>{row.trees}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.grFooterCtas}>
              <TouchableOpacity
                style={[styles.grTurquoiseBtn, { backgroundColor: theme.primary }]}
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
                    <Ionicons name="document-text-outline" size={22} color="#0F172A" />
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
                <Ionicons name="close" size={18} color="#0F172A" />
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
              <View
                key={item.code}
                style={[
                  styles.voucherCard,
                  { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }
                ]}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[styles.voucherCodeText, { color: theme.primary }]}>{item.code}</Text>
                  <Text style={styles.voucherItemTitle}>{item.title}</Text>
                  <Text style={styles.voucherItemDesc}>{item.desc}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.copyVoucherBtn, { backgroundColor: theme.primary }]}
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
    backgroundColor: '#EFEEEA',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  desktopToolbar: {
    width: '100%',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    borderRadius: 4
  },
  toolbarTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  themePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  themePickerLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 2
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 5
  },
  themeColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  themeChipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: '#475569'
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
  appShell: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F7F7F5'
  },
  phoneSimulatorShell: {
    width: 414,
    maxWidth: '100%',
    marginVertical: 12,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
    backgroundColor: '#F7F7F5',
    position: 'relative'
  },
  mainContentArea: {
    flex: 1
  },

  /* =========================================================================
     UNIFIED FLOATING GLASS DOCK
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
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
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
  dockTabLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2
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
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6
  },

  /* =========================================================================
     ECOGO RACE MODAL STYLES
     ========================================================================= */
  greenRaceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  greenRaceScreen: {
    width: '100%',
    maxWidth: 414,
    height: '100%',
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    position: 'relative'
  },
  grHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14
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
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 16
  },
  grProgressBanner: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center'
  },
  grSeedlingTag: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18
  },
  leaderboardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1
  },
  lbHeaderTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center'
  },
  lbHeaderSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#475569',
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
    backgroundColor: '#F8FAFC',
    marginBottom: 8
  },
  lbRank: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    width: 48
  },
  lbName: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  lbMeta: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  lbTreesPill: {
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12
  },
  grTurquoiseBtn: {
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
    backgroundColor: '#F59E0B',
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
    color: '#0F172A'
  },

  /* =========================================================================
     VOUCHERS MODAL STYLES
     ========================================================================= */
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
    color: '#0F172A'
  },
  rewardsSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  closeModalBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1
  },
  voucherCodeText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2
  },
  voucherItemTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  voucherItemDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#475569',
    marginTop: 2
  },
  copyVoucherBtn: {
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
