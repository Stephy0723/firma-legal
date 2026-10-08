import { useRef } from "react";
import { gsap } from "gsap";
import { useLang } from "../i18n";
import { ROMAN, IMG, SLUGS } from "../content";
import PageHeader from "../components/PageHeader";
import { usePageMotion } from "../components/usePageMotion";
import { TLink } from "../components/transition";
import { Diag, Img } from "../components/ui";
import { reduce } from "../motion";

/** Index of practice areas: editorial rows; on desktop a photo follows the cursor over the list. */
export default function Practice() {
  const { t, lang } = useLang();
  const page = useRef<HTMLDivElement>(null);
  const p = t.pages.practice;

  usePageMotion(page, [lang], (el) => {
    if (reduce || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const list = el.querySelector<HTMLElement>(".idx")!, float = el.querySelector<HTMLElement>(".idx-float")!;
    const imgs = [...float.querySelectorAll<HTMLElement>("img")];
    const xTo = gsap.quickTo(float, "x", { duration: 0.6, ease: "power3" }), yTo = gsap.quickTo(float, "y", { duration: 0.6, ease: "power3" });
    const rot = gsap.quickTo(float, "rotate", { duration: 0.8, ease: "power3" });
    let lastX = 0;
    list.addEventListener("mousemove", (e) => {
      const r = list.getBoundingClientRect();
      xTo(e.clientX - r.left); yTo(e.clientY - r.top); rot(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4)); lastX = e.clientX;
    });
    list.addEventListener("mouseenter", () => gsap.to(float, { scale: 1, opacity: 1, duration: 0.5, ease: "expo.out" }));
    list.addEventListener("mouseleave", () => gsap.to(float, { scale: 0.6, opacity: 0, duration: 0.4 }));
    el.querySelectorAll<HTMLElement>(".idx-row").forEach((row, i) =>
      row.addEventListener("mouseenter", () => imgs.forEach((im, k) => gsap.to(im, { opacity: k === i ? 1 : 0, scale: k === i ? 1 : 1.15, duration: 0.6, ease: "expo.out" }))));
  });

  return (
    <div ref={page} className="i18n-fade">
      <PageHeader num="II" eyebrow={p.eyebrow} title={p.title} lede={p.lede} image={IMG.gavel} />
      <section className="sec">
        <div className="wrap">
          <div className="idx">
            <div className="idx-float" aria-hidden="true">{IMG.practice.map((src, i) => <Img src={src} key={i} />)}</div>
            <div className="rv-group">
              {t.practice.items.map((it, i) => (
                <TLink to={`/practica/${SLUGS[i]}`} className="idx-row" key={i} data-cursor={t.practice.more}>
                  <span className="idx-num">{ROMAN[i]}</span>
                  <span className="idx-thumb"><Img src={IMG.practice[i]} /></span>
                  <span className="idx-main"><b>{it.t}</b><small>{it.d}</small></span>
                  <span className="idx-go"><Diag /></span>
                </TLink>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
