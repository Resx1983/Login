import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

/**
 * Recarga los datos cada vez que la pantalla vuelve al frente.
 *
 * Las pestañas de React Navigation no se desmontan: sin esto, una pantalla se
 * queda para siempre con lo que leyó la primera vez. Es lo que hacía que una
 * compra confirmada no bajara el stock en Productos, o que completar el perfil
 * no desbloqueara la pestaña de Compra.
 */
export function useRecargarAlEnfocar(cargar: () => void) {
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));
}
