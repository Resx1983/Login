---
name: Tablero de Precios
description: Tablero de precios pintado a mano traducido a tinta plana — la cifra manda, la regla a un pelo sustituye a la elevación.
colors:
  tabla: "#F2F1EC"
  lamina: "#FFFFFF"
  tinta: "#15140F"
  tintaMedia: "#55534B"
  tintaTenue: "#7E7C72"
  regla: "#D7D5CC"
  flash: "#FFD400"
  alerta: "#A81E14"
  espera: "#7A4E00"
  sobreTinta: "#FBFAF6"
  inerte: "#CFCDC3"
  sobreInerte: "#3F3E38"
typography:
  mega:
    fontFamily: "Archivo_900Black"
    fontSize: "46px"
    letterSpacing: "-1.4px"
  gigante:
    fontFamily: "Archivo_900Black"
    fontSize: "32px"
    letterSpacing: "-0.9px"
  grande:
    fontFamily: "Archivo_900Black"
    fontSize: "24px"
    letterSpacing: "-0.5px"
  titulo:
    fontFamily: "Archivo_700Bold"
    fontSize: "19px"
    letterSpacing: "-0.2px"
  cuerpo:
    fontFamily: "Archivo_400Regular"
    fontSize: "16px"
    lineHeight: "23px"
  cuerpoFuerte:
    fontFamily: "Archivo_600SemiBold"
    fontSize: "16px"
    lineHeight: "23px"
  menor:
    fontFamily: "Archivo_500Medium"
    fontSize: "14px"
    lineHeight: "20px"
  placa:
    fontFamily: "Archivo_700Bold"
    fontSize: "11px"
    lineHeight: "16px"
    letterSpacing: "1.3px"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "20px"
  xl: "24px"
  xxl: "32px"
  xxxl: "44px"
components:
  boton-tinta:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.sobreTinta}"
    typography: "{typography.placa}"
    rounded: "{rounded.none}"
    padding: "0 {spacing.lg}"
    height: "48px"
  boton-tinta-desactivado:
    backgroundColor: "{colors.inerte}"
    textColor: "{colors.sobreInerte}"
  boton-contorno:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    typography: "{typography.placa}"
    rounded: "{rounded.none}"
    padding: "0 {spacing.lg}"
    height: "48px"
  boton-contorno-desactivado:
    backgroundColor: "{colors.inerte}"
    textColor: "{colors.sobreInerte}"
  campo:
    backgroundColor: "{colors.lamina}"
    textColor: "{colors.tinta}"
    typography: "{typography.cuerpo}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
    height: "48px"
  campo-enfocado:
    backgroundColor: "{colors.lamina}"
    textColor: "{colors.tinta}"
    padding: "{spacing.md} 11px"
  campo-error:
    backgroundColor: "{colors.lamina}"
    textColor: "{colors.tinta}"
  campo-inhabilitado:
    backgroundColor: "{colors.inerte}"
    textColor: "{colors.sobreInerte}"
  fila-registro:
    backgroundColor: "{colors.lamina}"
    textColor: "{colors.tinta}"
    typography: "{typography.cuerpoFuerte}"
    rounded: "{rounded.none}"
    padding: "{spacing.base}"
    height: "48px"
  selector-opcion:
    backgroundColor: "transparent"
    textColor: "{colors.tintaMedia}"
    typography: "{typography.placa}"
    rounded: "{rounded.none}"
    height: "48px"
  selector-opcion-activa:
    backgroundColor: "{colors.flash}"
    textColor: "{colors.tinta}"
  marca:
    backgroundColor: "transparent"
    textColor: "{colors.tintaMedia}"
    typography: "{typography.placa}"
    rounded: "{rounded.none}"
    padding: "3px {spacing.sm}"
  marca-espera:
    textColor: "{colors.espera}"
  marca-alerta:
    textColor: "{colors.alerta}"
  aviso-ok:
    backgroundColor: "{colors.lamina}"
    textColor: "{colors.tinta}"
    typography: "{typography.placa}"
    rounded: "{rounded.none}"
    padding: "{spacing.md} {spacing.base}"
  aviso-error:
    backgroundColor: "{colors.alerta}"
    textColor: "{colors.sobreTinta}"
    typography: "{typography.placa}"
    rounded: "{rounded.none}"
    padding: "{spacing.md} {spacing.base}"
