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
  async requestOtp(phone) {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
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

  async getStations() {
    return this.request('/vehicles/stations');
  }

  // Rentals & Digital Key Controls
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
