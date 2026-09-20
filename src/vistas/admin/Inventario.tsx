import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ProductoRow } from '../../types';

type FormProducto = {
  nombre: string;
  descripcion: string;
  valorUnitario: string;
  stock: string;
};

const FORM_VACIO: FormProducto = { nombre: '', descripcion: '', valorUnitario: '', stock: '' };

export default function Inventario() {
  const db = useSQLiteContext();
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<ProductoRow | null>(null);
  const [form, setForm] = useState<FormProducto>(FORM_VACIO);
  const [errores, setErrores] = useState<Partial<FormProducto>>({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null);

  const cargarProductos = useCallback(async () => {
    const rows = await db.getAllAsync<ProductoRow>(
      'SELECT Id, Nombre, Descripcion, ValorUnitario, Stock FROM PRODUCTOS ORDER BY Nombre',
    );
    setProductos(rows);
    setLoading(false);
    setRefreshing(false);
  }, [db]);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  // ── Validación ──────────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const e: Partial<FormProducto> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    const valor = parseFloat(form.valorUnitario);
    if (isNaN(valor) || valor <= 0) e.valorUnitario = 'Debe ser un número positivo.';
    const stock = parseInt(form.stock, 10);
    if (isNaN(stock) || stock < 0) e.stock = 'Debe ser un entero ≥ 0.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  // ── Abrir formulario ────────────────────────────────────────────────────────
  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setErrores({});
    setModalVisible(true);
  };

  const abrirEditar = (p: ProductoRow) => {
    setEditando(p);
    setForm({
      nombre: p.Nombre,
      descripcion: p.Descripcion ?? '',
      valorUnitario: String(p.ValorUnitario),
      stock: String(p.Stock),
    });
    setErrores({});
    setModalVisible(true);
  };

  // ── Guardar ─────────────────────────────────────────────────────────────────
  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const valor = parseFloat(form.valorUnitario);
      const stock = parseInt(form.stock, 10);

      if (editando) {
        await db.runAsync(
          'UPDATE PRODUCTOS SET Nombre=?, Descripcion=?, ValorUnitario=?, Stock=? WHERE Id=?',
          form.nombre.trim(),
          form.descripcion.trim() || null,
          valor,
          stock,
          editando.Id,
        );
        mostrarMensaje('✅ Producto actualizado', 'ok');
      } else {
        await db.runAsync(
          'INSERT INTO PRODUCTOS (Nombre, Descripcion, ValorUnitario, Stock) VALUES (?,?,?,?)',
          form.nombre.trim(),
          form.descripcion.trim() || null,
          valor,
          stock,
        );
        mostrarMensaje('✅ Producto creado', 'ok');
      }

      setModalVisible(false);
      await cargarProductos();
    } catch {
      mostrarMensaje('❌ Error al guardar el producto', 'error');
    } finally {
      setGuardando(false);
    }
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
      {/* Flash */}
      {mensaje && (
        <View style={[styles.flash, mensaje.tipo === 'ok' ? styles.flashOk : styles.flashError]}>
          <Text style={styles.flashText}>{mensaje.texto}</Text>
        </View>
      )}

      {/* Lista */}
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.Id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarProductos(); }}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No hay productos. Agrega el primero.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => abrirEditar(item)} activeOpacity={0.8}>
            <View style={styles.cardTop}>
              <Text style={styles.cardNombre}>{item.Nombre}</Text>
              <View style={[styles.stockBadge, item.Stock === 0 && styles.stockAgotado]}>
                <Text style={styles.stockText}>Stock: {item.Stock}</Text>
              </View>
            </View>
            {item.Descripcion ? (
              <Text style={styles.cardDescripcion} numberOfLines={2}>{item.Descripcion}</Text>
            ) : null}
            <Text style={styles.cardPrecio}>
              ${item.ValorUnitario.toFixed(2)} <Text style={styles.cardHint}>· toca para editar</Text>
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />

      {/* Botón agregar */}
      <TouchableOpacity style={styles.fab} onPress={abrirNuevo}>
        <Text style={styles.fabText}>＋ Nuevo producto</Text>
      </TouchableOpacity>

      {/* ── Modal formulario ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>
                {editando ? '✏️ Editar producto' : '➕ Nuevo producto'}
              </Text>

              <Text style={styles.fieldLabel}>Nombre *</Text>
              <TextInput
                style={[styles.input, errores.nombre && styles.inputError]}
                placeholder="Nombre del producto"
                placeholderTextColor="#9aa0a6"
                value={form.nombre}
                onChangeText={(v) => { setForm((f) => ({ ...f, nombre: v })); setErrores((e) => ({ ...e, nombre: undefined })); }}
              />
              {errores.nombre && <Text style={styles.fieldError}>{errores.nombre}</Text>}

              <Text style={styles.fieldLabel}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Descripción opcional"
                placeholderTextColor="#9aa0a6"
                multiline
                numberOfLines={3}
                value={form.descripcion}
                onChangeText={(v) => setForm((f) => ({ ...f, descripcion: v }))}
              />

              <Text style={styles.fieldLabel}>Valor unitario *</Text>
              <TextInput
                style={[styles.input, errores.valorUnitario && styles.inputError]}
                placeholder="0.00"
                placeholderTextColor="#9aa0a6"
                keyboardType="decimal-pad"
                value={form.valorUnitario}
                onChangeText={(v) => { setForm((f) => ({ ...f, valorUnitario: v })); setErrores((e) => ({ ...e, valorUnitario: undefined })); }}
              />
              {errores.valorUnitario && <Text style={styles.fieldError}>{errores.valorUnitario}</Text>}

              <Text style={styles.fieldLabel}>Stock *</Text>
              <TextInput
                style={[styles.input, errores.stock && styles.inputError]}
                placeholder="0"
                placeholderTextColor="#9aa0a6"
                keyboardType="number-pad"
                value={form.stock}
                onChangeText={(v) => { setForm((f) => ({ ...f, stock: v })); setErrores((e) => ({ ...e, stock: undefined })); }}
              />
              {errores.stock && <Text style={styles.fieldError}>{errores.stock}</Text>}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                  disabled={guardando}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, guardando && styles.btnDisabled]}
                  onPress={guardar}
                  disabled={guardando}
                >
                  {guardando
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveBtnText}>{editando ? 'Actualizar' : 'Crear'}</Text>
                  }
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 100 },
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
  cardDescripcion: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  cardPrecio: { color: '#60a5fa', fontSize: 15, fontWeight: '700' },
  cardHint: { color: '#475569', fontSize: 12, fontWeight: '400' },
  stockBadge: {
    backgroundColor: '#14532d',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stockAgotado: { backgroundColor: '#450a0a' },
  stockText: { color: '#86efac', fontSize: 13, fontWeight: '700' },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#475569', fontSize: 15 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  fieldLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
    color: '#f8fafc',
    fontSize: 16,
  },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#fca5a5', fontSize: 13, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 8 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#94a3b8', fontWeight: '700', fontSize: 15 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  flash: { margin: 16, marginBottom: 0, padding: 12, borderRadius: 10 },
  flashOk: { backgroundColor: '#14532d' },
  flashError: { backgroundColor: '#450a0a' },
  flashText: { color: '#f8fafc', fontWeight: '600', textAlign: 'center' },
});
