import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

export default function Header({ user, onNotificationPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={17} color="#00A896" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.subGreeting}>HỆ THỐNG THUÊ PHƯƠNG TIỆN XANH THÔNG MINH</Text>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.fullName || 'Nguyễn Văn An'}</Text>
            {user?.isEkycVerified && (
              <View style={styles.ekycBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
                <Text style={styles.ekycText}>eKYC XÁC THỰC</Text>
              </View>
            )}
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#00A896" />
            <Text style={styles.locationText}>Khu vực: TP. Hồ Chí Minh • Trục UTH Bình Thạnh</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.notifButton}
        onPress={onNotificationPress}
        activeOpacity={0.8}
      >
        <Ionicons name="notifications-outline" size={19} color="#0A2533" />
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
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#E0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#B2DFDB'
  },
  userInfo: {
    justifyContent: 'center',
    flex: 1
  },
  subGreeting: {
    fontSize: 9,
    fontWeight: '800',
    color: '#008E7B',
    letterSpacing: 0.6
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.2
  },
  ekycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BFA5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 3
  },
  ekycText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.4
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2
  },
  locationText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600'
  },
  notifButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    marginLeft: 8
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626'
  }
});
