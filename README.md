# Steliant Firma — plantilla premium para firmas legales

Rediseño de exhibición (rama `steliant-exhibicion-completa`). React 19 + Vite + TypeScript, sin backend.

## Qué incluye
- **Tema claro/oscuro** con transición circular desde el botón y preferencia recordada.
- **Español / inglés**: todos los textos viven en `src/content.ts` (`T.es` / `T.en`).
- **Responsive** mobile-first, tipografía fluida con `clamp()`.
- **Movimiento**: GSAP + ScrollTrigger, scroll suave con Lenis, balanza 3D con Three.js (carga diferida), cursor y botones magnéticos, revelado de imágenes con parallax. Respeta `prefers-reduced-motion`.

## Páginas
- `#/` Inicio · `#/firma` La Firma · `#/practica` Práctica · `#/practica/:area` detalle de cada área · `#/equipo` Equipo · `#/contacto` Contacto
- Transición de cortina entre páginas (`src/components/transition.tsx`).

## Estructura
- `src/App.tsx` — rutas.
- `src/pages/` — cada vista. `src/components/` — navegación, pie, cabeceras, testimonios.
- `src/i18n.tsx` — contexto de idioma.
- `src/motion.ts` — scroll suave, cursor y animaciones compartidas.
- `src/content.ts` — textos, imágenes y datos.
- `src/scene.ts` — escena 3D.
- `src/styles/main.scss` — tokens de color y estilos.

## Personalizar
- Colores: variables `--bg`, `--ink`, `--brass`… al inicio de `main.scss` (claro y oscuro).
- Fotos: URLs en `IMG` dentro de `src/content.ts` (Unsplash de muestra).

```bash
npm install
npm run dev
npm run build
```
