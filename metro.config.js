const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite en web corre SQLite compilado a WebAssembly.
config.resolver.assetExts.push('wasm');

// ...y ese WASM necesita SharedArrayBuffer, que el navegador solo concede a un
// origen «cross-origin isolated». Sin estas dos cabeceras el navegador niega
// SharedArrayBuffer y expo-sqlite cae al VFS de OPFS con handles exclusivos,
// que es el que revienta con NoModificationAllowedError en cuanto algo más
// tiene abierto el mismo archivo.
// Solo se aplican a web: Expo Go pide el bundle con la cabecera `expo-platform`
// y no necesita nada de esto. Así el camino nativo queda intacto.
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  const plataforma = req.headers?.['expo-platform'];
  if (plataforma !== 'android' && plataforma !== 'ios') {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  }
  return middleware(req, res, next);
};

module.exports = config;
