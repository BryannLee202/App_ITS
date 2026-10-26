import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export default function CO2Widget({ eco }) {
  if (!eco) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="leaf" size={18} color={COLORS.secondary} />
          <Text style={styles.title}>CHỈ SỐ GIAO THÔNG XANH (GREEN MOBILITY)</Text>
        </View>
        <View style={styles.ptsPill}>
          <Ionicons name="sparkles" size={12} color={COLORS.accent} />
          <Text style={styles.ptsText}>+{eco.ecoPointsEarned} Eco Points</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CO₂ Tiết giảm</Text>
          <Text style={styles.metricValue}>{eco.co2SavedKg} <Text style={styles.metricUnit}>kg</Text></Text>
          <Text style={styles.metricSub}>so với xe xăng</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Quãng đường</Text>
          <Text style={styles.metricValue}>{eco.distanceKm} <Text style={styles.metricUnit}>km</Text></Text>
          <Text style={styles.metricSub}>thuần điện EV</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Quy đổi cây xanh</Text>
          <Text style={styles.metricValue}>{eco.treesEquivalent} <Text style={styles.metricUnit}>🌳</Text></Text>
          <Text style={styles.metricSub}>bảo vệ đô thị</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondaryMuted,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondaryLight,
    marginVertical: SPACING.sm
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondaryDark,
    letterSpacing: 0.5
  },
  ptsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 4
  },
  ptsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309'
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border
  },
  metricLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondaryDark
  },
  metricSub: {
    fontSize: 8,
    color: COLORS.textMuted
  }
});
