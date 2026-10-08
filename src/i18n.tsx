import { Fragment, createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { T, type Lang } from "./content";

type Ctx = { lang: Lang; t: (typeof T)["es"]; setLang: (l: Lang) => void };
const LangCtx = createContext<Ctx | null>(null);

const initial = (): Lang => {
  try { const s = localStorage.getItem("sf-lang"); if (s === "es" || s === "en") return s; } catch { /* no storage */ }
  return (navigator.language || "es").startsWith("en") ? "en" : "es";
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>(initial);
  const setLang = useCallback((l: Lang) => {
    if (l === lang) return;
    document.body.classList.add("swapping");
    window.setTimeout(() => {
      set(l);
      try { localStorage.setItem("sf-lang", l); } catch { /* no storage */ }
      requestAnimationFrame(() => document.body.classList.remove("swapping"));
    }, 220);
  }, [lang]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return <LangCtx.Provider value={{ lang, t: T[lang], setLang }}>{children}</LangCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLang = () => useContext(LangCtx)!;

/** Renders a string as individual word spans (used for scrubbed and staggered text). */
export const Words = ({ text }: { text: string }) => (
  <>{text.trim().split(/\s+/).map((w, i) => <Fragment key={i}><span className="w">{w}</span>{" "}</Fragment>)}</>
);
/** Renders trusted HTML from the content dictionary (only <em> emphasis). */
export const Html = ({ as: Tag = "span", html, ...rest }: { as?: "h1" | "h2" | "h3" | "p" | "span"; html: string } & Record<string, unknown>) => (
  <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />
);
