import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export default function Header({ user, onNotificationPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={18} color="#4F46E5" />
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.fullName || 'Nguyễn Văn An'}</Text>
            {user?.isEkycVerified && (
              <View style={styles.ekycBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
                <Text style={styles.ekycText}>eKYC</Text>
              </View>
            )}
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={11} color="#4F46E5" />
            <Text style={styles.locationText}>Bình Thạnh, TP.HCM</Text>
            <Ionicons name="chevron-down" size={11} color="#94A3B8" />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.notifButton}
        onPress={onNotificationPress}
        activeOpacity={0.8}
      >
        <Ionicons name="notifications-outline" size={20} color="#0F172A" />
        <View style={styles.notifDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE'
  },
  userInfo: {
    justifyContent: 'center'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  ekycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 999,
    gap: 2
  },
  ekycText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '800'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600'
  },
  notifButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative'
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  }
});
