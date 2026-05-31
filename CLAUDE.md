# Quest Tracker ⚔️ — Dashboard de proyectos

## Qué es
Interfaz visual estilo JRPG pixel art (inspirada en Zelda NES) para centralizar y trackear el avance de todos los proyectos activos de Arternauta / El Joint. Los proyectos son "quests", el progreso se mide con corazones, XP, rupias y la Trifuerza.

## Stack
- HTML + CSS + JS puro (sin frameworks)
- Python para servir (`python3 -m http.server 3333`)
- `data/quests.json` — fuente de datos

## Cómo correr
```bash
cd ~/Projects/tools/quest-tracker
python3 -m http.server 3333
# abrir http://localhost:3333
```

## Proyectos activos a trackear
- **arternauta-content** — historias y recetas (blog Arternauta)
- **sparrow** — herramienta de aprobación de DMs Meta
- **i-robot** — bot de contenido BYD
- **clamp** — app Electron para referencias audiovisuales
- **scrappy-doh** — scraper de comentarios IG
- **videodb** — indexador de videos

## Estado actual
En desarrollo. Estructura base HTML/CSS/JS lista.
Próximo paso: conectar `data/quests.json` con el estado real de cada repo.
