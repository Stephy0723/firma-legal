import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang, Words, Html } from "../i18n";
import { ROMAN, ICONS, IMG, SLUGS, PEOPLE } from "../content";
import { TLink } from "../components/transition";
import { usePageMotion } from "../components/usePageMotion";
import { Arrow, Diag, Img } from "../components/ui";
import Quotes from "../components/Quotes";
import { countUp, isDark, reduce, THEME_EVENT } from "../motion";
import type { SceneApi } from "../scene";
import { firstLoad } from "../loader";

export default function Home() {
  const { t, lang } = useLang();
  const page = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // 3D scene: created once per visit to Home, destroyed on leave.
  useEffect(() => {
    let api: SceneApi | null = null, dead = false;
    const onTheme = () => api?.theme(isDark());
    import("../scene").then(({ createScene }) => {
      if (dead || !canvas.current) return;
      api = createScene(canvas.current, { reduce, dark: isDark() });
      gsap.delayedCall(firstLoad.pending ? 1.9 : 0.5, () => api?.enter());
      ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => api?.setScroll(s.progress), id: "hero3d" });
    });
    addEventListener(THEME_EVENT, onTheme);
    return () => { dead = true; removeEventListener(THEME_EVENT, onTheme); ScrollTrigger.getById("hero3d")?.kill(); api?.destroy(); };
  }, []);

  // Hero entrance (after the loader on first visit, after the curtain otherwise).
  useLayoutEffect(() => {
    const el = page.current!;
    const ctx = gsap.context(() => {
      if (reduce) { el.querySelectorAll<HTMLElement>(".hero [data-count]").forEach(countUp); return; }
      const d = firstLoad.pending ? 1.75 : 0.55;
      gsap.from(".hero h1 .line>span", { yPercent: 110, duration: 1.3, stagger: 0.1, ease: "expo.out", delay: d });
      gsap.from(".hero-in", { opacity: 0, y: 24, duration: 1.1, stagger: 0.08, ease: "expo.out", delay: d + 0.25 });
      gsap.delayedCall(d + 0.15, () => el.querySelectorAll<HTMLElement>(".hero [data-count]").forEach(countUp));
    }, el);
    return () => ctx.revert();
  }, []);

  usePageMotion(page, [lang], (el) => {
    if (reduce) return;
    const skew = gsap.quickTo(".marquee-track", "skewX", { duration: 0.5, ease: "power3" });
    ScrollTrigger.create({ onUpdate: (s) => skew(gsap.utils.clamp(-12, 12, s.getVelocity() / -200)) });
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const track = el.querySelector<HTMLElement>("#track")!;
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, { x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: "#practicePin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true,
          onUpdate: (s) => gsap.set("#trackProg", { scaleX: s.progress }) } });
      gsap.from(".card", { y: 120, opacity: 0, stagger: 0.08, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: "#practicePin", start: "top 70%" } });
    });
    gsap.utils.toArray<HTMLElement>(".strip-item").forEach((s, i) =>
      gsap.fromTo(s, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.4, delay: i * 0.08, ease: "expo.inOut", scrollTrigger: { trigger: ".strip", start: "top 85%" } }));
    gsap.from(".cta-band h2", { yPercent: 40, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".cta-band", start: "top 80%" } });
    gsap.fromTo(".cta-band .cta-bg img", { yPercent: -12 }, { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".cta-band", scrub: true } });
  });

  const marquee = [...t.marquee, ...t.marquee, ...t.marquee, ...t.marquee];

  return (
    <div ref={page} className="i18n-fade">
      <section className="hero" aria-labelledby="h1">
        <canvas id="scene" ref={canvas} aria-hidden="true" />
        <div className="wrap hero-grid">
          <div>
            <p className="mono mark hero-in">{t.hero.eyebrow}</p>
            <Html as="h1" id="h1" html={t.hero.title} />
            <p className="hero-lede hero-in">{t.hero.lede}</p>
            <div className="hero-actions hero-in">
              <TLink to="/contacto" className="btn btn-fill magnetic"><span>{t.hero.cta1}</span><Arrow /></TLink>
              <TLink to="/practica" className="btn btn-ghost magnetic"><span>{t.hero.cta2}</span></TLink>
            </div>
            <div className="hero-trust hero-in">
              <div><strong data-count="500" data-prefix="+">+500</strong><span>{t.hero.t1}</span></div>
              <div><strong data-count="98" data-suffix="%">98%</strong><span>{t.hero.t2}</span></div>
              <div><strong>24/7</strong><span>{t.hero.t3}</span></div>
            </div>
          </div>
          <div className="hero-side hero-in"><div className="scroll-hint mono"><span>{t.hero.scroll}</span><i /></div></div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true"><div className="marquee-track">{marquee.map((w, i) => <span key={i}>{w}</span>)}</div></div>

      <section className="sec">
        <div className="wrap about-grid">
          <p className="mono mark">§ I — {t.about.eyebrow}</p>
          <div>
            <p className="about-big scrub-words"><Words text={t.about.big} /></p>
            <TLink to="/firma" className="btn btn-ghost magnetic" style={{ marginTop: "2.4rem" }}><span>{t.home.aboutMore}</span><Arrow /></TLink>
          </div>
        </div>
      </section>

      <section className="practice" aria-labelledby="pr-h">
        <div className="practice-pin" id="practicePin">
          <div className="wrap sec-head">
            <p className="mono mark">§ II — {t.practice.eyebrow}</p>
            <div><Html as="h2" id="pr-h" html={t.practice.title} /><p className="sub">{t.practice.sub}</p></div>
          </div>
          <div className="track" id="track">
            {t.practice.items.map((it, i) => (
              <TLink to={`/practica/${SLUGS[i]}`} className="card" data-cursor={t.practice.more} key={i}>
                <span className="shot"><Img src={IMG.practice[i]} /><span className="num">{ROMAN[i]}</span></span>
                <svg className="ico" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[i] }} />
                <h3>{it.t}</h3>
                <p>{it.d}</p>
                <span className="more"><span>{t.practice.more}</span><Diag /></span>
              </TLink>
            ))}
            <div className="track-end">
              <p>{t.practice.end}</p>
              <TLink to="/practica" className="btn btn-fill magnetic" style={{ justifySelf: "start", width: "max-content" }}><span>{t.home.practiceAll}</span><Arrow /></TLink>
            </div>
          </div>
          <div className="progress"><i id="trackProg" /></div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="figures">
            <div className="fig"><strong data-count="500" data-prefix="+">+500</strong><span>{t.fig.a}</span></div>
            <div className="fig"><strong data-count="98" data-suffix="%">98%</strong><span>{t.fig.b}</span></div>
            <div className="fig"><strong data-count="20">20</strong><span>{t.fig.c}</span></div>
            <div className="fig"><strong data-count="15">15</strong><span>{t.fig.d}</span></div>
          </div>
          <div className="sec-head" style={{ marginTop: "clamp(5rem,10vw,8rem)", marginBottom: "2.4rem" }}>
            <p className="mono mark">§ III — {t.team.eyebrow}</p>
            <div><Html as="h2" html={t.team.title} /></div>
          </div>
          <div className="strip">
            {PEOPLE.map((n, i) => (
              <TLink to="/equipo" className="strip-item" key={n} data-cursor={t.team.view}>
                <Img src={IMG.team[i]} alt={n} />
                <span className="strip-cap"><b>{n}</b><small>{t.team.items[i].s}</small></span>
              </TLink>
            ))}
          </div>
          <div style={{ marginTop: "2rem" }}><TLink to="/equipo" className="btn btn-ghost magnetic"><span>{t.home.teamMore}</span><Arrow /></TLink></div>
        </div>
      </section>

      <Quotes />

      <section className="cta-band">
        <div className="cta-bg" aria-hidden="true"><Img src={IMG.library} /></div>
        <div className="wrap">
          <Html as="h2" html={t.home.ctaTitle} />
          <p>{t.home.ctaText}</p>
          <TLink to="/contacto" className="btn btn-brass magnetic"><span>{t.home.ctaBtn}</span><Arrow /></TLink>
        </div>
      </section>
    </div>
  );
}