---

# Design System: Tablero de Precios

Recorded from the built app (Expo SDK 57 / React Native 0.86 / TypeScript, platform `adaptive`).
The authority for everything below is `src/ui/tema.ts`, `src/ui/componentes.tsx` and the ten screens
under `src/vistas/`. Product truth lives in `PRODUCT.md` and is not repeated here.

**Every token in this file exists in `src/ui/tema.ts`. Every component named here is exported from
`src/ui/componentes.tsx`. If a value you want is in neither file, it is not part of the system yet.**

## Overview

**Creative North Star: "Tablero de Precios"**

The world is the hand-painted price board of a market stall, translated to flat ink: primed board,
enamel ink, hairline rules, and one signwriter yellow that marks exactly one thing per screen. The
direction contract at the top of `App.tsx` states the thesis in one line — **la cifra manda**: the
price, the stock and the total are the largest ink on every screen. It was written against two
predictable alternatives and both were rejected by name: the dark panel with rounded cards and a
blue accent that this category always ships, and its obvious opposite, the white board of grey
cards with an indigo accent.

Depth in this world comes from the rule, never from elevation. There are no shadows, no
`elevation`, and no corner radius anywhere in the codebase — a grep for `shadow`, `elevation` and
`borderRadius` across `src/` returns only `RADIO`, which is `0`. Surfaces separate by a
`StyleSheet.hairlineWidth` seam in `regla` (`#D7D5CC`) against `lamina` (`#FFFFFF`) on the `tabla`
(`#F2F1EC`) ground. The whole system is almost monochrome, and the direction contract records this
as its own honest risk: everything rests on the scale jump between the 11px tracked cap label and
the 32–46px black figure. Soften that jump and this is just a grey app.

Density is counter density: short sessions, standing, one hand, variable ambient light. Groups are
tight (4–12px), separations are generous (24–44px), every touch target is at least 48dp, and the
one primary action of each screen sits docked in the thumb zone at the bottom of the screen.

**Key Characteristics:**
- Flat ink on primed board — zero shadows, zero elevation, zero radius, system-wide.
- Hairline seams (`StyleSheet.hairlineWidth` in `regla`) are the only separator.
- Two typographic extremes only: 11px tracked uppercase `placa` vs 24–46px `Archivo_900Black` figures.
- One signwriter yellow (`flash`) reserved to selection; it appears in exactly three runtime places.
- One row grid (`FilaRegistro`) for every record in the app.
- One primary action per screen, always docked at the bottom.
- No state depends on colour alone; every coloured state carries a word, a weight or a rule.

## Colors

Almost monochrome: a warm primed ground, a near-black enamel ink, and three reserved signals that
each own a single meaning and are never used decoratively.

### Primary

- **Enamel Ink** (`tinta`): the near-black of every headline, figure, title and primary button
  plate. Also the border of the outlined button, the selector frame and the counter frame. On
  `tabla` it measures 16.30:1, on `lamina` 18.44:1.
- **Board Ink Reverse** (`sobreTinta`): the warm off-white used *only* as text and icon colour on a
  `tinta` or `alerta` plate. Never a background.

### Secondary

- **Signwriter Yellow** (`flash`): the single accent. It marks **selection / active state and
  nothing else**, and appears in exactly three places at runtime — the fill behind the active
  `Selector` option (`componentes.tsx`), the chosen-quantity plate in `Productos`, and the active
  tab plate in `Home`. It is never a background, never a button, never a highlight, never a
  decoration. Text on it is always `tinta` (12.88:1).

### Tertiary

- **Enamel Red** (`alerta`): danger and error only. It is the plate colour of the error `Aviso`,
  the border and text of the error state of `Campo`, the `Marca tono="alerta"` ("Agotado"), and the
  3px rule under "COMPRA RECHAZADA" in `Compra`. It is never used for emphasis.
- **Ochre** (`espera`): pending and low stock only. It is the text and border of
  `Marca tono="espera"` — "En espera", "Quedan N", "Datos incompletos", "Llevas todo el stock". It
  is never used for warnings in general.

