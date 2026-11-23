// Robot de búsqueda del Hogar de Julieth y Sergio.
// Revisa tucesion.com (cesiones) y Tu360 Bancolombia (nuevos y usados en Bogotá),
// filtra con los criterios de la familia y guarda las coincidencias en data/novedades.json
// y NOVEDADES.md. No usa Claude: corre gratis en GitHub Actions.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const DATA = path.join(RAIZ, "data");
const CRITERIOS = {
  area: [37, 50],
  nuevo: { max: 260e6 },          // proyectos VIS: precio "desde" hasta 260 M
  cesion: { maxTotal: 260e6 },    // costo total de la cesión hasta 260 M
  usado: { min: 100e6, max: 220e6 }
};
// Barrios y localidades del norte, nororiente y noroccidente de Bogotá
const ZONA_NORTE = new RegExp([
  "usaqu", "cedritos", "tober", "verbenal", "san crist[oó]bal norte", "codito", "lijac", "santa b[aá]rbara", "bella suiza", "country",
  "chic[oó]", "chapinero", "rosales", "emaus", "cabrera", "la carolina", "contador", "pasadena", "alhambra", "batán", "batan",
  "prado veraniego", "mazur", "puente largo", "niza", "colina", "suba", "compartir", "tibabuyes", "gaitana", "rinc[oó]n", "bilbao",
  "pinar", "tuna", "aures", "lisboa", "san jos[eé] de bavaria", "gratamira", "villa del prado", "britalia", "mirandela", "granada norte",
  "engativ", "bachu", "quirigua", "minuto de dios", "bochica", "garc[eé]s navas", "villas de granada", "normand", "boyac[aá] real",
  "santa helena", "floresta", "morato", "los andes", "alamos", "álamos", "ciudad hunza", "la española", "barrios unidos", "polo club",
  "rionegro", "san fernando", "doce de octubre", "12 de octubre", "metr[oó]polis", "j[uo]an xxiii", "alcázares", "alcazares", "la castellana",
  "san antonio noroccidental", "lagos de torca", "guaymaral", "nueva colina", "casablanca", "las villas", "villemar"
].join("|"), "i");

const hoy = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
const ahora = () => new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
const num = s => s ? Number(String(s).replace(/[^\d]/g, "")) : null;
const leer = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return d; } };
const slug = u => { let x = u.split("/").slice(-2, -1)[0] || u; try { x = decodeURIComponent(x); } catch {}
  return x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/^proyecto-de-vivienda-|^proyecto-/, "").replace(/[^a-z0-9-]/g, "").slice(-80); };
const enArea = a => a != null && a >= CRITERIOS.area[0] && a <= CRITERIOS.area[1];

// Solo se cargan los recursos de los sitios revisados: la publicidad y las estadísticas
// mantienen la página "ocupada" y hacían que el robot se quedara esperando.
const PERMITIDOS = /(^|\.)(tucesion\.com|inmobiliariotu360\.bancolombia\.com|mkpinmobiliarioco\.vtexassets\.com|mkpinmobiliarioco\.vteximg\.com\.br)$/;
async function prepararPagina(page) {
  await page.route("**/*", route => {
    let host = ""; try { host = new URL(route.request().url()).hostname; } catch {}
    const tipo = route.request().resourceType();
    if (!PERMITIDOS.test(host) || tipo === "media" || tipo === "font") return route.abort();
    return route.continue();
  });
}
async function cargar(page, url, selector) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  if (selector) await page.waitForSelector(selector, { timeout: 60000 }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
}
async function desplazar(page, veces = 12) {
  for (let i = 0; i < veces; i++) { await page.mouse.wheel(0, 1800); await page.waitForTimeout(700); }
}

