# Hogar de Julieth y Sergio — indicaciones para Claude

## Idioma

- Todo en **español latino** (colombiano): respuestas, textos del tablero, mensajes de commit y pull requests.

## Flujo de trabajo en Git

- **Sergio autorizó subir los cambios directamente a `main`** (22 de noviembre de 2026). No abrir pull requests salvo que lo pidan.
- Antes de subir: `git pull --rebase origin main`, porque el robot guarda resultados en `main` cada 2 horas.
- Después de cada cambio: publicar el tablero (artefacto) y actualizar el respaldo en Google Drive (carpeta "HOGAR JULIETH Y SERGIO", id `1WVfzRm0gGzf6Tggb778qbJSi0Gxgn6SL`), mandando a la papelera la versión anterior del archivo.

## El proyecto

- **Tablero de Sarita** (`hogar-sarita.html`), publicado en https://claude.ai/artifact/7nVwAbcUnwYZ63UHLTCkai. Guarda las opciones en su base de datos (colecciones `inmuebles` y `busquedas`).
- **Robot** (`scripts/buscar.cjs` + `.github/workflows/busqueda.yml`): corre cada 2 horas en GitHub Actions y revisa tucesion.com, Tu360 Bancolombia (nuevos y usados) y las constructoras Bolívar, Marval, Ingeurbe, Cusezar y Artis Urbano. No usa Claude.
- **Script de Google** (`scripts/sincronizar-drive.gs`): ya instalado por la familia; copia `data/novedades.json` a Drive (`novedades-robot.json`) cada hora. El tablero lo lee con el conector de Google Drive y agrega solo lo nuevo.

## Criterios de búsqueda

- **Nuevo (VIS o cesión):** 210 a 260 millones COP, 37 a 50 m², en Bogotá, que acepte subsidios (Mi Casa en Bogotá, caja de compensación, Mi Casa Ya).
- **Usado:** 100 a 220 millones COP, 37 a 50 m², en el norte, nororiente o noroccidente de Bogotá.

## Sarita

- Hija de 5 años: pelo castaño claro, ojos entre verdes y marrones claros, princesa radiante y guerrera.
- **Siempre saluda primero a mamá Julieth y después a papá Sergio**, y les deja todas las decisiones a ellos dos.
- Al tocar "Llamar a Sarita": **sin voz y sin burbuja en la escena**; solo aparece el chat con su saludo.

## Tokens

- La búsqueda automática no debe gastar tokens de Claude. Solo los gastan el chat con Sarita y las conversaciones con Claude.
