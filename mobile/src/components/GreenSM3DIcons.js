import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Renders rich multi-layered 3D Isometric illustrations in EcoGo Smart's
 * Alpine Matcha Jade (#2E7D5B) & Warm Sand (#FDF6EC) palette
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
            <Ionicons name="car-sport" size={44} color="#1E563F" style={{ marginTop: -2 }} />
          </View>
          <View style={styles.carBadgeVF}>
            <Text style={styles.carBadgeVFText}>ECO</Text>
          </View>
        </View>
      );

    case 'SCOOTER_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#DCFCE7' }]} />
          <View style={[styles.isoPlatform, { backgroundColor: '#86EFAC', borderColor: '#2E7D5B' }]}>
            <MaterialCommunityIcons name="motorbike-electric" size={26} color="#14532D" />
          </View>
          <View style={styles.sparkleDotCyan} />
        </View>
      );

    case 'INTERCITY_MAP_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#EAF6F0' }]} />
          <View style={[styles.isoMapBoard, { backgroundColor: '#34D399' }]}>
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
          <View style={[styles.baseGlow, { backgroundColor: '#FEF3C7' }]} />
          <View style={[styles.isoCube, { backgroundColor: '#FDE68A', borderColor: '#D97706' }]}>
            <Ionicons name="cube" size={26} color="#B45309" />
          </View>
          <View style={styles.handPinkChip} />
        </View>
      );

    case 'MEMBER_DIAMOND_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#D1FAE5' }]} />
          <View style={[styles.isoDiamond, { backgroundColor: '#2E7D5B' }]}>
            <Ionicons name="diamond" size={25} color="#FFFFFF" />
          </View>
          <Ionicons name="sparkles" size={12} color="#FBBF24" style={styles.sparkleTopRight} />
        </View>
      );

    case 'SMARTKEY_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#EAF6F0' }]} />
          <View style={styles.keyLanyard} />
          <View style={styles.keyFobBody}>
            <Text style={styles.keyFobLogo}>E</Text>
            <Ionicons name="lock-open" size={11} color="#6EE7B7" />
          </View>
        </View>
      );

    case 'VINBUS_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#ECFCCB' }]} />
          <View style={styles.bus3DBody}>
            <View style={styles.busRoofGreen} />
            <Ionicons name="train" size={23} color="#1E563F" />
          </View>
        </View>
      );

    case 'SHOWROOM_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#EAF6F0' }]} />
          <View style={styles.showroomBuilding}>
            <View style={styles.showroomHeader}>
              <Text style={styles.showroomHeaderText}>ECOGO</Text>
            </View>
            <View style={styles.showroomGlass}>
              <Ionicons name="car-sport" size={13} color="#1E293B" />
              <Ionicons name="car-sport" size={13} color="#2E7D5B" />
            </View>
          </View>
        </View>
      );

    case 'GIFTCARD_3D':
      return (
        <View style={styles.icon3DBox}>
          <View style={[styles.baseGlow, { backgroundColor: '#FEF3C7' }]} />
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
    opacity: 0.75
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
    backgroundColor: '#2E7D5B'
  },
  isoMapBoard: {
    width: 38,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#1E563F',
    position: 'relative'
  },
  mapRoadStrip: {
    width: 28,
    height: 4,
    backgroundColor: '#FEF08A',
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
    backgroundColor: '#FDE68A'
  },
  isoDiamond: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#14532D'
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
    backgroundColor: '#1E293B',
    transform: [{ rotate: '18deg' }]
  },
  keyFobBody: {
    width: 24,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E3A2F',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
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
    backgroundColor: '#A7F3D0',
    borderBottomWidth: 3,
    borderBottomColor: '#2E7D5B',
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
    backgroundColor: '#34D399'
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
    backgroundColor: '#2E7D5B',
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
    backgroundColor: '#34D399',
    borderBottomWidth: 3,
    borderBottomColor: '#2E7D5B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  giftTagYellow: {
    width: 24,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    marginTop: -10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEF08A',
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
    backgroundColor: 'rgba(46, 125, 91, 0.22)'
  },
  carBodyCyan: {
    width: 78,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#6EE7B7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D5B',
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
    opacity: 0.22
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
    backgroundColor: '#2E7D5B',
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
    backgroundColor: '#2E7D5B',
    marginTop: -2
  }
});
