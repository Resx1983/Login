/**
 * Genera los íconos de la app desde el sistema visual, no a mano.
 *
 *   node scripts/generar-iconos.mjs
 *
 * PROVENANCIA: este script ES el origen de todos los PNG de `assets/`. No hay
 * ninguna imagen descargada ni generada por otro medio: si hay que cambiar el
 * logo, se cambia aquí y se vuelve a ejecutar.
 *
 * La marca es la "T" de Tablero dibujada como letra de rotulista: pesada, plana,
 * sin degradado y sin esquina redondeada, en el amarillo de selección sobre la
 * tinta esmalte. Es la misma gramática del tablero de precios que usa la app.
 * Los colores se leen de src/ui/tema.ts para que no puedan desincronizarse.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

// ── Paleta: se toma de tema.ts, nunca se reescribe aquí ──────────────────────
const tema = readFileSync(join(RAIZ, 'src/ui/tema.ts'), 'utf8');
const token = (nombre) => {
  const m = tema.match(new RegExp(`^\\s{2}${nombre}:\\s*'(#[0-9A-Fa-f]{6})'`, 'm'));
  if (!m) throw new Error(`No encuentro el token ${nombre} en tema.ts`);
  const hex = m[1];
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
};

const TINTA = token('tinta');
const FLASH = token('flash');
const BLANCO = [255, 255, 255];

// ── PNG mínimo (RGBA, sin filtros) ───────────────────────────────────────────
const TABLA_CRC = Int32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = TABLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const trozo = (tipo, datos) => {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
};

function escribirPng(ruta, ancho, alto, pixeles) {
  const bruto = Buffer.alloc((ancho * 4 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    bruto[y * (ancho * 4 + 1)] = 0; // filtro: ninguno
    pixeles.copy(bruto, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  writeFileSync(
    ruta,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      trozo('IHDR', ihdr),
      trozo('IDAT', deflateSync(bruto, { level: 9 })),
      trozo('IEND', Buffer.alloc(0)),
    ]),
  );
}

// ── Lienzo ───────────────────────────────────────────────────────────────────
const lienzo = (lado, fondo) => {
  const px = Buffer.alloc(lado * lado * 4);
  if (fondo) {
    for (let i = 0; i < lado * lado; i++) {
      px[i * 4] = fondo[0];
      px[i * 4 + 1] = fondo[1];
      px[i * 4 + 2] = fondo[2];
      px[i * 4 + 3] = 255;
    }
  }
  return px;
};

/** Rectángulo sólido. El mundo no tiene esquinas redondeadas, así que basta. */
const rect = (px, lado, x0, y0, w, h, color) => {
  const xi = Math.round(x0);
  const yi = Math.round(y0);
  for (let y = yi; y < yi + Math.round(h); y++) {
    if (y < 0 || y >= lado) continue;
    for (let x = xi; x < xi + Math.round(w); x++) {
      if (x < 0 || x >= lado) continue;
      const i = (y * lado + x) * 4;
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = 255;
    }
  }
};

/**
 * La T de rotulista. Dos rectángulos: travesaño y asta.
 * `proporcion` es el lado de la caja de la letra respecto al lienzo.
 * Los pesos (0.25 y 0.295) están tomados de la Archivo Black que usa la app.
 */
const dibujarT = (px, lado, proporcion, color) => {
  const caja = lado * proporcion;
  const x0 = (lado - caja) / 2;
  const y0 = (lado - caja) / 2;
  const travesano = caja * 0.25;
  const asta = caja * 0.295;
  rect(px, lado, x0, y0, caja, travesano, color);
  rect(px, lado, x0 + (caja - asta) / 2, y0 + travesano, asta, caja - travesano, color);
};

// ── Los seis archivos que declara app.json ───────────────────────────────────
mkdirSync(join(RAIZ, 'assets'), { recursive: true });
const salida = (nombre) => join(RAIZ, 'assets', nombre);

// icon.png — iOS y genérico. El sistema le aplica su propia máscara, así que va
// a sangre. La marca ocupa el 55 %.
{
  const lado = 1024;
  const px = lienzo(lado, TINTA);
  dibujarT(px, lado, 0.55, FLASH);
  escribirPng(salida('icon.png'), lado, lado, px);
}

// Adaptativo de Android: la zona segura es el 66 % central, así que la marca
// del plano delantero se encoge para no quedar recortada por ninguna máscara.
{
  const lado = 1024;
  const fondo = lienzo(lado, TINTA);
  escribirPng(salida('android-icon-background.png'), lado, lado, fondo);

  const frente = lienzo(lado, null);
  dibujarT(frente, lado, 0.42, FLASH);
  escribirPng(salida('android-icon-foreground.png'), lado, lado, frente);

  // Monocromo: Android lo tiñe con el color del tema del usuario y solo usa el
  // canal alfa, así que la silueta va opaca sobre transparente.
  const mono = lienzo(lado, null);
  dibujarT(mono, lado, 0.42, BLANCO);
  escribirPng(salida('android-icon-monochrome.png'), lado, lado, mono);
}

// splash-icon.png — sobre el fondo de tinta que declara app.json.
{
  const lado = 1024;
  const px = lienzo(lado, null);
  dibujarT(px, lado, 0.42, FLASH);
  escribirPng(salida('splash-icon.png'), lado, lado, px);
}

// favicon.png — a 48 px la letra necesita más aire para no empastarse.
{
  const lado = 48;
  const px = lienzo(lado, TINTA);
  dibujarT(px, lado, 0.6, FLASH);
  escribirPng(salida('favicon.png'), lado, lado, px);
}

console.log('Íconos generados en assets/ — icon, adaptativo (3), splash y favicon.');
