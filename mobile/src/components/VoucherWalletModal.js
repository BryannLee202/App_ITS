import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, COLORS } from '../styles/theme';

const DAILY_PROMOS = [
  {
    code: 'BANMOI30',
    title: 'Gói Chào Bạn Mới - Giảm 30%',
    desc: 'Giảm 30% chuyến đầu tiên cho tài khoản mới (tối đa 80.000đ)',
    tag: 'BẠN MỚI',
    tagBg: '#ECFDF5',
    tagColor: '#047857',
    expiry: 'Còn 3 ngày',
    claimedPct: 88
  },
  {
    code: 'ECOGO20',
    title: 'Hành Trình Xanh - Giảm 20%',
    desc: 'Áp dụng cho mọi dòng ô tô tự lái & xe máy điện (tối đa 120.000đ)',
    tag: 'HOT',
    tagBg: '#FEF3C7',
    tagColor: '#B45309',
    expiry: 'Còn 5 ngày',
    claimedPct: 76
  },
  {
    code: 'UTH50K',
    title: 'Độc Quyền SV & Giảng Viên UTH',
    desc: 'Giảm trực tiếp 50.000đ khi nhận xe tại Trạm Cơ sở 1 & 3 ĐH GTVT',
    tag: 'ĐỘC QUYỀN UTH',
    tagBg: '#EFF6FF',
    tagColor: '#1D4ED8',
    expiry: 'Hết tháng 11',
    claimedPct: 65
  },
  {
    code: 'FREESHIP',
    title: 'Giao Nhận Xe Tận Nhà 0đ',
    desc: 'Miễn 100% phí giao nhận xe trong bán kính 5km quanh trạm Hub',
    tag: 'TIỆN LỢI',
    tagBg: '#F3E8FF',
    tagColor: '#7E22CE',
    expiry: 'Còn 7 ngày',
    claimedPct: 83
  },
  {
    code: 'GIOVANG25',
    title: 'Flash Sale Giờ Vàng - Giảm 25K',
    desc: 'Áp dụng khung giờ cao điểm 11h-13h & 17h-19h hàng ngày',
    tag: 'GIỜ VÀNG',
    tagBg: '#FEF9C3',
    tagColor: '#854D0E',
    expiry: 'Hôm nay',
    claimedPct: 92
  }
];

const COIN_SHOP_ITEMS = [
  {
    code: 'XANH20K',
    title: 'Voucher Giảm 20.000đ Chuyến Đi',
    desc: 'Áp dụng cho mọi dòng xe ô tô tự lái & xe máy điện',
    coins: 50,
    tag: 'PHỔ BIẾN',
    tagBg: '#ECFDF5',
    tagColor: '#047857'
  },
  {
    code: 'FREESHIP5KM',
    title: 'Voucher Miễn Phí Giao Xe 5km',
    desc: 'Tiết kiệm 50.000đ phí giao xe tận cửa nhà bạn',
    coins: 80,
    tag: 'TIỆN ÍCH',
    tagBg: '#F3E8FF',
    tagColor: '#7E22CE'
  },
  {
    code: 'ECO50K',
    title: 'Voucher Giảm 50.000đ EcoGo',
    desc: 'Áp dụng cho các gói thuê từ 4 giờ hoặc thuê theo ngày',
    coins: 100,
    tag: 'HOT',
    tagBg: '#FEF3C7',
    tagColor: '#B45309'
  },
  {
    code: 'VIP100K',
    title: 'Gói VIP Cuối Tuần - Giảm 100K',
    desc: 'Áp dụng cho chuyến đi thuê xe theo ngày Thứ 7 & Chủ Nhật',
    coins: 200,
    tag: 'VIP 100K',
    tagBg: '#FFF1F2',
    tagColor: '#BE123C'
  }
];

