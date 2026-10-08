import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export let lenis: Lenis | null = null;

/** Theme helpers shared by the toggle, the 3D scene and the guilloché canvases. */
export const isDark = () => {
  const r = document.documentElement;
  return r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};
export const THEME_EVENT = "sf-theme";

let tt = 0;
export function toast(msg: string) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(tt);
  tt = window.setTimeout(() => t.classList.remove("is-on"), 3600);
}

export function countUp(el: HTMLElement) {
  const end = +el.dataset.count!, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
  if (reduce) { el.textContent = pre + end + suf; return; }
  const o = { v: 0 };
  gsap.to(o, { v: end, duration: 2.2, ease: "power3.out", onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; } });
}

let started = false;
/** One-time setup: smooth scroll, custom cursor, magnetic buttons, card tilt, nav state. */
export function initGlobal() {
  if (started) return;
  started = true;

  if (!reduce) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Nav: solid on scroll, hides while scrolling down.
  let last = 0;
  const onScroll = () => {
    const nav = document.getElementById("nav"); if (!nav) return;
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 30);
    nav.classList.toggle("is-hidden", y > 400 && y > last && !document.getElementById("menu")?.classList.contains("is-open"));
    last = y;
  };
  addEventListener("scroll", onScroll, { passive: true });

  if (!matchMedia("(hover:hover) and (pointer:fine)").matches || reduce) return;
  document.body.classList.add("has-cursor");
  const c = document.querySelector<HTMLElement>(".cursor")!, dot = document.querySelector<HTMLElement>(".cursor-dot")!;
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
    const tg = e.target as HTMLElement;
    const m = tg.closest<HTMLElement>(".magnetic");
    if (m) {
      const r = m.getBoundingClientRect();
      m.style.transform = `translate(${(mx - r.left - r.width / 2) * 0.25}px,${(my - r.top - r.height / 2) * 0.35}px)`;
    }
    const card = tg.closest<HTMLElement>(".card");
    if (card) {
      const r = card.getBoundingClientRect(); const px = (mx - r.left) / r.width, py = (my - r.top) / r.height;
      card.style.setProperty("--mx", px * 100 + "%"); card.style.setProperty("--my", py * 100 + "%");
      card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg)`;
    }
  });
  const settle = (el: HTMLElement, ms: number) => {
    el.style.transition = `transform ${ms}ms cubic-bezier(.19,1,.22,1),border-color .4s`; el.style.transform = "";
    setTimeout(() => (el.style.transition = ""), ms);
  };
  document.addEventListener("mouseout", (e) => {
    const from = e.target as HTMLElement, to = e.relatedTarget as HTMLElement | null;
    const m = from.closest<HTMLElement>(".magnetic"); if (m && !m.contains(to)) settle(m, 700);
    const card = from.closest<HTMLElement>(".card"); if (card && !card.contains(to)) settle(card, 800);
  });
  const loop = () => { cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
  loop();
  document.addEventListener("mouseover", (e) => {
    const tg = e.target as HTMLElement;
    const v = tg.closest<HTMLElement>("[data-cursor]"), h = tg.closest("a,button,select,input,textarea,label");
    c.classList.toggle("is-view", !!v);
    c.dataset.label = v?.dataset.cursor || "";
    c.classList.toggle("is-hover", !v && !!h);
  });
}

/** Scroll-driven reveals shared by every page. Call inside a gsap.context scoped to the page. */
export function commonReveals(scope: HTMLElement) {
  if (reduce) {
    scope.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
    scope.querySelectorAll(".step").forEach((s) => s.classList.add("on"));
    return;
  }
  const q = gsap.utils.selector(scope);

  // Page header: image curtain + title rise.
  q(".page-head").forEach((h: HTMLElement) => {
    const img = h.querySelector(".ph-bg img");
    if (img) {
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2.2, ease: "expo.out", delay: 0.15 });
      gsap.to(img, { yPercent: 18, ease: "none", scrollTrigger: { trigger: h, start: "top top", end: "bottom top", scrub: true } });
    }
    gsap.from(h.querySelectorAll(".ph-line > span"), { yPercent: 115, duration: 1.4, stagger: 0.08, ease: "expo.out", delay: 0.35 });
    gsap.from(h.querySelectorAll(".ph-in"), { y: 26, opacity: 0, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: 0.6 });
  });

  q(".rv").forEach((el: HTMLElement) =>
    gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  q(".rv-group").forEach((g: HTMLElement) =>
    gsap.from(g.children, { y: 60, opacity: 0, duration: 1.2, stagger: 0.09, ease: "expo.out", scrollTrigger: { trigger: g, start: "top 85%" } }));
  q(".sec-head h2").forEach((h: HTMLElement) =>
    gsap.from(h, { yPercent: 30, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 90%" } }));
  q(".sec .mark").forEach((m: HTMLElement) =>
    gsap.from(m, { x: -20, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: m, start: "top 94%" } }));

  q(".reveal-img").forEach((f: HTMLElement) => {
    const img = f.querySelector("img");
    gsap.fromTo(f, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: f, start: "top 88%" } });
    if (img) {
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: "expo.out", scrollTrigger: { trigger: f, start: "top 88%" } });
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: f, scrub: true } });
    }
  });

  q(".scrub-words").forEach((p: HTMLElement) =>
    gsap.fromTo(p.querySelectorAll(".w"), { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: 0.6 } }));

  q("[data-count]").forEach((el: HTMLElement) => {
    if (el.closest(".hero")) return;
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => countUp(el) });
  });

  // Process line (desktop) / steps (mobile)
  const steps = scope.querySelector("#steps");
  if (steps) {
    gsap.from(q(".step"), { y: 40, opacity: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: steps, start: "top 82%" } });
    gsap.fromTo(q("#stepLine"), { attr: { x2: 0 } }, { attr: { x2: 100 }, ease: "none",
      scrollTrigger: { trigger: steps, start: "top 78%", end: "bottom 55%", scrub: 0.6,
        onUpdate: (s) => q(".step").forEach((st: HTMLElement, k: number) => st.classList.toggle("on", s.progress >= k / 3 - 0.02)) } });
  }

  q(".giant").forEach((g: HTMLElement) => {
    gsap.to(g, { "--fill": "100%", ease: "none", scrollTrigger: { trigger: g, start: "top 95%", end: "bottom bottom", scrub: 0.5 } });
  });
}
