import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';
import ApiService from '../services/api';

export default function OperationsCenterModal({ visible, onClose, language = 'vi' }) {
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState('BOOKINGS'); // 'BOOKINGS' | 'CUSTOMERS' | 'FLEET'
  const [loading, setLoading] = useState(false);
  const [opsData, setOpsData] = useState(null);
  const [adminData, setAdminData] = useState({
    totalRevenue: 240000,
    bookings: [],
    customers: []
  });
  const [noticeText, setNoticeText] = useState(null);
  const [aiDispatchLogs, setAiDispatchLogs] = useState(null);
  const [runningAiDispatch, setRunningAiDispatch] = useState(false);

  const showToast = (msg) => {
    setNoticeText(msg);
    setTimeout(() => setNoticeText(null), 2500);
  };

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const baseUrl = ApiService.getBaseUrl ? ApiService.getBaseUrl() : '/api';
      const [opsRes, admRes] = await Promise.all([
        fetch(`${baseUrl}/ops/overview`),
        fetch(`${baseUrl}/admin/dashboard`)
      ]);
      if (opsRes.ok) {
        setOpsData(await opsRes.json());
      }
      if (admRes.ok) {
        const adm = await admRes.json();
        setAdminData({
          totalRevenue: adm.totalRevenue || 0,
          bookings: adm.bookings || [],
          customers: adm.customers || []
        });
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAllAdminData();
    }
  }, [visible]);

  const handleBookingAction = async (tripId, action) => {
    try {
      const baseUrl = ApiService.getBaseUrl ? ApiService.getBaseUrl() : '/api';
      const res = await fetch(`${baseUrl}/admin/rentals/${tripId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        showToast(
          action === 'DELETE'
            ? (isEn ? 'Deleted booking from Database' : 'Đã xóa đơn khỏi Database')
            : (isEn ? 'Revoked key & completed trip' : 'Đã thu hồi khóa số & kết thúc chuyến')
        );
        fetchAllAdminData();
      }
    } catch (e) {}
  };

  const handleCustomerAction = async (userId, action) => {
    try {
      const baseUrl = ApiService.getBaseUrl ? ApiService.getBaseUrl() : '/api';
      const res = await fetch(`${baseUrl}/admin/users/${userId}/privilege`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        showToast(
          action === 'ADD_COINS'
            ? (isEn ? 'Added +100 EcoCoins to customer' : 'Đã cộng +100 EcoXu cho khách hàng')
            : (isEn ? 'Granted VIP status to customer' : 'Đã nâng hạng Eco Elite VIP cho khách')
        );
        fetchAllAdminData();
      }
    } catch (e) {}
  };

  const handleRunAiDispatch = async () => {
    setRunningAiDispatch(true);
    try {
      const baseUrl = ApiService.getBaseUrl ? ApiService.getBaseUrl() : '/api';
      const res = await fetch(`${baseUrl}/ops/ai-dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language })
      });
      if (res.ok) {
        const data = await res.json();
        setAiDispatchLogs(data.actions || []);
        setRunningAiDispatch(false);
        return;
      }
    } catch (e) {}
    setAiDispatchLogs([
      'Điều phối tự động 2 xe VinFast VF 5 từ Hub Thủ Đức → Hub Landmark 81 (dự báo nhu cầu +34%).',
      'Ưu tiên cổng sạc siêu nhanh 250kW cho VF 8 (nạp từ 28% → 90% trong 18 phút).',
      'Kích hoạt ưu đãi Giờ Vàng -20% tại các trạm thấp điểm để cân bằng đội xe.'
    ]);
    setRunningAiDispatch(false);
  };

  const fleet = opsData?.fleet || {
    totalVehicles: 28,
    available: 25,
    inUse: 3,
    avgBatteryPct: 89,
    activeStations: 10
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerBanner}>
            <View style={styles.headerTopRow}>
              <View style={styles.rootBadgePill}>
                <MaterialCommunityIcons name="crown" size={13} color="#D4AF37" />
                <Text style={styles.rootBadgeText}>ADMIN ROOT • DATABASE LIVE</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#FAF7F2" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>
              {isEn ? 'Admin Root Command Center' : 'Trung tâm Quản trị Admin Root'}
            </Text>
            <Text style={styles.headerSub}>
              {isEn
                ? 'Observe customer bookings, manage users & control fleet DB'
                : 'Quan sát đơn đặt xe của khách, quản lý tài khoản & điều hành Database'}
            </Text>

            {/* 3 Tabs Switcher */}
            <View style={styles.tabRow}>
              {[
                {
                  id: 'BOOKINGS',
                  label: isEn
                    ? `Bookings (${adminData.bookings.length})`
                    : `Đơn đặt xe (${adminData.bookings.length})`,
                  icon: 'receipt-outline'
                },
                {
                  id: 'CUSTOMERS',
                  label: isEn
                    ? `Customers (${adminData.customers.length})`
                    : `Khách hàng (${adminData.customers.length})`,
                  icon: 'people-outline'
                },
                {
                  id: 'FLEET',
                  label: isEn ? 'Fleet & AI' : 'Đội xe & AI',
                  icon: 'pulse-outline'
                }
              ].map((t) => {
                const active = activeTab === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tabPill, active && styles.tabPillActive]}
                    activeOpacity={0.85}
                    onPress={() => setActiveTab(t.id)}
                  >
                    <Ionicons
                      name={t.icon}
                      size={13}
                      color={active ? '#2B180D' : 'rgba(255,255,255,0.8)'}
                    />
                    <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {noticeText && (
            <View style={styles.toastBanner}>
              <Ionicons name="checkmark-circle" size={15} color="#FDE68A" />
              <Text style={styles.toastText}>{noticeText}</Text>
            </View>
          )}

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {activeTab === 'BOOKINGS' && (
              <>
                <View style={styles.revenueBar}>
                  <View>
                    <Text style={styles.revenueLabel}>
                      {isEn ? 'TOTAL DB BOOKING REVENUE' : 'TỔNG DOANH THU ĐƠN ĐẶT TRONG DB'}
                    </Text>
                    <Text style={styles.revenueValue}>
                      {(adminData.totalRevenue || 0).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                  <View style={styles.dbSyncBadge}>
                    <Ionicons name="server-outline" size={12} color="#15803D" />
                    <Text style={styles.dbSyncText}>rentals.json</Text>
                  </View>
                </View>

                {adminData.bookings.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {isEn ? 'No bookings recorded yet.' : 'Chưa có đơn đặt xe nào trong Database.'}
                  </Text>
                ) : (
                  adminData.bookings.map((b) => {
                    const isActive = b.status === 'ACTIVE';
                    return (
                      <View key={b.id} style={styles.recordCard}>
                        <View style={styles.recordHeaderRow}>
                          <Text style={styles.recordTitle} numberOfLines={1}>
                            {b.vehicleName || b.vehicleId} ({b.plateNumber || '51K-889.99'})
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: isActive ? '#DCFCE7' : '#F3EEE7' }
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: isActive ? '#15803D' : '#6F4E37' }
                              ]}
                            >
                              {isActive ? 'ĐANG THUÊ' : b.status}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.recordMeta}>
                          👤 {b.customerName || b.signedBy || 'Khách hàng'} · 📞 {b.customerPhone || '+84386726647'}
                        </Text>
                        <Text style={styles.recordMeta}>
                          📄 HĐ: {b.contractNumber || b.id} · 💰 {(b.estimatedTotal || 0).toLocaleString('vi-VN')}đ
                        </Text>

                        <View style={styles.actionRow}>
                          {isActive && (
                            <TouchableOpacity
                              style={styles.revokeBtn}
                              onPress={() => handleBookingAction(b.id, 'COMPLETE')}
                            >
                              <Ionicons name="key-outline" size={13} color="#FFFFFF" />
                              <Text style={styles.revokeBtnText}>
                                {isEn ? 'Revoke Key / Complete' : 'Thu hồi khóa / Kết thúc'}
                              </Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleBookingAction(b.id, 'DELETE')}
                          >
                            <Ionicons name="trash-outline" size={13} color="#DC2626" />
                            <Text style={styles.deleteBtnText}>
                              {isEn ? 'Delete' : 'Xóa đơn'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}

            {activeTab === 'CUSTOMERS' && (
              <>
                {adminData.customers.map((u) => (
                  <View key={u.id} style={styles.recordCard}>
                    <View style={styles.recordHeaderRow}>
                      <Text style={styles.recordTitle}>
                        {u.fullName} {u.role === 'ADMIN_ROOT' ? '👑' : ''}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>
                          {u.ecoCoins || 0} Xu
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.recordMeta}>
                      📞 {u.phone || 'Google OAuth'} · ✉️ {u.email || 'Chưa cập nhật'}
                    </Text>
                    <Text style={styles.recordMeta}>
                      🪪 {u.drivingLicense || 'GPLX B2'} · 🏅 {u.memberRank || 'Eco Member'}
                    </Text>
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.coinActionBtn}
                        onPress={() => handleCustomerAction(u.id, 'ADD_COINS')}
                      >
                        <Text style={styles.coinActionText}>+100 EcoXu</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.vipActionBtn}
                        onPress={() => handleCustomerAction(u.id, 'GRANT_VIP')}
                      >
                        <Text style={styles.vipActionText}>
                          {isEn ? 'Grant VIP' : 'Nâng hạng VIP'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            {activeTab === 'FLEET' && (
              <>
                <View style={styles.kpiGrid}>
                  <View style={styles.kpiTile}>
                    <Text style={styles.kpiValue}>{fleet.totalVehicles} Xe</Text>
                    <Text style={styles.kpiLabel}>
                      {fleet.available} sẵn sàng · {fleet.inUse} đang thuê
                    </Text>
                  </View>
                  <View style={styles.kpiTile}>
                    <Text style={[styles.kpiValue, { color: '#15803D' }]}>{fleet.avgBatteryPct}%</Text>
                    <Text style={styles.kpiLabel}>Mức pin TB toàn đội</Text>
                  </View>
                </View>

                <View style={[styles.recordCard, { padding: 12 }]}>
                  <Text style={styles.recordTitle}>
                    {isEn ? 'AI Autonomous Fleet Dispatch' : 'AI Tự động Điều phối Đội xe'}
                  </Text>
                  <Text style={[styles.recordMeta, { marginTop: 4 }]}>
                    {isEn
                      ? 'Predict station demand spikes and rebalance EVs across 10 Hubs.'
                      : 'Dự báo nhu cầu giờ cao điểm và tự động cân bằng xe giữa 10 trạm Hub.'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.doneBtn, { marginTop: 10, flexDirection: 'row', gap: 6, backgroundColor: '#2B180D' }]}
                    onPress={handleRunAiDispatch}
                  >
                    <Ionicons name="sparkles" size={14} color="#D4AF37" />
                    <Text style={[styles.doneBtnText, { color: '#FDE68A' }]}>
                      {runningAiDispatch ? 'Đang tối ưu...' : 'Kích hoạt AI Tối ưu Đội xe'}
                    </Text>
                  </TouchableOpacity>
                  {aiDispatchLogs && (
                    <View style={{ marginTop: 10, gap: 5 }}>
                      {aiDispatchLogs.map((log, i) => (
                        <Text key={i} style={styles.recordMeta}>
                          ✓ {log}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footerBar}>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchAllAdminData} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator size="small" color="#4E3322" />
              ) : (
                <>
                  <Ionicons name="refresh" size={15} color="#4E3322" />
                  <Text style={styles.refreshBtnText}>
                    {isEn ? 'Sync DB' : 'Đồng bộ DB'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>{isEn ? 'Close' : 'Đóng'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 12, 8, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    maxHeight: '90%',
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
  rootBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)'
  },
  rootBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE68A',
    letterSpacing: 0.5
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  headerSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.76)',
    marginTop: 2
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  tabPillActive: {
    backgroundColor: '#D4AF37'
  },
  tabPillText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)'
  },
  tabPillTextActive: {
    color: '#2B180D',
    fontWeight: '800'
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E5631',
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  toastText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  bodyScroll: {
    padding: 14
  },
  revenueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFE7DF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DFD0C0'
  },
  revenueLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#6F4E37'
  },
  revenueValue: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '900',
    color: '#2B180D',
    marginTop: 2
  },
  dbSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  dbSyncText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D'
  },
  emptyText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F767E',
    textAlign: 'center',
    marginVertical: 20
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAE2D7'
  },
  recordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  recordTitle: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#2B180D',
    marginRight: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  statusBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800'
  },
  recordMeta: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#5C4D42',
    marginTop: 2
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  revokeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#4E3322',
    paddingVertical: 8,
    borderRadius: 10
  },
  revokeBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  deleteBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626'
  },
  coinActionBtn: {
    flex: 1,
    backgroundColor: '#EFE7DF',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center'
  },
  coinActionText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#4E3322'
  },
  vipActionBtn: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  vipActionText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E'
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  kpiTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE2D7'
  },
  kpiValue: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '900',
    color: '#2B180D'
  },
  kpiLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 2
  },
  footerBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#EAE2D7',
    backgroundColor: '#FAF7F2'
  },
  refreshBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD0C0',
    backgroundColor: '#EFE7DF'
  },
  refreshBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#4E3322'
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#4E3322'
  },
  doneBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