### Neutral

- **Primed Board** (`tabla`): the screen ground and the navigation theme background, so stack
  transitions are the same board. Also the footer dock background and the pressed state of an
  inactive selector option.
- **Sheet** (`lamina`): the content surface — rows, headers, the `Hoja` container, the tab bar, the
  Home header. Always bounded by hairline seams, never floating.
- **Secondary Ink** (`tintaMedia`): supporting text, placeholders, `Placa` labels by default,
  inactive tab icons and labels, and the consequence line above an irreversible action. 6.81:1 on
  `tabla`.
- **Faint Ink** (`tintaTenue`): reserved for text at 19px or larger, or non-informational elements.
  It clears 3:1, not 4.5:1 — the gate enforces this distinction and it is currently unused in the
  screens.
- **Hairline** (`regla`): the seam. Every divider, every surface edge, every field border at rest.
- **Inert Plate / Inert Reverse** (`inerte` / `sobreInerte`): the disabled pair. Disabled controls
  take a filled inert plate with `sobreInerte` text (6.73:1), never reduced opacity.

### Named Rules

**The One Yellow Rule.** `flash` marks selection or active state and nothing else. It appears in at
most one place per screen. If you are reaching for yellow to make something feel important, you
want scale, not colour — make the figure bigger.

**The Never-Colour-Alone Rule.** No state is communicated by colour alone. `Marca` always carries
the word ("Agotado", "En espera"), the error `Campo` carries an icon plus a message, the active
selector option carries a filled plate and `accessibilityState={{ selected }}`, and the active tab
carries a plate behind the icon. Enforced in `componentes.tsx` by `Marca` requiring children.

**The Runnable Contrast Rule.** `src/ui/contraste.check.mjs` parses the hex values straight out of
`tema.ts` and asserts every colour-on-colour pair the app actually uses. It currently reports
**14 pairs verified, all pass**. Run `node src/ui/contraste.check.mjs` after touching the palette;
it exits non-zero on failure and cannot go stale, because it reads the theme rather than a copy of
it. **Adding a colour pair to the UI means adding its row to `PARES`.**

## Typography

**Display / Figure Font:** Archivo Black (`Archivo_900Black`), self-hosted via `@expo-google-fonts/archivo`
**Body Font:** Archivo (`Archivo_400Regular` / `_500Medium` / `_600SemiBold` / `_700Bold`)
**Label Font:** Archivo Bold at 11px, tracked and uppercase — the `placa`

**Character:** One family, used at two extremes and almost nothing in between. The board is written
in 11px tracked capitals and read in 24–46px black figures; the 14–19px middle exists only to carry
supporting sentences. The five weights are loaded in `App.tsx` and the splash is held until they
resolve, because without the typeface there is no board. If loading fails the app still renders on
the system face rather than blocking.

### Hierarchy

- **mega** (`Archivo_900Black`, 46px, tracking -1.4): the screen's one figure. Used for the login
  wordmark ("PUNTO / DE / VENTA"), the order total in `Compra`, the confirmation number, and
  "EN / ESPERA" in `Register`. One per screen, never two.
- **gigante** (`Archivo_900Black`, 32px, tracking -0.9): the default `Cabecera` size and the unit
  price in every product row (`Productos`, `Inventario`). This is the figure that carries the list.
- **grande** (`Archivo_900Black`, 24px, tracking -0.5): the `Cabecera tamano="grande"` variant
  (`Perfil`), the chosen quantity on the yellow plate, and the edit sheet title in `Inventario`.
- **titulo** (`Archivo_700Bold`, 19px, tracking -0.2): line subtotals, the signed-in email in the
  Home header, the initial in the `ListadoClientes` plate, and `Vacio` headings.
- **cuerpo** (`Archivo_400Regular`, 16px / 23): paragraph text and the text inside `Campo`.
- **cuerpoFuerte** (`Archivo_600SemiBold`, 16px / 23): the title line of every `FilaRegistro`.
- **menor** (`Archivo_500Medium`, 14px / 20): supporting text under a row, the `Cabecera` support
  line, the consequence sentence above an irreversible action, and `Enlace` (underlined).
