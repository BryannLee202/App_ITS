import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'ecogo_app_language';

export const TRANSLATIONS = {
  vi: {
    common: {
      back: 'Quay lại',
      continue: 'Tiếp tục',
      confirm: 'Xác nhận',
      cancel: 'Hủy bỏ',
      close: 'Đóng',
      save: 'Lưu thay đổi',
      brand_sub: 'ECOGO MOBILITY',
      brand_title: 'EcoGo Smart'
    },
    splash: {
      badge: 'NỀN TẢNG THUÊ XE TỰ LÁI ĐA DẠNG 24/7',
      slogan_main: 'Chạm Là Mở · Lướt Là Đi',
      slogan_sub: 'Thuê ô tô, xe máy tự lái đa dạng dòng xe · Giao nhận 24/7\nMở khóa kỹ thuật số không chạm · Tự do mọi hành trình',
      cta: 'Bắt đầu hành trình'
    },
    step1: {
      app_label: 'ECOGO SMART',
      system_time: 'Yêu cầu truy cập vị trí',
      title: 'Cho phép sử dụng vị trí hiện tại của bạn?',
      subtitle: 'Để hiển thị các điểm thuê xe tự lái và trạm dịch vụ gần nhất quanh khu vực của bạn',
      accuracy: 'Độ chính xác cao: Bật',
      landmark: 'Trạm dịch vụ EVN UTH · 0.3 km',
      allow_always: 'Cho phép khi dùng ứng dụng',
      allow_once: 'Cho phép một lần',
      deny: 'Để sau / Từ chối',
      footer: 'Quyền vị trí giúp tự động tính quãng đường và mở khóa BLE'
    },
    step2: {
      badge: 'ĐA DẠNG DÒNG XE Ô TÔ & XE MÁY',
      badge_sub: 'Không phát thải · Vận hành êm ái',
      title: 'Di chuyển thông minh\nThuê xe tự động 24/7',
      subtitle: 'Đăng nhập để nhận ưu đãi 20% và mở khóa xe không chạm qua Bluetooth tại TP.HCM',
      feature_ble: 'Khóa số BLE',
      feature_hub: 'Trạm sạc 24/7',
      feature_deposit: '0đ Đặt cọc',
      phone_placeholder: 'Nhập số điện thoại của bạn',
      btn_continue: 'Tiếp tục',
      or_continue: 'Hoặc tiếp tục với',
      terms_prefix: 'Bằng việc tiếp tục, tôi đồng ý với',
      terms_link: 'Điều khoản & Chính sách',
      terms_suffix: 'của EcoGo Smart Mobility'
    },
    step3: {
      title: 'Nhập số điện thoại',
      subtitle: 'Mã OTP xác thực sẽ gửi về số này',
      clear: 'Xóa',
      btn_continue: 'Tiếp tục'
    },
    step4: {
      title: 'Chọn phương thức nhận mã',
      subtitle: 'Chúng tôi sẽ gửi mã gồm 4 chữ số đến',
      ch_sms_title: 'SMS Tin nhắn',
      ch_sms_sub: 'Gửi mã SMS bảo mật qua nhà mạng Viettel/Vina/Mobi',
      ch_zalo_title: 'Zalo ZNS',
      ch_zalo_sub: 'Nhận mã OTP bảo mật tức thì qua tin nhắn Zalo',
      ch_voice_title: 'Cuộc gọi thoại OTP',
      ch_voice_sub: 'Tổng đài AI gọi trực tiếp và đọc mã xác thực',
      btn_send: 'Gửi mã xác thực'
    },
    step5: {
      title: 'Nhập mã xác thực OTP',
      subtitle: 'Mã 4 chữ số đã được gửi qua',
      resend_wait: 'Gửi lại mã sau',
      resend_now: 'Gửi lại mã ngay',
      autofill: 'Điền nhanh OTP thử nghiệm',
      btn_verify: 'Xác nhận & Vào app'
    },
    tabs: {
      home: 'Khám phá',
      map: 'Bản đồ',
      key: 'Khóa xe',
      profile: 'Tài khoản'
    },
    profile: {
      country: 'Quốc gia (Việt Nam)',
      language: 'Ngôn ngữ (Tiếng Việt)',
      invoice: 'Hóa đơn điện tử',
      logout: 'Đăng xuất',
      select_language_title: 'Chọn ngôn ngữ',
      vietnamese: 'Tiếng Việt (VI)',
      english: 'English (EN)'
    }
  },

  en: {
    common: {
      back: 'Back',
      continue: 'Continue',
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save Changes',
      brand_sub: 'ECOGO MOBILITY',
      brand_title: 'EcoGo Smart'
    },
    splash: {
      badge: '24/7 SMART MULTI-VEHICLE RENTAL PLATFORM',
      slogan_main: 'Tap to Unlock · Ride With Ease',
      slogan_sub: 'Self-drive cars & scooters rental · 24/7 delivery\nContactless digital key access · Freedom on every journey',
      cta: 'Get Started'
    },
    step1: {
      app_label: 'ECOGO SMART',
      system_time: 'Location Permission Request',
      title: 'Allow EcoGo to use your current location?',
      subtitle: 'To show nearby self-drive rental stations and charging hubs around you',
      accuracy: 'High Precision: On',
      landmark: 'EVN UTH Service Hub · 0.3 km',
      allow_always: 'Allow While Using App',
      allow_once: 'Allow Once',
      deny: "Don't Allow",
      footer: 'Location access enables automatic routing and smart BLE unlock'
    },
    step2: {
      badge: 'MULTI-VEHICLE FLEET: CARS & SCOOTERS',
      badge_sub: 'Zero Emission · Ultra-Smooth Ride',
      title: 'Smart Mobility\n24/7 Vehicle Rental',
      subtitle: 'Sign in to get 20% off and unlock vehicles with contactless Bluetooth key in HCMC',
      feature_ble: 'BLE Smart Key',
      feature_hub: '24/7 Stations',
      feature_deposit: '0đ Deposit',
      phone_placeholder: 'Enter your phone number',
      btn_continue: 'Continue',
      or_continue: 'Or continue with',
      terms_prefix: 'By continuing, you agree to the',
      terms_link: 'Terms & Policies',
      terms_suffix: 'of EcoGo Smart Mobility'
    },
    step3: {
      title: 'Enter Phone Number',
      subtitle: 'A verification OTP will be sent to this number',
      clear: 'Clear',
      btn_continue: 'Continue'
    },
    step4: {
      title: 'Choose OTP Channel',
      subtitle: 'We will send a 4-digit verification code to',
      ch_sms_title: 'SMS Message',
      ch_sms_sub: 'Fast carrier SMS OTP delivery (Viettel/Vina/Mobi)',
      ch_zalo_title: 'Zalo ZNS',
      ch_zalo_sub: 'Instant encrypted OTP notification via Zalo',
      ch_voice_title: 'Voice Call OTP',
      ch_voice_sub: 'Automated AI voice calls and reads your code',
      btn_send: 'Send Verification Code'
    },
    step5: {
      title: 'Enter Verification OTP',
      subtitle: 'A 4-digit code was sent via',
      resend_wait: 'Resend code in',
      resend_now: 'Resend code now',
      autofill: 'Autofill Demo OTP',
      btn_verify: 'Verify & Enter App'
    },
    tabs: {
      home: 'Explore',
      map: 'Map',
      key: 'Digital Key',
      profile: 'Profile'
    },
    profile: {
      country: 'Country (Vietnam)',
      language: 'Language (English)',
      invoice: 'Electronic Invoices',
      logout: 'Log Out',
      select_language_title: 'Select Language',
      vietnamese: 'Tiếng Việt (VI)',
      english: 'English (EN)'
    }
  }
};

export const getStoredLanguage = () => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'vi') return saved;
  }
  return 'vi';
};

export const saveStoredLanguage = (lang) => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
};

export const LanguageContext = createContext({
  language: 'vi',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (path) => path
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getStoredLanguage);

  const setLanguage = (lang) => {
    if (lang === 'vi' || lang === 'en') {
      setLanguageState(lang);
      saveStoredLanguage(lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'vi' ? 'en' : 'vi';
    setLanguage(nextLang);
  };

  const t = (path) => {
    if (!path) return '';
    const keys = path.split('.');
    let cur = TRANSLATIONS[language] || TRANSLATIONS.vi;
    for (const k of keys) {
      if (cur && cur[k] !== undefined) {
        cur = cur[k];
      } else {
        // Fallback to vi
        let fb = TRANSLATIONS.vi;
        for (const fk of keys) {
          if (fb && fb[fk] !== undefined) fb = fb[fk];
          else return path;
        }
        return fb;
      }
    }
    return cur;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
