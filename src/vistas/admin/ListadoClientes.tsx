import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Cabecera, Cargando, FilaRegistro, Marca, Vacio } from '../../ui/componentes';
import { color, espacio, texto } from '../../ui/tema';

type ClienteConCorreo = {
  Id: number;
  Nombre: string | null;
  Apellido: string | null;
  Correo: string | null;
  LoginCorreo: string;
};

export default function ListadoClientes() {
  const db = useSQLiteContext();
  const [clientes, setClientes] = useState<ClienteConCorreo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    const rows = await db.getAllAsync<ClienteConCorreo>(`
      SELECT
        c.Id,
        c.Nombre,
        c.Apellido,
        c.Correo,
        l.Correo AS LoginCorreo
      FROM CLIENTES c
      JOIN LOGIN l ON l.Id = c.IdLogin
      ORDER BY c.Apellido, c.Nombre
    `);
    setClientes(rows);
    setLoading(false);
    setRefreshing(false);
  }, [db]);

  // Las pestañas no se desmontan: sin esto la pantalla se queda con los datos
  // que leyó la primera vez. Se recarga cada vez que vuelve al frente.
  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (loading) return <Cargando />;

  return (
    <FlatList
      style={s.pantalla}
      data={clientes}
      keyExtractor={(item) => String(item.Id)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); cargar(); }}
          tintColor={color.tinta}
          colors={[color.tinta]}
        />
      }
      ListHeaderComponent={
        <Cabecera
          rotulo="Clientes"
          titulo={String(clientes.length).padStart(2, '0')}
          apoyo="Solo aparecen las cuentas que ya completaron su perfil."
        />
      }
      ListEmptyComponent={
        <View style={s.hojaVacia}>
          <Vacio
            icono="users"
            titulo="Ningún perfil completo"
            cuerpo="Un cliente aparece aquí en cuanto guarda su nombre y apellido desde la pestaña Perfil."
          />
        </View>
      }
      renderItem={({ item, index }) => {
        const completo = !!(item.Nombre && item.Apellido);
        const inicial = (item.Nombre ?? item.LoginCorreo).trim()[0]?.toUpperCase() ?? '?';
        return (
          <FilaRegistro
            titulo={completo ? `${item.Nombre} ${item.Apellido}` : 'Perfil sin nombre'}
            apoyo={item.Correo ?? item.LoginCorreo}
            ultima={index === clientes.length - 1}
            marca={!completo ? <Marca tono="espera">Datos incompletos</Marca> : undefined}
            adorno={
              <View style={s.inicialPlaca}>
                <Text style={[texto.titulo, s.inicial]}>{inicial}</Text>
              </View>
            }
          />
        );
      }}
      contentContainerStyle={s.lista}
    />
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.tabla },
  lista: { paddingBottom: espacio.xxxl },
  inicialPlaca: {
    width: 44,
    height: 44,
    backgroundColor: color.tinta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: { color: color.sobreTinta },
  hojaVacia: {
    backgroundColor: color.lamina,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: color.regla,
  },
});
