import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import ApiService from '../services/api';

const KEYPAD_KEYS = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
  { num: '+*#', sub: '', isSymbol: true },
  { num: '0', sub: '' },
  { num: 'DEL', sub: '', isDelete: true }
];

export default function OnboardingAuthFlow({ onComplete, theme = THEME_PRESETS.SAGE }) {
  // Steps:
  // 1: Location Permission (Clean Apple White)
  // 2: Welcome & Phone Input (Clean Luxury Mobility)
  // 3: Phone Input Screen with iOS Keypad
  // 4: OTP Channel Bottom Sheet over Phone Input
  // 5: OTP 4-Digit Verification + Notification Banner
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(''); // Empty by default for manual entry
  const [otpChannel, setOtpChannel] = useState('ZALO'); // 'ZALO' | 'WHATSAPP' | 'SMS'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [latestGeneratedOtp, setLatestGeneratedOtp] = useState('');

  // Animated values for Step 0 Logo Splash Screen
  const useNative = Platform.OS !== 'web';
  const splashScale = useRef(new Animated.Value(0.7)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const pathDrawAnim = useRef(new Animated.Value(0)).current;
  const splashGlow = useRef(new Animated.Value(0.3)).current;

  // Animated value for Shake Error & Red Border
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: useNative }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: useNative }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: useNative }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: useNative }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: useNative }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: useNative })
    ]).start();
  };

  // Run Splash animation on Step 0
  useEffect(() => {
    if (step === 0) {
      splashScale.setValue(0.7);
      splashOpacity.setValue(0);
      pathDrawAnim.setValue(0);

      Animated.parallel([
        Animated.spring(splashScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: useNative
        }),
        Animated.timing(splashOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: useNative
        }),
        Animated.timing(pathDrawAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false
        })
      ]).start();

      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(splashGlow, { toValue: 0.9, duration: 900, useNativeDriver: useNative }),
          Animated.timing(splashGlow, { toValue: 0.3, duration: 900, useNativeDriver: useNative })
        ])
      );
      glowLoop.start();

      const autoTimer = setTimeout(() => {
        handleProceedFromSplash();
      }, 2800);

      return () => {
        glowLoop.stop();
        clearTimeout(autoTimer);
      };
    }
  }, [step]);

  const handleProceedFromSplash = () => {
    Animated.parallel([
      Animated.timing(splashScale, { toValue: 1.25, duration: 350, useNativeDriver: useNative }),
      Animated.timing(splashOpacity, { toValue: 0, duration: 350, useNativeDriver: useNative })
    ]).start(() => {
      setStep(1);
    });
  };

  // Countdown timer for OTP on Step 5
  useEffect(() => {
    if (step !== 5) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const handleLocationChoice = (allow) => {
    if (allow && Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 3000 });
    }
    setStep(2);
  };

  const handlePhoneKeyPress = (key) => {
    setErrorMessage('');
    if (key.isDelete) {
      setPhone((prev) => prev.slice(0, -1));
      return;
    }
    if (key.isSymbol) return;
    if (phone.length < 11) {
      setPhone((prev) => prev + key.num);
    }
  };

  const cleanPhoneNumber = (p) => {
    const raw = (p || '').replace(/\D/g, '');
    if (raw.startsWith('84')) return '0' + raw.slice(2);
    return raw;
  };

  const isValidPhone = cleanPhoneNumber(phone).length >= 9;

  // Request real OTP from backend
  const handleSendOtpRequest = async () => {
    const targetPhone = cleanPhoneNumber(phone);
    if (!targetPhone || targetPhone.length < 9) {
      triggerShake();
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (9-10 chữ số)');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await ApiService.requestOtp(targetPhone, otpChannel);
      if (res && res.generatedOtp) {
        setLatestGeneratedOtp(res.generatedOtp);
      }
      setOtpDigits(['', '', '', '']);
      setStep(5);
    } catch (err) {
      triggerShake();
      setErrorMessage(err.message || 'Không thể gửi mã OTP, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Verify entered OTP code
  const handleVerifyOtp = async (codeToVerify) => {
    const targetPhone = cleanPhoneNumber(phone);
    if (!codeToVerify || codeToVerify.length !== 4) return;

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await ApiService.verifyOtp(targetPhone, codeToVerify);
      if (res && res.success) {
        if (onComplete) {
          onComplete(res.user || { fullName: 'Minh Tài', phone: targetPhone });
        }
      } else {
        triggerShake();
        setErrorMessage(res.message || 'Mã OTP không đúng');
        setOtpDigits(['', '', '', '']);
      }
    } catch (err) {
      triggerShake();
      setErrorMessage(err.message || 'Mã OTP không chính xác. Vui lòng kiểm tra lại.');
      setOtpDigits(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpKeyPress = (key) => {
    setErrorMessage('');
    if (key.isDelete) {
      const lastFilledIdx = otpDigits.map((d) => d !== '').lastIndexOf(true);
      if (lastFilledIdx !== -1) {
        const next = [...otpDigits];
        next[lastFilledIdx] = '';
        setOtpDigits(next);
      }
      return;
    }
    if (key.isSymbol) return;

    const emptyIdx = otpDigits.findIndex((d) => d === '');
    if (emptyIdx !== -1) {
      const next = [...otpDigits];
      next[emptyIdx] = key.num;
      setOtpDigits(next);

      // Once 4 digits are completed, automatically submit to server
      if (emptyIdx === 3) {
        const fullCode = next.join('');
        handleVerifyOtp(fullCode);
      }
    }
  };

  const handleAutofillLatestOtp = () => {
    if (latestGeneratedOtp && latestGeneratedOtp.length === 4) {
      const chars = latestGeneratedOtp.split('');
      setOtpDigits(chars);
      handleVerifyOtp(latestGeneratedOtp);
    }
  };

  // ============================================================================
  // STEP 0: ANIMATED VECTOR LOGO SPLASH SCREEN (VIDEO 1 STYLE)
  // ============================================================================
  if (step === 0) {
    return (
      <View style={styles.splashContainer}>
        {/* Ambient Glowing Radial Halo */}
        <Animated.View
          style={[
            styles.splashAmbientHalo,
            {
              opacity: splashGlow,
              transform: [{ scale: splashScale }]
            }
          ]}
        />

        <TouchableOpacity
          style={styles.splashCenterTouchable}
          activeOpacity={1}
          onPress={handleProceedFromSplash}
        >
          <Animated.View
            style={[
              styles.splashCardInner,
              {
                opacity: splashOpacity,
                transform: [{ scale: splashScale }]
              }
            ]}
          >
            {/* Animated Logo Wing / Leaf Emblem */}
            <View style={styles.splashEmblemWrap}>
              <View style={styles.splashOuterGlowRing}>
                <View style={styles.splashInnerShield}>
                  <Ionicons
                    name="navigate"
                    size={44}
                    color="#FFFFFF"
                    style={{ transform: [{ rotate: '15deg' }] }}
                  />
                </View>
              </View>

              {/* Animated Orbiting Ring Arc */}
              <View style={styles.splashOrbitRing} />
            </View>

            {/* Brand Typography */}
            <Text style={styles.splashBrandTitle}>EcoGo Smart</Text>
            <View style={styles.splashBadgePill}>
              <Text style={styles.splashBadgePillText}>DI CHUYỂN XANH THÔNG MINH 24/7</Text>
            </View>

            <Text style={styles.splashSloganText}>
              Thuê xe tự động không chạm · Đổi pin 0đ{'\n'}Hành trình xanh bảo vệ môi trường
            </Text>

            {/* Animated Vector Drawing Path Line */}
            <View style={styles.splashDrawingLineWrap}>
              <Animated.View
                style={[
                  styles.splashDrawingLineFill,
                  {
                    width: pathDrawAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>

            <View style={styles.splashSkipPill}>
              <Text style={styles.splashSkipText}>Chạm để tiếp tục →</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.splashFooterInfo}>
          <Text style={styles.splashFooterVersion}>Phiên bản 1.0.0-PROD · Chuyên đề UTH</Text>
        </View>
      </View>
    );
  }

  // ============================================================================
  // STEP 1: LOCATION PERMISSION DIALOG (CLEAN APPLE WHITE NATIVE)
  // ============================================================================
  if (step === 1) {
    return (
      <View style={styles.step1Container}>
        {/* Top Header with Back Button, Brand and Instant Skip */}
        <View style={styles.step1TopBar}>
          <TouchableOpacity
            style={styles.backTopBtn}
            activeOpacity={0.7}
            onPress={() => setStep(0)}
          >
            <Ionicons name="arrow-back" size={16} color="#1D1D1F" />
            <Text style={styles.backTopText}>Quay lại</Text>
          </TouchableOpacity>

          <View style={[styles.brandSmallPill, { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }]}>
            <View style={[styles.brandDotGreen, { backgroundColor: theme.primary }]} />
            <Text style={[styles.brandSmallText, { color: theme.primary }]}>ECOGO MOBILITY</Text>
          </View>

          {onComplete ? (
            <TouchableOpacity
              style={styles.skipTopBtn}
              activeOpacity={0.7}
              onPress={() => onComplete({ fullName: 'Minh Tài', phone: '0901234567' })}
            >
              <Text style={styles.skipTopText}>Vào app ngay →</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.step1CenterWrap}>
          <View style={styles.locDialogCard}>
            <View style={styles.locHeaderRow}>
              <View style={styles.locAppIconWrap}>
                <View style={[styles.locBlueSquare, { backgroundColor: theme.primary }]}>
                  <Ionicons
                    name="navigate"
                    size={24}
                    color="#FFFFFF"
                    style={{ transform: [{ rotate: '12deg' }] }}
                  />
                </View>
                <View style={styles.locHandBadge}>
                  <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.locHeaderMeta}>
                <Text style={[styles.locDialogAppLabel, { color: theme.primary }]}>ECOGO SMART</Text>
                <Text style={styles.locDialogSystemTime}>Yêu cầu truy cập vị trí</Text>
              </View>
            </View>

            <Text style={styles.locTitle}>
              Cho phép sử dụng vị trí hiện tại của bạn?
            </Text>
            <Text style={styles.locSubtitle}>
              Để hiển thị các điểm thuê xe tự lái và trạm sạc EV gần nhất quanh khu vực của bạn
            </Text>

            {/* Clean Apple White & Light Map Preview (Like Real Apple Maps) */}
            <View style={styles.locMapPreview}>
              {/* Soft Parks & Water Features */}
              <View style={styles.mapParkArea} />
              <View style={styles.mapRiverArea} />

              {/* Realistic Road Grid */}
              <View style={[styles.roadLineH, { top: 26, transform: [{ rotate: '4deg' }] }]} />
              <View style={[styles.roadLineH, { top: 70, transform: [{ rotate: '-3deg' }] }]} />
              <View style={[styles.roadLineH, { top: 110, transform: [{ rotate: '-16deg' }] }]} />
              <View style={[styles.roadLineV, { left: 70, transform: [{ rotate: '8deg' }] }]} />
              <View style={[styles.roadLineV, { left: 160, transform: [{ rotate: '-6deg' }] }]} />
              <View style={[styles.roadLineV, { left: 240, transform: [{ rotate: '14deg' }] }]} />

              <View style={styles.precisePill}>
                <Ionicons name="navigate" size={11} color={theme.primary} />
                <Text style={[styles.precisePillText, { color: theme.primary }]}>Độ chính xác cao: Bật</Text>
              </View>

              <Text style={[styles.streetLabel, { top: 32, left: 14 }]}>CHU VĂN AN</Text>
              <Text style={[styles.streetLabel, { top: 18, left: 86, fontSize: 7 }]}>ĐINH BỘ LĨNH</Text>
              <Text style={[styles.streetLabel, { top: 14, right: 28, transform: [{ rotate: '-18deg' }] }]}>
                ĐIỆN BIÊN PHỦ
              </Text>
              <Text style={[styles.streetLabel, { bottom: 24, left: 20, transform: [{ rotate: '-22deg' }] }]}>
                BẠCH ĐẰNG
              </Text>

              {/* Location Center Marker with Soft Mint Radar Pulse */}
              <View style={styles.mapCenterTarget}>
                <View style={[styles.mapRadarPulse, { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }]} />
                <View style={[styles.blueLocationDot, { backgroundColor: theme.primary }]} />
              </View>

              <View style={styles.landmarkBottomRow}>
                <View style={[styles.landmarkIconCircle, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name="flash" size={8} color={theme.primary} />
                </View>
                <Text style={styles.landmarkText}>Trạm sạc EVN UTH · 0.3 km</Text>
              </View>
            </View>

            {/* Apple Native Clean Action Buttons */}
            <TouchableOpacity
              style={[styles.locPermBtn, styles.locPermBtnPrimary, { backgroundColor: theme.primary }]}
              activeOpacity={0.88}
              onPress={() => handleLocationChoice(true)}
            >
              <Text style={[styles.locPermBtnText, styles.locPermBtnTextPrimary]}>
                Cho phép khi dùng ứng dụng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locPermBtn, styles.locPermBtnSecondary]}
              activeOpacity={0.85}
              onPress={() => handleLocationChoice(true)}
            >
              <Text style={styles.locPermBtnText}>Cho phép một lần</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locPermBtn, styles.locPermBtnCancel]}
              activeOpacity={0.7}
              onPress={() => handleLocationChoice(false)}
            >
              <Text style={[styles.locPermBtnText, styles.locPermBtnTextCancel]}>Để sau / Từ chối</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.step1FooterInfo}>
          <Text style={styles.step1FooterText}>Quyền vị trí giúp tự động tính quãng đường và mở khóa BLE</Text>
        </View>
      </View>
    );
  }

  // ============================================================================
  // STEP 2: WELCOME & PHONE LOGIN SCREEN (CLEAN LUXURY MOBILITY)
  // ============================================================================
  if (step === 2) {
    return (
      <View style={styles.step2Container}>
        {/* Top Header Row with Back Button, Brand & Skip */}
        <View style={styles.step2TopRow}>
          <TouchableOpacity
            style={styles.backTopBtn}
            activeOpacity={0.7}
            onPress={() => setStep(1)}
          >
            <Ionicons name="arrow-back" size={16} color="#1D1D1F" />
            <Text style={styles.backTopText}>Quay lại</Text>
          </TouchableOpacity>

          <View style={[styles.brandSmallPill, { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }]}>
            <View style={[styles.brandDotGreen, { backgroundColor: theme.primary }]} />
            <Text style={[styles.brandSmallText, { color: theme.primary }]}>ECOGO MOBILITY</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {onComplete ? (
              <TouchableOpacity
                style={styles.skipTopBtn}
                activeOpacity={0.7}
                onPress={() => onComplete({ fullName: 'Minh Tài', phone: '0901234567' })}
              >
                <Text style={styles.skipTopText}>Vào app ngay →</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.langPill}>
              <Ionicons name="globe-outline" size={14} color="#1D1D1F" />
              <Text style={styles.langPillText}>VI</Text>
              <Ionicons name="chevron-down" size={12} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Clean Luxury EV Hero Banner (No AI Gimmicks) */}
        <View style={styles.step2HeroCard}>
          <View style={styles.step2IconRow}>
            <View style={[styles.step2CarBadge, { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }]}>
              <Ionicons name="car-sport" size={28} color={theme.primary} />
            </View>
            <View style={styles.step2BadgeDetails}>
              <View style={[styles.step2BadgePill, { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }]}>
                <Text style={[styles.step2BadgePillText, { color: theme.primary }]}>100% XE ĐIỆN & NĂNG LƯỢNG SẠCH</Text>
              </View>
              <Text style={styles.step2BadgeSub}>Không phát thải · Vận hành êm ái</Text>
            </View>
          </View>

          <Text style={styles.step2MainTitle}>
            Di chuyển xanh{'\n'}Thuê xe tự động 24/7
          </Text>
          <Text style={styles.step2SubTitle}>
            Đăng nhập để nhận ưu đãi 20% và mở khóa xe không chạm qua Bluetooth tại TP.HCM
          </Text>

          {/* 3 Luxury Feature Chips */}
          <View style={styles.featureChipsRow}>
            <View style={styles.featureChip}>
              <Ionicons name="key-outline" size={13} color={theme.primary} />
              <Text style={styles.featureChipText}>Khóa số BLE</Text>
            </View>
            <View style={styles.featureChip}>
              <Ionicons name="flash-outline" size={13} color="#0284C7" />
              <Text style={styles.featureChipText}>Trạm sạc 24/7</Text>
            </View>
            <View style={styles.featureChip}>
              <Ionicons name="shield-checkmark-outline" size={13} color="#D97706" />
              <Text style={styles.featureChipText}>0đ Đặt cọc</Text>
            </View>
          </View>
        </View>

        {/* Input & Form Area */}
        <View style={styles.step2FormArea}>
          <TouchableOpacity
            style={styles.phoneInputOuter}
            activeOpacity={0.9}
            onPress={() => setStep(3)}
          >
            <View style={styles.countryCodePill}>
              <View style={styles.vnFlagBox}>
                <Text style={styles.vnStar}>★</Text>
              </View>
              <Text style={styles.countryCodeText}>+84</Text>
              <Ionicons name="chevron-down" size={12} color="#1D1D1F" />
            </View>

            <Text style={[styles.phonePlaceholderText, phone ? { color: '#1D1D1F', fontWeight: '700' } : {}]}>
              {phone ? phone : 'Nhập số điện thoại của bạn'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueBtn, styles.continueBtnPrimary, { backgroundColor: theme.primary }]}
            activeOpacity={0.88}
            onPress={() => setStep(3)}
          >
            <Text style={styles.continueBtnTextWhite}>
              Tiếp tục
            </Text>
          </TouchableOpacity>

          <View style={styles.orDividerRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Hoặc tiếp tục với</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialBtnsRow}>
            <TouchableOpacity
              style={styles.appleBtn}
              activeOpacity={0.85}
              onPress={() => setStep(3)}
            >
              <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.85}
              onPress={() => setStep(3)}
            >
              <Text style={styles.googleLogoG}>G</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsFooterText}>
            Bằng việc tiếp tục, tôi đồng ý với{' '}
            <Text style={[styles.termsLinkGreen, { color: theme.primary }]}>Điều khoản & Chính sách</Text> của{'\n'}EcoGo Smart Mobility
          </Text>
        </View>
      </View>
    );
  }

  // ============================================================================
  // STEP 3 & STEP 4: PHONE NUMBER INPUT + OTP CHANNEL BOTTOM SHEET (IMAGES 3 & 4)
  // ============================================================================
  if (step === 3 || step === 4) {
    return (
      <View style={styles.step3Container}>
        <View style={styles.step3TopContent}>
          <TouchableOpacity style={styles.backArrowBtn} onPress={() => setStep(2)}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>

          <Text style={styles.step3Title}>Xác nhận số điện thoại của bạn</Text>
          <Text style={styles.step3Sub}>
            Kiểm tra số điện thoại liên kết với tài khoản mạng xã hội của bạn.
          </Text>

          {/* User inputs their own real phone number */}
          <Animated.View
            style={[
              styles.phoneInputFocused,
              errorMessage ? { borderColor: '#EF4444' } : null,
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            <View style={styles.countryCodePill}>
              <View style={styles.vnFlagBox}>
                <Text style={styles.vnStar}>★</Text>
              </View>
              <Text style={styles.countryCodeText}>+84</Text>
              <Ionicons name="caret-down" size={12} color="#1E293B" />
            </View>

            <TextInput
              style={styles.phoneInputText}
              value={phone}
              onChangeText={(txt) => {
                setErrorMessage('');
                setPhone(txt);
              }}
              placeholder="Nhập số điện thoại của bạn"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              autoFocus
            />

            {phone.length > 0 && (
              <TouchableOpacity onPress={() => setPhone('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </Animated.View>

          {errorMessage ? (
            <Text style={styles.errorTextInline}>{errorMessage}</Text>
          ) : null}
        </View>

        <View style={styles.step3BottomDock}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              { marginHorizontal: 18, marginBottom: 14 },
              isValidPhone && { backgroundColor: theme.primary }
            ]}
            disabled={loading}
            activeOpacity={0.85}
            onPress={() => {
              if (!isValidPhone) {
                triggerShake();
                setErrorMessage('Vui lòng nhập đủ số điện thoại của bạn');
                return;
              }
              setStep(4);
            }}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={[styles.continueBtnText, styles.continueBtnTextWhite]}>Đang xử lý...</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.continueBtnText,
                  isValidPhone && styles.continueBtnTextWhite
                ]}
              >
                Tiếp tục
              </Text>
            )}
          </TouchableOpacity>

          {/* iOS Gray Numeric Keypad */}
          <View style={styles.iosKeypadContainer}>
            <View style={styles.iosKeypadGrid}>
              {KEYPAD_KEYS.map((k, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.iosKeyBtn,
                    (k.isSymbol || k.isDelete) && styles.iosKeyBtnTransparent
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handlePhoneKeyPress(k)}
                >
                  {k.isDelete ? (
                    <Ionicons name="backspace-outline" size={22} color="#1E293B" />
                  ) : (
                    <>
                      <Text style={styles.iosKeyNum}>{k.num}</Text>
                      {k.sub ? <Text style={styles.iosKeySub}>{k.sub}</Text> : null}
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* STEP 4 OVERLAY: CHOOSE OTP APP BOTTOM SHEET (IMAGE 4) */}
        {step === 4 && (
          <View style={styles.step4OverlayBackdrop}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setStep(3)}
            />
            <View style={styles.otpChannelSheet}>
              <View style={styles.sheetDragHandle} />

              <View style={styles.otpSheetHeaderRow}>
                <Text style={styles.otpSheetTitle}>Chọn ứng dụng để nhận mã OTP</Text>
                <TouchableOpacity onPress={() => setStep(3)}>
                  <Ionicons name="close" size={22} color="#1E293B" />
                </TouchableOpacity>
              </View>

              {/* Option 1: Zalo */}
              <TouchableOpacity
                style={styles.channelOptionRow}
                onPress={() => setOtpChannel('ZALO')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    otpChannel === 'ZALO' && styles.radioOuterSelected
                  ]}
                >
                  {otpChannel === 'ZALO' && <View style={styles.radioInnerDot} />}
                </View>
                <Text style={styles.channelNameText}>Zalo</Text>
                <View style={styles.zaloBadgeIcon}>
                  <Text style={styles.zaloBadgeText}>Zalo</Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: WhatsApp */}
              <TouchableOpacity
                style={styles.channelOptionRow}
                onPress={() => setOtpChannel('WHATSAPP')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    otpChannel === 'WHATSAPP' && styles.radioOuterSelected
                  ]}
                >
                  {otpChannel === 'WHATSAPP' && <View style={styles.radioInnerDot} />}
                </View>
                <Text style={styles.channelNameText}>WhatsApp</Text>
                <View style={styles.whatsappBadgeIcon}>
                  <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              {/* Option 3: Tin nhắn điện thoại */}
              <TouchableOpacity
                style={styles.channelOptionRow}
                onPress={() => setOtpChannel('SMS')}
              >
                <View
                  style={[
                    styles.radioOuter,
                    otpChannel === 'SMS' && styles.radioOuterSelected
                  ]}
                >
                  {otpChannel === 'SMS' && <View style={styles.radioInnerDot} />}
                </View>
                <Text style={styles.channelNameText}>Tin nhắn điện thoại</Text>
                <View style={styles.smsBadgeIcon}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#64748B" />
                </View>
              </TouchableOpacity>

              {/* Send OTP Coffee CTA */}
              <TouchableOpacity
                style={[styles.sendOtpTurquoiseBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                disabled={loading}
                activeOpacity={0.85}
                onPress={handleSendOtpRequest}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.sendOtpTurquoiseText}>Gửi mã OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // ============================================================================
  // STEP 5: OTP 4-DIGIT SCREEN + NOTIFICATION BANNER (IMAGE 5)
  // ============================================================================
  const displayPhone = phone.startsWith('0') ? phone : `0${phone}`;

  return (
    <View style={styles.step5Container}>
      {/* Top Header with Back Button */}
      <View style={styles.step3HeaderRow}>
        <TouchableOpacity style={styles.backArrowBtn} onPress={() => setStep(3)}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.step3HeaderTitle}>Xác minh OTP</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Top Notification Banner showing the newly generated OTP */}
      {latestGeneratedOtp ? (
        <TouchableOpacity
          style={styles.iosPushBanner}
          activeOpacity={0.9}
          onPress={handleAutofillLatestOtp}
        >
          <View style={styles.pushIconWrap}>
            <View style={styles.pushCyanCircle}>
              <Text style={styles.pushCyanLogoText}>ECOGO</Text>
            </View>
            <View style={styles.pushZaloMini}>
              <Text style={styles.pushZaloMiniText}>{otpChannel === 'ZALO' ? 'Zalo' : 'SMS'}</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.pushTopLine}>
              <Text style={styles.pushAppName}>EcoGo Smart</Text>
              <Text style={styles.pushTimeNow}>vừa xong</Text>
            </View>
            <Text style={styles.pushBodyText}>Mã xác minh của bạn là</Text>
            <Text style={styles.pushOtpCode}>{latestGeneratedOtp}</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Center Illustration & 4 OTP Input Boxes */}
      <View style={styles.step5BodyCenter}>
        <View style={styles.phoneFrameIllustration}>
          <View style={styles.phoneSpeakerBar} />
          <View style={[styles.cyanChatBubble, { backgroundColor: theme.primary }]}>
            <Text style={styles.cyanChatDots}>• • •</Text>
          </View>
        </View>

        <Text style={styles.otpInstructionText}>
          Nhập mã gồm 4 chữ số mà bạn đã nhận được qua {otpChannel === 'ZALO' ? 'Zalo' : otpChannel === 'WHATSAPP' ? 'WhatsApp' : 'tin nhắn SMS'}
        </Text>

        <View style={styles.otpPhoneRow}>
          <Text style={styles.otpPhoneBold}>(+84) {displayPhone} </Text>
          <TouchableOpacity onPress={() => setStep(3)}>
            <Text style={styles.changePhoneLink}>Đổi số điện thoại</Text>
          </TouchableOpacity>
        </View>

        {/* 4 OTP Digit Boxes */}
        <Animated.View
          style={[
            styles.otpBoxesRow,
            { transform: [{ translateX: shakeAnim }] }
          ]}
        >
          {[0, 1, 2, 3].map((i) => {
            const val = otpDigits[i];
            const isFocused =
              i === otpDigits.findIndex((d) => d === '') ||
              (i === 0 && otpDigits.every((d) => d === ''));
            return (
              <View
                key={i}
                style={[
                  styles.otpDigitBox,
                  isFocused && { borderColor: theme.primary, borderWidth: 2 },
                  errorMessage ? { borderColor: '#EF4444' } : null
                ]}
              >
                <Text style={styles.otpDigitText}>{val}</Text>
              </View>
            );
          })}
        </Animated.View>

        {errorMessage ? (
          <Text style={styles.errorTextCentered}>{errorMessage}</Text>
        ) : null}

        {/* Resend Countdown */}
        <TouchableOpacity
          style={styles.resendRow}
          disabled={countdown > 0 || loading}
          onPress={handleSendOtpRequest}
        >
          <Ionicons name="refresh" size={14} color={countdown === 0 ? theme.primary : '#94A3B8'} />
          <Text style={[styles.resendText, countdown === 0 && { color: theme.primary, fontWeight: '700' }]}>
            {countdown > 0 ? `Gửi lại mã ${countdown}s` : 'Gửi lại mã ngay'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom iOS Keypad with Quick Suggestion Pill */}
      <View style={styles.iosKeypadContainer}>
        {latestGeneratedOtp ? (
          <TouchableOpacity
            style={styles.zaloAutofillBar}
            activeOpacity={0.8}
            onPress={handleAutofillLatestOtp}
          >
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={styles.fromZaloLabel}>Từ {otpChannel === 'ZALO' ? 'Zalo' : 'Tin nhắn'}</Text>
              <Text style={[styles.fromZaloCode, { color: theme.primary }]}>{latestGeneratedOtp}</Text>
            </View>
            <View style={styles.autofillKeyRight}>
              <Ionicons name="key" size={18} color="#334155" />
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={styles.iosKeypadGrid}>
          {KEYPAD_KEYS.map((k, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.iosKeyBtn,
                (k.isSymbol || k.isDelete) && styles.iosKeyBtnTransparent
              ]}
              activeOpacity={0.7}
              onPress={() => handleOtpKeyPress(k)}
            >
              {k.isDelete ? (
                <Ionicons name="backspace-outline" size={22} color="#1E293B" />
              ) : (
                <>
                  <Text style={styles.iosKeyNum}>{k.num}</Text>
                  {k.sub ? <Text style={styles.iosKeySub}>{k.sub}</Text> : null}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ============================================================
     STEP 0: ANIMATED VECTOR LOGO SPLASH SCREEN (VIDEO 1 STYLE)
     ============================================================ */
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  splashAmbientHalo: {
    position: 'absolute',
    top: '25%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(12, 166, 120, 0.08)',
    shadowColor: '#0CA678',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 50
  },
  splashCenterTouchable: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  splashCardInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320
  },
  splashEmblemWrap: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20
  },
  splashOuterGlowRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EBFBF5',
    borderWidth: 2,
    borderColor: '#A3EAD2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0CA678',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16
  },
  splashInnerShield: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#0CA678',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0CA678'
  },
  splashOrbitRing: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1FAE5'
  },
  splashBrandTitle: {
    fontFamily: FONTS.family,
    fontSize: 34,
    fontWeight: '900',
    color: '#1D1D1F',
    letterSpacing: -0.5,
    marginBottom: 4
  },
  splashBadgePill: {
    backgroundColor: '#EBFBF5',
    borderWidth: 1,
    borderColor: '#A3EAD2',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12
  },
  splashBadgePillText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#0CA678',
    letterSpacing: 1.2
  },
  splashSloganText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20
  },
  splashDrawingLineWrap: {
    width: 180,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24
  },
  splashDrawingLineFill: {
    height: '100%',
    backgroundColor: '#0CA678',
    borderRadius: 2
  },
  splashSkipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7
  },
  splashSkipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  splashFooterInfo: {
    paddingBottom: 24
  },
  splashFooterVersion: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500'
  },

  /* STEP 1 */
  step1Container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  step1TopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6
  },
  brandSmallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBFBF5',
    borderWidth: 1,
    borderColor: '#A3EAD2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 6
  },
  brandDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0CA678'
  },
  brandSmallText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#0CA678',
    letterSpacing: 0.8
  },
  backTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EAE2D5'
  },
  backTopText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  skipTopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  skipTopText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  step1CenterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  locDialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6
  },
  locHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14
  },
  locAppIconWrap: {
    width: 46,
    height: 46,
    position: 'relative'
  },
  locBlueSquare: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#0CA678',
    alignItems: 'center',
    justifyContent: 'center'
  },
  locHandBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#1D1D1F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  locHeaderMeta: {
    flex: 1
  },
  locDialogAppLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#0CA678',
    letterSpacing: 0.5
  },
  locDialogSystemTime: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
    marginTop: 1
  },
  locTitle: {
    fontFamily: FONTS.family,
    fontSize: 19,
    fontWeight: '800',
    color: '#1D1D1F',
    lineHeight: 25
  },
  locSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 18
  },

  /* Clean Apple White & Light Map Preview */
  locMapPreview: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 14,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative'
  },
  mapParkArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 80,
    backgroundColor: '#EBFBF5',
    borderBottomLeftRadius: 40
  },
  mapRiverArea: {
    position: 'absolute',
    bottom: -15,
    left: 42,
    width: 16,
    height: 170,
    backgroundColor: '#E0F2FE',
    transform: [{ rotate: '36deg' }]
  },
  roadLineH: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB'
  },
  roadLineV: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 7,
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB'
  },
  precisePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 4,
    zIndex: 5
  },
  precisePillText: {
    fontFamily: FONTS.family,
    color: '#0CA678',
    fontSize: 10,
    fontWeight: '700'
  },
  streetLabel: {
    position: 'absolute',
    color: '#475569',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  mapCenterTarget: {
    position: 'absolute',
    top: '42%',
    left: '42%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38
  },
  mapRadarPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(12, 166, 120, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(12, 166, 120, 0.35)'
  },
  blueLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0CA678',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#0CA678',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4
  },
  landmarkBottomRow: {
    position: 'absolute',
    bottom: 8,
    left: '20%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4
  },
  landmarkIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EBFBF5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  landmarkText: {
    color: '#1D1D1F',
    fontSize: 8,
    fontWeight: '700'
  },
  locPermBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  locPermBtnPrimary: {
    backgroundColor: '#0CA678'
  },
  locPermBtnSecondary: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  locPermBtnCancel: {
    backgroundColor: 'transparent'
  },
  locPermBtnText: {
    fontFamily: FONTS.family,
    color: '#1D1D1F',
    fontSize: 14,
    fontWeight: '600'
  },
  locPermBtnTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  locPermBtnTextCancel: {
    color: '#8E8E93',
    fontWeight: '500'
  },
  step1FooterInfo: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 6
  },
  step1FooterText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center'
  },

  /* STEP 2 */
  step2Container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  step2TopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6
  },
  step2HeroCard: {
    paddingHorizontal: 20,
    marginTop: 10
  },
  step2IconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  step2CarBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EBFBF5',
    borderWidth: 1.5,
    borderColor: '#A3EAD2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  step2BadgeDetails: {
    flex: 1
  },
  step2BadgePill: {
    backgroundColor: '#EBFBF5',
    borderWidth: 1,
    borderColor: '#A3EAD2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4
  },
  step2BadgePillText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '800',
    color: '#0CA678',
    letterSpacing: 0.6
  },
  step2BadgeSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B'
  },
  step2MainTitle: {
    fontFamily: FONTS.family,
    fontSize: 26,
    fontWeight: '800',
    color: '#1D1D1F',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 8
  },
  step2SubTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 18
  },
  featureChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 5
  },
  featureChipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  step2FormArea: {
    paddingHorizontal: 20,
    paddingBottom: 22
  },
  phoneInputOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 6,
    marginBottom: 14,
    backgroundColor: '#FFFFFF'
  },
  countryCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    marginRight: 10
  },
  vnFlagBox: {
    width: 20,
    height: 14,
    backgroundColor: '#DA251D',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  vnStar: {
    color: '#FFFF00',
    fontSize: 9,
    lineHeight: 10
  },
  countryCodeText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B'
  },
  phonePlaceholderText: {
    fontFamily: FONTS.family,
    fontSize: 15,
    color: '#94A3B8'
  },
  continueBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  continueBtnPrimary: {
    backgroundColor: '#0CA678'
  },
  continueBtnTurquoise: {
    backgroundColor: '#0CA678'
  },
  continueBtnText: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8'
  },
  continueBtnTextWhite: {
    color: '#FFFFFF',
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700'
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9'
  },
  orText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#64748B'
  },
  socialBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18
  },
  appleBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  googleLogoG: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '800',
    color: '#EA4335'
  },
  termsFooterText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16
  },
  termsLinkCyan: {
    color: '#0CA678',
    fontWeight: '600'
  },
  termsLinkGreen: {
    color: '#0CA678',
    fontWeight: '700'
  },

  /* STEP 3 & 4 */
  step3Container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    position: 'relative'
  },
  step3TopContent: {
    paddingHorizontal: 18,
    paddingTop: 10
  },
  backArrowBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: 8
  },
  step3Title: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A'
  },
  step3Sub: {
    fontFamily: FONTS.family,
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20
  },
  phoneInputFocused: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#475569',
    borderRadius: 14,
    padding: 6,
    backgroundColor: '#FFFFFF'
  },
  phoneInputText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    outlineStyle: 'none'
  },
  errorTextInline: {
    fontFamily: FONTS.family,
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8
  },
  errorTextCentered: {
    fontFamily: FONTS.family,
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center'
  },
  step3BottomDock: {
    width: '100%'
  },
  iosKeypadContainer: {
    backgroundColor: '#D1D5DB',
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 6,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18
  },
  iosKeypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 7
  },
  iosKeyBtn: {
    width: '31.8%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1
  },
  iosKeyBtnTransparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0
  },
  iosKeyNum: {
    fontFamily: FONTS.family,
    fontSize: 21,
    fontWeight: '500',
    color: '#0F172A',
    lineHeight: 24
  },
  iosKeySub: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1
  },

  /* Step 4 OTP Channel Sheet */
  step4OverlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    zIndex: 40
  },
  otpChannelSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24
  },
  sheetDragHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 14
  },
  otpSheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  otpSheetTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  channelOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  radioOuterSelected: {
    borderColor: '#0CA678',
    backgroundColor: '#0CA678'
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF'
  },
  channelNameText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  zaloBadgeIcon: {
    backgroundColor: '#0068FF',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8
  },
  zaloBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  whatsappBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center'
  },
  smsBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendOtpTurquoiseBtn: {
    backgroundColor: '#0CA678',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14
  },
  sendOtpTurquoiseText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },

  /* STEP 5 */
  step5Container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between'
  },
  iosPushBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1F',
    marginHorizontal: 10,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8
  },
  pushIconWrap: {
    width: 42,
    height: 42,
    position: 'relative'
  },
  pushCyanCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0CA678',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pushCyanLogoText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '900'
  },
  pushZaloMini: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0068FF',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF'
  },
  pushZaloMiniText: {
    color: '#FFFFFF',
    fontSize: 6,
    fontWeight: '800'
  },
  pushTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pushAppName: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  pushTimeNow: {
    fontFamily: FONTS.family,
    color: '#94A3B8',
    fontSize: 12
  },
  pushBodyText: {
    fontFamily: FONTS.family,
    color: '#F1F5F9',
    fontSize: 13,
    marginTop: 1
  },
  pushOtpCode: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1
  },
  step5BodyCenter: {
    alignItems: 'center',
    paddingHorizontal: 22
  },
  phoneFrameIllustration: {
    width: 155,
    height: 95,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 16,
    position: 'relative'
  },
  phoneSpeakerBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0'
  },
  cyanChatBubble: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#0CA678',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  cyanChatDots: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900'
  },
  otpInstructionText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center'
  },
  otpPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20
  },
  otpPhoneBold: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  changePhoneLink: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: '#0CA678'
  },
  otpBoxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14
  },
  otpDigitBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  otpDigitBoxFocused: {
    borderColor: '#0CA678',
    backgroundColor: '#FFFFFF'
  },
  otpDigitText: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A'
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  resendText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#94A3B8'
  },
  zaloAutofillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1D5DB',
    paddingBottom: 8,
    paddingHorizontal: 14
  },
  fromZaloLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#334155',
    fontWeight: '500'
  },
  fromZaloCode: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  autofillKeyRight: {
    borderLeftWidth: 1,
    borderLeftColor: '#9CA3AF',
    paddingLeft: 12,
    paddingVertical: 4
  }
});
