import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { useMensajeFugaz } from '../../hooks/useMensajeFugaz';
import { useRecargarAlEnfocar } from '../../hooks/useRecargarAlEnfocar';
import { LoginRow } from '../../types';
import { Aviso, Cabecera, Cargando, FilaRegistro, Marca, Vacio, refresco } from '../../ui/componentes';
import { color, espacio } from '../../ui/tema';
import { Rol, SolicitudPendiente } from './SolicitudPendiente';

type Pendiente = Pick<LoginRow, 'Id' | 'Correo'> & { rol: Rol };
type Activo = Pick<LoginRow, 'Id' | 'Correo' | 'Rol'>;

export default function AdminCuentas() {
  const db = useSQLiteContext();
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [mensaje, mostrarMensaje] = useMensajeFugaz();

  const cargar = useCallback(async () => {
    const enEspera = await db.getAllAsync<Pick<LoginRow, 'Id' | 'Correo'>>(
      "SELECT Id, Correo FROM LOGIN WHERE Estado = 'Pendiente' ORDER BY Id DESC",
    );
    const activas = await db.getAllAsync<Activo>(
      "SELECT Id, Correo, Rol FROM LOGIN WHERE Estado = 'Activo' AND Rol != 'admin' ORDER BY Correo",
    );
    // El rol propuesto es estado de pantalla, no de base: arranca en cliente.
    setPendientes(enEspera.map((u) => ({ ...u, rol: 'cliente' })));
    setActivos(activas);
    setCargando(false);
    setRefrescando(false);
  }, [db]);

  useRecargarAlEnfocar(cargar);

  const activar = async (usuario: Pendiente) => {
    setProcesando(usuario.Id);
    try {
      await db.runAsync(
        "UPDATE LOGIN SET Estado = 'Activo', Rol = ? WHERE Id = ?",
        usuario.rol,
        usuario.Id,
      );
      mostrarMensaje(`${usuario.Correo} entra como ${usuario.rol}`, 'ok');
      await cargar();
    } catch {
      mostrarMensaje('No se pudo activar la cuenta. Inténtalo otra vez.', 'error');
    } finally {
      setProcesando(null);
    }
  };

  const cambiarRol = (id: number, rol: Rol) =>
    setPendientes((prev) => prev.map((u) => (u.Id === id ? { ...u, rol } : u)));

  if (cargando) return <Cargando />;

  return (
    <View style={s.pantalla}>
      {mensaje && (
        <View style={s.aviso}>
          <Aviso texto={mensaje.texto} tipo={mensaje.tipo} />
        </View>
      )}

      <FlatList
        refreshControl={refresco(refrescando, () => { setRefrescando(true); cargar(); })}
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
              <Vacio
                icono="user-check"
                titulo="Bandeja al día"
                cuerpo="Cuando alguien solicite acceso desde la pantalla de registro, aparecerá aquí para que le asignes un rol."
              />
            ) : (
              pendientes.map((u) => (
                <SolicitudPendiente
                  key={u.Id}
                  correo={u.Correo}
                  rol={u.rol}
                  procesando={procesando === u.Id}
                  onCambiarRol={(rol) => cambiarRol(u.Id, rol)}
                  onActivar={() => activar(u)}
                />
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
          <Vacio
            icono="users"
            titulo="Todavía nadie"
            cuerpo="Al activar una solicitud, la cuenta aparecerá en esta lista."
          />
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
  separador: { marginTop: espacio.xl },
});
