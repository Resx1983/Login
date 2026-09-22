import * as SQLite from 'expo-sqlite';

export const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS LOGIN (
  Id         INTEGER PRIMARY KEY,
  Correo     TEXT NOT NULL UNIQUE COLLATE NOCASE,
  Contrasena TEXT NOT NULL,
  Rol        TEXT NOT NULL DEFAULT 'cliente',
  Estado     TEXT NOT NULL DEFAULT 'Pendiente'
);

CREATE TABLE IF NOT EXISTS CLIENTES (
  Id       INTEGER PRIMARY KEY,
  IdLogin  INTEGER REFERENCES LOGIN(Id),
  Nombre   TEXT,
  Apellido TEXT,
  Correo   TEXT
);

CREATE TABLE IF NOT EXISTS PRODUCTOS (
  Id            INTEGER PRIMARY KEY,
  Nombre        TEXT NOT NULL,
  Descripcion   TEXT,
  Stock         INTEGER NOT NULL DEFAULT 0,
  ValorUnitario REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ENCABEZADO (
  Id        INTEGER PRIMARY KEY,
  IdCliente INTEGER NOT NULL REFERENCES CLIENTES(Id),
  Fecha     TEXT NOT NULL DEFAULT (date('now')),
  Total     REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS DETALLES (
  Id           INTEGER PRIMARY KEY,
  IdEncabezado INTEGER NOT NULL REFERENCES ENCABEZADO(Id) ON DELETE CASCADE,
  IdProducto   INTEGER NOT NULL REFERENCES PRODUCTOS(Id),
  Cantidad     INTEGER NOT NULL,
  Subtotal     REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_encabezado_cliente ON ENCABEZADO(IdCliente);
CREATE INDEX IF NOT EXISTS idx_detalles_encabezado ON DETALLES(IdEncabezado);
`;

/**
 * Migraciones incrementales: se ejecutan de forma idempotente
 * usando try/catch ya que SQLite no soporta ADD COLUMN IF NOT EXISTS.
 */
async function runMigrations(db: SQLite.SQLiteDatabase) {
  const migrations: Array<{ name: string; sql: string }> = [
    // LOGIN: agregar Estado si no existe
    {
      name: 'login_add_estado',
      sql: "ALTER TABLE LOGIN ADD COLUMN Estado TEXT NOT NULL DEFAULT 'Pendiente'",
    },
    // LOGIN: normalizar Rol a 'cliente' por defecto
    {
      name: 'login_fix_rol_default',
      sql: "UPDATE LOGIN SET Rol = 'cliente' WHERE Rol = 'usuario'",
    },
    // CLIENTES: agregar IdLogin
    {
      name: 'clientes_add_idlogin',
      sql: 'ALTER TABLE CLIENTES ADD COLUMN IdLogin INTEGER REFERENCES LOGIN(Id)',
    },
    // CLIENTES: agregar Nombre
    {
      name: 'clientes_add_nombre',
      sql: 'ALTER TABLE CLIENTES ADD COLUMN Nombre TEXT',
    },
    // CLIENTES: agregar Apellido
    {
      name: 'clientes_add_apellido',
      sql: 'ALTER TABLE CLIENTES ADD COLUMN Apellido TEXT',
    },
    // PRODUCTOS: agregar ValorUnitario (alias de PrecioUnitario para nuevas instalaciones)
    {
      name: 'productos_add_valorunitario',
      sql: 'ALTER TABLE PRODUCTOS ADD COLUMN ValorUnitario REAL NOT NULL DEFAULT 0',
    },
  ];

  for (const migration of migrations) {
    try {
      await db.execAsync(migration.sql);
    } catch {
      // La columna ya existe en instalaciones previas — se ignora el error
    }
  }

  // Seed: asegurar que el admin de prueba esté Activo con rol admin
  await db.runAsync(
    `INSERT OR IGNORE INTO LOGIN (Correo, Contrasena, Rol, Estado)
     VALUES ('demo@correo.com', 'Admin123', 'admin', 'Activo')`,
  );
  await db.runAsync(
    `UPDATE LOGIN SET Estado = 'Activo', Rol = 'admin'
     WHERE Correo = 'demo@correo.com'`,
  );
}

/**
 * Catálogo de DEMOSTRACIÓN. No es el inventario de ningún negocio real: son
 * datos inventados para que la app arranque con algo que mirar y para ejercitar
 * los estados de la interfaz — hay uno agotado y uno con stock bajo a propósito.
 * Bórralos y carga los tuyos desde Inventario antes de usar esto de verdad.
 *
 * Los precios están en la divisa marcador que documenta PRODUCT.md.
 */
export const SEED_PRODUCTOS = `
INSERT INTO PRODUCTOS (Nombre, Descripcion, ValorUnitario, Stock) VALUES
  ('Café molido 500 g',    'Tostión media, bolsa con válvula',        18500, 24),
  ('Arroz blanco 1 kg',    'Grano largo',                              4200, 40),
  ('Aceite de girasol 1 L','Botella PET',                             12900, 18),
  ('Azúcar 1 kg',          'Refinada',                                 4800, 30),
  ('Leche entera 1 L',     'Larga vida, caja',                         3900, 36),
  ('Panela 500 g',         'Bloque',                                   3200, 22),
  ('Huevos AA x 30',       'Cubeta',                                  21500,  3),
  ('Atún en agua 160 g',   'Lata',                                     5600, 15),
  ('Jabón de barra 300 g', 'Para ropa',                                3400, 12),
  ('Gaseosa 1.5 L',        'Botella retornable',                       6900,  0);
`;

/**
 * Siembra el catálogo solo cuando la tabla está vacía: así no revive productos
 * que alguien borró a propósito ni duplica nada al reabrir la app.
 */
async function sembrarProductos(db: SQLite.SQLiteDatabase) {
  const fila = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM PRODUCTOS');
  if (fila && fila.n === 0) {
    await db.execAsync(SEED_PRODUCTOS);
  }
}

export async function initDb(db: SQLite.SQLiteDatabase) {
  await db.execAsync(SCHEMA);
  await runMigrations(db);
  await sembrarProductos(db);
}
