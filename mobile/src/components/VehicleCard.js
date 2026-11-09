import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

export default function VehicleCard({ vehicle, onSelect, onBook, style: customStyle }) {
  const isElectric = vehicle.powerType === 'ELECTRIC';
  const formattedHourlyPrice = vehicle.hourlyPrice.toLocaleString('vi-VN');
  const formattedDailyPrice = vehicle.dailyPrice.toLocaleString('vi-VN');
  const batteryPct = Math.round(vehicle.telematics.batteryLevelPct || 85);

  return (
    <TouchableOpacity
      style={[styles.card, customStyle]}
      activeOpacity={0.92}
      onPress={() => onSelect(vehicle)}
    >
      {/* 16:10 Ratio Photo Container with Soft Frame */}
      <View style={styles.imageOuterFrame}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: vehicle.thumbnail }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Top Left Pill - Dusty Slate Blue / Peach */}
          <View style={styles.badgeTopLeft}>
            <View style={[styles.pill, isElectric ? styles.electricPill : styles.hybridPill]}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>
                {isElectric ? 'THUẦN ĐIỆN EV' : 'HYBRID ECO'}
              </Text>
            </View>
          </View>

          {vehicle.noDeposit && (
            <View style={styles.badgeTopRight}>
              <Ionicons name="shield-checkmark" size={11} color="#DF8268" />
              <Text style={styles.noDepositText}>0đ Thế chấp</Text>
            </View>
          )}

          {/* Bottom Floating Glass Pill Overlay */}
          <View style={styles.bottomOverlay}>
            <View style={styles.ratingBox}>
              <View style={styles.starKnob}>
                <Ionicons name="star" size={10} color="#DF8268" />
              </View>
              <Text style={styles.ratingText}>{vehicle.rating}</Text>
              <Text style={styles.tripsText}>({vehicle.totalTrips} chuyến)</Text>
            </View>
            <View style={styles.batteryPill}>
              <Ionicons
                name={isElectric ? 'battery-charging' : 'speedometer-outline'}
                size={12}
                color="#6E92B5"
              />
              <Text style={styles.batteryText}>
                {isElectric ? `${batteryPct}% Pin` : `${vehicle.telematics.fuelLevelPct}% Xăng`}
              </Text>
            </View>
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

        {/* Tactile Neumorphic Specification Chips */}
        <View style={styles.specsRow}>
          <View style={styles.specBadge}>
            <View style={styles.specDotBlue} />
            <Text style={styles.specText}>{vehicle.seats} chỗ</Text>
          </View>
          <View style={styles.specBadge}>
            <View style={styles.specDotPeach} />
            <Text style={styles.specText}>Tự động</Text>
          </View>
          <View style={styles.specBadge}>
            <Text style={styles.specText}>{vehicle.rangeKm} km/sạc</Text>
          </View>
          <View style={[styles.specBadge, styles.bleBadge]}>
            <Ionicons name="key" size={10} color="#6E92B5" />
            <Text style={styles.bleText}>Digital Key</Text>
          </View>
        </View>

        {/* Commercial Pricing & 3D Tactile Booking Button */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <View style={styles.hourlyRow}>
              <Text style={styles.priceAmount}>{formattedHourlyPrice} đ</Text>
              <Text style={styles.priceUnit}>/giờ</Text>
            </View>
            <Text style={styles.dailySub}>Trọn ngày: {formattedDailyPrice} đ</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={0.85}
            onPress={() => onBook(vehicle)}
          >
            <Text style={styles.bookButtonText}>Đặt xe</Text>
            <View style={styles.bookKnobCircle}>
              <Ionicons name="arrow-forward" size={12} color="#DF8268" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FDFBF7',
    borderRadius: 26,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#8C6D5B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5
  },
  imageOuterFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3EAE0',
    borderWidth: 1,
    borderColor: '#EFE5DA'
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
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
    borderRadius: 14,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6
  },
  electricPill: {
    backgroundColor: '#6E92B5'
  },
  hybridPill: {
    backgroundColor: '#DF8268'
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FDFBF7'
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  badgeTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    zIndex: 2,
    shadowColor: '#5C4438',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6
  },
  noDepositText: {
    color: '#2C221E',
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
    borderRadius: 14,
    backgroundColor: 'rgba(253, 251, 247, 0.92)'
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  starKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FCEEE9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ratingText: {
    color: '#2C221E',
    fontSize: 12,
    fontWeight: '800'
  },
  tripsText: {
    color: '#7A6A63',
    fontSize: 10,
    fontWeight: '600'
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4
  },
  batteryText: {
    color: '#527394',
    fontSize: 11,
    fontWeight: '800'
  },
  infoContent: {
    paddingHorizontal: 6,
    paddingTop: 12,
    paddingBottom: 4
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C221E',
    flex: 1,
    marginRight: 8
  },
  plateTag: {
    backgroundColor: '#F5EFE8',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6D9CE'
  },
  plateNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7A6A63'
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F0E8',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  specDotBlue: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6E92B5'
  },
  specDotPeach: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DF8268'
  },
  specText: {
    fontSize: 11,
    color: '#7A6A63',
    fontWeight: '700'
  },
  bleBadge: {
    backgroundColor: '#EBF2F8'
  },
  bleText: {
    fontSize: 11,
    color: '#527394',
    fontWeight: '700'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2E9DF'
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
    color: '#2C221E'
  },
  priceUnit: {
    fontSize: 12,
    color: '#7A6A63',
    fontWeight: '600',
    marginLeft: 2
  },
  dailySub: {
    fontSize: 11,
    color: '#A6968E',
    marginTop: 1,
    fontWeight: '600'
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DF8268',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 22,
    gap: 8,
    shadowColor: '#DF8268',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F5BFA9'
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  bookKnobCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  }
});
