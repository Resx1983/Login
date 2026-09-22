/**
 * Piezas del TABLERO DE PRECIOS.
 *
 * Este archivo no define nada: es la puerta única del sistema de diseño. Cada
 * pieza vive en su propio archivo, con sus estilos al lado, y se reexporta
 * desde aquí — así una pantalla sigue escribiendo un solo import y DESIGN.md
 * mantiene su promesa: si un componente no sale de `ui/componentes`, no es
 * parte del sistema.
 *
 * Si un botón, un campo o una fila se ve distinto en dos pantallas, uno de los
 * dos está mal.
 */

// Átomos
export { Placa } from './Placa';
export { Marca } from './Marca';
export { Regla, Hoja } from './superficies';

// Estructura
export { Fila, FilaRegistro } from './Fila';
export { Cabecera } from './Cabecera';
export { Pie, ALTO_PIE } from './Pie';

// Acciones
export { Boton, Enlace } from './Boton';
export { Selector } from './Selector';

// Formulario
export { Campo } from './Campo';

// Estados y retroalimentación
export { Aviso } from './Aviso';
export { Vacio, Cargando } from './estados';
export { refresco } from './refresco';

// Red de seguridad
export { LimiteDeError } from './LimiteDeError';

// Accesibilidad
export { useMenosMovimiento } from './movimiento';
