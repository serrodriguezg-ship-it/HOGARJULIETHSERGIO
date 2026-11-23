/**
 * Sincronizador del Hogar de Julieth y Sergio (Google Apps Script, gratis).
 *
 * Copia cada hora los resultados del robot de GitHub (data/novedades.json)
 * al archivo "novedades-robot.json" de la carpeta de Drive "HOGAR JULIETH Y SERGIO".
 * El tablero de Sarita lee ese archivo con el conector de Google Drive y agrega
 * solo las opciones nuevas. No usa Claude ni gasta tokens.
 *
 * Instalación (una sola vez):
 *  1. Abran https://script.google.com con su cuenta de Google y creen un proyecto nuevo.
 *  2. Borren el contenido y peguen todo este archivo. Guarden.
 *  3. Solo si el repositorio de GitHub es PRIVADO: en "Configuración del proyecto" (engranaje) →
 *     "Propiedades de la secuencia de comandos", agreguen GITHUB_TOKEN con un token de GitHub
 *     de solo lectura (Fine-grained, permiso "Contents: Read-only" sobre este repositorio).
 *     Si el repositorio es público (como ahora), no hace falta.
 *  4. Arriba elijan la función "instalar" y toquen "Ejecutar". Acepten los permisos.
 *     Listo: queda programado cada hora.
 */
const REPO = "serrodriguezg-ship-it/HOGARJULIETHSERGIO";
const RAMA = "main";
const CARPETA_ID = "1WVfzRm0gGzf6Tggb778qbJSi0Gxgn6SL"; // HOGAR JULIETH Y SERGIO
const NOMBRE = "novedades-robot.json";

function sincronizar() {
  const token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  // Repositorio público: se lee el archivo directo (raw), que no tiene el límite de 60 consultas por hora
  // que la API de GitHub aplica a las direcciones compartidas de Google. Con token (repositorio privado) se usa la API.
  const url = token
    ? "https://api.github.com/repos/" + REPO + "/contents/data/novedades.json?ref=" + RAMA
    : "https://raw.githubusercontent.com/" + REPO + "/" + RAMA + "/data/novedades.json?t=" + Date.now();
  const headers = { "User-Agent": "hogar-sarita" };
  if (token) { headers.Authorization = "Bearer " + token; headers.Accept = "application/vnd.github.raw+json"; }
  const r = UrlFetchApp.fetch(url, { headers: headers, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) {
    throw new Error("GitHub respondió " + r.getResponseCode() + (token ? ". Revisen GITHUB_TOKEN." : ". Si el repositorio volvió a ser privado, agreguen GITHUB_TOKEN.") + " " + r.getContentText().slice(0, 200));
  }
  const texto = r.getContentText("UTF-8");
  JSON.parse(texto); // si no es JSON válido, no se toca el archivo de Drive
  const carpeta = DriveApp.getFolderById(CARPETA_ID);
  const archivos = carpeta.getFilesByName(NOMBRE);
  if (archivos.hasNext()) {
    const f = archivos.next();
    if (f.getBlob().getDataAsString("UTF-8") !== texto) f.setContent(texto);
  } else {
    carpeta.createFile(NOMBRE, texto, MimeType.PLAIN_TEXT);
  }
}

function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("sincronizar").timeBased().everyHours(1).create();
  sincronizar();
}
