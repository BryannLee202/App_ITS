import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FONTS } from '../styles/theme';
import ApiService from '../services/api';

const QUICK_PROMPTS_VI = [
  'Gia đình 4–5 người đi Vũng Tàu cuối tuần tiết kiệm',
  'Xe ô tô điện nhỏ gọn đi trong phố dưới 70k/giờ',
  'Xe hạng sang VIP đón đối tác sân bay Tân Sơn Nhất',
  'Xe máy điện pin khỏe đi làm hàng ngày'
];

const QUICK_PROMPTS_EN = [
  'Family of 4–5 weekend trip to Vung Tau on a budget',
  'Compact city EV under 70k/hour',
  'Luxury VIP car for airport executive pickup',
  'Long-range e-scooter for daily commuting'
];

export default function AiConciergeModal({
  visible,
  onClose,
  vehicles = [],
  onSelectVehicleWithVoucher,
  language = 'vi'
}) {
  const isEn = language === 'en';
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const buildLocalRecommendation = (text) => {
    const q = (text || '').toLowerCase();
    let category = 'CAR';
    let voucher = 'BANMOI30';
    let reason = isEn
      ? 'Matched compact urban EV with lowest hourly rate and 90%+ battery at Landmark Hub.'
      : 'Đề xuất dòng xe đô thị nhỏ gọn, chi phí tối ưu nhất và mức pin trên 90% tại trạm gần bạn.';
    let chargingPlan = isEn
      ? 'No charging stop needed for trips under 220km (V-Green 250kW available on route).'
      : 'Pin đủ đi 220km không cần sạc dọc đường (có sẵn trạm V-Green 250kW trên lộ trình).';

    if (q.includes('vũng tàu') || q.includes('gia đình') || q.includes('cuối tuần') || q.includes('family') || q.includes('weekend')) {
      category = 'CAR';
      voucher = 'PHUOT100K';
      reason = isEn
        ? 'Selected spacious 5-seat electric SUV with Highway Assist and 350km+ range for weekend roadtrips.'
        : 'Đề xuất SUV điện 5 chỗ rộng rãi, hỗ trợ lái cao tốc ADAS và tầm hoạt động trên 350km cho chuyến đi cuối tuần.';
      chargingPlan = isEn
        ? '1 fast-charging stop (15 mins) at V-Green Long Thanh Rest Stop (250kW DC).'
        : 'Gợi ý 1 điểm sạc siêu nhanh 15 phút tại Trạm dừng nghỉ V-Green Long Thành (250kW DC).';
    } else if (q.includes('sang') || q.includes('vip') || q.includes('đối tác') || q.includes('luxury') || q.includes('airport')) {
      category = 'LUXURY';
      voucher = 'PRIME50K';
      reason = isEn
        ? 'Matched flagship executive sedan/SUV with chauffeur-grade rear cabin and 0đ deposit waiver.'
        : 'Đề xuất phân khúc Hạng sang VIP khoang thương gia, miễn 100% cọc và giao xe tận sảnh.';
    } else if (q.includes('xe máy') || q.includes('đi làm') || q.includes('scooter') || q.includes('commut')) {
      category = 'MOTORBIKE';
      voucher = 'ECOGO20';
      reason = isEn
        ? 'Selected high-capacity LFP battery e-scooter with unlimited battery swapping at 10 EcoGo Hubs.'
        : 'Đề xuất xe máy điện pin LFP dung lượng cao, miễn phí đổi pin nhanh tại 10 trạm EcoGo Hub.';
    }

    const pool = vehicles.filter((v) => v.category === category);
    const picked =
      (q.includes('vũng tàu') || q.includes('gia đình') || q.includes('family')
        ? pool.find((v) => v.seats >= 5 && (v.hourlyPrice || 0) >= 75000)
        : pool[0]) ||
      vehicles[0];

    return {
      summary: reason,
      chargingPlan,
      voucherCode: voucher,
      vehicle: picked
    };
  };

  const handleAskAi = async (promptText) => {
    const finalQuery = (promptText || query).trim();
    if (!finalQuery) return;
    setQuery(finalQuery);
    setLoading(true);
    try {
      const baseUrl = ApiService.getBaseUrl ? ApiService.getBaseUrl() : '/api';
      const res = await fetch(`${baseUrl}/ops/ai-concierge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalQuery, language })
      });
      if (res.ok) {
        const data = await res.json();
        const matchedVeh =
          vehicles.find((v) => v.id === data.vehicleId) ||
          buildLocalRecommendation(finalQuery).vehicle;
        setAiResult({
          summary: data.summary,
          chargingPlan: data.chargingPlan,
          voucherCode: data.voucherCode || 'BANMOI30',
          vehicle: matchedVeh
        });
      } else {
        setAiResult(buildLocalRecommendation(finalQuery));
      }
    } catch (e) {
      setAiResult(buildLocalRecommendation(finalQuery));
    } finally {
      setLoading(false);
    }
  };

  const prompts = isEn ? QUICK_PROMPTS_EN : QUICK_PROMPTS_VI;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerBanner}>
            <View style={styles.headerTopRow}>
              <View style={styles.aiBadgePill}>
                <Ionicons name="sparkles" size={12} color="#D4AF37" />
                <Text style={styles.aiBadgeText}>ECOGO AI CONCIERGE</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#FAF7F2" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>
              {isEn ? 'Smart Trip & Vehicle Advisor' : 'Trợ lý AI Tư vấn Xe & Lộ trình'}
            </Text>
            <Text style={styles.headerSub}>
              {isEn
                ? 'Describe your trip to get instant vehicle, charging & voucher matching'
                : 'Mô tả nhu cầu chuyến đi để AI chọn sẵn xe, trạm sạc và mã giảm giá tối ưu nhất'}
            </Text>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Input Box */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={query}
                onChangeText={setQuery}
                placeholder={
                  isEn
                    ? 'E.g. 5-seat EV for weekend trip to Da Lat...'
                    : 'VD: Tìm xe 5 chỗ đi Vũng Tàu cuối tuần tiết kiệm...'
                }
                placeholderTextColor="#9C8B7E"
                onSubmitEditing={() => handleAskAi(query)}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                activeOpacity={0.85}
                onPress={() => handleAskAi(query)}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#2B180D" />
                ) : (
                  <Ionicons name="arrow-up" size={18} color="#2B180D" />
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Suggestion Chips */}
            <Text style={styles.sectionLabel}>
              {isEn ? 'QUICK SCENARIOS' : 'GỢI Ý NHU CẦU PHỔ BIẾN'}
            </Text>
            <View style={styles.chipsWrap}>
              {prompts.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptChip}
                  activeOpacity={0.8}
                  onPress={() => handleAskAi(item)}
                >
                  <Ionicons name="sparkles-outline" size={12} color="#6F4E37" />
                  <Text style={styles.promptChipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* AI Recommendation Result Card */}
            {aiResult && aiResult.vehicle && (
              <View style={styles.resultBox}>
                <View style={styles.resultHeaderRow}>
                  <MaterialCommunityIcons name="robot-excited-outline" size={18} color="#B45309" />
                  <Text style={styles.resultHeaderTitle}>
                    {isEn ? 'AI Optimal Match' : 'Đề xuất tối ưu từ EcoGo AI'}
                  </Text>
                  <View style={styles.voucherTag}>
                    <Text style={styles.voucherTagText}>Mã: {aiResult.voucherCode}</Text>
                  </View>
                </View>

                <Text style={styles.resultSummary}>{aiResult.summary}</Text>

                <View style={styles.chargePlanRow}>
                  <Ionicons name="flash" size={14} color="#15803D" />
                  <Text style={styles.chargePlanText}>{aiResult.chargingPlan}</Text>
                </View>

                {/* Matched Vehicle Preview */}
                <View style={styles.vehPreviewCard}>
                  <Image
                    source={{ uri: aiResult.vehicle.thumbnail || aiResult.vehicle.images?.[0] }}
                    style={styles.vehThumb}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.vehName} numberOfLines={1}>
                      {aiResult.vehicle.name}
                    </Text>
                    <Text style={styles.vehMeta}>
                      Pin {aiResult.vehicle.batteryLevel || 94}% · {aiResult.vehicle.rangeKm || 320} km
                    </Text>
                    <Text style={styles.vehPrice}>
                      {(aiResult.vehicle.hourlyPrice || 75000).toLocaleString('vi-VN')}đ/h
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.bookNowBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    onClose();
                    if (onSelectVehicleWithVoucher) {
                      onSelectVehicleWithVoucher(aiResult.vehicle, aiResult.voucherCode);
                    }
                  }}
                >
                  <Text style={styles.bookNowBtnText}>
                    {isEn
                      ? `Book ${aiResult.vehicle.name} with ${aiResult.voucherCode} →`
                      : `Đặt ngay ${aiResult.vehicle.name} (Áp mã ${aiResult.voucherCode}) →`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
    maxWidth: 385,
    maxHeight: '88%',
    backgroundColor: '#FAF7F2',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5DDD3'
  },
  headerBanner: {
    backgroundColor: '#2B180D',
    padding: 18
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  aiBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.45)'
  },
  aiBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE68A',
    letterSpacing: 0.6
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.76)',
    marginTop: 3,
    lineHeight: 16
  },
  bodyScroll: {
    padding: 16
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#DFD0C0',
    marginBottom: 14
  },
  textInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#2B180D',
    paddingVertical: 6
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  sectionLabel: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6F4E37',
    letterSpacing: 0.6,
    marginBottom: 8
  },
  chipsWrap: {
    gap: 7,
    marginBottom: 14
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFE7DF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2D4C5'
  },
  promptChipText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#4E3322'
  },
  resultBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F2D785',
    marginBottom: 10
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  resultHeaderTitle: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E'
  },
  voucherTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37'
  },
  voucherTagText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E'
  },
  resultSummary: {
    fontFamily: FONTS.family,
    fontSize: 12,
    lineHeight: 17,
    color: '#4E3322',
    marginBottom: 8
  },
  chargePlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F2EB',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 10
  },
  chargePlanText: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#1E5631'
  },
  vehPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EAE2D7',
    marginBottom: 10
  },
  vehThumb: {
    width: 68,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3EEE7'
  },
  vehName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#2B180D'
  },
  vehMeta: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 1
  },
  vehPrice: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 2
  },
  bookNowBtn: {
    backgroundColor: '#4E3322',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bookNowBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF'
  }
});
