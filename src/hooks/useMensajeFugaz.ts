import { useCallback, useEffect, useRef, useState } from 'react';

export type Mensaje = { texto: string; tipo: 'ok' | 'error' };

/**
 * Acuse que se borra solo a los 4,5 s.
 *
 * El temporizador se limpia al desmontar: sin eso, cambiar de pestaña antes de
 * que expire deja un setState sobre un componente que ya no existe.
 *
 *   const [mensaje, mostrar] = useMensajeFugaz();
 *   mostrar('Producto guardado', 'ok');
 */
export function useMensajeFugaz(msVisible = 4500) {
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limpiar = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  };

  useEffect(() => limpiar, []);

  const mostrar = useCallback((texto: string, tipo: Mensaje['tipo']) => {
    setMensaje({ texto, tipo });
    limpiar();
    temporizador.current = setTimeout(() => setMensaje(null), msVisible);
  }, [msVisible]);

  return [mensaje, mostrar] as const;
}
