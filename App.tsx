import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import Home from './src/vistas/Home';
import Login from './src/vistas/Login';
import Register from './src/vistas/Register';
import { RootStackParamList, User } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [users, setUsers] = useState<User[]>([
    { email: 'demo@correo.com', password: '123456' },
  ]);

  const validateCredentials = (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return 'Correo y contraseña son obligatorios.';
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      return 'Ingresa un correo válido.';
    }

    return null;
  };

  const handleLogin = (email: string, password: string) => {
    const validationError = validateCredentials(email, password);

    if (validationError) {
      return validationError;
    }

    const user = users.find((item) => item.email === email.trim().toLowerCase());

    if (!user) {
      return 'No existe una cuenta con ese correo.';
    }

    return user.password === password.trim() ? null : 'La contraseña es incorrecta.';
  };

  const handleRegister = (email: string, password: string) => {
    const validationError = validateCredentials(email, password);

    if (validationError) {
      return validationError;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const alreadyExists = users.some((user) => user.email === normalizedEmail);

    if (alreadyExists) {
      return 'Este correo ya está registrado.';
    }

    setUsers((currentUsers) => [
      ...currentUsers,
      { email: normalizedEmail, password: password.trim() },
    ]);

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