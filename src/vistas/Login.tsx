import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { LoginRow, RootStackParamList, Rol } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLogin: (email: string, password: string) => Promise<string | null>;
};

export default function Login({ navigation, onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUsuario } = useAuth();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const result = await onLogin(email, password);
    setLoading(false);

    if (result) {
      setError(result);
      return;
    }

    // onLogin ya cargó el usuario en AuthContext — navegar a Home
    navigation.replace('Home', { usuario: { id: 0, email: '', rol: 'cliente' } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Bienvenido</Text>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>

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
          placeholder="Tu contraseña"
          placeholderTextColor="#9aa0a6"
          secureTextEntry
          value={password}
          onChangeText={(v) => { setPassword(v); setError(null); }}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Verificando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
  },
  eyebrow: { color: '#60a5fa', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 6 },
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
});