- **placa** (`Archivo_700Bold`, 11px / 16, tracking 1.3, uppercase): the signwritten cap label. The
  `Placa` component, every button label (overridden to 13px / tracking 1.1), every `Marca`, the
  `Aviso` text (12px) and the tab labels (11px / 0.9).

### Named Rules

**The Family-Carries-Weight Rule.** Weight is selected by font family name only
(`fuente.black`, `fuente.bold`, `fuente.semi`, `fuente.media`, `fuente.regular`). Never write
`fontWeight` — with self-hosted named families React Native ignores it and you silently get the
wrong face.

**The No-Literal-LineHeight-On-Figures Rule.** `mega`, `gigante`, `grande` and `titulo` carry **no**
`lineHeight` on purpose: at system font scale a fixed line box clips the figure, while the font's
own metrics scale with it. Only `cuerpo` (16/23), `menor` (14/20) and `placa` (11/16) keep literal
line heights. Do not "fix" a figure by adding a lineHeight.

**The Tabular Figures Rule.** Any number read in a column takes `CIFRAS_TABULARES`
(`fontVariant: ['tabular-nums']`) — prices, totals, subtotals, quantities. Money is always produced
by `dinero()` from `tema.ts`, which is the single place the currency symbol and locale live.

**The Never-Naked-Figure Rule.** A quantity never stands alone; it always states what it means for
the user. This discipline **splits by screen on purpose, and the split is a decision, not drift**:
- `Productos` is **forward-looking** — `Quedan ${restante} si confirmas` — because that is where
  quantity is *chosen*, and the question is what will be left.
- `Compra` carries **provenance** — `de ${Stock} que había al agregarlo` — because that is where the
  order is *reviewed*, and the cart holds a snapshot, not live stock. Claiming live stock on a
  review screen would be a lie; the confirm transaction re-verifies stock against the database
  before writing.

## Layout

Portrait phone, single column, `espacio.base` (16px) horizontal gutter on every screen. The scale is
a 4-step: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 44. Tight inside a group, generous between groups.

**Screen frame.** `View flex:1` on `color.tabla`. Top inset comes from `useSafeAreaInsets()`, never a
hard-coded status bar height. The Home tab bar does **not** set a fixed height — React Navigation
derives it from system insets; pinning it pushed icons under the gesture bar.

**Header.** `Cabecera` is the standard screen opening: `Placa` label, then the figure
(`gigante` by default, `grande` on `Perfil`), then a 14px support line. Padding 16 horizontal, 24
top, 16 bottom. It rides as `ListHeaderComponent` inside the list, so it scrolls with the content.

**Lists.** `FlatList` with `FilaRegistro` rows on `lamina`, separated by `Regla sangria={16}` (the
seam is inset to the text column, and the last row carries none — that is the `ultima` prop).
`RefreshControl` is tinted `tinta`. `contentContainerStyle` reserves `espacio.xxxl` (44) at the
bottom, or `96` when a footer dock is present.

**The footer dock.** The one primary action per screen is absolutely positioned at
`bottom: 0`, full width, `padding: espacio.base`, `backgroundColor: color.tabla`, with a hairline
top border. Same position on `Productos`, `Inventario`, `Compra` and `Perfil`. Nothing critical
lives in a top corner.

**Forms.** `KeyboardAvoidingView` with `behavior="padding"` on iOS and `"height"` on Android,
wrapping a `ScrollView` with `keyboardShouldPersistTaps="handled"`. Fields stack with
`espacio.lg` (20) between them; paired numeric fields sit in a row with `gap: espacio.md`.

**Bottom sheet.** The `Inventario` edit sheet is a `Modal transparent` with a
`rgba(21,20,15,0.55)` scrim, a tap-to-dismiss area above it, and a sheet on `tabla` capped at
`maxHeight: '88%'`, opened by a **3px solid `tinta` top edge** — a painted edge, not a rounded
corner and not a drag handle. Bottom padding adds `inset.bottom`.

### Named Rules

**The One Primary Action Rule.** Exactly one `Boton tipo="tinta"` per screen, in the footer dock.
Secondary paths are `Enlace`, `Boton tipo="contorno"`, or a bordered inline control.

