import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation, route }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Sesión iniciada</Text>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.email}>{route.params.email}</Text>
        <Text style={styles.subtitle}>Ya puedes comenzar a usar la aplicación.</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20,
  },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  eyebrow: { color: '#93c5fd', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  title: { color: '#f8fafc', fontSize: 36, fontWeight: '800', marginBottom: 8 },
  email: { color: '#bfdbfe', fontSize: 18, marginBottom: 16 },
  subtitle: { color: '#cbd5e1', fontSize: 16, marginBottom: 28 },
  logoutButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});