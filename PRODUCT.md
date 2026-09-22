# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Dos roles en un mismo negocio pequeño, ambos en teléfono:

- **Administrador** — atiende el mostrador y también gestiona. Aprueba las cuentas que solicitan acceso, asigna su rol, mantiene el inventario (alta, edición, precio y stock) y consulta el listado de clientes. Trabaja de pie, con una mano, entre atenciones.
- **Cliente** — completa sus datos personales, revisa los productos con stock disponible y arma un pedido que se registra contra el inventario real.

## Product Purpose

Registrar ventas contra un inventario que se descuenta en el mismo acto. La compra se confirma en una transacción atómica: verifica stock vigente, crea el encabezado, inserta los detalles y descuenta existencias, o no ocurre nada. El éxito es una venta registrada sin que el stock quede mintiendo.

## Positioning

Prototipo de punto de venta que funciona entero en el teléfono, sin servidor: la base de datos SQLite vive en el dispositivo. No hay sincronización, no hay latencia, no hay "sin conexión". El acceso se controla con aprobación manual: nadie entra hasta que un administrador activa la cuenta y le asigna rol.

## Operating Context

- Uso en mostrador: sesiones cortas, de pie, a una mano, con luz ambiente variable.
- Alta de cuenta con espera: se solicita acceso, queda `Pendiente`, un administrador la activa como `cliente` o `admin`.
- Un cliente no puede comprar sin perfil completo (nombre y apellido); la app lo bloquea y lo dirige a completarlo.
- El carrito vive solo en memoria de la sesión; cerrar la app lo vacía.

## Capabilities and Constraints

- **Stack:** Expo SDK 57, React Native 0.86, TypeScript, React Navigation (native-stack + bottom-tabs), `expo-sqlite` con `SQLiteProvider`.
- **Datos:** tablas `LOGIN`, `CLIENTES`, `PRODUCTOS`, `ENCABEZADO`, `DETALLES` con claves foráneas activas y migraciones incrementales idempotentes en `src/db.ts`.
- **Estados de cuenta:** `Pendiente` / `Activo`. Roles: `admin` / `cliente`.
- **Moneda:** sin decidir. La app muestra hoy `$` con agrupación `es-CO` y dos decimales como **marcador**, centralizado en `dinero()` (`src/ui/tema.ts`); hay que confirmarlo con el negocio antes de usarlo con dinero real.
- **Sin decidir:** nombre comercial del negocio que use la app, edición de stock por venta manual del admin, y si el administrador debe poder consultar los pedidos de todos los clientes (hoy cada cliente ve solo los suyos).
- **Deuda conocida y no inventada como resuelta:** las contraseñas se guardan en texto plano. Es un prototipo; debe resolverse antes de cualquier uso con datos reales.

## Brand Commitments

- **Nombre: Tablero.** Elegido por el usuario. Viene del mundo visual de la app —el tablero de precios de un puesto de mercado— y describe lo que la app hace. `expo.name` es `Tablero`, `expo.slug` es `tablero`.
- **Marca: la T de rotulista**, letra pesada y plana en el amarillo de selección `#FFD400` sobre la tinta esmalte `#15140F`. Sin degradado, sin esquina redondeada, sin sombra: la misma gramática que la interfaz.
- Todos los PNG de `assets/` los genera `scripts/generar-iconos.mjs`, que lee la paleta de `src/ui/tema.ts`. No hay imágenes traídas de fuera ni editadas a mano; cambiar el logo es cambiar ese script y volver a ejecutarlo.
- La pantalla de acceso rotula el nombre a tamaño de tablero. No hay más elementos de identidad comprometidos.

## Evidence on Hand

- Cuenta administradora de prueba sembrada en la base: `demo@correo.com` / `Admin123`, estado `Activo`.
- Catálogo de **demostración** de 10 productos de tienda, sembrado en `SEED_PRODUCTOS` (`src/db.ts`) solo cuando la tabla `PRODUCTOS` está vacía. Son datos inventados, no el inventario de ningún negocio: incluyen a propósito un agotado y uno con stock bajo para ejercitar los estados de la interfaz. Hay que borrarlos y cargar el catálogo real desde Inventario antes de cualquier uso verdadero.
- No hay clientes reales ni fotografías de producto. Ningún otro dato de demostración debe presentarse como verdadero.

## Product Principles

1. **El stock no miente.** Toda pantalla que muestre disponibilidad muestra el número vigente, y la compra lo verifica otra vez antes de escribir.
2. **El estado de la cuenta es visible, nunca un misterio.** Pendiente, activo o rechazado se dice con palabras, no con un error genérico.
3. **Una mano, de pie, rápido.** Las acciones frecuentes se alcanzan con el pulgar; nada crítico vive en una esquina superior.
4. **Cada rol ve solo su trabajo.** El administrador no navega entre pantallas de cliente para hacer su tarea, ni al revés.
5. **Sin conexión no es un modo degradado.** Es el único modo, y la app nunca sugiere lo contrario.

## Accessibility & Inclusion

Interfaz en español. Uso a una mano en mostrador con luz variable: el contraste de texto debe sostenerse a plena luz, los objetivos táctiles cumplir el mínimo de la plataforma (44pt iOS / 48dp Android) y ningún estado depender solo del color.
