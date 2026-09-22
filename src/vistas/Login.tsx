import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../types';
import { Aviso, Boton, Campo, Enlace, Placa } from '../ui/componentes';
import { color, espacio, texto } from '../ui/tema';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onLogin: (email: string, password: string) => Promise<string | null>;
};

export default function Login({ navigation, onLogin }: Props) {
  const inset = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setCargando(true);
    const result = await onLogin(email, password);
    setCargando(false);

    if (result) {
      setError(result);
      return;
    }

    navigation.replace('Home', { usuario: { id: 0, email: '', rol: 'cliente' } });
  };

  return (
    <KeyboardAvoidingView
      style={s.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: inset.top + espacio.xxl, paddingBottom: inset.bottom + espacio.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Rótulo del tablero: la tesis, a tamaño de tablero */}
        <View style={s.rotulo}>
          <Text style={[texto.mega, s.palabra]} numberOfLines={1} adjustsFontSizeToFit>
            TABLERO
          </Text>
          <View style={s.reglaGruesa} />
          <Placa>Punto de venta · inventario y ventas sin conexión</Placa>
        </View>

        {/* Zona del pulgar */}
        <View style={s.formulario}>
          <Campo
            rotulo="Correo"
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(null); }}
          />

          <Campo
            rotulo="Contraseña"
            placeholder="Tu contraseña"
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(null); }}
          />

          {error ? (
            <View style={s.error}>
              <Aviso texto={error} tipo="error" />
            </View>
          ) : null}

          <Boton onPress={handleSubmit} cargando={cargando} icono="arrow-right">
            Entrar
          </Boton>

          <Enlace onPress={() => navigation.navigate('Register')}>
            No tengo cuenta · solicitar acceso
          </Enlace>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  scroll: { flexGrow: 1, paddingHorizontal: espacio.base, justifyContent: 'space-between' },
  rotulo: { paddingTop: espacio.lg },
  palabra: { color: color.tinta },
  reglaGruesa: {
    height: 3,
    backgroundColor: color.tinta,
    marginTop: espacio.lg,
    marginBottom: espacio.md,
    width: 56,
  },
  formulario: { paddingTop: espacio.xxxl },
  error: { marginBottom: espacio.base },
});
