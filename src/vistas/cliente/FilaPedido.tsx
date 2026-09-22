import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FilaRegistro } from '../../ui/componentes';
import { CIFRAS_TABULARES, color, dinero, espacio, texto } from '../../ui/tema';

export type Pedido = { Id: number; Fecha: string; Total: number };
export type Linea = { IdEncabezado: number; Nombre: string; Cantidad: number; Subtotal: number };

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * `Fecha` se guarda como 'AAAA-MM-DD'. Se parte a mano porque `new Date` la
 * leería como UTC y en husos negativos mostraría el día anterior.
 */
export function fechaLegible(iso: string) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  if (!anio || !mes || !dia) return iso;
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

/**
 * Un pedido del historial. Se despliega en su sitio en vez de abrir una
 * ventana: el detalle se hunde en la tabla, porque este mundo no apila
 * tarjetas dentro de tarjetas.
 */
export function FilaPedido({
  pedido,
  lineas,
  desplegado,
  ultima,
  onAlternar,
}: {
  pedido: Pedido;
  lineas: Linea[];
  desplegado: boolean;
  ultima: boolean;
  onAlternar: () => void;
}) {
  const unidades = lineas.reduce((n, l) => n + l.Cantidad, 0);

  return (
    <View>
      <FilaRegistro
        titulo={`Pedido #${pedido.Id}`}
        apoyo={`${fechaLegible(pedido.Fecha)} · ${unidades} ${
          unidades === 1 ? 'unidad' : 'unidades'
        } en ${lineas.length} ${lineas.length === 1 ? 'producto' : 'productos'}`}
        ultima={desplegado || ultima}
        onPress={onAlternar}
        etiqueta={`${desplegado ? 'Ocultar' : 'Ver'} el detalle del pedido ${pedido.Id}`}
        derecha={
          <View style={s.derecha}>
            <Text style={[texto.grande, s.total]} numberOfLines={1} adjustsFontSizeToFit>
              {dinero(pedido.Total)}
            </Text>
            <Feather
              name={desplegado ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={color.tintaMedia}
              style={s.flecha}
            />
          </View>
        }
      />

      {desplegado && (
        <View style={[s.detalle, ultima && s.detalleUltimo]}>
          {lineas.map((l, i) => (
            <View key={`${l.IdEncabezado}-${i}`} style={s.linea}>
              <Text style={[texto.menor, s.nombre]} numberOfLines={1}>
                {l.Nombre}
              </Text>
              <Text style={[texto.menor, s.cantidad]}>×{l.Cantidad}</Text>
              <Text style={[texto.menor, s.subtotal]}>{dinero(l.Subtotal)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  derecha: { alignItems: 'flex-end' },
  total: { color: color.tinta, ...CIFRAS_TABULARES },
  flecha: { marginTop: espacio.sm },
  detalle: {
    backgroundColor: color.tabla,
    paddingVertical: espacio.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.regla,
  },
  detalleUltimo: { borderBottomWidth: 0 },
  linea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espacio.sm,
    paddingLeft: espacio.xxl,
    paddingRight: espacio.base,
  },
  nombre: { flex: 1, color: color.tintaMedia, marginRight: espacio.md },
  cantidad: { color: color.tintaMedia, marginRight: espacio.base, ...CIFRAS_TABULARES },
  subtotal: { color: color.tinta, ...CIFRAS_TABULARES },
});
