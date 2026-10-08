import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useLang } from "../i18n";
import { ROMAN } from "../content";
import { TLink } from "./transition";
import { isDark, lenis, reduce, THEME_EVENT } from "../motion";

const LINKS = [["/firma", "firm"], ["/practica", "practice"], ["/equipo", "team"], ["/contacto", "contact"]] as const;
type VT = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

export default function Nav() {
  const { t, lang, setLang } = useLang();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const pill = useRef<HTMLSpanElement>(null);
  const seg = useRef<HTMLDivElement>(null);

  // Slide the language pill under the active option.
  useLayoutEffect(() => {
    const move = () => {
      const on = seg.current?.querySelector<HTMLElement>(`[data-lang="${lang}"]`);
      if (on && pill.current) { pill.current.style.width = on.offsetWidth + "px"; pill.current.style.transform = `translateX(${on.offsetLeft - 3}px)`; }
    };
    move();
    addEventListener("resize", move); document.fonts?.ready.then(move);
    return () => removeEventListener("resize", move);
  }, [lang]);

  useEffect(() => {
    if (open) {
      lenis?.stop();
      if (!reduce) gsap.fromTo("#menu li", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: "expo.out", delay: 0.2 });
    } else lenis?.start();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const next = isDark() ? "light" : "dark";
    const swap = () => {
      root.dataset.theme = next;
      try { localStorage.setItem("sf-theme", next); } catch { /* no storage */ }
      dispatchEvent(new Event(THEME_EVENT));
    };
    const doc = document as VT;
    if (!doc.startViewTransition || reduce) { swap(); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(swap).ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 900, easing: "cubic-bezier(.19,1,.22,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
  };

  const active = (to: string) => pathname.startsWith(to) ? "is-active" : "";

  return (
    <>
      <header className="nav" id="nav">
        <div className="wrap nav-in">
          <TLink to="/" className="brand" aria-label="Steliant Firma">
            <svg className="brand-seal" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
              <circle cx="20" cy="20" r="19" /><circle cx="20" cy="20" r="15.5" strokeDasharray="1 2" />
              <path d="M20 9v20M12 14h16M12 14l-3.5 8h7zM28 14l-3.5 8h7zM15 29h10" />
            </svg>
            <span className="i18n-fade"><b>Steliant Firma</b><small>{t.nav.tag}</small></span>
          </TLink>
          <ul className="nav-links i18n-fade">
            {LINKS.map(([to, k]) => <li key={to}><TLink to={to} className={active(to)}>{t.nav[k]}</TLink></li>)}
          </ul>
          <div className="nav-tools">
            <div className="seg" role="group" aria-label="Idioma / Language" ref={seg}>
              <span className="pill" ref={pill} />
              {(["es", "en"] as const).map((l) => (
                <button key={l} type="button" data-lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button type="button" className="icon-btn theme-btn" onClick={toggleTheme} aria-label={t.nav.theme}>
              <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" /></svg>
              <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
            </button>
            <TLink to="/contacto" className="btn btn-fill nav-cta magnetic"><span className="i18n-fade">{t.nav.cta}</span></TLink>
            <button type="button" className="icon-btn burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 8h16M4 16h16" /></svg>
            </button>
          </div>
        </div>
      </header>

      <nav className={`menu${open ? " is-open" : ""}`} id="menu" aria-label="Menu" aria-hidden={!open}>
        <button type="button" className="icon-btn menu-close" aria-label="Close" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <ol>
          <li><TLink to="/" onNavigate={() => setOpen(false)}><span>§ 0</span><b>{t.nav.home}</b></TLink></li>
          {LINKS.map(([to, k], i) => (
            <li key={to}><TLink to={to} onNavigate={() => setOpen(false)} className={active(to)}><span>§ {ROMAN[i]}</span><b>{t.nav[k]}</b></TLink></li>
          ))}
        </ol>
        <div className="menu-foot mono"><span>+1 (809) 555-0100</span><span>contacto@steliantfirma.com</span></div>
      </nav>
    </>
  );
}
