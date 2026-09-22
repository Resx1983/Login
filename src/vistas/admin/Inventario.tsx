import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { useMensajeFugaz } from '../../hooks/useMensajeFugaz';
import { useRecargarAlEnfocar } from '../../hooks/useRecargarAlEnfocar';
import { ProductoRow } from '../../types';
import { ALTO_PIE, Aviso, Boton, Cabecera, Cargando, Pie, Vacio, refresco } from '../../ui/componentes';
import { color, espacio } from '../../ui/tema';
import { FilaProducto } from './FilaProducto';
import { FormularioProducto } from './FormularioProducto';

export default function Inventario() {
  const db = useSQLiteContext();
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [editando, setEditando] = useState<ProductoRow | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [mensaje, mostrarMensaje] = useMensajeFugaz();

  const cargar = useCallback(async () => {
    const rows = await db.getAllAsync<ProductoRow>(
      'SELECT Id, Nombre, Descripcion, ValorUnitario, Stock FROM PRODUCTOS ORDER BY Nombre',
    );
    setProductos(rows);
    setCargando(false);
    setRefrescando(false);
  }, [db]);

  useRecargarAlEnfocar(cargar);

  const abrir = (producto: ProductoRow | null) => {
    setEditando(producto);
    setFormAbierto(true);
  };

  if (cargando) return <Cargando />;

  const totalUnidades = productos.reduce((n, p) => n + p.Stock, 0);

  return (
    <View style={s.pantalla}>
      {mensaje && (
        <View style={s.aviso}>
          <Aviso texto={mensaje.texto} tipo={mensaje.tipo} />
        </View>
      )}

      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.Id)}
        refreshControl={refresco(refrescando, () => { setRefrescando(true); cargar(); })}
        ListHeaderComponent={
          <Cabecera
            rotulo="Inventario"
            titulo={`${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`}
            apoyo={
              productos.length > 0
                ? `${totalUnidades} unidades en total · toca uno para editarlo`
                : undefined
            }
          />
        }
        ListEmptyComponent={
          <Vacio
            icono="package"
            titulo="Inventario vacío"
            cuerpo="Agrega el primer producto con su precio y sus existencias. Los clientes solo verán los que tengan stock."
          />
        }
        renderItem={({ item, index }) => (
          <FilaProducto
            producto={item}
            ultima={index === productos.length - 1}
            onPress={() => abrir(item)}
          />
        )}
        contentContainerStyle={s.lista}
      />

      {/* Una acción primaria, siempre en el mismo sitio */}
      <Pie flotante>
        <Boton onPress={() => abrir(null)} icono="plus">
          Nuevo producto
        </Boton>
      </Pie>

      <FormularioProducto
        producto={editando}
        visible={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        onGuardado={(acuse) => {
          mostrarMensaje(acuse, acuse.startsWith('No se pudo') ? 'error' : 'ok');
          cargar();
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  lista: { paddingBottom: ALTO_PIE },
  aviso: { paddingHorizontal: espacio.base, paddingTop: espacio.md },
});
