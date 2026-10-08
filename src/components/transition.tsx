import { createContext, useCallback, useContext, useRef, type ReactNode, type MouseEvent, type AnchorHTMLAttributes } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { lenis, reduce } from "../motion";

const GoCtx = createContext<(to: string) => void>(() => {});

/** Page-to-page transition: two brass/ink panels wipe up, the route changes underneath, then they wipe away. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const busy = useRef(false);
  const curtain = useRef<HTMLDivElement>(null);

  const go = useCallback((to: string) => {
    if (busy.current) return;
    const jump = () => { navigate(to); lenis?.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0); };
    if (to === pathname) { lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (reduce || !curtain.current) { jump(); return; }
    busy.current = true;
    const panels = curtain.current.querySelectorAll("i");
    const label = curtain.current.querySelector("span");
    gsap.timeline({ onComplete: () => { busy.current = false; gsap.set(curtain.current, { visibility: "hidden" }); } })
      .set(curtain.current, { visibility: "visible" })
      .fromTo(panels, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.65, stagger: 0.07, ease: "expo.inOut" })
      .fromTo(label, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 0.35)
      .add(jump)
      .to(label, { yPercent: -100, opacity: 0, duration: 0.4, ease: "expo.in" }, "+=0.1")
      .to([...panels].reverse(), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.75, stagger: 0.07, ease: "expo.inOut" }, "-=0.1");
  }, [navigate, pathname]);

  return (
    <GoCtx.Provider value={go}>
      {children}
      <div className="curtain" ref={curtain} aria-hidden="true"><i /><i /><span>Steliant Firma</span></div>
    </GoCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGo = () => useContext(GoCtx);

type TLinkProps = { to: string; children: ReactNode; onNavigate?: () => void } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;
/** Router link that plays the page transition. */
export function TLink({ to, children, onNavigate, ...rest }: TLinkProps) {
  const go = useGo();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate?.();
    go(to);
  };
  return <a href={`#${to}`} onClick={onClick} {...rest}>{children}</a>;
}
