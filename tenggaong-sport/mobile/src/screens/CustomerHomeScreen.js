import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

const sportIcons = {
  'Futsal': 'football',
  'Basket': 'basketball',
  'Badminton': 'tennisball',
  'Tennis': 'tennisball',
  'Voli': 'volleyball',
  'Golf': 'golf',
};

export default function CustomerHomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSports = useCallback(async () => {
    try {
      const res = await api.getSports();
      setSports(res.sports || res.data || []);
    } catch (e) {
      console.warn('Failed to load sports:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadSports(); }, [loadSports]);

  const selectSport = async (sport) => {
    if (selectedSport?.id === sport.id) {
      setSelectedSport(null);
      setFields([]);
      return;
    }
    setSelectedSport(sport);
    setFieldsLoading(true);
    try {
      const res = await api.getFields(sport.id);
      setFields(res.fields || res.data || []);
    } catch (e) {
      console.warn('Failed to load fields:', e.message);
      setFields([]);
    } finally {
      setFieldsLoading(false);
    }
  };

  const handleBook = (field) => {
    navigation.navigate('BookField', { field, sport: selectedSport });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedSport(null);
    setFields([]);
    loadSports();
  };

  const renderSport = ({ item }) => {
    const isSelected = selectedSport?.id === item.id;
    const iconName = sportIcons[item.name] || sportIcons[item.nama] || 'football';
    return (
      <TouchableOpacity
        style={[styles.sportCard, isSelected && styles.sportCardSelected]}
        onPress={() => selectSport(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.sportIcon, isSelected && styles.sportIconSelected]}>
          <Ionicons name={iconName} size={28} color={isSelected ? '#fff' : Colors.primary} />
        </View>
        <Text style={[styles.sportName, isSelected && styles.sportNameSelected]}>
          {item.name || item.nama}
        </Text>
        {item.jumlah_lapangan != null && (
          <Text style={styles.sportCount}>{item.jumlah_lapangan} fields</Text>
        )}
        {isSelected && (
          <Ionicons name="chevron-up" size={18} color={Colors.primary} style={{ marginTop: 4 }} />
        )}
      </TouchableOpacity>
    );
  };

  const renderField = ({ item }) => (
    <TouchableOpacity style={styles.fieldCard} onPress={() => handleBook(item)} activeOpacity={0.7}>
      <View style={styles.fieldInfo}>
        <Text style={styles.fieldName}>{item.nama || item.name}</Text>
        <Text style={styles.fieldDesc}>
          {item.olahraga || selectedSport?.nama || selectedSport?.name}
          {item.harga ? `  •  Rp${Number(item.harga).toLocaleString('id-ID')}` : ''}
        </Text>
        {item.deskripsi ? (
          <Text style={styles.fieldDescSmall}>{item.deskripsi}</Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(item)}>
        <Text style={styles.bookBtnText}>Book</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Halo, {user?.nama || user?.name || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.headerSub}>Choose your sport & field</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sports}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSport}
        numColumns={2}
        columnWrapperStyle={styles.sportRow}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Sports</Text>
        }
        ListFooterComponent={
          <>
            {selectedSport && (
              <View style={styles.fieldsSection}>
                <Text style={styles.sectionTitle}>
                  {selectedSport.nama || selectedSport.name} • Fields
                </Text>
                {fieldsLoading ? (
                  <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
                ) : fields.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons name="sad-outline" size={32} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>No fields available</Text>
                  </View>
                ) : (
                  <FlatList
                    data={fields}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderField}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
                  />
                )}
              </View>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  greeting: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { padding: Spacing.sm },
  list: { padding: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.textSecondary,
    marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1,
  },
  sportRow: { justifyContent: 'space-between', marginBottom: Spacing.sm },
  sportCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', marginHorizontal: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  sportCardSelected: {
    borderColor: Colors.primary, backgroundColor: Colors.bgInput,
  },
  sportIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.bgInput, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sportIconSelected: { backgroundColor: Colors.primary },
  sportName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  sportNameSelected: { color: Colors.primary },
  sportCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  fieldsSection: { marginTop: Spacing.lg },
  fieldCard: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center',
  },
  fieldInfo: { flex: 1 },
  fieldName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  fieldDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  fieldDescSmall: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  bookBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.sm },
});
