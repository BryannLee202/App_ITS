import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export default function Header({ user, onNotificationPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Xin chào 👋</Text>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.fullName || 'Nguyễn Văn An'}</Text>
            {user?.isEkycVerified && (
              <View style={styles.ekycBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.ekycText}>eKYC Đã duyệt</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.notifButton} onPress={onNotificationPress} activeOpacity={0.8}>
        <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight
  },
  userInfo: {
    justifyContent: 'center'
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SPACING.sm
  },
  ekycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 2
  },
  ekycText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700'
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.surface
  }
});
