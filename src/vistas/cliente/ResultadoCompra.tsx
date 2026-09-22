import { StyleSheet, Text, View } from 'react-native';

import { Boton, Enlace, Placa } from '../../ui/componentes';
import { color, espacio, texto } from '../../ui/tema';

/** Acuse de una compra que sí quedó registrada. */
export function CompraRegistrada({
  idPedido,
  nombreCliente,
  onNuevaCompra,
  onVerPedidos,
}: {
  idPedido: number | null;
  nombreCliente: string;
  onNuevaCompra: () => void;
  onVerPedidos: () => void;
}) {
  return (
    <View style={s.resultado}>
      <View>
        <Placa>Compra registrada</Placa>
        <Text style={[texto.mega, s.cifra]}>
          PEDIDO{'\n'}#{idPedido}
        </Text>
        <View style={s.regla} />
        <Text style={[texto.cuerpo, s.cuerpo]}>
          Quedó guardada a nombre de {nombreCliente} y el stock ya se descontó del inventario.
        </Text>
      </View>

      <View>
        <Boton onPress={onNuevaCompra} icono="plus">
          Empezar otra compra
        </Boton>
        <Enlace onPress={onVerPedidos}>Ver todos mis pedidos</Enlace>
      </View>
    </View>
  );
}

/**
 * La compra no se registró. Lo primero que dice es que el inventario quedó
 * intacto: es la pregunta que se hace quien ve un error a mitad de una venta.
 */
export function CompraRechazada({ motivo, onVolver }: { motivo: string; onVolver: () => void }) {
  return (
    <View style={s.resultado}>
      <View>
        <Text style={[texto.gigante, s.cifra]}>COMPRA{'\n'}RECHAZADA</Text>
        <View style={[s.regla, s.reglaAlerta]} />
        <Text style={[texto.cuerpo, s.cuerpo]}>{motivo}</Text>
        <Text style={[texto.menor, s.nota]}>
          El inventario quedó intacto. Ajusta las cantidades y vuelve a intentarlo.
        </Text>
      </View>

      <Boton onPress={onVolver} tipo="contorno" icono="arrow-left">
        Volver al pedido
      </Boton>
    </View>
  );
}

const s = StyleSheet.create({
  resultado: {
    flex: 1,
    backgroundColor: color.tabla,
    paddingHorizontal: espacio.base,
    paddingVertical: espacio.xxxl,
    justifyContent: 'space-between',
  },
  cifra: { color: color.tinta, marginTop: espacio.sm },
  regla: { height: 3, width: 56, backgroundColor: color.tinta, marginVertical: espacio.lg },
  reglaAlerta: { backgroundColor: color.alerta },
  cuerpo: { color: color.tintaMedia, maxWidth: 340 },
  nota: { color: color.tintaMedia, marginTop: espacio.md },
});
