import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from './src/styles/theme';

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={currentTab === 'KEY' ? 'light-content' : 'dark-content'} />

      {/* Screen Body */}
      <View style={styles.body}>{renderContent()}</View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, currentTab === 'KEY' && styles.bottomNavDark]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('HOME')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={currentTab === 'HOME' ? 'compass' : 'compass-outline'}
            size={22}
            color={currentTab === 'HOME' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.navLabel, currentTab === 'HOME' && styles.navLabelActive]}>
            Khám phá
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('MAP')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={currentTab === 'MAP' ? 'map' : 'map-outline'}
            size={22}
            color={currentTab === 'MAP' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.navLabel, currentTab === 'MAP' && styles.navLabelActive]}>
            Bản đồ Hub
          </Text>
        </TouchableOpacity>

        {/* Floating Center Digital Key Tab (BonbonCar / Smart Key style) */}
        <TouchableOpacity
          style={styles.centerKeyItem}
          onPress={() => setCurrentTab('KEY')}
          activeOpacity={0.85}
        >
          <View style={[styles.centerKeyCircle, currentTab === 'KEY' && styles.centerKeyCircleActive]}>
            <Ionicons name="key" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.navLabel, currentTab === 'KEY' && styles.navLabelKeyActive]}>
            Điều khiển
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('TRIPS')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={currentTab === 'TRIPS' ? 'receipt' : 'receipt-outline'}
            size={22}
            color={currentTab === 'TRIPS' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.navLabel, currentTab === 'TRIPS' && styles.navLabelActive]}>
            Chuyến đi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('PROFILE')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={currentTab === 'PROFILE' ? 'person' : 'person-outline'}
            size={22}
            color={currentTab === 'PROFILE' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.navLabel, currentTab === 'PROFILE' && styles.navLabelActive]}>
            Tài khoản
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  body: {
    flex: 1
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8
  },
  bottomNavDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B'
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '700'
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6
  },
  centerKeyCircleActive: {
    backgroundColor: COLORS.secondaryDark,
    shadowColor: COLORS.secondaryDark
  },
  navLabelKeyActive: {
    color: COLORS.secondaryLight,
    fontWeight: '800'
  }
});
