import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Renders rich multi-layered 3D Isometric illustrations matching Green SM v5.12.0
 */
export default function GreenSM3DIcons({ type, size = 48 }) {
  switch (type) {
    case 'CAR_CYAN_3D':
      return (
        <View style={styles.car3DContainer}>
          <View style={styles.carShadow} />
          <View style={styles.carBodyCyan}>
            <View style={styles.carRoofGlass} />
            <View style={styles.carHeadlightLeft} />
            <View style={styles.carHeadlightRight} />
            <Ionicons name="car-sport" size={44} color="#00ACC1" style={{ marginTop: -2 }} />
          </View>
          <View style={styles.carBadgeVF}>
            <Text style={styles.carBadgeVFText}>ECO</Text>
          </View>
        </View>
      );

    case 'SCOOTER_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#E0F7FA' }]} />
          <View style={[styles.isoPlatform, { backgroundColor: '#80DEEA', borderColor: '#26C6DA' }]}>
            <MaterialCommunityIcons name="motorbike-electric" size={26} color="#006064" />
          </View>
          <View style={styles.sparkleDotCyan} />
        </View>
      );

    case 'INTERCITY_MAP_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#E0F2F1' }]} />
          <View style={[styles.isoMapBoard, { backgroundColor: '#26C6DA' }]}>
            <View style={styles.mapRoadStrip} />
            <View style={styles.pinYellow}>
              <Ionicons name="location" size={16} color="#F59E0B" />
            </View>
            <View style={styles.pinOrange}>
              <Ionicons name="location" size={14} color="#EA580C" />
            </View>
          </View>
        </View>
      );

    case 'DELIVERY_BOX_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#E1F5FE' }]} />
          <View style={[styles.isoCube, { backgroundColor: '#81D4FA', borderColor: '#29B6F6' }]}>
            <Ionicons name="cube" size={26} color="#0288D1" />
          </View>
          <View style={styles.handPinkChip} />
        </View>
      );

    case 'MEMBER_DIAMOND_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#E0F7FA' }]} />
          <View style={[styles.isoDiamond, { backgroundColor: '#4DD0E1' }]}>
            <Ionicons name="diamond" size={25} color="#FFFFFF" />
          </View>
          <Ionicons name="sparkles" size={12} color="#FBBF24" style={styles.sparkleTopRight} />
        </View>
      );

    case 'SMARTKEY_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#ECEFF1' }]} />
          <View style={styles.keyLanyard} />
          <View style={styles.keyFobBody}>
            <Text style={styles.keyFobLogo}>E</Text>
            <Ionicons name="lock-open" size={11} color="#4DD0E1" />
          </View>
        </View>
      );

    case 'VINBUS_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#F1F8E9' }]} />
          <View style={styles.bus3DBody}>
            <View style={styles.busRoofGreen} />
            <Ionicons name="bus" size={24} color="#1B5E20" />
          </View>
        </View>
      );

    case 'SHOWROOM_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#E3F2FD' }]} />
          <View style={styles.showroomBuilding}>
            <View style={styles.showroomHeader}>
              <Text style={styles.showroomHeaderText}>ECOGO</Text>
            </View>
            <View style={styles.showroomGlass}>
              <Ionicons name="car-sport" size={13} color="#1E293B" />
              <Ionicons name="car-sport" size={13} color="#0284C7" />
            </View>
          </View>
        </View>
      );

    case 'GIFTCARD_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#FFF8E1' }]} />
          <View style={styles.giftBoxBlue}>
            <View style={styles.giftTagYellow}>
              <Text style={styles.giftPercentText}>%</Text>
            </View>
          </View>
        </View>
      );

    case 'TROPHY_3D':
      return (
        <View style={styles.trophyWrap}>
          <Ionicons name="trophy" size={24} color="#F59E0B" />
          <View style={styles.trophyPedestal} />
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  icon3DBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  baseGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.7
  },
  isoPlatform: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3
  },
  sparkleDotCyan: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00BCD4'
  },
  isoMapBoard: {
    width: 38,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#00838F',
    position: 'relative'
  },
  mapRoadStrip: {
    width: 28,
    height: 4,
    backgroundColor: '#FFF59D',
    borderRadius: 2,
    transform: [{ rotate: '-20deg' }]
  },
  pinYellow: {
    position: 'absolute',
    top: -4,
    left: 2
  },
  pinOrange: {
    position: 'absolute',
    bottom: 2,
    right: 2
  },
  isoCube: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3
  },
  handPinkChip: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 14,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F8BBD0'
  },
  isoDiamond: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#0097A7'
  },
  sparkleTopRight: {
    position: 'absolute',
    top: 2,
    right: 2
  },
  keyLanyard: {
    position: 'absolute',
    left: 10,
    top: 6,
    width: 6,
    height: 28,
    borderRadius: 3,
    backgroundColor: '#263238',
    transform: [{ rotate: '18deg' }]
  },
  keyFobBody: {
    width: 24,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginTop: 4
  },
  keyFobLogo: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 1
  },
  bus3DBody: {
    width: 40,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#AED581',
    borderBottomWidth: 3,
    borderBottomColor: '#689F38',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  busRoofGreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#7CB342'
  },
  showroomBuilding: {
    width: 42,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#94A3B8',
    overflow: 'hidden'
  },
  showroomHeader: {
    backgroundColor: '#0284C7',
    height: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  showroomHeaderText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.4
  },
  showroomGlass: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 2
  },
  giftBoxBlue: {
    width: 38,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#4FC3F7',
    borderBottomWidth: 3,
    borderBottomColor: '#0288D1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  giftTagYellow: {
    width: 24,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#FBC02D',
    marginTop: -10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF59D',
    transform: [{ rotate: '-8deg' }]
  },
  giftPercentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900'
  },
  car3DContainer: {
    width: 96,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  carShadow: {
    position: 'absolute',
    bottom: 6,
    width: 82,
    height: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 151, 167, 0.18)'
  },
  carBodyCyan: {
    width: 78,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#80DEEA',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00838F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6
  },
  carRoofGlass: {
    position: 'absolute',
    top: 4,
    width: 44,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    opacity: 0.25
  },
  carHeadlightLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF'
  },
  carHeadlightRight: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF'
  },
  carBadgeVF: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#18B6B4',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6
  },
  carBadgeVFText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900'
  },
  trophyWrap: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  trophyPedestal: {
    width: 18,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#0288D1',
    marginTop: -2
  }
});
