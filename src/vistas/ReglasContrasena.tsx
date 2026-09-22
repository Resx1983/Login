import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Regla } from '../ui/componentes';
import { color, espacio, texto } from '../ui/tema';

/** Lo que la contraseña tiene que cumplir. Es también lo que valida el registro. */
export const REGLAS = [
  { texto: 'Al menos 8 caracteres', cumple: (p: string) => p.length >= 8 },
  { texto: 'Una letra mayúscula', cumple: (p: string) => /[A-Z]/.test(p) },
  { texto: 'Un número', cumple: (p: string) => /\d/.test(p) },
];

/**
 * El primer requisito incumplido, con el texto que verá quien se registra.
 * Devuelve `null` cuando la contraseña ya sirve.
 */
export function primerFallo(clave: string): string | null {
  if (clave.length < 8) return 'Faltan caracteres: usa 8 o más.';
  if (!/[A-Z]/.test(clave)) return 'Añade al menos una letra mayúscula.';
  if (!/\d/.test(clave)) return 'Añade al menos un número.';
  return null;
}

/**
 * La lista de requisitos, marcándose mientras se escribe.
 *
 * Se muestra antes de fallar, no después: nadie debería descubrir la regla
 * al recibir un error. El estado no depende solo del color — cambia el icono
 * y el peso de la letra.
 */
export function ReglasContrasena({ clave }: { clave: string }) {
  return (
    <View style={s.lista}>
      {REGLAS.map((r, i) => {
        const ok = r.cumple(clave);
        return (
          <View key={r.texto}>
            {i > 0 && <Regla />}
            <View style={s.regla}>
              <Feather
                name={ok ? 'check' : 'minus'}
                size={14}
                color={ok ? color.tinta : color.tintaMedia}
              />
              <Text
                style={[
                  ok ? texto.cuerpoFuerte : texto.cuerpo,
                  s.texto,
                  { color: ok ? color.tinta : color.tintaMedia },
                ]}
              >
                {r.texto}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  lista: {
    backgroundColor: color.lamina,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
    paddingHorizontal: espacio.md,
    marginTop: -espacio.sm,
    marginBottom: espacio.lg,
  },
  regla: { flexDirection: 'row', alignItems: 'center', paddingVertical: espacio.md },
  texto: { marginLeft: espacio.sm, fontSize: 14 },
});
