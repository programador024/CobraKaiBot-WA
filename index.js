import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import pino from "pino";
import Database from "better-sqlite3";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import ct from "countries-and-timezones";
import readline from "readline";

// IMPORTACIÓN PARA YT-DLP-EXEC
import ytdlpModule from "yt-dlp-exec";
const { exec: ytdlpExec } = ytdlpModule;

import yts from "yt-search";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { createCanvas } from "@napi-rs/canvas";

// guardar warns
const WARN_FILE = "./warns.json";
// Registro de tiempo de actividad del bot
const startTimeBot = Date.now();

// --- CONFIGURACIÓN DE UNSPLASH ---
const UNSPLASH_ACCESS_KEY = "SILERxG6GdrwpcdBP6Vo0Cj_wSjpETkJnhstOZvQzpc";

//Agregar marcas de agua
const Marca_SicariOfc = {
  externalAdReply: {
    title: "🤖 CobraKai Bot V1",
    body: "Creado por SicarioOfc",
    mediaType: 1,
    renderLargerThumbnail: false,
    thumbnail: fs.readFileSync("./img/favicon/favicon.png"),
    sourceUrl: "https://t.me/mds_inmunes2",
  },
};

const MarcaCanal_SicariOfc = {
  externalAdReply: {
    title: "🐍CobraKai - Bot Official🐍",
    body: "Unete a mi Canal",
    mediaType: 1,
    renderLargerThumbnail: false,
    thumbnail: fs.readFileSync("./img/favicon/favicon.png"),
    sourceUrl: "https://t.me/mds_inmunes2",
  },
};

// --- CONFIGURACIÓN DE GOOGLE CUSTOM SEARCH API ---
const GOOGLE_API_KEY = "AIzaSyC3LdsqVZm45n2bUKgeuWP2dHHKYOKYV6w";
const GOOGLE_CX = "a50b16cd1fe4b4a45";

// Conectar a la base de datos SQLite
const db = new Database("database.sqlite");

// Crear tabla de registro usuarios
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    jid TEXT PRIMARY KEY,
    numero TEXT,
    nombre_completo TEXT,
    pais TEXT,
    rol TEXT DEFAULT 'Usuario',
    fecha_nacimiento TEXT,
    foto TEXT,
    fecha_registro TEXT
  )
`);
// Crear tabla para bienvenida/despedida por grupo
db.exec(`
  CREATE TABLE IF NOT EXISTS grupos_config (
    jid TEXT PRIMARY KEY,
    bienvenida INTEGER DEFAULT 0,
    despedida INTEGER DEFAULT 0
  )
