import { Component, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from './Boton';
import { Placa } from './Placa';
import { color, espacio, texto } from './tema';

/**
 * Un error que sabemos explicar, con qué hacer al respecto.
 * `null` significa que no lo reconocemos y mostramos el mensaje crudo.
 */
function explicar(error: Error): { titulo: string; causa: string; salida: string } | null {
  const mensaje = `${error.name}: ${error.message}`;

  // OPFS da handles exclusivos por archivo, y el inspector de expo-sqlite
  // (Shift+M) se sirve del mismo origen que la app web. Los dos abren
  // tienda.db y el segundo se queda fuera.
  if (mensaje.includes('NoModificationAllowedError') || mensaje.includes('Access Handles')) {
    return {
      titulo: 'LA BASE\nESTÁ OCUPADA',
      causa:
        'Otra cosa tiene abierta tienda.db. En el navegador, el archivo solo admite un dueño a la vez, y el inspector de SQLite cuenta como dueño.',
      salida:
        'Cierra el inspector con su botón "Close Database", o cierra las demás pestañas de la app, y recarga. En el teléfono esto no ocurre.',
    };
  }

  return null;
}

type Props = { children: ReactNode };
type Estado = { error: Error | null };

/**
 * Atrapa lo que reviente al renderizar y lo cuenta en el idioma de la app, en
 * vez de dejar la pantalla roja de React.
 *
 * No es un reemplazo del manejo de errores: cada pantalla sigue tratando los
 * suyos. Esto es la última red, para lo que nadie previó.
 */
export class LimiteDeError extends Component<Props, Estado> {
  state: Estado = { error: null };

  static getDerivedStateFromError(error: Error): Estado {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Queda en la consola de Metro para poder depurarlo.
    console.error('[Tablero] error no controlado:', error);
  }

  reintentar = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const conocido = explicar(error);

    return (
      <View style={s.pantalla}>
        <ScrollView contentContainerStyle={s.contenido}>
          <Placa tono={color.alerta}>Algo se rompió</Placa>
          <Text style={[texto.gigante, s.titulo]}>
            {conocido ? conocido.titulo : 'ERROR\nINESPERADO'}
          </Text>
          <View style={s.regla} />

          <Text style={[texto.cuerpo, s.cuerpo]}>
            {conocido ? conocido.causa : `${error.name}: ${error.message}`}
          </Text>

          {conocido ? <Text style={[texto.menor, s.salida]}>{conocido.salida}</Text> : null}
        </ScrollView>

        <View style={s.pie}>
          <Boton onPress={this.reintentar} icono="refresh-cw">
            Reintentar
          </Boton>
        </View>
      </View>
    );
  }
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: espacio.base,
    paddingVertical: espacio.xxxl,
  },
  titulo: { color: color.tinta, marginTop: espacio.sm },
  regla: { height: 3, width: 56, backgroundColor: color.alerta, marginVertical: espacio.lg },
  cuerpo: { color: color.tintaMedia, maxWidth: 340 },
  salida: { color: color.tinta, marginTop: espacio.lg, maxWidth: 340 },
  pie: {
    padding: espacio.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.regla,
  },
});
