import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useCarrito } from '../../context/CarritoContext';
import { ProductoRow } from '../../types';

export default function Productos() {
  const db = useSQLiteContext();
  const { agregarItem, items } = useCarrito();
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seleccionado, setSeleccionado] = useState<ProductoRow | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [errorCantidad, setErrorCantidad] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const rows = await db.getAllAsync<ProductoRow>(
      'SELECT Id, Nombre, Descripcion, ValorUnitario, Stock FROM PRODUCTOS WHERE Stock > 0 ORDER BY Nombre',
    );
    setProductos(rows);
    setLoading(false);
    setRefreshing(false);
  }, [db]);

  useEffect(() => { cargar(); }, [cargar]);

  const cantidadEnCarrito = (id: number) =>
    items.find((i) => i.producto.Id === id)?.cantidad ?? 0;

  const abrirModal = (p: ProductoRow) => {
    const enCarrito = cantidadEnCarrito(p.Id);
    setCantidad(String(enCarrito > 0 ? enCarrito : 1));
    setErrorCantidad(null);
    setSeleccionado(p);
  };

  const confirmarAgregado = () => {
    if (!seleccionado) return;
    const n = parseInt(cantidad, 10);
    if (isNaN(n) || n < 1) {
      setErrorCantidad('La cantidad debe ser al menos 1.');
      return;
    }
    if (n > seleccionado.Stock) {
      setErrorCantidad(`Stock disponible: ${seleccionado.Stock}`);
      return;
    }
    agregarItem(seleccionado, n);
    setSeleccionado(null);
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
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.Id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargar(); }}
            tintColor="#3b82f6"
          />
        }
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>🛍️ Productos disponibles</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No hay productos disponibles en este momento</Text>
          </View>
        }
        renderItem={({ item }) => {
          const enCarrito = cantidadEnCarrito(item.Id);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardNombre}>{item.Nombre}</Text>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>Stock: {item.Stock}</Text>
                </View>
              </View>
              {item.Descripcion ? (
                <Text style={styles.cardDescripcion} numberOfLines={2}>{item.Descripcion}</Text>
              ) : null}
              <View style={styles.cardBottom}>
                <Text style={styles.cardPrecio}>${item.ValorUnitario.toFixed(2)}</Text>
                <TouchableOpacity
                  style={[styles.addBtn, enCarrito > 0 && styles.addBtnActive]}
                  onPress={() => abrirModal(item)}
                >
                  <Text style={styles.addBtnText}>
                    {enCarrito > 0 ? `✓ x${enCarrito}` : '+ Agregar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.list}
      />

      {/* Modal selector de cantidad */}
      <Modal visible={!!seleccionado} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {seleccionado && (
              <>
                <Text style={styles.modalTitle}>{seleccionado.Nombre}</Text>
                <Text style={styles.modalSub}>
                  ${seleccionado.ValorUnitario.toFixed(2)} · Stock disponible: {seleccionado.Stock}
                </Text>
                <Text style={styles.cantidadLabel}>Cantidad</Text>
                <TextInput
                  style={[styles.cantidadInput, errorCantidad && styles.inputError]}
                  keyboardType="number-pad"
                  value={cantidad}
                  onChangeText={(v) => { setCantidad(v); setErrorCantidad(null); }}
                  selectTextOnFocus
                />
                {errorCantidad && <Text style={styles.fieldError}>{errorCantidad}</Text>}
                <View style={styles.modalBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setSeleccionado(null)}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={confirmarAgregado}>
                    <Text style={styles.confirmBtnText}>Agregar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardNombre: { color: '#f8fafc', fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  cardDescripcion: { color: '#94a3b8', fontSize: 14, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrecio: { color: '#60a5fa', fontSize: 17, fontWeight: '700' },
  stockBadge: { backgroundColor: '#14532d', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  stockText: { color: '#86efac', fontSize: 13, fontWeight: '700' },
  addBtn: {
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  addBtnActive: { backgroundColor: '#14532d', borderColor: '#16a34a' },
  addBtnText: { color: '#60a5fa', fontWeight: '700', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#475569', fontSize: 15, textAlign: 'center' },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 32 },
  modalCard: { backgroundColor: '#111827', borderRadius: 20, padding: 24 },
  modalTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalSub: { color: '#94a3b8', fontSize: 14, marginBottom: 20 },
  cantidadLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  cantidadInput: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#fca5a5', fontSize: 13, marginBottom: 12 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn: { flex: 1, backgroundColor: '#1f2937', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelBtnText: { color: '#94a3b8', fontWeight: '700', fontSize: 15 },
  confirmBtn: { flex: 1, backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
