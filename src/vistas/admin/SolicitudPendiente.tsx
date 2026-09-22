import { StyleSheet, Text, View } from 'react-native';

import { Boton, Marca, Placa, Selector } from '../../ui/componentes';
import { color, espacio, texto } from '../../ui/tema';

export type Rol = 'admin' | 'cliente';

const ROLES = [
  { valor: 'cliente' as const, etiqueta: 'Cliente' },
  { valor: 'admin' as const, etiqueta: 'Admin' },
];

/**
 * Una solicitud de acceso esperando aprobación.
 *
 * No es una fila de la retícula común porque no es un registro: es un
 * formulario corto —correo, rol, consecuencia, acción— y forzarlo dentro de
 * `FilaRegistro` lo dejaría peor.
 *
 * Activar es irreversible, así que su botón va aislado con espacio propio y
 * debajo de una frase que dice qué va a pasar.
 */
export function SolicitudPendiente({
  correo,
  rol,
  procesando,
  onCambiarRol,
  onActivar,
}: {
  correo: string;
  rol: Rol;
  procesando: boolean;
  onCambiarRol: (rol: Rol) => void;
  onActivar: () => void;
}) {
  return (
    <View style={s.solicitud}>
      <View style={s.encabezado}>
        <Text style={[texto.cuerpoFuerte, s.correo]} numberOfLines={1}>
          {correo}
        </Text>
        <Marca tono="espera">En espera</Marca>
      </View>

      <Placa style={s.rotuloRol}>Entra como</Placa>
      <Selector opciones={ROLES} valor={rol} onCambio={onCambiarRol} />

      <View style={s.accion}>
        <Text style={[texto.menor, s.consecuencia]}>
          {rol === 'admin'
            ? 'Como admin podrá aprobar cuentas y editar el inventario.'
            : 'Como cliente podrá comprar, pero no editar el inventario.'}
        </Text>
        <Boton tipo="contorno" onPress={onActivar} cargando={procesando} icono="check">
          Activar cuenta
        </Boton>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  solicitud: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
    padding: espacio.base,
    marginBottom: espacio.md,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacio.lg,
  },
  correo: { color: color.tinta, flex: 1, marginRight: espacio.md },
  rotuloRol: { marginBottom: espacio.sm },
  accion: { marginTop: espacio.xxl },
  consecuencia: { color: color.tintaMedia, marginBottom: espacio.md },
});
