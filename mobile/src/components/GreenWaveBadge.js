import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export default function GreenWaveBadge({ glosa }) {
  if (!glosa) return null;

  const isGreen = glosa.signalState === 'GREEN';
  const signalColor = isGreen ? COLORS.success : COLORS.danger;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="git-network-outline" size={18} color={COLORS.secondary} />
          <Text style={styles.badgeTitle}>HỆ THỐNG LÀN SÓNG XANH (GLOSA - ITS)</Text>
        </View>
        <View style={[styles.signalPill, { backgroundColor: signalColor + '20' }]}>
          <View style={[styles.signalDot, { backgroundColor: signalColor }]} />
          <Text style={[styles.signalText, { color: signalColor }]}>
            {isGreen ? 'ĐÈN XANH' : 'ĐÈN ĐỎ'} ({glosa.secondsToSignalChange}s)
          </Text>
        </View>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.speedBox}>
          <Text style={styles.speedLabel}>VẬN TỐC TỐI ƯU</Text>
          <View style={styles.speedValueRow}>
            <Text style={styles.speedNumber}>{glosa.recommendedSpeedKmh}</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        </View>

        <View style={styles.adviceBox}>
          <Text style={styles.adviceText}>{glosa.advisoryMessage}</Text>
          <View style={styles.savingRow}>
            <Ionicons name="flash-outline" size={14} color={COLORS.secondary} />
            <Text style={styles.savingText}>
              Tiết kiệm ~{glosa.fuelSavedEstimatePct}% năng lượng do giảm phanh dừng
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: SPACING.sm
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: SPACING.sm
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  badgeTitle: {
    color: COLORS.secondaryLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 5
  },
  signalDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  signalText: {
    fontSize: 11,
    fontWeight: '700'
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  speedBox: {
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 105,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '50'
  },
  speedLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700'
  },
  speedValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  speedNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800'
  },
  speedUnit: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 3
  },
  adviceBox: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center'
  },
  adviceText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4
  },
  savingText: {
    color: COLORS.secondaryLight,
    fontSize: 10,
    fontWeight: '500'
  }
});