**The Isolated Consequence Rule.** An irreversible action is separated from the content above it by
deliberate empty space (`marginTop: espacio.xxl` in `AdminCuentas`, or the footer dock's own seam in
`Compra`) and is preceded by a `menor` / `tintaMedia` sentence stating what will happen: *"Al
confirmar se descuenta el stock de estos N productos. No se puede deshacer."* The button label then
restates the stake — `Confirmar · $12.500,00`.

## Elevation & Depth

**This system has no elevation.** There are no shadow tokens, no `shadowColor`, no `elevation`, and
no `shadowOffset` anywhere in `src/`. Depth is conveyed by three devices only:

1. **The hairline seam.** `StyleSheet.hairlineWidth` in `regla` (`#D7D5CC`). Every surface boundary,
   every divider, every footer dock, the tab bar's top edge, the Home header's bottom edge.
2. **Tonal separation.** `lamina` (`#FFFFFF`) sheets sitting on the `tabla` (`#F2F1EC`) ground. The
   difference is deliberately small — the seam does the work, not the tone.
3. **The painted edge.** Where something genuinely arrives on top, it takes a heavy solid rule
   instead of a shadow: the bottom sheet's 3px `tinta` top edge, the 56×3 rule under the login
   wordmark, the 1.5px `tinta` frame of an outlined control. The modal scrim
   (`rgba(21,20,15,0.55)`) is the only translucency in the system.

### Named Rules

**The Seam-Not-Shadow Rule.** If you need to separate two surfaces, add a `Regla` or a hairline
border. Never add a shadow, never add `elevation`. A shadow anywhere in this app is a defect.

**The Opacity-Is-Not-A-State Rule.** Opacity expresses **press only** (`filaPresionada` 0.7,
`botonPresionado` 0.75, step buttons 0.6). Disabled is expressed with the `inerte` / `sobreInerte`
token pair, never with opacity — measured opacity collapsed the composited text contrast to about
1.6:1, far below the minimum.

## Shapes

`RADIO = 0`, declared as a token in `tema.ts` specifically so nobody invents a radius. Every
surface, button, field, badge, plate and sheet is a hard rectangle. Corners are never softened, not
even on the yellow selection fill or the modal.

Form language is border weight, not curvature:

- **Hairline** (`StyleSheet.hairlineWidth`, `regla`): seams and surface edges.
- **1px** (`regla`): the resting `Campo` border and the `Marca` box.
- **1.5px** (`tinta`): an interactive outlined silhouette — the outlined button, the `Selector`
  frame, the quantity counter frame, the "Agregar" button, the "Salir" button, the ok `Aviso`.
  When a field takes focus or error it steps to **2px** and compensates with `paddingHorizontal: espacio.md - 1`
  so the text does not shift.
- **3px** (`tinta` or `alerta`): a painted rule used as punctuation — under the login wordmark
  (56px wide), under a result headline, and as the top edge of the bottom sheet.

Recurring silhouettes: the **ink plate** (a solid `tinta` rectangle with `sobreTinta` on it — the
primary button, the initial plate in `ListadoClientes`, the cart badge) and the **cap plate** (a
small tracked uppercase label, either bare as `Placa` or boxed as `Marca`).

## Components

Everything drawn in this app comes out of `src/ui/componentes.tsx`. Its own header states the
contract: *if a button, a field or a row looks different on two screens, one of them is wrong.*

Icons are Feather from `@expo/vector-icons`, stroke-only, at 13 / 15 / 16 / 17 / 18 / 21 / 26px,
always coloured with a palette token and never carrying meaning on their own.

### Buttons — `Boton`

Props: `children` (string, required), `onPress`, `tipo?: 'tinta' | 'contorno'`, `cargando?`,
`desactivado?`, `icono?` (Feather name), `style?`.

- **Shape:** hard rectangle (radius 0), `minHeight: 48` (`TOQUE_MINIMO`), `paddingHorizontal: 20`,
  `overflow: 'hidden'` so the Android ripple is clipped to the silhouette.
- **Label:** `placa` overridden to 13px / tracking 1.1. Optional leading icon at 16px with 8px gap.
- **`tipo="tinta"` (primary):** `tinta` plate, `sobreTinta` text, ripple `rgba(251,250,246,0.18)`.
  One per screen, in the footer dock.