`);

try {
  db.exec("ALTER TABLE usuarios ADD COLUMN fecha_nacimiento TEXT");
} catch (e) {
  // Ignorar si la columna ya existe
}

// --- MAPEO DE PREFIJOS TELEFÓNICOS INTERNACIONALES ---
// Ordenado por longitud de prefijo descendente para priorizar prefijos específicos
const COUNTRY_PREFIX_MAP = [
  // --- Prefijos de 3 dígitos ---
  { prefix: "211", country: "SS", timeZone: "Africa/Juba" },
  { prefix: "212", country: "MA", timeZone: "Africa/Casablanca" },
  { prefix: "213", country: "DZ", timeZone: "Africa/Algiers" },
  { prefix: "216", country: "TN", timeZone: "Africa/Tunis" },
  { prefix: "218", country: "LY", timeZone: "Africa/Tripoli" },
  { prefix: "220", country: "GM", timeZone: "Africa/Banjul" },
  { prefix: "221", country: "SN", timeZone: "Africa/Dakar" },
  { prefix: "222", country: "MR", timeZone: "Africa/Nouakchott" },
  { prefix: "223", country: "ML", timeZone: "Africa/Bamako" },
  { prefix: "224", country: "GN", timeZone: "Africa/Conakry" },
  { prefix: "225", country: "CI", timeZone: "Africa/Abidjan" },
  { prefix: "226", country: "BF", timeZone: "Africa/Ouagadougou" },
  { prefix: "227", country: "NE", timeZone: "Africa/Niamey" },
  { prefix: "228", country: "TG", timeZone: "Africa/Lome" },
  { prefix: "229", country: "BJ", timeZone: "Africa/Porto-Novo" },
  { prefix: "230", country: "MU", timeZone: "Indian/Mauritius" },
  { prefix: "231", country: "LR", timeZone: "Africa/Monrovia" },
  { prefix: "232", country: "SL", timeZone: "Africa/Freetown" },
  { prefix: "233", country: "GH", timeZone: "Africa/Accra" },
  { prefix: "234", country: "NG", timeZone: "Africa/Lagos" },
  { prefix: "235", country: "TD", timeZone: "Africa/Ndjamena" },
  { prefix: "236", country: "CF", timeZone: "Africa/Bangui" },
  { prefix: "237", country: "CM", timeZone: "Africa/Douala" },
  { prefix: "238", country: "CV", timeZone: "Atlantic/Cape_Verde" },
  { prefix: "239", country: "ST", timeZone: "Africa/Sao_Tome" },
  { prefix: "240", country: "GQ", timeZone: "Africa/Malabo" },
  { prefix: "241", country: "GA", timeZone: "Africa/Libreville" },
  { prefix: "242", country: "CG", timeZone: "Africa/Brazzaville" },
  { prefix: "243", country: "CD", timeZone: "Africa/Kinshasa" },
  { prefix: "244", country: "AO", timeZone: "Africa/Luanda" },
  { prefix: "245", country: "GW", timeZone: "Africa/Bissau" },
  { prefix: "246", country: "IO", timeZone: "Indian/Chagos" },
  { prefix: "248", country: "SC", timeZone: "Indian/Mahe" },
  { prefix: "249", country: "SD", timeZone: "Africa/Khartoum" },
  { prefix: "250", country: "RW", timeZone: "Africa/Kigali" },
  { prefix: "251", country: "ET", timeZone: "Africa/Addis_Ababa" },
  { prefix: "252", country: "SO", timeZone: "Africa/Mogadishu" },
  { prefix: "253", country: "DJ", timeZone: "Africa/Djibouti" },
  { prefix: "254", country: "KE", timeZone: "Africa/Nairobi" },
  { prefix: "255", country: "TZ", timeZone: "Africa/Dar_es_Salaam" },
  { prefix: "256", country: "UG", timeZone: "Africa/Kampala" },
  { prefix: "257", country: "BI", timeZone: "Africa/Bujumbura" },
  { prefix: "258", country: "MZ", timeZone: "Africa/Maputo" },
  { prefix: "260", country: "ZM", timeZone: "Africa/Lusaka" },
  { prefix: "261", country: "MG", timeZone: "Indian/Antananarivo" },
  { prefix: "262", country: "RE", timeZone: "Indian/Reunion" },
  { prefix: "263", country: "ZW", timeZone: "Africa/Harare" },
  { prefix: "264", country: "NA", timeZone: "Africa/Windhoek" },
  { prefix: "265", country: "MW", timeZone: "Africa/Blantyre" },
  { prefix: "266", country: "LS", timeZone: "Africa/Maseru" },
  { prefix: "267", country: "BW", timeZone: "Africa/Gaborone" },
  { prefix: "268", country: "SZ", timeZone: "Africa/Mbabane" },
  { prefix: "269", country: "KM", timeZone: "Indian/Comoro" },
  { prefix: "290", country: "SH", timeZone: "Atlantic/St_Helena" },
  { prefix: "291", country: "ER", timeZone: "Africa/Asmara" },
  { prefix: "297", country: "AW", timeZone: "America/Aruba" },
  { prefix: "298", country: "FO", timeZone: "Atlantic/Faroe" },
  { prefix: "299", country: "GL", timeZone: "America/Nuuk" },
  { prefix: "350", country: "GI", timeZone: "Europe/Gibraltar" },
  { prefix: "351", country: "PT", timeZone: "Europe/Lisbon" },
  { prefix: "352", country: "LU", timeZone: "Europe/Luxembourg" },
  { prefix: "353", country: "IE", timeZone: "Europe/Dublin" },
  { prefix: "354", country: "IS", timeZone: "Atlantic/Reykjavik" },
  { prefix: "355", country: "AL", timeZone: "Europe/Tirane" },
  { prefix: "356", country: "MT", timeZone: "Europe/Malta" },
  { prefix: "357", country: "CY", timeZone: "Asia/Nicosia" },
  { prefix: "358", country: "FI", timeZone: "Europe/Helsinki" },
  { prefix: "359", country: "BG", timeZone: "Europe/Sofia" },
  { prefix: "370", country: "LT", timeZone: "Europe/Vilnius" },
  { prefix: "371", country: "LV", timeZone: "Europe/Riga" },
  { prefix: "372", country: "EE", timeZone: "Europe/Tallinn" },
  { prefix: "373", country: "MD", timeZone: "Europe/Chisinau" },
  { prefix: "374", country: "AM", timeZone: "Asia/Yerevan" },
  { prefix: "375", country: "BY", timeZone: "Europe/Minsk" },
  { prefix: "376", country: "AD", timeZone: "Europe/Andorra" },
  { prefix: "377", country: "MC", timeZone: "Europe/Monaco" },
  { prefix: "378", country: "SM", timeZone: "Europe/San_Marino" },
  { prefix: "380", country: "UA", timeZone: "Europe/Kyiv" },
  { prefix: "381", country: "RS", timeZone: "Europe/Belgrade" },
  { prefix: "382", country: "ME", timeZone: "Europe/Podgorica" },
  { prefix: "383", country: "XK", timeZone: "Europe/Belgrade" },
  { prefix: "385", country: "HR", timeZone: "Europe/Zagreb" },
  { prefix: "386", country: "SI", timeZone: "Europe/Ljubljana" },
  { prefix: "387", country: "BA", timeZone: "Europe/Sarajevo" },
  { prefix: "389", country: "MK", timeZone: "Europe/Skopje" },
  { prefix: "420", country: "CZ", timeZone: "Europe/Prague" },
  { prefix: "421", country: "SK", timeZone: "Europe/Bratislava" },
  { prefix: "423", country: "LI", timeZone: "Europe/Vaduz" },
  { prefix: "500", country: "FK", timeZone: "Atlantic/Stanley" },
  { prefix: "501", country: "BZ", timeZone: "America/Belize" },
  { prefix: "502", country: "GT", timeZone: "America/Guatemala" },
  { prefix: "503", country: "SV", timeZone: "America/El_Salvador" },
  { prefix: "504", country: "HN", timeZone: "America/Tegucigalpa" },
  { prefix: "505", country: "NI", timeZone: "America/Managua" },
  { prefix: "506", country: "CR", timeZone: "America/Costa_Rica" },
  { prefix: "507", country: "PA", timeZone: "America/Panama" },
  { prefix: "508", country: "PM", timeZone: "America/Miquelon" },
  { prefix: "509", country: "HT", timeZone: "America/Port-au-Prince" },
  { prefix: "590", country: "GP", timeZone: "America/Guadeloupe" },
  { prefix: "591", country: "BO", timeZone: "America/La_Paz" },
  { prefix: "592", country: "GY", timeZone: "America/Guyana" },
  { prefix: "593", country: "EC", timeZone: "America/Guayaquil" },
  { prefix: "594", country: "GF", timeZone: "America/Cayenne" },
  { prefix: "595", country: "PY", timeZone: "America/Asuncion" },
  { prefix: "596", country: "MQ", timeZone: "America/Martinique" },
  { prefix: "597", country: "SR", timeZone: "America/Paramaribo" },
  { prefix: "598", country: "UY", timeZone: "America/Montevideo" },
  { prefix: "599", country: "CW", timeZone: "America/Curacao" },
  { prefix: "670", country: "TL", timeZone: "Asia/Dili" },
  { prefix: "672", country: "NF", timeZone: "Pacific/Norfolk" },
  { prefix: "673", country: "BN", timeZone: "Asia/Brunei" },
  { prefix: "674", country: "NR", timeZone: "Pacific/Nauru" },
  { prefix: "675", country: "PG", timeZone: "Pacific/Port_Moresby" },
  { prefix: "676", country: "TO", timeZone: "Pacific/Tongatapu" },
  { prefix: "677", country: "SB", timeZone: "Pacific/Guadalcanal" },
  { prefix: "678", country: "VU", timeZone: "Pacific/Efate" },
  { prefix: "679", country: "FJ", timeZone: "Pacific/Fiji" },
  { prefix: "680", country: "PW", timeZone: "Pacific/Palau" },
  { prefix: "681", country: "WF", timeZone: "Pacific/Wallis" },
  { prefix: "682", country: "CK", timeZone: "Pacific/Rarotonga" },
  { prefix: "683", country: "NU", timeZone: "Pacific/Niue" },
  { prefix: "685", country: "WS", timeZone: "Pacific/Apia" },
  { prefix: "686", country: "KI", timeZone: "Pacific/Tarawa" },
  { prefix: "687", country: "NC", timeZone: "Pacific/Noumea" },
  { prefix: "688", country: "TV", timeZone: "Pacific/Funafuti" },
  { prefix: "689", country: "PF", timeZone: "Pacific/Tahiti" },
  { prefix: "690", country: "TK", timeZone: "Fakaofo" },
  { prefix: "691", country: "FM", timeZone: "Pacific/Chuuk" },
  { prefix: "692", country: "MH", timeZone: "Pacific/Majuro" },
  { prefix: "850", country: "KP", timeZone: "Asia/Pyongyang" },
  { prefix: "852", country: "HK", timeZone: "Asia/Hong_Kong" },
  { prefix: "853", country: "MO", timeZone: "Asia/Macau" },
  { prefix: "855", country: "KH", timeZone: "Asia/Phnom_Penh" },
  { prefix: "856", country: "LA", timeZone: "Asia/Vientiane" },
  { prefix: "880", country: "BD", timeZone: "Asia/Dhaka" },
  { prefix: "886", country: "TW", timeZone: "Asia/Taipei" },
  { prefix: "960", country: "MV", timeZone: "Indian/Maldives" },
  { prefix: "961", country: "LB", timeZone: "Asia/Beirut" },
  { prefix: "962", country: "JO", timeZone: "Asia/Amman" },
  { prefix: "963", country: "SY", timeZone: "Asia/Damascus" },
  { prefix: "964", country: "IQ", timeZone: "Asia/Baghdad" },
  { prefix: "965", country: "KW", timeZone: "Asia/Kuwait" },
  { prefix: "966", country: "SA", timeZone: "Asia/Riyadh" },
  { prefix: "967", country: "YE", timeZone: "Asia/Aden" },
  { prefix: "968", country: "OM", timeZone: "Asia/Muscat" },
  { prefix: "970", country: "PS", timeZone: "Asia/Gaza" },
  { prefix: "971", country: "AE", timeZone: "Asia/Dubai" },
  { prefix: "972", country: "IL", timeZone: "Asia/Jerusalem" },
  { prefix: "973", country: "BH", timeZone: "Asia/Bahrain" },
  { prefix: "974", country: "QA", timeZone: "Asia/Qatar" },
  { prefix: "975", country: "BT", timeZone: "Asia/Thimphu" },
  { prefix: "976", country: "MN", timeZone: "Asia/Ulaanbaatar" },
  { prefix: "977", country: "NP", timeZone: "Asia/Kathmandu" },
  { prefix: "992", country: "TJ", timeZone: "Asia/Dushanbe" },
  { prefix: "993", country: "TM", timeZone: "Asia/Ashgabat" },
  { prefix: "994", country: "AZ", timeZone: "Asia/Baku" },
  { prefix: "995", country: "GE", timeZone: "Asia/Tbilisi" },
  { prefix: "996", country: "KG", timeZone: "Asia/Bishkek" },
  { prefix: "998", country: "UZ", timeZone: "Asia/Tashkent" },
  // --- Prefijos de 2 dígitos ---
  { prefix: "20", country: "EG", timeZone: "Africa/Cairo" },
  { prefix: "27", country: "ZA", timeZone: "Africa/Johannesburg" },
  { prefix: "30", country: "GR", timeZone: "Europe/Athens" },
  { prefix: "31", country: "NL", timeZone: "Europe/Amsterdam" },
  { prefix: "32", country: "BE", timeZone: "Europe/Brussels" },
  { prefix: "33", country: "FR", timeZone: "Europe/Paris" },
  { prefix: "34", country: "ES", timeZone: "Europe/Madrid" },
  { prefix: "36", country: "HU", timeZone: "Europe/Budapest" },
  { prefix: "39", country: "IT", timeZone: "Europe/Rome" },
  { prefix: "40", country: "RO", timeZone: "Europe/Bucharest" },
  { prefix: "41", country: "CH", timeZone: "Europe/Zurich" },
  { prefix: "43", country: "AT", timeZone: "Europe/Vienna" },
  { prefix: "44", country: "GB", timeZone: "Europe/London" },
  { prefix: "45", country: "DK", timeZone: "Europe/Copenhagen" },
  { prefix: "46", country: "SE", timeZone: "Europe/Stockholm" },
  { prefix: "47", country: "NO", timeZone: "Europe/Oslo" },
  { prefix: "48", country: "PL", timeZone: "Europe/Warsaw" },
  { prefix: "49", country: "DE", timeZone: "Europe/Berlin" },
  { prefix: "51", country: "PE", timeZone: "America/Lima" },
  { prefix: "52", country: "MX", timeZone: "America/Mexico_City" },
  { prefix: "53", country: "CU", timeZone: "America/Havana" },
  { prefix: "54", country: "AR", timeZone: "America/Argentina/Buenos_Aires" },
  { prefix: "55", country: "BR", timeZone: "America/Sao_Paulo" },
  { prefix: "56", country: "CL", timeZone: "America/Santiago" },
  { prefix: "57", country: "CO", timeZone: "America/Bogota" },
  { prefix: "58", country: "VE", timeZone: "America/Caracas" },
  { prefix: "60", country: "MY", timeZone: "Asia/Kuala_Lumpur" },
  { prefix: "61", country: "AU", timeZone: "Australia/Sydney" },
  { prefix: "62", country: "ID", timeZone: "Asia/Jakarta" },
  { prefix: "63", country: "PH", timeZone: "Asia/Manila" },
  { prefix: "64", country: "NZ", timeZone: "Pacific/Auckland" },
  { prefix: "65", country: "SG", timeZone: "Asia/Singapore" },
  { prefix: "66", country: "TH", timeZone: "Asia/Bangkok" },
  { prefix: "81", country: "JP", timeZone: "Asia/Tokyo" },
  { prefix: "82", country: "KR", timeZone: "Asia/Seoul" },
  { prefix: "84", country: "VN", timeZone: "Asia/Ho_Chi_Minh" },
  { prefix: "86", country: "CN", timeZone: "Asia/Shanghai" },
  { prefix: "90", country: "TR", timeZone: "Europe/Istanbul" },
  { prefix: "91", country: "IN", timeZone: "Asia/Kolkata" },
  { prefix: "92", country: "PK", timeZone: "Asia/Karachi" },
  { prefix: "93", country: "AF", timeZone: "Asia/Kabul" },
  { prefix: "94", country: "LK", timeZone: "Asia/Colombo" },
  { prefix: "95", country: "MM", timeZone: "Asia/Yangon" },
  { prefix: "98", country: "IR", timeZone: "Asia/Tehran" },
  // --- Prefijos de 1 dígito ---
  { prefix: "1", country: "US", timeZone: "America/New_York" }, // Norteamérica (US/CA)
  { prefix: "7", country: "RU", timeZone: "Europe/Moscow" }, // Rusia / Kazajistán
];

// --- FUNCIONES HELPER GLOBALES ---

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(text, (respuesta) => {
      rl.close();
      resolve(respuesta.trim());
    });
  });
};

function mostrarBannerConsole() {
  console.clear();
  console.log(
    "\x1b[36m%s\x1b[0m",
    `
  ========================================================================
   ██████╗ ██████╗ ██████╗ ██████╗  █████╗ ██╗  ██╗ █████╗ ██╗
  ██╔════╝██╔═══██╗██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝██╔══██╗██║
  ██║     ██║   ██║██████╔╝██████╔╝███████║█████═╝ ███████║██║
  ██║     ██║   ██║██╔══██╗██╔══██╗██╔══██║██╔═██╗ ██╔══██║██║
  ╚██████╗╚██████╔╝██████╔╝██║  ██║██║  ██║██║  ██╗██║  ██║██║
   ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝
  ========================================================================
                        COBRAKAI BOT V1 - BY SICARIOOFC
  ========================================================================
  `,
  );
}

async function buscarImagen(query) {
  try {
    const url = `https://api.unsplash.com/search/photos?page=1&per_page=10&query=${encodeURIComponent(
      query,
    )}&client_id=${UNSPLASH_ACCESS_KEY}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const randomIndex = Math.floor(
      Math.random() * Math.min(data.results.length, 5),
    );
    return data.results[randomIndex].urls.regular;
  } catch (error) {
    console.error("Error al buscar imagen en Unsplash:", error.message);
    return null;
  }
}

async function descargarImagenBuffer(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    console.error("Error descargando buffer de imagen:", e.message);
    return null;
  }
}

async function buscarEnGoogle(query, limite = 5) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query,
    )}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&num=${limite}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items
          .slice(0, limite)
          .map((item) => `🔹 *${item.title}*\n${item.link}`)
          .join("\n\n");
      }
    }
  } catch (e) {
    console.error("Error en Google Custom Search API:", e.message);
  }

  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(ddgUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const html = await res.text();
      const regex = /<a class="result__url" href="([^"]+)">/g;
      const titleRegex = /<a class="result__a"[^>]*>([\s\S]*?)<\/a>/g;

      const links = [];
      const titles = [];

      let match;
      while ((match = regex.exec(html)) !== null) {
        let cleanUrl = decodeURIComponent(match[1]);
        if (cleanUrl.includes("uddg=")) {
          cleanUrl = cleanUrl.split("uddg=")[1].split("&")[0];
        }
        links.push(cleanUrl);
      }

      while ((match = titleRegex.exec(html)) !== null) {
        const cleanTitle = match[1].replace(/<[^>]+>/g, "").trim();
        titles.push(cleanTitle);
      }

      if (links.length > 0) {
        const resultados = [];
        const maxResults = Math.min(links.length, limite);
        for (let i = 0; i < maxResults; i++) {
          resultados.push(`🔹 *${titles[i] || query}*\n${links[i]}`);
        }
        return resultados.join("\n\n");
      }
    }
  } catch (e) {
    console.error("Error en respaldo DuckDuckGo:", e.message);
  }

  return "❌ No se encontraron resultados para la búsqueda.";
}

