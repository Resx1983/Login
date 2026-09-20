import React, { createContext, useContext, useState } from 'react';
import { ProductoRow } from '../types';

export type ItemCarrito = {
  producto: ProductoRow;
  cantidad: number;
};

type CarritoContextType = {
  items: ItemCarrito[];
  agregarItem: (producto: ProductoRow, cantidad: number) => void;
  quitarItem: (productoId: number) => void;
  limpiarCarrito: () => void;
  totalItems: number;
};

const CarritoContext = createContext<CarritoContextType>({
  items: [],
  agregarItem: () => {},
  quitarItem: () => {},
  limpiarCarrito: () => {},
  totalItems: 0,
});

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const agregarItem = (producto: ProductoRow, cantidad: number) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.producto.Id === producto.Id);
      if (existe) {
        return prev.map((i) =>
          i.producto.Id === producto.Id ? { ...i, cantidad } : i,
        );
      }
      return [...prev, { producto, cantidad }];
    });
  };

  const quitarItem = (productoId: number) => {
    setItems((prev) => prev.filter((i) => i.producto.Id !== productoId));
  };

  const limpiarCarrito = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ items, agregarItem, quitarItem, limpiarCarrito, totalItems }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}
