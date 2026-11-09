import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, THEME_PRESETS } from '../styles/theme';
import ApiService from '../services/api';

export default function TripsHistoryScreen({
  theme = THEME_PRESETS.MINT,
  onNavigateToKey
}) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractTrip, setSelectedContractTrip] = useState(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getTripHistory();
      setTrips(res.trips || []);
    } catch (err) {
      console.warn('Load history error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Chuyến đi & Hợp đồng</Text>
          <Text style={styles.subtitle}>
            Lịch sử thuê xe, hóa đơn điện tử và thống kê di chuyển xanh
          </Text>
        </View>

        {/* Clean Mint & Warm Beige Eco Summary Card */}
        <View style={styles.ecoSummaryCard}>
          <View style={styles.ecoTopBadgeRow}>
            <View style={[styles.ecoBadgeMint, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="leaf" size={12} color={theme.primary} />
              <Text style={[styles.ecoBadgeMintText, { color: theme.primary }]}>
                Thống kê di chuyển xanh
              </Text>
            </View>
            <Text style={styles.ecoVerifyCode}>EcoGo UTH · 2026</Text>
          </View>

          <View style={[styles.ecoRow, { backgroundColor: theme.beigeSoft }]}>
            <View style={styles.ecoItem}>
              <Text style={[styles.ecoNum, { color: theme.primary }]}>42.8</Text>
              <Text style={styles.ecoUnit}>kg CO₂</Text>
              <Text style={styles.ecoLabel}>Đã tiết giảm</Text>
            </View>
            <View style={styles.ecoDivider} />
            <View style={styles.ecoItem}>
              <Text style={[styles.ecoNum, { color: theme.primary }]}>2.14</Text>
              <Text style={styles.ecoUnit}>cây xanh</Text>
              <Text style={styles.ecoLabel}>Hấp thụ tương đương</Text>
            </View>
            <View style={styles.ecoDivider} />
            <View style={styles.ecoItem}>
              <Text style={[styles.ecoNum, { color: theme.primary }]}>340</Text>
              <Text style={styles.ecoUnit}>Điểm thưởng</Text>
              <Text style={styles.ecoLabel}>Tích lũy</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Danh sách hợp đồng ({trips.length})</Text>

            {trips.map((trip) => {
              const isActive = trip.status === 'ACTIVE';
              return (
                <View
                  key={trip.id}
                  style={[
                    styles.tripCard,
                    isActive && { borderColor: theme.primary, borderWidth: 1.5 }
                  ]}
                >
                  <View style={styles.tripCardTop}>
                    <View style={styles.contractRow}>
                      <Ionicons name="document-text-outline" size={15} color={theme.primary} />
                      <Text style={styles.contractText}>{trip.contractNumber}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusTag,
                        isActive
                          ? { backgroundColor: theme.primarySoft }
                          : { backgroundColor: theme.beigeSoft }
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          isActive ? { color: theme.primary } : styles.textCompleted
                        ]}
                      >
                        {isActive ? 'Đang hoạt động' : 'Đã hoàn thành'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripBody}>
                    <Image
                      source={{
                        uri:
                          trip.vehicle?.thumbnail ||
                          'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
                      }}
                      style={styles.vehImg}
                    />
                    <View style={styles.tripDetails}>
                      <Text style={styles.vehName}>
                        {trip.vehicle?.name || 'Hyundai Ioniq 5 Prestige'}
                      </Text>
                      <Text style={styles.plate}>
                        Biển số {trip.vehicle?.plateNumber || '51K-882.91'} · Gói {trip.totalHours || 4} giờ
                      </Text>

                      <View style={styles.statsRow}>
                        <View style={styles.statChip}>
                          <Text style={styles.statItem}>{trip.distanceTraveledKm} km</Text>
                        </View>
                        <View
                          style={[
                            styles.statChip,
                            { backgroundColor: theme.primarySoft }
                          ]}
                        >
                          <Text
                            style={[
                              styles.statItem,
                              { color: theme.primary, fontWeight: '600' }
                            ]}
                          >
                            -{trip.co2SavedKg} kg CO₂
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.tripFooter}>
                    <View>
                      <Text style={styles.costLabel}>Tổng thanh toán</Text>
                      <Text style={styles.costVal}>
                        {(trip.estimatedTotal || 240000).toLocaleString('vi-VN')}đ
                      </Text>
                    </View>

                    <View style={styles.footerBtnsRow}>
                      <TouchableOpacity
                        style={[styles.receiptBtn, { backgroundColor: theme.beigeSoft }]}
                        onPress={() => setSelectedContractTrip(trip)}
                      >
                        <Text style={styles.receiptBtnText}>Hợp đồng</Text>
                      </TouchableOpacity>

                      {isActive && (
                        <TouchableOpacity
                          style={styles.activeKeyBtn}
                          onPress={onNavigateToKey}
                        >
                          <Ionicons name="key-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.activeKeyBtnText}>Mở khóa</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Electronic Contract & Receipt Modal */}
      <Modal
        visible={!!selectedContractTrip}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedContractTrip(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contractModalCard}>
            <View style={styles.contractModalHeader}>
              <View>
                <Text style={[styles.contractModalBadge, { color: theme.primary }]}>
                  Hợp đồng thuê xe điện tử
                </Text>
                <Text style={styles.contractModalNo}>{selectedContractTrip?.contractNumber}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedContractTrip(null)}
              >
                <Ionicons name="close" size={18} color="#1D1D1F" />
              </TouchableOpacity>
            </View>

            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Khách hàng thuê</Text>
              <Text style={styles.cVal}>Minh Tài (GPLX B2)</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Phương tiện</Text>
              <Text style={styles.cVal}>{selectedContractTrip?.vehicle?.name}</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Biển kiểm soát</Text>
              <Text style={styles.cVal}>{selectedContractTrip?.vehicle?.plateNumber}</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Chìa khóa số</Text>
              <Text style={[styles.cVal, { color: theme.primary }]}>Bluetooth BLE 5.2</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Tiền thế chấp</Text>
              <Text style={[styles.cVal, { color: theme.primary }]}>0đ (Miễn cọc)</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Tổng thanh toán</Text>
              <Text style={styles.cTotalVal}>
                {(selectedContractTrip?.estimatedTotal || 240000).toLocaleString('vi-VN')}đ
              </Text>
            </View>

            <View style={[styles.signatureBox, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="shield-checkmark" size={16} color={theme.primary} />
              <Text style={[styles.signatureText, { color: theme.primaryDark }]}>
                Đã xác thực chữ ký điện tử EcoGo Smart · ĐH GTVT TP.HCM (UTH)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeContractBtn}
              onPress={() => setSelectedContractTrip(null)}
            >
              <Text style={styles.closeContractBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28
  },
  headerSection: {
    marginBottom: 14
  },
  title: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: -0.3
  },
  subtitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6E6E73',
    marginTop: 2
  },
  ecoSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  ecoTopBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  ecoBadgeMint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 5
  },
  ecoBadgeMintText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600'
  },
  ecoVerifyCode: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93'
  },
  ecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14
  },
  ecoItem: {
    flex: 1,
    alignItems: 'center'
  },
  ecoDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EAE4D7'
  },
  ecoNum: {
    fontFamily: FONTS.family,
    fontSize: 19,
    fontWeight: '800'
  },
  ecoUnit: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#1D1D1F',
    fontWeight: '600',
    marginTop: 1
  },
  ecoLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 1
  },
  listSection: {},
  listTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  tripCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F0',
    paddingBottom: 10,
    marginBottom: 12
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  contractText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99
  },
  statusTagText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600'
  },
  textCompleted: {
    color: '#6E6E73'
  },
  tripBody: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  vehImg: {
    width: 88,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#F2F2F0'
  },
  tripDetails: {
    flex: 1,
    marginLeft: 12
  },
  vehName: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  plate: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  statChip: {
    backgroundColor: '#F5F5F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statItem: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500'
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F0',
    paddingTop: 12,
    marginTop: 12
  },
  costLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E6E73'
  },
  costVal: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 1
  },
  footerBtnsRow: {
    flexDirection: 'row',
    gap: 8
  },
  activeKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5
  },
  activeKeyBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  receiptBtnText: {
    fontFamily: FONTS.family,
    color: '#1D1D1F',
    fontSize: 12,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  contractModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EBECE8'
  },
  contractModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F0',
    paddingBottom: 12,
    marginBottom: 12
  },
  contractModalBadge: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600'
  },
  contractModalNo: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1F',
    marginTop: 2
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contractLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6
  },
  cLabel: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#6E6E73'
  },
  cVal: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F'
  },
  cTotalVal: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F'
  },
  signatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 14
  },
  signatureText: {
    fontFamily: FONTS.family,
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16
  },
  closeContractBtn: {
    backgroundColor: '#1D1D1F',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16
  },
  closeContractBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  }
});
