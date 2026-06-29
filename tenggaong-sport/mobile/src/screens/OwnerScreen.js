import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

const SECTION_TABS = ['Overview', 'Fields', 'Bookings', 'Revenue', 'Members'];

export default function OwnerScreen() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [statsRes, fieldsRes, bookingsRes, revRes, membRes] = await Promise.allSettled([
        api.getAdminStats(),
        api.getMyFields(),
        api.getAllBookings(),
        api.getAdminRevenue(),
        api.getMyTiers(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (fieldsRes.status === 'fulfilled') setFields(fieldsRes.value.fields || fieldsRes.value.data || []);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.bookings || bookingsRes.value.data || []);
      if (revRes.status === 'fulfilled') setRevenue(revRes.value);
      if (membRes.status === 'fulfilled') setMembers(membRes.value.tiers || membRes.value.data || []);
    } catch (e) {
      console.warn('Owner load error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { loadAll(); }, [loadAll])
  );

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'Overview': return <OverviewSection stats={stats} bookings={bookings} />;
      case 'Fields': return <FieldsSection fields={fields} />;
      case 'Bookings': return <BookingsSection bookings={bookings} />;
      case 'Revenue': return <RevenueSection revenue={revenue} />;
      case 'Members': return <MembersSection members={members} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Owner Dashboard</Text>
          <Text style={styles.headerSub}>{user?.nama || user?.name || 'Owner'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Section Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabRow}>
          {SECTION_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeSection === tab && styles.tabActive]}
              onPress={() => setActiveSection(tab)}
            >
              <Text style={[styles.tabText, activeSection === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Overview ────────────────────────────────────

function OverviewSection({ stats, bookings }) {
  const totalBookings = bookings?.length || 0;
  const activeBookings = bookings?.filter((b) => b.status === 'active' || b.status === 'confirmed').length || 0;

  return (
    <View>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="calendar" label="Total Bookings" value={String(totalBookings)} color={Colors.primary} />
        <StatCard icon="checkmark-circle" label="Active" value={String(activeBookings)} color={Colors.success} />
        <StatCard icon="cash" label="Revenue" value={stats?.total_revenue ? `Rp${Number(stats.total_revenue).toLocaleString('id-ID')}` : '-'} color={Colors.secondary} />
        <StatCard icon="people" label="Customers" value={String(stats?.total_customers || stats?.total_users || 0)} color={Colors.accent} />
      </View>
      <StatCard icon="football" label="Total Fields" value={String(stats?.total_fields || 0)} color={Colors.warning} style={{ marginTop: Spacing.sm }} />
    </View>
  );
}

function StatCard({ icon, label, value, color, style }) {
  return (
    <View style={[styles.statCard, style]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Fields ──────────────────────────────────────

function FieldsSection({ fields }) {
  if (fields.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="football-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No fields registered</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>My Fields ({fields.length})</Text>
      {fields.map((f) => (
        <View key={f.id} style={styles.fieldCard}>
          <View style={styles.fieldIcon}>
            <Ionicons name="football" size={24} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldName}>{f.nama || f.name}</Text>
            <Text style={styles.fieldDesc}>{f.olahraga || f.sport_name || 'Sport'}{f.harga ? ` • Rp${Number(f.harga).toLocaleString('id-ID')}` : ''}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Bookings ────────────────────────────────────

function BookingsSection({ bookings }) {
  if (bookings.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="calendar-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No bookings</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>All Bookings ({bookings.length})</Text>
      {bookings.slice(0, 20).map((b) => (
        <View key={b.id} style={styles.bookingCard}>
          <View style={styles.bookingTop}>
            <Text style={styles.bookingField}>{b.nama_lapangan || b.field_name || 'Field'}</Text>
            <Text style={[styles.bookingStatus, { color: b.status === 'active' ? Colors.success : Colors.textMuted }]}>
              {b.status}
            </Text>
          </View>
          <Text style={styles.bookingDetail}>{b.tanggal || b.date} • {b.jam_mulai || b.start_time}</Text>
          {b.pin && <Text style={styles.bookingPin}>PIN: {b.pin}</Text>}
        </View>
      ))}
    </View>
  );
}

// ─── Revenue ─────────────────────────────────────

function RevenueSection({ revenue }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Revenue</Text>
      <View style={styles.revenueCard}>
        <Ionicons name="cash" size={32} color={Colors.secondary} />
        <Text style={styles.revenueAmount}>
          {revenue?.total_revenue
            ? `Rp ${Number(revenue.total_revenue).toLocaleString('id-ID')}`
            : 'Rp 0'}
        </Text>
        <Text style={styles.revenueLabel}>Total Revenue</Text>
      </View>
      {revenue?.details && (
        <View style={styles.revenueDetails}>
          {Object.entries(revenue.details).map(([key, val]) => (
            <View key={key} style={styles.revenueRow}>
              <Text style={styles.revenueRowLabel}>{key}</Text>
              <Text style={styles.revenueRowValue}>Rp {Number(val).toLocaleString('id-ID')}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Members ─────────────────────────────────────

function MembersSection({ members }) {
  if (!members || members.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No membership data</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Membership Tiers</Text>
      {members.map((m) => (
        <View key={m.id} style={styles.memberCard}>
          <Ionicons name="diamond" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{m.nama || m.name}</Text>
            {m.harga && <Text style={styles.memberPrice}>Rp {Number(m.harga).toLocaleString('id-ID')}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { padding: Spacing.sm },
  tabScroll: { backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  tabTextActive: { color: Colors.primary },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md,
  },
  // Overview
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    width: '48%',
  },
  statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: FontSize.lg, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  // Fields
  fieldCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  fieldIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center' },
  fieldName: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  fieldDesc: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  // Bookings
  bookingCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between' },
  bookingField: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  bookingStatus: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize' },
  bookingDetail: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  bookingPin: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700', marginTop: 2 },
  // Revenue
  revenueCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.secondary,
    marginBottom: Spacing.md,
  },
  revenueAmount: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.secondary, marginTop: Spacing.sm },
  revenueLabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  revenueDetails: {},
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  revenueRowLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  revenueRowValue: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  // Members
  memberCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  memberName: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  memberPrice: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700', marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, marginTop: Spacing.sm },
});
