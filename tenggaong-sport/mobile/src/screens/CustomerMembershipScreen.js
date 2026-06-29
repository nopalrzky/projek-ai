import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

export default function CustomerMembershipScreen() {
  const [tiers, setTiers] = useState([]);
  const [myMembership, setMyMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [tiersRes, membRes] = await Promise.allSettled([
        api.getMembershipTiers(),
        api.getMyMembership(),
      ]);
      if (tiersRes.status === 'fulfilled') {
        setTiers(tiersRes.value.tiers || tiersRes.value.data || []);
      }
      if (membRes.status === 'fulfilled') {
        setMyMembership(membRes.value.membership || membRes.value.data || membRes.value);
      }
    } catch (e) {
      console.warn('Membership load error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData])
  );

  const handleSubscribe = async (tierId) => {
    setSubscribing(tierId);
    try {
      await api.subscribeMembership(tierId);
      Alert.alert('Success', 'You have subscribed to this membership tier!');
      loadData();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubscribing(null);
    }
  };

  const tierIcons = ['diamond-outline', 'star-outline', 'flower-outline'];

  const renderTier = ({ item, index }) => {
    const isCurrent = myMembership?.tier_id === item.id || myMembership?.tier?.id === item.id;
    return (
      <View style={[styles.card, isCurrent && styles.cardCurrent]}>
        {isCurrent && (
          <View style={styles.currentBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.currentBadgeText}>Active</Text>
          </View>
        )}
        <View style={styles.iconCircle}>
          <Ionicons name={tierIcons[index] || 'diamond-outline'} size={32} color={Colors.primary} />
        </View>
        <Text style={styles.tierName}>{item.nama || item.name || `Tier ${index + 1}`}</Text>
        {item.harga && (
          <Text style={styles.tierPrice}>Rp {Number(item.harga).toLocaleString('id-ID')}</Text>
        )}
        {item.deskripsi && (
          <Text style={styles.tierDesc}>{item.deskripsi}</Text>
        )}
        {item.benefits && (
          <View style={styles.benefitsList}>
            {(Array.isArray(item.benefits) ? item.benefits : []).map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Ionicons name="checkmark" size={14} color={Colors.success} />
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={[styles.subBtn, isCurrent && styles.subBtnActive]}
          onPress={() => handleSubscribe(item.id)}
          disabled={subscribing === item.id || isCurrent}
        >
          {subscribing === item.id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.subBtnText, isCurrent && styles.subBtnTextActive]}>
              {isCurrent ? 'Active' : 'Subscribe'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Membership</Text>
        <Text style={styles.headerSub}>Unlock exclusive benefits</Text>
      </View>

      <FlatList
        data={tiers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderTier}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="diamond-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No membership tiers available</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
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
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
    position: 'relative',
  },
  cardCurrent: { borderColor: Colors.primary, borderWidth: 2 },
  currentBadge: {
    position: 'absolute', top: -1, right: Spacing.md,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingVertical: 2, paddingHorizontal: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  currentBadgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700' },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tierName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  tierPrice: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.primary, marginTop: 4 },
  tierDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  benefitsList: { alignSelf: 'stretch', marginTop: Spacing.md },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  benefitText: { color: Colors.text, fontSize: FontSize.sm },
  subBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, marginTop: Spacing.md,
    minWidth: 140, alignItems: 'center',
  },
  subBtnActive: { backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.primary },
  subBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },
  subBtnTextActive: { color: Colors.primary },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyTitle: { color: Colors.textSecondary, fontSize: FontSize.md, marginTop: Spacing.md },
});