function calcularEdad(fechaNacimientoStr) {
  if (!fechaNacimientoStr) return "No especificada";
  const [year, month, day] = fechaNacimientoStr.split("-").map(Number);
  if (!year || !month || !day) return "Formato inválido";

  const hoy = new Date();
  let edad = hoy.getFullYear() - year;
  const mesActual = hoy.getMonth() + 1;
  const diaActual = hoy.getDate();

  if (mesActual < month || (mesActual === month && diaActual < day)) {
    edad--;
  }
  return isNaN(edad) || edad < 0 ? "Formato inválido" : `${edad} años`;
}

function obtenerFechaHoraRespuesta(pais, timeZone) {
  const ahora = new Date();

  const fechaReal = ahora.toLocaleDateString("es-ES", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const horaReal = ahora.toLocaleTimeString("es-ES", {
    timeZone,
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return { fechaReal, horaReal, pais, timeZone };
}

function getFechaHoraPorNumero(jid, msg = null) {
  try {
    let jidReal = jid || "";

    // 1. Extraer el JID real (@s.whatsapp.net) desde múltiples estructuras de Baileys
    if (msg) {
      const candidateJids = [
        msg.key?.participantAlt,
        msg.key?.remoteJidAlt,
        msg.key?.participant,
        msg.key?.remoteJid,
        msg.participant,
        msg.message?.extendedTextMessage?.contextInfo?.participant,
      ];

      for (const cand of candidateJids) {
        if (
          cand &&
          typeof cand === "string" &&
          cand.endsWith("@s.whatsapp.net")
        ) {
          jidReal = cand;
          break;
        }
      }
    }

    // 2. Extraer dígitos limpios del número telefónico
    let numeroLimpio = jidReal.split("@")[0].split(":")[0].replace(/\D/g, "");

    // 3. Verificar si el usuario ya existe registrado en la Base de Datos con su país
    const usuarioBD = db
      .prepare(
        "SELECT pais FROM usuarios WHERE jid = ? OR jid = ? OR numero = ?",
      )
      .get(jid, jidReal, numeroLimpio);

    if (usuarioBD && usuarioBD.pais) {
      // Buscar la zona horaria correspondiente al código ISO de país registrado
      const matchBD = COUNTRY_PREFIX_MAP.find(
        (c) => c.country === usuarioBD.pais,
      );
      if (matchBD) {
        return obtenerFechaHoraRespuesta(usuarioBD.pais, matchBD.timeZone);
      }

      const timezones = ct.getTimezonesForCountry(usuarioBD.pais);
      if (timezones && timezones.length > 0) {
        return obtenerFechaHoraRespuesta(usuarioBD.pais, timezones[0].name);
      }
    }

    // 4. Identificar si es un LID (identificador de privacidad interno de WhatsApp)
    const esLid =
      jidReal.endsWith("@lid") ||
      (numeroLimpio.startsWith("75") && numeroLimpio.length > 13);

    // 5. Si es un número telefónico real (no un LID)
    if (!esLid && numeroLimpio) {
      // A) Buscar coincidencia directa en COUNTRY_PREFIX_MAP (ordenado por prefijos largos primero)
      const coincidencia = COUNTRY_PREFIX_MAP.find((item) =>
        numeroLimpio.startsWith(item.prefix),
      );

      if (coincidencia) {
        return obtenerFechaHoraRespuesta(
          coincidencia.country,
          coincidencia.timeZone,
        );
      }

      // B) Validación y detección automática internacional con libphonenumber-js
      const phoneNumber = parsePhoneNumberFromString("+" + numeroLimpio);
      if (phoneNumber && phoneNumber.isValid() && phoneNumber.country) {
        const paisDetectado = phoneNumber.country; // Ej: "AR", "ES", "CO", "US", etc.
        const timezones = ct.getTimezonesForCountry(paisDetectado);
        const tz =
          timezones && timezones.length > 0 ? timezones[0].name : "UTC";
        return obtenerFechaHoraRespuesta(paisDetectado, tz);
      }
    }

    // 6. Respaldo por defecto para LIDs sin asociar o prefijos desconocidos (UTC o América/México)
    return obtenerFechaHoraRespuesta("MX", "America/Mexico_City");
  } catch (error) {
    console.error("Error al detectar fecha/hora por número:", error);
    return obtenerFechaHoraRespuesta("MX", "America/Mexico_City");
  }
}

function crearImagenTexto(texto) {
  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#FF007F");
  gradient.addColorStop(0.5, "#7F00FF");
  gradient.addColorStop(1, "#00F0FF");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(20, 20, 472, 472, 40);
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.strokeStyle = "#FFFFFF";
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 15;

  let fontSize = 70;
  if (texto.length > 20) fontSize = 45;
  if (texto.length > 40) fontSize = 32;

  ctx.font = `bold ${fontSize}px sans-serif`;

  const palabras = texto.split(" ");
  let linea = "";
  const lineas = [];

  for (let i = 0; i < palabras.length; i++) {
    const testLinea = linea + palabras[i] + " ";
    const meassure = ctx.measureText(testLinea);
    if (meassure.width > 400 && i > 0) {
      lineas.push(linea.trim());
      linea = palabras[i] + " ";
    } else {
      linea = testLinea;
    }
  }
  lineas.push(linea.trim());

  const lineHeight = fontSize * 1.2;
  const startY = height / 2 - ((lineas.length - 1) * lineHeight) / 2;

  lineas.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  return canvas.toBuffer("image/png");
}

function getBotJid(sock) {
  return sock.user.id.split(":")[0].split("@")[0] + "@s.whatsapp.net";
}
function getBotLid(sock) {
  return sock.user.lid ? sock.user.lid.split(":")[0] + "@lid" : null;
}
function isBotAdminCheck(participants, sock) {
  const botJid = getBotJid(sock);
  const botLid = getBotLid(sock);
  const p = participants.find(
    (x) => x.id === botJid || x.id === botLid || x.jid === botJid,
  );
  return p && !!p.admin;
}
function isSenderAdminCheck(participants, sender) {
  const p = participants.find((x) => x.id === sender || x.jid === sender);
  return p && !!p.admin;
}
function getTarget(msg, args) {
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    return msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }
  if (args[0] && args[0].includes("@"))
    return args[0].replace("@", "") + "@s.whatsapp.net";
  return null;
}

function loadWarns() {
  if (!fs.existsSync(WARN_FILE)) fs.writeFileSync(WARN_FILE, "{}");
  return JSON.parse(fs.readFileSync(WARN_FILE));
}

function saveWarns(data) {
  fs.writeFileSync(WARN_FILE, JSON.stringify(data, null, 2));
}

// Conexión a WhatsApp Bot
async function connectToWhatsApp(isReconnect = false) {
  mostrarBannerConsole();

  const authFolder = "auth_info_baileys";
  const credsFile = path.join(authFolder, "creds.json");
  const hasSession = fs.existsSync(credsFile);

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  let usePairingCode = false;
  let phoneNumber = "";

  // Solo pedir menú si NO existe sesión previa y NO es una reconexión automática de socket
  if (!hasSession && !isReconnect) {
    console.log("Selecciona el método de vinculación:");
    console.log(" 1. Escanear Código QR");
    console.log(" 2. Código de vinculación (Número de teléfono)\n");

    const opcion = await question("Escribe el número de la opción (1 o 2): ");

    if (opcion === "2") {
      usePairingCode = true;
      let inputPhone = await question(
        "\nEscribe tu número de WhatsApp con código de país (Ejemplo: 521234567890):\n> ",
      );
      phoneNumber = inputPhone.replace(/\D/g, "");
    } else {
      console.log("\n⌛ Esperando generación del Código QR...");
    }
  } else if (hasSession) {
    console.log("🔄 Sesión encontrada, conectando a WhatsApp...");
  }

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
  });

  if (usePairingCode && !sock.authState.creds.registered) {
    if (phoneNumber) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(phoneNumber);
          console.log("\n========================================");
          console.log(`📌 TU CÓDIGO DE VINCULACIÓN ES: \x1b[32m${code}\x1b[0m`);
          console.log("========================================\n");
        } catch (e) {
          console.error(
            "❌ Error al solicitar código de vinculación:",
            e.message,
          );
        }
      }, 3000);
    } else {
      console.log("❌ No ingresaste un número válido.");
    }
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairingCode && !hasSession) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        console.log(
          "⚠️ Sesión cerrada o desvinculada. Eliminando credenciales...",
        );
        try {
          fs.rmSync(authFolder, { recursive: true, force: true });
        } catch (err) {
          console.error("Error al borrar credenciales:", err.message);
        }
        connectToWhatsApp(false);
      } else if (shouldReconnect) {
        console.log("Estableciendo reconexión con WhatsApp...");
        connectToWhatsApp(true);
      }
    } else if (connection === "open") {
      console.log("\n=============================================");
      console.log("🤖 CobraKaiBot conectado con éxito a WhatsApp");
      console.log("=============================================\n");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("group-participants.update", async (update) => {
    try {
      const { id: groupJid, participants, action } = update;

      // Obtener configuración del grupo en la base de datos
      const config = db
        .prepare(
          "SELECT bienvenida, despedida FROM grupos_config WHERE jid = ?",
        )
        .get(groupJid);

      // Si no hay configuración o ambas opciones están desactivadas, no hacer nada
      if (!config || (config.bienvenida === 0 && config.despedida === 0))
        return;

      const groupMetadata = await sock.groupMetadata(groupJid);
      const groupName = groupMetadata.subject;
      // Obtener la descripción del grupo (o mostrar un mensaje por defecto si está vacía)
      const groupDesc = groupMetadata.desc
        ? groupMetadata.desc.toString()
        : "Sin descripción disponible.";

      for (const num of participants) {
        const userNumber = num.split("@")[0].replace(/\D/g, "");

        // Intentar obtener la foto de perfil del USUARIO
        let userPic;
        try {
          userPic = await sock.profilePictureUrl(num, "image");
        } catch {
          // Si el usuario no tiene foto de perfil o la tiene privada, se usa la foto por defecto del bot
          userPic = "./img/cobrakai_menu.png";
        }

        // --- BIENVENIDA (action === 'add') ---
        if (action === "add" && config.bienvenida === 1) {
          const textoBienvenida =
            `┌───  *¡BIENVENIDO/A!*  ───┐\n` +
            `│\n` +
            `├  👋 Hola @${userNumber}\n` +
            `├  📌 Bienvenido a *${groupName}*\n` +
            `│\n` +
            `├───  *DESCRIPCIÓN Y REGLAS*  ───\n` +
            `│\n` +
            `${groupDesc
              .split("\n")
              .map((line) => `├  ${line}`)
              .join("\n")}\n` +
            `│\n` +
            `├───  *INFORMACIÓN*  ───\n` +
            `│\n` +
            `├  🤖 Usa */menu* para ver los comandos disponibles.\n` +
            `│\n` +
            `└────────────────────────┘`;

          await sock.sendMessage(groupJid, {
            image:
              typeof userPic === "string" && userPic.startsWith("http")
                ? { url: userPic }
                : fs.readFileSync(userPic),
            caption: textoBienvenida,
            mentions: [num],
            contextInfo: Marca_SicariOfc,
          });
        }

        // --- DESPEDIDA (action === 'remove') ---
        if (action === "remove" && config.despedida === 1) {
          const textoDespedida =
            `┌───  *¡HASTA LUEGO!*  ───┐\n` +
            `│\n` +
            `├  👋 El usuario @${userNumber} ha salido del grupo.\n` +
            `├  📌 *${groupName}*\n` +
            `│\n` +
            `└────────────────────────┘`;

          await sock.sendMessage(groupJid, {
            image:
              typeof userPic === "string" && userPic.startsWith("http")
                ? { url: userPic }
                : fs.readFileSync(userPic),
            caption: textoDespedida,
            mentions: [num],
            contextInfo: Marca_SicariOfc,
          });
        }
      }
    } catch (error) {
      console.error("Error en group-participants.update:", error);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      const args = body.trim().split(/ +/);
      const command = args.shift().toLowerCase();

      const sender = msg.key.participant || from;
      const senderNumber = sender.split("@")[0].replace(/\D/g, "");
      const pushName = msg.pushName || "Usuario";

      const comandosProtegidos = [
        "/mtmanag",
        "/mtmanagbet",
        "/apkeditorpro",
        "/apktoolm",
        "/pixellab",
        "/telegprem",
        "/teamzetpriv",
        "/base64pro",
        "/imagen",
        "/musica",
        "/video",
        "/aibuscar",
        "/aisticker",
        "/toimg",
        "/s",
      ];

      const esComandoRestringido = comandosProtegidos.includes(command);

      if (esComandoRestringido) {
        const usuarioBD = db
          .prepare("SELECT * FROM usuarios WHERE jid = ?")
          .get(sender);

        if (!usuarioBD) {
          await sock.sendMessage(
            from,
            {
              text: `⚠️ *Acceso Restringido*\n\nPara utilizar las herramientas de descargas, IA y APKs debes registrarte en el bot.\n\n*Escribe:* /reg Rol | AAAA-MM-DD | Nombre\n*Ejemplo:* /reg Modder | 2000-05-20 | ${pushName}`,
              mentions: [sender],
            },
            { quoted: msg },
          );
          continue;
        }
      }

      if (command === "/start" || command === "/menu") {
        const { fechaReal, horaReal, pais, timeZone } = getFechaHoraPorNumero(
          sender,
          msg,
        );

        console.log(
          `[MENU] Solicitado por ${senderNumber} | País: ${pais} | Zona: ${timeZone} | Hora: ${horaReal}`,
        );

        const usuarioBD = db
          .prepare("SELECT nombre_completo FROM usuarios WHERE jid = ?")
          .get(sender);
        const nombreUsuario = usuarioBD ? usuarioBD.nombre_completo : pushName;

        const response =
          `╭───◈ COBRAKAI - WA ◈───╮\n` +
          `│ 🤖 Bot: CobraKai Bot V1\n` +
          `│ 👑 Creador: SicarioOfc\n` +
          `│ 📅${fechaReal}🕒${horaReal}🌎${pais}\n` +
          `│ 🌎 Modo: ${isGroup ? "Grupo" : "Privado"}\n` +
          `│ 👤 User: @${senderNumber}\n` +
          `╰───────────────╯\n\n` +
          `Hola ${nombreUsuario}, soy tu asistente virtual. 👾\n\n` +
          `『 PRINCIPAL 』\n` +
          `├ • /menu - Ver menú principal\n` +
          `├ • /ping - Velocidad del bot\n` +
          `├ • /status - Estado del bot\n` +
          `├ • /creador - Mi creador\n` +
          `└ • /repo - Repositorio oficial\n\n` +
          `『 GRUPO 👥 』\n` +
          `├ • /tagall - Mencionar a todos\n` +
          `├ • /addadmin - Dar admin bot\n` +
          `├ • /link - Link del grupo\n` +
          `└ • /extgrup - Menu ext adm\n\n` +
          `『 REGISTRO 🔐 』\n` +
          `├ • /reg Rol | Fecha | Nombre\n` +
          `├ • /perfil - Ver tu perfil\n` +
          `├ • /edituser - Editar perfil\n` +
          `└ • /deleteusuario - Borrar datos\n\n` +
          `『 EXTRAS & REDES 🚀 』\n` +
          `├ • /appsyextra - Menu APKs e IA[🔒]\n` +
          `├ • /canteleg - Canal Telegram\n` +
          `├ • /canyoutub - Canal YouTube\n` +
          `├ • /paginaweb - Página oficial\n` +
          `└ • /paypalme - Apoyo donación`;

        await sock.sendMessage(
          from,
          {
            image: { url: "./img/cobrakai_menu.png" },
            caption: response,
            mentions: [sender],
          },
          { quoted: msg },
        );

        await sock.sendMessage(from, {
          text: "📌 *Canal Oficial de Telegram:*",
          contextInfo: MarcaCanal_SicariOfc,
        });
      }

      if (command === "/creador") {
        const textoCreador = `┌───*INFORMACIÓN DEL CREADOR*─┐
│
├  *Desarrollador:* SicariOfc
├  *Proyecto:* CobraKaiBot V1 🤖
│
├───  *REDES OFICIALES*  ───
│
├  📢 /canteleg - Canal de Telegram
├  🎥 /canyoutub - Canal de YouTube
├  🌐 /paginaweb - Sitio Web Oficial
│
├───  *APOYA EL PROYECTO*  ───
│
├  ☕ /payapalme - Donación por PayPal
│
└────────────────────────┘

_¡Hola! @${senderNumber}, Gracias por usar el bot y apoyar el proyecto!_ 🚀`;

        await sock.sendMessage(
          from,
          { text: textoCreador, mentions: [sender] },
          { quoted: msg },
        );
      }

      if (command === "/repo" || command === "/github") {
        await sock.sendMessage(
          from,
          {
            text: "📦 *REPOSITORIO DEL BOT*\n\nClona este bot y ejecútalo en tu propio servidor o dispositivo:\n🔗git clone https://github.com/programador024/CobraKaiBot-WA.git",
            contextInfo: Marca_SicariOfc,
          },
          { quoted: msg },
        );
      }

      if (command === "/ping") {
        const startTime = Date.now();
        const enviado = await sock.sendMessage(
          from,
          { text: "🏓 Probando conexión...", contextInfo: Marca_SicariOfc },
          { quoted: msg },
        );
        const latencia = Date.now() - startTime;
        await sock.sendMessage(from, {
          text: `🏓 *¡PONG!*\n⏱ *Latencia:* ${latencia}ms`,
          contextInfo: Marca_SicariOfc,
          edit: enviado.key,
        });
      }

      if (command === "/status" || command === "/estado") {
        const { fechaReal, horaReal, pais } = getFechaHoraPorNumero(
          sender,
          msg,
        );

        // Calcular tiempo activo (Uptime)
        const uptimeMs = Date.now() - startTimeBot;
        const segundos = Math.floor((uptimeMs / 1000) % 60);
        const minutos = Math.floor((uptimeMs / (1000 * 60)) % 60);
        const horas = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
        const dias = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const uptimeTexto = `${dias}d ${horas}h ${minutos}m ${segundos}s`;

        // Estado del bot (si está respondiendo este mensaje, el socket está conectado)
        const estadoConexion = "🟢 Conectado";

        const respuestaEstado =
          `╭───◈ ESTADO DEL BOT ◈───╮\n` +
          `│ 🤖 Bot: CobraKai Bot V1\n` +
          `│ 🌐 Estado: ${estadoConexion}\n` +
          `│ ⏱️ Tiempo activo: ${uptimeTexto}\n` +
          `│ 📅 Fecha: ${fechaReal}\n` +
          `│ 🕒 Hora: ${horaReal} (${pais})\n` +
          `╰────────────────────────╯\n\n` +
          `_CobraKaiBot se encuentra operando correctamente._ 🚀`;

        await sock.sendMessage(
          from,
          {
            text: respuestaEstado,
            mentions: [sender],
            contextInfo: Marca_SicariOfc,
          },
          { quoted: msg },
        );
      }

      if (command === "/tagall" || command === "/todos") {
        if (!isGroup) {
          await sock.sendMessage(
            from,
            { text: "⚠️ Este comando solo se puede usar en grupos." },
            { quoted: msg },
          );
          continue;
        }
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        let texto = `📢 *INVOCACIÓN GENERAL*\n📌 *Grupo:* ${groupMetadata.subject}\n👥 *Miembros:* ${participants.length}\n\n`;
        const mentions = [];

        for (let mem of participants) {
          texto += `@${mem.id.split("@")[0]}\n`;
          mentions.push(mem.id);
        }

        await sock.sendMessage(
          from,
          { text: texto, mentions: mentions, contextInfo: Marca_SicariOfc },
          { quoted: msg },
        );
      }

      if (command === "/addadmin") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠️ Este comando solo se puede usar en grupos" },
            { quoted: msg },
          );
        }

        try {
          const groupMetadata = await sock.groupMetadata(from);

          const botJid = getBotJid(sock);
          const botLid = getBotLid(sock);
          const participants = groupMetadata.participants;

          const senderPart = participants.find(
            (p) => p.id === sender || p.jid === sender,
          );
          const isSenderAdmin = senderPart && !!senderPart.admin;

          if (!isSenderAdmin) {
            return sock.sendMessage(
              from,
              { text: "❌ Solo los admins del grupo pueden usar /addadmin" },
              { quoted: msg },
            );
          }

          const botPart = participants.find(
            (p) => p.id === botJid || p.id === botLid || p.jid === botJid,
          );
          const isBotAdmin = botPart && !!botPart.admin;

          if (isBotAdmin) {
            return sock.sendMessage(
              from,
              { text: "✅ Ya soy admin, ahora puedes usar /link" },
              { quoted: msg },
            );
          }

          try {
            await sock.groupParticipantsUpdate(from, [botJid], "promote");
            const newMetadata = await sock.groupMetadata(from);
            const newBotPart = newMetadata.participants.find(
              (p) => p.id === botJid || p.id === botLid || p.jid === botJid,
            );
            if (newBotPart && newBotPart.admin) {
              return sock.sendMessage(
                from,
                { text: "✅ ¡Listo! Ahora ya soy admin. Escribe /link" },
                { quoted: msg },
              );
            }
          } catch (e) {}

          return sock.sendMessage(
            from,
            {
              text: "❌ Según WhatsApp aún no soy admin.\n\nHazme admin manualmente una vez desde info del grupo y luego ya funcionará /link automático.",
            },
            { quoted: msg },
          );
        } catch (e) {
          console.log("Error /addadmin:", e);
          await sock.sendMessage(
            from,
            { text: "❌ Error al verificar admin" },
            { quoted: msg },
          );
        }
      }

      if (command === "/link") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠️ Este comando solo se puede utilizar en grupos." },
            { quoted: msg },
          );
        }

        try {
          const groupMetadata = await sock.groupMetadata(from);

          const botJid = getBotJid(sock);
          const botLid = getBotLid(sock);

          const botPart = groupMetadata.participants.find(
            (p) => p.id === botJid || p.id === botLid || p.jid === botJid,
          );
          const isBotAdmin = botPart && !!botPart.admin;

          if (!isBotAdmin) {
            return sock.sendMessage(
              from,
              {
                text: `❌ Según WhatsApp aún no soy admin.\n\nHazme admin manual y luego escribe /addadmin para verificar.`,
              },
              { quoted: msg },
            );
          }

          const inviteCode = await sock.groupInviteCode(from);
          const link = `https://chat.whatsapp.com/${inviteCode}`;

          let groupPic;
          try {
            groupPic = await sock.profilePictureUrl(from, "image");
          } catch {
            groupPic = "./img/cobrakai_menu.png";
          }

          const response =
            `🔗 *ENLACE DE INVITACIÓN DEL GRUPO* 🔗\n\n` +
            `📌 *Grupo:* ${groupMetadata.subject}\n` +
            `👥 *Miembros:* ${groupMetadata.participants.length}\n` +
            `🔗 *Enlace:* ${link}`;

          await sock.sendMessage(
            from,
            {
              image:
                typeof groupPic === "string" && groupPic.startsWith("http")
                  ? { url: groupPic }
                  : fs.readFileSync(groupPic),
              caption: response,
              contextInfo: Marca_SicariOfc,
            },
            { quoted: msg },
          );
        } catch (e) {
          console.log("Error en comando /link:", e);
          await sock.sendMessage(
            from,
            { text: `❌ Error: ${e.message}` },
            { quoted: msg },
          );
        }
      }

      if (command === "/canteleg") {
        await sock.sendMessage(
          from,
          {
            text: "Sígueme en mi Canal de Telegram para estar actualizado:\nhttps://t.me/mds_inmunes2",
          },
          { quoted: msg },
        );
      }

      if (command === "/canyoutub") {
        await sock.sendMessage(
          from,
          {
            text: "Sígueme en mi Canal de Youtube:\nhttps://www.youtube.com/@nms_sicario023",
          },
          { quoted: msg },
        );
      }

      if (command === "/paginaweb") {
        await sock.sendMessage(
          from,
          { text: "Sígueme en mi Página Web:\nhttps://teamzetasprivate.com" },
          { quoted: msg },
        );
      }

      if (command === "/paypalme") {
        await sock.sendMessage(from, {
          text: "Apoyame con una donación para un cafe,\npara mejorar el bot:\nhttps://www.paypal.com/paypalme/SicariOfc025",
        });
      }

      if (command.startsWith("/reg")) {
        const existe = db
          .prepare("SELECT * FROM usuarios WHERE jid = ?")
          .get(sender);
        if (existe) {
          await sock.sendMessage(
            from,
            {
              text: `⚠️ Ya estás registrado como *${existe.nombre_completo}*`,
              mentions: [sender],
            },
            { quoted: msg },
          );
          continue;
        }

        const argsText = body.slice(4).trim();
        const partes = argsText.split("|").map((p) => p.trim());

        if (partes.length < 2 || !partes[1].match(/^\d{4}-\d{2}-\d{2}$/)) {
          await sock.sendMessage(
            from,
            {
              text: `⚠️ *Uso correcto del registro:*\n\n/reg Rol | AAAA-MM-DD | Nombre\n\n*Ejemplo:*\n/reg Developer | 2000-08-15 | ${pushName}`,
            },
            { quoted: msg },
          );
          continue;
        }

        const rolIngresado = partes[0] || "Usuario";
        const fechaNacimiento = partes[1];
        const nombreFinal = partes[2] || pushName;

        const { pais } = getFechaHoraPorNumero(sender, msg);

        let fotoUrl = "";
        try {
          fotoUrl = await sock.profilePictureUrl(sender, "image");
        } catch {}

        db.prepare(
          `
          INSERT INTO usuarios (jid, numero, nombre_completo, pais, rol, fecha_nacimiento, foto, fecha_registro) 
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))
        `,
        ).run(
          sender,
          senderNumber,
          nombreFinal,
          pais,
          rolIngresado,
          fechaNacimiento,
          fotoUrl,
        );

        const edadCalculada = calcularEdad(fechaNacimiento);

        await sock.sendMessage(
          from,
          {
            text: `✅ *Registro exitoso*\n\n👤 Nombre: ${nombreFinal}\n📞 Phone: @${senderNumber}\n🎂 Edad: ${edadCalculada}\n🌎 País: ${pais}\n🎭 Rol: ${rolIngresado}\n\n¡Ya puedes usar todos los comandos restringidos!`,
            mentions: [sender],
          },
          { quoted: msg },
        );
      }

      if (command.startsWith("/edituser")) {
        const existe = db
          .prepare("SELECT * FROM usuarios WHERE jid = ?")
          .get(sender);
        if (!existe) {
          await sock.sendMessage(
            from,
            {
              text: `❌ No estás registrado. Escribe /reg para crear tu perfil.`,
            },
            { quoted: msg },
          );
          continue;
        }

        const argsText = body.slice(9).trim();
        const partes = argsText.split("|").map((p) => p.trim());

        if (partes.length < 2 || !partes[1].match(/^\d{4}-\d{2}-\d{2}$/)) {
          await sock.sendMessage(
            from,
            {
              text: `⚠️ *Uso correcto para editar:*\n\n/edituser NuevoRol | AAAA-MM-DD | NuevoNombre\n\n*Ejemplo:*\n/edituser Modder | 1998-11-20 | ${existe.nombre_completo}`,
            },
            { quoted: msg },
          );
          continue;
        }

        const nuevoRol = partes[0] || existe.rol;
        const nuevaFechaNac = partes[1] || existe.fecha_nacimiento;
        const nuevoNombre = partes[2] || existe.nombre_completo;

        let fotoUrl = existe.foto;
        try {
          fotoUrl = await sock.profilePictureUrl(sender, "image");
        } catch {}

        db.prepare(
          `
          UPDATE usuarios 
          SET nombre_completo = ?, rol = ?, fecha_nacimiento = ?, foto = ? 
          WHERE jid = ?
        `,
        ).run(nuevoNombre, nuevoRol, nuevaFechaNac, fotoUrl, sender);

        await sock.sendMessage(
          from,
          {
            text: `✅ *Perfil actualizado con éxito*\n\nEscribe */perfil* para ver los cambios.`,
            mentions: [sender],
          },
          { quoted: msg },
        );
      }

      if (command === "/perfil") {
        const user = db
          .prepare("SELECT * FROM usuarios WHERE jid = ?")
          .get(sender);
        if (!user) {
          await sock.sendMessage(
            from,
            {
              text: `❌ No estás registrado. Escribe /reg para registrarte.`,
              mentions: [sender],
            },
            { quoted: msg },
          );
        } else {
          const edadCalculada = calcularEdad(user.fecha_nacimiento);
          const captionPerfil =
            `👤 *TU PERFIL*\n\n` +
            `Nombre: ${user.nombre_completo}\n` +
            `Phone: @${senderNumber}\n` +
            `Edad: ${edadCalculada}\n` +
            `Pais: ${user.pais}\n` +
            `Rol: ${user.rol}\n` +
            `Fecha: ${user.fecha_registro}`;

          if (user.foto) {
            await sock.sendMessage(
              from,
              {
                image: { url: user.foto },
                caption: captionPerfil,
                mentions: [sender],
                contextInfo: Marca_SicariOfc,
              },
              { quoted: msg },
            );
          } else {
            await sock.sendMessage(
              from,
              {
                text: captionPerfil,
                mentions: [sender],
                contextInfo: Marca_SicariOfc,
              },
              { quoted: msg },
            );
          }
        }
      }

      if (command === "/deleteusuario") {
        const del = db
          .prepare("DELETE FROM usuarios WHERE jid = ?")
          .run(sender);
        if (del.changes > 0) {
          await sock.sendMessage(
            from,
            { text: `🗑️ Perfil borrado @${senderNumber}`, mentions: [sender] },
            { quoted: msg },
          );
        } else {
          await sock.sendMessage(
            from,
            { text: `❌ No tienes perfil registrado.` },
            { quoted: msg },
          );
        }
      }

      if (command === "/extgrup") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            {
              text: "⚠ Este comando solo se puede utilizar dentro de un grupo.",
            },
            { quoted: msg },
          );
        }

        const { fechaReal, horaReal, pais, timeZone } = getFechaHoraPorNumero(
          sender,
          msg,
        );
        // VERIFICAR HORA Y PAIS EN TU CONSOLA:
        console.log(
          `[MENU] Solicitado por ${senderNumber} | País: ${pais} | Zona: ${timeZone} | Hora: ${horaReal}`,
        );
        const usuarioBD = db
          .prepare("SELECT nombre_completo FROM usuarios WHERE jid = ?")
          .get(sender);
        const nombreUsuario = usuarioBD ? usuarioBD.nombre_completo : pushName;

        const response =
          `╭───◈COBRAKAI - ADMIN GRUP◈─╮\n` +
          `│ 🤖 Bot: CobraKai Bot V1\n` +
          `│ 👑 Creador: SicarioOfc\n` +
          `│ 📅${fechaReal}🕒${horaReal}🌎${pais}\n` +
          `│ 🌎 Modo: Grupo\n` +
          `│ 👤 User: @${senderNumber}\n` +
          `╰───────────────╯\n\n` +
          `Hola ${nombreUsuario}, aquí tienes las herramientas extras para grupo. 👾\n` +
          `⚠️ *Nota:* Estos comandos solo estan permitidos para admins del grupo.\n\n` +
          `『 ADMINS GRUPO 📱 』\n` +
          `├ • /hidetag <text> - Mención oculta\n` +
          `├ • /kick <@user> - Sacar usuario [🔒]\n` +
          `├ • /promote <@user> - Dar admin\n` +
          `├ • /demote <@user> - Quitar admin\n` +
          `├ • /welcome <on/off> - Activar/desactivar bienvenida\n` +
          `├ • /goodbye <on/off> - Activar/desactivar despedida\n` +
          `├ • /revoke - Resetear link\n` +
          `├ • /open - Abrir grupo\n` +
          `├ • /close - Cerrar grupo\n` +
          `├ • /setname <text> - Edit nombre\n` +
          `├ • /setdesc <text> - Edit descripción\n` +
          `├ • /warn <@user> motivo - Advertir\n` +
          `├ • /warns <@user>- Ver advertencias\n` +
          `├ • /delwarn <@user> - Quitar advertencia\n` +
          `└ • /resetwarn<@user> - Reset advertencia`;

        await sock.sendMessage(
          from,
          {
            image: { url: "./img/cobrakai_menu2.png" },
            caption: response,
            mentions: [sender],
          },
          { quoted: msg },
        );

        await sock.sendMessage(from, {
          text: "📌 *Canal Oficial de Telegram:*",
          contextInfo: MarcaCanal_SicariOfc,
        });
      }

      if (command === "/hidetag") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠Solo grupos" },
            { quoted: msg },
          );
        }
        const meta = await sock.groupMetadata(from);
        if (!isSenderAdminCheck(meta.participants, sender)) {
          return sock.sendMessage(
            from,
            { text: "⚠ Solo los administradores pueden usar /hidetag" },
            { quoted: msg },
          );
        }

        const textHidetag = args.join(" ") || "✔️Atención a todos";
        const mentions = meta.participants.map((p) => p.id);
        await sock.sendMessage(
          from,
          { text: textHidetag, mentions: mentions },
          { quoted: msg },
        );
      }

      if (command === "/kick") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠️Solo grupos" },
            { quoted: msg },
          );
        }
        const meta = await sock.groupMetadata(from);
        if (!isSenderAdminCheck(meta.participants, sender))
          return sock.sendMessage(
            from,
            { text: "⚠Solo admins" },
            { quoted: msg },
          );
        if (!isBotAdminCheck(meta.participants, sock))
          return sock.sendMessage(
            from,
            { text: "❌No soy admin" },
            { quoted: msg },
          );

        const target = getTarget(msg, args);
        if (!target)
          return sock.sendMessage(
            from,
            { text: "⚠Etiqueta a alguien, ejemplo: /kick @usuario" },
            { quoted: msg },
          );
        if (target.includes(sock.user.id.split(":")[0]))
          return sock.sendMessage(
            from,
            { text: "❌No me puedo sacar a mí mismo" },
            { quoted: msg },
          );

        await sock.groupParticipantsUpdate(from, [target], "remove");
        await sock.sendMessage(
          from,
          { text: "✔️Usuario eliminado" },
          { quoted: msg },
        );
      }

      if (command === "/promote" || command === "/demote") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠️ Solo grupos" },
            { quoted: msg },
          );
        }

        try {
          const meta = await sock.groupMetadata(from);

          if (!isSenderAdminCheck(meta.participants, sender)) {
            return sock.sendMessage(
              from,
              { text: "⚠️ Solo admins" },
              { quoted: msg },
            );
          }

          if (!isBotAdminCheck(meta.participants, sock)) {
            return sock.sendMessage(
              from,
              { text: "❌ No soy admin" },
              { quoted: msg },
            );
          }

          const target = getTarget(msg, args);
          if (!target) {
            return sock.sendMessage(
              from,
              { text: `⚠️ Usa: ${command} @usuario` },
              { quoted: msg },
            );
          }

          const action = command === "/promote" ? "promote" : "demote";
          await sock.groupParticipantsUpdate(from, [target], action);

          const textoRespuesta =
            action === "promote"
              ? `✔️ @${target.split("@")[0]} ahora es administrador.`
              : `✔️️ @${target.split("@")[0]} ya no es administrador.`;

          await sock.sendMessage(
            from,
            {
              text: textoRespuesta,
              mentions: [target],
            },
            { quoted: msg },
          );
        } catch (error) {
          console.error("Error en promote/demote:", error);
          await sock.sendMessage(
            from,
            {
              text: "❌ Ocurrió un error al intentar cambiar el rol del usuario.",
            },
            { quoted: msg },
          );
        }
      }

      if (command === "/welcome" || command === "/bienvenida") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            {
              text: "⚠️ Este comando solo se puede utilizar dentro de un grupo.",
            },
            { quoted: msg },
          );
        }

        const meta = await sock.groupMetadata(from);
        if (!isSenderAdminCheck(meta.participants, sender)) {
          return sock.sendMessage(
            from,
            {
              text: "❌ Solo los administradores pueden activar o desactivar la bienvenida.",
            },
            { quoted: msg },
          );
        }

        const opcion = args[0]?.toLowerCase();
        if (opcion !== "on" && opcion !== "off") {
          return sock.sendMessage(
            from,
            { text: "⚠️️ Uso correcto: */welcome on* o */welcome off*" },
            { quoted: msg },
          );
        }

        const estado = opcion === "on" ? 1 : 0;
        db.prepare(
          `INSERT INTO grupos_config (jid, bienvenida) VALUES (?, ?) 
           ON CONFLICT(jid) DO UPDATE SET bienvenida = ?`,
        ).run(from, estado, estado);

        await sock.sendMessage(
          from,
          {
            text: `✅ Mensaje de bienvenida ${estado === 1 ? "activado 🟢" : "desactivado 🔴"}`,
          },
          { quoted: msg },
        );
      }

      if (command === "/goodbye" || command === "/despedida") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            {
              text: "⚠️ Este comando solo se puede utilizar dentro de un grupo.",
            },
            { quoted: msg },
          );
        }

        const meta = await sock.groupMetadata(from);
        if (!isSenderAdminCheck(meta.participants, sender)) {
          return sock.sendMessage(
            from,
            {
              text: "❌ Solo los administradores pueden activar o desactivar la despedida.",
            },
            { quoted: msg },
          );
        }

        const opcion = args[0]?.toLowerCase();
        if (opcion !== "on" && opcion !== "off") {
          return sock.sendMessage(
            from,
            { text: "⚠️ Uso correcto: */goodbye on* o */goodbye off*" },
            { quoted: msg },
          );
        }

        const estado = opcion === "on" ? 1 : 0;
        db.prepare(
          `INSERT INTO grupos_config (jid, despedida) VALUES (?, ?) 
           ON CONFLICT(jid) DO UPDATE SET despedida = ?`,
        ).run(from, estado, estado);

        await sock.sendMessage(
          from,
          {
            text: `✅ Mensaje de despedida ${estado === 1 ? "activado 🟢" : "desactivado 🔴"}`,
          },
          { quoted: msg },
        );
      }

      if (command === "/revoke") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠️️Solo grupos" },
            { quoted: msg },
          );
        }
        const meta = await sock.groupMetadata(from);
        if (!isSenderAdminCheck(meta.participants, sender))
          return sock.sendMessage(
            from,
            { text: "⚠️Solo admins" },
            { quoted: msg },
          );
        if (!isBotAdminCheck(meta.participants, sock))
          return sock.sendMessage(
            from,
            { text: "❌No soy admin" },
            { quoted: msg },
          );

        await sock.groupRevokeInvite(from);
        const code = await sock.groupInviteCode(from);
        await sock.sendMessage(
          from,
          {
            text: `✔️Link reseteado\n🔗 Nuevo: https://chat.whatsapp.com/${code}`,
            contextInfo: Marca_SicariOfc,
          },
          { quoted: msg },
        );
      }

      if (command === "/open" || command === "/close") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠️Solo grupos" },
            { quoted: msg },
          );
        }
        const meta = await sock.groupMetadata(from);
        if (!isSenderAdminCheck(meta.participants, sender))
          return sock.sendMessage(
            from,
            { text: "⚠️Solo admins" },
            { quoted: msg },
          );
        if (!isBotAdminCheck(meta.participants, sock))
          return sock.sendMessage(
            from,
            { text: "❌No soy admin" },
            { quoted: msg },
          );

        const setting =
          command === "/close" ? "announcement" : "not_announcement";
        await sock.groupSettingUpdate(from, setting);
        await sock.sendMessage(
          from,
          {
            text:
              command === "/close"
                ? "🔒Grupo cerrado, solo admins pueden hablar"
                : "🔓Grupo abierto, todos pueden hablar",
          },
          { quoted: msg },
        );
      }

      if (command === "/setname") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠️Solo grupos" },
            { quoted: msg },
          );
        }
        const meta = await sock.groupMetadata(from);
        if (!isSenderAdminCheck(meta.participants, sender)) return;
        if (!isBotAdminCheck(meta.participants, sock))
          return sock.sendMessage(
            from,
            { text: "❌No soy admin" },
            { quoted: msg },
          );
        const newName = args.join(" ");
        if (!newName)
          return sock.sendMessage(
            from,
            {
              text: "⚠️Escribe el nuevo nombre del grupo\nEjemplo: /setname NuevoNombre",
            },
            { quoted: msg },
          );
        await sock.groupUpdateSubject(from, newName);
        await sock.sendMessage(
          from,
          { text: `✔️Nombre del grupo cambiado a:\n${newName}` },
          { quoted: msg },
        );
      }

      if (command === "/setdesc") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            { text: "⚠️Solo grupos" },
            { quoted: msg },
          );
        }
        const meta = await sock.groupMetadata(from);
        if (!isSenderAdminCheck(meta.participants, sender)) return;
        if (!isBotAdminCheck(meta.participants, sock))
          return sock.sendMessage(
            from,
            { text: "❌No soy admin" },
            { quoted: msg },
          );
        const newDesc = args.join(" ");
        if (!newDesc)
          return sock.sendMessage(
            from,
            {
              text: "⚠️️Escribe la nueva descripción del grupo\nEjemplo: /setdesc NuevaDescripción",
            },
            { quoted: msg },
          );
        await sock.groupUpdateDescription(from, newDesc);
        await sock.sendMessage(
          from,
          { text: `✔️Descripción del grupo cambiada a:\n${newDesc}` },
          { quoted: msg },
        );
      }

      if (command === "/warn") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            {
              text: "⚠ Este comando solo se puede utilizar dentro de un grupo.",
            },
            { quoted: msg },
          );
        }

        try {
          const meta = await sock.groupMetadata(from);
          if (!isSenderAdminCheck(meta.participants, sender)) {
            return sock.sendMessage(
              from,
              { text: "❌ Solo los admins pueden dar advertencias." },
              { quoted: msg },
            );
          }
          if (!isBotAdminCheck(meta.participants, sock)) {
            return sock.sendMessage(
              from,
              {
                text: "❌ No soy admin, no puedo eliminar miembros si llegan a 3 advertencias.",
              },
              { quoted: msg },
            );
          }

          const target = getTarget(msg, args);
          if (!target) {
            return sock.sendMessage(
              from,
              {
                text: "❌ Usa: /warn @usuario + motivo\nEjemplo: /warn @usuario spam",
              },
              { quoted: msg },
            );
          }
          if (target.includes(getBotJid(sock).split("@")[0])) {
            return sock.sendMessage(
              from,
              { text: "❌ No me puedes dar una advertencia a mí." },
              { quoted: msg },
            );
          }

          let warns = loadWarns();
          if (!warns[from]) warns[from] = {};
          if (!warns[from][target])
            warns[from][target] = { count: 0, reasons: [] };

          warns[from][target].count += 1;
          const motivo = args.slice(1).join(" ") || "Sin motivo";
          warns[from][target].reasons.push(motivo);
          saveWarns(warns);

          const count = warns[from][target].count;

          if (count >= 3) {
            await sock.sendMessage(
              from,
              {
                text: `⚠ @${target.split("@")[0]} llegó a 3 advertencias:\n1. ${warns[from][target].reasons[0]}\n2. ${warns[from][target].reasons[1]}\n3. ${warns[from][target].reasons[2]}\n\nSerá expulsado del grupo.`,
                mentions: [target],
              },
              { quoted: msg },
            );

            await sock.groupParticipantsUpdate(from, [target], "remove");

            delete warns[from][target];
            if (Object.keys(warns[from]).length === 0) {
              delete warns[from];
            }
            saveWarns(warns);
          } else {
            await sock.sendMessage(
              from,
              {
                text: `⚠️ Advertencia ${count}/3 para @${target.split("@")[0]}\nMotivo: ${motivo}\nQuedan ${3 - count} advertencias para expulsión.`,
                mentions: [target],
              },
              { quoted: msg },
            );
          }
        } catch (error) {
          console.error("Error en comando /warn:", error);
        }
      }

      if (command === "/warns") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            {
              text: "⚠️ Este comando solo se puede utilizar dentro de un grupo.",
            },
            { quoted: msg },
          );
        }

        const target = getTarget(msg, args) || sender;
        let warns = loadWarns();
        const data = warns[from]?.[target];

        if (!data || data.count === 0) {
          return sock.sendMessage(
            from,
            {
              text: `✅ @${target.split("@")[0]} no tiene advertencias.`,
              mentions: [target],
            },
            { quoted: msg },
          );
        }

        let txt = `📋 Advertencias de @${target.split("@")[0]}: ${data.count}/3\n\n`;
        data.reasons.forEach((r, i) => {
          txt += `${i + 1}. ${r}\n`;
        });

        await sock.sendMessage(
          from,
          { text: txt, mentions: [target] },
          { quoted: msg },
        );
      }

      if (command === "/delwarn") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            {
              text: "⚠️ Este comando solo se puede utilizar dentro de un grupo.",
            },
            { quoted: msg },
          );
        }

        try {
          const meta = await sock.groupMetadata(from);
          if (!isSenderAdminCheck(meta.participants, sender)) {
            return sock.sendMessage(
              from,
              { text: "❌ Solo los admins pueden remover advertencias." },
              { quoted: msg },
            );
          }

          const target = getTarget(msg, args);
          if (!target) {
            return sock.sendMessage(
              from,
              { text: "❌ Usa: /delwarn @usuario" },
              { quoted: msg },
            );
          }

          let warns = loadWarns();
          if (!warns[from]?.[target]) {
            return sock.sendMessage(
              from,
              { text: "❌ El usuario no tiene advertencias registradas." },
              { quoted: msg },
            );
          }

          warns[from][target].count -= 1;
          warns[from][target].reasons.pop();

          const nuevosWarns = warns[from][target].count;

          if (nuevosWarns <= 0) {
            delete warns[from][target];
          }

          if (Object.keys(warns[from]).length === 0) {
            delete warns[from];
          }

          saveWarns(warns);

          await sock.sendMessage(
            from,
            {
              text: `✅ Se le quitó 1 advertencia a @${target.split("@")[0]}\nAhora tiene ${nuevosWarns > 0 ? nuevosWarns : 0}/3.`,
              mentions: [target],
            },
            { quoted: msg },
          );
        } catch (error) {
          console.error("Error en comando /delwarn:", error);
        }
      }

      if (command === "/resetwarn") {
        if (!isGroup) {
          return sock.sendMessage(
            from,
            {
              text: "⚠️ Este comando solo se puede utilizar dentro de un grupo.",
            },
            { quoted: msg },
          );
        }

        try {
          const meta = await sock.groupMetadata(from);
          if (!isSenderAdminCheck(meta.participants, sender)) {
            return sock.sendMessage(
              from,
              {
                text: "❌ Solo los admins pueden reiniciar las advertencias del grupo.",
              },
              { quoted: msg },
            );
          }

          let warns = loadWarns();

          if (warns[from]) {
            delete warns[from];
            saveWarns(warns);
          }

          await sock.sendMessage(
            from,
            { text: "✅ Todas las advertencias del grupo fueron reiniciadas." },
            { quoted: msg },
          );
        } catch (error) {
          console.error("Error en comando /resetwarn:", error);
        }
      }

      if (command === "/appsyextra") {
        const { fechaReal, horaReal, pais, timeZone } = getFechaHoraPorNumero(
          sender,
          msg,
        );
        // VERIFICAR HORA Y PAIS EN TU CONSOLA:
        console.log(
          `[MENU] Solicitado por ${senderNumber} | País: ${pais} | Zona: ${timeZone} | Hora: ${horaReal}`,
        );

        const usuarioBD = db
          .prepare("SELECT nombre_completo FROM usuarios WHERE jid = ?")
          .get(sender);
        const nombreUsuario = usuarioBD ? usuarioBD.nombre_completo : pushName;

        const response =
          `╭───◈ COBRAKAI - APKS e IA ◈───╮\n` +
          `│ 🤖 Bot: CobraKai Bot V1\n` +
          `│ 👑 Creador: SicarioOfc\n` +
          `│ 📅${fechaReal}🕒${horaReal}🌎${pais}\n` +
          `│ 🌎 Modo: ${isGroup ? "Grupo" : "Privado"}\n` +
          `│ 👤 User: @${senderNumber}\n` +
          `╰───────────────╯\n\n` +
          `Hola ${nombreUsuario}, aquí tienes las herramientas de APKs e IA. 👾\n` +
          `⚠️ *Nota:* Los comandos marcados con [🔒] requieren registro previo con /reg\n\n` +
          `『 APKS PREMIUM 📱 』\n` +
          `├ • /mtmanag - Edit string/code [🔒]\n` +
          `├ • /mtmanagbet - Mt manager prem [🔒]\n` +
          `├ • /apkeditorpro - Edit code/diseño [🔒]\n` +
          `├ • /apktoolm - Nombre & Icon [🔒]\n` +
          `├ • /pixellab - Person text/image [🔒]\n` +
          `├ • /telegprem - Telegram Premium [🔒]\n` +
          `├ • /teamzetpriv - App móvil web [🔒]\n` +
          `└ • /base64pro - Codi / Decodi [🔒]\n\n` +
          `『 MULTIMEDIA E IA 🤖 』\n` +
          `├ • /imagen <texto> - Buscar imagen [🔒]\n` +
          `├ • /musica <texto> - Descargar MP3 [🔒]\n` +
          `├ • /video <texto> - Descargar MP4 [🔒]\n` +
          `├ • /aibuscar <texto> - Buscar info [🔒]\n` +
          `├ • /aisticker - Crear sticker [🔒]\n` +
          `├ • /toimg - Sticker a imagen [🔒]\n` +
          `└ • /s <texto> - Texto a sticker [🔒]`;

        await sock.sendMessage(
          from,
          {
            image: { url: "./img/cobrakai_menu3.png" },
            caption: response,
            mentions: [sender],
          },
          { quoted: msg },
        );

        await sock.sendMessage(from, {
          text: "📌 *Canal Oficial de Telegram:*",
          contextInfo: MarcaCanal_SicariOfc,
        });
      }

      if (command.startsWith("/imagen")) {
        const query = body.replace(/^\/imagen/i, "").trim();

        if (!query) {
          await sock.sendMessage(
            from,
            {
              text: "❌ Debes escribir lo que deseas buscar.\n\n*Ejemplo:* /imagen auto azul",
            },
            { quoted: msg },
          );
          continue;
        }

        const msgEspera = await sock.sendMessage(
          from,
          { text: `🔍 Buscando imagen para: *${query}*...` },
          { quoted: msg },
        );

        const imagenUrl = await buscarImagen(query);

        if (imagenUrl) {
          const imageBuffer = await descargarImagenBuffer(imagenUrl);

          if (imageBuffer) {
            try {
              const sentMsg = await sock.sendMessage(
                from,
                {
                  image: imageBuffer,
                  caption: `🖼️ Resultado para: *${query}*`,
                },
                { quoted: msg },
              );

              await sock.sendMessage(from, {
                react: { text: "⭐", key: sentMsg.key },
              });
            } catch (err) {
              console.error("Error enviando buffer de imagen:", err);
              await sock.sendMessage(
                from,
                { text: "❌ No se pudo enviar la imagen." },
                { quoted: msg },
              );
            }
          } else {
            await sock.sendMessage(
              from,
              { text: "❌ No se pudo descargar la imagen seleccionada." },
              { quoted: msg },
            );
          }

          try {
            await sock.sendMessage(from, { delete: msgEspera.key });
          } catch {}
        } else {
          await sock.sendMessage(
            from,
            { text: "❌ No se encontraron imágenes para esa búsqueda." },
            { quoted: msg },
          );
        }
      }

      if (command.startsWith("/musica")) {
        const query = body.replace(/^\/musica/i, "").trim();

        if (!query) {
          await sock.sendMessage(
            from,
            {
              text: "❌ Debes escribir el nombre de la canción.\n\n*Ejemplo:* /musica dueles jesse y joy",
            },
            { quoted: msg },
          );
          continue;
        }

        const msgEspera = await sock.sendMessage(
          from,
          { text: `🔍 Buscando y descargando audio: *${query}*...` },
          { quoted: msg },
        );

        const tempId = `audio_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        const tempFilePath = path.join(process.cwd(), `${tempId}.mp3`);

        try {
          const searchResult = await yts(query);
          const video = searchResult.videos[0];

          if (!video) {
            await sock.sendMessage(
              from,
              { text: `❌ No se encontraron resultados para: *${query}*` },
              { quoted: msg },
            );
            continue;
          }

          await ytdlpExec(video.url, {
            extractAudio: true,
            audioFormat: "mp3",
            audioQuality: "192k",
            output: tempFilePath,
            noCacheDir: true,
            quiet: true,
          });

          if (!fs.existsSync(tempFilePath)) {
            throw new Error("No se generó el archivo MP3.");
          }

          const audioBuffer = fs.readFileSync(tempFilePath);

          await sock.sendMessage(
            from,
            {
              audio: audioBuffer,
              mimetype: "audio/mp4",
              fileName: `${video.title}.mp3`,
              caption: `🎵 *${video.title}*\n⏱️ *Duración:* ${video.timestamp}\n🔗 ${video.url}`,
            },
            { quoted: msg },
          );
        } catch (error) {
          console.error("Error detallado en /musica:", error);

          let mensajeUsuario = "❌ No se pudo descargar la canción solicitada.";
          const errString = String(error);

          if (errString.includes("Sign in to confirm your age")) {
            mensajeUsuario =
              "⚠ La canción encontrada tiene restricción de edad en YouTube y no se puede descargar.";
          } else if (errString.includes("Video unavailable")) {
            mensajeUsuario = "⚠️ La canción no está disponible en YouTube.";
          }

          await sock.sendMessage(
            from,
            { text: mensajeUsuario },
            { quoted: msg },
          );
        } finally {
          try {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
          } catch (e) {
            console.error("Error limpiando archivo temporal:", e);
          }

          try {
            await sock.sendMessage(from, { delete: msgEspera.key });
          } catch {}
        }
      }

      if (command.startsWith("/video")) {
        const query = body.replace(/^\/video/i, "").trim();

        if (!query) {
          await sock.sendMessage(
            from,
            {
              text: "❌ Debes escribir el nombre del video después de /video.\n\n*Ejemplo:* /video cobra kai trailer español",
            },
            { quoted: msg },
          );
          continue;
        }

        const msgEspera = await sock.sendMessage(
          from,
          { text: `🔍 Buscando y descargando el video: *${query}*...` },
          { quoted: msg },
        );

        const tempId = `video_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        const tempFilePath = path.join(process.cwd(), `${tempId}.mp4`);

        try {
          const searchResult = await yts(query);
          const video = searchResult.videos[0];

          if (!video) {
            await sock.sendMessage(
              from,
              { text: `❌ No se encontraron videos para: *${query}*` },
              { quoted: msg },
            );
            continue;
          }

          await ytdlpExec(video.url, {
            format:
              "bestvideo[vcodec^=avc1][height<=720]+bestaudio[acodec^=mp4a]/bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            recodeVideo: "mp4",
            output: tempFilePath,
            noCacheDir: true,
            quiet: true,
          });

          if (!fs.existsSync(tempFilePath)) {
            throw new Error("No se generó el archivo de video MP4.");
          }

          const videoBuffer = fs.readFileSync(tempFilePath);

          await sock.sendMessage(
            from,
            {
              video: videoBuffer,
              mimetype: "video/mp4",
              caption: `🎥 *${video.title}*\n⏱️ *Duración:* ${video.timestamp}\n🔗 ${video.url}`,
            },
            { quoted: msg },
          );
        } catch (error) {
          console.error("Error detallado en /video:", error);

          let mensajeUsuario =
            "❌ Ocurrió un error al procesar y descargar el video.";
          const errString = String(error);

          if (errString.includes("Sign in to confirm your age")) {
            mensajeUsuario =
              "⚠️ El video encontrado tiene restricción de edad en YouTube y no se puede descargar.";
          } else if (errString.includes("Video unavailable")) {
            mensajeUsuario =
              "⚠️ El video solicitado no está disponible en YouTube.";
          }

          await sock.sendMessage(
            from,
            { text: mensajeUsuario },
            { quoted: msg },
          );
        } finally {
          setTimeout(() => {
            try {
              if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
              }
            } catch (e) {
              console.error("Error eliminando video temporal:", e);
            }
          }, 5000);

          try {
            await sock.sendMessage(from, { delete: msgEspera.key });
          } catch {}
        }
      }

      if (command.startsWith("/aibuscar")) {
        const query = body.replace(/^\/aibuscar/i, "").trim();

        if (!query) {
          await sock.sendMessage(
            from,
            {
              text: "❌ Debes escribir un texto después de /aibuscar.\n\n*Ejemplo:* /aibuscar CKan",
            },
            { quoted: msg },
          );
          continue;
        }

        const msgEspera = await sock.sendMessage(
          from,
          { text: `🔍 Buscando información sobre: *${query}*...` },
          { quoted: msg },
        );

        try {
          const resultado = await buscarEnGoogle(query);

          const sentMsg = await sock.sendMessage(
            from,
            {
              text: resultado,
              linkPreview: false,
              contextInfo: Marca_SicariOfc,
            },
            { quoted: msg },
          );

          await sock.sendMessage(from, {
            react: { text: "👍", key: sentMsg.key },
          });
        } catch (error) {
          console.error("Error en comando /aibuscar:", error);
          await sock.sendMessage(
            from,
            { text: "❌ Ocurrió un error al realizar la búsqueda." },
            { quoted: msg },
          );
        } finally {
          try {
            await sock.sendMessage(from, { delete: msgEspera.key });
          } catch {}
        }
      }

      if (command.startsWith("/aisticker")) {
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;

        const directImage = msg.message?.imageMessage;
        const quotedImage =
          quotedMsg?.imageMessage ||
          quotedMsg?.viewOnceMessage?.message?.imageMessage ||
          quotedMsg?.viewOnceMessageV2?.message?.imageMessage;

        if (!directImage && !quotedImage) {
          await sock.sendMessage(
            from,
            {
              text: "⚠️ *Debes enviar una imagen con el comando /aisticker o responder a una imagen existente.*",
            },
            { quoted: msg },
          );
          continue;
        }

        const msgEspera = await sock.sendMessage(
          from,
          { text: "⏳ Creando tu sticker, por favor espera..." },
          { quoted: msg },
        );

        try {
          let targetMsg;

          if (directImage) {
            targetMsg = msg;
          } else {
            targetMsg = {
              key: {
                remoteJid: from,
                id: contextInfo.stanzaId,
                participant: contextInfo.participant || sender,
              },
              message: quotedMsg,
            };
          }

          const buffer = await downloadMediaMessage(
            targetMsg,
            "buffer",
            {},
            { logger: pino({ level: "silent" }) },
          );

          if (!buffer) {
            throw new Error("No se pudo obtener el buffer de la imagen.");
          }

          const sticker = new Sticker(buffer, {
            pack: " ℹ [🤖] CREADO POR:\n • ↳ CobraKaiBot\n _ \n ℹ [🧑‍💻] PROPIETARIO:\n • ↳ SicarioOfc",
            author:
              " • ℹ️ [👤] HECHO POR:\n • ↳ CobraKaiBot\n _ \n • [☃️] ¡El mejor bot!",
            type: StickerTypes.FULL,
            quality: 70,
          });

          const stickerBuffer = await sticker.toBuffer();

          const sentMsg = await sock.sendMessage(
            from,
            { sticker: stickerBuffer },
            { quoted: msg },
          );

          await sock.sendMessage(from, {
            react: { text: "⭐", key: sentMsg.key },
          });
        } catch (error) {
          console.error("Error al generar sticker:", error);
          await sock.sendMessage(
            from,
            { text: "❌ Ocurrió un error al convertir la imagen en sticker." },
            { quoted: msg },
          );
        } finally {
          try {
            await sock.sendMessage(from, { delete: msgEspera.key });
          } catch {}
        }
      }

      if (command === "/toimg") {
        const isQuotedSticker =
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
            ?.stickerMessage;
        if (!isQuotedSticker) {
          await sock.sendMessage(
            from,
            {
              text: "⚠️ Responde a un sticker estático con /toimg para convertirlo en imagen.",
            },
            { quoted: msg },
          );
          continue;
        }

        try {
          const targetMsg = {
            message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
          };
          const buffer = await downloadMediaMessage(
            targetMsg,
            "buffer",
            {},
            { logger: pino({ level: "silent" }) },
          );
          await sock.sendMessage(
            from,
            { image: buffer, caption: "🖼️ Aquí tienes tu imagen:" },
            { quoted: msg },
          );
        } catch (e) {
          await sock.sendMessage(
            from,
            { text: "❌ No se pudo convertir el sticker." },
            { quoted: msg },
          );
        }
      }

      if (command === "/s" || command === "/stext") {
        const textoSticker = args.join(" ").trim();

        if (!textoSticker) {
          return sock.sendMessage(
            from,
            {
              text: "⚠️ Debes escribir un texto después del comando.\n\n*Ejemplo:* /s Ing Informático",
            },
            { quoted: msg },
          );
        }

        const msgEspera = await sock.sendMessage(
          from,
          { text: "⏳ Creando sticker de texto..." },
          { quoted: msg },
        );

        try {
          const imageBuffer = crearImagenTexto(textoSticker);

          const sticker = new Sticker(imageBuffer, {
            pack: " ℹ️ [🤖] CREADO POR:\n • ↳ CobraKaiBot\n _ \n ℹ️ [🧑‍💻] PROPIETARIO:\n • ↳ SicarioOfc",
            author:
              " • ℹ️ [👤] HECHO POR:\n • ↳ CobraKaiBot\n _ \n • [☃️] ¡El mejor bot!",
            type: StickerTypes.FULL,
            quality: 80,
          });

          const stickerBuffer = await sticker.toBuffer();

          const sentMsg = await sock.sendMessage(
            from,
            { sticker: stickerBuffer },
            { quoted: msg },
          );

          await sock.sendMessage(from, {
            react: { text: "🎨", key: sentMsg.key },
          });
        } catch (error) {
          console.error("Error en comando /s:", error);
          await sock.sendMessage(
            from,
            { text: "❌ Ocurrió un error al generar el sticker de texto." },
            { quoted: msg },
          );
        } finally {
          try {
            await sock.sendMessage(from, { delete: msgEspera.key });
          } catch {}
        }
      }

      const comandosAPKs = [
        "/mtmanag",
        "/mtmanagbet",
        "/apkeditorpro",
        "/apktoolm",
        "/pixellab",
        "/telegprem",
        "/teamzetpriv",
        "/base64pro",
      ];

      if (comandosAPKs.includes(command)) {
        const urlGistB64 =
          "aHR0cHM6Ly9naXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbS9wcm9ncmFtYWRvcjAyNC84MjNiZjA4ZjM0OGZhNGY0ZWMzODc5NDYxMjNiMTE3Zi9yYXcvYXBwc19jb25maWcuanNvbg==";

        const urlGist = Buffer.from(urlGistB64, "base64").toString("utf-8");

        const mapaComandos = {
          "/mtmanag": "mtmanager",
          "/mtmanagbet": "mtmanagerbeta",
          "/apkeditorpro": "apkeditorpro",
          "/apktoolm": "apktoolm",
          "/pixellab": "pixellab",
          "/telegprem": "telegrampremium",
          "/teamzetpriv": "teamzetasprivate",
          "/base64pro": "base64pro",
        };

        try {
          const res = await fetch(urlGist);
          if (!res.ok) {
            throw new Error(
              `Error al consultar el servidor Gist (HTTP ${res.status})`,
            );
          }

          const appsConfig = await res.json();
          const claveApp = mapaComandos[command];
          const appData = appsConfig[claveApp];

          if (appData) {
            const respuesta =
              `📱 *${appData.nombre}*\n\n` +
              `📝 *Descripción:*\n${appData.descripcion}\n\n` +
              `🔗 *Enlace de Descarga:*\n${appData.url}`;

            await sock.sendMessage(
              from,
              { text: respuesta, contextInfo: Marca_SicariOfc },
              { quoted: msg },
            );
          } else {
            await sock.sendMessage(
              from,
              { text: "⚠️ No se encontró la información para este comando." },
              { quoted: msg },
            );
          }
        } catch (error) {
          console.error("Error al obtener la configuración de apps:", error);
          await sock.sendMessage(
            from,
            {
              text: "❌ Ocurrió un error al obtener los enlaces desde el servidor.",
            },
            { quoted: msg },
          );
        }
      }

      if (["hola", "ola", "buenas", "hello"].includes(command)) {
        const textoHola = `┌───  *¡HOLA Y BIENVENIDO!*  ───┐
│
├  👋 ¡Hola, @${senderNumber}!
├  🤖 Soy *CobraKaiBot V1*
│
├───  *¿CÓMO EMPEZAR?*  ───
│
├  📌 Usa el comando */menu* para
│  ver la lista completa de comandos.
│
└────────────────────────┘`;

        await sock.sendMessage(
          from,
          {
            text: textoHola,
            mentions: [sender],
          },
          { quoted: msg },
        );
      }

      if (
        ["gracias", "Gracias", "grx", "ty", "thank you", "thanks", "arigato"].includes(
          command,
        )
      ) {
        const textoGracias = `┌───  *¡DE NADA!*  ───┐
│
├  🤝 ¡Es un placer ayudarte, @${senderNumber}!
├  🤖 Estamos para servirte en lo que necesites.
│
├───  *¿TE GUSTA EL BOT?*  ───
│
├  ☕ Si mi trabajo te es útil y deseas apoyar
│  el proyecto para mantenerlo 24/7 activo,
│  puedes invitarme un café con el comando:
│
├  👉 */payapalme*
│
└────────────────────────┘

_¡Tu apoyo nos ayuda a seguir trayendo nuevas funciones!_ 🚀`;

        await sock.sendMessage(
          from,
          {
            text: textoGracias,
            mentions: [sender],
          },
          { quoted: msg },
        );
      }

      if (["adios", "adiós", "Adios", "Adiós", "bye", "chao"].includes(command)) {
        const textoAdios = `┌───  *¡HASTA LUEGO!*  ───┐
│
├  👋 ¡Adiós, @${senderNumber}!
├  ✨ Gracias por usar *CobraKaiBot V1*
│
├  🚀 ¡Te esperamos de vuelta pronto!
│
└────────────────────────┘`;

        await sock.sendMessage(
          from,
          {
            text: textoAdios,
            mentions: [sender],
          },
          { quoted: msg },
        );
      }
    }
  });
}

connectToWhatsApp();
