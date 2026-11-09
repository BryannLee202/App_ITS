import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';

export default function CO2Widget({ eco, accentColor = '#0CA678', softBg = '#EBFBF5' }) {
  if (!eco) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.mintIcon, { backgroundColor: softBg }]}>
            <Ionicons name="leaf" size={13} color={accentColor} />
          </View>
          <Text style={styles.title}>Hiệu quả giảm phát thải chuyến đi</Text>
        </View>
        <View style={[styles.ptsPill, { backgroundColor: softBg }]}>
          <Text style={[styles.ptsText, { color: accentColor }]}>+{eco.ecoPointsEarned} điểm xanh</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {eco.co2SavedKg} <Text style={[styles.metricUnit, { color: accentColor }]}>kg</Text>
          </Text>
          <Text style={styles.metricLabel}>CO₂ tiết giảm</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {eco.distanceKm} <Text style={[styles.metricUnit, { color: accentColor }]}>km</Text>
          </Text>
          <Text style={styles.metricLabel}>Quãng đường xanh</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {eco.treesEquivalent} <Text style={[styles.metricUnit, { color: accentColor }]}>cây</Text>
          </Text>
          <Text style={styles.metricLabel}>Cây xanh tương đương</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBECE8',
    marginVertical: 8
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  mintIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  ptsPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99
  },
  ptsText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700'
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F3EC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#EAE4D7'
  },
  metricValue: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  metricUnit: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600'
  },
  metricLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 2
  }
});
