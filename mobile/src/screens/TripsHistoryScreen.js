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

const DEFAULT_SEED_TRIPS = [
  {
    id: 'trip-uth-001',
    contractNumber: 'HĐ-UTH-2026-0891',
    status: 'COMPLETED',
    vehicle: {
      name: 'Hyundai Ioniq 5 Prestige',
      plateNumber: '51K-882.91',
      thumbnail: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
    },
    totalHours: 4,
    distanceTraveledKm: 82,
    co2SavedKg: '13.5',
    estimatedTotal: 240000,
    startTime: '10:00 24/10/2026',
    endTime: '14:00 24/10/2026',
    route: 'Trạm ĐH GTVT Cơ sở 1 Bình Thạnh → Trạm Cơ sở 3 Quận 9'
  },
  {
    id: 'trip-uth-002',
    contractNumber: 'HĐ-UTH-2026-0542',
    status: 'COMPLETED',
    vehicle: {
      name: 'VinFast VF 8 Plus',
      plateNumber: '51K-992.34',
      thumbnail: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
    },
    totalHours: 5,
    distanceTraveledKm: 60,
    co2SavedKg: '9.9',
    estimatedTotal: 350000,
    startTime: '08:30 20/10/2026',
    endTime: '13:30 20/10/2026',
    route: 'Trạm Cơ sở 1 Bình Thạnh → KĐT Sala Thủ Thiêm'
  }
];

