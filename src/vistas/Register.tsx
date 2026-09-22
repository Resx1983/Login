import { Feather } from '@expo/vector-icons';
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
import { Aviso, Boton, Campo, Enlace, Placa, Regla } from '../ui/componentes';
import { color, espacio, texto } from '../ui/tema';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'> & {
  onRegister: (email: string, password: string) => Promise<string | null>;
};

/** Reglas de contraseña. Se muestran mientras se escribe, no después de fallar. */
const REGLAS = [
  { texto: 'Al menos 8 caracteres', cumple: (p: string) => p.length >= 8 },
  { texto: 'Una letra mayúscula', cumple: (p: string) => /[A-Z]/.test(p) },
  { texto: 'Un número', cumple: (p: string) => /[0-9]/.test(p) },
];

/** Valida que la contraseña sea segura: mín. 8 chars, 1 mayúscula, 1 número */
function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Faltan caracteres: usa 8 o más.';
  if (!/[A-Z]/.test(password)) return 'Añade al menos una letra mayúscula.';
  if (!/[0-9]/.test(password)) return 'Añade al menos un número.';
  return null;
}

/** Valida formato de correo */
function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Escribe el correo con el que vas a entrar.';
  if (!/\S+@\S+\.\S+/.test(email.trim())) return 'Ese correo no tiene un formato válido. Revisa que incluya @ y un dominio.';
  return null;
}

type Errores = { correo?: string; clave?: string; confirmacion?: string; general?: string };

export default function Register({ navigation, onRegister }: Props) {
  const inset = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async () => {
    setErrores({});

    const emailError = validateEmail(email);
    if (emailError) { setErrores({ correo: emailError }); return; }

    const passwordError = validatePassword(password);
    if (passwordError) { setErrores({ clave: passwordError }); return; }

    if (password !== confirmPassword) {
      setErrores({ confirmacion: 'Las dos contraseñas no coinciden.' });
      return;
    }

    setLoading(true);
    const result = await onRegister(email, password);
    setLoading(false);

    if (result) {
      setErrores({ general: result });
      return;
    }

    setRegistered(true);
  };

  // ── Solicitud enviada ──────────────────────────────────────────────────────
  if (registered) {
    return (
      <View style={[s.pantalla, s.confirmacion, { paddingTop: inset.top, paddingBottom: inset.bottom }]}>
        <View>
          <Placa>Estado de la solicitud</Placa>
          <Text style={[texto.mega, s.confirmacionTitulo]}>EN{'\n'}ESPERA</Text>
          <View style={s.reglaGruesa} />
          <Text style={[texto.cuerpo, s.confirmacionCuerpo]}>
            Guardamos tu solicitud para{' '}
            <Text style={texto.cuerpoFuerte}>{email.trim().toLowerCase()}</Text>. Un administrador
            debe activarla y asignarte un rol antes de que puedas entrar.
          </Text>
        </View>

        <Boton onPress={() => navigation.replace('Login')} icono="arrow-left">
          Volver a iniciar sesión
        </Boton>
      </View>
    );
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
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
        <View>
          <Text style={[texto.gigante, s.titulo]}>SOLICITAR{'\n'}ACCESO</Text>
          <Text style={[texto.menor, s.subtitulo]}>
            La cuenta queda en espera hasta que un administrador la active.
          </Text>
        </View>

        <View style={s.formulario}>
          <Campo
            rotulo="Correo"
            obligatorio
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            error={errores.correo}
            onChangeText={(v) => { setEmail(v); setErrores({}); }}
          />

          <Campo
            rotulo="Contraseña"
            obligatorio
            placeholder="Elige una contraseña"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={password}
            error={errores.clave}
            onChangeText={(v) => { setPassword(v); setErrores({}); }}
          />

          <View style={s.reglas}>
            {REGLAS.map((r, i) => {
              const ok = r.cumple(password);
              return (
                <View key={r.texto}>
                  {i > 0 && <Regla />}
                  <View style={s.regla}>
                    <Feather
                      name={ok ? 'check' : 'minus'}
                      size={14}
                      color={ok ? color.tinta : color.tintaMedia}
                    />
                    <Text
                      style={[
                        ok ? texto.cuerpoFuerte : texto.cuerpo,
                        { color: ok ? color.tinta : color.tintaMedia, marginLeft: espacio.sm, fontSize: 14 },
                      ]}
                    >
                      {r.texto}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Campo
            rotulo="Repetir contraseña"
            obligatorio
            placeholder="La misma contraseña"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={confirmPassword}
            error={errores.confirmacion}
            onChangeText={(v) => { setConfirmPassword(v); setErrores({}); }}
          />

          {errores.general ? (
            <View style={s.error}>
              <Aviso texto={errores.general} tipo="error" />
            </View>
          ) : null}

          <Boton onPress={handleSubmit} cargando={loading} icono="arrow-right">
            Enviar solicitud
          </Boton>

          <Enlace onPress={() => navigation.navigate('Login')}>
            Ya tengo cuenta · iniciar sesión
          </Enlace>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  scroll: { flexGrow: 1, paddingHorizontal: espacio.base },
  titulo: { color: color.tinta, marginTop: espacio.sm },
  subtitulo: { color: color.tintaMedia, marginTop: espacio.md, maxWidth: 300 },
  formulario: { paddingTop: espacio.xxl },
  reglas: {
    backgroundColor: color.lamina,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
    paddingHorizontal: espacio.md,
    marginTop: -espacio.sm,
    marginBottom: espacio.lg,
  },
  regla: { flexDirection: 'row', alignItems: 'center', paddingVertical: espacio.md },
  error: { marginBottom: espacio.base },
  // Confirmación
  confirmacion: { paddingHorizontal: espacio.base, justifyContent: 'space-between', paddingVertical: espacio.xxxl },
  confirmacionTitulo: { color: color.tinta, marginTop: espacio.sm },
  reglaGruesa: { height: 3, backgroundColor: color.tinta, marginTop: espacio.lg, marginBottom: espacio.lg, width: 56 },
  confirmacionCuerpo: { color: color.tintaMedia, maxWidth: 340 },
});
