/**
 * Corre el esquema y el catálogo de demostración de db.ts contra un SQLite real
 * y comprueba lo que la app da por hecho. Lee los SQL del propio db.ts, así que
 * no puede quedarse desfasado.
 *
 *   node src/db.check.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const fuente = readFileSync(new URL('./db.ts', import.meta.url), 'utf8');

const sacar = (nombre) => {
  const m = fuente.match(new RegExp(`export const ${nombre} = \`([\\s\\S]*?)\``));
  assert.ok(m, `No se encontró ${nombre} en db.ts`);
  return m[1];
};

const SCHEMA = sacar('SCHEMA');
const SEED = sacar('SEED_PRODUCTOS');

const db = new DatabaseSync(':memory:');
db.exec(SCHEMA);
db.exec(SCHEMA); // el esquema es idempotente

/** Misma guarda que `sembrarProductos`: solo siembra si la tabla está vacía. */
const sembrar = () => {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM PRODUCTOS').get();
  if (n === 0) db.exec(SEED);
};

sembrar();
sembrar(); // reabrir la app no debe duplicar el catálogo

const productos = db.prepare('SELECT Nombre, ValorUnitario, Stock FROM PRODUCTOS').all();

assert.equal(productos.length, 10, 'el catálogo de demostración debe sembrarse una sola vez');
assert.ok(
  productos.every((p) => p.ValorUnitario > 0),
  'ningún producto puede costar cero: Inventario rechaza ese valor al editarlo',
);
assert.equal(
  productos.filter((p) => p.Stock === 0).length,
  1,
  'debe haber exactamente un agotado, para ver el estado "Agotado"',
);
assert.ok(
  productos.some((p) => p.Stock > 0 && p.Stock <= 5),
  'debe haber uno con stock bajo, para ver el estado "Quedan N"',
);

// Lo que ve el cliente: Productos.tsx filtra por Stock > 0.
const visibles = db.prepare('SELECT COUNT(*) AS n FROM PRODUCTOS WHERE Stock > 0').get().n;
assert.equal(visibles, 9, 'el agotado no debe aparecerle al cliente');

// El admin sembrado debe poder entrar.
db.exec(`INSERT OR IGNORE INTO LOGIN (Correo, Contrasena, Rol, Estado)
         VALUES ('demo@correo.com', 'Admin123', 'admin', 'Activo')`);
const admin = db.prepare("SELECT Rol, Estado FROM LOGIN WHERE Correo = 'demo@correo.com'").get();
assert.deepEqual({ ...admin }, { Rol: 'admin', Estado: 'Activo' });

console.log(`OK — ${productos.length} productos sembrados, ${visibles} visibles para el cliente,`);
console.log('     esquema y siembra idempotentes, admin de prueba activo.');
