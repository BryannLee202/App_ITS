import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  useWindowDimensions
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
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

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
    <SafeAreaView style={[styles.rootContainer, currentTab === 'KEY' && styles.rootContainerDark]}>
      <StatusBar barStyle={currentTab === 'KEY' ? 'light-content' : 'dark-content'} />

      {/* Desktop Top Header Bar (Only visible on PC/Desktop browser) */}
      {isDesktop && (
        <View style={styles.desktopNavBar}>
          <View style={styles.desktopNavInner}>
            <View style={styles.desktopBrandCol}>
              <View style={styles.brandIconCircle}>
                <Ionicons name="car-sport" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.desktopBrandName}>ITS SMART MOBILITY</Text>
                <Text style={styles.desktopBrandSub}>Hệ Thống Thuê Phương Tiện Giao Thông Thông Minh • ĐH GTVT TP.HCM</Text>
              </View>
            </View>

            {/* Desktop Navigation Links */}
            <View style={styles.desktopLinksRow}>
              <TouchableOpacity
                style={[styles.desktopTabLink, currentTab === 'HOME' && styles.desktopTabLinkActive]}
                onPress={() => setCurrentTab('HOME')}
              >
                <Ionicons name="compass-outline" size={17} color={currentTab === 'HOME' ? '#00BFA5' : '#64748B'} />
                <Text style={[styles.desktopTabText, currentTab === 'HOME' && styles.desktopTabTextActive]}>
                  Khám phá xe
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.desktopTabLink, currentTab === 'MAP' && styles.desktopTabLinkActive]}
                onPress={() => setCurrentTab('MAP')}
              >
                <Ionicons name="map-outline" size={17} color={currentTab === 'MAP' ? '#00BFA5' : '#64748B'} />
                <Text style={[styles.desktopTabText, currentTab === 'MAP' && styles.desktopTabTextActive]}>
                  Bản đồ Trạm Hub
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.desktopTabLink, currentTab === 'KEY' && styles.desktopTabLinkActive]}
                onPress={() => setCurrentTab('KEY')}
              >
                <Ionicons name="key-outline" size={17} color={currentTab === 'KEY' ? '#00BFA5' : '#64748B'} />
                <Text style={[styles.desktopTabText, currentTab === 'KEY' && styles.desktopTabTextActive]}>
                  Buồng lái Digital Key
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.desktopTabLink, currentTab === 'TRIPS' && styles.desktopTabLinkActive]}
                onPress={() => setCurrentTab('TRIPS')}
              >
                <Ionicons name="document-text-outline" size={17} color={currentTab === 'TRIPS' ? '#00BFA5' : '#64748B'} />
                <Text style={[styles.desktopTabText, currentTab === 'TRIPS' && styles.desktopTabTextActive]}>
                  Hợp đồng & CO₂
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.desktopTabLink, currentTab === 'PROFILE' && styles.desktopTabLinkActive]}
                onPress={() => setCurrentTab('PROFILE')}
              >
                <Ionicons name="person-outline" size={17} color={currentTab === 'PROFILE' ? '#00BFA5' : '#64748B'} />
                <Text style={[styles.desktopTabText, currentTab === 'PROFILE' && styles.desktopTabTextActive]}>
                  Tài khoản eKYC
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Main Responsive Body (Full width on Desktop with max-width content, Native ratio on Phone) */}
      <View style={[styles.bodyContainer, isDesktop && styles.desktopBodyContainer]}>
        {renderContent()}
      </View>

      {/* Mobile Floating Bottom Bar (Only visible on Phones / Screens <= 768px) */}
      {!isDesktop && (
        <View style={[styles.mobileBottomNav, currentTab === 'KEY' && styles.mobileBottomNavDark]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('HOME')}
            activeOpacity={0.8}
          >
            <View style={currentTab === 'HOME' ? styles.activePillBubble : null}>
              <Ionicons
                name="home"
                size={22}
                color={currentTab === 'HOME' ? '#00BFA5' : '#94A3B8'}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('MAP')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={currentTab === 'MAP' ? 'map' : 'map-outline'}
              size={22}
              color={currentTab === 'MAP' ? '#00BFA5' : '#94A3B8'}
            />
          </TouchableOpacity>

          {/* Center Digital Key Cockpit Tab */}
          <TouchableOpacity
            style={styles.centerKeyItem}
            onPress={() => setCurrentTab('KEY')}
            activeOpacity={0.85}
          >
            <View style={[styles.centerKeyCircle, currentTab === 'KEY' && styles.centerKeyCircleActive]}>
              <Ionicons name="key" size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('TRIPS')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={currentTab === 'TRIPS' ? 'time' : 'time-outline'}
              size={22}
              color={currentTab === 'TRIPS' ? '#00BFA5' : '#94A3B8'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('PROFILE')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={currentTab === 'PROFILE' ? 'person' : 'person-outline'}
              size={22}
              color={currentTab === 'PROFILE' ? '#00BFA5' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFC'
  },
  rootContainerDark: {
    backgroundColor: '#0F172A'
  },
  desktopNavBar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 100
  },
  desktopNavInner: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  desktopBrandCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  brandIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#00BFA5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  desktopBrandName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5
  },
  desktopBrandSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500'
  },
  desktopLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  desktopTabLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6
  },
  desktopTabLinkActive: {
    backgroundColor: '#E0F7F4'
  },
  desktopTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  desktopTabTextActive: {
    color: '#00BFA5',
    fontWeight: '700'
  },
  bodyContainer: {
    flex: 1,
    width: '100%'
  },
  desktopBodyContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%'
  },
  mobileBottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    height: 60,
    borderRadius: 30,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8ECEF'
  },
  mobileBottomNavDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155'
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  activePillBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#B2DFDB'
  },
  centerKeyItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -20
  },
  centerKeyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00BFA5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  },
  centerKeyCircleActive: {
    backgroundColor: '#008E7B',
    shadowColor: '#008E7B'
  }
});
