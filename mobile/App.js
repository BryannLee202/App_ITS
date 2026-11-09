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
import GreenSM3DIcon from './src/components/GreenSM3DIcons';

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import DigitalKeyScreen from './src/screens/DigitalKeyScreen';
import TripsHistoryScreen from './src/screens/TripsHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Authentic 4 Pill Icons matching Green SM v5.12.0(437)
const PILL_TABS = [
  { id: 'HOME', icon: 'home', label: 'Trang chủ' },
  { id: 'TRIPS', icon: 'time', label: 'Hoạt động' },
  { id: 'KEY', icon: 'notifications', label: 'Khóa & TB' },
  { id: 'PROFILE', icon: 'person', label: 'Tài khoản' }
];

const GREEN_RACE_BADGES = [
  {
    id: 'badge_10_trips',
    title: 'Chứng nhận\n10 Chuyến Xanh',
    outerColor: '#B0BEC5',
    innerBg: '#ECEFF1',
    icon: 'bicycle',
    iconColor: '#00897B',
    progress: '3/10 chuyến'
  },
  {
    id: 'badge_plastic',
    title: 'Chứng nhận\nHạn Chế Rác Nhựa',
    outerColor: '#FFB74D',
    innerBg: '#FFF8E1',
    icon: 'leaf',
    iconColor: '#43A047',
    progress: '1.2 kg CO₂'
  },
  {
    id: 'badge_ocean',
    title: 'Chứng nhận\nBảo Vệ Đại Dương',
    outerColor: '#4DD0E1',
    innerBg: '#E0F7FA',
    icon: 'water',
    iconColor: '#00ACC1',
    progress: '50 km xanh'
  },
  {
    id: 'badge_forest',
    title: 'Chứng nhận\nBảo Tồn Rừng Xanh',
    outerColor: '#81C784',
    innerBg: '#E8F5E9',
    icon: 'earth',
    iconColor: '#2E7D32',
    progress: '150 km xanh'
  },
  {
    id: 'badge_polar',
    title: 'Chứng nhận\nGiải Cứu Gấu Bắc Cực',
    outerColor: '#FFD54F',
    innerBg: '#FFFDE7',
    icon: 'snow',
    iconColor: '#0288D1',
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
      <StatusBar barStyle="dark-content" backgroundColor="#E0F7FA" />

      {/* Top Mode Switcher on Desktop Browser */}
      {isDesktopBrowser && (
        <View style={styles.desktopToolbar}>
          <View style={styles.toolbarBrand}>
            <View style={styles.statusDot} />
            <Text style={styles.toolbarTitle}>ECOGO SMART · Thuê xe tự động 24/7</Text>
          </View>

          <View style={styles.modeToggleGroup}>
            <TouchableOpacity
              style={[styles.modeBtn, viewMode === 'PHONE' && styles.modeBtnActive]}
              onPress={() => setViewMode('PHONE')}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={13}
                color={viewMode === 'PHONE' ? '#00838F' : '#64748B'}
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
                color={viewMode === 'WIDE' ? '#00838F' : '#64748B'}
              />
              <Text style={[styles.modeBtnText, viewMode === 'WIDE' && styles.modeBtnTextActive]}>
                Mở rộng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, activeTab === 'MAP' && styles.modeBtnActive]}
              onPress={() => setActiveTab(activeTab === 'MAP' ? 'HOME' : 'MAP')}
            >
              <Ionicons
                name="map-outline"
                size={13}
                color={activeTab === 'MAP' ? '#00838F' : '#64748B'}
              />
              <Text style={[styles.modeBtnText, activeTab === 'MAP' && styles.modeBtnTextActive]}>
                Bản đồ Hub
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

          {/* Authentic Green SM Floating Frosted Glass Pill Bar + Detached 3D Trophy Button */}
          <View style={styles.floatingBottomDock} pointerEvents="box-none">
            {/* Left Frosted Glass Pill (4 Icons with Radial Cyan Glow on Active) */}
            <View style={styles.frostedPillBar}>
              {PILL_TABS.map((tab) => {
                const isActive =
                  activeTab === tab.id || (tab.id === 'HOME' && activeTab === 'MAP');
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={styles.pillTabBtn}
                    activeOpacity={0.8}
                    onPress={() => setActiveTab(tab.id)}
                  >
                    {isActive ? (
                      <View style={styles.activeCyanGlowOuter}>
                        <View style={styles.activeCyanGlowInner}>
                          <Ionicons name={tab.icon} size={22} color="#18B6B4" />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.inactiveTabWrap}>
                        <Ionicons name={tab.icon} size={22} color="#636E72" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Right Detached Frosted Circle with 3D Gold Trophy (Opens GREEN RACE) */}
            <TouchableOpacity
              style={styles.detachedTrophyCircle}
              activeOpacity={0.85}
              onPress={() => setShowGreenRaceModal(true)}
            >
              <GreenSM3DIcon type="TROPHY_3D" size={44} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* =========================================================================
          MODAL 1: AUTHENTIC GREEN RACE GAMIFICATION SCREEN (v5.12.0)
         ========================================================================= */}
      <Modal
        visible={showGreenRaceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGreenRaceModal(false)}
      >
        <View style={styles.greenRaceOverlay}>
          <View style={styles.greenRaceScreen}>
            {/* Top Bar: Back, Leaf Title, and More (...) */}
            <View style={styles.grHeader}>
              <TouchableOpacity
                style={styles.grBackBtn}
                onPress={() => {
                  setShowLeaderboard(false);
                  setShowGreenRaceModal(false);
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#263238" />
              </TouchableOpacity>

              <View style={styles.grTitleWrap}>
                <Ionicons name="leaf" size={18} color="#66BB6A" style={{ transform: [{ scaleX: -1 }] }} />
                <Text style={styles.grTitleText}>ECOGO RACE</Text>
                <Ionicons name="leaf" size={18} color="#66BB6A" />
              </View>

              <TouchableOpacity
                style={styles.grMoreBtn}
                onPress={() => setShowGreenRaceTerms(true)}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color="#263238" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.grScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {!showLeaderboard ? (
                <>
                  {/* 5 Laurel-Wreath Shield Emblems Grid (3 Top, 2 Bottom) */}
                  <View style={styles.badgesGrid}>
                    {GREEN_RACE_BADGES.map((badge) => (
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
                          {/* Left & Right Gold Laurel Wreath Accent */}
                          <Ionicons
                            name="leaf-outline"
                            size={24}
                            color="#FFB300"
                            style={styles.laurelLeft}
                          />
                          <Ionicons
                            name="leaf-outline"
                            size={24}
                            color="#FFB300"
                            style={styles.laurelRight}
                          />

                          {/* Shield Outer Ring */}
                          <View
                            style={[
                              styles.shieldOuter,
                              { borderColor: badge.outerColor, backgroundColor: badge.innerBg }
                            ]}
                          >
                            <View style={styles.shieldInner}>
                              <Ionicons name={badge.icon} size={28} color={badge.iconColor} />
                            </View>
                          </View>

                          {/* Bottom Gold Star Ribbon */}
                          <View style={styles.shieldRibbon}>
                            <Ionicons name="star" size={10} color="#FFF" />
                          </View>
                        </View>

                        <Text style={styles.badgeTitleText}>{badge.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* User Current Progress Summary Box */}
                  <View style={styles.grProgressBanner}>
                    <View style={styles.grSeedlingTag}>
                      <Ionicons name="leaf" size={14} color="#FFF" />
                      <Text style={styles.grSeedlingTagText}>Hạng hiện tại: Người Ươm Mầm</Text>
                    </View>
                    <Text style={styles.grProgressSub}>
                      Hoàn thành các chuyến thuê xe xanh tại hệ thống trạm EcoGo Smart để mở khóa
                      trọn bộ huy hiệu bảo vệ môi trường và đóng góp vào Quỹ Vì Tương Lai Xanh.
                    </Text>
                  </View>
                </>
              ) : (
                /* Monthly Leaderboard View */
                <View style={styles.leaderboardBox}>
                  <Text style={styles.lbHeaderTitle}>Bảng Xếp Hạng Tháng 11/2026</Text>
                  <Text style={styles.lbHeaderSub}>Top Đại Sứ Xanh giảm phát thải CO₂ nhiều nhất</Text>

                  {[
                    { rank: 1, name: 'Nguyễn Hoàng Nam', km: '1,420 km', trees: '68 cây', badge: '🏆' },
                    { rank: 2, name: 'Trần Minh Anh', km: '1,180 km', trees: '54 cây', badge: '🥈' },
                    { rank: 3, name: 'Lê Quốc Bảo', km: '940 km', trees: '42 cây', badge: '🥉' },
                    { rank: 18, name: 'Minh Tài (Bạn)', km: '125 km', trees: '6 cây', badge: '🌱', isMe: true }
                  ].map((row) => (
                    <View
                      key={row.rank}
                      style={[styles.lbRow, row.isMe && styles.lbRowMe]}
                    >
                      <Text style={styles.lbRank}>{row.badge} #{row.rank}</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.lbName, row.isMe && { color: '#00838F', fontWeight: '800' }]}>
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

            {/* Bottom Dual CTAs matching screenshot 1793016386204 */}
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
                {/* Top-Left 3D Crown Badge */}
                <View style={styles.grCrownFloating}>
                  <Text style={{ fontSize: 16 }}>👑</Text>
                </View>
                <Text style={styles.grGoldBtnText}>
                  {showLeaderboard ? 'XEM BỘ SƯU TẬP CHỨNG NHẬN' : 'XEM BẢNG XẾP HẠNG THÁNG'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Conditions Bottom Sheet inside Green Race (matching 1793016386188) */}
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
                    <Ionicons name="document-text-outline" size={22} color="#37474F" />
                    <Text style={styles.grTermsRowText}>Xem Điều khoản và Điều kiện</Text>
                    <Ionicons name="chevron-forward" size={20} color="#78909C" />
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
                <Text style={styles.rewardsTitle}>Ưu đãi EcoGo Smart hiện có</Text>
                <Text style={styles.rewardsSub}>Áp dụng cho Đặt xe, Thuê xe tự lái & Liên tỉnh</Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setShowRewardsModal(false)}
              >
                <Ionicons name="close" size={18} color="#1C2526" />
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
                desc: 'Miễn 100% phí giao xe trong bán kính 5km quanh trạm Hub'
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
    backgroundColor: '#E4EEF0',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  desktopToolbar: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0ECEE',
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
    backgroundColor: '#18B6B4'
  },
  toolbarTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1C2526'
  },
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F0F6F7',
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
    color: '#00838F',
    fontWeight: '700'
  },
  appShell: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5F7F9'
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
    backgroundColor: '#F5F7F9',
    position: 'relative'
  },
  mainContentArea: {
    flex: 1
  },

  /* =========================================================================
     AUTHENTIC GREEN SM FLOATING FROSTED GLASS DOCK + DETACHED TROPHY CIRCLE
     ========================================================================= */
  floatingBottomDock: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    zIndex: 50
  },
  frostedPillBar: {
    flex: 1,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(232, 237, 241, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    shadowColor: '#102A43',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8
  },
  pillTabBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeCyanGlowOuter: {
    width: 66,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(128, 222, 234, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#26C6DA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12
  },
  activeCyanGlowInner: {
    width: 46,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(224, 247, 250, 0.92)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inactiveTabWrap: {
    width: 46,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detachedTrophyCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(232, 237, 241, 0.94)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#102A43',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8
  },

  /* =========================================================================
     GREEN RACE MODAL STYLES (Exact match to 1793016386204)
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
    backgroundColor: '#ECF9F2',
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
    backgroundColor: '#DCF3E6'
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
    color: '#2E5A36',
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
    shadowOpacity: 0.1,
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
    bottom: 2,
    backgroundColor: '#FFB300',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  badgeTitleText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#263238',
    textAlign: 'center',
    lineHeight: 16
  },
  grProgressBanner: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center'
  },
  grSeedlingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#558B2F',
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
    color: '#546E7A',
    textAlign: 'center',
    lineHeight: 18
  },
  leaderboardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  lbHeaderTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#1C2526',
    textAlign: 'center'
  },
  lbHeaderSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#636E72',
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
    backgroundColor: '#F5F7F9',
    marginBottom: 8
  },
  lbRowMe: {
    backgroundColor: '#E0F7FA',
    borderWidth: 1,
    borderColor: '#26C6DA'
  },
  lbRank: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#263238',
    width: 48
  },
  lbName: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#1C2526'
  },
  lbMeta: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#636E72',
    marginTop: 2
  },
  lbTreesPill: {
    backgroundColor: '#558B2F',
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
    backgroundColor: '#FFFDF7',
    gap: 12
  },
  grTurquoiseBtn: {
    backgroundColor: '#22BDC6',
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
    backgroundColor: '#FBC02D',
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
    backgroundColor: '#CFD8DC',
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
    color: '#263238'
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
    color: '#1C2526'
  },
  rewardsSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#636E72',
    marginTop: 2
  },
  closeModalBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F4F7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4FBFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#B2EBF2'
  },
  voucherCodeText: {
    fontFamily: FONTS.family,
    color: '#00838F',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2
  },
  voucherItemTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1C2526'
  },
  voucherItemDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#636E72',
    marginTop: 2
  },
  copyVoucherBtn: {
    backgroundColor: '#18B6B4',
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