/* ---------- tucesion.com ---------- */
async function buscarCesiones(page) {
  await cargar(page, "https://tucesion.com/cessions", 'a[href*="/listings/CES-"]');
  await desplazar(page, 10);
  const tarjetas = await page.evaluate(() => {
    const out = new Map();
    document.querySelectorAll('a[href*="/listings/CES-"]').forEach(a => {
      let el = a;
      for (let i = 0; i < 8 && el && !/TOTAL ESTIMADO/i.test(el.innerText || ""); i++) el = el.parentElement;
      const codigo = (a.href.match(/CES-[A-Z0-9]+/) || [])[0];
      if (codigo && el && !out.has(codigo)) out.set(codigo, { codigo, url: a.href.split("?")[0], texto: el.innerText });
    });
    return [...out.values()];
  });
  const res = [];
  for (const t of tarjetas) {
    const lineas = t.texto.split("\n").map(s => s.trim()).filter(Boolean);
    const iCod = lineas.findIndex(l => l.includes(t.codigo));
    const nombre = lineas[iCod + 1] || t.codigo;
    const area = (t.texto.match(/([\d.,]+)\s*m²/) || [])[1];
    const iPrecio = lineas.findIndex(l => /PRECIO DE LA CESI/i.test(l));
    const iTotal = lineas.findIndex(l => /TOTAL ESTIMADO/i.test(l));
    res.push({
      codigo: t.codigo, url: t.url, nombre,
      bogota: /bogot/i.test(t.texto),
      area: area ? Number(area.replace(/\./g, "").replace(",", ".")) : null,
      precioCesion: iPrecio >= 0 ? num(lineas[iPrecio + 1]) : null,
      total: iTotal >= 0 ? num(lineas[iTotal + 1]) : null
    });
  }
  const coinciden = res.filter(c => c.bogota && enArea(c.area) && c.total && c.total <= CRITERIOS.cesion.maxTotal);
  // Fecha de publicación y constructora desde la ficha de cada coincidencia
  for (const c of coinciden) {
    try {
      await cargar(page, c.url);
      const txt = await page.evaluate(() => document.body.innerText);
      const dias = (txt.match(/Publicada hace (\d+) d[ií]a/i) || [])[1];
      const horas = /Publicada hace \d+ hora|Publicada hoy/i.test(txt);
      if (dias || horas) { const d = new Date(); d.setDate(d.getDate() - (dias ? +dias : 0)); c.fechaPub = d.toLocaleDateString("en-CA", { timeZone: "America/Bogota" }); }
      c.constructora = (txt.match(/(Constructora [A-ZÁÉÍÓÚ][\wáéíóúñ]+(?: [A-ZÁÉÍÓÚ][\wáéíóúñ]+)?)/) || [])[1] || "";
      c.entrega = (txt.match(/Fecha de entrega:?\s*([\d-/]+)/i) || [])[1] || "";
    } catch { /* la ficha no cargó: se guarda sin fecha */ }
  }
  return { revisados: res.length, items: coinciden.map(c => ({
    id: "auto-" + c.codigo.toLowerCase(), tipo: "cesion", nombre: `${c.nombre} (cesión ${c.codigo})`, constructora: c.constructora || "",
    zona: "Bogotá", area: c.area, precio: c.total, fechaPub: c.fechaPub || "", fuente: "tucesion.com (robot)", url: c.url,
    subsidios: c.total <= 262.6e6 ? "Posible VIS: confirmar con la constructora" : "",
    nota: `Precio de la cesión ${c.precioCesion?.toLocaleString("es-CO") ?? "?"} COP; total estimado ${c.total?.toLocaleString("es-CO")} COP.${c.entrega ? " Entrega: " + c.entrega + "." : ""}`
  })) };
}

