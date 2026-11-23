# Hogar de Julieth y Sergio

Búsqueda de apartamento en Bogotá, con Sarita al mando.

- **Tablero de Sarita (artefacto):** https://claude.ai/artifact/7nVwAbcUnwYZ63UHLTCkai
- **Código del tablero:** `hogar-sarita.html`
- **Respaldo de datos (proyectos, apartamentos y bitácora):** `data/respaldo.json`

## Qué buscamos

| | Nuevo (VIS o cesión) | Usado |
|---|---|---|
| Presupuesto | 210 a 260 millones COP | 100 a 220 millones COP |
| Área | 37 a 50 m² | 37 a 50 m² |
| Zona | Bogotá | Norte, nororiente y noroccidente |
| Subsidios | Mi Casa en Bogotá (Secretaría del Hábitat), caja de compensación, Mi Casa Ya si aplica | Crédito o leasing, cesantías, ahorro |
| Dónde | Constructoras, portales VIS, https://tucesion.com/ | https://inmobiliariotu360.bancolombia.com/ |

Tope VIS 2026: 150 SMMLV ≈ $262,6 millones (SMMLV 2026 ≈ $1.750.905). El techo de 260 millones para nuevo queda justo debajo del tope VIS.

## Resultado de la primera búsqueda (22 de noviembre de 2026)

**Nuevo VIS (precios "desde" de portales; confirmar en sala de ventas):**

| Proyecto | Constructora | Zona | Área | Desde |
|---|---|---|---|---|
| Urbania Eco | Constructora Capital | Fontibón – Las Brisas | 39,9–40,7 m² | $225.670.000 |
| Almendros Norte | Por confirmar | Suba – Camino Verde | 40 m² | $235.400.000 |
| La Salle Loira | Marval (por confirmar) | Ciudad La Salle (norte) | 40 m² | $212.550.000 |
| Ciudad La Salle Lyon II | Marval | Norte | s. d. | $258.748.000 |
| Florecer | Constructora Capital | Bosa | s. d. | $207.580.000 |
| TRIVENTTO | Por confirmar | Eduardo Santos (centro) | s. d. | Oferta Preferente |

**Cesiones (tucesion.com):** hay 15 cesiones activas en todo el país. Ninguna de Bogotá es VIS dentro del rango. La más cercana es Capella Tramonte (Constructora Bolívar, San José de Bavaria): 43 m² privados, total estimado $279,8 millones, publicada el 27 de octubre de 2026.

**Usados (Tu360, noroccidente):** dos apartamentos en Compartir (Suba): 48 m² por $217 millones y 50 m² por $222 millones. Los filtros de precio y zona del sitio no se aplican bien, así que la revisión se hizo anuncio por anuncio.

## Búsqueda automática cada 2 horas (sin gastar tokens)

La búsqueda de nuevo y usado es prioritaria, así que la hace un **robot gratuito de GitHub Actions**, no Claude. Por eso no consume el plan.

- **Qué revisa:** cesiones en tucesion.com; apartamentos nuevos y usados de Bogotá en Tu360 Bancolombia; y los proyectos en Bogotá de las páginas de las constructoras **Bolívar, Marval, Ingeurbe, Cusezar y Artis Urbano** (cada una en su propio navegador, para que una falla no detenga a las demás). Amarilo, Constructora Capital, Prodesa y Urbansa no se dejan leer por un robot (protección anti-robots o páginas que cargan de otra forma); muchos de sus proyectos igual aparecen en Tu360. Para Las Galias y Buen Vivir no se encontró un sitio con lista de proyectos.
- **Cada cuánto:** cada 2 horas (12 veces al día), a la 1:17, 3:17, 5:17, 7:17, 9:17 y 11:17, a. m. y p. m., hora de Bogotá. También se puede correr a mano desde la pestaña **Actions → Búsqueda automática de apartamento → Run workflow**.
- **Filtros:** nuevo hasta 260 M; cesión con costo total hasta 260 M; usado de 100 a 220 M en el norte, nororiente o noroccidente; todo entre 37 y 50 m².
- **Resultados:** `NOVEDADES.md` (para leer) y `data/novedades.json` (para el tablero). `data/vistos.json` guarda el día en que el robot vio cada anuncio por primera vez; si el sitio no publica la fecha, ese día se usa como fecha de publicación.
- **Aviso:** cuando hay algo nuevo, el robot abre un *issue* en GitHub, que llega por correo y a la app de GitHub.
- **Pasarlo al tablero:** copien `data/novedades.json` y péguenlo en el recuadro **Novedades del robot** del tablero. Las opciones que ya aceptaron o descartaron no se tocan.

