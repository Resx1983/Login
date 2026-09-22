import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { useCarrito } from '../../context/CarritoContext';
import { ProductoRow } from '../../types';
import { Boton, Cabecera, Cargando, FilaRegistro, Marca, Vacio } from '../../ui/componentes';
import { CIFRAS_TABULARES, TOQUE_MINIMO, color, dinero, espacio, texto } from '../../ui/tema';

export default function Productos() {
  const db = useSQLiteContext();
  const navegacion = useNavigation<{ navigate: (pantalla: string) => void }>();
  const { agregarItem, quitarItem, items, totalItems } = useCarrito();
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    const rows = await db.getAllAsync<ProductoRow>(
      'SELECT Id, Nombre, Descripcion, ValorUnitario, Stock FROM PRODUCTOS WHERE Stock > 0 ORDER BY Nombre',
    );
    setProductos(rows);
    setLoading(false);
    setRefreshing(false);
  }, [db]);

  // Las pestañas no se desmontan: sin esto la pantalla se queda con los datos
  // que leyó la primera vez. Se recarga cada vez que vuelve al frente.
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const cantidadEnCarrito = (id: number) =>
    items.find((i) => i.producto.Id === id)?.cantidad ?? 0;

  /** Sube o baja una unidad respetando el stock. En 0 sale del carrito. */
  const ajustar = (producto: ProductoRow, delta: number) => {
    const actual = cantidadEnCarrito(producto.Id);
    const siguiente = Math.min(Math.max(actual + delta, 0), producto.Stock);
    if (siguiente === 0) quitarItem(producto.Id);
    else agregarItem(producto, siguiente);
  };

  if (loading) return <Cargando />;

  const totalPedido = items.reduce((n, i) => n + i.producto.ValorUnitario * i.cantidad, 0);

  return (
    <View style={s.pantalla}>
      <FlatList
        data={productos}
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
          <Cabecera
            rotulo="A la venta"
            titulo={`${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`}
            apoyo="Solo se listan los que tienen existencias ahora mismo."
          />
        }
        ListEmptyComponent={
          <View style={s.hojaVacia}>
            <Vacio
              icono="package"
              titulo="Nada disponible"
              cuerpo="Todo está agotado por ahora. Desliza hacia abajo para volver a consultar el inventario."
            />
          </View>
        }
        renderItem={({ item, index }) => {
          const enCarrito = cantidadEnCarrito(item.Id);
          const restante = item.Stock - enCarrito;
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
              marca={
                enCarrito > 0 ? (
                  <Marca tono={restante === 0 ? 'espera' : 'neutro'}>
                    {restante === 0 ? 'Llevas todo el stock' : `Quedan ${restante} si confirmas`}
                  </Marca>
                ) : (
                  <Marca>{item.Stock} en stock</Marca>
                )
              }
              derecha={
                enCarrito === 0 ? (
                  <Pressable
                    onPress={() => ajustar(item, 1)}
                    accessibilityRole="button"
                    accessibilityLabel={`Agregar ${item.Nombre} al pedido`}
                    android_ripple={{ color: 'rgba(21,20,15,0.12)' }}
                    style={({ pressed }) => [s.agregar, pressed && { opacity: 0.7 }]}
                  >
                    <Feather name="plus" size={18} color={color.tinta} />
                    <Text style={[texto.placa, s.agregarTexto]}>Agregar</Text>
                  </Pressable>
                ) : (
                  <View style={s.contador}>
                    <Paso
                      icono="minus"
                      onPress={() => ajustar(item, -1)}
                      etiqueta={`Quitar una unidad de ${item.Nombre}`}
                    />
                    <View style={s.cantidad}>
                      <Text style={[texto.grande, s.cantidadTexto]}>{enCarrito}</Text>
                    </View>
                    <Paso
                      icono="plus"
                      onPress={() => ajustar(item, 1)}
                      desactivado={restante === 0}
                      etiqueta={`Agregar una unidad de ${item.Nombre}`}
                    />
                  </View>
                )
              }
            />
          );
        }}
        contentContainerStyle={[s.lista, totalItems > 0 && s.listaConPie]}
      />

      {/* Una acción primaria, siempre en el mismo sitio, bajo el pulgar */}
      {totalItems > 0 && (
        <View style={s.pie}>
          <Boton onPress={() => navegacion.navigate('Compra')} icono="arrow-right">
            {`Ver pedido · ${dinero(totalPedido)}`}
          </Boton>
        </View>
      )}
    </View>
  );
}

function Paso({
  icono,
  onPress,
  desactivado,
  etiqueta,
}: {
  icono: 'plus' | 'minus';
  onPress: () => void;
  desactivado?: boolean;
  etiqueta: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desactivado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: !!desactivado }}
      android_ripple={desactivado ? undefined : { color: 'rgba(21,20,15,0.12)' }}
      style={({ pressed }) => [s.paso, desactivado && s.pasoInactivo, pressed && !desactivado && { opacity: 0.6 }]}
    >
      <Feather name={icono} size={18} color={desactivado ? color.sobreInerte : color.tinta} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  lista: { paddingBottom: espacio.xxxl },
  listaConPie: { paddingBottom: 96 },
  precio: { color: color.tinta, ...CIFRAS_TABULARES },
  agregar: {
    minHeight: TOQUE_MINIMO,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: color.tinta,
    paddingHorizontal: espacio.md,
    overflow: 'hidden',
  },
  agregarTexto: { color: color.tinta, marginTop: espacio.xs, fontSize: 11 },
  contador: { alignItems: 'center', borderWidth: 1.5, borderColor: color.tinta },
  paso: { width: TOQUE_MINIMO, height: TOQUE_MINIMO, alignItems: 'center', justifyContent: 'center' },
  pasoInactivo: { backgroundColor: color.inerte },
  cantidad: {
    width: TOQUE_MINIMO,
    paddingVertical: espacio.sm,
    alignItems: 'center',
    backgroundColor: color.flash,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: color.tinta,
  },
  cantidadTexto: { color: color.tinta, ...CIFRAS_TABULARES },
  pie: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: espacio.base,
    backgroundColor: color.tabla,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.regla,
  },
  hojaVacia: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
  },
});
