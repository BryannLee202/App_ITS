import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export default function VehicleCard({ vehicle, onSelect, onBook }) {
  const isElectric = vehicle.powerType === 'ELECTRIC';
  const formattedHourlyPrice = vehicle.hourlyPrice.toLocaleString('vi-VN');
  const formattedDailyPrice = vehicle.dailyPrice.toLocaleString('vi-VN');
  const batteryPct = Math.round(vehicle.telematics.batteryLevelPct || 85);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => onSelect(vehicle)}
    >
      {/* 16:10 Golden Ratio Car Photo with Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Badges */}
        <View style={styles.badgeTopLeft}>
          <View style={[styles.pill, isElectric ? styles.electricPill : styles.hybridPill]}>
            <Ionicons
              name={isElectric ? "flash" : "leaf"}
              size={11}
              color="#FFFFFF"
            />
            <Text style={styles.pillText}>
              {isElectric ? 'Thuần điện EV' : 'Hybrid Eco'}
            </Text>
          </View>
        </View>

        {vehicle.noDeposit && (
          <View style={styles.badgeTopRight}>
            <Ionicons name="shield-checkmark" size={11} color="#FBBF24" />
            <Text style={styles.noDepositText}>Miễn thế chấp</Text>
          </View>
        )}

        {/* Bottom Image Overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color={COLORS.accent} />
            <Text style={styles.ratingText}>{vehicle.rating}</Text>
            <Text style={styles.tripsText}>({vehicle.totalTrips} chuyến)</Text>
          </View>
          <View style={styles.batteryPill}>
            <Ionicons
              name={isElectric ? "battery-charging" : "speedometer"}
              size={12}
              color={COLORS.secondaryLight}
            />
            <Text style={styles.batteryText}>
              {isElectric ? `${batteryPct}% Pin` : `${vehicle.telematics.fuelLevelPct}% Xăng`}
            </Text>
          </View>
        </View>
      </View>

      {/* Vehicle Info Content */}
      <View style={styles.infoContent}>
        <View style={styles.titleRow}>
          <Text style={styles.vehicleName} numberOfLines={1}>{vehicle.name}</Text>
          <View style={styles.plateTag}>
            <Text style={styles.plateNumber}>{vehicle.plateNumber}</Text>
          </View>
        </View>

        {/* Spec Chips Row */}
        <View style={styles.specsRow}>
          <View style={styles.specBadge}>
            <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.specText}>{vehicle.seats} chỗ</Text>
          </View>
          <View style={styles.specBadge}>
            <Ionicons name="hardware-chip-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.specText}>Tự động</Text>
          </View>
          <View style={styles.specBadge}>
            <Ionicons name="navigate-circle-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.specText}>{vehicle.rangeKm} km/sạc</Text>
          </View>
          <View style={styles.specBadge}>
            <Ionicons name="key-outline" size={12} color={COLORS.primary} />
            <Text style={[styles.specText, { color: COLORS.primary, fontWeight: '700' }]}>Digital Key</Text>
          </View>
        </View>

        {/* Price & Action Row */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <View style={styles.hourlyRow}>
              <Text style={styles.priceAmount}>{formattedHourlyPrice} đ</Text>
              <Text style={styles.priceUnit}>/giờ</Text>
            </View>
            <Text style={styles.dailySub}>hoặc {formattedDailyPrice} đ/ngày</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.85}
            onPress={() => onBook(vehicle)}
          >
            <Text style={styles.bookButtonText}>Thuê ngay</Text>
            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    backgroundColor: '#0F172A'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4
  },
  electricPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)'
  },
  hybridPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.95)'
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  badgeTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
    zIndex: 2
  },
  noDepositText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700'
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.72)'
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  tripsText: {
    color: '#94A3B8',
    fontSize: 10
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  batteryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  infoContent: {
    padding: 14
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8
  },
  plateTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  plateNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5'
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  specText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10
  },
  priceContainer: {
    justifyContent: 'center'
  },
  hourlyRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  priceAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4F46E5'
  },
  priceUnit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 2
  },
  dailySub: {
    fontSize: 10,
    color: '#94A3B8'
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
