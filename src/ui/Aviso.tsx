import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { RADIO, color, espacio, texto } from './tema';

/**
 * Acuse transitorio de una acción.
 *
 * El amarillo está reservado a la selección, así que el acuse correcto no lo
 * usa: es lámina con filo de tinta. El error sí toma su plantilla roja, porque
 * el rojo solo existe para peligro.
 */
export function Aviso({ texto: mensaje, tipo }: { texto: string; tipo: 'ok' | 'error' }) {
  const esError = tipo === 'error';
  const frente = esError ? color.sobreTinta : color.tinta;

  return (
    <View
      style={[s.aviso, esError ? s.error : s.ok]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Feather name={esError ? 'alert-triangle' : 'check'} size={15} color={frente} />
      <Text style={[texto.placa, s.mensaje, { color: frente }]}>{mensaje}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espacio.base,
    paddingVertical: espacio.md,
    borderRadius: RADIO,
  },
  ok: { backgroundColor: color.lamina, borderWidth: 1.5, borderColor: color.tinta },
  error: { backgroundColor: color.alerta },
  mensaje: { marginLeft: espacio.sm, flex: 1, fontSize: 12 },
});
