import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import AdminCuentas from './admin/AdminCuentas';
import Inventario from './admin/Inventario';
import ListadoClientes from './admin/ListadoClientes';
import Compra from './cliente/Compra';
import Perfil from './cliente/Perfil';
import Productos from './cliente/Productos';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Tab = createBottomTabNavigator();

// ── Iconos simples con emoji ─────────────────────────────────────────────────
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Usuarios: '👥',
    Clientes: '🗂️',
    Inventario: '📦',
    'Mi Perfil': '👤',
    Productos: '🛍️',
    'Mi Compra': '🛒',
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '📄'}
    </Text>
  );
}

// ── Tabs para Admin ──────────────────────────────────────────────────────────
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Usuarios" component={AdminCuentas} />
      <Tab.Screen name="Clientes" component={ListadoClientes} />
      <Tab.Screen name="Inventario" component={Inventario} />
    </Tab.Navigator>
  );
}

// ── Tabs para Cliente ────────────────────────────────────────────────────────
function ClienteTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Mi Perfil" component={Perfil} />
      <Tab.Screen name="Productos" component={Productos} />
      <Tab.Screen name="Mi Compra" component={Compra} />
    </Tab.Navigator>
  );
}

// ── Shell principal ──────────────────────────────────────────────────────────
export default function Home({ navigation }: Props) {
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  if (!usuario) return null;

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {usuario.rol === 'admin' ? '⚙️ Panel Admin' : '🏠 Mi cuenta'}
          </Text>
          <Text style={styles.headerEmail}>{usuario.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido por rol */}
      <View style={styles.content}>
        {usuario.rol === 'admin' ? <AdminTabs /> : <ClienteTabs />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  headerEmail: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: { color: '#f87171', fontWeight: '700', fontSize: 14 },
  content: { flex: 1 },
  tabBar: {
    backgroundColor: '#111827',
    borderTopColor: '#1f2937',
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingTop: 6,
    height: 62,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});