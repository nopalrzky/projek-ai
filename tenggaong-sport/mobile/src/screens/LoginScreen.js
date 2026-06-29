import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme';

const QUICK_LOGINS = [
  { label: 'Customer', email: 'customer@tng.com', password: 'password', role: 'customer' },
  { label: 'Kasir', email: 'kasir@tng.com', password: 'password', role: 'admin' },
  { label: 'Owner', email: 'owner@tng.com', password: 'password', role: 'owner' },
  { label: 'Superadmin', email: 'superadmin@tng.com', password: 'password', role: 'superadmin' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e, p) => {
    const emailVal = e || email;
    const passVal = p || password;
    if (!emailVal || !passVal) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(emailVal, passVal);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo / Title */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="football" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Tenggaong Sport</Text>
          <Text style={styles.subtitle}>Book your game, own the field</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>

          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={() => handleLogin()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Login */}
        <Text style={styles.quickLabel}>Quick Login</Text>
        <View style={styles.quickRow}>
          {QUICK_LOGINS.map((q) => (
            <TouchableOpacity
              key={q.label}
              style={styles.quickBtn}
              onPress={() => handleLogin(q.email, q.password)}
            >
              <Text style={styles.quickBtnText}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>v1.0.0 — Tenggaong Sport</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { alignItems: 'center', marginTop: Spacing.xxl * 1.2, marginBottom: Spacing.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary, marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    marginBottom: Spacing.md, paddingHorizontal: Spacing.md,
    height: 50,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  eyeIcon: { padding: Spacing.xs },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    height: 50, justifyContent: 'center', alignItems: 'center',
    marginTop: Spacing.sm,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '700' },
  quickLabel: {
    textAlign: 'center', color: Colors.textSecondary, fontSize: FontSize.sm,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  quickBtn: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  quickBtnText: { color: Colors.primary, fontWeight: '600', fontSize: FontSize.xs },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.xs, marginTop: Spacing.lg },
});
