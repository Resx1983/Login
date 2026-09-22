import { Text, ViewStyle } from 'react-native';

import { color, texto } from './tema';

/**
 * El rótulo del tablero: mayúsculas pequeñas con tracking abierto.
 * Es la mitad pequeña de los dos extremos tipográficos del sistema; la otra
 * es la cifra negra. Nunca lleva el peso de un titular.
 */
export function Placa({
  children,
  tono = color.tintaMedia,
  style,
}: {
  children: React.ReactNode;
  tono?: string;
  style?: ViewStyle;
}) {
  return <Text style={[texto.placa, { color: tono }, style as never]}>{children}</Text>;
}
