import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export default function VehicleCard({ vehicle, onSelect, onBook }) {
  const isElectric = vehicle.powerType === 'ELECTRIC';
  const formattedHourlyPrice = vehicle.hourlyPrice.toLocaleString('vi-VN');
  const formattedDailyPrice = vehicle.dailyPrice.toLocaleString('vi-VN');

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onSelect(vehicle)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeTopLeft}>
          <View style={[styles.pill, isElectric ? styles.electricPill : styles.hybridPill]}>
            <Ionicons
              name={isElectric ? "flash" : "leaf"}
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.pillText}>
              {isElectric ? 'Xe thuần điện EV' : 'Xe Hybrid Xanh'}
            </Text>
          </View>
        </View>

        {vehicle.noDeposit && (
          <View style={styles.badgeTopRight}>
            <Text style={styles.noDepositText}>Miễn thế chấp</Text>
          </View>
        )}

        <View style={styles.bottomOverlay}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color={COLORS.accent} />
            <Text style={styles.ratingText}>{vehicle.rating}</Text>
            <Text style={styles.tripsText}>({vehicle.totalTrips} chuyến)</Text>
          </View>
          <View style={styles.batteryPill}>
            <Ionicons
              name={isElectric ? "battery-charging" : "speedometer"}
              size={13}
              color={COLORS.secondaryLight}
            />
            <Text style={styles.batteryText}>
              {isElectric ? `${vehicle.telematics.batteryLevelPct}% Pin` : `${vehicle.telematics.fuelLevelPct}% Xăng`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoContent}>
        <View style={styles.titleRow}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.plateNumber}>{vehicle.plateNumber}</Text>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="people-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.specText}>{vehicle.seats} chỗ</Text>
          </View>
          <View style={styles.specDot} />
          <View style={styles.specItem}>
            <Ionicons name="cog-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.specText}>Số tự động</Text>
          </View>
          <View style={styles.specDot} />
          <View style={styles.specItem}>
            <Ionicons name="navigate-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.specText}>{vehicle.rangeKm} km/lần sạc</Text>
          </View>
        </View>

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
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  imageContainer: {
    height: 175,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4
  },
  electricPill: {
    backgroundColor: 'rgba(0, 191, 165, 0.92)'
  },
  hybridPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.92)'
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full
  },
  noDepositText: {
    color: '#FCD34D',
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)'
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
    fontWeight: '600'
  },
  infoContent: {
    padding: SPACING.md
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1
  },
  plateNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  specDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.borderDark,
    marginHorizontal: 8
  },
  specText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm
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
    color: COLORS.primaryDark
  },
  priceUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 2
  },
  dailySub: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
