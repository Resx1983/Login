/**
 * TABLERO DE PRECIOS — sistema visual único de la app.
 *
 * El mundo es el tablero de precios pintado de un puesto de mercado: tabla
 * imprimada, tinta esmalte, reglas a un pelo y un amarillo de rotulista que
 * marca una sola cosa por pantalla. No hay tarjetas flotantes, no hay sombras,
 * no hay radio de esquina: la profundidad la da la regla, no la elevación.
 *
 * Reglas duras del sistema:
 *  - El precio y el stock son la tinta más grande de cualquier pantalla.
 *  - `flash` (amarillo) marca selección/activo. Nunca decora.
 *  - `alerta` (rojo) solo destructivo o error. `espera` (ocre) solo pendiente
 *    o stock bajo. Ningún estado depende solo del color: siempre lleva además
 *    una palabra, un peso o una regla.
 */

export const color = {
  tabla: '#F2F1EC',      // tabla imprimada — fondo de pantalla
  lamina: '#FFFFFF',     // lámina — superficie de contenido
  tinta: '#15140F',      // esmalte negro — texto principal y plantillas
  tintaMedia: '#55534B', // texto secundario y placeholders
  tintaTenue: '#7E7C72', // solo para texto ≥19px o elementos no informativos
  regla: '#D7D5CC',      // regla a un pelo
  flash: '#FFD400',      // amarillo rotulista — SOLO selección / activo
  alerta: '#A81E14',     // rojo esmalte — SOLO destructivo / error
  espera: '#7A4E00',     // ocre — SOLO pendiente / stock bajo
  sobreTinta: '#FBFAF6', // texto sobre plantilla de tinta
  inerte: '#CFCDC3',     // plantilla de control desactivado
  sobreInerte: '#3F3E38', // texto sobre control desactivado
} as const;

/** Escala de 4. Grupos apretados, separaciones generosas. */
export const espacio = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 44,
} as const;

export const fuente = {
  regular: 'Archivo_400Regular',
  media: 'Archivo_500Medium',
  semi: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  black: 'Archivo_900Black',
} as const;

/**
 * Escala fija, razón ~1.2. `placa` es la mayúscula rotulada del tablero:
 * pequeña, tracking abierto, siempre en caja alta.
 */
export const texto = {
  // Sin lineHeight literal: con el ajuste de tamano de fuente del sistema
  // (font_scale 1.3) un lineHeight fijo recorta la cifra. RN usa las metricas
  // de la fuente, que si escalan.
  mega: { fontFamily: fuente.black, fontSize: 46, letterSpacing: -1.4 },
  gigante: { fontFamily: fuente.black, fontSize: 32, letterSpacing: -0.9 },
  grande: { fontFamily: fuente.black, fontSize: 24, letterSpacing: -0.5 },
  titulo: { fontFamily: fuente.bold, fontSize: 19, letterSpacing: -0.2 },
  cuerpo: { fontFamily: fuente.regular, fontSize: 16, lineHeight: 23 },
  cuerpoFuerte: { fontFamily: fuente.semi, fontSize: 16, lineHeight: 23 },
  menor: { fontFamily: fuente.media, fontSize: 14, lineHeight: 20 },
  placa: {
    fontFamily: fuente.bold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.3,
    textTransform: 'uppercase' as const,
  },
} as const;

/** Objetivo táctil mínimo: 48dp Android / 44pt iOS — se toma el mayor. */
export const TOQUE_MINIMO = 48;

/** El tablero no tiene esquinas redondeadas. Se declara para que nadie la invente. */
export const RADIO = 0;

/** Duración única de transición. El producto está en una tarea, no en una película. */
export const MS = 180;

/** Cifras que se leen en columna. iOS lo aplica siempre; Android desde RN 0.70. */
export const CIFRAS_TABULARES = { fontVariant: ['tabular-nums' as const] };

/**
 * Formato de dinero, un solo lugar para toda la app.
 * El simbolo y la configuracion regional son un marcador: PRODUCT.md deja la
 * divisa sin decidir. Cambiar aqui cuando el negocio la confirme.
 */
export const dinero = (valor: number) =>
  `$${valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
