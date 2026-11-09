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
import { FONTS, THEME_PRESETS } from '../styles/theme';
import ApiService from '../services/api';
import BookingModal from '../components/BookingModal';

export default function MapScreen({
  theme = THEME_PRESETS.MINT,
  navigation,
  onSelectVehicle,
  onNavigateToKey
}) {
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
            const found = stations.find((s) => s.id === data.stationId);
            if (found) setSelectedStation(found);
          } else if (data && data.type === 'SELECT_VEHICLE' && data.vehicleId) {
            const vFound = vehicles.find((v) => v.id === data.vehicleId);
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
    return vehicles.filter((v) => v.stationId === stationId);
  };

  const leafletSrcDoc = useMemo(() => {
    const centerLat = selectedStation?.coordinates?.latitude || 10.8018;
    const centerLng = selectedStation?.coordinates?.longitude || 106.7142;
    const mintColor = theme.primary || '#0CA678';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F6F3EC; }
          .hub-pill {
            background: #FFFFFF;
            color: #1D1D1F;
            padding: 6px 12px;
            border-radius: 99px;
            font-weight: 700;
            font-size: 11px;
            border: 1.5px solid ${mintColor};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
          }
          .hub-dot {
            width: 7px;
            height: 7px;
            border-radius: 4px;
            background: ${mintColor};
            display: inline-block;
          }
          .hub-pill-active {
            background: #1D1D1F;
            color: #FFFFFF;
            border-color: #1D1D1F;
            transform: scale(1.06);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 14);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap • EcoGo Smart'
          }).addTo(map);

          const corridorCoords = [
            [10.8018, 106.7142],
            [10.7985, 106.7175],
            [10.7952, 106.7218],
            [10.7850, 106.7260],
            [10.7758, 106.7245]
          ];
          L.polyline(corridorCoords, {
            color: '${mintColor}',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8'
          }).addTo(map);

          const stations = ${JSON.stringify(stations)};
          const selectedId = ${JSON.stringify(selectedStation?.id || '')};

          stations.forEach(st => {
            const isSelected = st.id === selectedId;
            const shortLabel = (st.name.split('-')[1] || st.name).trim().substring(0, 18);
            const icon = L.divIcon({
              className: '',
              html: '<div class="hub-pill ' + (isSelected ? 'hub-pill-active' : '') + '"><span class="hub-dot"></span>' + st.availableVehicles + ' xe · ' + shortLabel + '</div>',
              iconSize: [148, 32],
              iconAnchor: [74, 16]
            });

            const marker = L.marker([st.coordinates.latitude, st.coordinates.longitude], { icon }).addTo(map);
            marker.on('click', () => {
              window.parent.postMessage(JSON.stringify({ type: 'SELECT_STATION', stationId: st.id }), '*');
            });

            L.circle([st.coordinates.latitude, st.coordinates.longitude], {
              radius: 160,
              color: '${mintColor}',
              fillColor: '${mintColor}',
              fillOpacity: isSelected ? 0.14 : 0.05,
              weight: 1.2
            }).addTo(map);
          });
        </script>
      </body>
      </html>
    `;
  }, [stations, selectedStation, theme.primary]);

  return (
    <View style={styles.container}>
      {/* Floating Apple-Style Top Search & Station Filter Pills */}
      <View style={styles.topOverlay}>
        <View style={styles.mapSearchBox}>
          <View style={[styles.liveDot, { backgroundColor: theme.primary }]} />
          <Text style={styles.mapSearchText} numberOfLines={1}>
            {selectedStation ? selectedStation.name : 'Hệ thống trạm EcoGo TP.HCM'}
          </Text>
          <View style={[styles.stationCountBadge, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.stationCountText, { color: theme.primary }]}>
              {stations.length} trạm
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stationPillsRow}
        >
          {stations.map((station) => {
            const isSelected = selectedStation?.id === station.id;
            const shortName = (station.name.split('-')[1] || station.name).trim();
            return (
              <TouchableOpacity
                key={station.id}
                style={[styles.stationPill, isSelected && styles.stationPillActive]}
                onPress={() => setSelectedStation(station)}
              >
                <View
                  style={[
                    styles.pillDot,
                    { backgroundColor: isSelected ? theme.primaryLight : theme.primary }
                  ]}
                />
                <Text style={[styles.stationPillText, isSelected && styles.stationPillTextActive]}>
                  {shortName} ({station.availableVehicles})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Interactive Map Canvas */}
      <View style={styles.mapCanvas}>
        {Platform.OS === 'web' ? (
          <iframe
            title="EcoGo Interactive Map"
            srcDoc={leafletSrcDoc}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <View style={styles.nativeMapFallback}>
            <Text style={styles.nativeFallbackText}>Bản đồ Trạm EcoGo TP.HCM</Text>
          </View>
        )}
      </View>

      {/* Clean Editorial Bottom Sheet for Selected Station */}
      {selectedStation && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.stationInfoRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.sheetStationName} numberOfLines={1}>
                {selectedStation.name}
              </Text>
              <Text style={styles.sheetStationAddress} numberOfLines={1}>
                {selectedStation.address}
              </Text>
            </View>

            <View style={[styles.capacityBadge, { backgroundColor: theme.beigeSoft }]}>
              <Text style={[styles.capacityNum, { color: theme.primary }]}>
                {selectedStation.availableVehicles}
              </Text>
              <Text style={styles.capacitySub}>xe sẵn sàng</Text>
            </View>
          </View>

          {/* Connected Transit Line */}
          <View style={[styles.transitRow, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="navigate-circle-outline" size={15} color={theme.primary} />
            <Text style={styles.transitText} numberOfLines={1}>
              Kết nối: {selectedStation.nearbyTransit.join(' · ')}
            </Text>
          </View>

          {/* Horizontal Vehicles at Station */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stationVehiclesRow}
          >
            {getVehiclesAtStation(selectedStation.id).map((veh) => (
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
                  <Text style={styles.miniTitle} numberOfLines={1}>
                    {veh.name}
                  </Text>
                  <Text style={styles.miniPlate}>
                    Pin {Math.round(veh.telematics?.batteryLevelPct || 90)}% · {veh.plateNumber}
                  </Text>
                  <View style={styles.miniBottomRow}>
                    <Text style={styles.miniPrice}>
                      {veh.hourlyPrice.toLocaleString('vi-VN')}đ
                      <Text style={styles.miniPriceUnit}>/h</Text>
                    </Text>
                    <View style={styles.bookMiniPill}>
                      <Text style={styles.bookMiniPillText}>Đặt</Text>
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
    backgroundColor: '#F7F7F5'
  },
  topOverlay: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 14
  },
  mapSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EBECE8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  mapSearchText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#1D1D1F',
    fontWeight: '600'
  },
  stationCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99
  },
  stationCountText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700'
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
    paddingVertical: 7,
    borderRadius: 99,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  stationPillActive: {
    backgroundColor: '#1D1D1F',
    borderColor: '#1D1D1F'
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  stationPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  stationPillTextActive: {
    color: '#FFFFFF'
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#F6F3EC',
    position: 'relative'
  },
  nativeMapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nativeFallbackText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#6E6E73'
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 16,
    paddingBottom: 92,
    borderTopWidth: 1,
    borderColor: '#EBECE8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 6
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12
  },
  stationInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sheetStationName: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  sheetStationAddress: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
  },
  capacityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center'
  },
  capacityNum: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800'
  },
  capacitySub: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6E6E73',
    fontWeight: '500'
  },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 12,
    gap: 6
  },
  transitText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#1D1D1F',
    fontWeight: '500',
    flex: 1
  },
  stationVehiclesRow: {
    gap: 10
  },
  miniVehCard: {
    width: 164,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  miniImage: {
    width: '100%',
    height: 88,
    backgroundColor: '#F2F2F0'
  },
  miniInfo: {
    padding: 10
  },
  miniTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  miniPlate: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 2
  },
  miniBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  miniPrice: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  miniPriceUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6E6E73'
  },
  bookMiniPill: {
    backgroundColor: '#1D1D1F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  bookMiniPillText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600'
  }
});
