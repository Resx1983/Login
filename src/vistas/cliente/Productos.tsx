import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useCarrito } from '../../context/CarritoContext';
import { useRecargarAlEnfocar } from '../../hooks/useRecargarAlEnfocar';
import { ProductoRow } from '../../types';
import {
  ALTO_PIE,
  Boton,
  Cabecera,
  Cargando,
  FilaRegistro,
  Marca,
  Pie,
  Vacio,
  refresco,
} from '../../ui/componentes';
import { CIFRAS_TABULARES, color, dinero, espacio, texto } from '../../ui/tema';
import { ContadorProducto } from './ContadorProducto';

export default function Productos() {
  const db = useSQLiteContext();
  const navegacion = useNavigation<{ navigate: (pantalla: string) => void }>();
  const { agregarItem, quitarItem, items, totalItems } = useCarrito();
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    const rows = await db.getAllAsync<ProductoRow>(
      'SELECT Id, Nombre, Descripcion, ValorUnitario, Stock FROM PRODUCTOS WHERE Stock > 0 ORDER BY Nombre',
    );
    setProductos(rows);
    setCargando(false);
    setRefrescando(false);
  }, [db]);

  useRecargarAlEnfocar(cargar);

  const enCarrito = (id: number) => items.find((i) => i.producto.Id === id)?.cantidad ?? 0;

  /** Sube o baja una unidad respetando el stock. En 0 sale del carrito. */
  const ajustar = (producto: ProductoRow, delta: number) => {
    const siguiente = Math.min(Math.max(enCarrito(producto.Id) + delta, 0), producto.Stock);
    if (siguiente === 0) quitarItem(producto.Id);
    else agregarItem(producto, siguiente);
  };

  if (cargando) return <Cargando />;

  const totalPedido = items.reduce((n, i) => n + i.producto.ValorUnitario * i.cantidad, 0);

  return (
    <View style={s.pantalla}>
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.Id)}
        refreshControl={refresco(refrescando, () => { setRefrescando(true); cargar(); })}
        ListHeaderComponent={
          <Cabecera
            rotulo="A la venta"
            titulo={`${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`}
            apoyo="Solo se listan los que tienen existencias ahora mismo."
          />
        }
        ListEmptyComponent={
          <Vacio
            icono="package"
            titulo="Nada disponible"
            cuerpo="Todo está agotado por ahora. Desliza hacia abajo para volver a consultar el inventario."
          />
        }
        renderItem={({ item, index }) => {
          const elegidas = enCarrito(item.Id);
          const restante = item.Stock - elegidas;

          return (
            <FilaRegistro
              titulo={item.Nombre}
              lineasTitulo={2}
              apoyo={item.Descripcion}
              ultima={index === productos.length - 1}
              cifra={
                <Text style={[texto.gigante, s.precio]} numberOfLines={1} adjustsFontSizeToFit>
                  {dinero(item.ValorUnitario)}
                </Text>
              }
              // Ninguna cifra va sola: el stock dice qué queda si confirmas.
              marca={
                elegidas > 0 ? (
                  <Marca tono={restante === 0 ? 'espera' : 'neutro'}>
                    {restante === 0 ? 'Llevas todo el stock' : `Quedan ${restante} si confirmas`}
                  </Marca>
                ) : (
                  <Marca>{item.Stock} en stock</Marca>
                )
              }
              derecha={
                <ContadorProducto
                  nombre={item.Nombre}
                  cantidad={elegidas}
                  puedeSumar={restante > 0}
                  onSumar={() => ajustar(item, 1)}
                  onRestar={() => ajustar(item, -1)}
                />
              }
            />
          );
        }}
        contentContainerStyle={[s.lista, totalItems > 0 && s.listaConPie]}
      />

      {/* Una acción primaria, siempre en el mismo sitio, bajo el pulgar */}
      {totalItems > 0 && (
        <Pie flotante>
          <Boton onPress={() => navegacion.navigate('Compra')} icono="arrow-right">
            {`Ver pedido · ${dinero(totalPedido)}`}
          </Boton>
        </Pie>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  lista: { paddingBottom: espacio.xxxl },
  listaConPie: { paddingBottom: ALTO_PIE },
  precio: { color: color.tinta, ...CIFRAS_TABULARES },
});
