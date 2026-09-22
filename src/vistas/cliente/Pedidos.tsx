import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { useRecargarAlEnfocar } from '../../hooks/useRecargarAlEnfocar';
import { Cabecera, Cargando, Vacio, refresco } from '../../ui/componentes';
import { color, dinero, espacio } from '../../ui/tema';
import { FilaPedido, Linea, Pedido, fechaLegible } from './FilaPedido';

export default function Pedidos() {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [sinPerfil, setSinPerfil] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
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
      setCargando(false);
      setRefrescando(false);
      return;
    }

    setSinPerfil(false);

    const encabezados = await db.getAllAsync<Pedido>(
      'SELECT Id, Fecha, Total FROM ENCABEZADO WHERE IdCliente = ? ORDER BY Id DESC',
      cliente.Id,
    );

    // Un solo viaje para todas las líneas: abrir un pedido no vuelve a consultar.
    const detalles = await db.getAllAsync<Linea>(
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
    setCargando(false);
    setRefrescando(false);
  }, [db, usuario]);

  useRecargarAlEnfocar(cargar);

  if (cargando) return <Cargando />;

  if (sinPerfil) {
    return (
      <Vacio
        variante="centrado"
        icono="user"
        titulo="Falta tu perfil"
        cuerpo="Los pedidos se guardan a nombre de alguien. Completa tu nombre y apellido en la pestaña Perfil y aquí aparecerá tu historial."
      />
    );
  }

  const acumulado = pedidos.reduce((n, p) => n + p.Total, 0);

  return (
    <FlatList
      style={s.pantalla}
      data={pedidos}
      keyExtractor={(item) => String(item.Id)}
      refreshControl={refresco(refrescando, () => { setRefrescando(true); cargar(); })}
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
        <Vacio
          icono="file-text"
          titulo="Todavía sin pedidos"
          cuerpo="Cuando confirmes una compra quedará guardada aquí, con su fecha, sus productos y su total."
        />
      }
      renderItem={({ item, index }) => (
        <FilaPedido
          pedido={item}
          lineas={lineas.filter((l) => l.IdEncabezado === item.Id)}
          desplegado={abierto === item.Id}
          ultima={index === pedidos.length - 1}
          onAlternar={() => setAbierto(abierto === item.Id ? null : item.Id)}
        />
      )}
      contentContainerStyle={s.lista}
    />
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  lista: { paddingBottom: espacio.xxxl },
});
