import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type ClienteConCorreo = {
  Id: number;
  Nombre: string | null;
  Apellido: string | null;
  Correo: string | null;
  LoginCorreo: string;
};

export default function ListadoClientes() {
  const db = useSQLiteContext();
  const [clientes, setClientes] = useState<ClienteConCorreo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    const rows = await db.getAllAsync<ClienteConCorreo>(`
      SELECT
        c.Id,
        c.Nombre,
        c.Apellido,
        c.Correo,
        l.Correo AS LoginCorreo
      FROM CLIENTES c
      JOIN LOGIN l ON l.Id = c.IdLogin
      ORDER BY c.Apellido, c.Nombre
    `);
    setClientes(rows);
    setLoading(false);
    setRefreshing(false);
  }, [db]);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={clientes}
      keyExtractor={(item) => String(item.Id)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); cargar(); }}
          tintColor="#3b82f6"
        />
      }
      ListHeaderComponent={
        <Text style={styles.sectionTitle}>🗂️ Listado de clientes ({clientes.length})</Text>
      }
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyText}>Aún no hay clientes registrados</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.Nombre ?? item.LoginCorreo)[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.nombre}>
              {item.Nombre && item.Apellido
                ? `${item.Nombre} ${item.Apellido}`
                : '(Sin nombre)'
              }
            </Text>
            <Text style={styles.correo}>{item.Correo ?? item.LoginCorreo}</Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.list}
    />
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
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#60a5fa', fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  nombre: { color: '#f8fafc', fontSize: 15, fontWeight: '600' },
  correo: { color: '#64748b', fontSize: 13, marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#475569', fontSize: 15 },
});
