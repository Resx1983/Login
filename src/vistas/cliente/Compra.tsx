import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { registrarCompra } from '../../datos/compras';
import { useRecargarAlEnfocar } from '../../hooks/useRecargarAlEnfocar';
import { ClienteRow } from '../../types';
import { Boton, Cargando, Pie, Placa, Vacio } from '../../ui/componentes';
import { CIFRAS_TABULARES, color, dinero, espacio, texto } from '../../ui/tema';
import { LineaPedido } from './LineaPedido';
import { CompraRechazada, CompraRegistrada } from './ResultadoCompra';

type Estado = 'carrito' | 'confirmando' | 'exitosa' | 'error';

export default function Compra() {
  const db = useSQLiteContext();
  const navegacion = useNavigation<{ navigate: (pantalla: string) => void }>();
  const { usuario } = useAuth();
  const { items, quitarItem, limpiarCarrito, totalItems } = useCarrito();

  const [cliente, setCliente] = useState<ClienteRow | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [estado, setEstado] = useState<Estado>('carrito');
  const [motivoError, setMotivoError] = useState('');
  const [idPedido, setIdPedido] = useState<number | null>(null);

  const cargarPerfil = useCallback(async () => {
    if (!usuario) return;
    const row = await db.getFirstAsync<ClienteRow>(
      'SELECT * FROM CLIENTES WHERE IdLogin = ? AND Nombre IS NOT NULL AND Apellido IS NOT NULL',
      usuario.id,
    );
    setCliente(row ?? null);
    setCargandoPerfil(false);
  }, [db, usuario]);

  useRecargarAlEnfocar(cargarPerfil);

  const total = items.reduce((suma, i) => suma + i.producto.ValorUnitario * i.cantidad, 0);

  const confirmar = async () => {
    if (!cliente) return;
    setEstado('confirmando');
    try {
      setIdPedido(await registrarCompra(db, cliente.Id, items, total));
      limpiarCarrito();
      setEstado('exitosa');
    } catch (err: unknown) {
      setMotivoError(err instanceof Error ? err.message : 'No se pudo registrar la compra.');
      setEstado('error');
    }
  };

  if (cargandoPerfil) return <Cargando />;

  if (!cliente) {
    return (
      <Vacio
        variante="centrado"
        icono="user"
        titulo="Falta tu perfil"
        cuerpo="Abre la pestaña Perfil y guarda tu nombre y apellido. Una compra se registra siempre a nombre de alguien."
      />
    );
  }

  if (estado === 'exitosa') {
    return (
      <CompraRegistrada
        idPedido={idPedido}
        nombreCliente={`${cliente.Nombre} ${cliente.Apellido}`}
        onNuevaCompra={() => setEstado('carrito')}
        onVerPedidos={() => { setEstado('carrito'); navegacion.navigate('Pedidos'); }}
      />
    );
  }

  if (estado === 'error') {
    return <CompraRechazada motivo={motivoError} onVolver={() => setEstado('carrito')} />;
  }

  if (items.length === 0) {
    return (
      <Vacio
        variante="centrado"
        icono="shopping-bag"
        titulo="Pedido vacío"
        cuerpo="Ve a Productos y usa el contador de cada fila para armar el pedido. El total aparecerá aquí."
      />
    );
  }

  const confirmando = estado === 'confirmando';

  return (
    <View style={s.pantalla}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* La cifra manda */}
        <View style={s.totalBloque}>
          <Placa>Total del pedido</Placa>
          <Text style={[texto.mega, s.total]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
            {dinero(total)}
          </Text>
          <Text style={[texto.menor, s.totalApoyo]}>
            {totalItems} {totalItems === 1 ? 'unidad' : 'unidades'} ·{' '}
            {items.length} {items.length === 1 ? 'producto' : 'productos'} · a nombre de{' '}
            {cliente.Nombre} {cliente.Apellido}
          </Text>
        </View>

        <View style={s.detalle}>
          {items.map((item, i) => (
            <LineaPedido
              key={item.producto.Id}
              item={item}
              ultima={i === items.length - 1}
              bloqueada={confirmando}
              onQuitar={() => quitarItem(item.producto.Id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Acción irreversible: aislada, y dice qué va a pasar antes de tocarla */}
      <Pie>
        <Text style={[texto.menor, s.consecuencia]}>
          Al confirmar se descuenta el stock de estos {items.length}{' '}
          {items.length === 1 ? 'producto' : 'productos'}. No se puede deshacer.
        </Text>
        <Boton onPress={confirmar} cargando={confirmando} icono="check">
          {`Confirmar · ${dinero(total)}`}
        </Boton>
      </Pie>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  scroll: { paddingBottom: espacio.xxxl },
  totalBloque: {
    backgroundColor: color.lamina,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.regla,
    paddingHorizontal: espacio.base,
    paddingTop: espacio.xl,
    paddingBottom: espacio.lg,
  },
  total: { color: color.tinta, marginTop: espacio.sm, ...CIFRAS_TABULARES },
  totalApoyo: { color: color.tintaMedia, marginTop: espacio.md },
  detalle: {
    marginTop: espacio.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
  },
  consecuencia: { color: color.tintaMedia, marginBottom: espacio.md },
});
