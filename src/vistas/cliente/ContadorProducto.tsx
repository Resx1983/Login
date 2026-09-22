import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ONDA, TOQUE_MINIMO, color, espacio, texto } from '../../ui/tema';

/**
 * El contador que vive dentro de la fila del producto.
 *
 * Reemplaza a la ventana con teclado que había antes: en el mostrador se suma
 * de a uno con el pulgar, sin salir de la lista y sin escribir un número.
 * En cero se muestra como un botón "Agregar"; a partir de uno, como -/n/+.
 */
export function ContadorProducto({
  nombre,
  cantidad,
  puedeSumar,
  onSumar,
  onRestar,
}: {
  nombre: string;
  cantidad: number;
  puedeSumar: boolean;
  onSumar: () => void;
  onRestar: () => void;
}) {
  if (cantidad === 0) {
    return (
      <Pressable
        onPress={onSumar}
        accessibilityRole="button"
        accessibilityLabel={`Agregar ${nombre} al pedido`}
        android_ripple={ONDA}
        style={({ pressed }) => [s.agregar, pressed && s.presionado]}
      >
        <Feather name="plus" size={18} color={color.tinta} />
        <Text style={[texto.placa, s.agregarTexto]}>Agregar</Text>
      </Pressable>
    );
  }

  return (
    <View style={s.contador}>
      <Paso icono="minus" onPress={onRestar} etiqueta={`Quitar una unidad de ${nombre}`} />
      <View style={s.cantidad}>
        <Text style={[texto.grande, s.cantidadTexto]}>{cantidad}</Text>
      </View>
      <Paso
        icono="plus"
        onPress={onSumar}
        desactivado={!puedeSumar}
        etiqueta={`Agregar una unidad de ${nombre}`}
      />
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
      android_ripple={desactivado ? undefined : ONDA}
      style={({ pressed }) => [
        s.paso,
        desactivado && s.pasoInactivo,
        pressed && !desactivado && s.presionado,
      ]}
    >
      <Feather name={icono} size={18} color={desactivado ? color.sobreInerte : color.tinta} />
    </Pressable>
  );
}

const s = StyleSheet.create({
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
  presionado: { opacity: 0.7 },
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
  cantidadTexto: { color: color.tinta },
});
