/**
 * Validaciones compartidas. Estaban copiadas en App.tsx, Register.tsx y
 * Perfil.tsx; tres copias del mismo regex es una forma segura de que una se
 * quede atrás.
 */

/**
 * Correo con formato plausible.
 *
 * El patrón anterior era `/\S+@\S+\.\S+/` y tenía dos defectos:
 *
 * 1. Retroceso catastrófico (ReDoS). `\S` incluye `@` y `.`, así que los tres
 *    `\S+` se solapan y el motor prueba un número explosivo de particiones
 *    ante una cadena larga que no casa. Aquí cada clase excluye el separador
 *    que la sigue, así que no hay ambigüedad y el recorrido es lineal.
 *
 * 2. No estaba anclado, así que `"hola a@b.co mundo"` pasaba: encontraba
 *    `a@b.co` dentro. Ahora la cadena entera tiene que ser el correo.
 *
 * No pretende cumplir el RFC —eso solo lo confirma un correo enviado—; separa
 * un error de tecleo de algo que puede ser una dirección.
 */
const CORREO = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function esCorreoValido(correo: string): boolean {
  return CORREO.test(correo.trim());
}