- **`tipo="contorno"` (secondary):** transparent fill, 1.5px `tinta` border, `tinta` text. Used for
  Cancel in the edit sheet, "Volver al pedido" after a rejected purchase, and "Activar cuenta".
- **Pressed:** `opacity: 0.75` plus the platform ripple. No transform, no shadow.
- **`cargando`:** the label is replaced by an `ActivityIndicator` in the foreground colour; the
  button is disabled and reports `accessibilityState={{ busy: true }}`.
- **`desactivado` — recorded as a decision, not drift:** a disabled **outlined** button becomes an
  outlined **inert plate** — fill `inerte`, border recoloured to `sobreInerte`, text `sobreInerte`.
  It is deliberately *not* a transparent outline, so the control keeps the same silhouette in every
  state and never appears to vanish. Disabled is a token pair, never an opacity.

### Inputs — `Campo`

Props: all `TextInputProps`, plus `rotulo` (required), `error?`, `obligatorio?`.

- **Style:** `lamina` fill, 1px `regla` border, radius 0, padding 12, `minHeight: 48`, `cuerpo` type.
  The label is a `Placa` above the field; `obligatorio` appends a second `Placa` reading
  "· obligatorio".
- **Focus:** border steps to 2px `tinta` (`paddingHorizontal: 11` compensates the shift). No glow,
  no colour wash.
- **Error:** the `Placa` label turns `alerta`, the border becomes 2px `alerta`, and a 13px
  `alert-circle` icon plus a 14px `alerta` message appears below. The message is also piped into
  `accessibilityHint`.
- **Disabled** (`editable={false}`): `inerte` fill with `sobreInerte` text.
- **Multiline:** `minHeight: 92`, `textAlignVertical: 'top'`.
- The component sets `accessibilityLabel` from `rotulo` by default, because the label is a sibling
  `Text` that a screen reader would otherwise skip in favour of the placeholder.

### Rows — `Fila` / `FilaRegistro` (signature component)

`FilaRegistro` is **the only record grid in the app**. Products, inventory, clients, order lines and
accounts are all drawn with it — six usages across five screens, and there is no second row style.

Props: `titulo` (required), `apoyo?`, `marca?`, `cifra?`, `adorno?`, `derecha?`, `onPress?`,
`etiqueta?`, `ultima?`, `lineasTitulo?`.

- **Grid:** `adorno` · (`titulo` / `apoyo` / `cifra` / `marca`) · `derecha`, laid out as a row with
  `alignItems: 'center'`.
- **Surface:** `lamina`, padding 16, `minHeight: 48`, followed by a `Regla sangria={16}` unless
  `ultima`.
- **Type assignment:** `titulo` is `cuerpoFuerte`; `apoyo` is `menor` / `tintaMedia`, max 2 lines,
  8px below; `cifra` sits 8px under the text block (in practice a `gigante` price with tabular
  figures and `adjustsFontSizeToFit`); `marca` sits 12px under that.
- **Pressable rows** get `accessibilityRole="button"`, the `etiqueta` as label, an Android ripple,
  and `opacity: 0.7` while pressed.

`Fila` is the bare version for a row that needs custom internals; `Hoja` is the equivalent bounded
surface for non-row content (hairline top and bottom borders on `lamina`).

### Chips — `Marca`

Props: `children` (required), `tono?: 'neutro' | 'espera' | 'alerta'`.

- **Style:** 1px border in the tone colour, `placa` text at 11px in the same colour, transparent
  fill, padding `3px 8px`, radius 0, `alignSelf: 'flex-start'`.
- **Tones:** `neutro` = `tintaMedia` (e.g. "12 en stock", "Cliente"), `espera` = `espera` ochre
  ("En espera", "Quedan 3", "Datos incompletos"), `alerta` = `alerta` red ("Agotado").
- The word is mandatory — this is where the Never-Colour-Alone rule is enforced structurally.

### Selector — `Selector` (signature component)

The system's signature interaction and one of the three places yellow appears.

Props: `opciones: { valor, etiqueta }[]`, `valor`, `onCambio`.

- **Style:** a single 1.5px `tinta` frame containing equal-flex options at `minHeight: 48`, radius 0,
  `accessibilityRole="radiogroup"` with `role="radio"` children carrying `accessibilityState.selected`.
