import { Platform, NativeModules } from 'react-native';

/**
 * Dynamically resolves backend host for both Web, Localhost, and Physical Mobile devices
 * (When running via Expo Go on phone over LAN Wi-Fi).
 */
export const getBackendHost = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      const hostname = window.location.hostname;
      return `http://${hostname}:5000`;
    }
    return 'http://localhost:5000';
  }

  // React Native Mobile (Expo Go)
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const address = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
    if (address && address !== 'localhost' && address !== '127.0.0.1') {
      return `http://${address}:5000`;
    }
  }

  // Fallback to local LAN IP of the development host
  return 'http://192.168.1.168:5000';
};

export const API_BASE_URL = `${getBackendHost()}/api`;
