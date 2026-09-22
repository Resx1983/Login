import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { RootStackParamList } from '../types';
import { Placa } from '../ui/componentes';
import { TOQUE_MINIMO, color, espacio, fuente, texto } from '../ui/tema';
import AdminCuentas from './admin/AdminCuentas';
import Inventario from './admin/Inventario';
import ListadoClientes from './admin/ListadoClientes';
import Compra from './cliente/Compra';
import Perfil from './cliente/Perfil';
import Productos from './cliente/Productos';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Tab = createBottomTabNavigator();

/** El amarillo entra sobre la pestaña activa. Es la misma marca de selección
 *  que usan el selector de rol y la cantidad elegida: una sola gramática. */
function IconoPestana({
  nombre,
  focused,
}: {
  nombre: keyof typeof Feather.glyphMap;
  focused: boolean;
}) {
  return (
    <View style={[s.icono, focused && s.iconoActivo]}>
      <Feather name={nombre} size={21} color={focused ? color.tinta : color.tintaMedia} />
    </View>
  );
}

function PestanasAdmin() {
  return (
    <Tab.Navigator screenOptions={opcionesPestanas}>
      <Tab.Screen
        name="Cuentas"
        component={AdminCuentas}
        options={{ tabBarIcon: ({ focused }) => <IconoPestana nombre="user-check" focused={focused} /> }}
      />
      <Tab.Screen
        name="Clientes"
        component={ListadoClientes}
        options={{ tabBarIcon: ({ focused }) => <IconoPestana nombre="users" focused={focused} /> }}
      />
      <Tab.Screen
        name="Inventario"
        component={Inventario}
        options={{ tabBarIcon: ({ focused }) => <IconoPestana nombre="package" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

function PestanasCliente() {
  const { totalItems } = useCarrito();
  return (
    <Tab.Navigator screenOptions={opcionesPestanas}>
      <Tab.Screen
        name="Productos"
        component={Productos}
        options={{ tabBarIcon: ({ focused }) => <IconoPestana nombre="grid" focused={focused} /> }}
      />
      <Tab.Screen
        name="Compra"
        component={Compra}
        options={{
          tabBarIcon: ({ focused }) => <IconoPestana nombre="shopping-bag" focused={focused} />,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: s.insignia,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{ tabBarIcon: ({ focused }) => <IconoPestana nombre="user" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export default function Home({ navigation }: Props) {
  const { usuario, logout } = useAuth();
  const inset = useSafeAreaInsets();

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  if (!usuario) return null;

  const esAdmin = usuario.rol === 'admin';

  return (
    <View style={s.pantalla}>
      <View style={[s.cabecera, { paddingTop: inset.top + espacio.md }]}>
        <View style={s.identidad}>
          <Placa>{esAdmin ? 'Administración' : 'Mi cuenta'}</Placa>
          <Text style={[texto.titulo, s.correo]} numberOfLines={1}>
            {usuario.email}
          </Text>
        </View>
        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          android_ripple={{ color: 'rgba(21,20,15,0.12)' }}
          style={({ pressed }) => [s.salir, pressed && { backgroundColor: color.tabla }]}
        >
          <Feather name="log-out" size={16} color={color.tinta} />
          <Text style={[texto.placa, s.salirTexto]}>Salir</Text>
        </Pressable>
      </View>

      {esAdmin ? <PestanasAdmin /> : <PestanasCliente />}
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: espacio.base,
    paddingBottom: espacio.md,
    backgroundColor: color.lamina,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.regla,
  },
  identidad: { flex: 1, marginRight: espacio.md },
  correo: { color: color.tinta, marginTop: espacio.xs },
  salir: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOQUE_MINIMO,
    paddingHorizontal: espacio.md,
    borderWidth: 1.5,
    borderColor: color.tinta,
    overflow: 'hidden',
  },
  salirTexto: { color: color.tinta, marginLeft: espacio.sm, fontSize: 11 },
  // Sin height fija: React Navigation deriva el alto de los insets del sistema.
  // Fijarlo metia los iconos bajo el indicador de inicio y la barra de gestos.
  barra: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.regla,
  },
  item: { paddingTop: espacio.xs },
  etiqueta: { fontFamily: fuente.bold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase' },
  icono: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 30,
    marginBottom: espacio.xs,
  },
  iconoActivo: { backgroundColor: color.flash },
  insignia: {
    backgroundColor: color.tinta,
    color: color.sobreTinta,
    fontFamily: fuente.bold,
    fontSize: 11,
  },
});

const opcionesPestanas = {
  headerShown: false,
  tabBarStyle: s.barra,
  tabBarActiveTintColor: color.tinta,
  tabBarInactiveTintColor: color.tintaMedia,
  tabBarLabelStyle: s.etiqueta,
  tabBarItemStyle: s.item,
} as const;
