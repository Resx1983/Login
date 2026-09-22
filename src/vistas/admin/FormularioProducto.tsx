import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductoRow } from '../../types';
import { Boton, Campo, useMenosMovimiento } from '../../ui/componentes';
import { color, espacio, texto } from '../../ui/tema';

type Campos = { nombre: string; descripcion: string; valorUnitario: string; stock: string };

const VACIO: Campos = { nombre: '', descripcion: '', valorUnitario: '', stock: '' };

const desdeProducto = (p: ProductoRow): Campos => ({
  nombre: p.Nombre,
  descripcion: p.Descripcion ?? '',
  valorUnitario: String(p.ValorUnitario),
  stock: String(p.Stock),
});

/** Devuelve un error por campo. Vacío significa que se puede guardar. */
function validar(campos: Campos): Partial<Campos> {
  const e: Partial<Campos> = {};

  if (!campos.nombre.trim()) e.nombre = 'Escribe el nombre con el que lo buscarás.';

  const valor = parseFloat(campos.valorUnitario);
  if (isNaN(valor) || valor <= 0) e.valorUnitario = 'Debe ser un número mayor que cero.';

  const stock = parseInt(campos.stock, 10);
  if (isNaN(stock) || stock < 0) e.stock = 'Debe ser un entero de 0 en adelante.';

  return e;
}

/**
 * Alta y edición de un producto, en hoja inferior.
 *
 * Es una hoja y no un inline porque dar de alta un producto es una tarea
 * cerrada: se entra, se completa y se sale. Es el único sitio de la app donde
 * una ventana está justificada.
 *
 * `producto` en `null` significa alta; con producto, edición.
 */
export function FormularioProducto({
  producto,
  visible,
  onCerrar,
  onGuardado,
}: {
  producto: ProductoRow | null;
  visible: boolean;
  onCerrar: () => void;
  onGuardado: (acuse: string) => void;
}) {
  const db = useSQLiteContext();
  const inset = useSafeAreaInsets();
  const menosMovimiento = useMenosMovimiento();

  const [campos, setCampos] = useState<Campos>(VACIO);
  const [errores, setErrores] = useState<Partial<Campos>>({});
  const [guardando, setGuardando] = useState(false);

  // Al abrir, la hoja se rellena con el producto que toque (o se vacía).
  useEffect(() => {
    if (!visible) return;
    setCampos(producto ? desdeProducto(producto) : VACIO);
    setErrores({});
  }, [visible, producto]);

  /** Escribe un campo y borra su error: el usuario ya está corrigiendo. */
  const escribir = (clave: keyof Campos) => (v: string) => {
    setCampos((c) => ({ ...c, [clave]: v }));
    setErrores((e) => ({ ...e, [clave]: undefined }));
  };

  const guardar = async () => {
    const e = validar(campos);
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    const nombre = campos.nombre.trim();
    const descripcion = campos.descripcion.trim() || null;
    const valor = parseFloat(campos.valorUnitario);
    const stock = parseInt(campos.stock, 10);

    setGuardando(true);
    try {
      if (producto) {
        await db.runAsync(
          'UPDATE PRODUCTOS SET Nombre=?, Descripcion=?, ValorUnitario=?, Stock=? WHERE Id=?',
          nombre, descripcion, valor, stock, producto.Id,
        );
        onGuardado(`${nombre} actualizado`);
      } else {
        await db.runAsync(
          'INSERT INTO PRODUCTOS (Nombre, Descripcion, ValorUnitario, Stock) VALUES (?,?,?,?)',
          nombre, descripcion, valor, stock,
        );
        onGuardado(`${nombre} agregado al inventario`);
      }
      onCerrar();
    } catch {
      onGuardado('No se pudo guardar el producto. Inténtalo otra vez.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType={menosMovimiento ? 'none' : 'slide'}
      transparent
      onRequestClose={onCerrar}
    >
      <View style={s.fondo}>
        <Pressable style={s.cierreTactil} onPress={onCerrar} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[s.hoja, { paddingBottom: inset.bottom + espacio.lg }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[texto.grande, s.titulo]} numberOfLines={2}>
                {producto ? producto.Nombre : 'Nuevo producto'}
              </Text>

              <Campo
                rotulo="Nombre"
                obligatorio
                placeholder="Cómo lo llamas en el mostrador"
                value={campos.nombre}
                error={errores.nombre}
                onChangeText={escribir('nombre')}
              />

              <Campo
                rotulo="Descripción"
                placeholder="Opcional: presentación, marca, tamaño"
                multiline
                value={campos.descripcion}
                onChangeText={escribir('descripcion')}
              />

              <View style={s.cifras}>
                <View style={s.cifra}>
                  <Campo
                    rotulo="Precio"
                    obligatorio
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={campos.valorUnitario}
                    error={errores.valorUnitario}
                    onChangeText={escribir('valorUnitario')}
                  />
                </View>
                <View style={s.cifra}>
                  <Campo
                    rotulo="Stock"
                    obligatorio
                    placeholder="0"
                    keyboardType="number-pad"
                    value={campos.stock}
                    error={errores.stock}
                    onChangeText={escribir('stock')}
                  />
                </View>
              </View>

              <View style={s.botones}>
                <View style={s.boton}>
                  <Boton tipo="contorno" onPress={onCerrar} desactivado={guardando}>
                    Cancelar
                  </Boton>
                </View>
                <View style={s.boton}>
                  <Boton onPress={guardar} cargando={guardando} icono="check">
                    {producto ? 'Guardar' : 'Crear'}
                  </Boton>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(21,20,15,0.55)', justifyContent: 'flex-end' },
  cierreTactil: { flex: 1 },
  hoja: {
    backgroundColor: color.tabla,
    borderTopWidth: 3,
    borderTopColor: color.tinta,
    paddingHorizontal: espacio.base,
    paddingTop: espacio.lg,
    maxHeight: '88%',
  },
  titulo: { color: color.tinta, marginTop: espacio.sm, marginBottom: espacio.xl },
  cifras: { flexDirection: 'row', gap: espacio.md },
  cifra: { flex: 1 },
  botones: { flexDirection: 'row', gap: espacio.md, marginTop: espacio.sm },
  boton: { flex: 1 },
});
