import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { color, espacio, texto } from './tema';

/**
 * Estado vacío: enseña qué hace la pantalla, no dice "no hay nada".
 *
 * `lamina` (por defecto) lo dibuja sobre la superficie de contenido, que es
 * como lo usan las listas. `centrado` lo deja a media pantalla sobre la tabla,
 * para cuando ocupa la vista entera.
 */
export function Vacio({
  titulo,
  cuerpo,
  icono = 'inbox',
  variante = 'lamina',
}: {
  titulo: string;
  cuerpo: string;
  icono?: keyof typeof Feather.glyphMap;
  variante?: 'lamina' | 'centrado';
}) {
  return (
    <View style={variante === 'lamina' ? s.lamina : s.centrado}>
      <View style={s.vacio}>
        <Feather name={icono} size={26} color={color.tintaMedia} />
        <Text style={[texto.titulo, s.titulo]}>{titulo}</Text>
        <Text style={[texto.menor, s.cuerpo]}>{cuerpo}</Text>
      </View>
    </View>
  );
}

/** Espera de una consulta local. Son milisegundos: no lleva esqueleto. */
export function Cargando() {
  return (
    <View style={s.cargando}>
      <ActivityIndicator size="large" color={color.tinta} />
    </View>
  );
}

const s = StyleSheet.create({
  lamina: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
  },
  centrado: { flex: 1, justifyContent: 'center' },
  vacio: { alignItems: 'center', paddingVertical: espacio.xxxl, paddingHorizontal: espacio.xl },
  titulo: { color: color.tinta, marginTop: espacio.base },
  cuerpo: { color: color.tintaMedia, textAlign: 'center', marginTop: espacio.sm, maxWidth: 280 },
  cargando: { flex: 1, backgroundColor: color.tabla, alignItems: 'center', justifyContent: 'center' },
});
