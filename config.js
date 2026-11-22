// Apartado de configuración con fines educativos
import fs from "fs";

// Configuración de prefijos permitido
global.prefix = /^[./!#]/;

// Configuración De UNSPLASH
const _ENCODED_U_KEY =
  "U0lMRVJ4RzZHZHJ3cGNkQlA2Vm8wQ2pfd1NqcEVUa0puaHN0T1p2UXpwYw==";
global.UNSPLASH_ACCESS_KEY = Buffer.from(_ENCODED_U_KEY, "base64")
  .toString("utf-8")
  .trim();

// Configuración De GOOGLE CUSTOM SEARCH
const _ENCODED_G_KEY = "QUl6YVN5QzNMZHNxVlptNDVuMmJVS2dldVdQMmRISEtZT0tZVjZ3";
const _ENCODED_G_CX = "YTUwYjE2Y2QxZmU0YjRhNDU=";

global.GOOGLE_API_KEY = Buffer.from(_ENCODED_G_KEY, "base64")
  .toString("utf-8")
  .trim();
global.GOOGLE_CX = Buffer.from(_ENCODED_G_CX, "base64")
  .toString("utf-8")
  .trim();


// Configuración De SERPER (Búsqueda Web)
const _ENCODED_SERPER_KEY = "MWE5MWE1MTE4ZWEwZjVjNTY5MDgxMzdmNWE1MmNhYjgyNWRjYzg4OQ==";
global.SERPER_API_KEY = Buffer.from(_ENCODED_SERPER_KEY, "base64")
  .toString("utf-8")
  .trim();



// Configuración De URL GIST
global.urlGistB64 =
  "aHR0cHM6Ly9naXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbS9wcm9ncmFtYWRvcjAyNC84MjNiZjA4ZjM0OGZhNGY0ZWMzODc5NDYxMjNiMTE3Zi9yYXcvYXBwc19jb25maWcuanNvbg==";

let thumbBuffer;
try {
  if (fs.existsSync("./img/favicon/favicon.png")) {
    thumbBuffer = fs.readFileSync("./img/favicon/favicon.png");
  }
} catch {
  thumbBuffer = undefined;
}

// MARCAS DE AGUA
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