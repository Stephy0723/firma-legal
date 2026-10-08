import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useLang } from "../i18n";
import { reduce } from "../motion";
import { TLink } from "./transition";

export default function Footer() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const giant = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduce) { giant.current?.style.setProperty("--fill", "100%"); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(giant.current, { "--fill": "0%" }, { "--fill": "100%", ease: "none", scrollTrigger: { trigger: giant.current, start: "top 98%", end: "bottom bottom", scrub: 0.5 } });
      gsap.fromTo(giant.current, { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: "footer", start: "top bottom", end: "bottom bottom", scrub: true } });
    });
    return () => ctx.revert();
  }, [pathname]);

  return (
    <footer>
      <div className="wrap">
        <div className="foot-top i18n-fade">
          <p className="mono">{t.foot.tag}</p>
          <nav className="foot-links" aria-label="Footer">
            <TLink to="/">{t.nav.home}</TLink>
            <TLink to="/firma">{t.nav.firm}</TLink>
            <TLink to="/practica">{t.nav.practice}</TLink>
            <TLink to="/equipo">{t.nav.team}</TLink>
            <TLink to="/contacto">{t.nav.contact}</TLink>
          </nav>
        </div>
        <div className="giant" ref={giant} aria-hidden="true">Steliant</div>
        <div className="foot-bottom mono i18n-fade"><span>© 2026 Steliant Firma</span><span>{t.foot.credit}</span></div>
      </div>
    </footer>
  );
}
