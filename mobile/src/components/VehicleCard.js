import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

export default function VehicleCard({ vehicle, onSelect, onBook, style: customStyle }) {
  const isElectric = vehicle.powerType === 'ELECTRIC';
  const formattedHourlyPrice = vehicle.hourlyPrice.toLocaleString('vi-VN');
  const formattedDailyPrice = vehicle.dailyPrice.toLocaleString('vi-VN');
  const batteryPct = Math.round(vehicle.telematics?.batteryLevelPct || 88);

  return (
    <TouchableOpacity
      style={[styles.card, customStyle]}
      activeOpacity={0.93}
      onPress={() => onSelect(vehicle)}
    >
      {/* 16:9 Automotive Showroom Photo Frame */}
      <View style={styles.imageOuterFrame}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: vehicle.thumbnail }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Top Left Pill: Mint Green for EV, Champagne Beige for Hybrid */}
          <View style={styles.badgeTopLeft}>
            <View style={[styles.pill, isElectric ? styles.electricPill : styles.hybridPill]}>
              <Ionicons
                name={isElectric ? 'flash' : 'leaf'}
                size={11}
                color={isElectric ? '#FFFFFF' : '#786B59'}
              />
              <Text style={[styles.pillText, !isElectric && { color: '#786B59' }]}>
                {isElectric ? 'THUẦN ĐIỆN EV' : 'HYBRID ECO'}
              </Text>
            </View>
          </View>

          {/* Top Right Pill: Zero Deposit Guarantee */}
          {vehicle.noDeposit && (
            <View style={styles.badgeTopRight}>
              <Ionicons name="shield-checkmark" size={11} color="#10B981" />
              <Text style={styles.noDepositText}>Miễn thế chấp</Text>
            </View>
          )}

          {/* Bottom Floating Glass Overlay */}
          <View style={styles.bottomOverlay}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{vehicle.rating}</Text>
              <Text style={styles.tripsText}>• {vehicle.totalTrips} chuyến</Text>
            </View>
            <View style={styles.batteryPill}>
              <Ionicons
                name={isElectric ? 'battery-charging' : 'speedometer-outline'}
                size={12}
                color="#059669"
              />
              <Text style={styles.batteryText}>
                {isElectric ? `${batteryPct}% Pin` : `${vehicle.telematics?.fuelLevelPct || 85}% Xăng`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Vehicle Specification Sheet */}
      <View style={styles.infoContent}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.vehicleName} numberOfLines={1}>{vehicle.name}</Text>
            <Text style={styles.locationSub} numberOfLines={1}>
              <Ionicons name="location" size={11} color="#10B981" /> Giao nhận 24/7 tại Trạm ITS Hub
            </Text>
          </View>
          <View style={styles.plateTag}>
            <Text style={styles.plateNumber}>{vehicle.plateNumber}</Text>
          </View>
        </View>

        {/* Specification Chips */}
        <View style={styles.specsRow}>
          <View style={styles.specBadge}>
            <Ionicons name="people-outline" size={12} color="#4B5563" />
            <Text style={styles.specText}>{vehicle.seats} chỗ</Text>
          </View>
          <View style={styles.specBadge}>
            <Ionicons name="cog-outline" size={12} color="#4B5563" />
            <Text style={styles.specText}>Số tự động</Text>
          </View>
          <View style={styles.specBadge}>
            <Ionicons name="speedometer-outline" size={12} color="#4B5563" />
            <Text style={styles.specText}>{vehicle.rangeKm} km/sạc</Text>
          </View>
          <View style={[styles.specBadge, styles.bleBadge]}>
            <Ionicons name="key-outline" size={11} color="#059669" />
            <Text style={styles.bleText}>Khóa BLE 5.2</Text>
          </View>
        </View>

        {/* Commercial Pricing & Mint CTA Button */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <View style={styles.hourlyRow}>
              <Text style={styles.priceAmount}>{formattedHourlyPrice}đ</Text>
              <Text style={styles.priceUnit}>/giờ</Text>
            </View>
            <Text style={styles.dailySub}>Thuê ngày: {formattedDailyPrice}đ/24h</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.85}
            onPress={() => onBook(vehicle)}
          >
            <Text style={styles.bookButtonText}>Chọn thuê</Text>
            <View style={styles.bookKnobCircle}>
              <Ionicons name="arrow-forward" size={13} color="#059669" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3
  },
  imageOuterFrame: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F2EB'
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9.5,
    position: 'relative'
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 4
  },
  electricPill: {
    backgroundColor: '#10B981'
  },
  hybridPill: {
    backgroundColor: '#F5F2EB',
    borderWidth: 1,
    borderColor: '#E5DEC9'
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  badgeTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 4,
    zIndex: 2
  },
  noDepositText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '700'
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)'
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800'
  },
  tripsText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600'
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4
  },
  batteryText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800'
  },
  infoContent: {
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 2
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827'
  },
  locationSub: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2
  },
  plateTag: {
    backgroundColor: '#F5F2EB',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DEC9'
  },
  plateNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#57534E'
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
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  specText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600'
  },
  bleBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5'
  },
  bleText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  priceContainer: {
    flex: 1
  },
  hourlyRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669'
  },
  priceUnit: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 2
  },
  dailySub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
    fontWeight: '600'
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  bookKnobCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
