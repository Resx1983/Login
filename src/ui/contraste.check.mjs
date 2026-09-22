/**
 * Verifica que cada par color-sobre-color que la app usa de verdad cumpla el
 * mínimo de contraste WCAG. Lee los hex de tema.ts, así que no puede quedarse
 * desfasado cuando la paleta cambie.
 *
 *   node src/ui/contraste.check.mjs
 */
import { readFileSync } from 'node:fs';

const fuente = readFileSync(new URL('./tema.ts', import.meta.url), 'utf8');
const color = Object.fromEntries(
  [...fuente.matchAll(/^\s{2}(\w+):\s*'(#[0-9A-Fa-f]{6})'/gm)].map((m) => [m[1], m[2]]),
);

const luminancia = (hex) => {
  const canales = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
};

const razon = (a, b) => {
  const [alta, baja] = [luminancia(color[a]), luminancia(color[b])].sort((x, y) => y - x);
  return (alta + 0.05) / (baja + 0.05);
};

// [frente, fondo, mínimo, dónde se usa]
const PARES = [
  ['tinta', 'tabla', 4.5, 'texto principal sobre la tabla'],
  ['tinta', 'lamina', 4.5, 'texto principal sobre lámina'],
  ['tintaMedia', 'tabla', 4.5, 'texto secundario y placeholder sobre la tabla'],
  ['tintaMedia', 'lamina', 4.5, 'texto secundario y placeholder sobre lámina'],
  ['tintaTenue', 'tabla', 3, 'texto grande atenuado (≥19px)'],
  ['alerta', 'tabla', 4.5, 'error sobre la tabla'],
  ['alerta', 'lamina', 4.5, 'error sobre lámina'],
  ['espera', 'tabla', 4.5, 'pendiente y stock bajo sobre la tabla'],
  ['espera', 'lamina', 4.5, 'pendiente y stock bajo sobre lámina'],
  ['tinta', 'flash', 4.5, 'texto sobre el amarillo de selección'],
  ['sobreTinta', 'tinta', 4.5, 'texto sobre plantilla de tinta'],
  ['sobreTinta', 'alerta', 4.5, 'texto sobre plantilla de alerta'],
  ['sobreInerte', 'inerte', 4.5, 'texto de control desactivado'],
  ['tinta', 'inerte', 4.5, 'icono de control desactivado'],
];

let fallos = 0;
for (const [frente, fondo, minimo, uso] of PARES) {
  if (!color[frente] || !color[fondo]) {
    console.log(`FALTA  ${frente} o ${fondo} ya no existen en tema.ts — ${uso}`);
    fallos++;
    continue;
  }
  const valor = razon(frente, fondo);
  const ok = valor >= minimo;
  if (!ok) fallos++;
  console.log(`${ok ? 'OK   ' : 'FALLA'} ${valor.toFixed(2).padStart(6)} : ${minimo} — ${uso}`);
}

console.log(
  fallos
    ? `\n${fallos} par(es) por debajo del mínimo.`
    : `\n${PARES.length} pares verificados, todos cumplen.`,
);
process.exit(fallos ? 1 : 0);
