import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ItemCarrito } from '../../context/CarritoContext';
import { FilaRegistro } from '../../ui/componentes';
import { CIFRAS_TABULARES, ONDA, TOQUE_MINIMO, color, dinero, texto } from '../../ui/tema';

/**
 * Una línea del pedido por confirmar.
 *
 * El apoyo dice «de N que había al agregarlo», en pasado y a propósito: el
 * carrito guarda una foto del stock, no el stock vivo. Quien confirma merece
 * saber de cuándo es esa cifra.
 */
export function LineaPedido({
  item,
  ultima,
  bloqueada,
  onQuitar,
}: {
  item: ItemCarrito;
  ultima: boolean;
  bloqueada: boolean;
  onQuitar: () => void;
}) {
  return (
    <FilaRegistro
      titulo={item.producto.Nombre}
      ultima={ultima}
      apoyo={`${item.cantidad} × ${dinero(item.producto.ValorUnitario)} · de ${item.producto.Stock} que había al agregarlo`}
      derecha={
        <View style={s.derecha}>
          <Text style={[texto.titulo, s.subtotal]} numberOfLines={1} adjustsFontSizeToFit>
            {dinero(item.cantidad * item.producto.ValorUnitario)}
          </Text>
          <Pressable
            onPress={onQuitar}
            disabled={bloqueada}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${item.producto.Nombre} del pedido`}
            android_ripple={ONDA}
            style={({ pressed }) => [s.quitar, pressed && s.presionado]}
          >
            <Feather name="x" size={17} color={color.tintaMedia} />
          </Pressable>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  derecha: { alignItems: 'flex-end' },
  subtotal: { color: color.tinta, ...CIFRAS_TABULARES },
  quitar: {
    width: TOQUE_MINIMO,
    height: TOQUE_MINIMO,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  presionado: { opacity: 0.5 },
});
