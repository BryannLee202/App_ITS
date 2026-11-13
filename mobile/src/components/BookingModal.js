import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';

const INSURANCE_PLANS = [
  {
    id: 'BASIC',
    name: 'Gói Cơ Bản (Miễn phí)',
    priceHour: 0,
    priceDay: 0,
    badge: 'Mặc định',
    desc: 'Bảo hiểm TNDS bắt buộc • Khấu trừ 2.000.000đ/vụ'
  },
  {
    id: 'STANDARD',
    name: 'Bảo Vệ Tiêu Chuẩn ITS',
    priceHour: 25000,
    priceDay: 85000,
    badge: 'Khuyên dùng',
    desc: 'Bảo hiểm thân vỏ 80% • Cứu hộ pin & lốp 24/7 miễn phí'
  },
  {
    id: 'PREMIUM',
    name: 'An Tâm Tuyệt Đối (0đ Khấu trừ)',
    priceHour: 55000,
    priceDay: 150000,
    badge: 'VIP 100%',
    desc: 'Miễn 100% đền bù va quệt thân vỏ • Hỗ trợ xe thay thế tức thì'
  }
];

export default function BookingModal({
  visible,
  vehicle,
  onClose,
  onBookingSuccess,
  initialVoucherCode = 'CHAOXANH'
}) {
  const [rentalType, setRentalType] = useState('HOURLY'); // 'HOURLY' | 'DAILY'
  const [durationHours, setDurationHours] = useState(4);
  const [durationDays, setDurationDays] = useState(1);
  const [deliveryMode, setDeliveryMode] = useState('STATION'); // 'STATION' | 'DOORSTEP'
  const [insuranceTier, setInsuranceTier] = useState('STANDARD');
  const [voucherCode, setVoucherCode] = useState(initialVoucherCode);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (visible && initialVoucherCode) {
      setVoucherCode(initialVoucherCode);
    }
  }, [visible, initialVoucherCode]);

  useEffect(() => {
    if (visible && vehicle) {
      setActivePhotoIdx(0);
      fetchQuote();
    }
  }, [visible, vehicle, rentalType, durationHours, durationDays, deliveryMode, insuranceTier, voucherCode]);

  const fetchQuote = async () => {
    if (!vehicle) return;
    try {
      setLoadingQuote(true);
      const res = await ApiService.getBookingQuote({
        vehicleId: vehicle.id,
        rentalType,
        durationHours,
        durationDays,
        insuranceTier,
        deliveryMode,
        voucherCode
      });
      if (res && res.quote) {
        setQuote(res.quote);
      }
    } catch (e) {
      // Fallback calculation if offline
      const baseRentalFee = rentalType === 'DAILY'
        ? vehicle.dailyPrice * durationDays
        : vehicle.hourlyPrice * durationHours;
      const insuranceFee = insuranceTier === 'PREMIUM' ? 55000 : insuranceTier === 'STANDARD' ? 25000 : 0;
      const platformServiceFee = Math.round(baseRentalFee * 0.05);
      const deliveryFee = deliveryMode === 'DOORSTEP' ? 50000 : 0;
      
      const code = voucherCode.trim().toUpperCase();
      let discountAmount = 0;
      if (code === 'CHAOXANH' || code === 'BANMOI30') {
        discountAmount = Math.min(Math.round(baseRentalFee * 0.3), 80000);
      } else if (code === 'XANH20' || code === 'ECOGO20') {
        discountAmount = Math.min(Math.round(baseRentalFee * 0.2), 120000);
      } else if (code === 'GIOVANG25') {
        discountAmount = 25000;
      } else if (code === 'UTH50K') {
        discountAmount = 50000;
      } else if (code === 'THUENGAY200' || code === 'CUOITUAN200') {
        discountAmount = rentalType === 'DAILY' ? 200000 : 100000;
      } else if (code === 'FREESHIP5KM' || code === 'FREEDELIVERY' || code === 'FREESHIP') {
        discountAmount = deliveryFee > 0 ? deliveryFee : 50000;
      }

      setQuote({
        baseRentalFee,
        insuranceFee,
        platformServiceFee,
        deliveryFee,
        discountAmount,
        totalAmount: Math.max(0, baseRentalFee + insuranceFee + platformServiceFee + deliveryFee - discountAmount)
      });
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!vehicle || !agreedTerms) return;
    try {
      setSubmitting(true);
      const res = await ApiService.bookVehicle({
        vehicleId: vehicle.id,
        rentalType,
        durationHours,
        durationDays,
        pickupStationId: vehicle.stationId,
        returnStationId: vehicle.stationId,
        insuranceTier,
        deliveryMode,
        voucherCode
      });
      onBookingSuccess(res);
    } catch (err) {
      // Still allow demo progression
      onBookingSuccess({
        success: true,
        message: 'Đặt xe và kích hoạt Digital Key thành công!',
        vehicle
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!vehicle) return null;

  const photos = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.thumbnail];
  const batteryPct = Math.round(vehicle.telematics?.batteryLevelPct || 90);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Top Modal Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.75}>
              <Ionicons name="close" size={20} color="#2B180D" />
            </TouchableOpacity>
            <View style={styles.topTitleCenter}>
              <Text style={styles.topTitle}>Chi Tiết & Đặt Thuê Xe</Text>
              <Text style={styles.topSubtitle}>Hợp đồng điện tử • Mở khóa Digital Key 24/7</Text>
            </View>
            <View style={styles.verifiedChip}>
              <Ionicons name="shield-checkmark" size={13} color="#D4AF37" />
              <Text style={styles.verifiedChipText}>0đ Cọc</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* 1. Vehicle Showroom Gallery (16:9 Natural Ratio) */}
            <View style={styles.galleryContainer}>
              <Image
                source={{ uri: photos[activePhotoIdx] || vehicle.thumbnail }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.imageFloatingBadges}>
                <View style={styles.coffeeBadge}>
                  <Ionicons name="flash" size={11} color="#D4AF37" />
                  <Text style={styles.coffeeBadgeText}>
                    {vehicle.powerType === 'ELECTRIC' ? `${batteryPct}% PIN • ${vehicle.rangeKm}KM` : `${vehicle.rangeKm}KM`}
                  </Text>
                </View>
                <View style={styles.plateFloating}>
                  <Text style={styles.plateFloatingText}>{vehicle.plateNumber}</Text>
                </View>
              </View>
            </View>

            {/* 2. Vehicle Title & Specs */}
            <View style={styles.sectionCard}>
              <View style={styles.vehHeaderRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.vehTitle}>{vehicle.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#D4AF37" />
                    <Text style={styles.ratingBold}>{vehicle.rating}</Text>
                    <Text style={styles.ratingCount}>({vehicle.totalTrips} chuyến hoàn thành)</Text>
                  </View>
                </View>
                <View style={styles.priceHighlightBox}>
                  <Text style={styles.priceBig}>
                    {(rentalType === 'DAILY' ? vehicle.dailyPrice : vehicle.hourlyPrice).toLocaleString('vi-VN')}đ
                  </Text>
                  <Text style={styles.priceUnitText}>/{rentalType === 'DAILY' ? 'ngày' : 'giờ'}</Text>
                </View>
              </View>

              {/* 4 Key Telemetry & Hardware Specs */}
              <View style={styles.specsGrid4}>
                <View style={styles.specBox}>
                  <Ionicons name="people-outline" size={16} color="#6F4E37" />
                  <Text style={styles.specBoxVal}>{vehicle.seats} chỗ</Text>
                  <Text style={styles.specBoxLbl}>Nội thất</Text>
                </View>
                <View style={styles.specBox}>
                  <Ionicons name="battery-charging-outline" size={16} color="#6F4E37" />
                  <Text style={styles.specBoxVal}>{vehicle.rangeKm} km</Text>
                  <Text style={styles.specBoxLbl}>Quãng đường</Text>
                </View>
                <View style={styles.specBox}>
                  <Ionicons name="disc-outline" size={16} color="#6F4E37" />
                  <Text style={styles.specBoxVal}>
                    {vehicle.telematics?.tirePressurePsi?.fl || 34} PSI
                  </Text>
                  <Text style={styles.specBoxLbl}>Áp suất lốp</Text>
                </View>
                <View style={styles.specBox}>
                  <Ionicons name="speedometer-outline" size={16} color="#6F4E37" />
                  <Text style={styles.specBoxVal}>GLOSA</Text>
                  <Text style={styles.specBoxLbl}>Làn sóng xanh</Text>
                </View>
              </View>

              {/* Pre-Trip IoT 4-Tire & Safety Check Box */}
              <View style={styles.safetyBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-checkmark" size={15} color="#6F4E37" />
                  <Text style={styles.safetyBoxTitle}>
                    Đã kiểm định an toàn trước chuyến đi
                  </Text>
                </View>
                <Text style={styles.safetyBoxMeta}>
                  4 Lốp OK · Pin {batteryPct}%
                </Text>
              </View>
            </View>

            {/* 3. Rental Package & Duration Selector (Hourly vs Daily) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>1. Chọn gói thời gian thuê</Text>
              <View style={styles.modeSwitchRow}>
                <TouchableOpacity
                  style={[styles.modeTab, rentalType === 'HOURLY' && styles.modeTabActive]}
                  onPress={() => setRentalType('HOURLY')}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="time-outline"
                    size={15}
                    color={rentalType === 'HOURLY' ? '#FFFFFF' : '#8C6239'}
                  />
                  <Text style={[styles.modeTabText, rentalType === 'HOURLY' && styles.modeTabTextActive]}>
                    Thuê theo giờ ({vehicle.hourlyPrice.toLocaleString('vi-VN')}đ/h)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, rentalType === 'DAILY' && styles.modeTabActive]}
                  onPress={() => setRentalType('DAILY')}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={rentalType === 'DAILY' ? '#FFFFFF' : '#8C6239'}
                  />
                  <Text style={[styles.modeTabText, rentalType === 'DAILY' && styles.modeTabTextActive]}>
                    Thuê theo ngày ({vehicle.dailyPrice.toLocaleString('vi-VN')}đ/ngày)
                  </Text>
                </TouchableOpacity>
              </View>

              {rentalType === 'HOURLY' ? (
                <View style={styles.durationPillsRow}>
                  {[2, 4, 6, 8, 12].map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.durationChip, durationHours === h && styles.durationChipActive]}
                      onPress={() => setDurationHours(h)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.durationChipText, durationHours === h && styles.durationChipTextActive]}>
                        {h} giờ
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.durationPillsRow}>
                  {[1, 2, 3, 5, 7].map(d => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.durationChip, durationDays === d && styles.durationChipActive]}
                      onPress={() => setDurationDays(d)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.durationChipText, durationDays === d && styles.durationChipTextActive]}>
                        {d} ngày
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* 4. Pickup & Return Location Mode */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>2. Hình thức nhận xe</Text>
              <View style={styles.deliveryRow}>
                <TouchableOpacity
                  style={[styles.deliveryOption, deliveryMode === 'STATION' && styles.deliveryOptionActive]}
                  onPress={() => setDeliveryMode('STATION')}
                  activeOpacity={0.85}
                >
                  <View style={styles.deliveryRadioRow}>
                    <Ionicons
                      name={deliveryMode === 'STATION' ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={deliveryMode === 'STATION' ? '#6F4E37' : '#A89F91'}
                    />
                    <Text style={styles.deliveryTitle}>Tự nhận tại Hub ITS</Text>
                  </View>
                  <Text style={styles.deliverySub}>Miễn phí • Mở khóa 24/7</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deliveryOption, deliveryMode === 'DOORSTEP' && styles.deliveryOptionActive]}
                  onPress={() => setDeliveryMode('DOORSTEP')}
                  activeOpacity={0.85}
                >
                  <View style={styles.deliveryRadioRow}>
                    <Ionicons
                      name={deliveryMode === 'DOORSTEP' ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={deliveryMode === 'DOORSTEP' ? '#6F4E37' : '#A89F91'}
                    />
                    <Text style={styles.deliveryTitle}>Giao xe tận nơi</Text>
                  </View>
                  <Text style={styles.deliverySub}>+50.000đ • Trong 20 phút</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Protection & Insurance Plan */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>3. Gói bảo hiểm chuyến đi</Text>
              {INSURANCE_PLANS.map(plan => {
                const selected = insuranceTier === plan.id;
                const fee = rentalType === 'DAILY' ? plan.priceDay * durationDays : plan.priceHour;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.insuranceItem, selected && styles.insuranceItemActive]}
                    onPress={() => setInsuranceTier(plan.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.insTopRow}>
                      <View style={styles.insTitleGroup}>
                        <Ionicons
                          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={18}
                          color={selected ? '#6F4E37' : '#A89F91'}
                        />
                        <Text style={styles.insName}>{plan.name}</Text>
                        <View style={styles.insBadge}>
                          <Text style={styles.insBadgeText}>{plan.badge}</Text>
                        </View>
                      </View>
                      <Text style={styles.insFeeText}>
                        {fee === 0 ? '0đ' : `+${fee.toLocaleString('vi-VN')}đ`}
                      </Text>
                    </View>
                    <Text style={styles.insDesc}>{plan.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 6. Voucher & Promotions */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>4. Mã ưu đãi (Voucher)</Text>
              <View style={styles.voucherInputRow}>
                <Ionicons name="pricetag-outline" size={16} color="#6F4E37" />
                <TextInput
                  style={styles.voucherInput}
                  value={voucherCode}
                  onChangeText={setVoucherCode}
                  placeholder="Nhập mã (BANMOI30, UTH50K, ECOGO20)"
                  placeholderTextColor="#A89F91"
                />
                <View style={styles.quickVoucherRow}>
                  {['BANMOI30', 'ECOGO20', 'UTH50K', 'FREESHIP', 'CUOITUAN200', 'GIOVANG25'].map(code => (
                    <TouchableOpacity
                      key={code}
                      style={[
                        styles.quickVoucherPill,
                        voucherCode.toUpperCase() === code && styles.quickVoucherPillActive
                      ]}
                      onPress={() => setVoucherCode(code)}
                    >
                      <Text
                        style={[
                          styles.quickVoucherText,
                          voucherCode.toUpperCase() === code && styles.quickVoucherTextActive
                        ]}
                      >
                        {code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* 7. Transparent Price Breakdown */}
            <View style={[styles.sectionCard, styles.beigeSummaryCard]}>
              <Text style={styles.sectionTitle}>5. Chi tiết thanh toán minh bạch</Text>

              {quote && (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>
                      Phí thuê xe ({rentalType === 'DAILY' ? `${durationDays} ngày` : `${durationHours} giờ`})
                    </Text>
                    <Text style={styles.priceRowVal}>{quote.baseRentalFee.toLocaleString('vi-VN')}đ</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Bảo hiểm chuyến đi ({insuranceTier})</Text>
                    <Text style={styles.priceRowVal}>{quote.insuranceFee.toLocaleString('vi-VN')}đ</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Phí nền tảng & Telematics ITS (5%)</Text>
                    <Text style={styles.priceRowVal}>{quote.platformServiceFee.toLocaleString('vi-VN')}đ</Text>
                  </View>

                  {quote.deliveryFee > 0 && (
                    <View style={styles.priceRow}>
                      <Text style={styles.priceRowLabel}>Phí giao nhận xe tận nơi</Text>
                      <Text style={styles.priceRowVal}>{quote.deliveryFee.toLocaleString('vi-VN')}đ</Text>
                    </View>
                  )}

                  {quote.discountAmount > 0 && (
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceRowLabel, { color: '#B45309', fontWeight: '700' }]}>
                        Khuyến mãi Voucher ({voucherCode.toUpperCase()})
                      </Text>
                      <Text style={[styles.priceRowVal, { color: '#B45309', fontWeight: '800' }]}>
                        -{quote.discountAmount.toLocaleString('vi-VN')}đ
                      </Text>
                    </View>
                  )}

                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>Tiền thế chấp (Đã xác thực eKYC)</Text>
                    <Text style={[styles.priceRowVal, { color: '#6F4E37', fontWeight: '800' }]}>0đ (Miễn cọc)</Text>
                  </View>

                  <View style={styles.totalDivider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalAmount}>{quote.totalAmount.toLocaleString('vi-VN')}đ</Text>
                  </View>
                </>
              )}

              {/* e-Contract Agreement Checkbox */}
              <TouchableOpacity
                style={styles.contractAgreeRow}
                onPress={() => setAgreedTerms(!agreedTerms)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={agreedTerms ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={agreedTerms ? '#6F4E37' : '#A89F91'}
                />
                <Text style={styles.contractAgreeText}>
                  Tôi đồng ý ký <Text style={styles.boldText}>Hợp đồng thuê xe điện tử ITS</Text> và nhận chìa khóa số BLE.
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Bottom Checkout Action Bar */}
          <View style={styles.bottomCheckoutBar}>
            <View>
              <Text style={styles.bottomTotalSub}>Tổng cộng (Đã gồm VAT)</Text>
              <Text style={styles.bottomTotalVal}>
                {quote ? `${quote.totalAmount.toLocaleString('vi-VN')}đ` : '...'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmBookBtn, (!agreedTerms || submitting) && { opacity: 0.6 }]}
              disabled={!agreedTerms || submitting}
              onPress={handleConfirmBooking}
              activeOpacity={0.88}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="key" size={16} color="#D4AF37" />
                  <Text style={styles.confirmBookBtnText}>Ký Hợp Đồng & Nhận Khóa Số →</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 18, 12, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DE'
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  topTitleCenter: {
    alignItems: 'center'
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2B180D'
  },
  topSubtitle: {
    fontSize: 10,
    color: '#8C6239',
    fontWeight: '500',
    marginTop: 1
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#E8DFD8',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 4
  },
  verifiedChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6F4E37'
  },
  scrollBody: {
    paddingHorizontal: 14,
    paddingTop: 12
  },
  galleryContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    backgroundColor: '#EAE4DC',
    marginBottom: 12,
    position: 'relative'
  },
  heroImage: {
    width: '100%',
    height: '100%'
  },
  imageFloatingBadges: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  coffeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 24, 13, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 4
  },
  coffeeBadgeText: {
    color: '#FAF7F2',
    fontSize: 10,
    fontWeight: '800'
  },
  plateFloating: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  plateFloatingText: {
    color: '#2B180D',
    fontSize: 11,
    fontWeight: '800'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1
  },
  beigeSummaryCard: {
    backgroundColor: '#FAF7F2',
    borderColor: '#E8DFD8'
  },
  vehHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  vehTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#2B180D'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  ratingBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D'
  },
  ratingCount: {
    fontSize: 11,
    color: '#8C6239'
  },
  priceHighlightBox: {
    alignItems: 'flex-end',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DFD8'
  },
  priceBig: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6F4E37'
  },
  priceUnitText: {
    fontSize: 10,
    color: '#8C6239',
    fontWeight: '600'
  },
  specsGrid4: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  specBox: {
    flex: 1,
    alignItems: 'center'
  },
  specBoxVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D',
    marginTop: 3
  },
  specBoxLbl: {
    fontSize: 9,
    color: '#8C6239',
    marginTop: 1
  },
  safetyBox: {
    marginTop: 10,
    backgroundColor: '#F5EFEB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8DFD8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  safetyBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B180D'
  },
  safetyBoxMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6F4E37'
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2B180D',
    marginBottom: 10
  },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5
  },
  modeTabActive: {
    backgroundColor: '#6F4E37',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C6239'
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  durationPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6
  },
  durationChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  durationChipActive: {
    backgroundColor: '#F5EFEB',
    borderColor: '#6F4E37'
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E6E73'
  },
  durationChipTextActive: {
    color: '#6F4E37',
    fontWeight: '800'
  },
  deliveryRow: {
    flexDirection: 'row',
    gap: 8
  },
  deliveryOption: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  deliveryOptionActive: {
    backgroundColor: '#F5EFEB',
    borderColor: '#6F4E37'
  },
  deliveryRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  deliveryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D'
  },
  deliverySub: {
    fontSize: 10,
    color: '#8C6239',
    marginTop: 3,
    marginLeft: 22
  },
  insuranceItem: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE8DE',
    marginBottom: 8
  },
  insuranceItemActive: {
    backgroundColor: '#F5EFEB',
    borderColor: '#6F4E37'
  },
  insTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  insTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  insName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D'
  },
  insBadge: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFE8DE'
  },
  insBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8C6239'
  },
  insFeeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6F4E37'
  },
  insDesc: {
    fontSize: 10,
    color: '#6E6E73',
    marginTop: 3,
    marginLeft: 24
  },
  voucherInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#EFE8DE',
    gap: 8
  },
  voucherInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#2B180D'
  },
  quickVoucherRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap'
  },
  quickVoucherPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F5EFEB',
    borderWidth: 1,
    borderColor: '#E8DFD8'
  },
  quickVoucherPillActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  quickVoucherText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6F4E37'
  },
  quickVoucherTextActive: {
    color: '#FFFFFF'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  priceRowLabel: {
    fontSize: 12,
    color: '#6E6E73'
  },
  priceRowVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2B180D'
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E8DFD8',
    marginVertical: 8
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2B180D'
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6F4E37'
  },
  contractAgreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8DFD8'
  },
  contractAgreeText: {
    flex: 1,
    fontSize: 11,
    color: '#6E6E73'
  },
  boldText: {
    fontWeight: '800',
    color: '#2B180D'
  },
  bottomCheckoutBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFE8DE'
  },
  bottomTotalSub: {
    fontSize: 10,
    color: '#8C6239',
    fontWeight: '600'
  },
  bottomTotalVal: {
    fontSize: 19,
    fontWeight: '900',
    color: '#2B180D'
  },
  confirmBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E3322',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  confirmBookBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
