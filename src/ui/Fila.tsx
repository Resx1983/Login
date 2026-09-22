import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Regla } from './superficies';
import { ONDA, TOQUE_MINIMO, color, espacio, texto } from './tema';

/** Fila: la única "tarjeta" que existe en este mundo. Lámina y una costura. */
export function Fila({
  children,
  onPress,
  etiqueta,
  ultima,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  etiqueta?: string;
  ultima?: boolean;
  style?: ViewStyle;
}) {
  const cuerpo = <View style={[s.fila, style]}>{children}</View>;

  return (
    <View>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={etiqueta}
          android_ripple={ONDA}
          style={({ pressed }) => pressed && s.presionada}
        >
          {cuerpo}
        </Pressable>
      ) : (
        cuerpo
      )}
      {!ultima && <Regla sangria={espacio.base} />}
    </View>
  );
}

/**
 * La retícula de rótulo única: adorno · (título / apoyo / cifra / marca) · derecha.
 *
 * Toda lista de la app —productos, inventario, clientes, líneas de pedido,
 * cuentas— se dibuja con esto. Si una pantalla necesita una fila distinta,
 * el sistema está mal, no la pantalla.
 */
export function FilaRegistro({
  titulo,
  apoyo,
  marca,
  cifra,
  adorno,
  derecha,
  onPress,
  etiqueta,
  ultima,
  lineasTitulo = 1,
}: {
  titulo: string;
  apoyo?: string | null;
  marca?: React.ReactNode;
  cifra?: React.ReactNode;
  adorno?: React.ReactNode;
  derecha?: React.ReactNode;
  onPress?: () => void;
  etiqueta?: string;
  ultima?: boolean;
  lineasTitulo?: number;
}) {
  return (
    <Fila onPress={onPress} etiqueta={etiqueta} ultima={ultima} style={s.registro}>
      {adorno ? <View style={s.adorno}>{adorno}</View> : null}

      <View style={s.texto}>
        <Text style={[texto.cuerpoFuerte, s.titulo]} numberOfLines={lineasTitulo}>
          {titulo}
        </Text>
        {apoyo ? (
          <Text style={[texto.menor, s.apoyo]} numberOfLines={2}>
            {apoyo}
          </Text>
        ) : null}
        {cifra ? <View style={s.cifra}>{cifra}</View> : null}
        {marca ? <View style={s.marca}>{marca}</View> : null}
      </View>

      {derecha ? <View style={s.derecha}>{derecha}</View> : null}
    </Fila>
  );
}

const s = StyleSheet.create({
  fila: {
    paddingHorizontal: espacio.base,
    paddingVertical: espacio.base,
    minHeight: TOQUE_MINIMO,
    backgroundColor: color.lamina,
  },
  presionada: { opacity: 0.7 },
  registro: { flexDirection: 'row', alignItems: 'center' },
  adorno: { marginRight: espacio.base },
  texto: { flex: 1 },
  titulo: { color: color.tinta },
  apoyo: { color: color.tintaMedia, marginTop: espacio.xs },
  cifra: { marginTop: espacio.sm },
  marca: { marginTop: espacio.md },
  derecha: { marginLeft: espacio.base, alignItems: 'flex-end' },
});
