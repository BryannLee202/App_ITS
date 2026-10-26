import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import ApiService from '../services/api';

export default function TripsHistoryScreen({ onNavigateToKey }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getTripHistory();
      setTrips(res.trips || []);
    } catch (err) {
      console.warn('Load history error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Lịch Sử Chuyến Đi & Hợp Đồng</Text>
        <Text style={styles.subtitle}>
          Quản lý các chuyến đi thông minh và chứng nhận tiết giảm phát thải CO₂
        </Text>
      </View>

      {/* Eco Summary Banner */}
      <View style={styles.ecoSummaryCard}>
        <View style={styles.ecoRow}>
          <View style={styles.ecoItem}>
            <Text style={styles.ecoNum}>42.8</Text>
            <Text style={styles.ecoUnit}>kg CO₂</Text>
            <Text style={styles.ecoLabel}>Đã tiết giảm</Text>
          </View>
          <View style={styles.ecoDivider} />
          <View style={styles.ecoItem}>
            <Text style={styles.ecoNum}>2.14</Text>
            <Text style={styles.ecoUnit}>cây xanh</Text>
            <Text style={styles.ecoLabel}>Bảo vệ tương đương</Text>
          </View>
          <View style={styles.ecoDivider} />
          <View style={styles.ecoItem}>
            <Text style={styles.ecoNum}>340</Text>
            <Text style={styles.ecoUnit}>Eco Points</Text>
            <Text style={styles.ecoLabel}>Tích lũy thưởng</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Danh sách chuyến đi ({trips.length})</Text>

          {trips.map(trip => {
            const isActive = trip.status === 'ACTIVE';
            return (
              <View key={trip.id} style={[styles.tripCard, isActive && styles.activeTripCard]}>
                <View style={styles.tripCardTop}>
                  <View style={styles.contractRow}>
                    <Ionicons name="document-text-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.contractText}>{trip.contractNumber}</Text>
                  </View>
                  <View style={[styles.statusTag, isActive ? styles.statusActive : styles.statusCompleted]}>
                    <Text style={[styles.statusTagText, isActive ? styles.textActive : styles.textCompleted]}>
                      {isActive ? 'ĐANG DI CHUYỂN' : 'HOÀN THÀNH'}
                    </Text>
                  </View>
                </View>

                <View style={styles.tripBody}>
                  <Image
                    source={{ uri: trip.vehicle?.thumbnail || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80' }}
                    style={styles.vehImg}
                  />
                  <View style={styles.tripDetails}>
                    <Text style={styles.vehName}>{trip.vehicle?.name || 'VinFast VF 8'}</Text>
                    <Text style={styles.plate}>{trip.vehicle?.plateNumber || '51K-882.91'}</Text>

                    <View style={styles.statsRow}>
                      <Text style={styles.statItem}>
                        Quãng đường: <Text style={styles.statBold}>{trip.distanceTraveledKm} km</Text>
                      </Text>
                      <Text style={styles.statItem}>
                        CO₂ giảm: <Text style={[styles.statBold, { color: COLORS.secondaryDark }]}>{trip.co2SavedKg} kg</Text>
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tripFooter}>
                  <View>
                    <Text style={styles.costLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.costVal}>
                      {trip.estimatedTotal?.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>

                  {isActive ? (
                    <TouchableOpacity
                      style={styles.activeKeyBtn}
                      onPress={onNavigateToKey}
                    >
                      <Ionicons name="key" size={14} color="#FFFFFF" />
                      <Text style={styles.activeKeyBtnText}>Mở Điều Khiển</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.receiptBtn}>
                      <Ionicons name="receipt-outline" size={14} color={COLORS.primary} />
                      <Text style={styles.receiptBtnText}>Hóa đơn & Hợp đồng</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 90
  },
  headerSection: {
    marginBottom: SPACING.md
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  ecoSummaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg
  },
  ecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ecoItem: {
    flex: 1,
    alignItems: 'center'
  },
  ecoDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#334155'
  },
  ecoNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondaryLight
  },
  ecoUnit: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600'
  },
  ecoLabel: {
    fontSize: 9,
    color: '#CBD5E1',
    marginTop: 2
  },
  listSection: {},
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm
  },
  tripCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  activeTripCard: {
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5
  },
  tripCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.sm
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  contractText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full
  },
  statusActive: {
    backgroundColor: 'rgba(94, 53, 177, 0.15)'
  },
  statusCompleted: {
    backgroundColor: COLORS.secondaryMuted
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800'
  },
  textActive: {
    color: COLORS.primary
  },
  textCompleted: {
    color: COLORS.secondaryDark
  },
  tripBody: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  vehImg: {
    width: 70,
    height: 50,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E2E8F0'
  },
  tripDetails: {
    flex: 1,
    marginLeft: SPACING.md
  },
  vehName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  plate: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  statItem: {
    fontSize: 10,
    color: COLORS.textSecondary
  },
  statBold: {
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm
  },
  costLabel: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  costVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark
  },
  activeKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    gap: 4
  },
  activeKeyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
    gap: 4
  },
  receiptBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600'
  }
});
