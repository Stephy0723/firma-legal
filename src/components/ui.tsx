import { useEffect, useRef } from "react";
import { THEME_EVENT } from "../motion";

export const Arrow = () => (
  <svg className="arr" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
);
export const Diag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19L19 5M8 5h11v11" /></svg>
);
export const Img = ({ src, alt = "", eager = false }: { src: string; alt?: string; eager?: boolean }) => (
  <img className="ph" src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />
);

/** Engraved guilloché rosette (banknote / notarial-seal pattern), redrawn on resize and theme change. */
export function Guilloche({ seed }: { seed: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const draw = () => {
      const brass = getComputedStyle(document.documentElement).getPropertyValue("--brass-hi").trim();
      const dpr = Math.min(devicePixelRatio || 1, 2), w = c.clientWidth || 300, h = c.clientHeight || 375;
      c.width = w * dpr; c.height = h * dpr;
      const g = c.getContext("2d"); if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46;
      ([[R, R * 0.12, 7 + seed * 2, 0.9], [R * 0.8, R * 0.1, 11 + seed, 0.7]] as const).forEach(([rad, amp, n, a]) => {
        g.strokeStyle = brass; g.globalAlpha = a * 0.6; g.lineWidth = 0.6;
        for (let p = 0; p < 14; p++) {
          g.beginPath();
          for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.01) {
            const r = rad + amp * Math.sin(n * t + p * 0.45) + amp * 0.4 * Math.cos((n + 3) * t - p * 0.3);
            const x = cx + r * Math.cos(t), y = cy + r * Math.sin(t);
            if (t) g.lineTo(x, y); else g.moveTo(x, y);
          }
          g.stroke();
        }
      });
    };
    draw();
    const ro = new ResizeObserver(draw); ro.observe(c);
    addEventListener(THEME_EVENT, draw);
    return () => { ro.disconnect(); removeEventListener(THEME_EVENT, draw); };
  }, [seed]);
  return <canvas ref={ref} aria-hidden="true" />;
}
