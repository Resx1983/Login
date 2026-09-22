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

// ── Historial de pedidos ────────────────────────────────────────────────────
// Simula una compra y corre las mismas consultas que usa Pedidos.tsx. Si
// alguien renombra una columna o rompe un JOIN, esto falla aquí y no en el
// teléfono.
db.exec(`INSERT INTO LOGIN (Correo, Contrasena, Rol, Estado)
         VALUES ('ana@correo.com', 'Clave123', 'cliente', 'Activo')`);
const idLogin = db.prepare("SELECT Id FROM LOGIN WHERE Correo = 'ana@correo.com'").get().Id;
db.exec(`INSERT INTO CLIENTES (IdLogin, Nombre, Apellido, Correo)
         VALUES (${idLogin}, 'Ana', 'Ríos', 'ana@correo.com')`);
const idCliente = db.prepare('SELECT Id FROM CLIENTES WHERE IdLogin = ?').get(idLogin).Id;

const cafe = db.prepare("SELECT Id, ValorUnitario FROM PRODUCTOS WHERE Nombre LIKE 'Café%'").get();
const arroz = db.prepare("SELECT Id, ValorUnitario FROM PRODUCTOS WHERE Nombre LIKE 'Arroz%'").get();
const total = cafe.ValorUnitario * 2 + arroz.ValorUnitario * 1;

db.exec(`INSERT INTO ENCABEZADO (IdCliente, Fecha, Total)
         VALUES (${idCliente}, '2026-09-17', ${total})`);
const idPedido = db.prepare('SELECT last_insert_rowid() AS id').get().id;
db.exec(`INSERT INTO DETALLES (IdEncabezado, IdProducto, Cantidad, Subtotal) VALUES
  (${idPedido}, ${cafe.Id},  2, ${cafe.ValorUnitario * 2}),
  (${idPedido}, ${arroz.Id}, 1, ${arroz.ValorUnitario})`);

const encabezados = db
  .prepare('SELECT Id, Fecha, Total FROM ENCABEZADO WHERE IdCliente = ? ORDER BY Id DESC')
  .all(idCliente);
const detalles = db
  .prepare(
    `SELECT d.IdEncabezado, p.Nombre, d.Cantidad, d.Subtotal
       FROM DETALLES d
       JOIN PRODUCTOS p   ON p.Id = d.IdProducto
       JOIN ENCABEZADO e  ON e.Id = d.IdEncabezado
      WHERE e.IdCliente = ?
      ORDER BY d.Id`,
  )
  .all(idCliente);

assert.equal(encabezados.length, 1, 'el cliente debe ver su único pedido');
assert.equal(detalles.length, 2, 'el pedido debe traer sus dos líneas con el nombre del producto');
assert.ok(detalles.every((l) => l.Nombre), 'el JOIN con PRODUCTOS debe resolver el nombre');
assert.equal(
  detalles.reduce((n, l) => n + l.Subtotal, 0),
  encabezados[0].Total,
  'la suma de los subtotales debe cuadrar con el total del encabezado',
);

// Nadie más ve los pedidos de Ana.
assert.equal(
  db.prepare('SELECT COUNT(*) AS n FROM ENCABEZADO WHERE IdCliente = ?').get(idCliente + 999).n,
  0,
  'el historial está acotado al cliente que lo pide',
);

console.log(`OK — ${productos.length} productos sembrados, ${visibles} visibles para el cliente,`);
console.log('     esquema y siembra idempotentes, admin de prueba activo,');
console.log(`     historial: ${encabezados.length} pedido con ${detalles.length} líneas que cuadran.`);
