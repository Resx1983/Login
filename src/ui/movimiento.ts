import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Respeta «Reducir movimiento» (iOS) y «Quitar animaciones» (Android). */
export function useMenosMovimiento() {
  const [menos, setMenos] = useState(false);

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => vivo && setMenos(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setMenos);
    return () => { vivo = false; sub.remove(); };
  }, []);

  return menos;
}
