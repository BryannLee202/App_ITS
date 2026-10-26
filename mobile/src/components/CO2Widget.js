import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

export default function CO2Widget({ eco }) {
  if (!eco) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="leaf-outline" size={14} color="#00A896" />
          <Text style={styles.title}>CHỈ SỐ TIẾT GIẢM PHÁT THẢI (GREEN MOBILITY INDEX)</Text>
        </View>
        <View style={styles.ptsPill}>
          <Text style={styles.ptsText}>+{eco.ecoPointsEarned} ECO POINTS</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CO₂ TIẾT GIẢM</Text>
          <Text style={styles.metricValue}>{eco.co2SavedKg} <Text style={styles.metricUnit}>KG</Text></Text>
          <Text style={styles.metricSub}>So với xe xăng</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>QUÃNG ĐƯỜNG</Text>
          <Text style={styles.metricValue}>{eco.distanceKm} <Text style={styles.metricUnit}>KM</Text></Text>
          <Text style={styles.metricSub}>Vận hành thuần điện</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>QUY ĐỔI MÔI TRƯỜNG</Text>
          <Text style={styles.metricValue}>{eco.treesEquivalent} <Text style={styles.metricUnit}>CÂY</Text></Text>
          <Text style={styles.metricSub}>Hấp thụ tương đương</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E6F8F6',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#B3E5DF',
    marginVertical: 8
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  title: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0A3641',
    letterSpacing: 0.6
  },
  ptsPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#80CBC4'
  },
  ptsText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00A896',
    letterSpacing: 0.4
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#D5EBE7'
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#D5EBE7'
  },
  metricLabel: {
    fontSize: 8,
    color: '#4A6B74',
    fontWeight: '700',
    letterSpacing: 0.4
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A2533',
    marginTop: 2
  },
  metricUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00A896'
  },
  metricSub: {
    fontSize: 8,
    color: '#7D9DA6',
    marginTop: 1
  }
});
