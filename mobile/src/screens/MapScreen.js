import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import ApiService from '../services/api';
import BookingModal from '../components/BookingModal';

function calcHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

const INITIAL_SAIGON_STATIONS = [
  {
    id: 'hub-chuvanan-01',
    name: 'EcoGo Hub & Trạm Sạc - Chu Văn An (Bình Thạnh)',
    address: '85 Chu Văn An, Phường 26, Quận Bình Thạnh, TP.HCM',
    coordinates: { latitude: 10.8116, longitude: 106.7094 },
    category: 'BOTH',
    type: 'URBAN_HUB',
    capacity: 16,
    availableVehicles: 7,
    hasFastCharger: true,
    chargerPowerKw: 180,
    availablePorts: 5,
    totalPorts: 6,
    chargingPriceKwh: 3858,
    distanceKm: 0.15
  },
  {
    id: 'charger-dinhbolinh-01',
    name: 'Trạm Siêu Sạc EV 250kW - Đinh Bộ Lĩnh',
    address: '292 Đinh Bộ Lĩnh, Phường 26, Quận Bình Thạnh, TP.HCM',
    coordinates: { latitude: 10.8142, longitude: 106.7118 },
    category: 'CHARGER',
    type: 'SUPERCHARGER',
    capacity: 24,
    availableVehicles: 5,
    hasFastCharger: true,
    chargerPowerKw: 250,
    availablePorts: 8,
    totalPorts: 10,
    chargingPriceKwh: 3858,
    distanceKm: 0.42
  },
  {
    id: 'hub-uth-01',
    name: 'EcoGo Hub & Trạm Sạc - ĐH GTVT (UTH Bình Thạnh)',
    address: 'Số 2 Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM',
    coordinates: { latitude: 10.8018, longitude: 106.7142 },
    category: 'BOTH',
    type: 'CAMPUS_HUB',
    capacity: 20,
    availableVehicles: 8,
    hasFastCharger: true,
    chargerPowerKw: 150,
    availablePorts: 5,
    totalPorts: 6,
    chargingPriceKwh: 3858,
    distanceKm: 1.15
  },
  {
    id: 'hub-landmark-01',
    name: 'EcoGo Smart Station - Tân Cảng & Landmark 81',
    address: '720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP.HCM',
    coordinates: { latitude: 10.7952, longitude: 106.7218 },
    category: 'BOTH',
    type: 'URBAN_HUB',
    capacity: 25,
    availableVehicles: 11,
    hasFastCharger: true,
    chargerPowerKw: 250,
    availablePorts: 7,
    totalPorts: 10,
    chargingPriceKwh: 3858,
    distanceKm: 2.1
  },
  {
    id: 'charger-thaodien-01',
    name: 'Trạm Sạc Nhanh EV & Hub - Thảo Điền Pearl',
    address: '12 Quốc Hương, Phường Thảo Điền, TP. Thủ Đức, TP.HCM',
    coordinates: { latitude: 10.8032, longitude: 106.7328 },
    category: 'CHARGER',
    type: 'SUPERCHARGER',
    capacity: 16,
    availableVehicles: 5,
    hasFastCharger: true,
    chargerPowerKw: 180,
    availablePorts: 4,
    totalPorts: 6,
    chargingPriceKwh: 3858,
    distanceKm: 2.7
  },
  {
    id: 'hub-metro-01',
    name: 'EcoGo Multimodal Station - Ga Trung Tâm Bến Thành',
    address: 'Quảng trường Quách Thị Trang, P. Bến Thành, Quận 1, TP.HCM',
    coordinates: { latitude: 10.7719, longitude: 106.6983 },
    category: 'BOTH',
    type: 'METRO_INTERCHANGE',
    capacity: 35,
    availableVehicles: 14,
    hasFastCharger: true,
    chargerPowerKw: 150,
    availablePorts: 6,
    totalPorts: 8,
    chargingPriceKwh: 3858,
    distanceKm: 4.5
  },
  {
    id: 'hub-ndt-01',
    name: 'EcoGo Hub & Trạm Sạc Nhanh - Nguyễn Duy Trinh',
    address: '672 Nguyễn Duy Trinh, P. Bình Trưng Đông, TP. Thủ Đức, TP.HCM',
    coordinates: { latitude: 10.7884, longitude: 106.7689 },
    category: 'BOTH',
    type: 'URBAN_HUB',
    capacity: 18,
    availableVehicles: 7,
    hasFastCharger: true,
    chargerPowerKw: 180,
    availablePorts: 6,
    totalPorts: 8,
    chargingPriceKwh: 3858,
    distanceKm: 6.8
  }
];

