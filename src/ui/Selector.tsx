import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useMenosMovimiento } from './movimiento';
import { MS, ONDA, RADIO, TOQUE_MINIMO, color, texto } from './tema';

/**
 * La interacción firma del sistema: el amarillo entra por detrás de la opción
 * elegida. Es la misma marca que usan la pestaña activa y la cantidad elegida.
 */
export function Selector<T extends string>({
  opciones,
  valor,
  onCambio,
}: {
  opciones: { valor: T; etiqueta: string }[];
  valor: T;
  onCambio: (v: T) => void;
}) {
  const menosMovimiento = useMenosMovimiento();

  return (
    <View style={s.selector} accessibilityRole="radiogroup">
      {opciones.map((o) => (
        <Opcion
          key={o.valor}
          etiqueta={o.etiqueta}
          activa={o.valor === valor}
          instantaneo={menosMovimiento}
          onPress={() => onCambio(o.valor)}
        />
      ))}
    </View>
  );
}

function Opcion({
  etiqueta,
  activa,
  instantaneo,
  onPress,
}: {
  etiqueta: string;
  activa: boolean;
  instantaneo: boolean;
  onPress: () => void;
}) {
  const entrada = useRef(new Animated.Value(activa ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: activa ? 1 : 0,
      duration: instantaneo ? 0 : MS,
      useNativeDriver: true,
    }).start();
  }, [activa, entrada, instantaneo]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa }}
      android_ripple={ONDA}
      style={({ pressed }) => [s.opcion, pressed && !activa && s.presionada]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: color.flash, opacity: entrada, transform: [{ scaleX: entrada }] },
        ]}
      />
      <Text style={[texto.placa, s.etiqueta, { color: activa ? color.tinta : color.tintaMedia }]}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  selector: { flexDirection: 'row', borderWidth: 1.5, borderColor: color.tinta, borderRadius: RADIO },
  opcion: {
    flex: 1,
    minHeight: TOQUE_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  presionada: { backgroundColor: color.tabla },
  etiqueta: { fontSize: 12 },
});
