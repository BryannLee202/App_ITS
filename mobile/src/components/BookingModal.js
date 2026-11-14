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
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, COLORS } from '../styles/theme';
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
    name: 'Bảo Vệ Tiêu Chuẩn EcoGo',
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

const DEPOSIT_OPTIONS = [
  {
    id: 'VERIFIED_WAIVER_0D',
    title: '0đ Cọc Bảo Chứng (Định Danh eKYC)',
    badge: 'Miễn cọc 100%',
    desc: 'Miễn thế chấp nhờ đã định danh CCCD gắn chip & xác thực tài khoản EcoGo Prime.',
    carFee: 0,
    bikeFee: 0,
    icon: 'shield-checkmark'
  },
  {
    id: 'CASH_TRANSFER',
    title: 'Cọc Chuyển Khoản / Phong Tỏa Thẻ',
    badge: 'Hoàn sau 24h',
    desc: 'Chuyển khoản cọc giữ chỗ. Hệ thống hoàn lại 100% tự động sau 24h kể từ khi trả xe an toàn.',
    carFee: 5000000,
    bikeFee: 1500000,
    icon: 'card-outline'
  },
  {
    id: 'ASSET_BIKE',
    title: 'Thế Chấp Xe Máy Cá Nhân + Cavet Gốc',
    badge: '0đ Tiền mặt',
    desc: 'Gửi xe máy cá nhân và bản gốc đăng ký xe tại bãi đỗ trạm EcoGo Hub trong suốt chuyến đi.',
    carFee: 0,
    bikeFee: 0,
    icon: 'bicycle-outline'
  }
];

