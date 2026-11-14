import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';

export default function VehicleCard({
  vehicle,
  onSelect,
  onBook,
  style: customStyle,
  accentColor = '#0CA678'
}) {
  const isElectric = vehicle.powerType === 'ELECTRIC';
  const formattedHourlyPrice = vehicle.hourlyPrice.toLocaleString('vi-VN');
  const formattedDailyPrice = Math.round(vehicle.dailyPrice / 1000) + 'k';
  const batteryPct = Math.round(vehicle.telematics?.batteryLevelPct || 90);

  return (
    <TouchableOpacity
      style={[styles.card, customStyle]}
      activeOpacity={0.92}
      onPress={() => onSelect(vehicle)}
    >
      {/* Compact Left Thumbnail (No Giant Full-Screen Photo Overload) */}
      <View style={styles.thumbWrapper}>
        <Image
          source={{ uri: vehicle.thumbnail }}
          style={styles.thumbImage}
          resizeMode="cover"
        />
        <View style={styles.batteryBadge}>
          <View style={[styles.batteryDot, { backgroundColor: isElectric ? accentColor : '#F59E0B' }]} />
          <Text style={styles.batteryText}>
            {isElectric ? `${batteryPct}%` : vehicle.powerType === 'HYBRID' ? 'HEV' : 'Xăng'}
          </Text>
        </View>
      </View>

      {/* Right Content Column: Spacious, Easy to Scan & Tap */}
      <View style={styles.infoCol}>
        <View style={styles.topTitleRow}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.vehicleName} numberOfLines={1}>
              {vehicle.name}
            </Text>
            {vehicle.category === 'LUXURY' && (
              <View style={styles.luxuryVipTag}>
                <Ionicons name="sparkles" size={10} color="#D4AF37" />
                <Text style={styles.luxuryVipTagText}>VIP</Text>
              </View>
            )}
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{vehicle.rating}</Text>
          </View>
        </View>

        <Text style={styles.specsLine} numberOfLines={1}>
          {vehicle.category === 'BICYCLE' ? 'Xe đạp thông minh' : `${vehicle.seats} chỗ`} · {vehicle.rangeKm} km · {vehicle.plateNumber || 'EcoGo Hub'}
        </Text>

        <View style={styles.bottomActionRow}>
          <View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceMain, { color: accentColor }]}>
                {formattedHourlyPrice}đ
              </Text>
              <Text style={styles.priceUnit}>/giờ</Text>
            </View>
            <Text style={styles.dailyPriceSub}>
              {formattedDailyPrice}/ngày · Miễn cọc
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bookBtn}
            activeOpacity={0.85}
            onPress={() => onBook(vehicle)}
          >
            <Text style={styles.bookBtnText}>Đặt xe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBECE8',
    gap: 12
  },
  thumbWrapper: {
    width: 112,
    height: 88,
    borderRadius: 14,
    backgroundColor: '#F4F4F2',
    overflow: 'hidden',
    position: 'relative'
  },
  thumbImage: {
    width: '100%',
    height: '100%'
  },
  batteryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
    gap: 4
  },
  batteryDot: {
    width: 5,
    height: 5,
    borderRadius: 3
  },
  batteryText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 86
  },
  topTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  vehicleName: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.2
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F7F7F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  ratingText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  specsLine: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  priceMain: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800'
  },
  priceUnit: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '500'
  },
  dailyPriceSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1
  },
  bookBtn: {
    backgroundColor: '#1D1D1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10
  },
  bookBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  luxuryVipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B180D',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 3
  },
  luxuryVipTagText: {
    fontFamily: FONTS.family,
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '800'
  }
});
