import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import { Placa } from '../ui/componentes';
import { ONDA, TOQUE_MINIMO, color, espacio, texto } from '../ui/tema';
import { PestanasAdmin, PestanasCliente } from './Pestanas';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

/**
 * El armazón de la sesión: quién eres arriba, tu trabajo abajo.
 *
 * Cada rol ve solo sus pestañas — el admin nunca navega por pantallas de
 * cliente para hacer lo suyo, ni al revés.
 */
export default function Home({ navigation }: Props) {
  const { usuario, logout } = useAuth();
  const inset = useSafeAreaInsets();

  if (!usuario) return null;

  const esAdmin = usuario.rol === 'admin';

  const salir = () => {
    logout();
    navigation.replace('Login');
  };

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
          onPress={salir}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          android_ripple={ONDA}
          style={({ pressed }) => [s.salir, pressed && s.salirPresionado]}
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
  salirPresionado: { backgroundColor: color.tabla },
  salirTexto: { color: color.tinta, marginLeft: espacio.sm, fontSize: 11 },
});
