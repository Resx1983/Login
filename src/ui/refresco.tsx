import { RefreshControl } from 'react-native';

import { color } from './tema';

/**
 * El «desliza para recargar» de todas las listas, con el color del sistema en
 * los dos plataformas (iOS lee `tintColor`, Android `colors`).
 *
 *   <FlatList refreshControl={refresco(refrescando, recargar)} ... />
 */
export function refresco(refrescando: boolean, onRefresh: () => void) {
  return (
    <RefreshControl
      refreshing={refrescando}
      onRefresh={onRefresh}
      tintColor={color.tinta}
      colors={[color.tinta]}
    />
  );
}
