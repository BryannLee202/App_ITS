import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CO2Widget({ eco }) {
  if (!eco) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.blueKnobIcon}>
            <Ionicons name="leaf" size={11} color="#6E92B5" />
          </View>
          <Text style={styles.title}>CHỈ SỐ TIẾT GIẢM PHÁT THẢI XANH</Text>
        </View>
        <View style={styles.ptsPill}>
          <Text style={styles.ptsText}>+{eco.ecoPointsEarned} ECO PTS</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CO₂ TIẾT GIẢM</Text>
          <Text style={styles.metricValue}>
            {eco.co2SavedKg} <Text style={styles.metricUnit}>KG</Text>
          </Text>
          <Text style={styles.metricSub}>So với xe xăng</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>QUÃNG ĐƯỜNG</Text>
          <Text style={styles.metricValue}>
            {eco.distanceKm} <Text style={styles.metricUnit}>KM</Text>
          </Text>
          <Text style={styles.metricSub}>Thuần điện EV</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>QUY ĐỔI CÂY XANH</Text>
          <Text style={styles.metricValue}>
            {eco.treesEquivalent} <Text style={styles.metricUnit}>CÂY</Text>
          </Text>
          <Text style={styles.metricSub}>Hấp thụ tương đương</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDFBF7',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginVertical: 8,
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  blueKnobIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EBF2F8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2C221E',
    letterSpacing: 0.5
  },
  ptsPill: {
    backgroundColor: '#FCEEE9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  ptsText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DF8268'
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F0E8',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: '#E6D9CE'
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#7A6A63',
    marginBottom: 2
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2C221E'
  },
  metricUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6E92B5'
  },
  metricSub: {
    fontSize: 8,
    color: '#A6968E',
    marginTop: 1,
    fontWeight: '600'
  }
});
