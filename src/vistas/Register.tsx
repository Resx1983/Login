import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'> & {
  onRegister: (email: string, password: string) => Promise<string | null>;
};

/** Valida que la contraseña sea segura: mín. 8 chars, 1 mayúscula, 1 número */
function validatePassword(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir al menos una mayúscula.';
  if (!/[0-9]/.test(password)) return 'La contraseña debe incluir al menos un número.';
  return null;
}

/** Valida formato de correo */
function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El correo es obligatorio.';
  if (!/\S+@\S+\.\S+/.test(email.trim())) return 'Ingresa un correo electrónico válido.';
  return null;
}

export default function Register({ navigation, onRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const result = await onRegister(email, password);
    setLoading(false);

    if (result) {
      setError(result);
      return;
    }

    setRegistered(true);
  };

  // ── Pantalla de confirmación ──────────────────────────────────────────────
  if (registered) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>⏳</Text>
          </View>
          <Text style={styles.title}>Solicitud enviada</Text>
          <Text style={styles.subtitle}>
            Tu cuenta ha sido registrada con el correo:
          </Text>
          <Text style={styles.emailHighlight}>{email.trim().toLowerCase()}</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Un administrador revisará tu solicitud y activará tu cuenta.
              Recibirás acceso una vez que sea aprobada.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.primaryButtonText}>Ir al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Formulario de registro ─────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Completa el formulario para solicitar acceso a la plataforma
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor="#9aa0a6"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
            placeholderTextColor="#9aa0a6"
            secureTextEntry
            value={password}
            onChangeText={(v) => { setPassword(v); setError(null); }}
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#9aa0a6"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setError(null); }}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Registrando...' : 'Solicitar acceso'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#cbd5e1', marginBottom: 24 },
  label: { fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    color: '#f8fafc',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchText: { textAlign: 'center', color: '#93c5fd', fontWeight: '600' },
  error: {
    color: '#fca5a5',
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#450a0a',
    borderRadius: 8,
    padding: 10,
  },
  // ── Confirmación ──────────────────────────
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: { fontSize: 52 },
  emailHighlight: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: { color: '#bfdbfe', fontSize: 14, lineHeight: 22 },
});