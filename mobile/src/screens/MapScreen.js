import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import ApiService from '../services/api';

export default function MapScreen({ navigation, onSelectVehicle }) {
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      const [stRes, vRes] = await Promise.all([
        ApiService.getStations(),
        ApiService.getVehicles()
      ]);
      setStations(stRes.stations || []);
      setVehicles(vRes.vehicles || []);
      if (stRes.stations && stRes.stations.length > 0) {
        setSelectedStation(stRes.stations[0]);
      }
    } catch (err) {
      console.warn('Map data load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVehiclesAtStation = (stationId) => {
    return vehicles.filter(v => v.stationId === stationId);
  };

  return (
    <View style={styles.container}>
      {/* Top Header & Search Overlay */}
      <View style={styles.topOverlay}>
        <View style={styles.mapSearchBox}>
          <Ionicons name="search" size={18} color={COLORS.primary} />
          <Text style={styles.mapSearchText}>
            {selectedStation ? selectedStation.name : 'Tìm trạm ITS Hub lân cận...'}
          </Text>
        </View>

        {/* Station Filter Horizontal Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stationPillsRow}
        >
          {stations.map(station => {
            const isSelected = selectedStation?.id === station.id;
            return (
              <TouchableOpacity
                key={station.id}
                style={[styles.stationPill, isSelected && styles.stationPillActive]}
                onPress={() => {
                  setSelectedStation(station);
                  setSelectedVehicle(null);
                }}
              >
                <Ionicons
                  name="location"
                  size={14}
                  color={isSelected ? '#FFFFFF' : COLORS.primary}
                />
                <Text style={[styles.stationPillText, isSelected && styles.stationPillTextActive]}>
                  {station.name.split('-')[0].trim()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Visual Interactive Map Canvas / Simulation Grid */}
      <View style={styles.mapCanvas}>
        {/* Visual Map Grid Lines */}
        <View style={styles.mapBackground}>
          <View style={styles.corridorPath} />
          
          {/* Render Visual Pins for Stations */}
          {stations.map((st, idx) => {
            const isSelected = selectedStation?.id === st.id;
            // Distribute pins across visual board
            const positions = [
              { top: '35%', left: '42%' }, // UTH
              { top: '65%', left: '25%' }, // Bến Thành
              { top: '48%', left: '55%' }, // Landmark 81
              { top: '22%', left: '20%' }, // Tân Sơn Nhất
              { top: '60%', left: '60%' }, // Thủ Thiêm
              { top: '20%', left: '75%' }  // Khu Công Nghệ Cao
            ];
            const pos = positions[idx % positions.length];

            return (
              <TouchableOpacity
                key={st.id}
                style={[styles.mapPinContainer, pos, isSelected && styles.mapPinActive]}
                onPress={() => {
                  setSelectedStation(st);
                  setSelectedVehicle(null);
                }}
              >
                <View style={[styles.mapPinBubble, isSelected && styles.bubbleActive]}>
                  <Ionicons name="flash" size={12} color="#FFFFFF" />
                  <Text style={styles.pinBubbleText}>{st.availableVehicles} xe</Text>
                </View>
                <View style={[styles.pinPointer, isSelected && styles.pointerActive]} />
              </TouchableOpacity>
            );
          })}

          {/* Current Corridor Status Tag */}
          <View style={styles.corridorTag}>
            <Ionicons name="speedometer" size={14} color={COLORS.secondary} />
            <Text style={styles.corridorTagText}>
              Trục ITS UTH - Mai Chí Thọ: Làn sóng xanh 45 km/h
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet for Selected Station & Available Vehicles */}
      {selectedStation && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.stationInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetStationName}>{selectedStation.name}</Text>
              <Text style={styles.sheetStationAddress}>{selectedStation.address}</Text>
            </View>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityNum}>{selectedStation.availableVehicles}</Text>
              <Text style={styles.capacitySub}>xe sẵn sàng</Text>
            </View>
          </View>

          {/* Connected MaaS Transit Modes */}
          <View style={styles.transitRow}>
            <Ionicons name="git-branch-outline" size={13} color={COLORS.secondaryDark} />
            <Text style={styles.transitText}>
              Kết nối: {selectedStation.nearbyTransit.join(' • ')}
            </Text>
          </View>

          {/* Vehicles at this station */}
          <Text style={styles.vehiclesListTitle}>Phương tiện đang đỗ tại Hub:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stationVehiclesRow}>
            {getVehiclesAtStation(selectedStation.id).map(veh => (
              <TouchableOpacity
                key={veh.id}
                style={styles.miniVehCard}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedVehicle(veh);
                  if (onSelectVehicle) onSelectVehicle(veh);
                }}
              >
                <Image source={{ uri: veh.thumbnail }} style={styles.miniImage} />
                <View style={styles.miniInfo}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{veh.name}</Text>
                  <Text style={styles.miniPrice}>{veh.hourlyPrice.toLocaleString('vi-VN')} đ/h</Text>
                  <View style={styles.miniBadge}>
                    <Ionicons name="battery-charging" size={10} color={COLORS.secondaryDark} />
                    <Text style={styles.miniBattery}>{Math.round(veh.telematics.batteryLevelPct)}% Pin</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  topOverlay: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: SPACING.md
  },
  mapSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    height: 46,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#8B7364',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4
  },
  mapSearchText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '700'
  },
  stationPillsRow: {
    paddingTop: SPACING.sm,
    gap: SPACING.xs
  },
  stationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#8B7364',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  stationPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  stationPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  stationPillTextActive: {
    color: '#FFFFFF'
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E5DBD1',
    position: 'relative'
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#E8DED4',
    position: 'relative'
  },
  corridorPath: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: '60%',
    height: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
    transform: [{ rotate: '25deg' }]
  },
  mapPinContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5
  },
  mapPinActive: {
    zIndex: 10,
    transform: [{ scale: 1.15 }]
  },
  mapPinBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 4,
    shadowColor: '#2C221E',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  bubbleActive: {
    backgroundColor: COLORS.primary
  },
  pinBubbleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  pinPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.secondaryDark
  },
  pointerActive: {
    borderTopColor: COLORS.primary
  },
  corridorTag: {
    position: 'absolute',
    top: 108,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryDark,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    gap: 6,
    shadowColor: '#2C221E',
    shadowOpacity: 0.15,
    shadowRadius: 6
  },
  corridorTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#8B7364',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.borderDark,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.sm
  },
  stationInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  sheetStationName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  sheetStationAddress: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  capacityBadge: {
    backgroundColor: COLORS.secondaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4E4F2'
  },
  capacityNum: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondaryDark
  },
  capacitySub: {
    fontSize: 9,
    color: COLORS.secondaryDark,
    fontWeight: '700'
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4
  },
  transitText: {
    fontSize: 11,
    color: COLORS.secondaryDark,
    fontWeight: '600'
  },
  vehiclesListTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs
  },
  stationVehiclesRow: {
    gap: SPACING.md
  },
  miniVehCard: {
    width: 146,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  miniImage: {
    width: '100%',
    height: 82
  },
  miniInfo: {
    padding: 8
  },
  miniTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  miniPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 2
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 3
  },
  miniBattery: {
    fontSize: 9,
    color: COLORS.secondaryDark,
    fontWeight: '700'
  }
});
