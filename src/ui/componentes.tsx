/**
 * Piezas del TABLERO DE PRECIOS. Todo lo que se dibuja en la app sale de aquí:
 * si un botón, un campo o una fila se ve distinto en dos pantallas, uno de los
 * dos está mal.
 */
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { MS, RADIO, TOQUE_MINIMO, color, espacio, texto } from './tema';

type Hijos = { children: React.ReactNode };

/** Ondas de Android. En iOS no aplica y se ignora. */
const ONDA = { color: 'rgba(21,20,15,0.12)' };

/** Respeta «Reducir movimiento» (iOS) y «Quitar animaciones» (Android). */
export function useMenosMovimiento() {
  const [menos, setMenos] = useState(false);
  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => vivo && setMenos(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setMenos);
    return () => { vivo = false; sub.remove(); };
  }, []);
  return menos;
}

// ── Rótulo: la mayúscula rotulada del tablero ────────────────────────────────
export function Placa({ children, tono = color.tintaMedia, style }: Hijos & { tono?: string; style?: ViewStyle }) {
  return <Text style={[texto.placa, { color: tono }, style as never]}>{children}</Text>;
}

// ── Regla a un pelo. La profundidad de este mundo. ───────────────────────────
export function Regla({ sangria = 0 }: { sangria?: number }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: color.regla, marginLeft: sangria }} />;
}

// ── Lámina: superficie de contenido, a sangre, sin esquina ni sombra ─────────
export function Hoja({ children, style }: Hijos & { style?: ViewStyle }) {
  return <View style={[s.hoja, style]}>{children}</View>;
}

// ── Fila: la única "tarjeta" que existe en este mundo. ───────────────────────
export function Fila({
  children,
  onPress,
  etiqueta,
  ultima,
  style,
}: Hijos & { onPress?: () => void; etiqueta?: string; ultima?: boolean; style?: ViewStyle }) {
  const cuerpo = <View style={[s.fila, style]}>{children}</View>;
  return (
    <View>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={etiqueta}
          android_ripple={ONDA}
          style={({ pressed }) => pressed && s.filaPresionada}
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
 * Retícula de rótulo única: adorno · (título / apoyo / marca) · cifra o control.
 * Toda lista de la app —productos, inventario, clientes, líneas del pedido,
 * cuentas— se dibuja con esto. Es la promesa de "una sola retícula".
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

      <View style={s.registroTexto}>
        <Text style={[texto.cuerpoFuerte, { color: color.tinta }]} numberOfLines={lineasTitulo}>
          {titulo}
        </Text>
        {apoyo ? (
          <Text style={[texto.menor, s.registroApoyo]} numberOfLines={2}>
            {apoyo}
          </Text>
        ) : null}
        {cifra ? <View style={s.registroCifra}>{cifra}</View> : null}
        {marca ? <View style={s.registroMarca}>{marca}</View> : null}
      </View>

      {derecha ? <View style={s.registroDerecha}>{derecha}</View> : null}
    </Fila>
  );
}

// ── Cabecera de pantalla: rótulo pequeño arriba, cifra grande debajo ─────────
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
        style={[texto[tamano], s.cabeceraTitulo]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {titulo}
      </Text>
      {apoyo ? <Text style={[texto.menor, { color: color.tintaMedia }]}>{apoyo}</Text> : null}
    </View>
  );
}

