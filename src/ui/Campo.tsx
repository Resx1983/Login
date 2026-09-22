import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { Placa } from './Placa';
import { RADIO, TOQUE_MINIMO, color, espacio, texto } from './tema';

/** Campo de texto con su rótulo, su estado de foco y su error. */
export function Campo({
  rotulo,
  error,
  obligatorio,
  ...props
}: TextInputProps & { rotulo: string; error?: string; obligatorio?: boolean }) {
  const [enfocado, setEnfocado] = useState(false);
  const inhabilitado = props.editable === false;

  return (
    <View style={s.campo}>
      <View style={s.rotulo}>
        <Placa tono={error ? color.alerta : color.tintaMedia}>{rotulo}</Placa>
        {obligatorio ? <Placa tono={color.tintaMedia}> ·  obligatorio</Placa> : null}
      </View>

      <TextInput
        {...props}
        // El rótulo es un Text hermano: sin esto el lector de pantalla solo
        // anunciaría el placeholder.
        accessibilityLabel={props.accessibilityLabel ?? rotulo}
        accessibilityHint={error ?? props.accessibilityHint}
        onFocus={(e) => { setEnfocado(true); props.onFocus?.(e); }}
        onBlur={(e) => { setEnfocado(false); props.onBlur?.(e); }}
        placeholderTextColor={color.tintaMedia}
        style={[
          s.entrada,
          enfocado && s.enfocado,
          !!error && s.conError,
          inhabilitado && s.inhabilitado,
          props.multiline && s.multilinea,
          props.style,
        ]}
      />

      {error ? (
        <View style={s.mensaje}>
          <Feather name="alert-circle" size={13} color={color.alerta} />
          <Text style={[texto.menor, s.mensajeTexto]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  campo: { marginBottom: espacio.lg },
  rotulo: { flexDirection: 'row', alignItems: 'center', marginBottom: espacio.sm },
  entrada: {
    minHeight: TOQUE_MINIMO,
    borderWidth: 1,
    borderColor: color.regla,
    backgroundColor: color.lamina,
    paddingHorizontal: espacio.md,
    paddingVertical: espacio.md,
    color: color.tinta,
    borderRadius: RADIO,
    ...texto.cuerpo,
  },
  // El borde engorda a 2, así que el padding baja 1 para que el texto no salte.
  enfocado: { borderColor: color.tinta, borderWidth: 2, paddingHorizontal: espacio.md - 1 },
  conError: { borderColor: color.alerta, borderWidth: 2, paddingHorizontal: espacio.md - 1 },
  inhabilitado: { backgroundColor: color.inerte, color: color.sobreInerte },
  multilinea: { minHeight: 92, textAlignVertical: 'top' },
  mensaje: { flexDirection: 'row', alignItems: 'center', marginTop: espacio.sm },
  mensajeTexto: { color: color.alerta, marginLeft: espacio.xs, flex: 1 },
});
