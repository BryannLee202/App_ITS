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
      {/* 16:10 Ratio Car Photo */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Identification Badges */}
        <View style={styles.badgeTopLeft}>
          <View style={[styles.pill, isElectric ? styles.electricPill : styles.hybridPill]}>
            <Ionicons
              name={isElectric ? "flash" : "leaf"}
              size={10}
              color="#FFFFFF"
            />
            <Text style={styles.pillText}>
              {isElectric ? 'THUẦN ĐIỆN EV' : 'HYBRID TIẾT KIỆM'}
            </Text>
          </View>
        </View>

        {vehicle.noDeposit && (
          <View style={styles.badgeTopRight}>
            <Ionicons name="shield-checkmark-outline" size={10} color="#059669" />
            <Text style={styles.noDepositText}>BẢO CHỨNG eKYC (MIỄN CỌC)</Text>
          </View>
        )}

        {/* Bottom Instrument Overlay */}
        <View style={styles.bottomOverlay}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingText}>{vehicle.rating}</Text>
            <Text style={styles.tripsText}>• {vehicle.totalTrips} lượt phục vụ</Text>
          </View>
          <View style={styles.batteryPill}>
            <Ionicons
              name={isElectric ? "battery-charging" : "speedometer-outline"}
              size={12}
              color="#34D399"
            />
            <Text style={styles.batteryText}>
              {isElectric ? `PIN: ${batteryPct}%` : `XĂNG: ${vehicle.telematics.fuelLevelPct}%`}
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
            <Text style={styles.specText}>{vehicle.seats} CHỖ NGỒI</Text>
          </View>
          <View style={styles.specBadge}>
            <Text style={styles.specText}>SỐ TỰ ĐỘNG</Text>
          </View>
          <View style={styles.specBadge}>
            <Text style={styles.specText}>TẦM HOẠT ĐỘNG {vehicle.rangeKm} KM</Text>
          </View>
          <View style={[styles.specBadge, styles.bleBadge]}>
            <Text style={styles.bleText}>BLE 5.2 KEYLESS</Text>
          </View>
        </View>

        {/* Commercial Pricing & Booking */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <View style={styles.hourlyRow}>
              <Text style={styles.priceAmount}>{formattedHourlyPrice} VNĐ</Text>
              <Text style={styles.priceUnit}>/ giờ</Text>
            </View>
            <Text style={styles.dailySub}>Đơn giá trọn ngày: {formattedDailyPrice} VNĐ</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.88}
            onPress={() => onBook(vehicle)}
          >
            <Text style={styles.bookButtonText}>ĐẶT THUÊ</Text>
            <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
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
    top: 8,
    left: 8,
    zIndex: 2
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4
  },
  electricPill: {
    backgroundColor: 'rgba(4, 120, 87, 0.95)'
  },
  hybridPill: {
    backgroundColor: 'rgba(30, 58, 138, 0.95)'
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  badgeTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  noDepositText: {
    color: '#047857',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(11, 19, 43, 0.85)'
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  tripsText: {
    color: '#94A3B8',
    fontSize: 9
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  batteryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4
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
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
    letterSpacing: -0.2
  },
  plateTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  plateNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F2942',
    letterSpacing: 0.5
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10
  },
  specBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  bleBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE'
  },
  specText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '700',
    letterSpacing: 0.3
  },
  bleText: {
    fontSize: 9,
    color: '#1E3A8A',
    fontWeight: '800',
    letterSpacing: 0.3
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
    color: '#0F2942'
  },
  priceUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 2
  },
  dailySub: {
    fontSize: 9,
    color: '#94A3B8'
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2942',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  }
});
