import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

const statusColors = {
  active: Colors.success,
  confirmed: Colors.primary,
  pending: Colors.warning,
  completed: Colors.textMuted,
  cancelled: Colors.danger,
};

export default function MyBookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const res = await api.getMyBookings();
      setBookings(res.bookings || res.data || []);
    } catch (e) {
      console.warn('Failed to load bookings:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderBooking = ({ item }) => {
    const status = (item.status || 'active').toLowerCase();
    const color = statusColors[status] || Colors.textMuted;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text style={styles.fieldName}>{item.nama_lapangan || item.field_name || item.field?.nama || 'Field'}</Text>
            <Text style={styles.fieldSport}>
              {item.nama_olahraga || item.sport_name || 'Sport'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.tanggal || item.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {item.jam_mulai || item.start_time} • {item.durasi || item.duration}h
          </Text>
        </View>

        {item.pin && (
          <View style={styles.pinRow}>
            <Ionicons name="key-outline" size={16} color={Colors.primary} />
            <Text style={styles.pinLabel}>PIN:</Text>
            <Text style={styles.pinValue}>{item.pin}</Text>
          </View>
        )}

        {item.harga && (
          <Text style={styles.price}>
            Rp {Number(item.harga).toLocaleString('id-ID')}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySub}>Book a field to see it here</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  cardLeft: { flex: 1 },
  fieldName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  fieldSport: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  badge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  detailText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  pinRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: 4 },
  pinLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  pinValue: {
    color: Colors.primary, fontSize: FontSize.md, fontWeight: '800',
    letterSpacing: 2,
  },
  price: {
    color: Colors.success, fontSize: FontSize.md, fontWeight: '700',
    marginTop: Spacing.sm,
  },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600', marginTop: Spacing.md },
  emptySub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
});
