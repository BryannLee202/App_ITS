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

  const isWeb = Platform.OS === 'web';

  return (
    <View style={isWeb ? styles.webBackdrop : styles.mobileFull}>
      {/* Centered Mobile Device Frame (Prevents wide-screen distortion) */}
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

        {/* Fixed Bottom Navigation - Green SM Signature Styling */}
        <View style={[styles.bottomNav, currentTab === 'KEY' && styles.bottomNavDark]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('HOME')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={currentTab === 'HOME' ? 'compass' : 'compass-outline'}
              size={20}
              color={currentTab === 'HOME' ? '#00A896' : '#7D9DA6'}
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
              size={20}
              color={currentTab === 'MAP' ? '#00A896' : '#7D9DA6'}
            />
            <Text style={[styles.navLabel, currentTab === 'MAP' && styles.navLabelActive]}>
              Trạm Hub
            </Text>
          </TouchableOpacity>

          {/* Center Digital Key Cockpit Tab */}
          <TouchableOpacity
            style={styles.centerKeyItem}
            onPress={() => setCurrentTab('KEY')}
            activeOpacity={0.85}
          >
            <View style={[styles.centerKeyCircle, currentTab === 'KEY' && styles.centerKeyCircleActive]}>
              <Ionicons name="key" size={20} color="#FFFFFF" />
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
              name={currentTab === 'TRIPS' ? 'document-text' : 'document-text-outline'}
              size={20}
              color={currentTab === 'TRIPS' ? '#00A896' : '#7D9DA6'}
            />
            <Text style={[styles.navLabel, currentTab === 'TRIPS' && styles.navLabelActive]}>
              Hợp đồng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setCurrentTab('PROFILE')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={currentTab === 'PROFILE' ? 'person' : 'person-outline'}
              size={20}
              color={currentTab === 'PROFILE' ? '#00A896' : '#7D9DA6'}
            />
            <Text style={[styles.navLabel, currentTab === 'PROFILE' && styles.navLabelActive]}>
              Hồ sơ
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webBackdrop: {
    flex: 1,
    backgroundColor: '#06161D', // Green SM Deep Petrol Night Backdrop
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '100vh'
  },
  mobileFull: {
    flex: 1,
    backgroundColor: '#F4F9F8'
  },
  deviceCanvas: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F4F9F8',
    position: 'relative'
  },
  deviceCanvasWeb: {
    maxWidth: 440,
    height: '100vh',
    maxHeight: 932,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#00A896',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    borderWidth: 1,
    borderColor: '#163C4D'
  },
  deviceCanvasDark: {
    backgroundColor: '#06161D'
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
    borderTopColor: '#D5EBE7',
    paddingVertical: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 62,
    zIndex: 100,
    shadowColor: '#00A896',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8
  },
  bottomNavDark: {
    backgroundColor: '#0C232E',
    borderTopColor: '#163C4D'
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7D9DA6',
    marginTop: 2
  },
  navLabelActive: {
    color: '#00A896',
    fontWeight: '800'
  },
  centerKeyItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -22
  },
  centerKeyCircle: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#00A896',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A896',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  },
  centerKeyCircleActive: {
    backgroundColor: '#004D40',
    shadowColor: '#004D40'
  },
  navLabelKeyActive: {
    color: '#00A896',
    fontWeight: '800'
  }
});