const EXPIRED_HISTORY_VOUCHERS = [
  {
    code: 'CHAOXANH',
    title: 'Quà Tặng Mở App EcoGo - Giảm 30.000đ',
    desc: 'Đã áp dụng vào chuyến đi ngày 26/10/2026',
    usedDate: '26/10/2026'
  },
  {
    code: 'DIEMDANH10K',
    title: 'Thưởng Điểm Danh Tuần 1 - Giảm 10.000đ',
    desc: 'Đã hết hạn sử dụng',
    usedDate: '01/11/2026'
  }
];

export default function VoucherWalletModal({
  visible,
  onClose,
  initialTab = 'AVAILABLE',
  ecoCoins = 180,
  onDeductCoins,
  savedVouchers = ['BANMOI30', 'ECOGO20', 'UTH50K'],
  onSaveVoucher,
  onApplyVoucher
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'AVAILABLE');
  const [toastMessage, setToastMessage] = useState(null);

  // Sync initial tab when opened
  React.useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRedeemCoinVoucher = (item) => {
    if (ecoCoins < item.coins) {
      showToast(`Bạn cần thêm ${item.coins - ecoCoins} Xu để đổi voucher này!`);
      return;
    }

    if (onDeductCoins) {
      onDeductCoins(item.coins);
    }
    if (onSaveVoucher) {
      onSaveVoucher(item.code);
    }

    showToast(`🎉 Đã đổi thành công mã ${item.code} (-${item.coins} Xu)!`);
    setTimeout(() => {
      setActiveTab('AVAILABLE');
    }, 1200);
  };

  const handleUseNow = (code) => {
    if (onApplyVoucher) {
      onApplyVoucher(code);
    }
    onClose();
  };

  const availableVoucherList = DAILY_PROMOS.filter((p) => savedVouchers.includes(p.code));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Toast Notice */}
          {toastMessage && (
            <View style={styles.toastBox}>
              <Ionicons name="sparkles" size={14} color="#D4AF37" />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Ionicons name="ticket" size={20} color="#6F4E37" />
                <Text style={styles.title}>Ví Ưu Đãi & Đổi Xu Eco</Text>
              </View>
              <Text style={styles.subtitle}>Quản lý mã giảm giá & Đổi điểm lấy voucher</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.75}>
              <Ionicons name="close" size={20} color="#2B180D" />
            </TouchableOpacity>
          </View>

          {/* Eco Coins Balance Banner */}
          <View style={styles.coinsBalanceCard}>
            <View style={styles.coinsLeftGroup}>
              <View style={styles.coinBadgeIcon}>
                <Text style={{ fontSize: 18 }}>🪙</Text>
              </View>
              <View>
                <Text style={styles.coinsBalanceVal}>{ecoCoins} Xu Eco</Text>
                <Text style={styles.coinsBalanceSub}>Điểm tích lũy di chuyển xanh & điểm danh</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.quickShopBtn, activeTab === 'SHOP' && styles.quickShopBtnActive]}
              onPress={() => setActiveTab('SHOP')}
              activeOpacity={0.85}
            >
              <Ionicons
                name="gift-outline"
                size={14}
                color={activeTab === 'SHOP' ? '#FAF7F2' : '#6F4E37'}
              />
              <Text style={[styles.quickShopBtnText, activeTab === 'SHOP' && styles.quickShopBtnTextActive]}>
                Đổi quà
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4 Segmented Navigation Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'AVAILABLE' && styles.tabBtnActive]}
              onPress={() => setActiveTab('AVAILABLE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'AVAILABLE' && styles.tabTextActive]}>
                Chưa dùng ({savedVouchers.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'TODAY' && styles.tabBtnActive]}
              onPress={() => setActiveTab('TODAY')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'TODAY' && styles.tabTextActive]}>
                Hôm nay ({DAILY_PROMOS.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'SHOP' && styles.tabBtnActive]}
              onPress={() => setActiveTab('SHOP')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'SHOP' && styles.tabTextActive]}>
                🪙 Đổi Xu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'EXPIRED' && styles.tabBtnActive]}
              onPress={() => setActiveTab('EXPIRED')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'EXPIRED' && styles.tabTextActive]}>
                Lịch sử
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Contents */}
          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {/* TAB 1: AVAILABLE VOUCHERS (CHƯA DÙNG) */}
            {activeTab === 'AVAILABLE' && (
              <View>
                {savedVouchers.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Ionicons name="ticket-outline" size={36} color="#A89F91" />
                    <Text style={styles.emptyStateTitle}>Ví ưu đãi của bạn đang trống</Text>
                    <Text style={styles.emptyStateSub}>
                      Hãy chuyển sang tab "Hôm nay" để lưu mã hoặc tab "Đổi Xu" để lấy voucher mới!
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyActionBtn}
                      onPress={() => setActiveTab('TODAY')}
                    >
                      <Text style={styles.emptyActionText}>Xem Voucher Hôm Nay →</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  savedVouchers.map((code) => {
                    const found = DAILY_PROMOS.find((p) => p.code === code) ||
                      COIN_SHOP_ITEMS.find((c) => c.code === code) || {
                        code,
                        title: `Ưu đãi ${code}`,
                        desc: 'Mã giảm giá đã lưu trong ví cá nhân',
                        tag: 'ĐÃ LƯU',
                        tagBg: '#F5EFEB',
                        tagColor: '#6F4E37',
                        expiry: 'Còn hiệu lực'
                      };
                    return (
                      <View key={code} style={styles.voucherTicketCard}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <View style={styles.ticketTopRow}>
                            <Text style={styles.ticketCodeText}>{found.code}</Text>
                            <View style={[styles.ticketTagBadge, { backgroundColor: found.tagBg || '#F5EFEB' }]}>
                              <Text style={[styles.ticketTagText, { color: found.tagColor || '#6F4E37' }]}>
                                {found.tag || 'KHẢ DỤNG'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.ticketTitle}>{found.title}</Text>
                          <Text style={styles.ticketDesc}>{found.desc}</Text>
                          <Text style={styles.ticketExpiry}>⏳ {found.expiry || 'Hạn dùng: 30 ngày'}</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.useNowBtn}
                          onPress={() => handleUseNow(found.code)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="flash" size={13} color="#FAF7F2" />
                          <Text style={styles.useNowBtnText}>Dùng ngay</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB 2: TODAY'S FLASH PROMOTIONS (ƯU ĐÃI TRONG NGÀY) */}
            {activeTab === 'TODAY' && (
              <View>
                {DAILY_PROMOS.map((item) => {
                  const isSaved = savedVouchers.includes(item.code);
                  return (
                    <View key={item.code} style={styles.voucherTicketCard}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <View style={styles.ticketTopRow}>
                          <Text style={styles.ticketCodeText}>{item.code}</Text>
                          <View style={[styles.ticketTagBadge, { backgroundColor: item.tagBg }]}>
                            <Text style={[styles.ticketTagText, { color: item.tagColor }]}>{item.tag}</Text>
                          </View>
                        </View>
                        <Text style={styles.ticketTitle}>{item.title}</Text>
                        <Text style={styles.ticketDesc}>{item.desc}</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${item.claimedPct}%` }]} />
                          </View>
                          <Text style={styles.progressText}>Đã nhận {item.claimedPct}%</Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        <TouchableOpacity
                          style={[styles.saveBtn, isSaved && styles.saveBtnSaved]}
                          onPress={() => {
                            if (!isSaved && onSaveVoucher) {
                              onSaveVoucher(item.code);
                              showToast(`🎉 Đã thêm ${item.code} vào ví!`);
                            }
                          }}
                          activeOpacity={0.85}
                        >
                          <Ionicons
                            name={isSaved ? 'checkmark-circle' : 'bookmark-outline'}
                            size={13}
                            color={isSaved ? '#FAF7F2' : '#6F4E37'}
                          />
                          <Text style={[styles.saveBtnText, isSaved && styles.saveBtnTextSaved]}>
                            {isSaved ? 'Đã trong ví' : 'Lưu mã'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.quickApplySmallBtn}
                          onPress={() => handleUseNow(item.code)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.quickApplySmallText}>Dùng ngay →</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* TAB 3: ECO COINS REDEMPTION SHOP (CỬA HÀNG ĐỔI XU LẤY VOUCHER) */}
            {activeTab === 'SHOP' && (
              <View>
                <View style={styles.shopInstructionBox}>
                  <Ionicons name="information-circle" size={16} color="#6F4E37" />
                  <Text style={styles.shopInstructionText}>
                    Bạn đang có <Text style={{ fontWeight: '800' }}>{ecoCoins} Xu Eco</Text>. Chọn voucher mong muốn bên dưới để đổi mã ngay lập tức:
                  </Text>
                </View>

                {COIN_SHOP_ITEMS.map((item) => {
                  const canRedeem = ecoCoins >= item.coins;
                  return (
                    <View key={item.code} style={styles.shopItemCard}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <View style={styles.ticketTopRow}>
                          <View style={styles.coinCostPill}>
                            <Text style={styles.coinCostPillEmoji}>🪙</Text>
                            <Text style={styles.coinCostPillVal}>{item.coins} Xu</Text>
                          </View>
                          <View style={[styles.ticketTagBadge, { backgroundColor: item.tagBg }]}>
                            <Text style={[styles.ticketTagText, { color: item.tagColor }]}>{item.tag}</Text>
                          </View>
                        </View>
                        <Text style={styles.ticketTitle}>{item.title}</Text>
                        <Text style={styles.ticketDesc}>{item.desc}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.redeemBtn, !canRedeem && styles.redeemBtnDisabled]}
                        disabled={!canRedeem}
                        onPress={() => handleRedeemCoinVoucher(item)}
                        activeOpacity={0.88}
                      >
                        {canRedeem ? (
                          <>
                            <Ionicons name="gift" size={13} color="#FAF7F2" />
                            <Text style={styles.redeemBtnText}>Đổi ngay</Text>
                          </>
                        ) : (
                          <Text style={styles.redeemBtnDisabledText}>Thiếu {item.coins - ecoCoins} Xu</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {/* TAB 4: EXPIRED / USED HISTORY (ĐÃ SỬ DỤNG / HẾT HẠN) */}
            {activeTab === 'EXPIRED' && (
              <View>
                {EXPIRED_HISTORY_VOUCHERS.map((item) => (
                  <View key={item.code} style={styles.expiredCard}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.ticketTopRow}>
                        <Text style={styles.expiredCodeText}>{item.code}</Text>
                        <View style={styles.expiredTagBadge}>
                          <Text style={styles.expiredTagText}>ĐÃ SỬ DỤNG</Text>
                        </View>
                      </View>
                      <Text style={styles.expiredTitle}>{item.title}</Text>
                      <Text style={styles.expiredDesc}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Footer Tip */}
          <View style={styles.footerTip}>
            <Ionicons name="sparkles" size={13} color="#D4AF37" />
            <Text style={styles.footerTipText}>
              Chạm "Dùng ngay" để tự động áp dụng mã và giảm trừ trực tiếp trên hóa đơn đặt xe.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 18, 12, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FAF7F2',
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative'
  },
  toastBox: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: '#2B180D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  toastText: {
    fontFamily: FONTS.family,
    color: '#FAF7F2',
    fontSize: 11.5,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.2
  },
  headerRow: {
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  title: {
    fontFamily: FONTS.family,
    fontSize: 16.5,
    fontWeight: '800',
    color: '#2B180D',
    marginLeft: 6,
    letterSpacing: -0.2
  },
  subtitle: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#8C7A6B',
    marginTop: 2,
    letterSpacing: 0.1
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EFEB',
    alignItems: 'center',
    justifyContent: 'center'
  },

  /* Balance Card */
  coinsBalanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  coinsLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  coinBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  coinsBalanceVal: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#2B180D',
    letterSpacing: -0.2
  },
  coinsBalanceSub: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#8C7A6B',
    marginTop: 1
  },
  quickShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBE3D7'
  },
  quickShopBtnActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  quickShopBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6F4E37',
    marginLeft: 4,
    letterSpacing: 0.2
  },
  quickShopBtnTextActive: {
    color: '#FAF7F2'
  },

  /* Tabs Row */
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F5EFEB',
    borderBottomWidth: 1,
    borderBottomColor: '#EBE3D7'
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EAE1D4'
  },
  tabBtnActive: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  tabText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#7E6B5C',
    letterSpacing: 0.1
  },
  tabTextActive: {
    color: '#FAF7F2',
    fontWeight: '800'
  },

  scrollList: {
    maxHeight: 380,
    paddingHorizontal: 16,
    paddingTop: 10
  },

  /* Ticket Cards */
  voucherTicketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    borderLeftWidth: 3.5,
    borderLeftColor: '#6F4E37',
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  ticketCodeText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#6F4E37',
    marginRight: 6,
    letterSpacing: 0.8
  },
  ticketTagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6
  },
  ticketTagText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  ticketTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#2B180D',
    marginBottom: 2.5,
    lineHeight: 18,
    letterSpacing: -0.1
  },
  ticketDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6E5D4F',
    lineHeight: 15.5,
    marginBottom: 5
  },
  ticketExpiry: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.1
  },
  useNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E3322',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#2B180D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2
  },
  useNowBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FAF7F2',
    marginLeft: 4,
    letterSpacing: 0.3
  },

  /* Today Tab Extra */
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#EBE3D7',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 6
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2D8A4E',
    borderRadius: 2
  },
  progressText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: '#8C7A6B'
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    marginBottom: 6
  },
  saveBtnSaved: {
    backgroundColor: '#6F4E37',
    borderColor: '#6F4E37'
  },
  saveBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37',
    marginLeft: 3
  },
  saveBtnTextSaved: {
    color: '#FAF7F2'
  },
  quickApplySmallBtn: {
    paddingVertical: 2
  },
  quickApplySmallText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#6F4E37'
  },

  /* Shop Items */
  shopInstructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10
  },
  shopInstructionText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#5C4A3C',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16.5
  },
  shopItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    borderLeftWidth: 3.5,
    borderLeftColor: '#D4AF37'
  },
  coinCostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  coinCostPillEmoji: {
    fontSize: 11,
    marginRight: 3
  },
  coinCostPillVal: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#6F4E37'
  },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4E3322',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  redeemBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FAF7F2',
    marginLeft: 4,
    letterSpacing: 0.2
  },
  redeemBtnDisabled: {
    backgroundColor: '#EBE3D7'
  },
  redeemBtnDisabledText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8C7A6B'
  },

  /* Expired / History */
  expiredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EBE3D7',
    opacity: 0.75
  },
  expiredCodeText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#8C7A6B',
    marginRight: 6,
    letterSpacing: 0.5
  },
  expiredTagBadge: {
    backgroundColor: '#F5EFEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  expiredTagText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8C7A6B',
    letterSpacing: 0.4
  },
  expiredTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#5C4A3C',
    marginTop: 2
  },
  expiredDesc: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#8C7A6B',
    marginTop: 1,
    lineHeight: 15
  },

  /* Empty State */
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16
  },
  emptyStateTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#2B180D',
    marginTop: 8
  },
  emptyStateSub: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#8C7A6B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16.5
  },
  emptyActionBtn: {
    backgroundColor: '#4E3322',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12
  },
  emptyActionText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FAF7F2'
  },

  footerTip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5EFEB',
    borderTopWidth: 1,
    borderTopColor: '#EBE3D7'
  },
  footerTipText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#6F4E37',
    marginLeft: 6,
    flex: 1,
    lineHeight: 15
  }
});
