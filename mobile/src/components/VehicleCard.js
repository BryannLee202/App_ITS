import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

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
      {/* 16:10 Ratio Photo Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Badges - Fresh Xanh SM Cyan */}
        <View style={styles.badgeTopLeft}>
          <View style={[styles.pill, isElectric ? styles.electricPill : styles.hybridPill]}>
            <Ionicons
              name={isElectric ? "flash" : "leaf"}
              size={11}
              color="#FFFFFF"
            />
            <Text style={styles.pillText}>
              {isElectric ? 'THUẦN ĐIỆN EV' : 'HYBRID TIẾT KIỆM'}
            </Text>
          </View>
        </View>

        {vehicle.noDeposit && (
          <View style={styles.badgeTopRight}>
            <Ionicons name="shield-checkmark" size={11} color="#00BFA5" />
            <Text style={styles.noDepositText}>Miễn thế chấp cọc</Text>
          </View>
        )}

        {/* Bottom Image Overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{vehicle.rating}</Text>
            <Text style={styles.tripsText}>({vehicle.totalTrips} chuyến)</Text>
          </View>
          <View style={styles.batteryPill}>
            <Ionicons
              name={isElectric ? "battery-charging" : "speedometer-outline"}
              size={13}
              color="#26E1CC"
            />
            <Text style={styles.batteryText}>
              {isElectric ? `${batteryPct}% Pin` : `${vehicle.telematics.fuelLevelPct}% Xăng`}
            </Text>
          </View>
        </View>
      </View>

      {/* Vehicle Specification Sheet */}
      <View style={styles.infoContent}>
        <View style={styles.titleRow}>
          <Text style={styles.vehicleName} numberOfLines={1}>{vehicle.name}</Text>
          <View style={styles.plateTag}>
            <Text style={styles.plateNumber}>{vehicle.plateNumber}</Text>
          </View>
        </View>

        {/* Technical Specification Chips */}
        <View style={styles.specsRow}>
          <View style={styles.specBadge}>
            <Text style={styles.specText}>{vehicle.seats} chỗ</Text>
          </View>
          <View style={styles.specBadge}>
            <Text style={styles.specText}>Tự động</Text>
          </View>
          <View style={styles.specBadge}>
            <Text style={styles.specText}>{vehicle.rangeKm} km/sạc</Text>
          </View>
          <View style={[styles.specBadge, styles.bleBadge]}>
            <Ionicons name="key-outline" size={11} color="#008E7B" />
            <Text style={styles.bleText}>Digital Key</Text>
          </View>
        </View>

        {/* Commercial Pricing & Booking */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <View style={styles.hourlyRow}>
              <Text style={styles.priceAmount}>{formattedHourlyPrice} đ</Text>
              <Text style={styles.priceUnit}>/giờ</Text>
            </View>
            <Text style={styles.dailySub}>Đơn giá ngày: {formattedDailyPrice} đ</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.88}
            onPress={() => onBook(vehicle)}
          >
            <Text style={styles.bookButtonText}>Thuê xe</Text>
            <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    backgroundColor: '#F1F5F9'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    gap: 4
  },
  electricPill: {
    backgroundColor: 'rgba(0, 191, 165, 0.95)'
  },
  hybridPill: {
    backgroundColor: 'rgba(14, 165, 233, 0.95)'
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  badgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    gap: 4,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#E0F7F4'
  },
  noDepositText: {
    color: '#008E7B',
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
    fontWeight: '800'
  },
  tripsText: {
    color: '#E2E8F0',
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
    fontWeight: '800'
  },
  infoContent: {
    padding: 12
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    marginRight: 6
  },
  plateTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  plateNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B'
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 3
  },
  bleBadge: {
    backgroundColor: '#E0F7F4',
    borderColor: '#B2DFDB'
  },
  specText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600'
  },
  bleText: {
    fontSize: 10,
    color: '#008E7B',
    fontWeight: '700'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8
  },
  priceContainer: {
    justifyContent: 'center'
  },
  hourlyRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00BFA5'
  },
  priceUnit: {
    fontSize: 10,
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
    backgroundColor: '#00BFA5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
