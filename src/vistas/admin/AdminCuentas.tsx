import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LoginRow } from '../../types';

type UsuarioPendiente = Pick<LoginRow, 'Id' | 'Correo' | 'Estado'> & { rolSeleccionado: 'admin' | 'cliente' };

type UsuarioActivo = Pick<LoginRow, 'Id' | 'Correo' | 'Rol' | 'Estado'>;

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

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  const activarCuenta = async (usuario: UsuarioPendiente) => {
    setProcesando(usuario.Id);
    try {
      await db.runAsync(
        "UPDATE LOGIN SET Estado = 'Activo', Rol = ? WHERE Id = ?",
        usuario.rolSeleccionado,
        usuario.Id,
      );
      mostrarMensaje(`✅ Cuenta activada como ${usuario.rolSeleccionado}`, 'ok');
      await cargarDatos();
    } catch {
      mostrarMensaje('❌ Error al activar la cuenta', 'error');
    } finally {
      setProcesando(null);
    }
  };

  const cambiarRolPendiente = (id: number, rol: 'admin' | 'cliente') => {
    setPendientes((prev) =>
      prev.map((u) => (u.Id === id ? { ...u, rolSeleccionado: rol } : u)),
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mensaje flash */}
      {mensaje && (
        <View style={[styles.flash, mensaje.tipo === 'ok' ? styles.flashOk : styles.flashError]}>
          <Text style={styles.flashText}>{mensaje.texto}</Text>
        </View>
      )}

      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarDatos(); }}
            tintColor="#3b82f6"
          />
        }
        ListHeaderComponent={
          <>
            {/* ── Solicitudes pendientes ── */}
            <Text style={styles.sectionTitle}>⏳ Solicitudes pendientes</Text>
            {pendientes.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
              </View>
            )}
            {pendientes.map((u) => (
              <View key={u.Id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmail}>{u.Correo}</Text>
                  <View style={styles.badgePendiente}>
                    <Text style={styles.badgeText}>Pendiente</Text>
                  </View>
                </View>

                {/* Selector de rol */}
                <Text style={styles.rolLabel}>Asignar rol:</Text>
                <View style={styles.rolRow}>
                  <TouchableOpacity
                    style={[
                      styles.rolBtn,
                      u.rolSeleccionado === 'cliente' && styles.rolBtnActive,
                    ]}
                    onPress={() => cambiarRolPendiente(u.Id, 'cliente')}
                  >
                    <Text style={[styles.rolBtnText, u.rolSeleccionado === 'cliente' && styles.rolBtnTextActive]}>
                      Cliente
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.rolBtn,
                      u.rolSeleccionado === 'admin' && styles.rolBtnActive,
                    ]}
                    onPress={() => cambiarRolPendiente(u.Id, 'admin')}
                  >
                    <Text style={[styles.rolBtnText, u.rolSeleccionado === 'admin' && styles.rolBtnTextActive]}>
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.activarBtn, procesando === u.Id && styles.btnDisabled]}
                  onPress={() => activarCuenta(u)}
                  disabled={procesando === u.Id}
                >
                  {procesando === u.Id
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.activarBtnText}>Activar cuenta</Text>
                  }
                </TouchableOpacity>
              </View>
            ))}

            {/* ── Usuarios activos ── */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>✅ Usuarios activos</Text>
            {activos.length === 0 && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Aún no hay usuarios activos</Text>
              </View>
            )}
          </>
        }
        data={activos}
        keyExtractor={(item) => String(item.Id)}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.cardActivo]}>
            <Text style={styles.cardEmail}>{item.Correo}</Text>
            <View style={[styles.badgePendiente, { backgroundColor: '#14532d' }]}>
              <Text style={[styles.badgeText, { color: '#86efac' }]}>
                {item.Rol === 'admin' ? 'Admin' : 'Cliente'}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardActivo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardEmail: { color: '#f8fafc', fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  badgePendiente: {
    backgroundColor: '#431407',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: '#fdba74', fontSize: 12, fontWeight: '700' },
  rolLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 8 },
  rolRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  rolBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  rolBtnActive: { borderColor: '#3b82f6', backgroundColor: '#1e3a5f' },
  rolBtnText: { color: '#64748b', fontWeight: '600' },
  rolBtnTextActive: { color: '#60a5fa' },
  activarBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  activarBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emptyBox: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderStyle: 'dashed',
  },
  emptyText: { color: '#475569', fontSize: 14 },
  flash: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 10,
  },
  flashOk: { backgroundColor: '#14532d' },
  flashError: { backgroundColor: '#450a0a' },
  flashText: { color: '#f8fafc', fontWeight: '600', textAlign: 'center' },
});
