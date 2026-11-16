import { Platform, NativeModules } from 'react-native';

/**
 * Dynamically resolves backend host for both Web, Localhost, and Physical Mobile devices
 * (When running via Expo Go on phone over LAN Wi-Fi).
 */
export const getBackendHost = () => {
  // 1. If configured via environment variable (e.g. on Vercel or production .env)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  }

  // 2. Web & Mobile Web (Vercel, Render, or Localhost)
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const hostname = window.location.hostname;
      // If deployed on Vercel or Cloud Domain (online 24/7)
      if (
        hostname.includes('vercel.app') ||
        hostname.includes('render.com') ||
        hostname.includes('netlify.app')
      ) {
        return 'https://ecogo-backend.onrender.com';
      }
      return `http://${hostname}:5000`;
    }
    return 'http://localhost:5000';
  }

  // 3. React Native Mobile (Expo Go)
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const address = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
    if (address && address !== 'localhost' && address !== '127.0.0.1') {
      return `http://${address}:5000`;
    }
  }

  // Fallback to local LAN IP of the development host
  return 'http://192.168.1.26:5000';
};

export const API_BASE_URL = `${getBackendHost()}/api`;