export default function BookingModal({
  visible,
  vehicle,
  onClose,
  onBookingSuccess,
  initialVoucherCode = 'CHAOXANH',
  initialDeliveryMode = 'STATION',
  onSwitchVehicle
}) {
  // Navigation Steps: 'CONFIG' -> 'CONTRACT' -> 'PAYMENT' -> 'SUCCESS'
  const [currentStep, setCurrentStep] = useState('CONFIG');

  // Booking Configuration
  const [rentalType, setRentalType] = useState('HOURLY'); // 'HOURLY' | 'DAILY'
  const [durationHours, setDurationHours] = useState(4);
  const [durationDays, setDurationDays] = useState(1);
  const [deliveryMode, setDeliveryMode] = useState(initialDeliveryMode || 'STATION');
  const [insuranceTier, setInsuranceTier] = useState('STANDARD');
  const [voucherCode, setVoucherCode] = useState(initialVoucherCode);
  const [depositOption, setDepositOption] = useState('VERIFIED_WAIVER_0D');
  const [useEcoCoins, setUseEcoCoins] = useState(false);

  // Quote & API
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // E-Contract & Signature
  const [contractCode, setContractCode] = useState('HD-ECOGO-2026-9812');
  const [signedContract, setSignedContract] = useState(false);
  const [agreedContractTerms, setAgreedContractTerms] = useState(true);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('VIETQR'); // 'VIETQR' | 'CARD' | 'MOMO'
  const [paymentTimer, setPaymentTimer] = useState(600); // 10 minutes countdown
  const [copyToast, setCopyToast] = useState(null);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 8899');
  const [cardHolder, setCardHolder] = useState('NGUYEN MINH TAI');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Completed Booking Result
  const [bookingResult, setBookingResult] = useState(null);

  // Reset or initialize on modal open
  useEffect(() => {
    if (visible) {
      setCurrentStep('CONFIG');
      setSignedContract(false);
      setPaymentTimer(600);
      setContractCode(`HD-ECOGO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      if (initialVoucherCode) setVoucherCode(initialVoucherCode);
      if (initialDeliveryMode) setDeliveryMode(initialDeliveryMode);
    }
  }, [visible]);

  // Payment Countdown Timer
  useEffect(() => {
    let interval = null;
    if (visible && currentStep === 'PAYMENT' && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, currentStep, paymentTimer]);

  useEffect(() => {
    if (visible && vehicle) {
      setActivePhotoIdx(0);
      fetchQuote();
    }
  }, [
    visible,
    vehicle,
    rentalType,
    durationHours,
    durationDays,
    deliveryMode,
    insuranceTier,
    voucherCode,
    depositOption,
    useEcoCoins
  ]);

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
        voucherCode,
        depositOption,
        useEcoCoins,
        availableCoins: 250
      });
      if (res && res.quote) {
        setQuote(res.quote);
      }
    } catch (e) {
      // Offline fallback calculation
      const isCar = vehicle.type === 'CAR' || vehicle.category === 'CAR' || vehicle.category === 'LUXURY';
      const baseRentalFee =
        rentalType === 'DAILY'
          ? vehicle.dailyPrice * durationDays
          : vehicle.hourlyPrice * durationHours;
      const insuranceFee =
        insuranceTier === 'PREMIUM' ? 55000 : insuranceTier === 'STANDARD' ? 25000 : 0;
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
      } else if (code === 'PRIME50K' || code === 'ECO50K') {
        discountAmount = 50000;
      } else if (code === 'THUENGAY200' || code === 'CUOITUAN200') {
        discountAmount = rentalType === 'DAILY' ? 200000 : 100000;
      } else if (code === 'FREESHIP5KM' || code === 'FREEDELIVERY' || code === 'FREESHIP') {
        discountAmount = deliveryFee > 0 ? deliveryFee : 50000;
      }

      const ecoCoinsDiscount = useEcoCoins ? 25000 : 0;
      const depositAmount =
        depositOption === 'CASH_TRANSFER' ? (isCar ? 5000000 : 1500000) : 0;
      const depositLabel =
        depositOption === 'CASH_TRANSFER'
          ? isCar
            ? '5.000.000đ (Hoàn trả sau 24h)'
            : '1.500.000đ (Hoàn trả sau 24h)'
          : depositOption === 'ASSET_BIKE'
          ? 'Thế chấp xe máy cá nhân + Cavet (0đ tiền mặt)'
          : 'Miễn cọc bảo chứng (Định danh eKYC)';

      const rentalSubtotal = Math.max(
        0,
        baseRentalFee + insuranceFee + platformServiceFee + deliveryFee - discountAmount - ecoCoinsDiscount
      );
      const totalPayable = rentalSubtotal + depositAmount;

      setQuote({
        baseRentalFee,
        insuranceFee,
        platformServiceFee,
        deliveryFee,
        discountAmount,
        ecoCoinsDiscount,
        depositOption,
        depositAmount,
        depositLabel,
        rentalSubtotal,
        totalAmount: rentalSubtotal,
        totalPayable
      });
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleCopyToClipboard = (text, label) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch (e) {
      // ignore
    }
    setCopyToast(`Đã sao chép ${label}!`);
    setTimeout(() => {
      setCopyToast(null);
    }, 2200);
  };

  const handleConfirmPayment = async () => {
    if (!vehicle) return;
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
        voucherCode,
        depositOption,
        depositAmount: quote?.depositAmount || 0,
        paymentMethod,
        ecoCoinsUsed: useEcoCoins ? 250 : 0,
        contractNumber: contractCode,
        signatureData: 'Nguyễn Minh Tài - E-Signature verified by EcoGo CA'
      });

      const finalResult = res?.trip ? res : {
        success: true,
        message: 'Thanh toán & Ký hợp đồng điện tử thành công! Chìa khóa số Digital Key đã sẵn sàng.',
        trip: {
          id: `trip_${Math.floor(1000 + Math.random() * 9000)}`,
          contractNumber: contractCode,
          vehicleId: vehicle.id,
          totalAmount: quote?.totalPayable || quote?.rentalSubtotal || 529000,
          paymentMethod,
          depositOption,
          depositAmount: quote?.depositAmount || 0,
          paidAt: new Date().toISOString()
        },
        vehicle
      };

      setBookingResult(finalResult);
      setCurrentStep('SUCCESS');
    } catch (err) {
      // Graceful offline mock completion
      const fallbackResult = {
        success: true,
        message: 'Thanh toán & Ký hợp đồng thành công! Chìa khóa số đã kích hoạt.',
        trip: {
          id: `trip_${Math.floor(1000 + Math.random() * 9000)}`,
          contractNumber: contractCode,
          vehicleId: vehicle.id,
          totalAmount: quote?.totalPayable || 529000,
          paymentMethod,
          depositOption,
          depositAmount: quote?.depositAmount || 0,
          paidAt: new Date().toISOString()
        },
        vehicle
      };
      setBookingResult(fallbackResult);
      setCurrentStep('SUCCESS');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalFinish = () => {
    if (bookingResult && onBookingSuccess) {
      onBookingSuccess(bookingResult);
    }
    onClose();
  };

  if (!vehicle) return null;

  const photos = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.thumbnail];
  const batteryPct = Math.round(vehicle.telematics?.batteryLevelPct || 94);
  const isCar = vehicle.type === 'CAR' || vehicle.category === 'CAR' || vehicle.category === 'LUXURY';

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalPayableValue = quote?.totalPayable ?? quote?.totalAmount ?? 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Copy Toast Indicator */}
          {copyToast && (
            <View style={styles.copyToastBanner}>
              <Ionicons name="checkmark-circle" size={15} color="#D4AF37" />
              <Text style={styles.copyToastText}>{copyToast}</Text>
            </View>
          )}

          {/* Top Modal Bar */}
          <View style={styles.topBar}>
            {currentStep === 'CONFIG' ? (
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.75}>
                <Ionicons name="close" size={20} color="#2B180D" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  if (currentStep === 'CONTRACT') setCurrentStep('CONFIG');
                  else if (currentStep === 'PAYMENT') setCurrentStep('CONTRACT');
                  else if (currentStep === 'SUCCESS') onClose();
                }}
                activeOpacity={0.75}
              >
                <Ionicons name="chevron-back" size={20} color="#2B180D" />
                <Text style={styles.backBtnText}>
                  {currentStep === 'CONTRACT' ? 'Cấu hình' : currentStep === 'PAYMENT' ? 'Hợp đồng' : 'Đóng'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.topTitleCenter}>
              <Text style={styles.topTitle}>
                {currentStep === 'CONFIG' && 'Chi Tiết & Đặt Thuê Xe'}
                {currentStep === 'CONTRACT' && 'Hợp Đồng Điện Tử'}
                {currentStep === 'PAYMENT' && 'Cổng Thanh Toán Napas'}
                {currentStep === 'SUCCESS' && 'Biên Nhận & Chìa Khóa'}
              </Text>
              <Text style={styles.topSubtitle}>
                {currentStep === 'CONFIG' && 'Bước 1/4: Cấu hình & Chọn gói cọc'}
                {currentStep === 'CONTRACT' && 'Bước 2/4: Xem & Ký hợp đồng số'}
                {currentStep === 'PAYMENT' && 'Bước 3/4: Thanh toán VietQR Napas 24/7'}
                {currentStep === 'SUCCESS' && 'Bước 4/4: Kích hoạt Digital Key'}
              </Text>
            </View>

            {currentStep === 'CONFIG' && onSwitchVehicle ? (
              <TouchableOpacity
                style={styles.switchVehBtn}
                onPress={onSwitchVehicle}
                activeOpacity={0.8}
              >
                <Ionicons name="car-sport-outline" size={13} color="#6F4E37" />
                <Text style={styles.switchVehText}>Đổi xe</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.verifiedChip}>
                <Ionicons name="shield-checkmark" size={13} color="#D4AF37" />
                <Text style={styles.verifiedChipText}>
                  {depositOption === 'VERIFIED_WAIVER_0D' ? '0đ Cọc' : 'EcoSafe'}
                </Text>
              </View>
            )}
          </View>

          {/* Stepper Progress Bar */}
          <View style={styles.stepperContainer}>
            <View
              style={[
                styles.stepItem,
                currentStep === 'CONFIG' && styles.stepItemActive,
                (currentStep === 'CONTRACT' || currentStep === 'PAYMENT' || currentStep === 'SUCCESS') && styles.stepItemDone
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  (currentStep === 'CONFIG' || currentStep === 'CONTRACT' || currentStep === 'PAYMENT' || currentStep === 'SUCCESS') && styles.stepNumberActive
                ]}
              >
                1. Cọc & Giá
              </Text>
            </View>
            <View style={styles.stepConnector} />
            <View
              style={[
                styles.stepItem,
                currentStep === 'CONTRACT' && styles.stepItemActive,
                (currentStep === 'PAYMENT' || currentStep === 'SUCCESS') && styles.stepItemDone
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  (currentStep === 'CONTRACT' || currentStep === 'PAYMENT' || currentStep === 'SUCCESS') && styles.stepNumberActive
                ]}
              >
                2. Ký Hợp Đồng
              </Text>
            </View>
            <View style={styles.stepConnector} />
            <View
              style={[
                styles.stepItem,
                currentStep === 'PAYMENT' && styles.stepItemActive,
                currentStep === 'SUCCESS' && styles.stepItemDone
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  (currentStep === 'PAYMENT' || currentStep === 'SUCCESS') && styles.stepNumberActive
                ]}
              >
                3. Thanh Toán
              </Text>
            </View>
            <View style={styles.stepConnector} />
            <View style={[styles.stepItem, currentStep === 'SUCCESS' && styles.stepItemActive]}>
              <Text style={[styles.stepNumber, currentStep === 'SUCCESS' && styles.stepNumberActive]}>
                4. Nhận Khóa
              </Text>
            </View>
          </View>

          {/* =========================================================================
              STEP 1: CONFIGURATION & DEPOSIT OPTION
             ========================================================================= */}
          {currentStep === 'CONFIG' && (
            <>
              <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
                {/* 1. Vehicle Showroom Gallery */}
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
                        {vehicle.powerType === 'ELECTRIC'
                          ? `${batteryPct}% PIN • ${vehicle.rangeKm}KM`
                          : `${vehicle.rangeKm}KM`}
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

                  {/* 4 Key Telemetry Specs */}
                  <View style={styles.specsGrid4}>
                    <View style={styles.specBox}>
                      <View style={styles.specIconBadge}>
                        <Ionicons name="people-outline" size={15} color="#6F4E37" />
                      </View>
                      <Text style={styles.specBoxVal}>{vehicle.seats} chỗ</Text>
                      <Text style={styles.specBoxLbl}>Nội thất</Text>
                    </View>
                    <View style={styles.specBox}>
                      <View style={styles.specIconBadge}>
                        <Ionicons name="battery-charging-outline" size={15} color="#6F4E37" />
                      </View>
                      <Text style={styles.specBoxVal}>{vehicle.rangeKm} km</Text>
                      <Text style={styles.specBoxLbl}>Quãng đường</Text>
                    </View>
                    <View style={styles.specBox}>
                      <View style={styles.specIconBadge}>
                        <Ionicons name="speedometer-outline" size={15} color="#6F4E37" />
                      </View>
                      <Text style={styles.specBoxVal}>34 PSI</Text>
                      <Text style={styles.specBoxLbl}>Áp suất lốp</Text>
                    </View>
                    <View style={styles.specBox}>
                      <View style={styles.specIconBadge}>
                        <Ionicons name="navigate-circle-outline" size={15} color="#6F4E37" />
                      </View>
                      <Text style={styles.specBoxVal}>GLOSA</Text>
                      <Text style={styles.specBoxLbl}>Làn sóng xanh</Text>
                    </View>
                  </View>

                  {/* Inspection Assurance */}
                  <View style={styles.ecoSafeBanner}>
                    <Ionicons name="shield-checkmark" size={16} color="#D4AF37" />
                    <Text style={styles.ecoSafeText}>Đã kiểm định an toàn EcoSafe</Text>
                    <View style={styles.safeTag}>
                      <Text style={styles.safeTagText}>4 Lốp OK • Pin {batteryPct}%</Text>
                    </View>
                  </View>
                </View>

                {/* 3. Rental Package: Hourly or Daily */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>1. Thời gian thuê xe</Text>
                  <View style={styles.rentalTypeToggle}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, rentalType === 'HOURLY' && styles.toggleBtnActive]}
                      onPress={() => setRentalType('HOURLY')}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="time-outline"
                        size={15}
                        color={rentalType === 'HOURLY' ? '#FAF7F2' : '#6F4E37'}
                      />
                      <Text style={[styles.toggleBtnText, rentalType === 'HOURLY' && styles.toggleBtnTextActive]}>
                        Thuê theo giờ
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.toggleBtn, rentalType === 'DAILY' && styles.toggleBtnActive]}
                      onPress={() => setRentalType('DAILY')}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={15}
                        color={rentalType === 'DAILY' ? '#FAF7F2' : '#6F4E37'}
                      />
                      <Text style={[styles.toggleBtnText, rentalType === 'DAILY' && styles.toggleBtnTextActive]}>
                        Thuê theo ngày (24h)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Duration Chips */}
                  {rentalType === 'HOURLY' ? (
                    <View style={styles.durationPillsRow}>
                      {[2, 4, 6, 8, 12].map((h) => (
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
                      {[1, 2, 3, 5, 7].map((d) => (
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

                {/* 4. Pickup & Return Mode */}
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
                        <Text style={styles.deliveryTitle}>Tự nhận tại EcoGo Hub</Text>
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
                  {INSURANCE_PLANS.map((plan) => {
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

                {/* 6. REALISTIC DEPOSIT POLICY SELECTOR */}
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>4. Chính sách đặt cọc (Thế chấp)</Text>
                    <View style={styles.depositShieldBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#6F4E37" />
                      <Text style={styles.depositShieldText}>Bảo vệ 100%</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionSubDesc}>
                    Chọn phương thức cọc minh bạch như các nền tảng xe tự lái hàng đầu:
                  </Text>

                  {DEPOSIT_OPTIONS.map((opt) => {
                    const selected = depositOption === opt.id;
                    const fee = isCar ? opt.carFee : opt.bikeFee;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.depositCard, selected && styles.depositCardActive]}
                        onPress={() => setDepositOption(opt.id)}
                        activeOpacity={0.88}
                      >
                        <View style={styles.depositTopRow}>
                          <View style={styles.depositTitleRow}>
                            <Ionicons
                              name={selected ? 'radio-button-on' : 'radio-button-off'}
                              size={18}
                              color={selected ? '#6F4E37' : '#A89F91'}
                            />
                            <Text style={styles.depositTitle}>{opt.title}</Text>
                          </View>
                          <View style={[styles.depositBadge, selected && styles.depositBadgeActive]}>
                            <Text style={[styles.depositBadgeText, selected && styles.depositBadgeTextActive]}>
                              {opt.badge}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.depositDesc}>{opt.desc}</Text>
                        <View style={styles.depositFeeRow}>
                          <Text style={styles.depositFeeLabel}>Mức tiền giữ cọc:</Text>
                          <Text style={[styles.depositFeeVal, selected && { color: '#6F4E37' }]}>
                            {fee === 0 ? '0đ' : `${fee.toLocaleString('vi-VN')}đ`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 7. Voucher & Promotions */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>5. Mã ưu đãi (Voucher)</Text>
                  <View style={styles.voucherInputRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#6F4E37" />
                    <TextInput
                      style={styles.voucherInput}
                      value={voucherCode}
                      onChangeText={setVoucherCode}
                      placeholder="Nhập mã (BANMOI30, PRIME50K, ECOGO20)"
                      placeholderTextColor="#A89F91"
                    />
                    <View style={styles.quickVoucherRow}>
                      {['BANMOI30', 'ECOGO20', 'PRIME50K', 'FREESHIP'].map((code) => (
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

                {/* 8. Transparent Price Breakdown */}
                <View style={[styles.sectionCard, styles.beigeSummaryCard]}>
                  <Text style={styles.sectionTitle}>6. Bảng tính chi phí minh bạch</Text>

                  {quote && (
                    <>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceRowLabel}>
                          Tiền thuê xe ({rentalType === 'DAILY' ? `${durationDays} ngày` : `${durationHours} giờ`})
                        </Text>
                        <Text style={styles.priceRowVal}>{quote.baseRentalFee.toLocaleString('vi-VN')}đ</Text>
                      </View>

                      <View style={styles.priceRow}>
                        <Text style={styles.priceRowLabel}>Bảo hiểm chuyến đi ({insuranceTier})</Text>
                        <Text style={styles.priceRowVal}>{quote.insuranceFee.toLocaleString('vi-VN')}đ</Text>
                      </View>

                      <View style={styles.priceRow}>
                        <Text style={styles.priceRowLabel}>Phí nền tảng & Telematics EcoGo (5%)</Text>
                        <Text style={styles.priceRowVal}>{quote.platformServiceFee.toLocaleString('vi-VN')}đ</Text>
                      </View>

                      {quote.deliveryFee > 0 && (
                        <View style={styles.priceRow}>
                          <Text style={styles.priceRowLabel}>Phí giao xe tận nơi</Text>
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
                        <Text style={[styles.priceRowLabel, { fontWeight: '700' }]}>
                          Tiền cọc thế chấp ({depositOption === 'CASH_TRANSFER' ? 'Hoàn lại 24h' : '0đ thế chấp'})
                        </Text>
                        <Text
                          style={[
                            styles.priceRowVal,
                            { color: quote.depositAmount > 0 ? '#6F4E37' : '#2D8A4E', fontWeight: '800' }
                          ]}
                        >
                          {quote.depositAmount > 0
                            ? `+${quote.depositAmount.toLocaleString('vi-VN')}đ`
                            : '0đ (Miễn cọc)'}
                        </Text>
                      </View>

                      <View style={styles.totalDivider} />

                      <View style={styles.totalRow}>
                        <View>
                          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                          <Text style={styles.totalSubNotice}>Đã bao gồm tiền cọc & thuế VAT</Text>
                        </View>
                        <Text style={styles.totalAmount}>{totalPayableValue.toLocaleString('vi-VN')}đ</Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={{ height: 28 }} />
              </ScrollView>

              {/* Bottom Next Step Bar */}
              <View style={styles.bottomCheckoutBar}>
                <View>
                  <Text style={styles.bottomTotalSub}>Tổng thanh toán</Text>
                  <Text style={styles.bottomTotalVal}>
                    {quote ? `${totalPayableValue.toLocaleString('vi-VN')}đ` : '...'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.confirmBookBtn}
                  onPress={() => setCurrentStep('CONTRACT')}
                  activeOpacity={0.88}
                >
                  <Ionicons name="document-text" size={16} color="#D4AF37" />
                  <Text style={styles.confirmBookBtnText}>Tiếp Tục Ký Hợp Đồng →</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* =========================================================================
              STEP 2: LEGAL E-CONTRACT & E-SIGNATURE
             ========================================================================= */}
          {currentStep === 'CONTRACT' && (
            <>
              <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
                {/* Contract Header Seal */}
                <View style={styles.contractDocHeader}>
                  <Text style={styles.nationalMotto}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
                  <Text style={styles.nationalSubMotto}>Độc lập - Tự do - Hạnh phúc</Text>
                  <View style={styles.mottoDivider} />
                  <Text style={styles.contractMainTitle}>HỢP ĐỒNG THUÊ PHƯƠNG TIỆN GIAO THÔNG TỰ LÁI</Text>
                  <Text style={styles.contractCodeNumber}>Số: {contractCode} / HĐ-ECOGO-2026</Text>
                  <Text style={styles.contractLawReference}>
                    (Căn cứ Bộ Luật Dân sự & Luật Giao dịch Điện tử số 20/2023/QH15)
                  </Text>
                </View>

                {/* Section A: Party A (EcoGo) */}
                <View style={styles.contractSectionCard}>
                  <View style={styles.partyBadgeRow}>
                    <Text style={styles.partyRoleBadge}>BÊN A (BÊN CHO THUÊ)</Text>
                    <Ionicons name="shield-checkmark" size={14} color="#D4AF37" />
                  </View>
                  <Text style={styles.partyName}>CÔNG TY CỔ PHẦN DỊCH VỤ DI CHUYỂN THÔNG MINH ECOGO</Text>
                  <Text style={styles.partyDetail}>
                    • Trụ sở vận hành: EcoGo Central Hub - Số 208 Nguyễn Hữu Cảnh / Điện Biên Phủ, Bình Thạnh, TP.HCM
                  </Text>
                  <Text style={styles.partyDetail}>• Đại diện: Trung Tâm Điều Hành Di Chuyển Thông Minh EcoGo Mobility</Text>
                  <Text style={styles.partyDetail}>• Hotline hỗ trợ kỹ thuật & Cứu hộ 24/7: 1900 6868</Text>
                </View>

                {/* Section B: Party B (Renter) */}
                <View style={styles.contractSectionCard}>
                  <View style={styles.partyBadgeRow}>
                    <Text style={styles.partyRoleBadge}>BÊN B (BÊN THUÊ PHƯƠNG TIỆN)</Text>
                    <View style={styles.verifiedGreenBadge}>
                      <Text style={styles.verifiedGreenText}>Đã eKYC</Text>
                    </View>
                  </View>
                  <Text style={styles.partyName}>NGUYỄN MINH TÀI</Text>
                  <Text style={styles.partyDetail}>• Số CCCD gắn chip: 079204018899 (Đã xác thực chip NFC Bộ Công An)</Text>
                  <Text style={styles.partyDetail}>
                    • Giấy phép lái xe: GPLX Hạng B2 - Số 790184429 (Có hiệu lực đến năm 2030)
                  </Text>
                  <Text style={styles.partyDetail}>• Số điện thoại đăng ký: 0908 123 456</Text>
                  <Text style={styles.partyDetail}>• Địa chỉ thường trú: Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh</Text>
                </View>

                {/* Section C: Handover Vehicle Specifications */}
                <View style={styles.contractSectionCard}>
                  <Text style={styles.contractSubHeader}>THÔNG TIN PHƯƠNG TIỆN & BIÊN BẢN BÀN GIAO</Text>
                  <View style={styles.vehSpecRow}>
                    <Text style={styles.specKey}>Dòng xe bàn giao:</Text>
                    <Text style={styles.specValBold}>{vehicle.name}</Text>
                  </View>
                  <View style={styles.vehSpecRow}>
                    <Text style={styles.specKey}>Biển kiểm soát:</Text>
                    <Text style={styles.specValBold}>{vehicle.plateNumber}</Text>
                  </View>
                  <View style={styles.vehSpecRow}>
                    <Text style={styles.specKey}>Dung lượng pin lúc nhận:</Text>
                    <Text style={styles.specValBold}>{batteryPct}% (Tối thiểu 300km di chuyển)</Text>
                  </View>
                  <View style={styles.vehSpecRow}>
                    <Text style={styles.specKey}>Tình trạng áp suất 4 lốp:</Text>
                    <Text style={styles.specValBold}>34 PSI (Cảm biến TPMS đạt chuẩn)</Text>
                  </View>
                  <View style={styles.vehSpecRow}>
                    <Text style={styles.specKey}>Địa điểm nhận xe:</Text>
                    <Text style={styles.specValBold}>EcoGo Hub Landmark - Điện Biên Phủ, Bình Thạnh</Text>
                  </View>
                </View>

                {/* Section D: Legal Terms */}
                <View style={styles.contractSectionCard}>
                  <Text style={styles.contractSubHeader}>CÁC ĐIỀU KHOẢN PHÁP LÝ RÀNG BUỘC</Text>
                  <Text style={styles.clauseItem}>
                    <Text style={styles.clauseBold}>Điều 1 (Mục đích & Thời hạn): </Text>
                    Bên B cam kết sử dụng xe đúng mục đích di chuyển dân sự, không vận chuyển chất cấm, không chở quá tải và
                    không giao phương tiện cho người chưa đủ điều kiện điều khiển.
                  </Text>
                  <Text style={styles.clauseItem}>
                    <Text style={styles.clauseBold}>Điều 2 (Trách nhiệm vi phạm giao thông): </Text>
                    Bên B chịu trách nhiệm 100% trước pháp luật về mọi lỗi vi phạm Luật Giao thông Đường bộ (bao gồm cả phạt
                    nguội qua hệ thống camera giao thông tra cứu sau chuyến đi) phát sinh trong suốt thời gian nhận bàn giao xe.
                  </Text>
                  <Text style={styles.clauseItem}>
                    <Text style={styles.clauseBold}>Điều 3 (Quy định trả xe trễ hạn): </Text>
                    Bên B cam kết trả xe đúng giờ. Quá hạn trả xe sẽ áp dụng mức phụ thu tiêu chuẩn 50.000đ/giờ đối với ô tô
                    hoặc 20.000đ/giờ đối với xe máy.
                  </Text>
                  <Text style={styles.clauseItem}>
                    <Text style={styles.clauseBold}>Điều 4 (Chính sách hoàn trả cọc): </Text>
                    Khoản tiền đặt cọc (nếu có: {quote?.depositAmount > 0 ? `${quote.depositAmount.toLocaleString('vi-VN')}đ` : '0đ'})
                    sẽ được hệ thống hoàn trả tự động 100% về tài khoản ngân hàng của Bên B trong vòng 24 giờ sau khi kết thúc hợp đồng
                    và nhân viên kỹ thuật hoàn tất nghiệm thu không có hư hỏng hoặc phạt nguội.
                  </Text>
                </View>

                {/* Section E: E-Signature Pad */}
                <View style={[styles.contractSectionCard, styles.signatureHighlightCard]}>
                  <Text style={styles.contractSubHeader}>CHỮ KÝ ĐIỆN TỬ CỦA BÊN THUÊ (BÊN B)</Text>
                  <Text style={styles.signInstruction}>
                    Chữ ký điện tử có giá trị pháp lý tương đương chữ ký tay theo quy định của pháp luật:
                  </Text>

                  <TouchableOpacity
                    style={[styles.signaturePadBox, signedContract && styles.signaturePadBoxSigned]}
                    onPress={() => setSignedContract(true)}
                    activeOpacity={0.88}
                  >
                    {signedContract ? (
                      <View style={styles.signedContent}>
                        <Text style={styles.cursiveSignature}>Nguyễn Minh Tài</Text>
                        <View style={styles.stampBox}>
                          <Ionicons name="checkmark-circle" size={14} color="#D4AF37" />
                          <Text style={styles.stampText}>ECOGO CA • ĐÃ KÝ SỐ</Text>
                        </View>
                        <Text style={styles.timestampSign}>
                          Thời gian: {new Date().toLocaleTimeString('vi-VN')} {new Date().toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.unsignedPrompt}>
                        <Ionicons name="pencil" size={24} color="#6F4E37" />
                        <Text style={styles.unsignedPromptText}>
                          Chạm vào đây để ký tên số: "Nguyễn Minh Tài"
                        </Text>
                        <Text style={styles.unsignedSubText}>Khởi tạo chứng thư số cá nhân tức thì</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Agreement Checkbox */}
                  <TouchableOpacity
                    style={styles.contractAgreeRow}
                    onPress={() => setAgreedContractTerms(!agreedContractTerms)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={agreedContractTerms ? 'checkbox' : 'square-outline'}
                      size={18}
                      color={agreedContractTerms ? '#6F4E37' : '#A89F91'}
                    />
                    <Text style={styles.contractAgreeText}>
                      Tôi đã đọc, hiểu rõ toàn bộ điều khoản pháp lý và đồng ý ký kết hợp đồng điện tử số{' '}
                      <Text style={styles.boldText}>{contractCode}</Text>.
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 28 }} />
              </ScrollView>

              {/* Bottom Action Bar for Contract */}
              <View style={styles.bottomCheckoutBar}>
                <View>
                  <Text style={styles.bottomTotalSub}>Trạng thái hợp đồng</Text>
                  <Text style={[styles.bottomTotalVal, { fontSize: 15, color: signedContract ? '#2D8A4E' : '#B45309' }]}>
                    {signedContract ? '✓ Đã ký số hợp lệ' : 'Chưa ký số'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.confirmBookBtn,
                    (!signedContract || !agreedContractTerms) && { opacity: 0.55 }
                  ]}
                  disabled={!signedContract || !agreedContractTerms}
                  onPress={() => setCurrentStep('PAYMENT')}
                  activeOpacity={0.88}
                >
                  <Ionicons name="card" size={16} color="#D4AF37" />
                  <Text style={styles.confirmBookBtnText}>Chuyển Sang Thanh Toán →</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* =========================================================================
              STEP 3: MULTI-CHANNEL PAYMENT GATEWAY (VIETQR / CARD / MOMO)
             ========================================================================= */}
          {currentStep === 'PAYMENT' && (
            <>
              <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
                {/* Total Payment Amount Highlight Banner */}
                <View style={styles.payAmountCard}>
                  <Text style={styles.payAmountLabel}>TỔNG SỐ TIỀN CẦN THANH TOÁN</Text>
                  <Text style={styles.payAmountVal}>{totalPayableValue.toLocaleString('vi-VN')}đ</Text>
                  <View style={styles.payBreakdownRow}>
                    <Text style={styles.payBreakdownSub}>
                      Tiền thuê: {quote?.rentalSubtotal.toLocaleString('vi-VN')}đ • Cọc: {quote?.depositAmount.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                </View>

                {/* Eco Coins Deduction Switch */}
                <TouchableOpacity
                  style={[styles.coinsCard, useEcoCoins && styles.coinsCardActive]}
                  onPress={() => setUseEcoCoins(!useEcoCoins)}
                  activeOpacity={0.85}
                >
                  <View style={styles.coinsLeftRow}>
                    <View style={styles.coinsIconBox}>
                      <Ionicons name="sparkles" size={16} color="#D4AF37" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.coinsTitle}>Dùng 250 Xu Eco tích lũy</Text>
                      <Text style={styles.coinsSub}>Quy đổi giảm trực tiếp 25.000đ vào hóa đơn</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={useEcoCoins ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={useEcoCoins ? '#6F4E37' : '#A89F91'}
                  />
                </TouchableOpacity>

                {/* Payment Methods Selector */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

                  {/* 1. VietQR 24/7 Option */}
                  <TouchableOpacity
                    style={[styles.payMethodOption, paymentMethod === 'VIETQR' && styles.payMethodOptionActive]}
                    onPress={() => setPaymentMethod('VIETQR')}
                    activeOpacity={0.88}
                  >
                    <View style={styles.payMethodHeader}>
                      <View style={styles.payMethodRadio}>
                        <Ionicons
                          name={paymentMethod === 'VIETQR' ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={paymentMethod === 'VIETQR' ? '#6F4E37' : '#A89F91'}
                        />
                        <Text style={styles.payMethodTitle}>Chuyển khoản VietQR 24/7 (Napas)</Text>
                      </View>
                      <View style={styles.recBadge}>
                        <Text style={styles.recBadgeText}>Khuyên dùng • 0đ phí</Text>
                      </View>
                    </View>
                    <Text style={styles.payMethodDesc}>
                      Quét mã QR từ mọi ứng dụng ngân hàng (Vietcombank, MB, BIDV, Techcombank...). Đối soát tự động trong 3 giây.
                    </Text>
                  </TouchableOpacity>

                  {/* 2. Credit/Debit Card Option */}
                  <TouchableOpacity
                    style={[styles.payMethodOption, paymentMethod === 'CARD' && styles.payMethodOptionActive]}
                    onPress={() => setPaymentMethod('CARD')}
                    activeOpacity={0.88}
                  >
                    <View style={styles.payMethodHeader}>
                      <View style={styles.payMethodRadio}>
                        <Ionicons
                          name={paymentMethod === 'CARD' ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={paymentMethod === 'CARD' ? '#6F4E37' : '#A89F91'}
                        />
                        <Text style={styles.payMethodTitle}>Thẻ Quốc Tế (Visa / Mastercard / JCB)</Text>
                      </View>
                      <View style={styles.cardIconsRow}>
                        <Text style={styles.cardIconText}>VISA</Text>
                        <Text style={styles.cardIconText}>MC</Text>
                      </View>
                    </View>
                    <Text style={styles.payMethodDesc}>Thanh toán an toàn qua cổng mã hóa PCI-DSS cấp độ 1.</Text>
                  </TouchableOpacity>

                  {/* 3. MoMo Wallet */}
                  <TouchableOpacity
                    style={[styles.payMethodOption, paymentMethod === 'MOMO' && styles.payMethodOptionActive]}
                    onPress={() => setPaymentMethod('MOMO')}
                    activeOpacity={0.88}
                  >
                    <View style={styles.payMethodHeader}>
                      <View style={styles.payMethodRadio}>
                        <Ionicons
                          name={paymentMethod === 'MOMO' ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={paymentMethod === 'MOMO' ? '#6F4E37' : '#A89F91'}
                        />
                        <Text style={styles.payMethodTitle}>Ví Điện Tử MoMo / ZaloPay</Text>
                      </View>
                      <View style={styles.momoBadge}>
                        <Text style={styles.momoBadgeText}>MoMo</Text>
                      </View>
                    </View>
                    <Text style={styles.payMethodDesc}>Xác nhận thanh toán 1 chạm bằng ứng dụng Ví MoMo.</Text>
                  </TouchableOpacity>
                </View>

                {/* Sub-view: DYNAMIC VIETQR 24/7 DETAILS */}
                {paymentMethod === 'VIETQR' && (
                  <View style={styles.vietQrCard}>
                    {/* Timer Countdown Header */}
                    <View style={styles.qrTimerHeader}>
                      <View style={styles.livePulseDot} />
                      <Text style={styles.qrTimerLabel}>Thời gian chờ thanh toán:</Text>
                      <Text style={styles.qrTimerDigits}>{formatTimer(paymentTimer)}</Text>
                    </View>

                    {/* QR Code Presentation Box */}
                    <View style={styles.qrImageBox}>
                      <Image
                        source={{
                          uri: `https://api.vietqr.io/image/970436-1028899888-qR21x5a.jpg?amount=${totalPayableValue}&addInfo=ECOGO%20${contractCode}&accountName=CONG%20TY%20CO%20PHAN%20ECOGO`
                        }}
                        style={styles.qrCodeImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.qrScanHint}>Quét mã QR bằng App Ngân Hàng để tự động điền số tiền</Text>
                    </View>

                    {/* Bank Transfer Details with Copy Buttons */}
                    <View style={styles.bankDetailTable}>
                      <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Ngân hàng:</Text>
                        <Text style={styles.bankValBold}>Vietcombank (Chi nhánh Sài Gòn)</Text>
                      </View>

                      <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Số tài khoản:</Text>
                        <View style={styles.bankValWithCopy}>
                          <Text style={styles.bankValBold}>1028899888</Text>
                          <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={() => handleCopyToClipboard('1028899888', 'Số tài khoản')}
                          >
                            <Ionicons name="copy-outline" size={13} color="#6F4E37" />
                            <Text style={styles.copyBtnText}>Sao chép</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Chủ tài khoản:</Text>
                        <Text style={styles.bankValBold}>CONG TY CO PHAN ECOGO</Text>
                      </View>

                      <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Số tiền:</Text>
                        <View style={styles.bankValWithCopy}>
                          <Text style={[styles.bankValBold, { color: '#6F4E37' }]}>
                            {totalPayableValue.toLocaleString('vi-VN')}đ
                          </Text>
                          <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={() => handleCopyToClipboard(totalPayableValue.toString(), 'Số tiền')}
                          >
                            <Ionicons name="copy-outline" size={13} color="#6F4E37" />
                            <Text style={styles.copyBtnText}>Sao chép</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Nội dung CK:</Text>
                        <View style={styles.bankValWithCopy}>
                          <Text style={[styles.bankValBold, { color: '#B45309' }]}>
                            ECOGO {contractCode}
                          </Text>
                          <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={() => handleCopyToClipboard(`ECOGO ${contractCode}`, 'Nội dung chuyển khoản')}
                          >
                            <Ionicons name="copy-outline" size={13} color="#6F4E37" />
                            <Text style={styles.copyBtnText}>Sao chép</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.bankNoteAlert}>
                      * Lưu ý: Giữ nguyên nội dung chuyển khoản để hệ thống tự động gạch nợ và cấp chìa khóa số trong 3 giây.
                    </Text>
                  </View>
                )}

                {/* Sub-view: CREDIT CARD FORM */}
                {paymentMethod === 'CARD' && (
                  <View style={styles.cardFormBox}>
                    <Text style={styles.cardFormHeader}>Thông tin thẻ thanh toán quốc tế</Text>
                    <View style={styles.cardInputGroup}>
                      <Text style={styles.cardFieldLabel}>SỐ THẺ</Text>
                      <TextInput
                        style={styles.cardInput}
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        placeholder="4242 •••• •••• 8899"
                        placeholderTextColor="#A89F91"
                      />
                    </View>
                    <View style={styles.cardInputGroup}>
                      <Text style={styles.cardFieldLabel}>TÊN CHỦ THẺ</Text>
                      <TextInput
                        style={styles.cardInput}
                        value={cardHolder}
                        onChangeText={setCardHolder}
                        placeholder="NGUYEN MINH TAI"
                        placeholderTextColor="#A89F91"
                        autoCapitalize="characters"
                      />
                    </View>
                    <View style={styles.cardRow2}>
                      <View style={[styles.cardInputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.cardFieldLabel}>NGÀY HẾT HẠN</Text>
                        <TextInput
                          style={styles.cardInput}
                          value={cardExpiry}
                          onChangeText={setCardExpiry}
                          placeholder="MM/YY"
                          placeholderTextColor="#A89F91"
                        />
                      </View>
                      <View style={[styles.cardInputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.cardFieldLabel}>MÃ CVV / CVC</Text>
                        <TextInput
                          style={styles.cardInput}
                          value={cardCvv}
                          onChangeText={setCardCvv}
                          placeholder="•••"
                          placeholderTextColor="#A89F91"
                          secureTextEntry
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Sub-view: MOMO WALLET */}
                {paymentMethod === 'MOMO' && (
                  <View style={styles.momoDirectBox}>
                    <View style={styles.momoLogoBox}>
                      <Ionicons name="wallet-outline" size={32} color="#A50064" />
                    </View>
                    <Text style={styles.momoPromptTitle}>Liên kết & Thanh toán Ví MoMo</Text>
                    <Text style={styles.momoPromptSub}>
                      Ứng dụng sẽ tự động chuyển tiếp tới Ví MoMo của bạn để xác nhận khoản thanh toán{' '}
                      {totalPayableValue.toLocaleString('vi-VN')}đ.
                    </Text>
                  </View>
                )}

                <View style={{ height: 28 }} />
              </ScrollView>

              {/* Bottom Payment Action Bar */}
              <View style={styles.bottomCheckoutBar}>
                <View>
                  <Text style={styles.bottomTotalSub}>Tổng số tiền thanh toán</Text>
                  <Text style={styles.bottomTotalVal}>{totalPayableValue.toLocaleString('vi-VN')}đ</Text>
                </View>

                <TouchableOpacity
                  style={[styles.confirmBookBtn, submitting && { opacity: 0.6 }]}
                  disabled={submitting}
                  onPress={handleConfirmPayment}
                  activeOpacity={0.88}
                >
                  {submitting ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={[styles.confirmBookBtnText, { marginLeft: 8 }]}>Đang đối soát Napas...</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={17} color="#D4AF37" />
                      <Text style={styles.confirmBookBtnText}>
                        {paymentMethod === 'VIETQR' ? 'Tôi Đã Chuyển Khoản →' : 'Xác Nhận Thanh Toán →'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* =========================================================================
              STEP 4: SUCCESS RECEIPT & DIGITAL KEY HANDOVER
             ========================================================================= */}
          {currentStep === 'SUCCESS' && (
            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              <View style={styles.successContainer}>
                {/* Checkmark Icon Banner */}
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-done" size={36} color="#FAF7F2" />
                </View>
                <Text style={styles.successMainTitle}>THANH TOÁN & KÝ HỢP ĐỒNG THÀNH CÔNG!</Text>
                <Text style={styles.successSubDesc}>
                  Hợp đồng điện tử đã có hiệu lực pháp lý và chìa khóa số Digital Key đã sẵn sàng mở khóa phương tiện.
                </Text>

                {/* Receipt Card */}
                <View style={styles.receiptCard}>
                  <View style={styles.receiptHeaderRow}>
                    <Text style={styles.receiptTitle}>BIÊN NHẬN ĐIỆN TỬ ECOGO</Text>
                    <View style={styles.paidStatusBadge}>
                      <Text style={styles.paidStatusText}>ĐÃ THANH TOÁN</Text>
                    </View>
                  </View>

                  <View style={styles.receiptDivider} />

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Mã hợp đồng:</Text>
                    <Text style={styles.receiptValBold}>{contractCode}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Phương tiện:</Text>
                    <Text style={styles.receiptValBold}>
                      {vehicle.name} ({vehicle.plateNumber})
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Thời gian bàn giao:</Text>
                    <Text style={styles.receiptValBold}>Nhận xe tức thì (24/7)</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Điểm nhận xe:</Text>
                    <Text style={styles.receiptValBold}>EcoGo Hub Landmark - Điện Biên Phủ, Bình Thạnh</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Phương thức:</Text>
                    <Text style={styles.receiptValBold}>
                      {paymentMethod === 'VIETQR' ? 'VietQR Napas 24/7' : paymentMethod === 'CARD' ? 'Thẻ Quốc Tế' : 'Ví MoMo'}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptKey}>Khoản cọc giữ:</Text>
                    <Text style={styles.receiptValBold}>
                      {quote?.depositAmount > 0 ? `${quote.depositAmount.toLocaleString('vi-VN')}đ (Hoàn trả sau 24h)` : '0đ (Miễn cọc bảo chứng)'}
                    </Text>
                  </View>

                  <View style={styles.receiptDivider} />

                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptKey, { fontWeight: '700', color: '#2B180D' }]}>Tổng tiền đã thu:</Text>
                    <Text style={[styles.receiptValBold, { color: '#6F4E37', fontSize: 16 }]}>
                      {totalPayableValue.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                </View>

                {/* PDF Download Button */}
                <TouchableOpacity
                  style={styles.downloadPdfBtn}
                  onPress={() => {
                    Alert.alert(
                      'Tải Hợp Đồng PDF Thành Công',
                      `Đã lưu bản sao hợp đồng điện tử có chữ ký số (${contractCode}.pdf) vào thiết bị của bạn.`,
                      [{ text: 'Đóng' }]
                    );
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="download-outline" size={16} color="#6F4E37" />
                  <Text style={styles.downloadPdfText}>Tải Bản Sao Hợp Đồng PDF (Đã Ký Số)</Text>
                </TouchableOpacity>

                {/* Unlock Key Button */}
                <TouchableOpacity
                  style={styles.activateKeyPrimaryBtn}
                  onPress={handleFinalFinish}
                  activeOpacity={0.88}
                >
                  <Ionicons name="key" size={18} color="#D4AF37" />
                  <Text style={styles.activateKeyPrimaryBtnText}>
                    Nhận Chìa Khóa Số & Bắt Đầu Chuyến Đi →
                  </Text>
                </TouchableOpacity>

                <View style={{ height: 28 }} />
              </View>
            </ScrollView>
          )}
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
    maxHeight: '94%',
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10
  },
  copyToastBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: '#2B180D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 12
  },
  copyToastText: {
    color: '#FAF7F2',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3D7',
    backgroundColor: '#FAF7F2'
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2B180D',
    marginLeft: 2
  },
  topTitleCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2B180D'
  },
  topSubtitle: {
    fontSize: 11,
    color: '#8C7A6B',
    marginTop: 2
  },
  switchVehBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBE3D7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14
  },
  switchVehText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37',
    marginLeft: 4
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B180D',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12
  },
  verifiedChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
    marginLeft: 4
  },

  /* Stepper Progress Bar */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5EFEB',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3D7'
  },
  stepItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FAF7F2'
  },
  stepItemActive: {
    backgroundColor: '#6F4E37'
  },
  stepItemDone: {
    backgroundColor: '#EBE3D7'
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C7A6B'
  },
  stepNumberActive: {
    color: '#FAF7F2'
  },
  stepConnector: {
    flex: 1,
    height: 1,
    backgroundColor: '#DCD4C7',
    marginHorizontal: 3
  },

  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 12
  },

  /* Gallery Hero */
  galleryContainer: {
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EBE3D7',
    marginBottom: 12
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14
  },
  coffeeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FAF7F2',
    marginLeft: 4
  },
  plateFloating: {
    backgroundColor: 'rgba(250, 247, 242, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  plateFloatingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D'
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2B180D',
    marginBottom: 8
  },
  sectionSubDesc: {
    fontSize: 11,
    color: '#8C7A6B',
    marginBottom: 10,
    lineHeight: 16
  },
  depositShieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  depositShieldText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6F4E37',
    marginLeft: 3
  },

  /* Vehicle Header & Specs */
  vehHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  vehTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2B180D'
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  ratingBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D',
    marginLeft: 4
  },
  ratingCount: {
    fontSize: 11,
    color: '#8C7A6B',
    marginLeft: 4
  },
  priceHighlightBox: {
    alignItems: 'flex-end',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  priceBig: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6F4E37'
  },
  priceUnitText: {
    fontSize: 10,
    color: '#8C7A6B'
  },
  specsGrid4: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  specBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  specIconBadge: {
    marginBottom: 3
  },
  specBoxVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D'
  },
  specBoxLbl: {
    fontSize: 9,
    color: '#8C7A6B',
    marginTop: 1
  },
  ecoSafeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  ecoSafeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37',
    marginLeft: 6,
    flex: 1
  },
  safeTag: {
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  safeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6F4E37'
  },

  /* Rental Type Toggle */
  rentalTypeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5EFEB',
    borderRadius: 14,
    padding: 3,
    marginBottom: 10
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11
  },
  toggleBtnActive: {
    backgroundColor: '#6F4E37'
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37',
    marginLeft: 5
  },
  toggleBtnTextActive: {
    color: '#FAF7F2'
  },
  durationPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  durationChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    marginHorizontal: 2,
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  durationChipActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B180D'
  },
  durationChipTextActive: {
    color: '#FAF7F2'
  },

  /* Delivery Options */
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  deliveryOption: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  deliveryOptionActive: {
    borderColor: '#6F4E37',
    backgroundColor: '#F5EFEB'
  },
  deliveryRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  deliveryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2B180D',
    marginLeft: 6
  },
  deliverySub: {
    fontSize: 10,
    color: '#8C7A6B',
    marginLeft: 22
  },

  /* Insurance Cards */
  insuranceItem: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  insuranceItemActive: {
    borderColor: '#6F4E37',
    backgroundColor: '#F5EFEB'
  },
  insTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  insTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  insName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D',
    marginLeft: 6
  },
  insBadge: {
    backgroundColor: '#EBE3D7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6
  },
  insBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6F4E37'
  },
  insFeeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6F4E37'
  },
  insDesc: {
    fontSize: 10,
    color: '#8C7A6B',
    marginLeft: 24,
    lineHeight: 14
  },

  /* Deposit Cards */
  depositCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  depositCardActive: {
    borderColor: '#6F4E37',
    backgroundColor: '#F5EFEB',
    borderWidth: 1.5
  },
  depositTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  depositTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  depositTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D',
    marginLeft: 7
  },
  depositBadge: {
    backgroundColor: '#EBE3D7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8
  },
  depositBadgeActive: {
    backgroundColor: '#6F4E37'
  },
  depositBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6F4E37'
  },
  depositBadgeTextActive: {
    color: '#FAF7F2'
  },
  depositDesc: {
    fontSize: 10,
    color: '#8C7A6B',
    marginLeft: 25,
    lineHeight: 14,
    marginBottom: 6
  },
  depositFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 25,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  depositFeeLabel: {
    fontSize: 10,
    color: '#8C7A6B'
  },
  depositFeeVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D'
  },

  /* Voucher Input */
  voucherInputRow: {
    flexDirection: 'column'
  },
  voucherInput: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#2B180D',
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    marginBottom: 8
  },
  quickVoucherRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  quickVoucherPill: {
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  quickVoucherPillActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  quickVoucherText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6F4E37'
  },
  quickVoucherTextActive: {
    color: '#FAF7F2'
  },

  /* Transparent Price Summary Card */
  beigeSummaryCard: {
    backgroundColor: '#F5EFEB',
    borderColor: '#E2D9CC'
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  priceRowLabel: {
    fontSize: 11,
    color: '#5C4A3C'
  },
  priceRowVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B180D'
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#DCD4C7',
    marginVertical: 8
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2B180D'
  },
  totalSubNotice: {
    fontSize: 9,
    color: '#8C7A6B'
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: '#6F4E37'
  },

  /* Bottom Checkout Bar */
  bottomCheckoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  bottomTotalSub: {
    fontSize: 10,
    color: '#8C7A6B'
  },
  bottomTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6F4E37'
  },
  confirmBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E3322',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 16,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  confirmBookBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FAF7F2',
    marginLeft: 6
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  /* =========================================================================
     CONTRACT STYLES (STEP 2)
     ========================================================================= */
  contractDocHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  nationalMotto: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D',
    letterSpacing: 0.5
  },
  nationalSubMotto: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6F4E37',
    marginTop: 2
  },
  mottoDivider: {
    width: 60,
    height: 1.5,
    backgroundColor: '#D4AF37',
    marginVertical: 8
  },
  contractMainTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2B180D',
    textAlign: 'center',
    letterSpacing: 0.3
  },
  contractCodeNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6F4E37',
    marginTop: 4
  },
  contractLawReference: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#8C7A6B',
    marginTop: 2,
    textAlign: 'center'
  },
  contractSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  partyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  partyRoleBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6F4E37',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  verifiedGreenBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  verifiedGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2D8A4E'
  },
  partyName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D',
    marginBottom: 4
  },
  partyDetail: {
    fontSize: 10,
    color: '#5C4A3C',
    lineHeight: 16,
    marginBottom: 2
  },
  contractSubHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D',
    marginBottom: 8,
    letterSpacing: 0.3
  },
  vehSpecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  specKey: {
    fontSize: 10,
    color: '#8C7A6B'
  },
  specValBold: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2B180D'
  },
  clauseItem: {
    fontSize: 10,
    color: '#5C4A3C',
    lineHeight: 16,
    marginBottom: 8
  },
  clauseBold: {
    fontWeight: '800',
    color: '#2B180D'
  },
  signatureHighlightCard: {
    backgroundColor: '#F5EFEB',
    borderColor: '#D4AF37',
    borderWidth: 1.5
  },
  signInstruction: {
    fontSize: 10,
    color: '#8C7A6B',
    marginBottom: 10,
    lineHeight: 15
  },
  signaturePadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#C4B5A5',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  signaturePadBoxSigned: {
    borderColor: '#2D8A4E',
    borderStyle: 'solid',
    backgroundColor: '#F9FDF9'
  },
  unsignedPrompt: {
    alignItems: 'center'
  },
  unsignedPromptText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6F4E37',
    marginTop: 6
  },
  unsignedSubText: {
    fontSize: 10,
    color: '#8C7A6B',
    marginTop: 2
  },
  signedContent: {
    alignItems: 'center'
  },
  cursiveSignature: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E3A8A',
    fontStyle: 'italic',
    letterSpacing: 1
  },
  stampBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B180D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6
  },
  stampText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    marginLeft: 4
  },
  timestampSign: {
    fontSize: 9,
    color: '#8C7A6B',
    marginTop: 4
  },
  contractAgreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  contractAgreeText: {
    fontSize: 10,
    color: '#5C4A3C',
    marginLeft: 8,
    flex: 1,
    lineHeight: 15
  },
  boldText: {
    fontWeight: '800',
    color: '#2B180D'
  },

  /* =========================================================================
     PAYMENT STYLES (STEP 3)
     ========================================================================= */
  payAmountCard: {
    backgroundColor: '#4E3322',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12
  },
  payAmountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8
  },
  payAmountVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FAF7F2',
    marginVertical: 4
  },
  payBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  payBreakdownSub: {
    fontSize: 11,
    color: '#E0D4C5'
  },
  coinsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  coinsCardActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#FDFBF7'
  },
  coinsLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  coinsIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  coinsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D'
  },
  coinsSub: {
    fontSize: 10,
    color: '#8C7A6B',
    marginTop: 1
  },
  payMethodOption: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  payMethodOptionActive: {
    borderColor: '#6F4E37',
    backgroundColor: '#F5EFEB',
    borderWidth: 1.5
  },
  payMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  payMethodRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  payMethodTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D',
    marginLeft: 7
  },
  recBadge: {
    backgroundColor: '#2B180D',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8
  },
  recBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D4AF37'
  },
  cardIconsRow: {
    flexDirection: 'row'
  },
  cardIconText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6F4E37',
    backgroundColor: '#EBE3D7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 3
  },
  momoBadge: {
    backgroundColor: '#A50064',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  momoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  payMethodDesc: {
    fontSize: 10,
    color: '#8C7A6B',
    marginLeft: 25,
    lineHeight: 14
  },

  /* VietQR Presentation Box */
  vietQrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    alignItems: 'center'
  },
  qrTimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 12
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D8A4E',
    marginRight: 6
  },
  qrTimerLabel: {
    fontSize: 11,
    color: '#5C4A3C',
    marginRight: 4
  },
  qrTimerDigits: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B45309'
  },
  qrImageBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
    width: 200
  },
  qrCodeImage: {
    width: 170,
    height: 170,
    borderRadius: 8
  },
  qrScanHint: {
    fontSize: 9,
    color: '#8C7A6B',
    textAlign: 'center',
    marginTop: 6
  },
  bankDetailTable: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3D7'
  },
  bankLabel: {
    fontSize: 10,
    color: '#8C7A6B'
  },
  bankValBold: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D'
  },
  bankValWithCopy: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBE3D7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6
  },
  copyBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6F4E37',
    marginLeft: 2
  },
  bankNoteAlert: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#B45309',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 14
  },

  /* Card Form Box */
  cardFormBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  cardFormHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2B180D',
    marginBottom: 10
  },
  cardInputGroup: {
    marginBottom: 10
  },
  cardFieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8C7A6B',
    marginBottom: 4
  },
  cardInput: {
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#2B180D',
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  cardRow2: {
    flexDirection: 'row'
  },

  /* MoMo Box */
  momoDirectBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  momoLogoBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  momoPromptTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2B180D',
    marginBottom: 6
  },
  momoPromptSub: {
    fontSize: 11,
    color: '#8C7A6B',
    textAlign: 'center',
    lineHeight: 16
  },

  /* =========================================================================
     SUCCESS RECEIPT STYLES (STEP 4)
     ========================================================================= */
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2D8A4E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2D8A4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  successMainTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#2B180D',
    textAlign: 'center',
    letterSpacing: 0.4
  },
  successSubDesc: {
    fontSize: 11,
    color: '#8C7A6B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
    paddingHorizontal: 12
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    marginBottom: 14
  },
  receiptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  receiptTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6F4E37',
    letterSpacing: 0.5
  },
  paidStatusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  paidStatusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2D8A4E'
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#EBE3D7',
    marginVertical: 10
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  receiptKey: {
    fontSize: 11,
    color: '#8C7A6B'
  },
  receiptValBold: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2B180D'
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#F5EFEB',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DCD4C7',
    marginBottom: 10
  },
  downloadPdfText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6F4E37',
    marginLeft: 6
  },
  activateKeyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#4E3322',
    borderRadius: 16,
    paddingVertical: 13,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  activateKeyPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FAF7F2',
    marginLeft: 8
  }
});
