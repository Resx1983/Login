import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { LoginRow } from '../../types';
import {
  Aviso,
  Boton,
  Cabecera,
  Cargando,
  FilaRegistro,
  Hoja,
  Marca,
  Placa,
  Selector,
  Vacio,
} from '../../ui/componentes';
import { color, espacio, texto } from '../../ui/tema';

type UsuarioPendiente = Pick<LoginRow, 'Id' | 'Correo' | 'Estado'> & { rolSeleccionado: 'admin' | 'cliente' };

type UsuarioActivo = Pick<LoginRow, 'Id' | 'Correo' | 'Rol' | 'Estado'>;

const ROLES = [
  { valor: 'cliente' as const, etiqueta: 'Cliente' },
  { valor: 'admin' as const, etiqueta: 'Admin' },
];

export default function AdminCuentas() {
  const db = useSQLiteContext();
  const [pendientes, setPendientes] = useState<UsuarioPendiente[]>([]);
  const [activos, setActivos] = useState<UsuarioActivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null);

  const cargarDatos = useCallback(async () => {
    const pend = await db.getAllAsync<Pick<LoginRow, 'Id' | 'Correo' | 'Estado'>>(
      "SELECT Id, Correo, Estado FROM LOGIN WHERE Estado = 'Pendiente' ORDER BY Id DESC",
    );
    const act = await db.getAllAsync<UsuarioActivo>(
      "SELECT Id, Correo, Rol, Estado FROM LOGIN WHERE Estado = 'Activo' AND Rol != 'admin' ORDER BY Correo",
    );
    setPendientes(pend.map((u) => ({ ...u, rolSeleccionado: 'cliente' })));
    setActivos(act);
    setLoading(false);
    setRefreshing(false);
  }, [db]);

  // Las pestañas no se desmontan: sin esto la pantalla se queda con los datos
  // que leyó la primera vez. Se recarga cada vez que vuelve al frente.
  useFocusEffect(useCallback(() => { cargarDatos(); }, [cargarDatos]));

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current); }, []);

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo });
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setMensaje(null), 4500);
  };

  const activarCuenta = async (usuario: UsuarioPendiente) => {
    setProcesando(usuario.Id);
    try {
      await db.runAsync(
        "UPDATE LOGIN SET Estado = 'Activo', Rol = ? WHERE Id = ?",
        usuario.rolSeleccionado,
        usuario.Id,
      );
      mostrarMensaje(`${usuario.Correo} entra como ${usuario.rolSeleccionado}`, 'ok');
      await cargarDatos();
    } catch {
      mostrarMensaje('No se pudo activar la cuenta. Inténtalo otra vez.', 'error');
    } finally {
      setProcesando(null);
    }
  };

  const cambiarRolPendiente = (id: number, rol: 'admin' | 'cliente') => {
    setPendientes((prev) =>
      prev.map((u) => (u.Id === id ? { ...u, rolSeleccionado: rol } : u)),
    );
  };

  if (loading) return <Cargando />;

  return (
    <View style={s.pantalla}>
      {mensaje && (
        <View style={s.aviso}>
          <Aviso texto={mensaje.texto} tipo={mensaje.tipo} />
        </View>
      )}

      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarDatos(); }}
            tintColor={color.tinta}
            colors={[color.tinta]}
          />
        }
        ListHeaderComponent={
          <>
            <Cabecera
              rotulo="Solicitudes en espera"
              titulo={String(pendientes.length).padStart(2, '0')}
              apoyo={
                pendientes.length === 0
                  ? 'Nadie espera aprobación ahora mismo.'
                  : 'Cada una necesita un rol antes de poder entrar.'
              }
            />

            {pendientes.length === 0 ? (
              <Hoja>
                <Vacio
                  icono="user-check"
                  titulo="Bandeja al día"
                  cuerpo="Cuando alguien solicite acceso desde la pantalla de registro, aparecerá aquí para que le asignes un rol."
                />
              </Hoja>
            ) : (
              pendientes.map((u) => (
                <View key={u.Id} style={s.solicitud}>
                  <View style={s.solicitudEncabezado}>
                    <Text style={[texto.cuerpoFuerte, s.correo]} numberOfLines={1}>
                      {u.Correo}
                    </Text>
                    <Marca tono="espera">En espera</Marca>
                  </View>

                  <Placa style={s.rotuloRol}>Entra como</Placa>
                  <Selector
                    opciones={ROLES}
                    valor={u.rolSeleccionado}
                    onCambio={(rol) => cambiarRolPendiente(u.Id, rol)}
                  />

                  {/* Acción irreversible: aislada con espacio propio. */}
                  <View style={s.accion}>
                    <Text style={[texto.menor, s.consecuencia]}>
                      {u.rolSeleccionado === 'admin'
                        ? 'Como admin podrá aprobar cuentas y editar el inventario.'
                        : 'Como cliente podrá comprar, pero no editar el inventario.'}
                    </Text>
                    <Boton
                      tipo="contorno"
                      onPress={() => activarCuenta(u)}
                      cargando={procesando === u.Id}
                      icono="check"
                    >
                      Activar cuenta
                    </Boton>
                  </View>
                </View>
              ))
            )}

            <View style={s.separador}>
              <Cabecera
                rotulo="Cuentas activas"
                titulo={String(activos.length).padStart(2, '0')}
                apoyo="Clientes que ya pueden entrar. Los administradores no se listan aquí."
              />
            </View>
          </>
        }
        data={activos}
        keyExtractor={(item) => String(item.Id)}
        renderItem={({ item, index }) => (
          <FilaRegistro
            titulo={item.Correo}
            ultima={index === activos.length - 1}
            derecha={<Marca>{item.Rol === 'admin' ? 'Admin' : 'Cliente'}</Marca>}
          />
        )}
        ListEmptyComponent={
          <Hoja>
            <Vacio
              icono="users"
              titulo="Todavía nadie"
              cuerpo="Al activar una solicitud, la cuenta aparecerá en esta lista."
            />
          </Hoja>
        }
        contentContainerStyle={s.lista}
      />
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  lista: { paddingBottom: espacio.xxxl },
  aviso: { paddingHorizontal: espacio.base, paddingTop: espacio.md },
  solicitud: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
    padding: espacio.base,
    marginBottom: espacio.md,
  },
  solicitudEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacio.lg,
  },
  correo: { color: color.tinta, flex: 1, marginRight: espacio.md },
  rotuloRol: { marginBottom: espacio.sm },
  accion: { marginTop: espacio.xxl },
  consecuencia: { color: color.tintaMedia, marginBottom: espacio.md },
  separador: { marginTop: espacio.xl },
});
