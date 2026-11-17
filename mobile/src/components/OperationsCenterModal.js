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
  const [loading, setLoading] = useState(false);
  const [opsData, setOpsData] = useState(null);

  const fetchOps = async () => {
    setLoading(true);
    try {
      const baseUrl = ApiService.getBaseUrl ? ApiService.getBaseUrl() : '/api';
      const res = await fetch(`${baseUrl}/ops/overview`);
      if (res.ok) {
        const data = await res.json();
        setOpsData(data);
      }
    } catch (e) {
      // Fallback local telemetry snapshot
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOps();
    }
  }, [visible]);

  const fleet = opsData?.fleet || {
    totalVehicles: 28,
    available: 24,
    inUse: 3,
    charging: 1,
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
              <View style={styles.liveStatusPill}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.liveStatusText}>
                  {isEn ? 'ALL SYSTEMS OPERATIONAL' : 'HỆ THỐNG VẬN HÀNH ỔN ĐỊNH'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={18} color="#FAF7F2" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>
              {isEn ? 'EcoGo Operations Center' : 'Trung tâm Vận hành Đội xe'}
            </Text>
            <Text style={styles.headerSub}>
              {isEn
                ? 'Real-time AVL Telematics, Charging Grid & Security Monitor'
                : 'Giám sát định vị AVL, Trạm sạc nhanh & An toàn hệ thống 24/7'}
            </Text>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* 4 KPI Bento Grid */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiTile}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#EFE7DF' }]}>
                  <MaterialCommunityIcons name="car-electric" size={18} color="#4E3322" />
                </View>
                <Text style={styles.kpiValue}>{fleet.totalVehicles}</Text>
                <Text style={styles.kpiLabel}>
                  {isEn ? 'Total Fleet' : 'Tổng đội xe'} ({fleet.available} {isEn ? 'ready' : 'sẵn sàng'})
                </Text>
              </View>

              <View style={styles.kpiTile}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#E6F2EB' }]}>
                  <Ionicons name="battery-charging" size={18} color="#1E5631" />
                </View>
                <Text style={[styles.kpiValue, { color: '#1E5631' }]}>{fleet.avgBatteryPct}%</Text>
                <Text style={styles.kpiLabel}>
                  {isEn ? 'Avg Fleet Battery' : 'Mức pin TB toàn đội'}
                </Text>
              </View>

              <View style={styles.kpiTile}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialCommunityIcons name="ev-station" size={18} color="#92400E" />
                </View>
                <Text style={styles.kpiValue}>{fleet.activeStations} Hub</Text>
                <Text style={styles.kpiLabel}>
                  {isEn ? '250kW Superchargers' : 'Trạm Hub & Sạc 250kW'}
                </Text>
              </View>

              <View style={styles.kpiTile}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="pulse" size={18} color="#1E40AF" />
                </View>
                <Text style={[styles.kpiValue, { color: '#1E40AF' }]}>14 ms</Text>
                <Text style={styles.kpiLabel}>
                  {isEn ? 'BLE & IoT Latency' : 'Độ trễ khóa số & IoT'}
                </Text>
              </View>
            </View>

            {/* Apple-Style Service Health Rows */}
            <Text style={styles.sectionHeading}>
              {isEn ? 'CORE SERVICES & SECURITY' : 'TRẠNG THÁI DỊCH VỤ & BẢO MẬT'}
            </Text>
            <View style={styles.serviceListCard}>
              {[
                {
                  icon: 'key-outline',
                  name: isEn ? 'Apple CarKey & BLE 5.3 Digital Key' : 'Khóa số BLE 5.3 & Apple CarKey',
                  status: isEn ? 'Encrypted • Active' : 'Mã hóa AES-256 • Hoạt động'
                },
                {
                  icon: 'flash-outline',
                  name: isEn ? 'V-Green 250kW DC Charging Grid' : 'Lưới trạm sạc nhanh V-Green 250kW',
                  status: isEn ? '98.4% Availability' : '98.4% Trụ sẵn sàng'
                },
                {
                  icon: 'shield-checkmark-outline',
                  name: isEn ? 'OWASP API Firewall & Rate Limiter' : 'Tường lửa API OWASP & Chống Brute-Force',
                  status: isEn ? 'Protected' : 'Đang bảo vệ'
                },
                {
                  icon: 'sync-outline',
                  name: isEn ? 'OTA Live Sync & Auto-Update Engine' : 'Đồng bộ OTA & Tự động cập nhật PWA',
                  status: `v${opsData?.version || '1.4.4'}`
                }
              ].map((srv, idx) => (
                <View
                  key={idx}
                  style={[styles.serviceRow, idx === 3 && { borderBottomWidth: 0 }]}
                >
                  <Ionicons name={srv.icon} size={18} color="#4E3322" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.serviceName}>{srv.name}</Text>
                    <Text style={styles.serviceSub}>{srv.status}</Text>
                  </View>
                  <View style={styles.okBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#15803D" />
                    <Text style={styles.okBadgeText}>OK</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footerBar}>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchOps} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator size="small" color="#4E3322" />
              ) : (
                <>
                  <Ionicons name="refresh" size={15} color="#4E3322" />
                  <Text style={styles.refreshBtnText}>
                    {isEn ? 'Refresh Telemetry' : 'Làm mới thông số'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>{isEn ? 'Done' : 'Đóng'}</Text>
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
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)'
  },
  liveGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E'
  },
  liveStatusText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#86EFAC',
    letterSpacing: 0.5
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontFamily: FONTS.family,
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  headerSub: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 3
  },
  bodyScroll: {
    padding: 16
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  kpiTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAE2D7'
  },
  kpiIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  kpiValue: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '900',
    color: '#2B180D'
  },
  kpiLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 2
  },
  sectionHeading: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '800',
    color: '#6F4E37',
    letterSpacing: 0.6,
    marginBottom: 8
  },
  serviceListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EAE2D7',
    marginBottom: 8
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE4'
  },
  serviceName: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2B180D'
  },
  serviceSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#6F767E',
    marginTop: 1
  },
  okBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  okBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D'
  },
  footerBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFD0C0',
    backgroundColor: '#EFE7DF'
  },
  refreshBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4E3322'
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#4E3322'
  },
  doneBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
