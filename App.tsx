import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { initDb } from './src/db';
import Home from './src/vistas/Home';
import Login from './src/vistas/Login';
import Register from './src/vistas/Register';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function validateCredentials(email: string, password: string) {
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

  const handleLogin = async (email: string, password: string) => {
    const validationError = validateCredentials(email, password);

    if (validationError) {
      return validationError;
    }

    const user = await db.getFirstAsync<{ Contrasena: string }>(
      'SELECT Contrasena FROM LOGIN WHERE Correo = ?',
      email.trim().toLowerCase()
    );

    if (!user) {
      return 'No existe una cuenta con ese correo.';
    }

    return user.Contrasena === password.trim() ? null : 'La contraseña es incorrecta.';
  };

  const handleRegister = async (email: string, password: string) => {
    const validationError = validateCredentials(email, password);

    if (validationError) {
      return validationError;
    }

    try {
      await db.runAsync(
        'INSERT INTO LOGIN (Correo, Contrasena, Rol) VALUES (?, ?, ?)',
        email.trim().toLowerCase(),
        password.trim(),
        'usuario'
      );
    } catch {
      // UNIQUE(Correo) es la única restricción que puede fallar aquí
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
      <Navigation />
    </SQLiteProvider>
  );
}
