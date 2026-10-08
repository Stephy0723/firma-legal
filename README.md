# Steliant Firma — plantilla premium para firmas legales

Rediseño de exhibición (rama `steliant-exhibicion-completa`). React 19 + Vite + TypeScript, sin backend.

## Qué incluye
- **Tema claro/oscuro** con transición circular desde el botón y preferencia recordada.
- **Español / inglés**: todos los textos viven en `src/content.ts` (`T.es` / `T.en`).
- **Responsive** mobile-first, tipografía fluida con `clamp()`.
- **Movimiento**: GSAP + ScrollTrigger, scroll suave con Lenis, balanza 3D con Three.js (carga diferida), cursor y botones magnéticos, revelado de imágenes con parallax. Respeta `prefers-reduced-motion`.

## Estructura
- `src/App.tsx` — marcado de la página.
- `src/content.ts` — textos, imágenes y datos.
- `src/experience.ts` — idioma, tema, animaciones e interacciones.
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
