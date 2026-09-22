/*
 * ─────────────────────────────────────────────────────────────────────────────
 * DIRECCIÓN — TABLERO DE PRECIOS                          seed 96d6e6da · #5/7
 *
 * THESIS: la cifra manda. El precio, el stock y el total son la tinta más
 *   grande de cada pantalla. Rechaza el panel oscuro con tarjetas redondeadas
 *   y acento azul que esta categoría siempre entrega, y su opuesto previsible,
 *   el tablero blanco de tarjetas grises con acento índigo.
 * OWN-WORLD: tabla imprimada (#F2F1EC), tinta esmalte (#15140F), reglas a un
 *   pelo, radio cero, cero sombras. Archivo en dos extremos: mayúsculas
 *   rotuladas de 11px y cifras negras de 32–46px. Un solo amarillo de
 *   rotulista (#FFD400) que marca una sola cosa por pantalla. Rojo y ocre
 *   existen únicamente para peligro y espera.
 * STORY: quien atiende entiende en un vistazo qué cuesta, cuánto queda y qué
 *   pasa si confirma; y confirma con el pulgar sin cambiar de postura.
 * FIRST VIEWPORT (Login): dos tercios de tabla vacía con una sola palabra
 *   rotulada a 46px; el formulario abajo, en la zona del pulgar; la acción
 *   primaria es una plantilla de tinta a todo el ancho.
 * FORM: rotulación de mercado, candidata 5 de 7 de mi lista ordenada.
 *
 * ALZAS (de los retadores vencidos):
 *   · consola oscura → costuras a un pelo en vez de elevación; las acciones
 *     irreversibles se aíslan con espacio vacío deliberado.
 *   · six-pack de vuelo nocturno → rojo y ámbar solo para peligro y aviso.
 *   · riel de líneas de emisión → ningún estado depende solo del color.
 *   · cajas de zapatillas → una sola retícula de rótulo para todo registro.
 *   · columna de tensegridad → ninguna cifra sola: el stock muestra qué queda
 *     si confirmas.
 *   · feed vertical → una acción primaria por pantalla, misma posición.
 *
 * RIESGO HONESTO: casi monocromo. Todo depende del salto de escala entre la
 *   mayúscula rotulada y la cifra negra; si ese salto se suaviza, esto es solo
 *   una app gris.
 *
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the
 *   finish review, the verdict, DESIGN.md, and every shipping raster carrying
 *   its provenance.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_900Black,
  useFonts,
} from '@expo-google-fonts/archivo';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CarritoProvider } from './src/context/CarritoContext';
import { initDb } from './src/db';
import { LoginRow, Rol, RootStackParamList } from './src/types';
import { color } from './src/ui/tema';
import { esCorreoValido } from './src/validacion';
import Home from './src/vistas/Home';
import Login from './src/vistas/Login';
import Register from './src/vistas/Register';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

/** La tabla imprimada también es el fondo de las transiciones del stack. */
const temaNavegacion = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: color.tabla, card: color.lamina, border: color.regla, text: color.tinta },
};

function validateCredentials(email: string, password: string): string | null {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return 'Escribe tu correo y tu contraseña para entrar.';
  }

  if (!esCorreoValido(trimmedEmail)) {
    return 'Ese correo no tiene un formato válido. Revisa que incluya @ y un dominio.';
  }

  return null;
}

function Navigation() {
  const db = useSQLiteContext();
  const { setUsuario } = useAuth();

  // ── Login: verifica credenciales, Estado y Rol ──────────────────────────
  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    const validationError = validateCredentials(email, password);
    if (validationError) return validationError;

    const user = await db.getFirstAsync<LoginRow>(
      'SELECT Id, Correo, Contrasena, Rol, Estado FROM LOGIN WHERE Correo = ?',
      email.trim().toLowerCase(),
    );

    if (!user) return 'No existe una cuenta con ese correo. Solicita acceso para crearla.';
    if (user.Contrasena !== password.trim()) return 'La contraseña no coincide. Inténtalo de nuevo.';

    if (user.Estado === 'Pendiente') {
      return 'Tu cuenta sigue en espera. Un administrador debe activarla antes de que puedas entrar.';
    }
    if (user.Estado !== 'Activo') {
      return 'Tu cuenta está deshabilitada. Pide a un administrador que la reactive.';
    }

    // Normalizar rol a tipo Rol
    const rol: Rol = user.Rol === 'admin' ? 'admin' : 'cliente';

    // Guardar sesión en contexto global
    setUsuario({ id: user.Id, email: user.Correo, rol });

    return null;
  };

  // ── Registro: inserta con Estado='Pendiente' ────────────────────────────
  const handleRegister = async (email: string, password: string): Promise<string | null> => {
    const validationError = validateCredentials(email, password);
    if (validationError) return validationError;

    try {
      await db.runAsync(
        "INSERT INTO LOGIN (Correo, Contrasena, Rol, Estado) VALUES (?, ?, 'cliente', 'Pendiente')",
        email.trim().toLowerCase(),
        password.trim(),
      );
    } catch {
      return 'Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.';
    }

    return null;
  };

  return (
    <NavigationContainer theme={temaNavegacion}>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.tabla },
        }}
      >
        <Stack.Screen name="Login">
          {(props) => <Login {...props} onLogin={handleLogin} />}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {(props) => <Register {...props} onRegister={handleRegister} />}
        </Stack.Screen>
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fuentesListas, errorFuentes] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_900Black,
  });

  useEffect(() => {
    if (fuentesListas || errorFuentes) SplashScreen.hideAsync();
  }, [fuentesListas, errorFuentes]);

  // Sin tipografía no hay tablero: se mantiene el splash hasta que carga.
  // Si la carga falla, se sigue igual — el sistema cae a la fuente del sistema.
  if (!fuentesListas && !errorFuentes) return null;

  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="tienda.db" onInit={initDb}>
        <AuthProvider>
          <CarritoProvider>
            <Navigation />
          </CarritoProvider>
        </AuthProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
