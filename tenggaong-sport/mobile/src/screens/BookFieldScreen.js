import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Modal, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

const TIME_SLOTS = [
  { label: '08:00', value: '08:00' }, { label: '09:00', value: '09:00' },
  { label: '10:00', value: '10:00' }, { label: '11:00', value: '11:00' },
  { label: '12:00', value: '12:00' }, { label: '13:00', value: '13:00' },
  { label: '14:00', value: '14:00' }, { label: '15:00', value: '15:00' },
  { label: '16:00', value: '16:00' }, { label: '17:00', value: '17:00' },
  { label: '18:00', value: '18:00' }, { label: '19:00', value: '19:00' },
  { label: '20:00', value: '20:00' }, { label: '21:00', value: '21:00' },
];

const DURATIONS = [1, 1.5, 2];
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'cash-outline' },
  { id: 'transfer', label: 'Transfer', icon: 'phone-portrait-outline' },
  { id: 'qris', label: 'QRIS', icon: 'qr-code-outline' },
];

export default function BookFieldScreen({ route, navigation }) {
  const { field, sport } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [bookingPin, setBookingPin] = useState('');

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('id-ID', { month: 'short' }),
      full: d.toISOString().split('T')[0],
    };
  });

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Incomplete', 'Please select date and time slot');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        field_id: field.id,
        tanggal: selectedDate,
        jam_mulai: selectedTime,
        durasi: duration,
        metode_pembayaran: paymentMethod,
      };
      const res = await api.createBooking(payload);
      const pin = res.pin || res.data?.pin || res.booking?.pin || 'N/A';
      setBookingPin(String(pin));
      setPinModal(true);
    } catch (e) {
      Alert.alert('Booking Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Book Field</Text>
          <Text style={styles.headerSub}>{field?.nama || field?.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Date Picker */}
        <Text style={styles.sectionLabel}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
          {dates.map((d) => {
            const active = selectedDate === d.full;
            return (
              <TouchableOpacity
                key={d.full}
                style={[styles.dateCard, active && styles.dateCardActive]}
                onPress={() => setSelectedDate(d.full)}
              >
                <Text style={[styles.dateDay, active && styles.dateTextActive]}>{d.label}</Text>
                <Text style={[styles.dateNum, active && styles.dateTextActive]}>{d.day}</Text>
                <Text style={[styles.dateMonth, active && styles.dateTextActive]}>{d.month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slots */}
        <Text style={styles.sectionLabel}>Time Slot</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.filter((_, i) => i < 14).map((t) => {
            const active = selectedTime === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[styles.timeSlot, active && styles.timeSlotActive]}
                onPress={() => setSelectedTime(t.value)}
              >
                <Text style={[styles.timeText, active && styles.timeTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Duration */}
        <Text style={styles.sectionLabel}>Duration (hours)</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => {
            const active = duration === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.durBtn, active && styles.durBtnActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durText, active && styles.durTextActive]}>{d}h</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionLabel}>Payment Method</Text>
        <View style={styles.payRow}>
          {PAYMENT_METHODS.map((p) => {
            const active = paymentMethod === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.payBtn, active && styles.payBtnActive]}
                onPress={() => setPaymentMethod(p.id)}
              >
                <Ionicons name={p.icon} size={20} color={active ? '#fff' : Colors.textSecondary} />
                <Text style={[styles.payText, active && styles.payTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Summary */}
        {field?.harga && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Price</Text>
            <Text style={styles.summaryPrice}>
              Rp {(Number(field.harga) * duration).toLocaleString('id-ID')}
            </Text>
            <Text style={styles.summaryDetail}>
              Rp {Number(field.harga).toLocaleString('id-ID')} × {duration} jam
            </Text>
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity
          style={[styles.bookBtn, loading && styles.bookBtnDisabled]}
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* PIN Modal */}
      <Modal visible={pinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            </View>
            <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            <Text style={styles.modalSub}>Your booking PIN</Text>
            <Text style={styles.pinDisplay}>{bookingPin}</Text>
            <Text style={styles.pinNote}>Show this PIN at the venue</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setPinModal(false);
                navigation.navigate('CustomerMain', { screen: 'Bookings' });
              }}
            >
              <Text style={styles.modalBtnText}>View My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.sm, marginRight: Spacing.sm },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.md,
  },
  dateRow: { marginBottom: Spacing.sm },
  dateCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    alignItems: 'center', marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
    minWidth: 64,
  },
  dateCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  dateDay: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  dateNum: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, marginVertical: 2 },
  dateMonth: { fontSize: FontSize.xs, color: Colors.textMuted },
  dateTextActive: { color: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  timeSlot: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, minWidth: 70, alignItems: 'center',
  },
  timeSlotActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  timeText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  timeTextActive: { color: '#fff' },
  durationRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  durBtn: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  durBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  durText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  durTextActive: { color: '#fff' },
  payRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  payBtn: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  payBtnActive: { borderColor: Colors.secondary, backgroundColor: Colors.bgInput },
  payText: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  payTextActive: { color: Colors.secondary },
  summaryCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.md,
  },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  summaryPrice: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary, marginTop: 2 },
  summaryDetail: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  bookBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    height: 52, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.lg,
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl,
    padding: Spacing.xl, marginHorizontal: Spacing.xl, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border, width: '85%',
  },
  modalIconCircle: { marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.xs },
  modalSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  pinDisplay: {
    fontSize: FontSize.title, fontWeight: '900', color: Colors.primary,
    letterSpacing: 8, marginVertical: Spacing.md,
  },
  pinNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.lg },
  modalBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl,
  },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
});
