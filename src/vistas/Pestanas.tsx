import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

import { useCarrito } from '../context/CarritoContext';
import { color, espacio, fuente } from '../ui/tema';
import AdminCuentas from './admin/AdminCuentas';
import Inventario from './admin/Inventario';
import ListadoClientes from './admin/ListadoClientes';
import Compra from './cliente/Compra';
import Pedidos from './cliente/Pedidos';
import Perfil from './cliente/Perfil';
import Productos from './cliente/Productos';

const Tab = createBottomTabNavigator();

/**
 * El amarillo entra como plantilla detrás del icono de la pestaña activa. Es
 * la misma marca de selección que usan el selector de rol y la cantidad
 * elegida: una sola gramática para decir "esta es".
 */
function Icono({ nombre, focused }: { nombre: keyof typeof Feather.glyphMap; focused: boolean }) {
  return (
    <View style={[s.icono, focused && s.iconoActivo]}>
      <Feather name={nombre} size={21} color={focused ? color.tinta : color.tintaMedia} />
    </View>
  );
}

/** Declara una pestaña sin repetir la ceremonia de `tabBarIcon` en cada una. */
const pestana = (nombre: keyof typeof Feather.glyphMap) => ({
  tabBarIcon: ({ focused }: { focused: boolean }) => <Icono nombre={nombre} focused={focused} />,
});

export function PestanasAdmin() {
  return (
    <Tab.Navigator screenOptions={opciones}>
      <Tab.Screen name="Cuentas" component={AdminCuentas} options={pestana('user-check')} />
      <Tab.Screen name="Clientes" component={ListadoClientes} options={pestana('users')} />
      <Tab.Screen name="Inventario" component={Inventario} options={pestana('package')} />
    </Tab.Navigator>
  );
}

export function PestanasCliente() {
  const { totalItems } = useCarrito();

  return (
    <Tab.Navigator screenOptions={opciones}>
      <Tab.Screen name="Productos" component={Productos} options={pestana('grid')} />
      <Tab.Screen
        name="Compra"
        component={Compra}
        options={{
          ...pestana('shopping-bag'),
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: s.insignia,
        }}
      />
      <Tab.Screen name="Pedidos" component={Pedidos} options={pestana('file-text')} />
      <Tab.Screen name="Perfil" component={Perfil} options={pestana('user')} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  // Sin alto fijo: React Navigation lo deriva de los insets del sistema. Fijarlo
  // metía los iconos bajo el indicador de inicio y la barra de gestos.
  barra: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.regla,
  },
  item: { paddingTop: espacio.xs },
  etiqueta: { fontFamily: fuente.bold, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase' as const },
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

const opciones = {
  headerShown: false,
  tabBarStyle: s.barra,
  tabBarActiveTintColor: color.tinta,
  tabBarInactiveTintColor: color.tintaMedia,
  tabBarLabelStyle: s.etiqueta,
  tabBarItemStyle: s.item,
} as const;
