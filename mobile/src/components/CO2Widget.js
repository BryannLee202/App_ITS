import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CO2Widget({ eco }) {
  if (!eco) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.mintIcon}>
            <Ionicons name="leaf" size={12} color="#059669" />
          </View>
          <Text style={styles.title}>CHỈ SỐ GIAO THÔNG XANH (NET-ZERO ESG)</Text>
        </View>
        <View style={styles.ptsPill}>
          <Text style={styles.ptsText}>+{eco.ecoPointsEarned} ECO PTS</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CO₂ TIẾT GIẢM</Text>
          <Text style={styles.metricValue}>
            {eco.co2SavedKg} <Text style={styles.metricUnit}>kg</Text>
          </Text>
          <Text style={styles.metricSub}>So với xe xăng</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>QUÃNG ĐƯỜNG</Text>
          <Text style={styles.metricValue}>
            {eco.distanceKm} <Text style={styles.metricUnit}>km</Text>
          </Text>
          <Text style={styles.metricSub}>Di chuyển thuần điện</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CÂY XANH TƯƠNG ĐƯƠNG</Text>
          <Text style={styles.metricValue}>
            {eco.treesEquivalent} <Text style={styles.metricUnit}>cây</Text>
          </Text>
          <Text style={styles.metricSub}>Hấp thụ CO₂/năm</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 8
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
  mintIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.4
  },
  ptsPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  ptsText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F2EB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: '#E5DEC9'
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#786B59',
    marginBottom: 2
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827'
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669'
  },
  metricSub: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 1,
    fontWeight: '600'
  }
});
