import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import ApiService from '../services/api';
import BookingModal from '../components/BookingModal';

export default function MapScreen({ navigation, onSelectVehicle, onNavigateToKey }) {
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const [stRes, vRes] = await Promise.all([
        ApiService.getStations(),
        ApiService.getVehicles()
      ]);
      const stList = stRes.stations || [];
      setStations(stList);
      setVehicles(vRes.vehicles || []);
      if (stList.length > 0) {
        setSelectedStation(stList[0]);
      }
    } catch (err) {
      console.warn('Map data load error:', err.message);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleMessage = (event) => {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data && data.type === 'SELECT_STATION' && data.stationId) {
            const found = stations.find(s => s.id === data.stationId);
            if (found) setSelectedStation(found);
          } else if (data && data.type === 'SELECT_VEHICLE' && data.vehicleId) {
            const vFound = vehicles.find(v => v.id === data.vehicleId);
            if (vFound) {
              setBookingVehicle(vFound);
              setShowBookingModal(true);
            }
          }
        } catch (e) {
          // ignore non-json postMessages
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [stations, vehicles]);

  const getVehiclesAtStation = (stationId) => {
    return vehicles.filter(v => v.stationId === stationId);
  };

  // Interactive Leaflet HTML with CartoDB Voyager (Clean Apple Map aesthetic)
  const leafletSrcDoc = useMemo(() => {
    const centerLat = selectedStation?.coordinates?.latitude || 10.8018;
    const centerLng = selectedStation?.coordinates?.longitude || 106.7142;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F5F2EB; }
          .hub-pill {
            background: #10B981;
            color: #FFFFFF;
            padding: 5px 10px;
            border-radius: 99px;
            font-weight: 800;
            font-size: 11px;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
          }
          .hub-pill-active {
            background: #111827;
            border-color: #10B981;
            transform: scale(1.1);
          }
          .veh-price-tag {
            background: #FFFFFF;
            color: #059669;
            padding: 3px 8px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 10px;
            border: 1.5px solid #10B981;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
            white-space: nowrap;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 14);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap • ITS Green Mobility'
          }).addTo(map);

          // Draw Green Wave Corridor Line (UTH -> Cầu Sài Gòn -> Mai Chí Thọ)
          const corridorCoords = [
            [10.8018, 106.7142],
            [10.7985, 106.7175],
            [10.7952, 106.7218],
            [10.7850, 106.7260],
            [10.7758, 106.7245]
          ];
          L.polyline(corridorCoords, {
            color: '#10B981',
            weight: 5,
            opacity: 0.75,
            dashArray: '10, 8'
          }).addTo(map);

          const stations = ${JSON.stringify(stations)};
          const selectedId = ${JSON.stringify(selectedStation?.id || '')};

          stations.forEach(st => {
            const isSelected = st.id === selectedId;
            const icon = L.divIcon({
              className: '',
              html: '<div class="hub-pill ' + (isSelected ? 'hub-pill-active' : '') + '">⚡ ' + st.availableVehicles + ' xe • ' + (st.name.split('-')[1] || st.name).trim().substring(0, 16) + '</div>',
              iconSize: [140, 30],
              iconAnchor: [70, 15]
            });

            const marker = L.marker([st.coordinates.latitude, st.coordinates.longitude], { icon }).addTo(map);
            marker.on('click', () => {
              window.parent.postMessage(JSON.stringify({ type: 'SELECT_STATION', stationId: st.id }), '*');
            });

            // Geofence 150m circle
            L.circle([st.coordinates.latitude, st.coordinates.longitude], {
              radius: 180,
              color: '#10B981',
              fillColor: '#10B981',
              fillOpacity: isSelected ? 0.18 : 0.07,
              weight: 1.5
            }).addTo(map);
          });
        </script>
      </body>
      </html>
    `;
  }, [stations, selectedStation]);

  return (
    <View style={styles.container}>
      {/* Floating Apple-Style Top Search & Hub Selector */}
      <View style={styles.topOverlay}>
        <View style={styles.mapSearchBox}>
          <View style={styles.liveDot} />
          <Ionicons name="location" size={16} color="#10B981" />
          <Text style={styles.mapSearchText} numberOfLines={1}>
            {selectedStation ? selectedStation.name : 'Bản đồ Trạm Hub ITS TP.HCM'}
          </Text>
          <View style={styles.geofenceChip}>
            <Text style={styles.geofenceChipText}>Bán kính 150m</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stationPillsRow}
        >
          {stations.map(station => {
            const isSelected = selectedStation?.id === station.id;
            const shortName = (station.name.split('-')[1] || station.name).trim();
            return (
              <TouchableOpacity
                key={station.id}
                style={[styles.stationPill, isSelected && styles.stationPillActive]}
                onPress={() => setSelectedStation(station)}
              >
                <Ionicons
                  name="flash"
                  size={12}
                  color={isSelected ? '#FFFFFF' : '#10B981'}
                />
                <Text style={[styles.stationPillText, isSelected && styles.stationPillTextActive]}>
                  {shortName} ({station.availableVehicles})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Real Interactive Leaflet Map on Web / Vector Simulation Fallback on Native */}
      <View style={styles.mapCanvas}>
        {Platform.OS === 'web' ? (
          <iframe
            title="ITS Interactive Leaflet Map"
            srcDoc={leafletSrcDoc}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <View style={styles.nativeMapFallback}>
            <Text style={styles.nativeFallbackText}>Bản đồ Trạm Hub ITS TP.HCM</Text>
          </View>
        )}

        {/* Floating Green Wave Legend Pill */}
        <View style={styles.corridorLegendPill}>
          <Ionicons name="pulse" size={13} color="#10B981" />
          <Text style={styles.corridorLegendText}>
            Hành lang Làn Sóng Xanh UTH - Mai Chí Thọ (45 km/h)
          </Text>
        </View>
      </View>

      {/* Bottom Sheet for Selected Station & Available Vehicles */}
      {selectedStation && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.stationInfoRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={styles.hubBadgeRow}>
                <View style={styles.hubTypeBadge}>
                  <Text style={styles.hubTypeBadgeText}>{selectedStation.type}</Text>
                </View>
                <Text style={styles.fastChargeText}>• Sạc siêu nhanh 250kW</Text>
              </View>
              <Text style={styles.sheetStationName} numberOfLines={1}>{selectedStation.name}</Text>
              <Text style={styles.sheetStationAddress} numberOfLines={1}>{selectedStation.address}</Text>
            </View>

            <View style={styles.capacityBadge}>
              <Text style={styles.capacityNum}>{selectedStation.availableVehicles}</Text>
              <Text style={styles.capacitySub}>xe sẵn sàng</Text>
            </View>
          </View>

          {/* Connected MaaS Transit Modes */}
          <View style={styles.transitRow}>
            <Ionicons name="train-outline" size={13} color="#059669" />
            <Text style={styles.transitText} numberOfLines={1}>
              Liên kết MaaS: {selectedStation.nearbyTransit.join(' • ')}
            </Text>
          </View>

          {/* Vehicles at this station */}
          <Text style={styles.vehiclesListTitle}>Chạm vào xe để đặt thuê & mở khóa ngay:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stationVehiclesRow}
          >
            {getVehiclesAtStation(selectedStation.id).map(veh => (
              <TouchableOpacity
                key={veh.id}
                style={styles.miniVehCard}
                activeOpacity={0.9}
                onPress={() => {
                  setBookingVehicle(veh);
                  setShowBookingModal(true);
                }}
              >
                <Image source={{ uri: veh.thumbnail }} style={styles.miniImage} />
                <View style={styles.miniInfo}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{veh.name}</Text>
                  <Text style={styles.miniPlate}>{veh.plateNumber}</Text>
                  <View style={styles.miniBottomRow}>
                    <Text style={styles.miniPrice}>{veh.hourlyPrice.toLocaleString('vi-VN')}đ/h</Text>
                    <View style={styles.miniBadge}>
                      <Ionicons name="battery-charging" size={10} color="#059669" />
                      <Text style={styles.miniBattery}>{Math.round(veh.telematics?.batteryLevelPct || 90)}%</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <BookingModal
        visible={showBookingModal}
        vehicle={bookingVehicle}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={() => {
          setShowBookingModal(false);
          if (onNavigateToKey) onNavigateToKey();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7'
  },
  topOverlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 14
  },
  mapSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 99,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981'
  },
  mapSearchText: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    fontWeight: '800'
  },
  geofenceChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99
  },
  geofenceChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  stationPillsRow: {
    paddingTop: 8,
    gap: 6
  },
  stationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  stationPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  stationPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827'
  },
  stationPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#F5F2EB',
    position: 'relative'
  },
  nativeMapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nativeFallbackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563'
  },
  corridorLegendPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6
  },
  corridorLegendText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '800'
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8
  },
  sheetHandle: {
    width: 38,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10
  },
  stationInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  hubBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3
  },
  hubTypeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  hubTypeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#059669'
  },
  fastChargeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669'
  },
  sheetStationName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827'
  },
  sheetStationAddress: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1
  },
  capacityBadge: {
    backgroundColor: '#F5F2EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DEC9'
  },
  capacityNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669'
  },
  capacitySub: {
    fontSize: 9,
    color: '#786B59',
    fontWeight: '700'
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 8,
    gap: 6
  },
  transitText: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
    flex: 1
  },
  vehiclesListTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
    marginBottom: 8
  },
  stationVehiclesRow: {
    gap: 10
  },
  miniVehCard: {
    width: 152,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  miniImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#F5F2EB'
  },
  miniInfo: {
    padding: 8
  },
  miniTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827'
  },
  miniPlate: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1
  },
  miniBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5
  },
  miniPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669'
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2
  },
  miniBattery: {
    fontSize: 9,
    color: '#059669',
    fontWeight: '800'
  }
});
