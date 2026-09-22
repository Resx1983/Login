import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';

import { ProductoRow } from '../../types';
import { FilaRegistro, Marca } from '../../ui/componentes';
import { CIFRAS_TABULARES, color, dinero, texto } from '../../ui/tema';

/** Bajo este número el stock se marca con palabra, no solo con color. */
const STOCK_BAJO = 5;

/** El stock dicho con palabras. Ningún estado depende solo del color. */
function MarcaStock({ stock }: { stock: number }) {
  if (stock === 0) return <Marca tono="alerta">Agotado</Marca>;
  if (stock <= STOCK_BAJO) return <Marca tono="espera">Quedan {stock}</Marca>;
  return <Marca>{stock} en stock</Marca>;
}

/** Una línea del inventario. El precio es la tinta más grande: la cifra manda. */
export function FilaProducto({
  producto,
  ultima,
  onPress,
}: {
  producto: ProductoRow;
  ultima: boolean;
  onPress: () => void;
}) {
  return (
    <FilaRegistro
      titulo={producto.Nombre}
      lineasTitulo={2}
      apoyo={producto.Descripcion}
      ultima={ultima}
      onPress={onPress}
      etiqueta={`Editar ${producto.Nombre}`}
      cifra={
        <Text style={[texto.gigante, s.precio]} numberOfLines={1} adjustsFontSizeToFit>
          {dinero(producto.ValorUnitario)}
        </Text>
      }
      marca={<MarcaStock stock={producto.Stock} />}
      derecha={<Feather name="edit-2" size={16} color={color.tintaMedia} />}
    />
  );
}

const s = StyleSheet.create({
  precio: { color: color.tinta, ...CIFRAS_TABULARES },
});