- **Selection:** an `Animated.View` at `StyleSheet.absoluteFill` in `flash` animates `opacity` and
  `scaleX` from 0 to 1 over `MS` (180ms) with `useNativeDriver` — the yellow *wipes in behind* the
  chosen label. The active label is `tinta`, inactive is `tintaMedia`.
- **Reduced motion:** `useMenosMovimiento()` reads `AccessibilityInfo.isReduceMotionEnabled` and
  subscribes to changes; when on, the duration becomes `0` — the fill still appears, instantly. The
  same hook switches the `Inventario` modal's `animationType` to `'none'`.

### Navigation — Home tab bar

- Bottom tab bar on `lamina` with a hairline `regla` top border and **no fixed height** (insets
  derive it). Labels are `Archivo_700Bold` 11px, tracking 0.9, uppercase; active `tinta`, inactive
  `tintaMedia`.
- **Active state:** a 46×30 `flash` plate sits behind the active icon — the third and last runtime
  use of yellow, and deliberately the same selection grammar as the `Selector` and the quantity
  plate. The cart badge is a `tinta` plate with `sobreTinta` 11px bold.
- The Home header above the tabs is a `lamina` strip with a hairline bottom seam: a `Placa`
  ("Administración" / "Mi cuenta") over the signed-in email at `titulo`, with a 1.5px outlined
  "Salir" control on the right at `minHeight: 48`.
- Stack screens run `headerShown: false` with `contentStyle.backgroundColor = color.tabla`, and the
  navigation theme (`temaNavegacion` in `App.tsx`) overrides `background`, `card`, `border` and
  `text` with palette tokens so transitions happen on the same board.

### Notices — `Aviso`

Props: `texto`, `tipo: 'ok' | 'error'`.

- **`ok`:** `lamina` fill with a 1.5px `tinta` frame, `check` icon, `tinta` text.
  **It deliberately does not use yellow** — yellow belongs to selection, so a confirmation is a
  sheet with an ink edge instead.
- **`error`:** solid `alerta` plate with `sobreTinta` text and an `alert-triangle` icon.
- Both carry `accessibilityRole="alert"` and `accessibilityLiveRegion="polite"`. In `Inventario` the
  notice auto-clears after 4500ms.

### Empty & loading — `Vacio` / `Cargando`

- `Vacio` (props `titulo`, `cuerpo`, `icono?` defaulting to `inbox`): centred, 44px vertical padding,
  a 26px `tintaMedia` Feather icon, a `titulo` heading, and a `menor` body capped at `maxWidth: 280`.
  Its copy **teaches the screen** rather than announcing absence — "Ve a Productos y usa el contador
  de cada fila para armar el pedido" — and it is always placed inside a bounded `lamina` surface.
- `Cargando`: a large `tinta` `ActivityIndicator` centred on `tabla`. No skeletons anywhere.

## Do's and Don'ts

### Do:
- **Do** build every new record list from `FilaRegistro`. It is the one row grid in the app; a new
  list style is a system violation, not a local choice.
- **Do** separate surfaces with `Regla` or a `StyleSheet.hairlineWidth` border in `color.regla`.
- **Do** put the screen's one primary action in the footer dock: absolutely positioned at
  `bottom: 0`, `padding: espacio.base`, `backgroundColor: color.tabla`, hairline top border, with
  `paddingBottom: 96` reserved on the list behind it.
- **Do** make the money, the stock or the total the largest ink on the screen — `gigante` in a row,
  `mega` for the single screen figure — and give it `CIFRAS_TABULARES`.
- **Do** format every currency value through `dinero()` from `tema.ts`. The symbol and locale are a
  placeholder pending a business decision and must change in exactly one place.
- **Do** pair every coloured state with a word: `Marca` with its label, an error field with its
  message, a selected option with its filled plate.
- **Do** state the consequence above an irreversible action and restate the stake in the button
  label, with deliberate empty space (`espacio.xxl` or the dock seam) isolating it.
- **Do** run `node src/ui/contraste.check.mjs` after any palette change, and add a row to `PARES`
  for any new colour-on-colour pair you introduce.
