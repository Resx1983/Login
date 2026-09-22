import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { ClienteRow } from '../../types';
import { Boton, Cargando, Enlace, FilaRegistro, Placa, Vacio } from '../../ui/componentes';
import { CIFRAS_TABULARES, TOQUE_MINIMO, color, dinero, espacio, texto } from '../../ui/tema';

type CompraEstado = 'carrito' | 'confirmando' | 'exitosa' | 'error';

export default function Compra() {
  const db = useSQLiteContext();
  const navegacion = useNavigation<{ navigate: (pantalla: string) => void }>();
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

  // Las pestañas no se desmontan: sin esto la pantalla se queda con los datos
  // que leyó la primera vez. Se recarga cada vez que vuelve al frente.
  useFocusEffect(useCallback(() => { cargarPerfil(); }, [cargarPerfil]));

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
              `Ya no queda suficiente "${item.producto.Nombre}". Disponible ahora: ${p?.Stock ?? 0}.`,
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
      const msg = err instanceof Error ? err.message : 'No se pudo registrar la compra.';
      setMensajeError(msg);
      setEstado('error');
    }
  };

  if (cargandoPerfil) return <Cargando />;

  // ── Guard: perfil incompleto ─────────────────────────────────────────────
  if (!cliente) {
    return (
      <View style={s.hueco}>
        <Vacio
          icono="user"
          titulo="Falta tu perfil"
          cuerpo="Abre la pestaña Perfil y guarda tu nombre y apellido. Una compra se registra siempre a nombre de alguien."
        />
      </View>
    );
  }

  // ── Compra registrada ────────────────────────────────────────────────────
  if (estado === 'exitosa') {
    return (
      <View style={s.resultado}>
        <View>
          <Placa>Compra registrada</Placa>
          <Text style={[texto.mega, s.resultadoCifra]}>
            PEDIDO{'\n'}#{idCompraGenerada}
          </Text>
          <View style={s.reglaFlash} />
          <Text style={[texto.cuerpo, s.resultadoCuerpo]}>
            Quedó guardada a nombre de {cliente.Nombre} {cliente.Apellido} y el stock ya se
            descontó del inventario.
          </Text>
        </View>

        <View>
          <Boton onPress={() => setEstado('carrito')} icono="plus">
            Empezar otra compra
          </Boton>
          <Enlace onPress={() => { setEstado('carrito'); navegacion.navigate('Pedidos'); }}>
            Ver todos mis pedidos
          </Enlace>
        </View>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (estado === 'error') {
    return (
      <View style={s.resultado}>
        <View>
          <Text style={[texto.gigante, s.resultadoCifra]}>COMPRA{'\n'}RECHAZADA</Text>
          <View style={s.reglaAlerta} />
          <Text style={[texto.cuerpo, s.resultadoCuerpo]}>{mensajeError}</Text>
          <Text style={[texto.menor, s.resultadoNota]}>
            El inventario quedó intacto. Ajusta las cantidades y vuelve a intentarlo.
          </Text>
        </View>

        <Boton onPress={() => setEstado('carrito')} tipo="contorno" icono="arrow-left">
          Volver al pedido
        </Boton>
      </View>
    );
  }

  // ── Carrito vacío ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <View style={s.hueco}>
        <Vacio
          icono="shopping-bag"
          titulo="Pedido vacío"
          cuerpo="Ve a Productos y usa el contador de cada fila para armar el pedido. El total aparecerá aquí."
        />
      </View>
    );
  }

  // ── Pedido ───────────────────────────────────────────────────────────────
  const confirmando = estado === 'confirmando';

  return (
    <View style={s.pantalla}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* La cifra manda */}
        <View style={s.totalBloque}>
          <Placa>Total del pedido</Placa>
          <Text style={[texto.mega, s.total]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
            {dinero(totalCompra)}
          </Text>
          <Text style={[texto.menor, s.totalDetalle]}>
            {totalItems} {totalItems === 1 ? 'unidad' : 'unidades'} ·{' '}
            {items.length} {items.length === 1 ? 'producto' : 'productos'} · a nombre de{' '}
            {cliente.Nombre} {cliente.Apellido}
          </Text>
        </View>

        <View style={s.detalle}>
          {items.map((item, i) => (
            <FilaRegistro
              key={item.producto.Id}
              titulo={item.producto.Nombre}
              ultima={i === items.length - 1}
              apoyo={`${item.cantidad} × ${dinero(item.producto.ValorUnitario)} · de ${
                item.producto.Stock
              } que había al agregarlo`}
              derecha={
                <View style={s.lineaDerecha}>
                  <Text style={[texto.titulo, s.lineaSubtotal]} numberOfLines={1} adjustsFontSizeToFit>
                    {dinero(item.cantidad * item.producto.ValorUnitario)}
                  </Text>
                  <Pressable
                    onPress={() => quitarItem(item.producto.Id)}
                    disabled={confirmando}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar ${item.producto.Nombre} del pedido`}
                    android_ripple={{ color: 'rgba(21,20,15,0.12)' }}
                    style={({ pressed }) => [s.quitar, pressed && { opacity: 0.5 }]}
                  >
                    <Feather name="x" size={17} color={color.tintaMedia} />
                  </Pressable>
                </View>
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* Acción irreversible: aislada, y dice qué va a pasar */}
      <View style={s.pie}>
        <Text style={[texto.menor, s.consecuencia]}>
          Al confirmar se descuenta el stock de estos {items.length}{' '}
          {items.length === 1 ? 'producto' : 'productos'}. No se puede deshacer.
        </Text>
        <Boton onPress={confirmarCompra} cargando={confirmando} icono="check">
          {`Confirmar · ${dinero(totalCompra)}`}
        </Boton>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  scroll: { paddingBottom: espacio.xxxl },
  hueco: { flex: 1, backgroundColor: color.tabla, justifyContent: 'center' },
  totalBloque: {
    backgroundColor: color.lamina,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.regla,
    paddingHorizontal: espacio.base,
    paddingTop: espacio.xl,
    paddingBottom: espacio.lg,
  },
  total: { color: color.tinta, marginTop: espacio.sm, ...CIFRAS_TABULARES },
  totalDetalle: { color: color.tintaMedia, marginTop: espacio.md },
  detalle: {
    marginTop: espacio.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
  },
  lineaDerecha: { alignItems: 'flex-end' },
  lineaSubtotal: { color: color.tinta, ...CIFRAS_TABULARES },
  quitar: { width: TOQUE_MINIMO, height: TOQUE_MINIMO, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pie: {
    padding: espacio.base,
    backgroundColor: color.tabla,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.regla,
  },
  consecuencia: { color: color.tintaMedia, marginBottom: espacio.md },
  // Resultado
  resultado: {
    flex: 1,
    backgroundColor: color.tabla,
    paddingHorizontal: espacio.base,
    paddingVertical: espacio.xxxl,
    justifyContent: 'space-between',
  },
  resultadoCifra: { color: color.tinta, marginTop: espacio.sm },
  reglaFlash: { height: 3, width: 56, backgroundColor: color.tinta, marginVertical: espacio.lg },
  reglaAlerta: { height: 3, width: 56, backgroundColor: color.alerta, marginVertical: espacio.lg },
  resultadoCuerpo: { color: color.tintaMedia, maxWidth: 340 },
  resultadoNota: { color: color.tintaMedia, marginTop: espacio.md },
});
