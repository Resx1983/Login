import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { ClienteRow } from '../../types';

type CompraEstado = 'carrito' | 'confirmando' | 'exitosa' | 'error';

export default function Compra() {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const { items, quitarItem, limpiarCarrito, totalItems } = useCarrito();
  const [cliente, setCliente] = useState<ClienteRow | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [estado, setEstado] = useState<CompraEstado>('carrito');
  const [mensajeError, setMensajeError] = useState('');
  const [idCompraGenerada, setIdCompraGenerada] = useState<number | null>(null);

  const cargarPerfil = useCallback(async () => {
    if (!usuario) return;
    const row = await db.getFirstAsync<ClienteRow>(
      'SELECT * FROM CLIENTES WHERE IdLogin = ? AND Nombre IS NOT NULL AND Apellido IS NOT NULL',
      usuario.id,
    );
    setCliente(row ?? null);
    setCargandoPerfil(false);
  }, [db, usuario]);

  useEffect(() => { cargarPerfil(); }, [cargarPerfil]);

  const totalCompra = items.reduce(
    (sum, i) => sum + i.producto.ValorUnitario * i.cantidad,
    0,
  );

  // ── Confirmar compra: transacción atómica ────────────────────────────────
  const confirmarCompra = async () => {
    if (!cliente) return;
    setEstado('confirmando');

    try {
      await db.withTransactionAsync(async () => {
        // 1. Verificar stock actualizado por cada ítem
        for (const item of items) {
          const p = await db.getFirstAsync<{ Stock: number }>(
            'SELECT Stock FROM PRODUCTOS WHERE Id = ?',
            item.producto.Id,
          );
          if (!p || p.Stock < item.cantidad) {
            throw new Error(
              `Stock insuficiente para "${item.producto.Nombre}". Disponible: ${p?.Stock ?? 0}`,
            );
          }
        }

        // 2. Insertar encabezado
        const result = await db.runAsync(
          "INSERT INTO ENCABEZADO (IdCliente, Fecha, Total) VALUES (?, date('now'), ?)",
          cliente.Id,
          totalCompra,
        );
        const idEncabezado = result.lastInsertRowId;

        // 3. Insertar detalles y descontar stock
        for (const item of items) {
          const subtotal = item.producto.ValorUnitario * item.cantidad;
          await db.runAsync(
            'INSERT INTO DETALLES (IdEncabezado, IdProducto, Cantidad, Subtotal) VALUES (?,?,?,?)',
            idEncabezado,
            item.producto.Id,
            item.cantidad,
            subtotal,
          );
          await db.runAsync(
            'UPDATE PRODUCTOS SET Stock = Stock - ? WHERE Id = ?',
            item.cantidad,
            item.producto.Id,
          );
        }

        setIdCompraGenerada(idEncabezado);
      });

      limpiarCarrito();
      setEstado('exitosa');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la compra.';
      setMensajeError(msg);
      setEstado('error');
    }
  };

  // ── Loading perfil ───────────────────────────────────────────────────────
  if (cargandoPerfil) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // ── Guard: perfil incompleto ─────────────────────────────────────────────
  if (!cliente) {
    return (
      <View style={styles.center}>
        <View style={styles.guardBox}>
          <Text style={styles.guardIcon}>⚠️</Text>
          <Text style={styles.guardTitle}>Perfil incompleto</Text>
          <Text style={styles.guardText}>
            Debes completar tu perfil en la pestaña "Mi Perfil" antes de poder realizar compras.
          </Text>
        </View>
      </View>
    );
  }

  // ── Guard: sin productos disponibles en el sistema ───────────────────────
  // (validado en la pantalla de Productos al agregar)

  // ── Pantalla: compra exitosa ─────────────────────────────────────────────
  if (estado === 'exitosa') {
    return (
      <View style={styles.center}>
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>¡Compra realizada!</Text>
          <Text style={styles.successSub}>Pedido #{idCompraGenerada}</Text>
          <Text style={styles.successText}>
            Tu pedido ha sido registrado correctamente. El inventario fue actualizado.
          </Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setEstado('carrito')}>
            <Text style={styles.newBtnText}>Nueva compra</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Pantalla: error ──────────────────────────────────────────────────────
  if (estado === 'error') {
    return (
      <View style={styles.center}>
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Error en la compra</Text>
          <Text style={styles.errorText}>{mensajeError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setEstado('carrito')}>
            <Text style={styles.retryBtnText}>Volver al carrito</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Carrito vacío ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.guardBox}>
          <Text style={styles.guardIcon}>🛒</Text>
          <Text style={styles.guardTitle}>Carrito vacío</Text>
          <Text style={styles.guardText}>
            Agrega productos desde la pestaña "Productos" para poder continuar.
          </Text>
        </View>
      </View>
    );
  }

  // ── Vista principal: carrito ─────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>🛒 Resumen de compra</Text>

        {/* Datos del cliente */}
        <View style={styles.clienteCard}>
          <Text style={styles.clienteLabel}>Cliente</Text>
          <Text style={styles.clienteNombre}>{cliente.Nombre} {cliente.Apellido}</Text>
          <Text style={styles.clienteCorreo}>{cliente.Correo}</Text>
        </View>

        {/* Items */}
        {items.map((item) => (
          <View key={item.producto.Id} style={styles.itemCard}>
            <View style={styles.itemTop}>
              <Text style={styles.itemNombre}>{item.producto.Nombre}</Text>
              <TouchableOpacity onPress={() => quitarItem(item.producto.Id)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.itemBottom}>
              <Text style={styles.itemDetalle}>
                {item.cantidad} × ${item.producto.ValorUnitario.toFixed(2)}
              </Text>
              <Text style={styles.itemSubtotal}>
                ${(item.cantidad * item.producto.ValorUnitario).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${totalCompra.toFixed(2)}</Text>
        </View>
      </ScrollView>

      {/* Botón confirmar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, estado === 'confirmando' && styles.btnDisabled]}
          onPress={confirmarCompra}
          disabled={estado === 'confirmando'}
        >
          {estado === 'confirmando'
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>Confirmar compra · ${totalCompra.toFixed(2)}</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: 16, paddingBottom: 100 },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  clienteCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  clienteLabel: { color: '#64748b', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  clienteNombre: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  clienteCorreo: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  itemCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemNombre: { color: '#f8fafc', fontSize: 15, fontWeight: '600', flex: 1 },
  removeText: { color: '#ef4444', fontSize: 16, paddingHorizontal: 4 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  itemDetalle: { color: '#94a3b8', fontSize: 14 },
  itemSubtotal: { color: '#60a5fa', fontSize: 15, fontWeight: '700' },
  totalCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  totalLabel: { color: '#bfdbfe', fontSize: 16, fontWeight: '700' },
  totalValue: { color: '#f8fafc', fontSize: 22, fontWeight: '800' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  confirmBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  // Guards y estados
  guardBox: { backgroundColor: '#111827', borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#1f2937' },
  guardIcon: { fontSize: 48, marginBottom: 12 },
  guardTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  guardText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  successBox: { backgroundColor: '#14532d', borderRadius: 16, padding: 24, alignItems: 'center', width: '100%' },
  successIcon: { fontSize: 56, marginBottom: 12 },
  successTitle: { color: '#f0fdf4', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  successSub: { color: '#86efac', fontSize: 15, marginBottom: 12 },
  successText: { color: '#dcfce7', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  newBtn: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorBox: { backgroundColor: '#450a0a', borderRadius: 16, padding: 24, alignItems: 'center', width: '100%' },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorTitle: { color: '#fef2f2', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  errorText: { color: '#fca5a5', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  retryBtn: { backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
