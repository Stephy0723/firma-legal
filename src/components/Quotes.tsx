import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang, Words } from "../i18n";
import { CLIENTS, IMG } from "../content";
import { reduce } from "../motion";
import { Img } from "./ui";

const QDUR = 7;

export default function Quotes() {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const api = useRef<{ go: (n: number) => void }>({ go: () => {} });

  useLayoutEffect(() => {
    const el = root.current!;
    let qi = 0, started = false;
    const ctx = gsap.context(() => {
      const items = [...el.querySelectorAll<HTMLElement>(".q-item")], bars = [...el.querySelectorAll<HTMLElement>(".q-bars b")];
      const go = (n: number) => {
        const prev = items[qi]; qi = (n + items.length) % items.length; const cur = items[qi];
        bars.forEach((b, k) => { gsap.killTweensOf(b); gsap.set(b, { scaleX: k < qi ? 1 : 0 }); });
        if (reduce) { items.forEach((i) => i.classList.remove("is-active")); cur.classList.add("is-active"); gsap.set(bars[qi], { scaleX: 1 }); return; }
        if (prev !== cur && started) gsap.to(prev.querySelectorAll(".w"), { y: -20, opacity: 0, stagger: 0.008, duration: 0.4, ease: "power2.in", onComplete: () => prev.classList.remove("is-active") });
        else if (prev !== cur) prev.classList.remove("is-active");
        cur.classList.add("is-active");
        gsap.fromTo(cur.querySelectorAll(".w"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.018, duration: 0.9, ease: "expo.out", delay: prev !== cur && started ? 0.35 : 0 });
        gsap.fromTo(cur.querySelector(".q-who"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6 });
        gsap.fromTo(bars[qi], { scaleX: 0 }, { scaleX: 1, duration: QDUR, ease: "none", onComplete: () => go(qi + 1) });
        started = true;
      };
      api.current.go = (n) => go(n === 1 ? qi + 1 : qi - 1);
      ScrollTrigger.create({ trigger: el, start: "top 65%", once: true, onEnter: () => go(0) });
      if (!reduce) {
        gsap.from(el.querySelector(".q-glyph"), { yPercent: 40, rotate: -12, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 70%" } });
        gsap.fromTo(el.querySelector(".q-bg img"), { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: el, scrub: true } });
      }
    }, el);
    let sx: number | null = null;
    const ts = (e: TouchEvent) => { sx = e.touches[0].clientX; };
    const te = (e: TouchEvent) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) api.current.go(dx < 0 ? 1 : -1); sx = null; };
    el.addEventListener("touchstart", ts, { passive: true }); el.addEventListener("touchend", te);
    return () => { ctx.revert(); el.removeEventListener("touchstart", ts); el.removeEventListener("touchend", te); };
  }, [lang]);

  return (
    <section className="sec quotes" ref={root} aria-labelledby="qt-h">
      <div className="q-bg" aria-hidden="true"><Img src={IMG.statue} /></div>
      <div className="wrap q-stage i18n-fade">
        <div>
          <p className="mono mark" id="qt-h">{t.quotes.eyebrow}</p>
          <span className="mono sample">{t.quotes.sample}</span>
          <div className="q-glyph" aria-hidden="true">“</div>
        </div>
        <div>
          <div className="q-list" aria-live="polite">
            {CLIENTS.map((n, i) => (
              <figure className={`q-item${i === 0 ? " is-active" : ""}`} key={n}>
                <blockquote><Words text={t.quotes.items[i].q} /></blockquote>
                <figcaption className="q-who">
                  <span className="av">{n.replace(/[^A-Z]/g, "").slice(0, 2)}</span>
                  <span><b>{n}</b><small>{t.quotes.items[i].r}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="q-nav">
            <button type="button" className="icon-btn" aria-label={t.quotes.prev} onClick={() => api.current.go(-1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M15 6l-6 6 6 6" /></svg></button>
            <button type="button" className="icon-btn" aria-label={t.quotes.next} onClick={() => api.current.go(1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 6l6 6-6 6" /></svg></button>
            <div className="q-bars">{CLIENTS.map((n) => <i key={n}><b /></i>)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
