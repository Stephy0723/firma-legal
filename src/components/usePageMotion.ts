import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { commonReveals } from "../motion";

/** Builds the page's scroll animations and tears them down on leave (or when deps change). */
export function usePageMotion(ref: RefObject<HTMLElement | null>, deps: unknown[], extra?: (scope: HTMLElement) => void) {
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ctx = gsap.context(() => { commonReveals(el); extra?.(el); }, el);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { cancelAnimationFrame(id); ctx.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
