export type Rol = 'admin' | 'cliente';

export type UsuarioSesion = {
  id: number;
  email: string;
  rol: Rol;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { usuario: UsuarioSesion };
};

// ── Tipos de dominio ──────────────────────────────────────────────────────────

export type LoginRow = {
  Id: number;
  Correo: string;
  Contrasena: string;
  Rol: string;
  Estado: string;
};

export type ClienteRow = {
  Id: number;
  IdLogin: number | null;
  Nombre: string | null;
  Apellido: string | null;
  Correo: string | null;
};

export type ProductoRow = {
  Id: number;
  Nombre: string;
  Descripcion: string | null;
  ValorUnitario: number;
  Stock: number;
};

export type EncabezadoRow = {
  Id: number;
  IdCliente: number;
  Fecha: string;
  Total: number;
};

export type DetalleRow = {
  Id: number;
  IdEncabezado: number;
  IdProducto: number;
  Cantidad: number;
  Subtotal: number;
};