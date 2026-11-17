import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';
import ApiService from '../services/api';

export default function PasswordAuthModal({
  visible,
  onClose,
  mode = 'AUTH', // 'AUTH' (Login/Register/Forgot) | 'CHANGE' (Change Password in Profile)
  currentUser = null,
  onAuthSuccess,
  language = 'vi'
}) {
  const isEn = language === 'en';
  const [subTab, setSubTab] = useState('LOGIN'); // 'LOGIN' | 'REGISTER' | 'FORGOT'
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'error' | 'success', text: '' }

  useEffect(() => {
    if (visible) {
      setBanner(null);
      setPassword('');
      setConfirmPass('');
      setCurrentPass('');
      setOtpCode('');
    }
  }, [visible, subTab, mode]);

  const getStrength = (pw = '') => {
    if (!pw) return null;
    if (pw.length < 6) return { label: isEn ? 'Weak (<6 chars)' : 'Yếu (<6 ký tự)', color: '#DC2626', pct: '33%' };
    if (pw.length < 9 || !/[A-Z0-9@]/.test(pw)) {
      return { label: isEn ? 'Medium' : 'Trung bình', color: '#D97706', pct: '66%' };
    }
    return { label: isEn ? 'Strong' : 'Mạnh • An toàn', color: '#15803D', pct: '100%' };
  };

  const strength = getStrength(password);

  const callAuthApi = async (endpoint, payload) => {
    const baseUrl = ApiService.getBaseUrl ? ApiService.getBaseUrl() : '/api';
    const res = await fetch(`${baseUrl}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  };

  const handleSubmit = async () => {
    setBanner(null);

    if (mode === 'CHANGE') {
      if (!password || password.length < 6) {
        setBanner({ type: 'error', text: isEn ? 'New password must be at least 6 characters.' : 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
        return;
      }
      if (password !== confirmPass) {
        setBanner({ type: 'error', text: isEn ? 'Confirm password does not match.' : 'Mật khẩu xác nhận không khớp.' });
        return;
      }
      setLoading(true);
      try {
        const data = await callAuthApi('change-password', {
          userId: currentUser?.id,
          identifier: currentUser?.phone || currentUser?.email,
          currentPassword: currentPass,
          newPassword: password
        });
        if (data.success) {
          setBanner({ type: 'success', text: data.message || (isEn ? 'Password updated!' : 'Đổi mật khẩu thành công!') });
          setTimeout(() => onClose(), 1100);
        } else {
          setBanner({ type: 'error', text: data.message || 'Không thể đổi mật khẩu.' });
        }
      } catch (e) {
        setBanner({ type: 'error', text: 'Lỗi kết nối máy chủ.' });
      } finally {
        setLoading(false);
      }
      return;
    }

    // mode === 'AUTH'
    if (subTab === 'LOGIN') {
      if (!identifier.trim() || !password) {
        setBanner({ type: 'error', text: isEn ? 'Please enter Phone/Email and Password.' : 'Vui lòng nhập Số điện thoại/Email và Mật khẩu.' });
        return;
      }
      setLoading(true);
      try {
        const data = await callAuthApi('login-password', { identifier: identifier.trim(), password });
        if (data.success && data.user) {
          ApiService.saveSession(data.token, data.user);
          onClose();
          if (onAuthSuccess) onAuthSuccess(data.user, data.token);
        } else {
          setBanner({ type: 'error', text: data.message || 'Sai thông tin đăng nhập.' });
        }
      } catch (e) {
        setBanner({ type: 'error', text: 'Lỗi kết nối máy chủ.' });
      } finally {
        setLoading(false);
      }
    } else if (subTab === 'REGISTER') {
      if (!fullName.trim() || !identifier.trim() || !password) {
        setBanner({ type: 'error', text: isEn ? 'Please fill in all fields.' : 'Vui lòng điền đầy đủ Họ tên, SĐT/Email và Mật khẩu.' });
        return;
      }
      if (password.length < 6) {
        setBanner({ type: 'error', text: isEn ? 'Password must be at least 6 characters.' : 'Mật khẩu phải có tối thiểu 6 ký tự.' });
        return;
      }
      if (password !== confirmPass) {
        setBanner({ type: 'error', text: isEn ? 'Passwords do not match.' : 'Mật khẩu nhập lại không khớp.' });
        return;
      }
      setLoading(true);
      try {
        const data = await callAuthApi('register', {
          fullName: fullName.trim(),
          identifier: identifier.trim(),
          password
        });
        if (data.success && data.user) {
          ApiService.saveSession(data.token, data.user);
          onClose();
          if (onAuthSuccess) onAuthSuccess(data.user, data.token);
        } else {
          setBanner({ type: 'error', text: data.message || 'Không thể đăng ký.' });
        }
      } catch (e) {
        setBanner({ type: 'error', text: 'Lỗi kết nối máy chủ.' });
      } finally {
        setLoading(false);
      }
    } else if (subTab === 'FORGOT') {
      if (!identifier.trim() || !otpCode.trim() || !password) {
        setBanner({ type: 'error', text: 'Vui lòng nhập SĐT/Email, mã xác thực (VD: 8888) và Mật khẩu mới.' });
        return;
      }
      if (password !== confirmPass) {
        setBanner({ type: 'error', text: 'Mật khẩu mới nhập lại không khớp.' });
        return;
      }
      setLoading(true);
      try {
        const data = await callAuthApi('reset-password', {
          identifier: identifier.trim(),
          otp: otpCode.trim(),
          newPassword: password
        });
        if (data.success) {
          setBanner({ type: 'success', text: data.message });
          setTimeout(() => setSubTab('LOGIN'), 1000);
        } else {
          setBanner({ type: 'error', text: data.message || 'Không thể đặt lại mật khẩu.' });
        }
      } catch (e) {
        setBanner({ type: 'error', text: 'Lỗi kết nối máy chủ.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerBanner}>
            <View style={styles.headerTopRow}>
              <View style={styles.secPill}>
                <Ionicons name="lock-closed" size={12} color="#D4AF37" />
                <Text style={styles.secPillText}>
                  {mode === 'CHANGE'
                    ? (isEn ? 'ACCOUNT SECURITY' : 'BẢO MẬT TÀI KHOẢN')
                    : 'ECOGO IDENTITY • SHA-256'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#FAF7F2" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>
              {mode === 'CHANGE'
                ? (isEn ? 'Change Password' : 'Đổi Mật Khẩu Tài Khoản')
                : subTab === 'LOGIN'
                ? (isEn ? 'Sign In with Password' : 'Đăng Nhập Mật Khẩu')
                : subTab === 'REGISTER'
                ? (isEn ? 'Create New Account' : 'Đăng Ký Tài Khoản Mới')
                : (isEn ? 'Reset Forgotten Password' : 'Khôi Phục Mật Khẩu')}
            </Text>

            {mode === 'AUTH' && (
              <View style={styles.tabRow}>
                {[
                  { id: 'LOGIN', label: isEn ? 'Sign In' : 'Đăng nhập' },
                  { id: 'REGISTER', label: isEn ? 'Register' : 'Đăng ký' },
                  { id: 'FORGOT', label: isEn ? 'Forgot PW' : 'Quên MK' }
                ].map((t) => {
                  const active = subTab === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.tabBtn, active && styles.tabBtnActive]}
                      onPress={() => setSubTab(t.id)}
                    >
                      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {banner && (
            <View
              style={[
                styles.bannerBox,
                { backgroundColor: banner.type === 'success' ? '#DCFCE7' : '#FEE2E2' }
              ]}
            >
              <Ionicons
                name={banner.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={banner.type === 'success' ? '#15803D' : '#DC2626'}
              />
              <Text
                style={[
                  styles.bannerText,
                  { color: banner.type === 'success' ? '#15803D' : '#DC2626' }
                ]}
              >
                {banner.text}
              </Text>
            </View>
          )}

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {mode === 'AUTH' && subTab === 'REGISTER' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{isEn ? 'Full Name' : 'Họ và tên'}</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={isEn ? 'Enter your full name' : 'VD: Nguyễn Văn A'}
                  placeholderTextColor="#9C8B7E"
                />
              </View>
            )}

            {mode === 'AUTH' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  {isEn ? 'Phone Number or Email' : 'Số điện thoại hoặc Email'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder={isEn ? '0908123456 or email@domain.com' : 'VD: 0999999999 hoặc email@gmail.com'}
                  placeholderTextColor="#9C8B7E"
                  autoCapitalize="none"
                />
              </View>
            )}

            {mode === 'AUTH' && subTab === 'FORGOT' && (
              <View style={styles.fieldGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.label}>
                    {isEn ? 'Recovery Code (OTP)' : 'Mã xác thực khôi phục (OTP)'}
                  </Text>
                  <TouchableOpacity onPress={() => setOtpCode('8888')}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309' }}>
                      {isEn ? 'Auto-fill 8888' : 'Điền nhanh 8888'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="Nhập mã OTP (VD: 8888)"
                  placeholderTextColor="#9C8B7E"
                  keyboardType="numeric"
                />
              </View>
            )}

            {mode === 'CHANGE' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  {isEn ? 'Current Password (optional if not set)' : 'Mật khẩu hiện tại (bỏ trống nếu chưa từng đặt)'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={currentPass}
                  onChangeText={setCurrentPass}
                  secureTextEntry={!showPass}
                  placeholder="••••••••"
                  placeholderTextColor="#9C8B7E"
                />
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                {mode === 'CHANGE' || subTab === 'FORGOT'
                  ? (isEn ? 'New Password' : 'Mật khẩu mới')
                  : (isEn ? 'Password' : 'Mật khẩu')}
              </Text>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  placeholder={isEn ? 'At least 6 characters' : 'Tối thiểu 6 ký tự'}
                  placeholderTextColor="#9C8B7E"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ paddingHorizontal: 10 }}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6F4E37" />
                </TouchableOpacity>
              </View>

              {strength && (mode === 'CHANGE' || subTab !== 'LOGIN') && (
                <View style={{ marginTop: 6 }}>
                  <View style={styles.strengthTrack}>
                    <View style={[styles.strengthFill, { width: strength.pct, backgroundColor: strength.color }]} />
                  </View>
                  <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
            </View>

            {(mode === 'CHANGE' || subTab === 'REGISTER' || subTab === 'FORGOT') && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  {isEn ? 'Confirm Password' : 'Xác nhận lại mật khẩu'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  secureTextEntry={!showPass}
                  placeholder="••••••••"
                  placeholderTextColor="#9C8B7E"
                />
              </View>
            )}

            {mode === 'AUTH' && subTab === 'LOGIN' && (
              <TouchableOpacity
                style={{ alignSelf: 'flex-end', marginBottom: 12 }}
                onPress={() => setSubTab('FORGOT')}
              >
                <Text style={{ fontFamily: FONTS.family, fontSize: 12, fontWeight: '700', color: '#8C6239' }}>
                  {isEn ? 'Forgot password?' : 'Quên mật khẩu?'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.88}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'CHANGE'
                    ? (isEn ? 'Save New Password' : 'Lưu Mật Khẩu Mới')
                    : subTab === 'LOGIN'
                    ? (isEn ? 'Sign In Now' : 'Đăng Nhập Ngay')
                    : subTab === 'REGISTER'
                    ? (isEn ? 'Create Account' : 'Hoàn Tất Đăng Ký')
                    : (isEn ? 'Reset Password' : 'Đặt Lại Mật Khẩu')}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 12, 8, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 375,
    maxHeight: '88%',
    backgroundColor: '#FAF7F2',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5DDD3'
  },
  headerBanner: {
    backgroundColor: '#2B180D',
    padding: 16
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  secPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  secPillText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE68A'
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center'
  },
  tabBtnActive: {
    backgroundColor: '#D4AF37'
  },
  tabBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)'
  },
  tabBtnTextActive: {
    color: '#2B180D',
    fontWeight: '800'
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  bannerText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700'
  },
  bodyScroll: {
    padding: 16
  },
  fieldGroup: {
    marginBottom: 12
  },
  label: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4E3322',
    marginBottom: 5
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DFD0C0',
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#2B180D'
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD0C0'
  },
  strengthTrack: {
    height: 4,
    backgroundColor: '#E5DDD3',
    borderRadius: 2,
    overflow: 'hidden'
  },
  strengthFill: {
    height: '100%'
  },
  strengthText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 3
  },
  submitBtn: {
    backgroundColor: '#4E3322',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10
  },
  submitBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
