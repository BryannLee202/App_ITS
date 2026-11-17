import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import ApiService from '../services/api';
import { playNotificationChime } from '../utils/audioChime';
import { useLanguage } from '../i18n';

const NOTIF_FILTERS = [
  { id: 'ALL', label: 'Tất cả', icon: 'view-grid' },
  { id: 'OFFERS', label: 'Ưu đãi', icon: 'ticket-percent' },
  { id: 'NEWS', label: 'Tin tức', icon: 'newspaper-variant-outline' },
  { id: 'SYSTEM', label: 'Hệ thống', icon: 'shield-check' }
];

export default function NotificationsScreen({
  theme = THEME_PRESETS.BE_SUA_CAFE,
  onNavigateToVehicles,
  onNavigateToOffers,
  onNavigateToMap,
  onNavigateToProfile
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tải danh sách thông báo từ Backend API
  const fetchNotifications = async (shouldChime = false) => {
    try {
      const res = await ApiService.getNotifications();
      if (res && res.success && res.notifications) {
        setNotifications(res.notifications);
        if (shouldChime && soundEnabled) {
          playNotificationChime();
        }
      }
    } catch (err) {
      console.warn('Lỗi tải thông báo:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Tự động kiểm tra thông báo mới mỗi 25 giây
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 25000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  // Đánh dấu 1 thông báo là đã đọc
  const handleItemClick = async (item) => {
    setSelectedNotif(item);
    setShowDetailModal(true);

    if (!item.isRead) {
      if (soundEnabled) playNotificationChime();
      // Cập nhật local
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      // Gọi API backend
      try {
        await ApiService.markNotificationRead(item.id);
      } catch (e) {}
    }
  };

  const [inlineToast, setInlineToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const confirmScale = useRef(new Animated.Value(0.86)).current;
  const useNative = Platform.OS !== 'web';

  const getToastVisual = (title = '') => {
    if (title.includes('Ding-Dong')) return { icon: 'bell-ring', bg: '#D4AF37', color: '#2B180D' };
    if (title.includes('Âm thanh')) return { icon: 'volume-high', bg: '#E6C770', color: '#2B180D' };
    if (title.includes('Đã xóa')) return { icon: 'delete-sweep', bg: '#FEE2E2', color: '#DC2626' };
    if (title.includes('Thành công') || title.includes('Đã cập nhật')) {
      return { icon: 'check-decagram', bg: '#DCFCE7', color: '#15803D' };
    }
    return { icon: 'bell-badge', bg: '#FDE68A', color: '#92400E' };
  };

  const showNotice = (title, message) => {
    setInlineToast({ title: title.replace('🔔 ', ''), message, visual: getToastVisual(title) });
    toastAnim.setValue(0);
    Animated.spring(toastAnim, {
      toValue: 1,
      friction: 6,
      tension: 65,
      useNativeDriver: useNative
    }).start();

    setTimeout(() => {
      setInlineToast((prev) => (prev && prev.message === message ? null : prev));
    }, 2800);
  };

  const confirmAction = (title, message, onConfirm, confirmLabel = 'Xác nhận') => {
    setConfirmDialog({ title, message, onConfirm, confirmLabel });
    confirmScale.setValue(0.86);
    Animated.spring(confirmScale, {
      toValue: 1,
      friction: 6,
      tension: 70,
      useNativeDriver: useNative
    }).start();
  };

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllRead = async () => {
    if (notifications.every((n) => n.isRead)) {
      showNotice('Thông báo', 'Tất cả thông báo đều đã được đọc.');
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await ApiService.markAllNotificationsRead();
      if (soundEnabled) playNotificationChime();
      showNotice('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc!');
    } catch (e) {
      showNotice('Đã cập nhật', 'Đã đánh dấu đã đọc trên thiết bị!');
    }
  };

  // Xóa 1 thông báo
  const handleDeleteItem = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    confirmAction('Xóa thông báo', 'Bạn có chắc chắn muốn xóa thông báo này?', async () => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (selectedNotif && selectedNotif.id === id) {
        setShowDetailModal(false);
      }
      try {
        await ApiService.deleteNotification(id);
      } catch (err) {}
    }, 'Xóa');
  };

  // Xóa toàn bộ thông báo
  const handleClearAll = () => {
    if (notifications.length === 0) {
      showNotice('Thông báo', 'Danh sách thông báo hiện đang trống.');
      return;
    }
    confirmAction('Xóa tất cả', 'Bạn có chắc muốn xóa toàn bộ lịch sử thông báo không?', async () => {
      setNotifications([]);
      setSelectedNotif(null);
      setShowDetailModal(false);
      try {
        await ApiService.clearAllNotifications();
        showNotice('Đã xóa', 'Toàn bộ danh sách thông báo đã được dọn sạch!');
      } catch (err) {}
    }, 'Xóa hết');
  };

  // Bắn thông báo thử nghiệm kèm tiếng chuông (Simulate real notification)
  const handleTriggerSimulatedNotif = async () => {
    playNotificationChime();
    const demoNotifs = [
      {
        title: 'Ưu đãi giờ vàng: Giảm 20% phí thuê VinFast VF3',
        body: 'Hệ thống EcoGo vừa bổ sung 10 xe VinFast VF3 tại trạm Landmark 81. Đặt xe ngay để nhận ưu đãi 20%.',
        category: 'OFFERS',
        actionType: 'VEHICLES',
        actionPayload: 'CAR'
      },
      {
        title: 'Cộng thưởng 50 EcoXu từ hành trình di chuyển xanh',
        body: 'Chúc mừng bạn đã hoàn thành mục tiêu di chuyển không phát thải CO2 trong ngày hôm nay.',
        category: 'OFFERS',
        actionType: 'OFFERS',
        actionPayload: 'CAR'
      },
      {
        title: 'Kích hoạt bảo hiểm chuyến đi & Hợp đồng điện tử',
        body: 'Hợp đồng điện tử và gói bảo hiểm toàn diện BIC đã được đồng bộ cho tài khoản của bạn.',
        category: 'SYSTEM',
        actionType: 'PROFILE',
        actionPayload: 'EKYC'
      }
    ];

    const pick = demoNotifs[Math.floor(Math.random() * demoNotifs.length)];
    try {
      const res = await ApiService.createNotification(pick);
      if (res && res.success && res.notification) {
        setNotifications((prev) => [res.notification, ...prev]);
        showNotice('🔔 Ding-Dong!', `Thông báo mới: "${pick.title}" kèm tiếng chuông đã được gửi tự động!`);
      }
    } catch (e) {
      const localItem = {
        id: `notif_${Date.now()}`,
        category: pick.category,
        categoryLabel: pick.category === 'OFFERS' ? 'Ưu đãi' : 'Hệ thống',
        title: pick.title,
        body: pick.body,
        timeAgo: 'Vừa xong',
        createdAt: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80',
        isRead: false,
        actionType: pick.actionType,
        actionPayload: pick.actionPayload
      };
      setNotifications((prev) => [localItem, ...prev]);
      showNotice('🔔 Ding-Dong!', `Thông báo mới: "${pick.title}" kèm tiếng chuông!`);
    }
  };

  // Điều hướng khi bấm nút hành động trong modal chi tiết
  const handleModalAction = () => {
    setShowDetailModal(false);
    if (!selectedNotif) return;

    if (selectedNotif.actionType === 'VEHICLES' && onNavigateToVehicles) {
      onNavigateToVehicles(selectedNotif.actionPayload || 'CAR');
    } else if (selectedNotif.actionType === 'OFFERS' && onNavigateToOffers) {
      onNavigateToOffers();
    } else if (selectedNotif.actionType === 'MAP' && onNavigateToMap) {
      onNavigateToMap();
    } else if (selectedNotif.actionType === 'PROFILE' && onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  // Lọc theo tabs: Tất cả, Ưu đãi, Tin tức, Hệ thống
  const filteredList = notifications.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.category === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      {/* ============================================================
          1. HEADER ESPRESSO SANG TRỌNG (ĐỒNG BỘ QUIET LUXURY)
         ============================================================ */}
      <View style={styles.headerHeroGradient}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerMainTitle}>
              {isEn ? 'Notification Center' : 'Trung tâm thông báo'}
            </Text>
            {unreadCount > 0 ? (
              <Text style={styles.headerSubTitle}>
                {isEn
                  ? `You have ${unreadCount} unread notifications`
                  : `Bạn có ${unreadCount} thông báo chưa đọc`}
              </Text>
            ) : (
              <Text style={styles.headerSubTitle}>
                {isEn
                  ? 'Operations updates and member privileges'
                  : 'Cập nhật thông tin vận hành và đặc quyền thành viên'}
              </Text>
            )}
          </View>

          {/* Action Buttons: Chuông âm thanh, Đọc tất cả, Xóa tất cả */}
          <View style={styles.headerActionsRow}>
            {/* Toggle Âm thanh Chuông */}
            <TouchableOpacity
              style={[styles.headerIconBtn, soundEnabled && styles.headerIconBtnActive]}
              onPress={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playNotificationChime();
                showNotice(
                  'Âm thanh thông báo',
                  nextState ? 'Đã bật âm báo thông báo.' : 'Đã tắt âm báo thông báo.'
                );
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={soundEnabled ? 'volume-high' : 'volume-mute'}
                size={16}
                color={soundEnabled ? '#D4AF37' : 'rgba(255, 255, 255, 0.65)'}
              />
            </TouchableOpacity>

            {/* Bắn thông báo thử nghiệm */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleTriggerSimulatedNotif}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Đọc tất cả */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleMarkAllRead}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Xóa tất cả */}
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleClearAll}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Filter Pills Horizontally (Giống hệt ảnh của bạn) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {NOTIF_FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(f.id)}
              >
                <MaterialCommunityIcons
                  name={f.icon}
                  size={13}
                  color={isActive ? '#2B180D' : 'rgba(255,255,255,0.82)'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Compact Animated In-App Toast Pill (Dynamic Island style) */}
      {inlineToast && (
        <Animated.View
          style={[
            styles.inlineToastCapsule,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-14, 0]
                  })
                },
                {
                  scale: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1]
                  })
                }
              ]
            }
          ]}
        >
          <View
            style={[
              styles.inlineToastIconBadge,
              { backgroundColor: inlineToast.visual?.bg || '#D4AF37' }
            ]}
          >
            <MaterialCommunityIcons
              name={inlineToast.visual?.icon || 'bell-ring'}
              size={16}
              color={inlineToast.visual?.color || '#2B180D'}
            />
          </View>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={styles.inlineToastTitle} numberOfLines={1}>
              {inlineToast.title}
            </Text>
            <Text style={styles.inlineToastMsg} numberOfLines={2}>
              {inlineToast.message}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.inlineToastCloseCircle}
            onPress={() => setInlineToast(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={13} color="#FAF7F2" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ============================================================
          2. NOTIFICATION LIST BODY
         ============================================================ */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#6F4E37" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6F4E37']}
              tintColor="#6F4E37"
            />
          }
        >
          {filteredList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={44} color="#C4B5FD" />
              </View>
              <Text style={styles.emptyTitle}>Không có thông báo nào</Text>
              <Text style={styles.emptySub}>
                {activeFilter === 'ALL'
                  ? 'Bạn đã đọc hết mọi thông báo hoặc chưa có tin mới.'
                  : `Chưa có thông báo nào trong mục ${NOTIF_FILTERS.find((f) => f.id === activeFilter)?.label}.`}
              </Text>
            </View>
          ) : (
            filteredList.map((item, idx) => {
              const isUnread = !item.isRead;
              return (
                <TouchableOpacity
                  key={item.id || idx}
                  style={[styles.notifItemCard, isUnread && styles.notifItemCardUnread]}
                  activeOpacity={0.82}
                  onPress={() => handleItemClick(item)}
                >
                  {/* Left Thumbnail Image */}
                  <View style={styles.thumbnailBox}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.thumbnailImg}
                      resizeMode="cover"
                    />
                    {isUnread && <View style={styles.unreadRedDot} />}
                  </View>

                  {/* Center Content */}
                  <View style={styles.notifContentCol}>
                    <View style={styles.metaTopRow}>
                      <Text style={styles.categoryTagText}>{item.categoryLabel || 'Ưu đãi'}</Text>
                      <Text style={styles.metaDotDivider}>•</Text>
                      <Text style={styles.timeAgoText}>{item.timeAgo || 'Vừa xong'}</Text>
                    </View>

                    <Text style={styles.notifTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    <Text style={styles.notifBodyText} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>

                  {/* Right Action: Delete Icon */}
                  <TouchableOpacity
                    style={styles.deleteSingleBtn}
                    onPress={(e) => handleDeleteItem(item.id, e)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* ============================================================
          MODAL CHI TIẾT THÔNG BÁO (NOTIFICATION DETAIL MODAL)
         ============================================================ */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailCard}>
            {selectedNotif && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeaderRow}>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryText}>
                      {selectedNotif.categoryLabel || 'Ưu đãi EcoGo'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Ionicons name="close" size={20} color="#1A1D1F" />
                  </TouchableOpacity>
                </View>

                {/* Banner Photo */}
                <Image
                  source={{ uri: selectedNotif.image }}
                  style={styles.modalBannerImg}
                  resizeMode="cover"
                />

                <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalDetailTitle}>{selectedNotif.title}</Text>
                  <Text style={styles.modalDetailTime}>
                    Thời gian: {selectedNotif.timeAgo || 'Vừa xong'}
                  </Text>
                  <Text style={styles.modalDetailBody}>{selectedNotif.body}</Text>
                </ScrollView>

                {/* Bottom Actions */}
                <View style={styles.modalBottomActions}>
                  <TouchableOpacity
                    style={styles.modalActionPrimaryBtn}
                    activeOpacity={0.88}
                    onPress={handleModalAction}
                  >
                    <Ionicons name="arrow-forward-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.modalActionPrimaryText}>
                      {selectedNotif.actionType === 'VEHICLES'
                        ? 'Đặt xe nhận ưu đãi ngay'
                        : selectedNotif.actionType === 'OFFERS'
                        ? 'Khám phá mục Ưu đãi'
                        : 'Xem chi tiết'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalDeleteBtn}
                    activeOpacity={0.8}
                    onPress={() => handleDeleteItem(selectedNotif.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    <Text style={styles.modalDeleteBtnText}>Xóa thông báo</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Compact In-App Confirmation Dialog (gọn trong màn hình điện thoại) */}
      <Modal
        visible={!!confirmDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDialog(null)}
      >
        <View style={styles.confirmBackdrop}>
          <Animated.View
            style={[
              styles.confirmCard,
              { transform: [{ scale: confirmScale }] }
            ]}
          >
            <View style={styles.confirmIconOuterHalo}>
              <View style={styles.confirmIconInnerCircle}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#DC2626" />
              </View>
            </View>
            <Text style={styles.confirmTitle}>{confirmDialog?.title}</Text>
            <Text style={styles.confirmMessage}>{confirmDialog?.message}</Text>
            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                activeOpacity={0.8}
                onPress={() => setConfirmDialog(null)}
              >
                <Ionicons name="close-circle-outline" size={15} color="#4E3322" />
                <Text style={styles.confirmCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                activeOpacity={0.85}
                onPress={() => {
                  const fn = confirmDialog?.onConfirm;
                  setConfirmDialog(null);
                  if (fn) fn();
                }}
              >
                <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                <Text style={styles.confirmDeleteText}>{confirmDialog?.confirmLabel || 'Xóa'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2'
  },
  // Header Hero
  headerHeroGradient: {
    backgroundColor: '#4E3322',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  headerTitleBox: {
    flex: 1
  },
  headerMainTitle: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2
  },
  headerSubTitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: 'rgba(250, 247, 242, 0.82)',
    marginTop: 2
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)'
  },
  headerIconBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.22)',
    borderColor: '#D4AF37'
  },
  // Filter Pills
  filterScroll: {
    marginHorizontal: -16
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)'
  },
  filterPillActive: {
    backgroundColor: '#FAF7F2',
    borderColor: '#FAF7F2'
  },
  filterPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#FAF7F2'
  },
  filterPillTextActive: {
    color: '#4E3322',
    fontWeight: '800'
  },
  // List
  listScrollView: {
    flex: 1
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80
  },
  loadingText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6F5C50',
    marginTop: 10
  },
  // Notif Card Item
  notifItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAE2D5',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  notifItemCardUnread: {
    backgroundColor: '#FFFDF9',
    borderColor: '#D5C7B6',
    borderLeftWidth: 4,
    borderLeftColor: '#6F4E37'
  },
  thumbnailBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F6EFE9'
  },
  thumbnailImg: {
    width: '100%',
    height: '100%'
  },
  unreadRedDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4AF37',
    borderWidth: 1.5,
    borderColor: '#FFFFFF'
  },
  notifContentCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6
  },
  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3
  },
  categoryTagText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6F4E37'
  },
  metaDotDivider: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#9CA3AF',
    marginHorizontal: 4
  },
  timeAgoText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#8C7A68'
  },
  notifTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#2D1E16',
    lineHeight: 18,
    marginBottom: 3
  },
  notifBodyText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#6F5C50',
    lineHeight: 16
  },
  deleteSingleBtn: {
    padding: 6,
    marginLeft: 2
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F6EFE9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '800',
    color: '#2D1E16'
  },
  emptySub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F5C50',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 18
  },
  simulateTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E3322',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6
  },
  simulateTestBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  // Modal Detail
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 24, 13, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  detailCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalCategoryBadge: {
    backgroundColor: '#F6EFE9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  modalCategoryText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#6F4E37'
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBannerImg: {
    width: '100%',
    height: 150,
    borderRadius: 16,
    marginBottom: 12
  },
  modalDetailTitle: {
    fontFamily: FONTS.family,
    fontSize: 15.5,
    fontWeight: '800',
    color: '#2D1E16',
    lineHeight: 21
  },
  modalDetailTime: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8C7A68',
    marginTop: 4,
    marginBottom: 8
  },
  modalDetailBody: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6F5C50',
    lineHeight: 19
  },
  modalBottomActions: {
    marginTop: 16,
    gap: 8
  },
  modalActionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4E3322',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6
  },
  modalActionPrimaryText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4
  },
  modalDeleteBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DC2626'
  },
  inlineToastCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B180D',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5
  },
  inlineToastIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inlineToastCloseCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inlineToastTitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FDE68A'
  },
  inlineToastMsg: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#FAF7F2',
    marginTop: 1
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 12, 8, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28
  },
  confirmCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#FAF7F2',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DDD3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  },
  confirmIconOuterHalo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  confirmIconInnerCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#2B180D',
    textAlign: 'center'
  },
  confirmMessage: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#5C4D42',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18
  },
  confirmBtnRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10
  },
  confirmCancelBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EFE7DF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmCancelText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E3322'
  },
  confirmDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmDeleteText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
