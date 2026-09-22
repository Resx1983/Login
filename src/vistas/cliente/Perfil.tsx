import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useMensajeFugaz } from '../../hooks/useMensajeFugaz';
import { ClienteRow } from '../../types';
import { Aviso, Boton, Cabecera, Campo, Cargando, Pie, Placa } from '../../ui/componentes';
import { color, espacio, texto } from '../../ui/tema';
import { esCorreoValido } from '../../validacion';

type Campos = { nombre: string; apellido: string; correo: string };

function validar(campos: Campos): Partial<Campos> {
  const e: Partial<Campos> = {};
  if (!campos.nombre.trim()) e.nombre = 'Escribe tu nombre como aparece en la factura.';
  if (!campos.apellido.trim()) e.apellido = 'Escribe tu apellido.';
  if (!esCorreoValido(campos.correo)) {
    e.correo = 'Ese correo no tiene un formato válido. Revisa que incluya @ y un dominio.';
  }
  return e;
}

export default function Perfil() {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const [cliente, setCliente] = useState<ClienteRow | null>(null);
  const [campos, setCampos] = useState<Campos>({ nombre: '', apellido: '', correo: '' });
  const [errores, setErrores] = useState<Partial<Campos>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, mostrarMensaje] = useMensajeFugaz();

  const cargar = useCallback(async () => {
    if (!usuario) return;
    const row = await db.getFirstAsync<ClienteRow>(
      'SELECT * FROM CLIENTES WHERE IdLogin = ?',
      usuario.id,
    );
    setCliente(row ?? null);
    setCampos(
      row
        ? { nombre: row.Nombre ?? '', apellido: row.Apellido ?? '', correo: row.Correo ?? '' }
        : { nombre: '', apellido: '', correo: usuario.email },
    );
    setCargando(false);
  }, [db, usuario]);

  // Este es el único que NO se recarga al enfocar: relee de la base borraría lo
  // que el usuario esté escribiendo, y nadie más toca su propio perfil.
  useEffect(() => { cargar(); }, [cargar]);

  const escribir = (clave: keyof Campos) => (v: string) => {
    setCampos((c) => ({ ...c, [clave]: v }));
    setErrores((e) => ({ ...e, [clave]: undefined }));
  };

  const guardar = async () => {
    const e = validar(campos);
    setErrores(e);
    if (Object.keys(e).length > 0 || !usuario) return;

    const nombre = campos.nombre.trim();
    const apellido = campos.apellido.trim();
    const correo = campos.correo.trim().toLowerCase();

    setGuardando(true);
    try {
      if (cliente) {
        await db.runAsync(
          'UPDATE CLIENTES SET Nombre=?, Apellido=?, Correo=? WHERE Id=?',
          nombre, apellido, correo, cliente.Id,
        );
      } else {
        await db.runAsync(
          'INSERT INTO CLIENTES (IdLogin, Nombre, Apellido, Correo) VALUES (?,?,?,?)',
          usuario.id, nombre, apellido, correo,
        );
      }
      mostrarMensaje('Perfil guardado', 'ok');
      await cargar();
    } catch {
      mostrarMensaje('No se pudo guardar el perfil. Inténtalo otra vez.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Cargando />;

  const completo = !!cliente;

  return (
    <KeyboardAvoidingView style={s.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Cabecera
          tamano="grande"
          titulo={completo ? `${campos.nombre} ${campos.apellido}`.trim() : 'Completa tu perfil'}
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
            value={campos.nombre}
            error={errores.nombre}
            onChangeText={escribir('nombre')}
          />

          <Campo
            rotulo="Apellido"
            obligatorio
            placeholder="Tu apellido"
            autoComplete="family-name"
            textContentType="familyName"
            value={campos.apellido}
            error={errores.apellido}
            onChangeText={escribir('apellido')}
          />

          <Campo
            rotulo="Correo de contacto"
            obligatorio
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={campos.correo}
            error={errores.correo}
            onChangeText={escribir('correo')}
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

      {/* El acuse vive junto al botón que lo dispara, no arriba del scroll */}
      <Pie>
        {mensaje && (
          <View style={s.aviso}>
            <Aviso texto={mensaje.texto} tipo={mensaje.tipo} />
          </View>
        )}
        <Boton onPress={guardar} cargando={guardando} icono="check">
          {completo ? 'Guardar cambios' : 'Crear perfil'}
        </Boton>
      </Pie>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  scroll: { paddingBottom: espacio.xxl },
  formulario: { paddingHorizontal: espacio.base, paddingTop: espacio.sm },
  cuenta: {
    backgroundColor: color.lamina,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
    padding: espacio.base,
    marginBottom: espacio.xl,
  },
  cuentaCorreo: { color: color.tinta, marginTop: espacio.sm },
  cuentaNota: { color: color.tintaMedia, marginTop: espacio.xs },
  aviso: { marginBottom: espacio.md },
});
