// lib/antiinsulto.js
// Utilidad de moderación para detectar lenguaje ofensivo

const PALABRAS_RESTRINGIDAS = [
  "estupid",
  "idiot",
  "imbec",
  "pendej",
  "puto",
  "puta",
  "mierda",
  "cabron",
  "zorra",
  "basura",
  "culer",
  "verga",
  "chinga",
  "malparid",
  "hijodeputa",
  "hdp",
];

export function FiltroAntiinsultoMsj(texto = "") {
  if (!texto || typeof texto !== "string") return false;

  const textoNormalizado = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return PALABRAS_RESTRINGIDAS.some((palabra) =>
    textoNormalizado.includes(palabra),
  );
}