// ── Botón ────────────────────────────────────────────────────────────────────
type TipoBoton = 'tinta' | 'contorno';

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
  tipo?: TipoBoton;
  cargando?: boolean;
  desactivado?: boolean;
  icono?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}) {
  const bloqueado = !!(cargando || desactivado);
  // Desactivado se expresa con su propio par de tokens, no bajando la opacidad
  // del conjunto: la opacidad hunde el contraste del texto por debajo del mínimo.
  const fondo = desactivado
    ? color.inerte
    : tipo === 'tinta'
      ? color.tinta
      : 'transparent';
  const frente = desactivado
    ? color.sobreInerte
    : tipo === 'tinta'
      ? color.sobreTinta
      : color.tinta;

  return (
    <Pressable
      onPress={onPress}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityState={{ disabled: bloqueado, busy: !!cargando }}
      android_ripple={bloqueado ? undefined : { color: 'rgba(251,250,246,0.18)' }}
      style={({ pressed }) => [
        s.boton,
        { backgroundColor: fondo },
        tipo === 'contorno' && s.botonContorno,
        tipo === 'contorno' && desactivado && { borderColor: color.sobreInerte },
        pressed && !bloqueado && s.botonPresionado,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={frente} />
      ) : (
        <View style={s.botonFila}>
          {icono ? <Feather name={icono} size={16} color={frente} style={{ marginRight: espacio.sm }} /> : null}
          <Text style={[texto.placa, { color: frente, fontSize: 13, letterSpacing: 1.1 }]}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Enlace de texto ──────────────────────────────────────────────────────────
export function Enlace({ children, onPress }: { children: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" android_ripple={ONDA} style={s.enlace}>
      <Text style={[texto.menor, s.enlaceTexto]}>{children}</Text>
    </Pressable>
  );
}

// ── Campo de texto ───────────────────────────────────────────────────────────
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
      <View style={s.campoRotulo}>
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
          s.campoEntrada,
          enfocado && s.campoEnfocado,
          !!error && s.campoError,
          inhabilitado && s.campoInhabilitado,
          props.multiline && s.campoMultilinea,
          props.style,
        ]}
      />
      {error ? (
        <View style={s.campoMensaje}>
          <Feather name="alert-circle" size={13} color={color.alerta} />
          <Text style={[texto.menor, { color: color.alerta, marginLeft: espacio.xs, flex: 1 }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Marca de estado. Nunca solo color: siempre lleva la palabra. ─────────────
export function Marca({ children, tono = 'neutro' }: Hijos & { tono?: 'neutro' | 'espera' | 'alerta' }) {
  const tinte = { neutro: color.tintaMedia, espera: color.espera, alerta: color.alerta }[tono];
  return (
    <View style={[s.marca, { borderColor: tinte }]}>
      <Text style={[texto.placa, { color: tinte, fontSize: 11 }]}>{children}</Text>
    </View>
  );
}

// ── Selector: la interacción firma. El amarillo entra detrás de la elegida. ──
export function Selector<T extends string>({
  opciones,
  valor,
  onCambio,
}: {
  opciones: { valor: T; etiqueta: string }[];
  valor: T;
  onCambio: (v: T) => void;
}) {
  const menosMovimiento = useMenosMovimiento();
  return (
    <View style={s.selector} accessibilityRole="radiogroup">
      {opciones.map((o) => (
        <OpcionSelector
          key={o.valor}
          etiqueta={o.etiqueta}
          activa={o.valor === valor}
          instantaneo={menosMovimiento}
          onPress={() => onCambio(o.valor)}
        />
      ))}
    </View>
  );
}

function OpcionSelector({
  etiqueta,
  activa,
  instantaneo,
  onPress,
}: {
  etiqueta: string;
  activa: boolean;
  instantaneo: boolean;
  onPress: () => void;
}) {
  const entrada = useRef(new Animated.Value(activa ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: activa ? 1 : 0,
      duration: instantaneo ? 0 : MS,
      useNativeDriver: true,
    }).start();
  }, [activa, entrada, instantaneo]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa }}
      android_ripple={ONDA}
      style={({ pressed }) => [s.opcion, pressed && !activa && s.opcionPresionada]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: color.flash, opacity: entrada, transform: [{ scaleX: entrada }] },
        ]}
      />
      <Text style={[texto.placa, { color: activa ? color.tinta : color.tintaMedia, fontSize: 12 }]}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

// ── Aviso transitorio ────────────────────────────────────────────────────────
// El amarillo está reservado a la selección, así que el acuse no lo usa:
// es lámina con filo de tinta. El error sí toma su plantilla roja.
export function Aviso({ texto: mensaje, tipo }: { texto: string; tipo: 'ok' | 'error' }) {
  const esError = tipo === 'error';
  const frente = esError ? color.sobreTinta : color.tinta;
  return (
    <View
      style={[s.aviso, esError ? s.avisoError : s.avisoOk]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Feather name={esError ? 'alert-triangle' : 'check'} size={15} color={frente} />
      <Text style={[texto.placa, { color: frente, marginLeft: espacio.sm, flex: 1, fontSize: 12 }]}>
        {mensaje}
      </Text>
    </View>
  );
}

// ── Estado vacío: enseña la pantalla, no dice "no hay nada" ──────────────────
export function Vacio({
  titulo,
  cuerpo,
  icono = 'inbox',
}: {
  titulo: string;
  cuerpo: string;
  icono?: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={s.vacio}>
      <Feather name={icono} size={26} color={color.tintaMedia} />
      <Text style={[texto.titulo, { color: color.tinta, marginTop: espacio.base }]}>{titulo}</Text>
      <Text style={[texto.menor, s.vacioCuerpo]}>{cuerpo}</Text>
    </View>
  );
}

// ── Cargando ─────────────────────────────────────────────────────────────────
export function Cargando() {
  return (
    <View style={s.centro}>
      <ActivityIndicator size="large" color={color.tinta} />
    </View>
  );
}

const s = StyleSheet.create({
  hoja: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
    borderRadius: RADIO,
  },
  fila: {
    paddingHorizontal: espacio.base,
    paddingVertical: espacio.base,
    minHeight: TOQUE_MINIMO,
    backgroundColor: color.lamina,
  },
  filaPresionada: { opacity: 0.7 },
  registro: { flexDirection: 'row', alignItems: 'center' },
  adorno: { marginRight: espacio.base },
  registroTexto: { flex: 1 },
  registroApoyo: { color: color.tintaMedia, marginTop: espacio.xs },
  registroCifra: { marginTop: espacio.sm },
  registroMarca: { marginTop: espacio.md },
  registroDerecha: { marginLeft: espacio.base, alignItems: 'flex-end' },
  cabecera: { paddingHorizontal: espacio.base, paddingTop: espacio.xl, paddingBottom: espacio.base },
  cabeceraTitulo: { color: color.tinta, marginTop: espacio.sm, marginBottom: espacio.xs },
  boton: {
    minHeight: TOQUE_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.lg,
    borderRadius: RADIO,
    overflow: 'hidden',
  },
  botonContorno: { borderWidth: 1.5, borderColor: color.tinta },
  botonFila: { flexDirection: 'row', alignItems: 'center' },
  botonPresionado: { opacity: 0.75 },
  enlace: { minHeight: TOQUE_MINIMO, justifyContent: 'center', alignItems: 'center' },
  enlaceTexto: { color: color.tinta, textDecorationLine: 'underline' },
  campo: { marginBottom: espacio.lg },
  campoRotulo: { flexDirection: 'row', alignItems: 'center', marginBottom: espacio.sm },
  campoEntrada: {
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
  campoEnfocado: { borderColor: color.tinta, borderWidth: 2, paddingHorizontal: espacio.md - 1 },
  campoError: { borderColor: color.alerta, borderWidth: 2, paddingHorizontal: espacio.md - 1 },
  campoInhabilitado: { backgroundColor: color.inerte, color: color.sobreInerte },
  campoMultilinea: { minHeight: 92, textAlignVertical: 'top' },
  campoMensaje: { flexDirection: 'row', alignItems: 'center', marginTop: espacio.sm },
  marca: {
    borderWidth: 1,
    paddingHorizontal: espacio.sm,
    paddingVertical: 3,
    borderRadius: RADIO,
    alignSelf: 'flex-start',
  },
  selector: { flexDirection: 'row', borderWidth: 1.5, borderColor: color.tinta, borderRadius: RADIO },
  opcion: {
    flex: 1,
    minHeight: TOQUE_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  opcionPresionada: { backgroundColor: color.tabla },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espacio.base,
    paddingVertical: espacio.md,
    borderRadius: RADIO,
  },
  avisoOk: { backgroundColor: color.lamina, borderWidth: 1.5, borderColor: color.tinta },
  avisoError: { backgroundColor: color.alerta },
  vacio: { alignItems: 'center', paddingVertical: espacio.xxxl, paddingHorizontal: espacio.xl },
  vacioCuerpo: { color: color.tintaMedia, textAlign: 'center', marginTop: espacio.sm, maxWidth: 280 },
  centro: { flex: 1, backgroundColor: color.tabla, alignItems: 'center', justifyContent: 'center' },
});
