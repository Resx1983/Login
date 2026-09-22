import * as SQLite from 'expo-sqlite';

import { ItemCarrito } from '../context/CarritoContext';

/**
 * Registra una compra completa: encabezado, detalles y descuento de stock.
 *
 * Todo ocurre dentro de una transacción, así que o se escribe entero o no se
 * escribe nada. El stock se vuelve a verificar aquí dentro, contra la base y no
 * contra el carrito: entre que el cliente agregó el producto y confirma, el
 * admin pudo haberlo cambiado.
 *
 * Devuelve el número de pedido. Lanza con un mensaje legible si falta stock.
 */
export async function registrarCompra(
  db: SQLite.SQLiteDatabase,
  idCliente: number,
  items: ItemCarrito[],
  total: number,
): Promise<number> {
  let idEncabezado = 0;

  await db.withTransactionAsync(async () => {
    for (const item of items) {
      const p = await db.getFirstAsync<{ Stock: number }>(
        'SELECT Stock FROM PRODUCTOS WHERE Id = ?',
        item.producto.Id,
      );
      if (!p || p.Stock < item.cantidad) {
        throw new Error(
          `Ya no queda suficiente "${item.producto.Nombre}". Disponible ahora: ${p?.Stock ?? 0}.`,
        );
      }
    }

    const resultado = await db.runAsync(
      "INSERT INTO ENCABEZADO (IdCliente, Fecha, Total) VALUES (?, date('now'), ?)",
      idCliente,
      total,
    );
    idEncabezado = resultado.lastInsertRowId;

    for (const item of items) {
      await db.runAsync(
        'INSERT INTO DETALLES (IdEncabezado, IdProducto, Cantidad, Subtotal) VALUES (?,?,?,?)',
        idEncabezado,
        item.producto.Id,
        item.cantidad,
        item.producto.ValorUnitario * item.cantidad,
      );
      await db.runAsync(
        'UPDATE PRODUCTOS SET Stock = Stock - ? WHERE Id = ?',
        item.cantidad,
        item.producto.Id,
      );
    }
  });

  return idEncabezado;
}
