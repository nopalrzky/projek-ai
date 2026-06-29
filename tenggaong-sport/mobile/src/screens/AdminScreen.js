import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

const TABS = ['Verify PIN', 'Manual Booking', 'History'];

export default function AdminScreen({ initialTab = 'verify' }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab === 'history' ? 'History' : 'Verify PIN');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSub}>{user?.nama || user?.name || 'Kasir'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {activeTab === 'Verify PIN' && <VerifyPinSection />}
        {activeTab === 'Manual Booking' && <ManualBookingSection />}
        {activeTab === 'History' && <HistorySection />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Verify PIN ──────────────────────────────────

function VerifyPinSection() {
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!pin.trim()) { Alert.alert('Error', 'Enter a PIN'); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.verifyPin(pin.trim());
      setResult(res.booking || res.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Verify Booking PIN</Text>
      <View style={styles.pinInputRow}>
        <TextInput
          style={styles.pinInput}
          placeholder="Enter PIN"
          placeholderTextColor={Colors.textMuted}
          value={pin}
          onChangeText={setPin}
          maxLength={6}
          keyboardType="number-pad"
        />
        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Ionicons name="close-circle" size={20} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.resultTitle}>Booking Verified</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Field</Text>
            <Text style={styles.resultValue}>{result.nama_lapangan || result.field_name || result.field?.nama || '-'}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Date</Text>
            <Text style={styles.resultValue}>{result.tanggal || result.date || '-'}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Time</Text>
            <Text style={styles.resultValue}>{result.jam_mulai || result.start_time || '-'}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Customer</Text>
            <Text style={styles.resultValue}>{result.nama_user || result.user_name || result.user?.nama || '-'}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Manual Booking ──────────────────────────────

function ManualBookingSection() {
  const [form, setForm] = useState({ nama: '', field_id: '', tanggal: '', jam_mulai: '', durasi: '1', metode: 'cash' });
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.nama || !form.field_id || !form.tanggal || !form.jam_mulai) {
      Alert.alert('Incomplete', 'Fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.createBooking({
        customer_name: form.nama,
        field_id: Number(form.field_id),
        tanggal: form.tanggal,
        jam_mulai: form.jam_mulai,
        durasi: Number(form.durasi),
        metode_pembayaran: form.metode,
      });
      setPin(res.pin || res.data?.pin || 'N/A');
      Alert.alert('Booking Created', `PIN: ${res.pin || res.data?.pin || 'N/A'}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Manual Booking</Text>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Customer Name</Text>
        <TextInput style={styles.formInput} placeholder="Nama customer" placeholderTextColor={Colors.textMuted}
          value={form.nama} onChangeText={(v) => setForm({ ...form, nama: v })} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Field ID</Text>
        <TextInput style={styles.formInput} placeholder="Field ID number" placeholderTextColor={Colors.textMuted}
          value={form.field_id} onChangeText={(v) => setForm({ ...form, field_id: v })} keyboardType="number-pad" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.formInput} placeholder="2024-06-25" placeholderTextColor={Colors.textMuted}
          value={form.tanggal} onChangeText={(v) => setForm({ ...form, tanggal: v })} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Start Time (HH:MM)</Text>
        <TextInput style={styles.formInput} placeholder="14:00" placeholderTextColor={Colors.textMuted}
          value={form.jam_mulai} onChangeText={(v) => setForm({ ...form, jam_mulai: v })} />
      </View>
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: Spacing.sm }]}>
          <Text style={styles.formLabel}>Duration (h)</Text>
          <TextInput style={styles.formInput} placeholder="1" placeholderTextColor={Colors.textMuted}
            value={form.durasi} onChangeText={(v) => setForm({ ...form, durasi: v })} keyboardType="decimal-pad" />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.formLabel}>Payment</Text>
          <TextInput style={styles.formInput} placeholder="cash" placeholderTextColor={Colors.textMuted}
            value={form.metode} onChangeText={(v) => setForm({ ...form, metode: v })} />
        </View>
      </View>
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Create Booking</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ─── History ─────────────────────────────────────

function HistorySection() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const res = await api.getAllBookings();
          setBookings(res.bookings || res.data || []);
        } catch (e) {
          console.warn(e.message);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />;

  if (bookings.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="time-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No bookings yet</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Booking History ({bookings.length})</Text>
      {bookings.map((b) => (
        <View key={b.id} style={styles.historyCard}>
          <View style={styles.historyTop}>
            <Text style={styles.historyField}>{b.nama_lapangan || b.field_name || 'Field'}</Text>
            <Text style={[styles.historyStatus, { color: b.status === 'active' ? Colors.success : Colors.textMuted }]}>
              {b.status}
            </Text>
          </View>
          <Text style={styles.historyDetail}>{b.tanggal || b.date} • {b.jam_mulai || b.start_time}</Text>
          {b.pin && <Text style={styles.historyPin}>PIN: {b.pin}</Text>}
        </View>
      ))}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { padding: Spacing.sm },
  tabRow: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  tabTextActive: { color: Colors.primary },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md,
  },
  // Verify PIN
  pinInputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  pinInput: {
    flex: 1, backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    height: 50, paddingHorizontal: Spacing.md, color: Colors.text,
    fontSize: FontSize.lg, letterSpacing: 2,
  },
  verifyBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg, justifyContent: 'center',
  },
  verifyBtnText: { color: '#fff', fontWeight: '700' },
  errorCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.danger + '20',
    borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.danger,
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, flex: 1 },
  resultCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.success,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  resultTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.success },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resultLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  resultValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  // Manual Booking
  formGroup: { marginBottom: Spacing.sm },
  formLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: 4 },
  formInput: {
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    height: 46, paddingHorizontal: Spacing.md, color: Colors.text, fontSize: FontSize.md,
  },
  formRow: { flexDirection: 'row' },
  createBtn: {
    backgroundColor: Colors.secondary, borderRadius: BorderRadius.md,
    height: 48, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  // History
  historyCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between' },
  historyField: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  historyStatus: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize' },
  historyDetail: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  historyPin: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700', marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, marginTop: Spacing.sm },
});
