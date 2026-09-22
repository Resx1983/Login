import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { Cabecera, Cargando, FilaRegistro, Vacio } from '../../ui/componentes';
import { CIFRAS_TABULARES, color, dinero, espacio, texto } from '../../ui/tema';

type PedidoRow = { Id: number; Fecha: string; Total: number };

type LineaRow = {
  IdEncabezado: number;
  Nombre: string;
  Cantidad: number;
  Subtotal: number;
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** `Fecha` se guarda como 'AAAA-MM-DD'. Se parte a mano: `new Date` la leería
 *  como UTC y en husos negativos mostraría el día anterior. */
function fechaLegible(iso: string) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  if (!anio || !mes || !dia) return iso;
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

export default function Pedidos() {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoRow[]>([]);
  const [lineas, setLineas] = useState<LineaRow[]>([]);
  const [sinPerfil, setSinPerfil] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [abierto, setAbierto] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!usuario) return;

    const cliente = await db.getFirstAsync<{ Id: number }>(
      'SELECT Id FROM CLIENTES WHERE IdLogin = ?',
      usuario.id,
    );

    if (!cliente) {
      setSinPerfil(true);
      setPedidos([]);
      setLineas([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setSinPerfil(false);

    const encabezados = await db.getAllAsync<PedidoRow>(
      'SELECT Id, Fecha, Total FROM ENCABEZADO WHERE IdCliente = ? ORDER BY Id DESC',
      cliente.Id,
    );

    // Un solo viaje para todas las líneas: abrir un pedido no vuelve a consultar.
    const detalles = await db.getAllAsync<LineaRow>(
      `SELECT d.IdEncabezado, p.Nombre, d.Cantidad, d.Subtotal
         FROM DETALLES d
         JOIN PRODUCTOS p   ON p.Id = d.IdProducto
         JOIN ENCABEZADO e  ON e.Id = d.IdEncabezado
        WHERE e.IdCliente = ?
        ORDER BY d.Id`,
      cliente.Id,
    );

    setPedidos(encabezados);
    setLineas(detalles);
    setLoading(false);
    setRefreshing(false);
  }, [db, usuario]);

  // Una compra recién confirmada tiene que aparecer al volver a esta pestaña.
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (loading) return <Cargando />;

  if (sinPerfil) {
    return (
      <View style={s.hueco}>
        <Vacio
          icono="user"
          titulo="Falta tu perfil"
          cuerpo="Los pedidos se guardan a nombre de alguien. Completa tu nombre y apellido en la pestaña Perfil y aquí aparecerá tu historial."
        />
      </View>
    );
  }

  const acumulado = pedidos.reduce((n, p) => n + p.Total, 0);

  return (
    <FlatList
      style={s.pantalla}
      data={pedidos}
      keyExtractor={(item) => String(item.Id)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); cargar(); }}
          tintColor={color.tinta}
          colors={[color.tinta]}
        />
      }
      ListHeaderComponent={
        pedidos.length > 0 ? (
          <Cabecera
            rotulo="Total de mis compras"
            titulo={dinero(acumulado)}
            apoyo={`${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'} · el último el ${fechaLegible(pedidos[0].Fecha)}`}
          />
        ) : null
      }
      ListEmptyComponent={
        <View style={s.hojaVacia}>
          <Vacio
            icono="file-text"
            titulo="Todavía sin pedidos"
            cuerpo="Cuando confirmes una compra quedará guardada aquí, con su fecha, sus productos y su total."
          />
        </View>
      }
      renderItem={({ item, index }) => {
        const suyas = lineas.filter((l) => l.IdEncabezado === item.Id);
        const unidades = suyas.reduce((n, l) => n + l.Cantidad, 0);
        const desplegado = abierto === item.Id;
        const ultimo = index === pedidos.length - 1;

        return (
          <View>
            <FilaRegistro
              titulo={`Pedido #${item.Id}`}
              apoyo={`${fechaLegible(item.Fecha)} · ${unidades} ${
                unidades === 1 ? 'unidad' : 'unidades'
              } en ${suyas.length} ${suyas.length === 1 ? 'producto' : 'productos'}`}
              ultima={desplegado || ultimo}
              onPress={() => setAbierto(desplegado ? null : item.Id)}
              etiqueta={`${desplegado ? 'Ocultar' : 'Ver'} el detalle del pedido ${item.Id}`}
              derecha={
                <View style={s.derecha}>
                  <Text style={[texto.grande, s.total]} numberOfLines={1} adjustsFontSizeToFit>
                    {dinero(item.Total)}
                  </Text>
                  <Feather
                    name={desplegado ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={color.tintaMedia}
                    style={s.flecha}
                  />
                </View>
              }
            />

            {desplegado && (
              <View style={[s.detalle, ultimo && s.detalleUltimo]}>
                {suyas.map((l, i) => (
                  <View key={`${l.IdEncabezado}-${i}`} style={s.linea}>
                    <Text style={[texto.menor, s.lineaNombre]} numberOfLines={1}>
                      {l.Nombre}
                    </Text>
                    <Text style={[texto.menor, s.lineaCantidad]}>×{l.Cantidad}</Text>
                    <Text style={[texto.menor, s.lineaSubtotal]}>{dinero(l.Subtotal)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      }}
      contentContainerStyle={s.lista}
    />
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  lista: { paddingBottom: espacio.xxxl },
  hueco: { flex: 1, backgroundColor: color.tabla, justifyContent: 'center' },
  derecha: { alignItems: 'flex-end' },
  total: { color: color.tinta, ...CIFRAS_TABULARES },
  flecha: { marginTop: espacio.sm },
  // El detalle se hunde en la tabla en vez de flotar como una tarjeta dentro
  // de otra: este mundo no apila tarjetas.
  detalle: {
    backgroundColor: color.tabla,
    paddingVertical: espacio.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.regla,
  },
  detalleUltimo: { borderBottomWidth: 0 },
  linea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espacio.sm,
    paddingLeft: espacio.xxl,
    paddingRight: espacio.base,
  },
  lineaNombre: { flex: 1, color: color.tintaMedia, marginRight: espacio.md },
  lineaCantidad: { color: color.tintaMedia, marginRight: espacio.base, ...CIFRAS_TABULARES },
  lineaSubtotal: { color: color.tinta, ...CIFRAS_TABULARES },
  hojaVacia: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
  },
});
