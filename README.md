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

## Cada cuánto buscar

Para no gastar el plan, una búsqueda de Claude por fuente y nada más:

1. **Cesiones (tucesion.com):** cada 15 días. Hay pocas y cambian despacio.
2. **Usados en Tu360:** una vez por semana, ordenando por "Lo más nuevo".
3. **Proyectos VIS nuevos:** una vez al mes, y antes de cada feria (Expovivienda) o apertura de Oferta Preferente.
4. **Subsidios:** cada enero, cuando cambia el salario mínimo.

Lo que se encuentre se registra en el tablero de Sarita, y Sarita lo puede comentar en el chat sin hacer búsquedas nuevas.

## Cómo habla Sarita

- Siempre saluda primero a su mamá Julieth y después a su papá Sergio.
- Se dirige a los dos juntos y les recuerda que las decisiones son de ellos.
- El chat "Hablar con Sarita" está justo debajo de las escenas, en un recuadro destacado.
- Hay un botón flotante para llamar a Sarita desde cualquier parte de la página.
- El calendario es desplegable y señala la fecha de hoy.

## Notas técnicas

- El tablero guarda los datos en la base de datos del artefacto (colecciones `inmuebles` y `busquedas`).
- El calendario cubre 1900–2099 con festivos colombianos (Ley Emiliani desde 1984) y Semana Santa.
- El chat con Sarita usa Claude desde la página; si no está disponible, Sarita responde con consejos fijos.