### Novedades al tablero, solas (sin tokens)

1. El robot de GitHub deja sus resultados en `data/novedades.json` cada 2 horas.
2. Un script gratuito de Google, `scripts/sincronizar-drive.gs`, que corre en los servidores de Google, copia cada hora ese archivo a la carpeta de Drive **HOGAR JULIETH Y SERGIO** con el nombre `novedades-robot.json`.
3. Al abrir el tablero de Sarita, la página lee ese archivo con el conector de **Google Drive** de su cuenta de Claude y agrega a "Por revisar" solo las opciones nuevas. Lo que ya aceptaron, descartaron o mandaron a la papelera no se toca. El botón **"Traer novedades ahora"** hace lo mismo a mano.

**Instalar el script de Google (una sola vez):**

1. Abran https://script.google.com con su cuenta de Google y toquen **Nuevo proyecto**.
2. Borren lo que aparece, peguen todo el contenido de `scripts/sincronizar-drive.gs` y guarden.
3. **Solo si el repositorio de GitHub es privado:** vayan a ⚙️ **Configuración del proyecto → Propiedades de la secuencia de comandos** y agreguen la propiedad `GITHUB_TOKEN` con un token de GitHub de solo lectura (Fine-grained token, permiso "Contents: Read-only" sobre este repositorio).
4. Arriba elijan la función **instalar** y toquen **Ejecutar**. Acepten los permisos que pide Google. Desde ahí queda programado cada hora.

La primera vez que abran el tablero después de esto, claude.ai les pedirá permiso para que la página use Google Drive. Acepten una sola vez.

**Importante:** GitHub solo corre las tareas programadas desde la rama principal (`main`). Hay que unir esta rama a `main` para que el robot arranque.

Solo gastan tokens el chat con Sarita y las búsquedas que se le pidan directamente a Claude. Se recomienda pedirle a Claude, una vez al mes, revisar proyectos de constructoras que no estén en Tu360.

### Primera corrida del robot (22 de noviembre de 2026)

13 proyectos nuevos con precio "desde" en rango VIS en Tu360: Rosa Violeta Ciudad Rosales, Colina Reservado Club House, Prisma, Estación Fontibón, Senderos de Fontibón, Turín, San Gabriel, Andalucía y Alicante (Hacienda El Otoño, Lagos de Torca), Ciruelo (Hacienda El Bosque, Lagos de Torca), L80, Moratti Ciudad Hayuelos y Portal de Claretiano. Ver detalles en `NOVEDADES.md`.

## Cómo habla Sarita

- Siempre saluda primero a su mamá Julieth y después a su papá Sergio.
- Se dirige a los dos juntos y les recuerda que las decisiones son de ellos.
- El chat "Hablar con Sarita" está justo debajo de las escenas, en un recuadro destacado.
- Hay un botón flotante para llamar a Sarita desde cualquier parte de la página.
- El calendario es desplegable y señala la fecha de hoy.
- Toda la página cambia de ambiente según la hora de Bogotá: madrugada, mañana, mediodía, tarde, noche y medianoche.
- El reloj muestra la hora de Bogotá en formato de 12 horas, con a. m. y p. m.
- **Mapa de Bogotá:** dibujo de las 19 localidades urbanas, coloreadas por sector, con las zonas de búsqueda de usado marcadas. Cada apartamento es un punto (verde nuevo, rosado cesión, naranja usado); al tocarlo se ve su información y se puede aceptar, descartar o corregir la localidad. Los puntos se ubican por la dirección (el robot la toma de la ficha de Tu360) o por el nombre del barrio.
- **Papelera de apartamentos:** lo que se elimina en "Proyectos y apartamentos" va a la papelera. Desde allí se puede devolver (vuelve al mismo grupo en que estaba) o eliminar definitivamente con doble toque. También se puede vaciar toda la papelera. El robot no vuelve a traer lo que está en la papelera.

## Notas técnicas

- El tablero guarda los datos en la base de datos del artefacto (colecciones `inmuebles` y `busquedas`).
- El calendario cubre 1900–2099 con festivos colombianos (Ley Emiliani desde 1984) y Semana Santa.
- El chat con Sarita usa Claude desde la página; si no está disponible, Sarita responde con consejos fijos.