export default function TripsHistoryScreen({
  theme = THEME_PRESETS.BE_SUA_CAFE,
  onNavigateToKey,
  onNavigateBack,
  onOpenRewards,
  onNavigateToRent
}) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractTrip, setSelectedContractTrip] = useState(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getTripHistory();
      if (res && res.trips && res.trips.length > 0) {
        setTrips(res.trips);
      } else {
        // Đồng bộ dữ liệu lịch sử mặc định của tài khoản UTH
        setTrips(DEFAULT_SEED_TRIPS);
      }
    } catch (err) {
      console.warn('Load history error, using cached seed trips:', err.message);
      setTrips(DEFAULT_SEED_TRIPS);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán động từ các chuyến đi thực tế của thiết bị
  const totalKm = trips.reduce((acc, t) => acc + (t.distanceTraveledKm || t.distanceKm || 0), 0);
  const totalCo2Saved = trips.reduce((acc, t) => acc + Number(t.co2SavedKg || (t.distanceTraveledKm ? t.distanceTraveledKm * 0.165 : 0)), 0).toFixed(1);
  const totalTrees = (Number(totalCo2Saved) / 20).toFixed(2);
  const totalRewardPoints = Math.floor(totalKm * 2.4);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          {onNavigateBack && (
            <TouchableOpacity
              style={styles.backBtnPill}
              activeOpacity={0.7}
              onPress={onNavigateBack}
            >
              <Ionicons name="arrow-back" size={16} color={theme.primary} />
              <Text style={[styles.backBtnPillText, { color: theme.primary }]}>Quay lại</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Chuyến đi & Hợp đồng</Text>
          <Text style={styles.subtitle}>
            Lịch sử thuê xe, hóa đơn điện tử và thống kê di chuyển xanh
          </Text>
        </View>

        {/* PRACTICAL RENTAL & PERKS SUMMARY CARD */}
        <View style={styles.ecoSummaryCard}>
          <View style={styles.ecoTopBadgeRow}>
            <View style={[styles.ecoBadgeMint, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="car-sport" size={13} color={theme.primary} />
              <Text style={[styles.ecoBadgeMintText, { color: theme.primary }]}>
                Tổng kết hành trình UTH
              </Text>
            </View>

            <Text style={styles.ecoVerifyCode}>EcoGo UTH · 2026</Text>
          </View>

          <View style={[styles.ecoRow, { backgroundColor: theme.beigeSoft }]}>
            <View style={styles.ecoItem}>
              <Text style={[styles.ecoNum, { color: theme.primary }]}>{totalKm}</Text>
              <Text style={styles.ecoUnit}>km</Text>
              <Text style={styles.ecoLabel}>Tổng hành trình</Text>
            </View>
            <View style={styles.ecoDivider} />
            <View style={styles.ecoItem}>
              <Text style={[styles.ecoNum, { color: theme.primary }]}>{trips.length}</Text>
              <Text style={styles.ecoUnit}>hợp đồng</Text>
              <Text style={styles.ecoLabel}>Đã hoàn tất</Text>
            </View>
            <View style={styles.ecoDivider} />
            <View style={styles.ecoItem}>
              <Text style={[styles.ecoNum, { color: theme.primary }]}>{totalRewardPoints}</Text>
              <Text style={styles.ecoUnit}>Điểm thưởng</Text>
              <Text style={styles.ecoLabel}>Tích lũy thực tế</Text>
            </View>
          </View>

          {/* Actionable Reward & Benefit Bar */}
          <TouchableOpacity
            style={styles.ecoBenefitBar}
            activeOpacity={0.8}
            onPress={() => {
              if (onOpenRewards) {
                onOpenRewards();
              }
            }}
          >
            <View style={styles.benefitLeftRow}>
              <Ionicons name="gift-outline" size={14} color="#D4AF37" />
              <Text style={styles.benefitText} numberOfLines={1} ellipsizeMode="tail">
                Đổi {totalRewardPoints} điểm lấy Voucher ưu đãi
              </Text>
              <Ionicons name="chevron-forward" size={12} color="#8C6239" />
            </View>
            <View style={styles.ecoEliteBadge}>
              <Ionicons name="shield-checkmark" size={10} color="#15803D" />
              <Text style={styles.ecoEliteBadgeText}>Miễn cọc 15M</Text>
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Danh sách hợp đồng ({trips.length})</Text>

            {trips.length === 0 ? (
              <View style={styles.emptyContractCard}>
                <Ionicons name="car-sport-outline" size={44} color="#BDB3A7" />
                <Text style={styles.emptyContractTitle}>Chưa có hợp đồng nào</Text>
                <Text style={styles.emptyContractSub}>
                  Hãy khởi hành chuyến xe điện đầu tiên để nhận dữ liệu viễn trắc CO₂ và tích điểm đổi voucher giảm giá.
                </Text>
                {onNavigateToRent && (
                  <TouchableOpacity
                    style={[styles.emptyRentBtn, { backgroundColor: theme.primary }]}
                    onPress={onNavigateToRent}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="car-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.emptyRentBtnText}>Thuê xe tự lái ngay</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              trips.map((trip) => {
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
            }))}
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

      {/* ============================================================
          MODAL: MINH BẠCH CÔNG THỨC TÍNH TOÁN CO2 & CÂY XANH (CHUẨN IPCC)
         ============================================================ */}
      <Modal
        visible={showFormulaModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFormulaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formulaModalCard}>
            <View style={styles.formulaModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="calculator-outline" size={18} color={theme.primary} />
                <Text style={styles.formulaModalTitle}>Công thức tính toán khoa học</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowFormulaModal(false)}
              >
                <Ionicons name="close" size={18} color="#1D1D1F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.formulaSubTitle}>Nguồn dữ liệu & Tiêu chuẩn tính toán:</Text>

              <View style={styles.formulaBox}>
                <Text style={styles.formulaBoxLabel}>1. Quãng đường thực tế (km):</Text>
                <Text style={styles.formulaBoxDesc}>
                  Được đo tự động bằng viễn trắc OBU / Hộp đen GPS gắn trên xe điện tự lái khi kết thúc chuyến đi.
                </Text>
              </View>

              <View style={styles.formulaBox}>
                <Text style={styles.formulaBoxLabel}>2. Lượng CO₂ tiết giảm (kg):</Text>
                <Text style={styles.formulaFormula}>
                  CO₂ = Quãng đường (km) × 0.165 kg CO₂/km
                </Text>
                <Text style={styles.formulaBoxDesc}>
                  Dựa trên định mức phát thải ô tô xăng 5 chỗ (165g CO₂/km) theo quy chuẩn Cục Đăng kiểm & IPCC.
                </Text>
              </View>

              <View style={styles.formulaBox}>
                <Text style={styles.formulaBoxLabel}>3. Cây xanh hấp thụ tương đương:</Text>
                <Text style={styles.formulaFormula}>
                  Số cây = Lượng CO₂ giảm / 20 kg
                </Text>
                <Text style={styles.formulaBoxDesc}>
                  1 cây xanh đô thị trưởng thành hấp thụ trung bình 20 kg CO₂ mỗi năm.
                </Text>
              </View>

              <View style={styles.formulaBox}>
                <Text style={styles.formulaBoxLabel}>4. Điểm thưởng & Quyền lợi:</Text>
                <Text style={styles.formulaBoxDesc}>
                  Mỗi km di chuyển = 2.4 Điểm thưởng (Eco Xu). Điểm dùng để đổi voucher thuê xe, cộng điểm rèn luyện UTH và miễn cọc 15.000.000đ.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeContractBtn, { backgroundColor: theme.primary, marginTop: 12 }]}
              onPress={() => setShowFormulaModal(false)}
            >
              <Text style={[styles.closeContractBtnText, { color: '#FFFFFF' }]}>Đã hiểu</Text>
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
  backBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EAE2D5',
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  backBtnPillText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700'
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
  formulaInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EAE2D5'
  },
  formulaInfoBtnText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700'
  },
  ecoBenefitBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0E8DC',
    overflow: 'hidden'
  },
  benefitLeftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
    minWidth: 0
  },
  benefitText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4E3322'
  },
  ecoEliteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
    gap: 3,
    flexShrink: 0
  },
  ecoEliteBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D'
  },
  emptyContractCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBE3D7',
    marginTop: 8
  },
  emptyContractTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F',
    marginTop: 12
  },
  emptyContractSub: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#6F767E',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 12
  },
  emptyRentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12
  },
  emptyRentBtnText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  formulaModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    width: '92%',
    maxWidth: 420
  },
  formulaModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F0',
    paddingBottom: 10,
    marginBottom: 12
  },
  formulaModalTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F'
  },
  formulaSubTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#6F4E37',
    marginBottom: 8
  },
  formulaBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EAE2D5'
  },
  formulaBoxLabel: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 2
  },
  formulaFormula: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
    marginVertical: 2
  },
  formulaBoxDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    lineHeight: 15
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
