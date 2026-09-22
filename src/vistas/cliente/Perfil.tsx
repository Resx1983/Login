import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { ClienteRow } from '../../types';
import { Aviso, Boton, Cabecera, Campo, Cargando, Placa } from '../../ui/componentes';
import { color, espacio, texto } from '../../ui/tema';

type FormPerfil = {
  nombre: string;
  apellido: string;
  correo: string;
};

export default function Perfil() {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const [cliente, setCliente] = useState<ClienteRow | null>(null);
  const [form, setForm] = useState<FormPerfil>({ nombre: '', apellido: '', correo: '' });
  const [errores, setErrores] = useState<Partial<FormPerfil>>({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null);

  const cargarPerfil = useCallback(async () => {
    if (!usuario) return;
    const row = await db.getFirstAsync<ClienteRow>(
      'SELECT * FROM CLIENTES WHERE IdLogin = ?',
      usuario.id,
    );
    setCliente(row ?? null);
    if (row) {
      setForm({
        nombre: row.Nombre ?? '',
        apellido: row.Apellido ?? '',
        correo: row.Correo ?? '',
      });
    } else {
      // Pre-rellenar correo desde sesión
      setForm({ nombre: '', apellido: '', correo: usuario.email });
    }
    setLoading(false);
  }, [db, usuario]);

  useEffect(() => { cargarPerfil(); }, [cargarPerfil]);

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current); }, []);

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo });
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setMensaje(null), 4500);
  };

  const validar = (): boolean => {
    const e: Partial<FormPerfil> = {};
    if (!form.nombre.trim()) e.nombre = 'Escribe tu nombre como aparece en la factura.';
    if (!form.apellido.trim()) e.apellido = 'Escribe tu apellido.';
    if (!form.correo.trim() || !/\S+@\S+\.\S+/.test(form.correo.trim())) {
      e.correo = 'Ese correo no tiene un formato válido. Revisa que incluya @ y un dominio.';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar() || !usuario) return;
    setGuardando(true);
    try {
      if (cliente) {
        // Actualizar
        await db.runAsync(
          'UPDATE CLIENTES SET Nombre=?, Apellido=?, Correo=? WHERE Id=?',
          form.nombre.trim(),
          form.apellido.trim(),
          form.correo.trim().toLowerCase(),
          cliente.Id,
        );
      } else {
        // Crear nuevo registro de cliente
        await db.runAsync(
          'INSERT INTO CLIENTES (IdLogin, Nombre, Apellido, Correo) VALUES (?,?,?,?)',
          usuario.id,
          form.nombre.trim(),
          form.apellido.trim(),
          form.correo.trim().toLowerCase(),
        );
      }
      mostrarMensaje('Perfil guardado', 'ok');
      await cargarPerfil();
    } catch {
      mostrarMensaje('No se pudo guardar el perfil. Inténtalo otra vez.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <Cargando />;

  const completo = !!cliente;

  return (
    <KeyboardAvoidingView
      style={s.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Cabecera
          tamano="grande"
          titulo={completo ? `${form.nombre} ${form.apellido}`.trim() : 'Completa tu perfil'}
          apoyo={
            completo
              ? 'Estos son los datos que quedan registrados en cada compra.'
              : 'Sin nombre y apellido no se puede registrar una compra a tu nombre.'
          }
        />

        <View style={s.formulario}>
          <Campo
            rotulo="Nombre"
            obligatorio
            placeholder="Tu nombre"
            autoComplete="given-name"
            textContentType="givenName"
            value={form.nombre}
            error={errores.nombre}
            onChangeText={(v) => { setForm((f) => ({ ...f, nombre: v })); setErrores((e) => ({ ...e, nombre: undefined })); }}
          />

          <Campo
            rotulo="Apellido"
            obligatorio
            placeholder="Tu apellido"
            autoComplete="family-name"
            textContentType="familyName"
            value={form.apellido}
            error={errores.apellido}
            onChangeText={(v) => { setForm((f) => ({ ...f, apellido: v })); setErrores((e) => ({ ...e, apellido: undefined })); }}
          />

          <Campo
            rotulo="Correo de contacto"
            obligatorio
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={form.correo}
            error={errores.correo}
            onChangeText={(v) => { setForm((f) => ({ ...f, correo: v })); setErrores((e) => ({ ...e, correo: undefined })); }}
          />

          <View style={s.cuenta}>
            <Placa>Cuenta de acceso</Placa>
            <Text style={[texto.cuerpo, s.cuentaCorreo]}>{usuario?.email}</Text>
            <Text style={[texto.menor, s.cuentaNota]}>
              El correo con el que entras no cambia desde aquí.
            </Text>
          </View>

        </View>
      </ScrollView>

      <View style={s.pie}>
        {mensaje && (
          <View style={s.aviso}>
            <Aviso texto={mensaje.texto} tipo={mensaje.tipo} />
          </View>
        )}
        <Boton onPress={guardar} cargando={guardando} icono="check">
          {completo ? 'Guardar cambios' : 'Crear perfil'}
        </Boton>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  scroll: { paddingBottom: 96 },
  aviso: { marginBottom: espacio.md },
  formulario: { paddingHorizontal: espacio.base, paddingTop: espacio.sm },
  cuenta: {
    backgroundColor: color.lamina,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
    padding: espacio.base,
    marginBottom: espacio.xl,
  },
  pie: {
    padding: espacio.base,
    backgroundColor: color.tabla,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.regla,
  },
  cuentaCorreo: { color: color.tinta, marginTop: espacio.sm },
  cuentaNota: { color: color.tintaMedia, marginTop: espacio.xs },
});
