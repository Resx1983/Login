import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { ClienteRow } from '../../types';

type FormPerfil = {
  nombre: string;
  apellido: string;
  correo: string;
};

export default function Perfil() {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const [cliente, setCliente] = useState<ClienteRow | null>(null);
  const [form, setForm] = useState<FormPerfil>({ nombre: '', apellido: '', correo: '' });
  const [errores, setErrores] = useState<Partial<FormPerfil>>({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null);

  const cargarPerfil = useCallback(async () => {
    if (!usuario) return;
    const row = await db.getFirstAsync<ClienteRow>(
      'SELECT * FROM CLIENTES WHERE IdLogin = ?',
      usuario.id,
    );
    setCliente(row ?? null);
    if (row) {
      setForm({
        nombre: row.Nombre ?? '',
        apellido: row.Apellido ?? '',
        correo: row.Correo ?? '',
      });
    } else {
      // Pre-rellenar correo desde sesión
      setForm({ nombre: '', apellido: '', correo: usuario.email });
    }
    setLoading(false);
  }, [db, usuario]);

  useEffect(() => { cargarPerfil(); }, [cargarPerfil]);

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  const validar = (): boolean => {
    const e: Partial<FormPerfil> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio.';
    if (!form.correo.trim() || !/\S+@\S+\.\S+/.test(form.correo.trim())) {
      e.correo = 'Ingresa un correo válido.';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar() || !usuario) return;
    setGuardando(true);
    try {
      if (cliente) {
        // Actualizar
        await db.runAsync(
          'UPDATE CLIENTES SET Nombre=?, Apellido=?, Correo=? WHERE Id=?',
          form.nombre.trim(),
          form.apellido.trim(),
          form.correo.trim().toLowerCase(),
          cliente.Id,
        );
      } else {
        // Crear nuevo registro de cliente
        await db.runAsync(
          'INSERT INTO CLIENTES (IdLogin, Nombre, Apellido, Correo) VALUES (?,?,?,?)',
          usuario.id,
          form.nombre.trim(),
          form.apellido.trim(),
          form.correo.trim().toLowerCase(),
        );
      }
      mostrarMensaje('✅ Perfil guardado correctamente', 'ok');
      await cargarPerfil();
    } catch {
      mostrarMensaje('❌ Error al guardar el perfil', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Aviso si perfil incompleto */}
        {!cliente && (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Perfil incompleto</Text>
            <Text style={styles.warningText}>
              Completa tus datos personales para poder realizar compras.
            </Text>
          </View>
        )}

        {/* Flash */}
        {mensaje && (
          <View style={[styles.flash, mensaje.tipo === 'ok' ? styles.flashOk : styles.flashError]}>
            <Text style={styles.flashText}>{mensaje.texto}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {cliente ? '👤 Mi perfil' : '📝 Completa tu perfil'}
          </Text>

          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={[styles.input, errores.nombre && styles.inputError]}
            placeholder="Tu nombre"
            placeholderTextColor="#9aa0a6"
            value={form.nombre}
            onChangeText={(v) => { setForm((f) => ({ ...f, nombre: v })); setErrores((e) => ({ ...e, nombre: undefined })); }}
          />
          {errores.nombre && <Text style={styles.fieldError}>{errores.nombre}</Text>}

          <Text style={styles.label}>Apellido *</Text>
          <TextInput
            style={[styles.input, errores.apellido && styles.inputError]}
            placeholder="Tu apellido"
            placeholderTextColor="#9aa0a6"
            value={form.apellido}
            onChangeText={(v) => { setForm((f) => ({ ...f, apellido: v })); setErrores((e) => ({ ...e, apellido: undefined })); }}
          />
          {errores.apellido && <Text style={styles.fieldError}>{errores.apellido}</Text>}

          <Text style={styles.label}>Correo *</Text>
          <TextInput
            style={[styles.input, errores.correo && styles.inputError]}
            placeholder="tu@correo.com"
            placeholderTextColor="#9aa0a6"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.correo}
            onChangeText={(v) => { setForm((f) => ({ ...f, correo: v })); setErrores((e) => ({ ...e, correo: undefined })); }}
          />
          {errores.correo && <Text style={styles.fieldError}>{errores.correo}</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, guardando && styles.btnDisabled]}
            onPress={guardar}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>
                  {cliente ? 'Guardar cambios' : 'Crear perfil'}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  warningBox: {
    backgroundColor: '#431407',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
  },
  warningTitle: { color: '#fdba74', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  warningText: { color: '#fed7aa', fontSize: 14, lineHeight: 20 },
  flash: { padding: 12, borderRadius: 10, marginBottom: 12 },
  flashOk: { backgroundColor: '#14532d' },
  flashError: { backgroundColor: '#450a0a' },
  flashText: { color: '#f8fafc', fontWeight: '600', textAlign: 'center' },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
    color: '#f8fafc',
    fontSize: 16,
  },
  inputError: { borderColor: '#ef4444' },
  fieldError: { color: '#fca5a5', fontSize: 13, marginBottom: 12 },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  btnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
