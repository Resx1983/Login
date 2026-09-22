import { StyleSheet, Text, View } from 'react-native';

import { Placa } from './Placa';
import { color, espacio, texto } from './tema';

/**
 * Cabecera de pantalla: rótulo pequeño arriba, cifra grande debajo.
 *
 * El rótulo solo existe cuando nombra la cifra ("A la venta" → "12 productos").
 * Si repitiera lo que ya dice el título, sería una ceja y sobra: se omite.
 */
export function Cabecera({
  rotulo,
  titulo,
  apoyo,
  tamano = 'gigante',
}: {
  rotulo?: string;
  titulo: string;
  apoyo?: string;
  tamano?: 'gigante' | 'grande';
}) {
  return (
    <View style={s.cabecera}>
      {rotulo ? <Placa>{rotulo}</Placa> : null}
      <Text
        style={[texto[tamano], s.titulo]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {titulo}
      </Text>
      {apoyo ? <Text style={[texto.menor, s.apoyo]}>{apoyo}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  cabecera: { paddingHorizontal: espacio.base, paddingTop: espacio.xl, paddingBottom: espacio.base },
  titulo: { color: color.tinta, marginTop: espacio.sm, marginBottom: espacio.xs },
  apoyo: { color: color.tintaMedia },
});
