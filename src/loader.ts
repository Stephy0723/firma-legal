import { gsap } from "gsap";
import { reduce } from "./motion";

/** True until the first-visit loader has finished; pages use it to time their entrance. */
export const firstLoad = { pending: true };

export function runLoader() {
  const el = document.getElementById("loader");
  if (!el) return;
  el.style.animation = "none";
  if (reduce) { el.style.display = "none"; firstLoad.pending = false; return; }
  const count = el.querySelector(".ld-count")!, c = { v: 0 };
  gsap.timeline({ onComplete: () => { firstLoad.pending = false; } })
    .to(el.querySelector(".ld-bar i"), { scaleX: 1, duration: 1.1, ease: "power3.inOut" }, 0)
    .to(c, { v: 100, duration: 1.1, ease: "power3.inOut", onUpdate: () => { count.textContent = String(Math.round(c.v)).padStart(3, "0"); } }, 0)
    .to(el.querySelector(".ld-word span"), { yPercent: -110, duration: 0.7, ease: "expo.in" }, 1.15)
    .to(el, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, 1.35)
    .set(el, { display: "none" });
}
