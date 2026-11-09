import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';

export default function VehicleCard({ vehicle, onSelect, onBook, style: customStyle }) {
  const isElectric = vehicle.powerType === 'ELECTRIC';
  const formattedHourlyPrice = vehicle.hourlyPrice.toLocaleString('vi-VN');
  const formattedDailyPrice = vehicle.dailyPrice.toLocaleString('vi-VN');
  const batteryPct = Math.round(vehicle.telematics?.batteryLevelPct || 90);

  return (
    <TouchableOpacity
      style={[styles.card, customStyle]}
      activeOpacity={0.94}
      onPress={() => onSelect(vehicle)}
    >
      {/* Clean Unframed Showroom Photo with Single Subtle Rating Pill */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Left: Single Clean Frosted Badge */}
        <View style={styles.topFloatingRow}>
          <View style={styles.frostedBadge}>
            <View style={[styles.dot, { backgroundColor: isElectric ? '#0D9488' : '#57534E' }]} />
            <Text style={styles.frostedBadgeText}>
              {isElectric ? `Pin ${batteryPct}% • ${vehicle.rangeKm} km` : `Hybrid • ${vehicle.rangeKm} km`}
            </Text>
          </View>

          <View style={styles.ratingFrosted}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingText}>{vehicle.rating}</Text>
            <Text style={styles.tripsCount}>({vehicle.totalTrips})</Text>
          </View>
        </View>
      </View>

      {/* Editorial Vehicle Details */}
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.vehicleName} numberOfLines={1}>
              {vehicle.name}
            </Text>
            <Text style={styles.metaLine} numberOfLines={1}>
              Số tự động • {vehicle.seats} chỗ • Biển số {vehicle.plateNumber}
            </Text>
          </View>
        </View>

        {/* Subtle Feature Line (No Colorful AI Boxes) */}
        <View style={styles.tagsRow}>
          <Text style={styles.tagItem}>Mở khóa qua điện thoại</Text>
          <Text style={styles.tagDot}>·</Text>
          <Text style={styles.tagItem}>Miễn thế chấp</Text>
          <Text style={styles.tagDot}>·</Text>
          <Text style={styles.tagItem}>Giao nhận 24/7</Text>
        </View>

        <View style={styles.divider} />

        {/* Price & Action Row */}
        <View style={styles.footerRow}>
          <View>
            <View style={styles.priceInline}>
              <Text style={styles.priceAmount}>{formattedHourlyPrice}đ</Text>
              <Text style={styles.priceUnit}> / giờ</Text>
            </View>
            <Text style={styles.dailySub}>{formattedDailyPrice}đ / ngày (24h)</Text>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => onBook(vehicle)}
          >
            <Text style={styles.ctaButtonText}>Đặt xe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBEBED',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2
  },
  imageContainer: {
    width: '100%',
    height: 196,
    backgroundColor: '#F6F5F2',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  topFloatingRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  frostedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 6
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  frostedBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#111111'
  },
  ratingFrosted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 3
  },
  ratingText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#111111'
  },
  tripsCount: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73'
  },
  body: {
    padding: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  vehicleName: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '600',
    color: '#111111',
    letterSpacing: -0.2
  },
  metaLine: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6E6E73',
    marginTop: 3
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap'
  },
  tagItem: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#2E7D5B',
    fontWeight: '500'
  },
  tagDot: {
    marginHorizontal: 6,
    color: '#8E8E93',
    fontSize: 12
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F5',
    marginVertical: 12
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceInline: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  priceAmount: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3
  },
  priceUnit: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6E6E73',
    fontWeight: '400'
  },
  dailySub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2
  },
  ctaButton: {
    backgroundColor: '#2E7D5B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12
  },
  ctaButtonText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});
