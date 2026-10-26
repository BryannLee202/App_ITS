import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform
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

  const isWeb = Platform.OS === 'web';

  return (
    <View style={isWeb ? styles.webBackdrop : styles.mobileFull}>
      {/* Centered Mobile Device Frame (Clean daylight studio mock on PC) */}
      <SafeAreaView
        style={[
          styles.deviceCanvas,
          isWeb && styles.deviceCanvasWeb,
          currentTab === 'KEY' && styles.deviceCanvasDark
        ]}
      >
        <StatusBar barStyle={currentTab === 'KEY' ? 'light-content' : 'dark-content'} />

        {/* Screen Content Body */}
        <View style={styles.body}>{renderContent()}</View>

        {/* Floating Capsule Bottom Navigation - Exact Xanh SM Screenshot Style */}
        <View style={[styles.bottomNav, currentTab === 'KEY' && styles.bottomNavDark]}>
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webBackdrop: {
    flex: 1,
    backgroundColor: '#EEF2F6', // Clean, bright, soft daylight grey studio canvas (no dark scary void)
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '100vh',
    paddingVertical: 16
  },
  mobileFull: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  deviceCanvas: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFC',
    position: 'relative'
  },
  deviceCanvasWeb: {
    maxWidth: 420,
    height: '96vh',
    maxHeight: 900,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    backgroundColor: '#F8FAFC'
  },
  deviceCanvasDark: {
    backgroundColor: '#0F172A'
  },
  body: {
    flex: 1
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    height: 60,
    borderRadius: 30, // Floating capsule
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8ECEF'
  },
  bottomNavDark: {
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
