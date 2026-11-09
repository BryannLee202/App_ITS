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
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import ApiService from '../services/api';

export default function TripsHistoryScreen({ onNavigateToKey }) {
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
          <Text style={styles.title}>Hành Trình & Hợp Đồng Thuê Xe</Text>
          <Text style={styles.subtitle}>
            Quản lý chuyến đi thời gian thực, hóa đơn VAT và chứng chỉ giảm phát thải CO₂
          </Text>
        </View>

        {/* Eco Summary Banner (Mint Green & Champagne Beige) */}
        <View style={styles.ecoSummaryCard}>
          <View style={styles.ecoTopBadgeRow}>
            <View style={styles.ecoBadgeMint}>
              <Ionicons name="leaf" size={11} color="#059669" />
              <Text style={styles.ecoBadgeMintText}>CHỨNG NHẬN ESG XANH UTH</Text>
            </View>
            <Text style={styles.ecoVerifyCode}>ID: UTH-ESG-2026</Text>
          </View>

          <View style={styles.ecoRow}>
            <View style={styles.ecoItem}>
              <Text style={styles.ecoNum}>42.8</Text>
              <Text style={styles.ecoUnit}>kg CO₂</Text>
              <Text style={styles.ecoLabel}>Đã tiết giảm</Text>
            </View>
            <View style={styles.ecoDivider} />
            <View style={styles.ecoItem}>
              <Text style={styles.ecoNum}>2.14</Text>
              <Text style={styles.ecoUnit}>cây xanh</Text>
              <Text style={styles.ecoLabel}>Hấp thụ tương đương</Text>
            </View>
            <View style={styles.ecoDivider} />
            <View style={styles.ecoItem}>
              <Text style={styles.ecoNum}>340</Text>
              <Text style={styles.ecoUnit}>Eco Points</Text>
              <Text style={styles.ecoLabel}>Điểm thưởng tích lũy</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Danh sách hợp đồng ({trips.length})</Text>

            {trips.map(trip => {
              const isActive = trip.status === 'ACTIVE';
              return (
                <View key={trip.id} style={[styles.tripCard, isActive && styles.activeTripCard]}>
                  <View style={styles.tripCardTop}>
                    <View style={styles.contractRow}>
                      <Ionicons name="document-text" size={14} color="#059669" />
                      <Text style={styles.contractText}>{trip.contractNumber}</Text>
                    </View>
                    <View style={[styles.statusTag, isActive ? styles.statusActive : styles.statusCompleted]}>
                      <Text style={[styles.statusTagText, isActive ? styles.textActive : styles.textCompleted]}>
                        {isActive ? 'ĐANG MỞ KHÓA • ACTIVE' : 'ĐÃ TẤT TOÁN'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripBody}>
                    <Image
                      source={{ uri: trip.vehicle?.thumbnail || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80' }}
                      style={styles.vehImg}
                    />
                    <View style={styles.tripDetails}>
                      <Text style={styles.vehName}>{trip.vehicle?.name || 'VinFast VF 8 Plus'}</Text>
                      <Text style={styles.plate}>
                        Biển số: {trip.vehicle?.plateNumber || '51K-882.91'} • Gói {trip.totalHours || 4}h
                      </Text>

                      <View style={styles.statsRow}>
                        <View style={styles.statChip}>
                          <Ionicons name="navigate-outline" size={11} color="#4B5563" />
                          <Text style={styles.statItem}>{trip.distanceTraveledKm} km</Text>
                        </View>
                        <View style={[styles.statChip, styles.statChipMint]}>
                          <Ionicons name="leaf-outline" size={11} color="#059669" />
                          <Text style={[styles.statItem, { color: '#059669', fontWeight: '800' }]}>
                            -{trip.co2SavedKg} kg CO₂
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.tripFooter}>
                    <View>
                      <Text style={styles.costLabel}>Tổng giá trị hợp đồng:</Text>
                      <Text style={styles.costVal}>
                        {(trip.estimatedTotal || 240000).toLocaleString('vi-VN')}đ
                      </Text>
                    </View>

                    <View style={styles.footerBtnsRow}>
                      <TouchableOpacity
                        style={styles.receiptBtn}
                        onPress={() => setSelectedContractTrip(trip)}
                      >
                        <Ionicons name="document-attach-outline" size={14} color="#111827" />
                        <Text style={styles.receiptBtnText}>Xem Hợp đồng</Text>
                      </TouchableOpacity>

                      {isActive && (
                        <TouchableOpacity
                          style={styles.activeKeyBtn}
                          onPress={onNavigateToKey}
                        >
                          <Ionicons name="key" size={14} color="#FFFFFF" />
                          <Text style={styles.activeKeyBtnText}>Khóa Số</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
                <Text style={styles.contractModalBadge}>HỢP ĐỒNG THUÊ XE ĐIỆN TỬ ITS</Text>
                <Text style={styles.contractModalNo}>{selectedContractTrip?.contractNumber}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedContractTrip(null)}
              >
                <Ionicons name="close" size={18} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Bên thuê (Khách hàng eKYC):</Text>
              <Text style={styles.cVal}>Nguyễn Văn An (GPLX B2)</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Phương tiện bàn giao:</Text>
              <Text style={styles.cVal}>{selectedContractTrip?.vehicle?.name}</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Biển kiểm soát:</Text>
              <Text style={styles.cVal}>{selectedContractTrip?.vehicle?.plateNumber}</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Phương thức mở khóa:</Text>
              <Text style={[styles.cVal, { color: '#059669' }]}>BLE 5.2 Encrypted Digital Key</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Tiền đặt cọc thế chấp:</Text>
              <Text style={[styles.cVal, { color: '#059669' }]}>0đ (Miễn cọc eKYC)</Text>
            </View>
            <View style={styles.contractLine}>
              <Text style={styles.cLabel}>Tổng thanh toán:</Text>
              <Text style={styles.cTotalVal}>
                {(selectedContractTrip?.estimatedTotal || 240000).toLocaleString('vi-VN')}đ
              </Text>
            </View>

            <View style={styles.signatureBox}>
              <Ionicons name="shield-checkmark" size={16} color="#059669" />
              <Text style={styles.signatureText}>
                Đã ký số hợp lệ bởi Hệ thống Giao thông Thông minh ITS - ĐH GTVT TP.HCM (UTH)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeContractBtn}
              onPress={() => setSelectedContractTrip(null)}
            >
              <Text style={styles.closeContractBtnText}>Đóng Hợp Đồng</Text>
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
    backgroundColor: '#F5F5F7'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28
  },
  headerSection: {
    marginBottom: 14
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827'
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  ecoSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
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
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  ecoBadgeMintText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  ecoVerifyCode: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280'
  },
  ecoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F2EB',
    borderRadius: 14,
    paddingVertical: 12
  },
  ecoItem: {
    flex: 1,
    alignItems: 'center'
  },
  ecoDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5DEC9'
  },
  ecoNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669'
  },
  ecoUnit: {
    fontSize: 10,
    color: '#111827',
    fontWeight: '700'
  },
  ecoLabel: {
    fontSize: 9,
    color: '#786B59',
    marginTop: 1,
    fontWeight: '600'
  },
  listSection: {},
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  activeTripCard: {
    borderColor: '#10B981',
    borderWidth: 1.5
  },
  tripCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    marginBottom: 10
  },
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  contractText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827'
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99
  },
  statusActive: {
    backgroundColor: '#ECFDF5'
  },
  statusCompleted: {
    backgroundColor: '#F5F2EB'
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '800'
  },
  textActive: {
    color: '#059669'
  },
  textCompleted: {
    color: '#786B59'
  },
  tripBody: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  vehImg: {
    width: 82,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F5F2EB'
  },
  tripDetails: {
    flex: 1,
    marginLeft: 12
  },
  vehName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827'
  },
  plate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3
  },
  statChipMint: {
    backgroundColor: '#ECFDF5'
  },
  statItem: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600'
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    marginTop: 10
  },
  costLabel: {
    fontSize: 10,
    color: '#6B7280'
  },
  costVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669'
  },
  footerBtnsRow: {
    flexDirection: 'row',
    gap: 6
  },
  activeKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4
  },
  activeKeyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F5F2EB',
    gap: 4
  },
  receiptBtnText: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  contractModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  contractModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 12
  },
  contractModalBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669'
  },
  contractModalNo: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contractLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5
  },
  cLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  cVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827'
  },
  cTotalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669'
  },
  signatureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginTop: 12
  },
  signatureText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#059669'
  },
  closeContractBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14
  },
  closeContractBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  }
});
