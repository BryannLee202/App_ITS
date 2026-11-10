import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';
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

export default function OnboardingAuthFlow({ onComplete }) {
  // Steps:
  // 1: Location Permission (Ảnh 1)
  // 2: Welcome Orbit Screen (Ảnh 2)
  // 3: Phone Input Screen with iOS Keypad (Ảnh 3)
  // 4: OTP Channel Bottom Sheet over Phone Input (Ảnh 4)
  // 5: OTP 4-Digit Verification + Notification Banner (Ảnh 5)
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(''); // Empty by default for manual entry
  const [otpChannel, setOtpChannel] = useState('ZALO'); // 'ZALO' | 'WHATSAPP' | 'SMS'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [latestGeneratedOtp, setLatestGeneratedOtp] = useState('');

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
        setErrorMessage(res.message || 'Mã OTP không đúng');
        setOtpDigits(['', '', '', '']);
      }
    } catch (err) {
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

  // Top step switcher for convenience
  const renderStepProgressStrip = (darkTheme = false) => (
    <View style={[styles.stepProgressStrip, darkTheme && styles.stepProgressStripDark]}>
      <View style={styles.stepDotsRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => {
              setErrorMessage('');
              setStep(s);
            }}
            style={[
              styles.stepMiniPill,
              step === s && styles.stepMiniPillActive,
              darkTheme && step !== s && { backgroundColor: 'rgba(255,255,255,0.22)' }
            ]}
          >
            <Text
              style={[
                styles.stepMiniText,
                step === s && styles.stepMiniTextActive,
                darkTheme && step !== s && { color: '#E2E8F0' }
              ]}
            >
              Bước {s}/5
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ============================================================================
  // STEP 1: LOCATION PERMISSION DIALOG (IMAGE 1)
  // ============================================================================
  if (step === 1) {
    return (
      <View style={styles.step1Container}>
        {renderStepProgressStrip(true)}

        <View style={styles.step1CenterWrap}>
          <View style={styles.locDialogCard}>
            <View style={styles.locAppIconWrap}>
              <View style={styles.locBlueSquare}>
                <Ionicons
                  name="navigate"
                  size={28}
                  color="#FFFFFF"
                  style={{ transform: [{ rotate: '10deg' }] }}
                />
              </View>
              <View style={styles.locHandBadge}>
                <Ionicons name="hand-left" size={12} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.locTitle}>
              Cho phép “Green SM” sử dụng{'\n'}vị trí của bạn?
            </Text>
            <Text style={styles.locSubtitle}>
              It'll help us ensure your ride safety{'\n'}and drivers can find you faster
            </Text>

            {/* Dark Map Vector Preview */}
            <View style={styles.locMapPreview}>
              <View style={[styles.roadLineH, { top: 28, transform: [{ rotate: '6deg' }] }]} />
              <View style={[styles.roadLineH, { top: 68, transform: [{ rotate: '-4deg' }] }]} />
              <View style={[styles.roadLineH, { top: 108, transform: [{ rotate: '-28deg' }] }]} />
              <View style={[styles.roadLineV, { left: 75, transform: [{ rotate: '12deg' }] }]} />
              <View style={[styles.roadLineV, { left: 155, transform: [{ rotate: '-8deg' }] }]} />
              <View style={[styles.roadLineV, { left: 225, transform: [{ rotate: '18deg' }] }]} />

              <View style={styles.precisePill}>
                <Ionicons name="navigate" size={11} color="#38BDF8" />
                <Text style={styles.precisePillText}>Chính xác: Bật</Text>
              </View>

              <Text style={[styles.streetLabel, { top: 32, left: 18 }]}>NGUYỄN DUY TRINH</Text>
              <Text style={[styles.streetLabel, { top: 22, left: 82, fontSize: 7 }]}>ĐƯỜNG SỐ 46</Text>
              <Text style={[styles.streetLabel, { top: 14, right: 32, transform: [{ rotate: '-24deg' }] }]}>
                NGUYỄN DUY TRINH
              </Text>
              <Text style={[styles.streetLabel, { bottom: 26, left: 22, transform: [{ rotate: '-32deg' }] }]}>
                ĐƯỜNG SỐ 42
              </Text>

              <View style={styles.mapCenterTarget}>
                <Text style={styles.paradiseLabel}>PARADISE{'\n'}LUXURY</Text>
                <View style={styles.blueLocationDot} />
              </View>

              <View style={styles.landmarkBottomRow}>
                <View style={styles.landmarkIconCircle}>
                  <Ionicons name="business" size={8} color="#1E293B" />
                </View>
                <Text style={styles.landmarkText}>Đất Thánh Mỹ Hòa</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.locPermBtn}
              activeOpacity={0.85}
              onPress={() => handleLocationChoice(true)}
            >
              <Text style={styles.locPermBtnText}>Cho phép một lần</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locPermBtn}
              activeOpacity={0.85}
              onPress={() => handleLocationChoice(true)}
            >
              <Text style={styles.locPermBtnText}>Cho phép khi dùng ứng dụng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locPermBtn}
              activeOpacity={0.85}
              onPress={() => handleLocationChoice(false)}
            >
              <Text style={styles.locPermBtnText}>Từ chối</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.step1BottomDecor}>
            <View style={styles.decorBarWhite} />
            <View style={styles.decorBarGold} />
          </View>
        </View>
      </View>
    );
  }

  // ============================================================================
  // STEP 2: WELCOME ORBIT SCREEN (IMAGE 2)
  // ============================================================================
  if (step === 2) {
    return (
      <View style={styles.step2Container}>
        {renderStepProgressStrip(false)}

        <View style={styles.step2TopRow}>
          <TouchableOpacity style={styles.langPill}>
            <Ionicons name="earth-outline" size={16} color="#1E293B" />
            <Text style={styles.langPillText}>Việt Nam | VI</Text>
            <Ionicons name="chevron-down" size={14} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <View style={styles.orbitStage}>
          <View style={styles.orbitCircleOuter} />
          <View style={styles.orbitCircleInner} />

          <View style={[styles.orbitBadge, { top: 18, left: '41%' }]}>
            <View style={styles.car3DPill}>
              <Ionicons name="car-sport" size={28} color="#00B5AD" />
            </View>
          </View>

          <View style={[styles.orbitBadge, { top: 44, left: 26 }]}>
            <View style={styles.scooter3DPill}>
              <Ionicons name="bicycle" size={22} color="#0891B2" />
            </View>
          </View>

          <View style={[styles.orbitBadge, { top: 112, right: 24 }]}>
            <View style={styles.food3DPill}>
              <Text style={{ fontSize: 28 }}>🍔🥤</Text>
            </View>
          </View>

          <View style={[styles.orbitBadge, { bottom: 38, right: 98 }]}>
            <View style={styles.calendar3DPill}>
              <Text style={{ fontSize: 22 }}>🕒📅</Text>
            </View>
          </View>

          <View style={[styles.orbitBadge, { bottom: 26, left: 48 }]}>
            <View style={styles.gift3DPill}>
              <Text style={{ fontSize: 22 }}>🎁</Text>
            </View>
          </View>

          <View style={styles.heroTextBlock}>
            <Text style={styles.heroCyanTitle}>
              Green SM Mọi{'\n'}thứ trong tầm tay
            </Text>
            <Text style={styles.heroSubtitle}>
              Đăng ký hoặc đăng nhập để bắt đầu{'\n'}hành trình xanh của bạn
            </Text>
          </View>
        </View>

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
              <Ionicons name="caret-down" size={12} color="#1E293B" />
            </View>

            <Text style={[styles.phonePlaceholderText, phone ? { color: '#0F172A', fontWeight: '700' } : {}]}>
              {phone ? phone : 'Số điện thoại'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueBtn,
              styles.continueBtnTurquoise
            ]}
            activeOpacity={0.85}
            onPress={() => setStep(3)}
          >
            <Text style={[styles.continueBtnText, styles.continueBtnTextWhite]}>
              Tiếp tục
            </Text>
          </TouchableOpacity>

          <View style={styles.orDividerRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialBtnsRow}>
            <TouchableOpacity
              style={styles.appleBtn}
              activeOpacity={0.85}
              onPress={() => setStep(3)}
            >
              <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
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
            Bằng việc "Tiếp tục", tôi đồng ý với{' '}
            <Text style={styles.termsLinkCyan}>Điều khoản và Điều kiện</Text> của{'\n'}Green SM
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
        {renderStepProgressStrip(false)}

        <View style={styles.step3TopContent}>
          <TouchableOpacity style={styles.backArrowBtn} onPress={() => setStep(2)}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>

          <Text style={styles.step3Title}>Xác nhận số điện thoại của bạn</Text>
          <Text style={styles.step3Sub}>
            Kiểm tra số điện thoại liên kết với tài khoản mạng xã hội của bạn.
          </Text>

          {/* User inputs their own real phone number */}
          <View style={styles.phoneInputFocused}>
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
          </View>

          {errorMessage ? (
            <Text style={styles.errorTextInline}>{errorMessage}</Text>
          ) : null}
        </View>

        <View style={styles.step3BottomDock}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              { marginHorizontal: 18, marginBottom: 14 },
              isValidPhone && styles.continueBtnTurquoise
            ]}
            disabled={!isValidPhone || loading}
            activeOpacity={0.85}
            onPress={() => setStep(4)}
          >
            <Text
              style={[
                styles.continueBtnText,
                isValidPhone && styles.continueBtnTextWhite
              ]}
            >
              Tiếp tục
            </Text>
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

              {/* Send OTP Turquoise CTA */}
              <TouchableOpacity
                style={[styles.sendOtpTurquoiseBtn, loading && { opacity: 0.7 }]}
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
      {renderStepProgressStrip(false)}

      {/* Top Notification Banner showing the newly generated OTP */}
      {latestGeneratedOtp ? (
        <TouchableOpacity
          style={styles.iosPushBanner}
          activeOpacity={0.9}
          onPress={handleAutofillLatestOtp}
        >
          <View style={styles.pushIconWrap}>
            <View style={styles.pushCyanCircle}>
              <Text style={styles.pushCyanLogoText}>GREEN SM</Text>
            </View>
            <View style={styles.pushZaloMini}>
              <Text style={styles.pushZaloMiniText}>{otpChannel === 'ZALO' ? 'Zalo' : 'SMS'}</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.pushTopLine}>
              <Text style={styles.pushAppName}>Green SM</Text>
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
          <View style={styles.cyanChatBubble}>
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
        <View style={styles.otpBoxesRow}>
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
                  isFocused && styles.otpDigitBoxFocused,
                  errorMessage && { borderColor: '#EF4444' }
                ]}
              >
                <Text style={styles.otpDigitText}>{val}</Text>
              </View>
            );
          })}
        </View>

        {errorMessage ? (
          <Text style={styles.errorTextCentered}>{errorMessage}</Text>
        ) : null}

        {/* Resend Countdown */}
        <TouchableOpacity
          style={styles.resendRow}
          disabled={countdown > 0 || loading}
          onPress={handleSendOtpRequest}
        >
          <Ionicons name="refresh" size={14} color={countdown === 0 ? '#00B5AD' : '#94A3B8'} />
          <Text style={[styles.resendText, countdown === 0 && { color: '#00B5AD', fontWeight: '700' }]}>
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
              <Text style={styles.fromZaloCode}>{latestGeneratedOtp}</Text>
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
  stepProgressStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 50
  },
  stepProgressStripDark: {
    backgroundColor: 'rgba(19, 54, 53, 0.85)',
    borderBottomColor: 'rgba(255,255,255,0.12)'
  },
  stepDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  stepMiniPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: '#E2E8F0'
  },
  stepMiniPillActive: {
    backgroundColor: '#00C4B4'
  },
  stepMiniText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  stepMiniTextActive: {
    color: '#FFFFFF'
  },

  /* STEP 1 */
  step1Container: {
    flex: 1,
    backgroundColor: '#2E6F6D',
    justifyContent: 'space-between'
  },
  step1CenterWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  locDialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#113534',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10
  },
  locAppIconWrap: {
    width: 54,
    height: 54,
    position: 'relative',
    marginBottom: 14
  },
  locBlueSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1D9BF0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  locHandBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#113534'
  },
  locTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24
  },
  locSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 18
  },
  locMapPreview: {
    width: '100%',
    height: 138,
    borderRadius: 16,
    backgroundColor: '#273549',
    marginTop: 14,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative'
  },
  roadLineH: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 3,
    backgroundColor: '#475569'
  },
  roadLineV: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 2.5,
    backgroundColor: '#475569'
  },
  precisePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 4,
    zIndex: 5
  },
  precisePillText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700'
  },
  streetLabel: {
    position: 'absolute',
    color: '#CBD5E1',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  mapCenterTarget: {
    position: 'absolute',
    top: '44%',
    left: '44%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paradiseLabel: {
    color: '#E2E8F0',
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
    position: 'absolute'
  },
  blueLocationDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#60A5FA',
    borderWidth: 2.5,
    borderColor: '#BAE6FD',
    opacity: 0.9
  },
  landmarkBottomRow: {
    position: 'absolute',
    bottom: 8,
    left: '34%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  landmarkIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  landmarkText: {
    color: '#F1F5F9',
    fontSize: 9,
    fontWeight: '700'
  },
  locPermBtn: {
    width: '100%',
    backgroundColor: '#244B49',
    paddingVertical: 13,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  locPermBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  step1BottomDecor: {
    marginTop: 14,
    alignItems: 'center'
  },
  decorBarWhite: {
    width: 100,
    height: 10,
    borderTopLeftRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.4)'
  },
  decorBarGold: {
    width: 180,
    height: 10,
    backgroundColor: '#CA8A04',
    marginRight: 30
  },

  /* STEP 2 */
  step2Container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between'
  },
  step2TopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingTop: 10
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6
  },
  langPillText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B'
  },
  orbitStage: {
    height: 310,
    justifyContent: 'center',
    paddingHorizontal: 26,
    position: 'relative'
  },
  orbitCircleOuter: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    top: -10,
    left: -20
  },
  orbitCircleInner: {
    position: 'absolute',
    width: 265,
    height: 265,
    borderRadius: 133,
    borderWidth: 1.5,
    borderColor: '#CCFBF1',
    top: 26,
    left: 18
  },
  orbitBadge: {
    position: 'absolute',
    zIndex: 5
  },
  car3DPill: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#80DEEA',
    shadowColor: '#00B5AD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  },
  scooter3DPill: {
    backgroundColor: '#ECFEFF',
    padding: 8,
    borderRadius: 16
  },
  food3DPill: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 18,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6
  },
  calendar3DPill: {
    backgroundColor: '#E0F2FE',
    padding: 7,
    borderRadius: 14
  },
  gift3DPill: {
    backgroundColor: '#E0F7FA',
    padding: 7,
    borderRadius: 14
  },
  heroTextBlock: {
    marginTop: 10,
    zIndex: 10
  },
  heroCyanTitle: {
    fontFamily: FONTS.family,
    fontSize: 30,
    fontWeight: '800',
    color: '#00B5AD',
    lineHeight: 36,
    letterSpacing: -0.5
  },
  heroSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 20
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
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  continueBtnTurquoise: {
    backgroundColor: '#00C4B4'
  },
  continueBtnText: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8'
  },
  continueBtnTextWhite: {
    color: '#FFFFFF'
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
    color: '#00B5AD',
    fontWeight: '600'
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
    borderColor: '#00B5AD',
    backgroundColor: '#00B5AD'
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
    backgroundColor: '#22C1C3',
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
    backgroundColor: '#262629',
    marginHorizontal: 10,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 22,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
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
    backgroundColor: '#00D2D3',
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
    backgroundColor: '#22D3EE',
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
    color: '#00B5AD'
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
    borderColor: '#1E293B',
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