- **Do** honour `useMenosMovimiento()` in anything that animates.
- **Do** keep every touch target at `TOQUE_MINIMO` (48) or larger.

### Don't:
- **Don't** add a shadow, an `elevation`, or a `borderRadius`. `RADIO` is `0` and exists so the
  answer is already written down.
- **Don't** introduce a new accent colour, and don't spend `flash` on anything but selection. It is
  currently in three runtime places; a fourth needs to replace one of them, not join them.
- **Don't** use `alerta` for emphasis or `espera` for general warnings. Red is danger and error only;
  ochre is pending and low stock only.
- **Don't** express disabled with opacity. Use the `inerte` / `sobreInerte` pair — opacity measured
  at roughly 1.6:1 composited contrast.
- **Don't** write `fontWeight`. Select the face by family name from `fuente`.
- **Don't** add a literal `lineHeight` to `mega`, `gigante`, `grande` or `titulo`; the figure must be
  free to grow with the system font scale.
- **Don't** define a colour, a size or a spacing value inline in a screen. If it is not in
  `tema.ts`, it is not in the system — add it there or use what exists.
- **Don't** place a critical action in a top corner. The product is used standing, one-handed.
- **Don't** hard-code a tab bar height or a status bar height; use `useSafeAreaInsets()` and let
  React Navigation derive the bar.
- **Don't** claim live stock on a review surface. `Compra` shows provenance because the cart holds a
  snapshot; only the confirm transaction re-reads the database.

## Verification & Open Gaps

Recorded honestly. These are **not** designed behaviours — they are the limits of what this build
has proven, and an eleventh screen inherits them.

- **No screenshot or device capture was ever taken of this app.** There is no Android SDK, emulator
  or iOS simulator on the build machine. Every claim in this document is code-provable only; nothing
  here has been verified visually on a device.
- **No dark scheme exists.** `app.json` sets `userInterfaceStyle: "light"` and there is no dark
  token set. The light ground is a choice made from the use scene in `PRODUCT.md` — counter, variable
  ambient light — not a default. Building a dark scheme means a second palette and a second pass of
  `contraste.check.mjs`, not an inversion.
- **Tablet is out of scope, and the config says so.** `app.json` sets `ios.supportsTablet: false`;
  the layout is a portrait 3-tab phone layout with a single 16px-gutter column, and the flag now
  matches it rather than promising an iPad experience that does not exist. Resolved by decision, not
  by design: flipping it back means building an expanded-width layout first — on that width Material
  asks for a navigation rail or drawer instead of the bottom bar, and the inventory and product lists
  gain a second column.
- **`minimumFontScale` is iOS-only in React Native.** `Cabecera` (0.6) and the `Compra` total (0.5)
  use it with `adjustsFontSizeToFit`, so shrink-to-fit degrades more coarsely on Android.
- **Verified at `font_scale 1.3`.** The three remaining literal line heights — `placa` 11/16,
  `cuerpo` 16/23, `menor` 14/20 — clip at scale 2.0. The figure styles are already free of this.
## The mark

The app is **Tablero**, and its mark is the letter itself: a signwriter's slab **T** in `flash`
`#FFD400` on a `tinta` `#15140F` ground. Crossbar `0.25` and stem `0.295` of the letter box, taken
from the `Archivo_900Black` the interface already uses. No gradient, no corner radius, no shadow —
the icon obeys the same grammar as every surface in the app, and `flash` on `tinta` is the price
board's own pair.

Every PNG in `assets/` is generated by `scripts/generar-iconos.mjs`, which reads the palette out of
`src/ui/tema.ts`. That script is the provenance: no raster here was downloaded, traced or hand-edited,
so changing the logo means changing the script and re-running it, never opening an image editor. The
letter box is `0.55` of the canvas for `icon.png`, and `0.42` for the Android adaptive foreground,
splash and monochrome layers so the mark clears the adaptive icon's 66% safe zone under any mask.

`android.adaptiveIcon.backgroundColor` is `#15140F`, the same `tinta` token — the Expo template's
pale blue `#E6F4FE` is gone and was never a token in this system. The login screen letters the name
at `mega` (46px) over the empty board, which is the one place the wordmark appears in the interface.
