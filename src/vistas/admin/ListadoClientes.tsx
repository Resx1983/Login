import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useRecargarAlEnfocar } from '../../hooks/useRecargarAlEnfocar';
import { Cabecera, Cargando, FilaRegistro, Marca, Vacio, refresco } from '../../ui/componentes';
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
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    const rows = await db.getAllAsync<ClienteConCorreo>(`
      SELECT c.Id, c.Nombre, c.Apellido, c.Correo, l.Correo AS LoginCorreo
        FROM CLIENTES c
        JOIN LOGIN l ON l.Id = c.IdLogin
       ORDER BY c.Apellido, c.Nombre
    `);
    setClientes(rows);
    setCargando(false);
    setRefrescando(false);
  }, [db]);

  useRecargarAlEnfocar(cargar);

  if (cargando) return <Cargando />;

  return (
    <FlatList
      style={s.pantalla}
      data={clientes}
      keyExtractor={(item) => String(item.Id)}
      refreshControl={refresco(refrescando, () => { setRefrescando(true); cargar(); })}
      ListHeaderComponent={
        <Cabecera
          rotulo="Clientes"
          titulo={String(clientes.length).padStart(2, '0')}
          apoyo="Solo aparecen las cuentas que ya completaron su perfil."
        />
      }
      ListEmptyComponent={
        <Vacio
          icono="users"
          titulo="Ningún perfil completo"
          cuerpo="Un cliente aparece aquí en cuanto guarda su nombre y apellido desde la pestaña Perfil."
        />
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
              <View style={s.inicial}>
                <Text style={[texto.titulo, s.inicialTexto]}>{inicial}</Text>
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
  inicial: {
    width: 44,
    height: 44,
    backgroundColor: color.tinta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicialTexto: { color: color.sobreTinta },
});
