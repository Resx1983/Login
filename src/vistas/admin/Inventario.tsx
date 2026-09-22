import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductoRow } from '../../types';
import {
  Aviso,
  Boton,
  Cabecera,
  Campo,
  Cargando,
  FilaRegistro,
  Marca,
  Vacio,
  useMenosMovimiento,
} from '../../ui/componentes';
import { CIFRAS_TABULARES, color, dinero, espacio, texto } from '../../ui/tema';

type FormProducto = {
  nombre: string;
  descripcion: string;
  valorUnitario: string;
  stock: string;
};

const FORM_VACIO: FormProducto = { nombre: '', descripcion: '', valorUnitario: '', stock: '' };

/** Bajo este número el stock se marca con palabra, no solo con color. */
const STOCK_BAJO = 5;

export default function Inventario() {
  const db = useSQLiteContext();
  const inset = useSafeAreaInsets();
  const menosMovimiento = useMenosMovimiento();
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

  // Las pestañas no se desmontan: sin esto la pantalla se queda con los datos
  // que leyó la primera vez. Se recarga cada vez que vuelve al frente.
  useFocusEffect(useCallback(() => { cargarProductos(); }, [cargarProductos]));

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current); }, []);

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo });
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setMensaje(null), 4500);
  };

  // ── Validación ──────────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const e: Partial<FormProducto> = {};
    if (!form.nombre.trim()) e.nombre = 'Escribe el nombre con el que lo buscarás.';
    const valor = parseFloat(form.valorUnitario);
    if (isNaN(valor) || valor <= 0) e.valorUnitario = 'Debe ser un número mayor que cero.';
    const stock = parseInt(form.stock, 10);
    if (isNaN(stock) || stock < 0) e.stock = 'Debe ser un entero de 0 en adelante.';
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
        mostrarMensaje(`${form.nombre.trim()} actualizado`, 'ok');
      } else {
        await db.runAsync(
          'INSERT INTO PRODUCTOS (Nombre, Descripcion, ValorUnitario, Stock) VALUES (?,?,?,?)',
          form.nombre.trim(),
          form.descripcion.trim() || null,
          valor,
          stock,
        );
        mostrarMensaje(`${form.nombre.trim()} agregado al inventario`, 'ok');
      }

      setModalVisible(false);
      await cargarProductos();
    } catch {
      mostrarMensaje('No se pudo guardar el producto. Inténtalo otra vez.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <Cargando />;

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargarProductos(); }}
            tintColor={color.tinta}
            colors={[color.tinta]}
          />
        }
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
          <View style={s.hojaVacia}>
            <Vacio
              icono="package"
              titulo="Inventario vacío"
              cuerpo="Agrega el primer producto con su precio y sus existencias. Los clientes solo verán los que tengan stock."
            />
          </View>
        }
        renderItem={({ item, index }) => {
          const agotado = item.Stock === 0;
          const bajo = !agotado && item.Stock <= STOCK_BAJO;
          return (
            <FilaRegistro
              titulo={item.Nombre}
              lineasTitulo={2}
              apoyo={item.Descripcion}
              ultima={index === productos.length - 1}
              onPress={() => abrirEditar(item)}
              etiqueta={`Editar ${item.Nombre}`}
              cifra={
                <Text style={[texto.gigante, s.precio]} numberOfLines={1} adjustsFontSizeToFit>
                  {dinero(item.ValorUnitario)}
                </Text>
              }
              marca={
                agotado ? (
                  <Marca tono="alerta">Agotado</Marca>
                ) : bajo ? (
                  <Marca tono="espera">Quedan {item.Stock}</Marca>
                ) : (
                  <Marca>{item.Stock} en stock</Marca>
                )
              }
              derecha={<Feather name="edit-2" size={16} color={color.tintaMedia} />}
            />
          );
        }}
        contentContainerStyle={s.lista}
      />

      {/* Una acción primaria, siempre en el mismo sitio */}
      <View style={s.pie}>
        <Boton onPress={abrirNuevo} icono="plus">
          Nuevo producto
        </Boton>
      </View>

      {/* ── Hoja de edición ── */}
      <Modal
        visible={modalVisible}
        animationType={menosMovimiento ? 'none' : 'slide'}
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.fondoModal}>
          <Pressable style={s.cierreTactil} onPress={() => setModalVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={[s.hojaModal, { paddingBottom: inset.bottom + espacio.lg }]}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={[texto.grande, s.tituloModal]} numberOfLines={2}>
                  {editando ? editando.Nombre : 'Nuevo producto'}
                </Text>

                <Campo
                  rotulo="Nombre"
                  obligatorio
                  placeholder="Cómo lo llamas en el mostrador"
                  value={form.nombre}
                  error={errores.nombre}
                  onChangeText={(v) => { setForm((f) => ({ ...f, nombre: v })); setErrores((e) => ({ ...e, nombre: undefined })); }}
                />

                <Campo
                  rotulo="Descripción"
                  placeholder="Opcional: presentación, marca, tamaño"
                  multiline
                  value={form.descripcion}
                  onChangeText={(v) => setForm((f) => ({ ...f, descripcion: v }))}
                />

                <View style={s.cifras}>
                  <View style={s.cifra}>
                    <Campo
                      rotulo="Precio"
                      obligatorio
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      value={form.valorUnitario}
                      error={errores.valorUnitario}
                      onChangeText={(v) => { setForm((f) => ({ ...f, valorUnitario: v })); setErrores((e) => ({ ...e, valorUnitario: undefined })); }}
                    />
                  </View>
                  <View style={s.cifra}>
                    <Campo
                      rotulo="Stock"
                      obligatorio
                      placeholder="0"
                      keyboardType="number-pad"
                      value={form.stock}
                      error={errores.stock}
                      onChangeText={(v) => { setForm((f) => ({ ...f, stock: v })); setErrores((e) => ({ ...e, stock: undefined })); }}
                    />
                  </View>
                </View>

                <View style={s.botonesModal}>
                  <View style={s.botonModal}>
                    <Boton tipo="contorno" onPress={() => setModalVisible(false)} desactivado={guardando}>
                      Cancelar
                    </Boton>
                  </View>
                  <View style={s.botonModal}>
                    <Boton onPress={guardar} cargando={guardando} icono="check">
                      {editando ? 'Guardar' : 'Crear'}
                    </Boton>
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  lista: { paddingBottom: 96 },
  aviso: { paddingHorizontal: espacio.base, paddingTop: espacio.md },
  precio: { color: color.tinta, ...CIFRAS_TABULARES },
  hojaVacia: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
  },
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
  // Hoja de edición
  fondoModal: { flex: 1, backgroundColor: 'rgba(21,20,15,0.55)', justifyContent: 'flex-end' },
  cierreTactil: { flex: 1 },
  hojaModal: {
    backgroundColor: color.tabla,
    borderTopWidth: 3,
    borderTopColor: color.tinta,
    paddingHorizontal: espacio.base,
    paddingTop: espacio.lg,
    maxHeight: '88%',
  },
  tituloModal: { color: color.tinta, marginTop: espacio.sm, marginBottom: espacio.xl },
  cifras: { flexDirection: 'row', gap: espacio.md },
  cifra: { flex: 1 },
  botonesModal: { flexDirection: 'row', gap: espacio.md, marginTop: espacio.sm },
  botonModal: { flex: 1 },
});
