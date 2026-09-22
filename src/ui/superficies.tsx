import { StyleSheet, View, ViewStyle } from 'react-native';

import { RADIO, color } from './tema';

/**
 * La regla a un pelo. Es la profundidad de este mundo: aquí nada se separa
 * con sombra ni con elevación, solo con una costura.
 */
export function Regla({ sangria = 0 }: { sangria?: number }) {
  return <View style={[s.regla, { marginLeft: sangria }]} />;
}

/** Lámina: superficie de contenido a sangre, sin esquina ni sombra. */
export function Hoja({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.hoja, style]}>{children}</View>;
}

const s = StyleSheet.create({
  regla: { height: StyleSheet.hairlineWidth, backgroundColor: color.regla },
  hoja: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
    borderRadius: RADIO,
  },
});
