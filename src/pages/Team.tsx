import { useRef } from "react";
import { gsap } from "gsap";
import { useLang } from "../i18n";
import { IMG, PEOPLE } from "../content";
import PageHeader from "../components/PageHeader";
import { usePageMotion } from "../components/usePageMotion";
import { Guilloche, Img } from "../components/ui";
import { reduce, toast } from "../motion";

const mail = (n: string) => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(" ", ".") + "@steliantfirma.com";

export default function Team() {
  const { t, lang } = useLang();
  const page = useRef<HTMLDivElement>(null);
  const p = t.pages.team;

  usePageMotion(page, [lang], (el) => {
    if (reduce) return;
    el.querySelectorAll<HTMLElement>(".bio").forEach((b) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: "top 75%" } });
      tl.from(b.querySelector(".bio-name"), { yPercent: 100, opacity: 0, duration: 1.2, ease: "expo.out" })
        .from(b.querySelectorAll(".bio-txt > *"), { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out" }, 0.2);
      gsap.fromTo(b.querySelector(".bio-big"), { yPercent: 30 }, { yPercent: -30, ease: "none", scrollTrigger: { trigger: b, scrub: true } });
    });
  });

  const copy = (v: string) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(v).then(() => toast(t.contact.copied)).catch(() => toast(v));
    else toast(v);
  };

  return (
    <div ref={page} className="i18n-fade">
      <PageHeader num="III" eyebrow={p.eyebrow} title={p.title} lede={p.lede} image={IMG.stairs} />
      <section className="sec">
        <div className="wrap bios">
          {PEOPLE.map((n, i) => {
            const m = t.team.items[i];
            return (
              <article className={`bio${i % 2 ? " flip" : ""}`} key={n}>
                <span className="bio-big" aria-hidden="true">{n.split(" ").map((w) => w[0]).join("")}</span>
                <div className="medal reveal-img" data-cursor={m.s}>
                  <Img src={IMG.team[i]} alt={n} />
                  <Guilloche seed={i} />
                </div>
                <div className="bio-txt">
                  <span className="mono">{String(i + 1).padStart(2, "0")} — {m.r}</span>
                  <h2 className="bio-name-wrap"><span className="bio-name">{i % 2 ? "Dra." : "Dr."} {n}</span></h2>
                  <p className="bio-spec"><span className="mono">{t.teamPage.spec}</span> {m.s}</p>
                  <p>{m.b}</p>
                  <div className="bio-edu"><span className="mono">{t.teamPage.edu}</span><ul>{m.e.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <button type="button" className="copy" onClick={() => copy(mail(n))}>{mail(n)} · {t.contact.copy}</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
