import fs from 'fs';

// Configuración de prefijos
global.prefix = /^[./!#]/;

// --- CONFIGURACIÓN DE UNSPLASH ---
const _ENCODED_U_KEY = "U0lMRVJ4RzZHZHJ3cGNkQlA2Vm8wQ2pfd1NqcEVUS2puaHN0SFp2UXpwYw==";
global.UNSPLASH_ACCESS_KEY = Buffer.from(_ENCODED_U_KEY, "base64").toString("utf-8");

// --- CONFIGURACIÓN DE GOOGLE CUSTOM SEARCH API ---
const _ENCODED_G_KEY = "QUl6YVN5QzNMZHNxVFptNDVuMmJVS2dldVdQMmRESEtZT0tZVTZ3"; 
const _ENCODED_G_CX = "YTUwYjE2Y2QxZmU0YjRhNDU="; 

global.GOOGLE_API_KEY = Buffer.from(_ENCODED_G_KEY, "base64").toString("utf-8");
global.GOOGLE_CX = Buffer.from(_ENCODED_G_CX, "base64").toString("utf-8");

// --- URL GIST EN BASE64 ---
global.urlGistB64 = "aHR0cHM6Ly9naXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbS9wcm9ncmFtYWRvcjAyNC84MjNiZjA4ZjM0OGZhNGY0ZWMzODc5NDYxMjNiMTE3Zi9yYXcvYXBwc19jb25figuanNvbg==";

// --- MARCAS DE AGUA ---
global.Marca_SicariOfc = {
  externalAdReply: {
    title: "🤖 CobraKai Bot V1",
    body: "Creado por SicarioOfc",
    mediaType: 1,
    renderLargerThumbnail: false,
    thumbnail: fs.readFileSync("./img/favicon/favicon.png"),
    sourceUrl: "https://www.youtube.com/@nms_sicario023",
  },
};

global.MarcaCanal_SicariOfc = {
  externalAdReply: {
    title: "🐍CobraKai - Bot Official🐍",
    body: "Unete a mi Canal",
    mediaType: 1,
    renderLargerThumbnail: false,
    thumbnail: fs.readFileSync("./img/favicon/favicon.png"),
    sourceUrl: "https://t.me/mds_inmunes2",
  },
};