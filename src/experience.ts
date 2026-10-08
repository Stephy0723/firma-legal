import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { T, ROMAN, type Lang } from "./content";
import type { SceneApi } from "./scene";

gsap.registerPlugin(ScrollTrigger);

type Dict = typeof T.es;
const $ = <E extends HTMLElement = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector(s) as E;
const $$ = <E extends HTMLElement = HTMLElement>(s: string, c: ParentNode = document) => [...c.querySelectorAll<E>(s)];
const get = (o: unknown, p: string): unknown =>
  p.split(".").reduce<unknown>((a, k) => (a == null ? a : (a as Record<string, unknown>)[k]), o);
const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

let started = false;

export function initExperience() {
  if (started) return;
  started = true;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  let lang: Lang = (store.get("sf-lang") as Lang) || ((navigator.language || "es").startsWith("en") ? "en" : "es");
  const d = (): Dict => T[lang];
  let lenis: Lenis | null = null;
  let scene: SceneApi | null = null;
  let modalIndex: number | null = null;

  /* ---------- i18n ---------- */
  const words = (el: HTMLElement) => {
    el.innerHTML = (el.textContent || "").trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  };
  const fillMarquee = () => {
    const html = [...d().marquee, ...d().marquee].map((w) => `<span>${w}</span>`).join("");
    $("#marquee").innerHTML = html + html;
  };
  const fillSelect = () => {
    const sel = $<HTMLSelectElement>("#f-area");
    const v = sel.value;
    sel.innerHTML = '<option value="" disabled hidden></option>' +
      d().practice.items.map((it, i) => `<option value="${i}">${it.t}</option>`).join("") +
      `<option value="other">${d().contact.other}</option>`;
    sel.value = v;
  };
  const movePill = () => {
    const on = $(`[data-lang="${lang}"]`), pill = $(".seg .pill");
    pill.style.width = on.offsetWidth + "px";
    pill.style.transform = `translateX(${on.offsetLeft - 3}px)`;
  };
  const fillModal = (i: number) => {
    const it = d().practice.items[i];
    $("#mKicker").textContent = `${d().practice.title_t} ${ROMAN[i]}`;
    $("#mTitle").textContent = it.t;
    $("#mDesc").textContent = it.f;
    $("#mList").innerHTML = it.l.map((x, k) => `<li><span>${ROMAN[i]}.${k + 1}</span>${x}</li>`).join("");
  };
  const applyLang = () => {
    root.lang = lang;
    $$("[data-i18n]").forEach((el) => { const v = get(d(), el.dataset.i18n!); if (typeof v === "string") el.textContent = v; });
    $$("[data-i18n-html]").forEach((el) => { const v = get(d(), el.dataset.i18nHtml!); if (typeof v === "string") el.innerHTML = v; });
    $$("[data-i18n-aria]").forEach((el) => { const v = get(d(), el.dataset.i18nAria!); if (typeof v === "string") el.setAttribute("aria-label", v); });
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    movePill(); fillMarquee(); fillSelect();
    words($("#aboutBig"));
    $$(".q-item blockquote").forEach(words);
    if (modalIndex != null) fillModal(modalIndex);
  };
  let aboutTween: gsap.core.Tween | null = null;
  const buildAboutScrub = () => {
    if (reduce) return;
    aboutTween?.scrollTrigger?.kill(); aboutTween?.kill();
    aboutTween = gsap.to("#aboutBig .w", { opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: "#aboutBig", start: "top 78%", end: "bottom 42%", scrub: 0.6 } });
  };
  const setLang = (l: Lang) => {
    if (l === lang) return;
    lang = l; store.set("sf-lang", l);
    document.body.classList.add("swapping");
    setTimeout(() => {
      applyLang(); document.body.classList.remove("swapping");
      buildAboutScrub(); ScrollTrigger.refresh();
      if (qStarted) showQuote(qi, true);
    }, 230);
  };
  $$("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang as Lang)));

  /* ---------- Theme ---------- */
  const saved = store.get("sf-theme");
  if (saved) root.dataset.theme = saved;
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);
  const onTheme = () => { drawMedals(); scene?.theme(isDark()); };
  $("#themeBtn").addEventListener("click", (e) => {
    const next = isDark() ? "light" : "dark";
    const swap = () => { root.dataset.theme = next; store.set("sf-theme", next); onTheme(); };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || reduce) { swap(); return; }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(swap).ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 900, easing: "cubic-bezier(.19,1,.22,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (!root.dataset.theme) onTheme(); });

  /* ---------- Guilloché overlays ---------- */
  function drawMedals() {
    const cs = getComputedStyle(root);
    const brass = cs.getPropertyValue("--brass-hi").trim();
    $$<HTMLCanvasElement>(".medal canvas").forEach((c) => {
      const s = +(c.dataset.seed || 0), dpr = Math.min(devicePixelRatio || 1, 2);
      const w = c.clientWidth || 300, h = c.clientHeight || 375;
      c.width = w * dpr; c.height = h * dpr;
      const g = c.getContext("2d"); if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46;
      ([[R, R * 0.12, 7 + s * 2, 0.9], [R * 0.8, R * 0.1, 11 + s, 0.7]] as const).forEach(([rad, amp, n, a]) => {
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
    });
  }

  /* ---------- Modal & menu ---------- */
  const modal = $("#modal"), menu = $("#menu"), burger = $("#burger");
  const openModal = (i: number) => {
    modalIndex = i; fillModal(i); modal.classList.add("is-open"); lenis?.stop();
    setTimeout(() => $(".sheet-close").focus(), 300);
  };
  const closeModal = () => { modal.classList.remove("is-open"); modalIndex = null; lenis?.start(); };
  const closeMenu = () => {
    menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false");
    if (!modal.classList.contains("is-open")) lenis?.start();
  };
  $("#track").addEventListener("click", (e) => {
    const c = (e.target as HTMLElement).closest<HTMLElement>(".card"); if (c) openModal(+c.dataset.i!);
  });
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeModal));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { if (modal.classList.contains("is-open")) closeModal(); closeMenu(); } });
  burger.addEventListener("click", () => {
    menu.classList.add("is-open"); burger.setAttribute("aria-expanded", "true"); lenis?.stop();
    if (!reduce) gsap.fromTo("#menu li", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: "expo.out", delay: 0.2 });
  });
  $("#menuClose").addEventListener("click", closeMenu);

  /* ---------- Toast, form, copy ---------- */
  let tt = 0;
  const toast = (m: string) => {
    const t = $("#toast"); t.textContent = m; t.classList.add("is-on");
    clearTimeout(tt); tt = window.setTimeout(() => t.classList.remove("is-on"), 3600);
  };
  $<HTMLFormElement>("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget as HTMLFormElement;
    const val = (id: string) => ($(`#${id}`, f) as HTMLInputElement).value.trim();
    if (!val("f-name") || !/\S+@\S+\.\S+/.test(val("f-email")) || !val("f-area")) { toast(d().contact.err); return; }
    toast(d().contact.ok); f.reset();
  });
  $$(".copy").forEach((b) => b.addEventListener("click", () => {
    const select = () => {
      const r = document.createRange(); r.selectNodeContents(b.parentElement!.firstElementChild!);
      const s = getSelection(); s?.removeAllRanges(); s?.addRange(r);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(b.dataset.copy!).then(() => toast(d().contact.copied)).catch(select);
    else select();
  }));

  /* ---------- Testimonials ---------- */
  let qi = 0, qStarted = false;
  const QDUR = 7;
  function showQuote(n: number, instant = false) {
    qStarted = true;
    const items = $$(".q-item"), bars = $$("#qBars b");
    const prev = items[qi]; qi = (n + items.length) % items.length; const cur = items[qi];
    bars.forEach((b, k) => { gsap.killTweensOf(b); gsap.set(b, { scaleX: k < qi ? 1 : 0 }); });
    if (reduce) { items.forEach((i) => i.classList.remove("is-active")); cur.classList.add("is-active"); gsap.set(bars[qi], { scaleX: 1 }); return; }
    if (prev !== cur && !instant) {
      gsap.to(prev.querySelectorAll(".w"), { y: -20, opacity: 0, stagger: 0.008, duration: 0.4, ease: "power2.in", onComplete: () => prev.classList.remove("is-active") });
    } else if (prev !== cur) prev.classList.remove("is-active");
    cur.classList.add("is-active");
    gsap.fromTo(cur.querySelectorAll(".w"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.018, duration: 0.9, ease: "expo.out", delay: prev !== cur && !instant ? 0.35 : 0 });
    gsap.fromTo(cur.querySelector(".q-who"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6 });
    gsap.fromTo(bars[qi], { scaleX: 0 }, { scaleX: 1, duration: QDUR, ease: "none", onComplete: () => showQuote(qi + 1) });
  }
  $("#qNext").addEventListener("click", () => showQuote(qi + 1));
  $("#qPrev").addEventListener("click", () => showQuote(qi - 1));
  {
    let sx: number | null = null; const l = $("#qList");
    l.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    l.addEventListener("touchend", (e) => {
      if (sx == null) return; const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) showQuote(qi + (dx < 0 ? 1 : -1)); sx = null;
    });
  }

  /* ---------- Initial render ---------- */
  applyLang(); drawMedals();
  let rz = 0;
  addEventListener("resize", () => { movePill(); clearTimeout(rz); rz = window.setTimeout(drawMedals, 150); });

  /* ---------- Smooth scroll ---------- */
  if (!reduce) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-scroll]"); if (!a) return;
    const id = a.getAttribute("href")!; const t: HTMLElement | 0 | null = id === "#top" ? 0 : $(id);
    if (t == null) return;
    e.preventDefault();
    if (a.hasAttribute("data-close")) closeModal();
    const wasOpen = menu.classList.contains("is-open"); closeMenu();
    setTimeout(() => {
      if (lenis) lenis.scrollTo(t, { offset: id === "#top" ? 0 : -70, duration: 1.6 });
      else if (t === 0) scrollTo({ top: 0, behavior: "smooth" }); else t.scrollIntoView({ behavior: "smooth" });
    }, wasOpen ? 350 : 0);
  });

  /* ---------- Nav ---------- */
  {
    const nav = $("#nav"); let last = 0;
    const onS = () => {
      const y = scrollY;
      nav.classList.toggle("is-scrolled", y > 30);
      nav.classList.toggle("is-hidden", y > 400 && y > last && !menu.classList.contains("is-open"));
      last = y;
    };
    addEventListener("scroll", onS, { passive: true }); onS();
  }

  /* ---------- Cursor, magnetic, tilt ---------- */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
    document.body.classList.add("has-cursor");
    const c = $(".cursor"), dot = $(".cursor-dot");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
    const loop = () => { cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener("mouseover", (e) => {
      const tg = e.target as HTMLElement;
      const v = tg.closest<HTMLElement>("[data-cursor='view']"), h = tg.closest("a,button,select,input,textarea,label");
      c.classList.toggle("is-view", !!v);
      c.dataset.label = v ? (v.classList.contains("card") ? d().practice.more : d().team.view) : "";
      c.classList.toggle("is-hover", !v && !!h);
    });
    $$(".magnetic").forEach((m) => {
      m.addEventListener("mousemove", (e) => {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      m.addEventListener("mouseleave", () => {
        m.style.transition = "transform .7s cubic-bezier(.19,1,.22,1)"; m.style.transform = "";
        setTimeout(() => (m.style.transition = ""), 700);
      });
    });
    $$(".card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", px * 100 + "%"); card.style.setProperty("--my", py * 100 + "%");
        card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .8s cubic-bezier(.19,1,.22,1),border-color .4s"; card.style.transform = "";
        setTimeout(() => (card.style.transition = ""), 800);
      });
    });
  }

  /* ---------- Counters ---------- */
  const countUp = (el: HTMLElement) => {
    const end = +el.dataset.count!, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = pre + end + suf; return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 2.2, ease: "power3.out", onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; } });
  };

  /* ---------- 3D scene ---------- */
  let wantEnter = false;
  const enterScene = () => { wantEnter = true; scene?.enter(); };
  import("./scene").then(({ createScene }) => {
    scene = createScene($<HTMLCanvasElement>("#scene"), { reduce, dark: isDark() });
    if (wantEnter) scene?.enter();
  });

  /* ---------- Choreography ---------- */
  const loader = $("#loader");
  loader.style.animation = "none";
  if (reduce) {
    loader.style.display = "none"; enterScene(); showQuote(0);
    $$(".step").forEach((s) => s.classList.add("on")); $("#giant").style.setProperty("--fill", "100%");
    return;
  }

  const counter = { v: 0 };
  gsap.timeline()
    .set("#h1 .line>span", { yPercent: 110 }).set(".hero-in", { opacity: 0, y: 24 })
    .to("#loader .ld-bar i", { scaleX: 1, duration: 1.1, ease: "power3.inOut" }, 0)
    .to(counter, { v: 100, duration: 1.1, ease: "power3.inOut", onUpdate: () => { $("#loader .ld-count").textContent = String(Math.round(counter.v)).padStart(3, "0"); } }, 0)
    .to("#loader .ld-word span", { yPercent: -110, duration: 0.7, ease: "expo.in" }, 1.15)
    .to("#loader", { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, 1.35)
    .set("#loader", { display: "none" })
    .to("#h1 .line>span", { yPercent: 0, duration: 1.3, stagger: 0.1, ease: "expo.out" }, 1.75)
    .to(".hero-in", { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" }, 2.0)
    .add(() => { $$(".hero-trust [data-count]").forEach(countUp); enterScene(); }, 1.9);

  buildAboutScrub();
  gsap.utils.toArray<HTMLElement>(".rv").forEach((el) =>
    gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
  gsap.utils.toArray<HTMLElement>(".sec-head h2").forEach((h) =>
    gsap.from(h, { yPercent: 30, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%" } }));
  gsap.utils.toArray<HTMLElement>(".sec .mark, .practice .mark").forEach((m) =>
    gsap.from(m, { x: -20, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: m, start: "top 92%" } }));

  // Photography: curtain reveal + parallax
  gsap.utils.toArray<HTMLElement>(".reveal-img").forEach((f) => {
    const img = f.querySelector("img");
    gsap.fromTo(f, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: f, start: "top 85%" } });
    if (img) {
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: "expo.out", scrollTrigger: { trigger: f, start: "top 85%" } });
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: f, scrub: true } });
    }
  });
  gsap.fromTo(".q-bg img", { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".quotes", scrub: true } });

  const skew = gsap.quickTo(".marquee-track", "skewX", { duration: 0.5, ease: "power3" });
  ScrollTrigger.create({ onUpdate: (s) => skew(gsap.utils.clamp(-12, 12, s.getVelocity() / -200)) });

  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    const track = $("#track");
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, { x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: "#practicePin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: (s) => gsap.set("#trackProg", { scaleX: s.progress }) } });
    gsap.from(".card", { y: 120, opacity: 0, stagger: 0.08, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: "#practicePin", start: "top 70%" } });
    gsap.fromTo("#stepLine", { attr: { x2: 0 } }, { attr: { x2: 100 }, ease: "none",
      scrollTrigger: { trigger: "#steps", start: "top 75%", end: "bottom 55%", scrub: 0.6,
        onUpdate: (s) => $$(".step").forEach((st, k) => st.classList.toggle("on", s.progress >= k / 3 - 0.02)) } });
  });
  mm.add("(max-width: 899px)", () => {
    $$(".step").forEach((st) => ScrollTrigger.create({ trigger: st, start: "top 80%", onEnter: () => st.classList.add("on") }));
  });
  gsap.from(".step", { y: 40, opacity: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: "#steps", start: "top 80%" } });
  $$(".figures [data-count]").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => countUp(el) }));
  gsap.from(".member", { y: 80, opacity: 0, stagger: 0.1, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: "#team", start: "top 82%" } });
  gsap.utils.toArray<HTMLElement>(".medal").forEach((m, i) =>
    gsap.fromTo(m, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.5, delay: i * 0.1, ease: "expo.inOut", scrollTrigger: { trigger: "#team", start: "top 80%" } }));
  ScrollTrigger.create({ trigger: ".quotes", start: "top 65%", once: true, onEnter: () => showQuote(0) });
  gsap.from(".q-glyph", { yPercent: 40, rotate: -12, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".quotes", start: "top 70%" } });
  gsap.from(".info-row", { y: 24, opacity: 0, stagger: 0.08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".info", start: "top 85%" } });
  gsap.from(".field, .form>div:last-child", { y: 30, opacity: 0, stagger: 0.07, duration: 1, ease: "expo.out", scrollTrigger: { trigger: "#form", start: "top 85%" } });
  gsap.to("#giant", { "--fill": "100%", ease: "none", scrollTrigger: { trigger: "footer", start: "top 85%", end: "bottom bottom", scrub: 0.5 } });
  gsap.from("#giant", { yPercent: 40, ease: "none", scrollTrigger: { trigger: "footer", start: "top bottom", end: "bottom bottom", scrub: true } });

  ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => scene?.setScroll(s.progress) });

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => { movePill(); ScrollTrigger.refresh(); });
}
