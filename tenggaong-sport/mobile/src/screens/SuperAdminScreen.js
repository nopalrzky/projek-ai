import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, SafeAreaView, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

const TABS = ['Overview', 'Users', 'Owners & Kasir', 'Bookings', 'Revenue'];

export default function SuperAdminScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [statsRes, usersRes, bookingsRes, revRes] = await Promise.allSettled([
        api.getSystemStats(),
        api.getUsers(),
        api.getAllBookingsAdmin(),
        api.getSystemRevenue(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.users || usersRes.value.data || []);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.bookings || bookingsRes.value.data || []);
      if (revRes.status === 'fulfilled') setRevenue(revRes.value);
    } catch (e) {
      console.warn('Superadmin load error:', e.message);
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

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab stats={stats} bookings={bookings} />;
      case 'Users': return <UsersTab users={users} loadAll={loadAll} />;
      case 'Owners & Kasir': return <OwnersKasirTab loadAll={loadAll} />;
      case 'Bookings': return <BookingsTab bookings={bookings} />;
      case 'Revenue': return <RevenueTab revenue={revenue} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Superadmin</Text>
          <Text style={styles.headerSub}>Full system control</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
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
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        keyboardShouldPersistTaps="handled"
      >
        {renderTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Overview ────────────────────────────────────

function OverviewTab({ stats, bookings }) {
  const totalBookings = bookings?.length || 0;
  const activeBookings = bookings?.filter((b) => b.status === 'active' || b.status === 'confirmed').length || 0;

  const cards = [
    { icon: 'people', label: 'Total Users', value: String(stats?.total_users || stats?.users || 0), color: Colors.primary },
    { icon: 'football', label: 'Total Fields', value: String(stats?.total_fields || stats?.fields || 0), color: Colors.secondary },
    { icon: 'calendar', label: 'Total Bookings', value: String(totalBookings), color: Colors.accent },
    { icon: 'checkmark-circle', label: 'Active Bookings', value: String(activeBookings), color: Colors.success },
    { icon: 'cash', label: 'Total Revenue', value: stats?.total_revenue ? `Rp${Number(stats.total_revenue).toLocaleString('id-ID')}` : '-', color: Colors.warning },
    { icon: 'trophy', label: 'Membership Tiers', value: String(stats?.total_tiers || stats?.tiers || 0), color: Colors.primaryLight },
  ];

  return (
    <View>
      <Text style={styles.sectionTitle}>System Overview</Text>
      <View style={styles.statsGrid}>
        {cards.map((c) => (
          <View key={c.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: c.color + '20' }]}>
              <Ionicons name={c.icon} size={22} color={c.color} />
            </View>
            <Text style={[styles.statValue, { color: c.color }]}>{c.value}</Text>
            <Text style={styles.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Users ───────────────────────────────────────

function UsersTab({ users, loadAll }) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? users.filter((u) =>
        (u.nama || u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleRoleChange = (userId, newRole) => {
    Alert.alert('Change Role', `Set user to ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Change',
        onPress: async () => {
          try {
            await api.updateUserRole(userId, newRole);
            Alert.alert('Success', `User role updated to ${newRole}`);
            loadAll();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleDelete = (userId) => {
    Alert.alert('Delete User', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteUser(userId);
            Alert.alert('Deleted', 'User has been removed');
            loadAll();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const roleColors = {
    superadmin: Colors.accent,
    owner: Colors.primary,
    admin: Colors.secondary,
    customer: Colors.textMuted,
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Users ({filtered.length})</Text>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.map((u) => (
        <View key={u.id} style={styles.userCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{u.nama || u.name || 'User'}</Text>
            <Text style={styles.userEmail}>{u.email || '-'}</Text>
            <View style={styles.roleBadge}>
              <Text style={[styles.roleText, { color: roleColors[u.role] || Colors.textMuted }]}>
                {u.role}
              </Text>
            </View>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleRoleChange(u.id, u.role === 'customer' ? 'owner' : 'customer')}
            >
              <Ionicons name="swap-horizontal" size={18} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnDanger} onPress={() => handleDelete(u.id)}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Owners & Kasir ──────────────────────────────

function OwnersKasirTab({ loadAll }) {
  const [form, setForm] = useState({ name: '', email: '', password: 'password', type: 'owner' });

  const handleCreate = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Incomplete', 'Fill name and email');
      return;
    }
    try {
      if (form.type === 'owner') {
        await api.createOwner({ nama: form.name, email: form.email, password: form.password });
      } else {
        await api.createKasir({ nama: form.name, email: form.email, password: form.password });
      }
      Alert.alert('Success', `${form.type} account created`);
      setForm({ name: '', email: '', password: 'password', type: 'owner' });
      loadAll();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Create Account</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, form.type === 'owner' && styles.typeBtnActive]}
          onPress={() => setForm({ ...form, type: 'owner' })}
        >
          <Ionicons name="business-outline" size={18} color={form.type === 'owner' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.typeBtnText, form.type === 'owner' && { color: '#fff' }]}>Owner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, form.type === 'kasir' && styles.typeBtnActive]}
          onPress={() => setForm({ ...form, type: 'kasir' })}
        >
          <Ionicons name="person-outline" size={18} color={form.type === 'kasir' ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.typeBtnText, form.type === 'kasir' && { color: '#fff' }]}>Kasir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Name</Text>
        <TextInput style={styles.formInput} placeholder="Full name" placeholderTextColor={Colors.textMuted}
          value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Email</Text>
        <TextInput style={styles.formInput} placeholder="Email address" placeholderTextColor={Colors.textMuted}
          value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} autoCapitalize="none" keyboardType="email-address" />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Password</Text>
        <TextInput style={styles.formInput} placeholder="Password" placeholderTextColor={Colors.textMuted}
          value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
      </View>
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnText}>Create {form.type === 'owner' ? 'Owner' : 'Kasir'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Bookings ────────────────────────────────────

function BookingsTab({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="calendar-outline" size={40} color={Colors.textMuted} />
        <Text style={styles.emptyText}>No bookings found</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>All Bookings ({bookings.length})</Text>
      {bookings.map((b) => (
        <View key={b.id} style={styles.bookingCard}>
          <View style={styles.bookingTop}>
            <Text style={styles.bookingField}>{b.nama_lapangan || b.field_name || 'Field'}</Text>
            <Text style={[styles.bookingStatus, { color: b.status === 'active' ? Colors.success : Colors.textMuted }]}>
              {b.status}
            </Text>
          </View>
          <Text style={styles.bookingDetail}>{b.tanggal || b.date} • {b.jam_mulai || b.start_time} ({b.durasi || b.duration}h)</Text>
          <Text style={styles.bookingCustomer}>{b.nama_user || b.user_name || b.user?.nama || '-'}</Text>
          {b.pin && <Text style={styles.bookingPin}>PIN: {b.pin}</Text>}
          {b.harga && <Text style={styles.bookingPrice}>Rp {Number(b.harga).toLocaleString('id-ID')}</Text>}
        </View>
      ))}
    </View>
  );
}

// ─── Revenue ─────────────────────────────────────

function RevenueTab({ revenue }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Revenue Overview</Text>
      <View style={styles.revenueCard}>
        <Ionicons name="cash" size={40} color={Colors.secondary} />
        <Text style={styles.revenueAmount}>
          {revenue?.total_revenue
            ? `Rp ${Number(revenue.total_revenue).toLocaleString('id-ID')}`
            : 'Rp 0'}
        </Text>
        <Text style={styles.revenueLabel}>Total System Revenue</Text>
      </View>

      {revenue?.by_owner && (
        <View style={{ marginTop: Spacing.lg }}>
          <Text style={styles.sectionTitle}>Per Owner</Text>
          {Object.entries(revenue.by_owner).map(([owner, amount]) => (
            <View key={owner} style={styles.revenueRow}>
              <Text style={styles.revenueRowLabel}>{owner}</Text>
              <Text style={styles.revenueRowValue}>Rp {Number(amount).toLocaleString('id-ID')}</Text>
            </View>
          ))}
        </View>
      )}

      {revenue?.by_sport && (
        <View style={{ marginTop: Spacing.lg }}>
          <Text style={styles.sectionTitle}>Per Sport</Text>
          {Object.entries(revenue.by_sport).map(([sport, amount]) => (
            <View key={sport} style={styles.revenueRow}>
              <Text style={styles.revenueRowLabel}>{sport}</Text>
              <Text style={styles.revenueRowValue}>Rp {Number(amount).toLocaleString('id-ID')}</Text>
            </View>
          ))}
        </View>
      )}
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
  // Users
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgInput,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 44,
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  userCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  userName: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  userEmail: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  roleBadge: { marginTop: 4 },
  roleText: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase' },
  userActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: Spacing.sm },
  actionBtnDanger: { padding: Spacing.sm },
  // Owners & Kasir
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  formGroup: { marginBottom: Spacing.sm },
  formLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: 4 },
  formInput: {
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    height: 46, paddingHorizontal: Spacing.md, color: Colors.text, fontSize: FontSize.md,
  },
  createBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    height: 48, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  // Bookings
  bookingCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  bookingTop: { flexDirection: 'row', justifyContent: 'space-between' },
  bookingField: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  bookingStatus: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize' },
  bookingDetail: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  bookingCustomer: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  bookingPin: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700', marginTop: 2 },
  bookingPrice: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '600', marginTop: 2 },
  // Revenue
  revenueCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: Colors.secondary,
    marginBottom: Spacing.md,
  },
  revenueAmount: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.secondary, marginTop: Spacing.sm },
  revenueLabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  revenueRowLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  revenueRowValue: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, marginTop: Spacing.sm },
});
