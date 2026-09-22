import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { ONDA, ONDA_CLARA, RADIO, TOQUE_MINIMO, color, espacio, texto } from './tema';

type Tipo = 'tinta' | 'contorno';

/**
 * La acción de la pantalla. `tinta` es la primaria —una por pantalla, en la
 * zona del pulgar—; `contorno` es todo lo demás.
 *
 * Desactivado se dice con su propio par de tokens, nunca bajando la opacidad
 * del conjunto: la opacidad hunde el contraste del texto bajo el mínimo.
 */
export function Boton({
  children,
  onPress,
  tipo = 'tinta',
  cargando,
  desactivado,
  icono,
  style,
}: {
  children: string;
  onPress: () => void;
  tipo?: Tipo;
  cargando?: boolean;
  desactivado?: boolean;
  icono?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}) {
  const bloqueado = !!(cargando || desactivado);
  const esTinta = tipo === 'tinta';

  const fondo = desactivado ? color.inerte : esTinta ? color.tinta : 'transparent';
  const frente = desactivado ? color.sobreInerte : esTinta ? color.sobreTinta : color.tinta;

  return (
    <Pressable
      onPress={onPress}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityState={{ disabled: bloqueado, busy: !!cargando }}
      android_ripple={bloqueado ? undefined : esTinta ? ONDA_CLARA : ONDA}
      style={({ pressed }) => [
        s.boton,
        { backgroundColor: fondo },
        tipo === 'contorno' && s.contorno,
        tipo === 'contorno' && desactivado && { borderColor: color.sobreInerte },
        pressed && !bloqueado && s.presionado,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={frente} />
      ) : (
        <View style={s.fila}>
          {icono ? <Feather name={icono} size={16} color={frente} style={s.icono} /> : null}
          <Text style={[texto.placa, s.etiqueta, { color: frente }]}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Acción secundaria de texto. Subrayada, nunca coloreada: el amarillo es selección. */
export function Enlace({ children, onPress }: { children: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" android_ripple={ONDA} style={s.enlace}>
      <Text style={[texto.menor, s.enlaceTexto]}>{children}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  boton: {
    minHeight: TOQUE_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.lg,
    borderRadius: RADIO,
    overflow: 'hidden',
  },
  contorno: { borderWidth: 1.5, borderColor: color.tinta },
  fila: { flexDirection: 'row', alignItems: 'center' },
  icono: { marginRight: espacio.sm },
  etiqueta: { fontSize: 13, letterSpacing: 1.1 },
  presionado: { opacity: 0.75 },
  enlace: { minHeight: TOQUE_MINIMO, justifyContent: 'center', alignItems: 'center' },
  enlaceTexto: { color: color.tinta, textDecorationLine: 'underline' },
});