/* ---------- Tu360 Bancolombia ---------- */
async function buscarTu360(page, estado) {
  const url = `https://inmobiliariotu360.bancolombia.com/venta/apartamentos/bogota-d-c-/${estado}?map=category-1,category-2,ciudad,estado`;
  await cargar(page, url, 'section[class*="product-summary"]');
  try { // ordenar por "Lo más nuevo"
    await page.locator('[class*="orderByButton"]').first().click({ timeout: 10000 });
    await page.waitForTimeout(600);
    await page.locator('[class*="orderByOptionItem"]', { hasText: "Lo más nuevo" }).first().click({ timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(2500);
  } catch { /* si no se puede ordenar, se revisa el orden por defecto */ }
  const vistos = new Map();
  for (let ronda = 0; ronda < 8; ronda++) {
    await desplazar(page, 6);
    const lote = await page.evaluate(() => [...document.querySelectorAll('section[class*="product-summary"]')].map(e => ({
      texto: e.innerText, url: ((e.closest("a") || e.querySelector("a") || {}).href || "").split("?")[0]
    })));
    lote.forEach(x => { if (x.url && !vistos.has(x.url)) vistos.set(x.url, x.texto); });
    const mas = page.locator('[class*="buttonShowMore"] button, button:has-text("Mostrar más resultados"), button:has-text("Ver más")').first();
    if (await mas.count()) { try { await mas.click({ timeout: 5000 }); await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {}); } catch { break; } } else if (ronda > 1) break;
  }
  const items = [];
  for (const [u, texto] of vistos) {
    const partes = texto.split("\n").map(s => s.trim()).filter(Boolean);
    const iEstado = partes.findIndex(p => /^(Usado|Nuevo)$/i.test(p));
    if (iEstado < 0 || partes[iEstado].toLowerCase() !== estado) continue;
    const titulo = partes[iEstado + 1] || "";
    const quien = partes.slice(0, iEstado).filter(p => !/financiado/i.test(p))[0] || "";
    const area = Number(((texto.match(/(?:Desde\s*)?([\d.]+)\s*m²/i) || [])[1] || "").replace(/\.(?=\d{3}\b)/g, "")) || null;
    const precio = num((texto.match(/\$\s*([\d.]+)/) || [])[1]);
    if (!precio) continue;
    if (estado === "usado") {
      if (!(enArea(area) && precio >= CRITERIOS.usado.min && precio <= CRITERIOS.usado.max && ZONA_NORTE.test(titulo))) continue;
      const barrio = titulo.replace(/^Apartamento en venta en bogot[aá],? d\.?c\.?,?\s*/i, "");
      items.push({ id: "auto-tu360-" + slug(u), tipo: "usado", nombre: `Apartamento en ${barrio}`,
        constructora: quien, zona: barrio, area, precio, fechaPub: "", fuente: "Tu360 Bancolombia (robot)", url: u,
        subsidios: "Usado: crédito/leasing, cesantías, ahorro", nota: (texto.match(/(\d+) hab/) || [])[0] ? `${texto.match(/(\d+) hab/)[1]} habitaciones.` : "" });
    } else {
      if (!(precio <= CRITERIOS.nuevo.max && area && area <= CRITERIOS.area[1])) continue;
      items.push({ id: "auto-tu360-" + slug(u), tipo: "nuevo", nombre: titulo.replace(/\s*proyecto de vivienda\s*/i, "").replace(/^\w/, c => c.toUpperCase()),
        constructora: quien, zona: "Bogotá", area, precio, fechaPub: "", fuente: "Tu360 Bancolombia (robot)", url: u,
        subsidios: precio <= 262.6e6 ? "Precio en rango VIS: confirmar subsidio distrital y caja" : "",
        nota: `Desde ${area} m² y desde $${precio.toLocaleString("es-CO")}.` });
    }
  }
  // Dirección desde la ficha de cada coincidencia (para ubicarla en el mapa del tablero)
  for (const it of items) {
    try {
      await page.goto(it.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForFunction(() => /ubicad[oa] en|#\s*\d+\s*-\s*\d+/i.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
      const txt = await page.evaluate(() => document.body.innerText);
      const frase = (txt.match(/ubicad[oa] en (?:la |el )?([^.\n]{5,120})/i) || [])[1] || "";
      const dir = (frase.match(/(?:avenida |av\.? )?(?:calle|carrera|cra|kr|cl|diagonal|transversal|ak|ac)\.?\s*\d+[^,\n]{0,40}?#\s*\d+\s*[-–]?\s*\d*(?:\s*(?:sur|este))?/i)
        || txt.match(/(?:avenida |av\.? )?(?:calle|carrera|cra|kr|cl|diagonal|transversal)\.?\s*\d+[^,\n]{0,30}?#\s*\d+\s*[-–]\s*\d+(?:\s*(?:sur|este))?/i) || [])[0];
      if (dir) it.direccion = dir.replace(/\s+/g, " ").trim();
    } catch { /* sin dirección: el tablero lo ubica por el nombre del barrio */ }
  }
  return { revisados: vistos.size, items };
}

/* ---------- Principal ---------- */
(async () => {
  fs.mkdirSync(DATA, { recursive: true });
  const vistosPrev = leer(path.join(DATA, "vistos.json"), {});
  const navegador = await chromium.launch();
  const page = await navegador.newPage({ viewport: { width: 1366, height: 900 }, locale: "es-CO",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" });
  await prepararPagina(page);
  const fuentes = {};
  const resultados = [];
  for (const [nombre, fn] of [["cesiones", () => buscarCesiones(page)], ["usados", () => buscarTu360(page, "usado")], ["nuevos", () => buscarTu360(page, "nuevo")]]) {
    try { const r = await fn(); fuentes[nombre] = { revisados: r.revisados, coincidencias: r.items.length }; resultados.push(...r.items); }
    catch (e) { fuentes[nombre] = { error: String(e.message || e).split("\n")[0].replace(/\|/g, "/").slice(0, 160) }; }
  }
  await navegador.close();

  const fecha = hoy();
  const vistos = { ...vistosPrev };
  const nuevas = [];
  resultados.forEach(it => {
    if (!vistos[it.id]) { vistos[it.id] = fecha; nuevas.push(it); }
    it.detectado = vistos[it.id];
    if (!it.fechaPub) it.fechaPub = vistos[it.id]; // sin fecha publicada, se usa el día en que el robot lo vio
  });
  resultados.sort((a, b) => b.detectado.localeCompare(a.detectado));

  // Las coincidencias anteriores que ya no aparecen se conservan (pueden estar fuera de la ventana revisada)
  const prev = leer(path.join(DATA, "novedades.json"), { items: [] }).items || [];
  const ids = new Set(resultados.map(r => r.id));
  const todos = resultados.concat(prev.filter(p => !ids.has(p.id)).map(p => ({ ...p, vigente: false })));

  fs.writeFileSync(path.join(DATA, "vistos.json"), JSON.stringify(vistos, null, 2));
  fs.writeFileSync(path.join(DATA, "novedades.json"), JSON.stringify({ actualizado: ahora(), fuentes, nuevas: nuevas.map(n => n.id), items: todos }, null, 2));

  const fila = it => `| ${it.detectado} | ${{ nuevo: "Nuevo", usado: "Usado", cesion: "Cesión" }[it.tipo]} | [${it.nombre}](${it.url}) | ${it.zona} | ${it.area ?? "—"} m² | $${(it.precio || 0).toLocaleString("es-CO")} |${it.vigente === false ? " ya no aparece |" : " |"}`;
  const md = [
    "# Novedades de la búsqueda", "",
    `Última revisión del robot: **${ahora()}** (hora de Bogotá).`, "",
    "| Fuente | Anuncios revisados | Coincidencias |", "|---|---|---|",
    ...Object.entries(fuentes).map(([k, v]) => `| ${k} | ${v.revisados ?? "error"} | ${v.coincidencias ?? (v.error || "")} |`), "",
    nuevas.length ? `## Nuevas en esta revisión (${nuevas.length})` : "## Sin coincidencias nuevas en esta revisión", "",
    ...(nuevas.length ? ["| Detectado | Tipo | Anuncio | Zona | Área | Precio | |", "|---|---|---|---|---|---|---|", ...nuevas.map(fila), ""] : []),
    "## Todas las coincidencias", "",
    "| Detectado | Tipo | Anuncio | Zona | Área | Precio | |", "|---|---|---|---|---|---|---|", ...todos.map(fila), "",
    "Para pasarlas al tablero de Sarita: abre `data/novedades.json`, copia todo y pégalo en el recuadro **Novedades del robot** del tablero.", ""
  ].join("\n");
  fs.writeFileSync(path.join(RAIZ, "NOVEDADES.md"), md);

  if (nuevas.length) {
    fs.writeFileSync(path.join(DATA, "aviso.md"), [
      `Sarita encontró ${nuevas.length} opción(es) nueva(s) para mami Julieth y papi Sergio:`, "",
      ...nuevas.map(n => `- **${n.nombre}** · ${n.zona} · ${n.area ?? "?"} m² · $${(n.precio || 0).toLocaleString("es-CO")} · [ver anuncio](${n.url})`), "",
      "Revisen `NOVEDADES.md` y pasen las que les gusten al tablero de Sarita."
    ].join("\n"));
  }
  console.log(JSON.stringify({ fuentes, nuevas: nuevas.length, total: todos.length }));
})();
