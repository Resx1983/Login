import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../types';
import { Aviso, Boton, Campo, Enlace, Placa } from '../ui/componentes';
import { color, espacio, texto } from '../ui/tema';
import { esCorreoValido } from '../validacion';
import { ReglasContrasena, primerFallo } from './ReglasContrasena';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'> & {
  onRegister: (email: string, password: string) => Promise<string | null>;
};

type Errores = { correo?: string; clave?: string; confirmacion?: string; general?: string };

function validarCorreo(correo: string): string | null {
  if (!correo.trim()) return 'Escribe el correo con el que vas a entrar.';
  if (!esCorreoValido(correo)) {
    return 'Ese correo no tiene un formato válido. Revisa que incluya @ y un dominio.';
  }
  return null;
}

export default function Register({ navigation, onRegister }: Props) {
  const inset = useSafeAreaInsets();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);

  /** Primer error que encuentre, asignado a su campo. */
  const revisar = (): Errores | null => {
    const errorCorreo = validarCorreo(correo);
    if (errorCorreo) return { correo: errorCorreo };

    const errorClave = primerFallo(clave);
    if (errorClave) return { clave: errorClave };

    if (clave !== confirmacion) return { confirmacion: 'Las dos contraseñas no coinciden.' };

    return null;
  };

  const enviar = async () => {
    const fallo = revisar();
    setErrores(fallo ?? {});
    if (fallo) return;

    setEnviando(true);
    const resultado = await onRegister(correo, clave);
    setEnviando(false);

    if (resultado) setErrores({ general: resultado });
    else setEnviada(true);
  };

  if (enviada) {
    return (
      <SolicitudEnviada
        correo={correo.trim().toLowerCase()}
        inset={inset}
        onVolver={() => navigation.replace('Login')}
      />
    );
  }

  return (
    <KeyboardAvoidingView style={s.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
            value={correo}
            error={errores.correo}
            onChangeText={(v) => { setCorreo(v); setErrores({}); }}
          />

          <Campo
            rotulo="Contraseña"
            obligatorio
            placeholder="Elige una contraseña"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={clave}
            error={errores.clave}
            onChangeText={(v) => { setClave(v); setErrores({}); }}
          />

          <ReglasContrasena clave={clave} />

          <Campo
            rotulo="Repetir contraseña"
            obligatorio
            placeholder="La misma contraseña"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={confirmacion}
            error={errores.confirmacion}
            onChangeText={(v) => { setConfirmacion(v); setErrores({}); }}
          />

          {errores.general ? (
            <View style={s.error}>
              <Aviso texto={errores.general} tipo="error" />
            </View>
          ) : null}

          <Boton onPress={enviar} cargando={enviando} icono="arrow-right">
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

/** El estado en el que queda la cuenta es la cifra: la solicitud está EN ESPERA. */
function SolicitudEnviada({
  correo,
  inset,
  onVolver,
}: {
  correo: string;
  inset: { top: number; bottom: number };
  onVolver: () => void;
}) {
  return (
    <View style={[s.pantalla, s.confirmacion, { paddingTop: inset.top, paddingBottom: inset.bottom }]}>
      <View>
        <Placa>Estado de la solicitud</Placa>
        <Text style={[texto.mega, s.confirmacionTitulo]}>EN{'\n'}ESPERA</Text>
        <View style={s.reglaGruesa} />
        <Text style={[texto.cuerpo, s.confirmacionCuerpo]}>
          Guardamos tu solicitud para <Text style={texto.cuerpoFuerte}>{correo}</Text>. Un
          administrador debe activarla y asignarte un rol antes de que puedas entrar.
        </Text>
      </View>

      <Boton onPress={onVolver} icono="arrow-left">
        Volver a iniciar sesión
      </Boton>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  scroll: { flexGrow: 1, paddingHorizontal: espacio.base },
  titulo: { color: color.tinta, marginTop: espacio.sm },
  subtitulo: { color: color.tintaMedia, marginTop: espacio.md, maxWidth: 300 },
  formulario: { paddingTop: espacio.xxl },
  error: { marginBottom: espacio.base },
  confirmacion: {
    paddingHorizontal: espacio.base,
    justifyContent: 'space-between',
    paddingVertical: espacio.xxxl,
  },
  confirmacionTitulo: { color: color.tinta, marginTop: espacio.sm },
  reglaGruesa: {
    height: 3,
    backgroundColor: color.tinta,
    marginVertical: espacio.lg,
    width: 56,
  },
  confirmacionCuerpo: { color: color.tintaMedia, maxWidth: 340 },
});
