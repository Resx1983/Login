import { StyleSheet, Text, View } from 'react-native';

import { RADIO, color, espacio, texto } from './tema';

type Tono = 'neutro' | 'espera' | 'alerta';

/**
 * Marca de estado. Nunca depende solo del color: el tono tiñe el filo, pero
 * la palabra que va dentro es la que comunica.
 */
export function Marca({ children, tono = 'neutro' }: { children: React.ReactNode; tono?: Tono }) {
  const tinte = { neutro: color.tintaMedia, espera: color.espera, alerta: color.alerta }[tono];

  return (
    <View style={[s.marca, { borderColor: tinte }]}>
      <Text style={[texto.placa, s.texto, { color: tinte }]}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  marca: {
    borderWidth: 1,
    paddingHorizontal: espacio.sm,
    paddingVertical: 3,
    borderRadius: RADIO,
    alignSelf: 'flex-start',
  },
  texto: { fontSize: 11 },
});
