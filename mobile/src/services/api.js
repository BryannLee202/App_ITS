// API Service for ITS Vehicle Rental System

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[API] Fetch failed for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Auth endpoints
  async requestOtp(phone, channel = 'ZALO') {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, channel })
    });
  }

  async verifyOtp(phone, otp) {
    const data = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Vehicles & Stations
  async getVehicles(category = '') {
    const query = category && category !== 'ALL' ? `?category=${category}` : '';
    return this.request(`/vehicles${query}`);
  }

  async getVehicleById(id) {
    return this.request(`/vehicles/${id}`);
  }

  async getStations(lat = null, lng = null, areaName = '') {
    const params = [];
    if (lat !== null && lng !== null) {
      params.push(`lat=${encodeURIComponent(lat)}`);
      params.push(`lng=${encodeURIComponent(lng)}`);
    }
    if (areaName) {
      params.push(`areaName=${encodeURIComponent(areaName)}`);
    }
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.request(`/vehicles/stations${query}`);
  }

  // Real OpenStreetMap Nominatim Reverse Geocoding in Saigon
  async reverseGeocodeSaigon(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        const street = a.road || a.pedestrian || a.suburb || '';
        const ward = a.quarter || a.neighbourhood || a.suburb || a.village || '';
        const district = a.city_district || a.county || a.town || a.city || 'TP.HCM';
        const parts = [street, ward, district].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : data.display_name;
      }
      return data?.display_name || null;
    } catch (e) {
      return null;
    }
  }

  // Real OpenStreetMap Overpass API for live EV Charging Stations & Car Rentals in Saigon
  async fetchLiveOsmStations(lat, lng, radiusMeters = 3500) {
    try {
      const query = `[out:json][timeout:8];(node["amenity"="charging_station"](around:${radiusMeters},${lat},${lng});node["amenity"="car_rental"](around:${radiusMeters},${lat},${lng}););out body 12;`;
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (!data || !Array.isArray(data.elements)) return [];

      return data.elements
        .filter((el) => el.lat && el.lon)
        .map((el, idx) => {
          const isCharger = el.tags?.amenity === 'charging_station';
          const rawName =
            el.tags?.name ||
            el.tags?.operator ||
            (isCharger ? `Trạm Sạc Điện EV #${idx + 1}` : `Điểm Thuê Xe #${idx + 1}`);
          const street = el.tags?.['addr:street'] || 'TP. Hồ Chí Minh';
          const housenumber = el.tags?.['addr:housenumber'] || '';
          return {
            id: `osm-${el.id}`,
            name: rawName,
            address: `${housenumber ? housenumber + ' ' : ''}${street} (Dữ liệu OpenStreetMap Live)`,
            coordinates: {
              latitude: el.lat,
              longitude: el.lon
            },
            category: isCharger ? 'CHARGER' : 'RENTAL',
            type: isCharger ? 'OSM_CHARGER' : 'OSM_RENTAL',
            capacity: isCharger ? 10 : 8,
            availableVehicles: isCharger ? 2 : 5,
            hasFastCharger: true,
            chargerPowerKw: isCharger ? 150 : 60,
            availablePorts: 4,
            totalPorts: 6,
            chargingPriceKwh: 3858,
            connectorTypes: ['CCS2 DC', 'Type 2 AC 22kW'],
            nearbyTransit: ['Trạm thực tế từ OpenStreetMap Sài Gòn'],
            isLiveOsm: true
          };
        });
    } catch (e) {
      return [];
    }
  }

  // Rentals & Digital Key Controls
  async getBookingQuote(quoteData) {
    return this.request('/rentals/quote', {
      method: 'POST',
      body: JSON.stringify(quoteData)
    });
  }

  async getVouchers() {
    return this.request('/rentals/vouchers');
  }

  async getActiveTrip() {
    return this.request('/rentals/active');
  }

  async bookVehicle(bookingData) {
    return this.request('/rentals/book', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async controlVehicle(tripId, command) {
    return this.request('/rentals/control', {
      method: 'POST',
      body: JSON.stringify({ tripId, command })
    });
  }

  async completeTrip(tripId, targetStationId) {
    return this.request('/rentals/complete', {
      method: 'POST',
      body: JSON.stringify({ tripId, targetStationId })
    });
  }

  async getTripHistory() {
    return this.request('/rentals/history');
  }

  // ITS Advisory & Traffic Analytics
  async getGreenWaveAdvisory(distanceMeters = 300, currentSpeedKmh = 40) {
    return this.request(`/its/green-wave?distanceMeters=${distanceMeters}&currentSpeedKmh=${currentSpeedKmh}`);
  }

  async getCorridors() {
    return this.request('/its/corridors');
  }
}

export default new ApiService();
