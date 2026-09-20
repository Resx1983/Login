import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CarritoProvider } from './src/context/CarritoContext';
import { initDb } from './src/db';
import Home from './src/vistas/Home';
import Login from './src/vistas/Login';
import Register from './src/vistas/Register';
import { LoginRow, Rol, RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function validateCredentials(email: string, password: string): string | null {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return 'Correo y contraseña son obligatorios.';
  }

  if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
    return 'Ingresa un correo válido.';
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

    if (!user) return 'No existe una cuenta con ese correo.';
    if (user.Contrasena !== password.trim()) return 'La contraseña es incorrecta.';

    if (user.Estado === 'Pendiente') {
      return 'Tu cuenta está pendiente de aprobación por un administrador.';
    }
    if (user.Estado !== 'Activo') {
      return 'Tu cuenta ha sido deshabilitada. Contacta al administrador.';
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
      return 'Este correo ya está registrado.';
    }

    return null;
  };

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
  return (
    <SQLiteProvider databaseName="tienda.db" onInit={initDb}>
      <AuthProvider>
        <CarritoProvider>
          <Navigation />
        </CarritoProvider>
      </AuthProvider>
    </SQLiteProvider>
  );
}
