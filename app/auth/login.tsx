import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { loginWithEmail, loginWithGoogle } from '@/lib/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Google Sign-In Failed', e.message || 'Something went wrong');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="fitness" size={40} color="#FFF" />
          </View>
          <Text style={styles.appName}>Slimme</Text>
          <Text style={styles.tagline}>Your personal fitness companion</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleEmailLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={googleLoading}>
            {googleLoading ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.text },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 3,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: 12, color: Colors.textSecondary, fontSize: 13 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingVertical: 12, gap: 10,
  },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
