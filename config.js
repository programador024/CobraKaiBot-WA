import fs from "fs";

const ENV_TEMPLATE = `# =========================================================
# CONFIGURACIÓN DE APIS - COBRAKAI BOT V1
# Agrega aquí tus API Keys para activar los motores VIP.
# Si dejas una clave vacía, el bot usará respaldos gratuitos.
#
# REGLAS PARA ESCRIBIR LAS CLAVES:
# - Escribe el valor directo después del "=" (SIN punto y coma ";").
# - NO uses comillas en las API Keys (ejemplo: SERPER_API_KEY=abc123xyz).
# - Un parámetro por línea.
# =========================================================

# --- MOTOR VIP DE BÚSQUEDA WEB (/search) ---
# Ejemplo: SERPER_API_KEY=9a8b7c6d5e4f3g2h1i0j
SERPER_API_KEY=

# --- MOTORES VIP DE BÚSQUEDA DE IMÁGENES (/img) ---
# Ejemplo: UNSPLASH_ACCESS_KEY=mi_access_key_de_unsplash
UNSPLASH_ACCESS_KEY=
GOOGLE_API_KEY=
GOOGLE_CX=
PEXELS_API_KEY=
PIXABAY_API_KEY=
`;

function limpiarValorEnv(valor = "") {
  let limpio = valor.trim();
  if (
    (limpio.startsWith('"') && limpio.endsWith('"')) ||
    (limpio.startsWith("'") && limpio.endsWith("'"))
  ) {
    limpio = limpio.slice(1, -1).trim();
  }
  return limpio;
}

try {
  if (!fs.existsSync(".env")) {
    fs.writeFileSync(".env", ENV_TEMPLATE, "utf-8");
    console.log(
      "\x1b[33m[CONFIG] Archivo .env creado automáticamente. Agrega tus API keys si deseas activar funciones VIP.\x1b[0m"
    );
  }

  if (fs.existsSync(".env")) {
    if (typeof process.loadEnvFile === "function") {
      process.loadEnvFile(".env");
    } else {
      const lines = fs.readFileSync(".env", "utf-8").split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const [key, ...rest] = trimmed.split("=");
        process.env[key.trim()] = limpiarValorEnv(rest.join("="));
      }
    }
  }
} catch (err) {
  console.error("[CONFIG] Error preparando .env:", err.message);
}

// Apartado de configuración con fines educativos
global.prefix = /^[./!#]/;

// Claves VIP leídas desde variables de entorno
global.UNSPLASH_ACCESS_KEY = limpiarValorEnv(process.env.UNSPLASH_ACCESS_KEY || "");
global.GOOGLE_API_KEY = limpiarValorEnv(process.env.GOOGLE_API_KEY || "");
global.GOOGLE_CX = limpiarValorEnv(process.env.GOOGLE_CX || "");
global.SERPER_API_KEY = limpiarValorEnv(process.env.SERPER_API_KEY || "");

// Respaldos opcionales de imágenes vía Pexels o Pixabay
global.PEXELS_API_KEY = limpiarValorEnv(process.env.PEXELS_API_KEY || "");
global.PIXABAY_API_KEY = limpiarValorEnv(process.env.PIXABAY_API_KEY || "");

// URL de Gist
global.urlGistB64 = limpiarValorEnv(
  process.env.URL_GIST_B64 ||
    "aHR0cHM6Ly9naXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbS9wcm9ncmFtYWRvcjAyNC84MjNiZjA4ZjM0OGZhNGY0ZWMzODc5NDYxMjNiMTE3Zi9yYXcvYXBwc19jb25maWcuanNvbg=="
);

let thumbBuffer;
try {
  if (fs.existsSync("./img/favicon/favicon.png")) {
    thumbBuffer = fs.readFileSync("./img/favicon/favicon.png");
  }
} catch {
  thumbBuffer = undefined;
}

global.Marca_SikaOfc = {
  externalAdReply: {
    title: "🤖 CobraKai Bot V1",
    body: "Creado por SikaOfc",
    mediaType: 1,
    renderLargerThumbnail: false,
    ...(thumbBuffer ? { thumbnail: thumbBuffer } : {}),
    sourceUrl: "https://www.youtube.com/@prog_sikaofc",
  },
};

global.MarcaCanal_SikaOfc = {
  externalAdReply: {
    title: "🐍CobraKai - Bot Official🐍",
    body: "Unete a mi Canal",
    mediaType: 1,
    renderLargerThumbnail: false,
    ...(thumbBuffer ? { thumbnail: thumbBuffer } : {}),
    sourceUrl: "https://t.me/md_sikadojo",
  },
};