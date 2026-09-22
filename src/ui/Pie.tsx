import { StyleSheet, View } from 'react-native';

import { color, espacio } from './tema';

/**
 * La barra donde vive la acción primaria: siempre abajo, siempre en el mismo
 * sitio, bajo el pulgar.
 *
 * `flotante` la ancla sobre una lista que sigue corriendo por debajo — esa
 * lista debe reservarle sitio con `paddingBottom: 96`. Sin `flotante` va en el
 * flujo, al final de la pantalla.
 */
export function Pie({ children, flotante }: { children: React.ReactNode; flotante?: boolean }) {
  return <View style={[s.pie, flotante && s.flotante]}>{children}</View>;
}

/** Sitio que una lista debe dejar libre para no quedar debajo de un `Pie flotante`. */
export const ALTO_PIE = 96;

const s = StyleSheet.create({
  pie: {
    padding: espacio.base,
    backgroundColor: color.tabla,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.regla,
  },
  flotante: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