const SAIGON_QUICK_AREAS = [
  {
    id: 'area-cva',
    name: 'Hẻm 71 Chu Văn An, Phường 26, Q. Bình Thạnh',
    lat: 10.8112,
    lng: 106.7088
  },
  {
    id: 'area-uth',
    name: 'ĐH GTVT (UTH) - Số 2 Võ Oanh, Q. Bình Thạnh',
    lat: 10.8018,
    lng: 106.7142
  },
  {
    id: 'area-ndt',
    name: 'Nguyễn Duy Trinh, P. Bình Trưng Đông, TP. Thủ Đức',
    lat: 10.7884,
    lng: 106.7689
  },
  {
    id: 'area-thaodien',
    name: 'Thảo Điền & An Phú, TP. Thủ Đức (Quận 2)',
    lat: 10.8032,
    lng: 106.7328
  },
  {
    id: 'area-q1',
    name: 'Chợ Bến Thành & Nguyễn Huệ, Quận 1',
    lat: 10.7719,
    lng: 106.6983
  },
  {
    id: 'area-q7',
    name: 'Phú Mỹ Hưng & Crescent Mall, Quận 7',
    lat: 10.7292,
    lng: 106.7186
  }
];

export default function MapScreen({
  theme = THEME_PRESETS.MINT,
  navigation,
  onSelectVehicle,
  onNavigateToKey
}) {
  // Default to Chu Văn An, Bình Thạnh (automatically updated by Browser GPS)
  const [userLocation, setUserLocation] = useState({
    latitude: 10.8112,
    longitude: 106.7088,
    address: 'Hẻm 71 Chu Văn An, Phường 26, Q. Bình Thạnh',
    isLiveGps: true
  });
  const [gpsStatusMsg, setGpsStatusMsg] = useState('Vị trí hiện tại của bạn');
  const [locatingGps, setLocatingGps] = useState(false);

  // Filter: 'ALL' | 'RENTAL' | 'CHARGER'
  const [mapFilter, setMapFilter] = useState('ALL');
  const [stations, setStations] = useState(INITIAL_SAIGON_STATIONS);
  const [vehicles, setVehicles] = useState([]);
  const [selectedStation, setSelectedStation] = useState(INITIAL_SAIGON_STATIONS[0]);
  const [routeSummary, setRouteSummary] = useState({ distanceKm: '0.3', durationMin: 2 });

  // Modals & Actions
  const [bookingVehicle, setBookingVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customSearchAddress, setCustomSearchAddress] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [reservedChargerToast, setReservedChargerToast] = useState(null);

  useEffect(() => {
    loadStationsAndVehicles(
      userLocation.latitude,
      userLocation.longitude,
      userLocation.address
    );
    requestRealBrowserGps();
  }, []);

  const requestRealBrowserGps = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      setLocatingGps(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const revAddr = await ApiService.reverseGeocodeSaigon(lat, lng);
          const cleanAddr = revAddr || `Vị trí GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

          setUserLocation({
            latitude: lat,
            longitude: lng,
            address: cleanAddr,
            isLiveGps: true
          });
          setGpsStatusMsg('Vị trí hiện tại của bạn');
          setLocatingGps(false);

          await loadStationsAndVehicles(lat, lng, cleanAddr);
        },
        () => {
          setLocatingGps(false);
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 15000 }
      );
    }
  };

  const handleSearchCustomSaigonAddress = async () => {
    if (!customSearchAddress.trim()) return;
    try {
      setSearchingAddress(true);
      const q = `${customSearchAddress.trim()}, Hồ Chí Minh, Việt Nam`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&accept-language=vi`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const label = data[0].display_name.split(',').slice(0, 3).join(',');
        setUserLocation({
          latitude: lat,
          longitude: lng,
          address: label,
          isLiveGps: true
        });
        setShowLocationModal(false);
        setCustomSearchAddress('');
        await loadStationsAndVehicles(lat, lng, label);
      }
    } catch (e) {
      console.warn('Geocode error:', e.message);
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleSelectQuickArea = async (area) => {
    setUserLocation({
      latitude: area.lat,
      longitude: area.lng,
      address: area.name,
      isLiveGps: true
    });
    setShowLocationModal(false);
    await loadStationsAndVehicles(area.lat, area.lng, area.name);
  };

  const loadStationsAndVehicles = async (lat, lng, areaLabel) => {
    // 1. Immediately compute distances on fallback stations so UI is NEVER empty
    const immediateList = INITIAL_SAIGON_STATIONS.map((st) => ({
      ...st,
      distanceKm: calcHaversineKm(lat, lng, st.coordinates.latitude, st.coordinates.longitude)
    })).sort((a, b) => a.distanceKm - b.distanceKm);

    setStations(immediateList);
    setSelectedStation(immediateList[0]);

    // 2. Fetch backend stations & vehicles without blocking on slow Overpass API
    try {
      const [stRes, vRes] = await Promise.all([
        ApiService.getStations(lat, lng, areaLabel).catch(() => null),
        ApiService.getVehicles().catch(() => null)
      ]);

      if (vRes && Array.isArray(vRes.vehicles)) {
        setVehicles(vRes.vehicles);
      }

      const backendStations =
        stRes && Array.isArray(stRes.stations) && stRes.stations.length > 0
          ? stRes.stations
          : immediateList;

      setStations(backendStations);
      setSelectedStation(backendStations[0]);

      // 3. Background non-blocking fetch for additional live OpenStreetMap nodes
      ApiService.fetchLiveOsmStations(lat, lng, 3000)
        .then((osmNodes) => {
          if (Array.isArray(osmNodes) && osmNodes.length > 0) {
            const enrichedOsm = osmNodes.map((osm) => ({
              ...osm,
              distanceKm: calcHaversineKm(
                lat,
                lng,
                osm.coordinates.latitude,
                osm.coordinates.longitude
              )
            }));
            const merged = [...backendStations, ...enrichedOsm].sort(
              (a, b) => (a.distanceKm || 99) - (b.distanceKm || 99)
            );
            setStations(merged);
          }
        })
        .catch(() => {});
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
          } else if (data && data.type === 'ROUTE_SUMMARY') {
            setRouteSummary({
              distanceKm: data.distanceKm,
              durationMin: data.durationMin
            });
          }
        } catch (e) {
          // ignore
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [stations]);

  const filteredStations = useMemo(() => {
    if (mapFilter === 'ALL') return stations;
    if (mapFilter === 'RENTAL') {
      return stations.filter((s) => s.category === 'BOTH' || s.category === 'RENTAL' || !s.category);
    }
    if (mapFilter === 'CHARGER') {
      return stations.filter((s) => s.category === 'CHARGER' || s.category === 'BOTH' || s.hasFastCharger);
    }
    return stations;
  }, [stations, mapFilter]);

  const getVehiclesAtStation = (stationId) => {
    const exact = vehicles.filter((v) => v.stationId === stationId);
    if (exact.length > 0) return exact;
    return vehicles.slice(0, 4);
  };

  const handleReserveChargingPort = (station) => {
    setReservedChargerToast(
      `Đã giữ trụ sạc nhanh ${station.chargerPowerKw || 180}kW CCS2 tại ${station.name} trong 15 phút.`
    );
    setTimeout(() => {
      setReservedChargerToast(null);
    }, 3500);
  };

  // Interactive Leaflet HTML using Official OpenStreetMap Standard Tiles (NO API KEY EVER REQUIRED!)
  const leafletSrcDoc = useMemo(() => {
    const uLat = userLocation.latitude;
    const uLng = userLocation.longitude;
    const selLat = selectedStation?.coordinates?.latitude || uLat;
    const selLng = selectedStation?.coordinates?.longitude || uLng;
    const mintColor = theme.primary || '#0CA678';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="referrer" content="origin" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #FFFFFF;
          }
          .leaflet-tile-pane {
            filter: saturate(0.95) contrast(1.0) brightness(1.03);
          }
          .user-gps-wrap {
            position: relative;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .user-gps-pulse {
            position: absolute;
            width: 38px;
            height: 38px;
            border-radius: 19px;
            background: rgba(2, 132, 199, 0.28);
            animation: pulse 1.8s infinite;
          }
          .user-gps-dot {
            position: relative;
            width: 14px;
            height: 14px;
            border-radius: 7px;
            background: #0284C7;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
          @keyframes pulse {
            0% { transform: scale(0.8); opacity: 0.9; }
            100% { transform: scale(1.75); opacity: 0; }
          }
          .hub-pill {
            background: #FFFFFF;
            color: #1D1D1F;
            padding: 5px 10px;
            border-radius: 99px;
            font-weight: 700;
            font-size: 11px;
            border: 2px solid ${mintColor};
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
          }
          .charger-pill {
            background: #FFFBEB;
            color: #92400E;
            padding: 5px 10px;
            border-radius: 99px;
            font-weight: 700;
            font-size: 11px;
            border: 2px solid #F59E0B;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
          }
          .pill-active {
            background: #1D1D1F !important;
            color: #FFFFFF !important;
            border-color: #1D1D1F !important;
            transform: scale(1.08);
            z-index: 999 !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${uLat}, ${uLng}], 15);

          // Official OpenStreetMap Standard Tile Server (100% Free, No API Key Required)
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // 1. Render User Live GPS Marker
          const userIcon = L.divIcon({
            className: '',
            html: '<div class="user-gps-wrap"><div class="user-gps-pulse"></div><div class="user-gps-dot"></div></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });
          L.marker([${uLat}, ${uLng}], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>Vị trí của bạn</b><br/>${userLocation.address.replace(/'/g, '')}');

          // 2. Render Rental Hubs & EV Charging Stations
          const stations = ${JSON.stringify(filteredStations)};
          const selectedId = ${JSON.stringify(selectedStation?.id || '')};

          stations.forEach(st => {
            const isSelected = st.id === selectedId;
            const isPureCharger = st.category === 'CHARGER';
            const badgeText = isPureCharger
              ? '⚡ Sạc ' + (st.chargerPowerKw || 180) + 'kW · ' + (st.availablePorts || 5) + ' cổng'
              : '🚗 ' + (st.availableVehicles || 6) + ' xe · ⚡ ' + (st.chargerPowerKw || 150) + 'kW';

            const cls = (isPureCharger ? 'charger-pill ' : 'hub-pill ') + (isSelected ? 'pill-active' : '');
            const icon = L.divIcon({
              className: '',
              html: '<div class="' + cls + '">' + badgeText + '</div>',
              iconSize: [142, 30],
              iconAnchor: [71, 15]
            });

            const marker = L.marker([st.coordinates.latitude, st.coordinates.longitude], { icon }).addTo(map);
            marker.on('click', () => {
              window.parent.postMessage(JSON.stringify({ type: 'SELECT_STATION', stationId: st.id }), '*');
            });
          });

          // 3. Real Turn-by-Turn Road Routing via OSRM API from User GPS to Selected Station
          if (${selectedStation ? 'true' : 'false'}) {
            const url = 'https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${selLng},${selLat}?overview=full&geometries=geojson';
            fetch(url)
              .then(r => r.json())
              .then(data => {
                if (data && data.routes && data.routes.length > 0) {
                  const route = data.routes[0];
                  const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
                  L.polyline(coords, {
                    color: '${mintColor}',
                    weight: 5,
                    opacity: 0.92
                  }).addTo(map);

                  const distKm = (route.distance / 1000).toFixed(1);
                  const durMin = Math.max(1, Math.round(route.duration / 60));
                  window.parent.postMessage(JSON.stringify({
                    type: 'ROUTE_SUMMARY',
                    distanceKm: distKm,
                    durationMin: durMin
                  }), '*');
                }
              })
              .catch(() => {
                L.polyline([[${uLat}, ${uLng}], [${selLat}, ${selLng}]], {
                  color: '${mintColor}',
                  weight: 3,
                  dashArray: '6, 6'
                }).addTo(map);
              });
          }
        </script>
      </body>
      </html>
    `;
  }, [userLocation, filteredStations, selectedStation, theme.primary]);

  const isChargerFocus =
    mapFilter === 'CHARGER' || selectedStation?.category === 'CHARGER';

  return (
    <View style={styles.container}>
      {/* ============================================================
          1. TOP LIVE GPS BAR & 3-MODE FILTER (TẤT CẢ / THUÊ XE / TRẠM SẠC)
         ============================================================ */}
      <View style={styles.topOverlay}>
        <View style={styles.gpsBar}>
          <TouchableOpacity
            style={styles.gpsLocationLeft}
            activeOpacity={0.85}
            onPress={() => setShowLocationModal(true)}
          >
            <View style={styles.blueGpsDotOuter}>
              <View style={styles.blueGpsDotInner} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsSmallLabel}>{gpsStatusMsg}</Text>
              <Text style={styles.gpsAddressText} numberOfLines={1}>
                {userLocation.address}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={14} color="#6E6E73" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.locateMeBtn, { backgroundColor: theme.primarySoft }]}
            activeOpacity={0.85}
            onPress={requestRealBrowserGps}
          >
            {locatingGps ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Ionicons name="locate" size={14} color={theme.primary} />
                <Text style={[styles.locateMeText, { color: theme.primary }]}>Định vị</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 3-Tab Filter: Tất cả | Điểm thuê xe | Trạm sạc EV */}
        <View style={styles.filterTabsRow}>
          {[
            { id: 'ALL', label: `Tất cả (${stations.length})`, icon: 'layers-outline' },
            { id: 'RENTAL', label: 'Điểm thuê xe', icon: 'car-sport-outline' },
            { id: 'CHARGER', label: 'Trạm sạc EV', icon: 'flash-outline' }
          ].map((tab) => {
            const active = mapFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterTabPill, active && styles.filterTabPillActive]}
                onPress={() => {
                  setMapFilter(tab.id);
                  const nextList =
                    tab.id === 'CHARGER'
                      ? stations.filter((s) => s.category === 'CHARGER' || s.hasFastCharger)
                      : tab.id === 'RENTAL'
                      ? stations.filter((s) => s.category !== 'CHARGER')
                      : stations;
                  if (nextList.length > 0) setSelectedStation(nextList[0]);
                }}
              >
                <Ionicons
                  name={tab.icon}
                  size={13}
                  color={active ? '#FFFFFF' : '#1D1D1F'}
                />
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ============================================================
          2. REAL INTERACTIVE OPENSTREETMAP WITH OSRM ROUTING
         ============================================================ */}
      <View style={styles.mapCanvas}>
        {Platform.OS === 'web' ? (
          <iframe
            title="EcoGo Live Saigon OpenStreetMap"
            srcDoc={leafletSrcDoc}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <View style={styles.nativeMapFallback}>
            <Text style={styles.nativeFallbackText}>Bản đồ Trạm EcoGo TP.HCM</Text>
          </View>
        )}

        {reservedChargerToast && (
          <View style={styles.chargerToast}>
            <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
            <Text style={styles.chargerToastText}>{reservedChargerToast}</Text>
          </View>
        )}
      </View>

      {/* ============================================================
          3. BOTTOM SHEET: RENTAL HUB OR EV CHARGING STATION DETAILS
         ============================================================ */}
      {selectedStation && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.stationInfoRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View style={styles.badgeLine}>
                <View
                  style={[
                    styles.typeTag,
                    isChargerFocus
                      ? { backgroundColor: '#FEF3C7' }
                      : { backgroundColor: theme.primarySoft }
                  ]}
                >
                  <Ionicons
                    name={isChargerFocus ? 'flash' : 'car-sport'}
                    size={11}
                    color={isChargerFocus ? '#B45309' : theme.primary}
                  />
                  <Text
                    style={[
                      styles.typeTagText,
                      { color: isChargerFocus ? '#B45309' : theme.primary }
                    ]}
                  >
                    {isChargerFocus
                      ? `Trạm siêu sạc ${selectedStation.chargerPowerKw || 180}kW`
                      : 'Điểm thuê xe & Trạm sạc nhanh'}
                  </Text>
                </View>

                {routeSummary && (
                  <View style={styles.routeChip}>
                    <Ionicons name="navigate" size={10} color={theme.primary} />
                    <Text style={styles.routeChipText}>
                      Cách {routeSummary.distanceKm} km · {routeSummary.durationMin} phút
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.sheetStationName} numberOfLines={1}>
                {selectedStation.name}
              </Text>
              <Text style={styles.sheetStationAddress} numberOfLines={1}>
                {selectedStation.address}
              </Text>
            </View>
          </View>

          {/* Horizontal Quick Switcher for Nearby Stations */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nearbySmallRow}
          >
            {filteredStations.slice(0, 6).map((st) => {
              const active = selectedStation?.id === st.id;
              const shortName = (st.name.split('-')[1] || st.name).trim();
              return (
                <TouchableOpacity
                  key={st.id}
                  style={[
                    styles.nearbySmallChip,
                    active && { backgroundColor: '#1D1D1F', borderColor: '#1D1D1F' }
                  ]}
                  onPress={() => setSelectedStation(st)}
                >
                  <Text
                    style={[
                      styles.nearbySmallChipText,
                      active && { color: '#FFFFFF', fontWeight: '600' }
                    ]}
                    numberOfLines={1}
                  >
                    {shortName} {st.distanceKm !== undefined ? `(${st.distanceKm}km)` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* MODE A: EV CHARGING STATION VIEW */}
          {isChargerFocus ? (
            <View style={styles.chargerDetailBox}>
              <View style={[styles.chargerSpecsRow, { backgroundColor: theme.beigeSoft }]}>
                <View style={styles.chargerSpecCol}>
                  <Text style={[styles.chargerSpecVal, { color: theme.primary }]}>
                    {selectedStation.availablePorts || 6}/{selectedStation.totalPorts || 8} cổng
                  </Text>
                  <Text style={styles.chargerSpecLbl}>Trụ đang trống</Text>
                </View>
                <View style={styles.specVertDivider} />
                <View style={styles.chargerSpecCol}>
                  <Text style={styles.chargerSpecVal}>
                    DC {selectedStation.chargerPowerKw || 180}kW
                  </Text>
                  <Text style={styles.chargerSpecLbl}>CCS2 · 18p đầy 80%</Text>
                </View>
                <View style={styles.specVertDivider} />
                <View style={styles.chargerSpecCol}>
                  <Text style={styles.chargerSpecVal}>3.858đ</Text>
                  <Text style={styles.chargerSpecLbl}>Đơn giá / kWh</Text>
                </View>
              </View>

              <View style={styles.chargerActionsRow}>
                <TouchableOpacity
                  style={[styles.reservePortBtn, { backgroundColor: '#1D1D1F' }]}
                  activeOpacity={0.85}
                  onPress={() => handleReserveChargingPort(selectedStation)}
                >
                  <Ionicons name="flash" size={15} color="#FFFFFF" />
                  <Text style={styles.reservePortBtnText}>Đặt giữ cổng sạc (15 phút)</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* MODE B: RENTAL VEHICLES AT THIS STATION */
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
                      Pin {Math.round(veh.telematics?.batteryLevelPct || 90)}% · {veh.seats} chỗ
                    </Text>
                    <View style={styles.miniBottomRow}>
                      <Text style={[styles.miniPrice, { color: theme.primary }]}>
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
          )}
        </View>
      )}

      {/* ============================================================
          MODAL: CHOOSE / SEARCH EXACT SAIGON LOCATION
         ============================================================ */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.locModalSheet}>
            <View style={styles.locModalHeader}>
              <Text style={styles.locModalTitle}>Vị trí của bạn tại Sài Gòn</Text>
              <TouchableOpacity
                style={styles.locCloseBtn}
                onPress={() => setShowLocationModal(false)}
              >
                <Ionicons name="close" size={18} color="#1D1D1F" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.useGpsBannerBtn, { backgroundColor: theme.primarySoft }]}
              onPress={() => {
                setShowLocationModal(false);
                requestRealBrowserGps();
              }}
            >
              <Ionicons name="locate" size={18} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.useGpsBannerTitle, { color: theme.primary }]}>
                  Dùng định vị GPS trực tiếp từ trình duyệt
                </Text>
                <Text style={styles.useGpsBannerSub}>
                  Tự động cập nhật trạm thuê xe & trạm sạc quanh vị trí hiện tại
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.searchAddrRow}>
              <Ionicons name="search-outline" size={16} color="#8E8E93" />
              <TextInput
                style={styles.searchAddrInput}
                value={customSearchAddress}
                onChangeText={setCustomSearchAddress}
                placeholder="Nhập tên đường, phường tại TP.HCM (VD: 85 Chu Văn An)..."
                placeholderTextColor="#8E8E93"
                onSubmitEditing={handleSearchCustomSaigonAddress}
              />
              <TouchableOpacity
                style={styles.searchAddrBtn}
                onPress={handleSearchCustomSaigonAddress}
              >
                {searchingAddress ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.searchAddrBtnText}>Tìm</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.quickAreaHeading}>Hoặc chọn nhanh khu vực tại TP.HCM:</Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {SAIGON_QUICK_AREAS.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  style={styles.quickAreaRow}
                  onPress={() => handleSelectQuickArea(area)}
                >
                  <Ionicons name="location-outline" size={18} color={theme.primary} />
                  <Text style={styles.quickAreaText}>{area.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 14,
    gap: 8
  },
  gpsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EBECE8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  gpsLocationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  blueGpsDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  blueGpsDotInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#0284C7'
  },
  gpsSmallLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6E6E73',
    fontWeight: '500'
  },
  gpsAddressText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#1D1D1F',
    fontWeight: '700'
  },
  locateMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4
  },
  locateMeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700'
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 6
  },
  filterTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingVertical: 8,
    borderRadius: 99,
    gap: 5,
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  filterTabPillActive: {
    backgroundColor: '#1D1D1F',
    borderColor: '#1D1D1F'
  },
  filterTabText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  filterTabTextActive: {
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
  chargerToast: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: '#1D1D1F',
    padding: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  chargerToastText: {
    flex: 1,
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 88,
    borderTopWidth: 1,
    borderColor: '#EBECE8'
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8
  },
  stationInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 4
  },
  typeTagText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700'
  },
  routeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 4
  },
  routeChipText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#0284C7'
  },
  sheetStationName: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  sheetStationAddress: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
  },
  nearbySmallRow: {
    paddingVertical: 8,
    gap: 6
  },
  nearbySmallChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: '#F5F5F3',
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  nearbySmallChipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500'
  },
  chargerDetailBox: {
    marginTop: 2
  },
  chargerSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 10
  },
  chargerSpecCol: {
    flex: 1,
    alignItems: 'center'
  },
  specVertDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#EAE4D7'
  },
  chargerSpecVal: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  chargerSpecLbl: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#6E6E73',
    marginTop: 2
  },
  chargerActionsRow: {
    flexDirection: 'row'
  },
  reservePortBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6
  },
  reservePortBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  stationVehiclesRow: {
    gap: 10
  },
  miniVehCard: {
    width: 164,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  miniImage: {
    width: '100%',
    height: 76,
    backgroundColor: '#F2F2F0'
  },
  miniInfo: {
    padding: 8
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
    marginTop: 1
  },
  miniBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  miniPrice: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700'
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end'
  },
  locModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
    paddingBottom: 28
  },
  locModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  locModalTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  locCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  useGpsBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 10,
    marginBottom: 12
  },
  useGpsBannerTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700'
  },
  useGpsBannerSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 2
  },
  searchAddrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F3',
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 4,
    height: 44,
    gap: 8,
    marginBottom: 14
  },
  searchAddrInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#1D1D1F'
  },
  searchAddrBtn: {
    backgroundColor: '#1D1D1F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9
  },
  searchAddrBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  quickAreaHeading: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#6E6E73',
    marginBottom: 8
  },
  quickAreaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F0',
    gap: 10
  },
  quickAreaText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F'
  }
});
