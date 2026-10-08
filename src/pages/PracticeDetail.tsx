import { useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { gsap } from "gsap";
import { useLang, Html } from "../i18n";
import { ROMAN, IMG, SLUGS, LEAD, PEOPLE } from "../content";
import PageHeader from "../components/PageHeader";
import { usePageMotion } from "../components/usePageMotion";
import { TLink } from "../components/transition";
import { Arrow, Diag, Img } from "../components/ui";
import { reduce } from "../motion";

export default function PracticeDetail() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const page = useRef<HTMLDivElement>(null);
  const i = SLUGS.indexOf(slug || "");

  usePageMotion(page, [lang, slug], (el) => {
    if (reduce) return;
    gsap.from(el.querySelectorAll(".inc li"), { x: -30, opacity: 0, stagger: 0.07, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el.querySelector(".inc"), start: "top 85%" } });
    gsap.fromTo(el.querySelector(".next-area .na-img img"), { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: el.querySelector(".next-area"), scrub: true } });
  });

  if (i < 0) return <Navigate to="/practica" replace />;
  const it = t.practice.items[i], n = (i + 1) % SLUGS.length, lead = LEAD[i];

  return (
    <div ref={page} className="i18n-fade" key={slug}>
      <PageHeader num={`II.${ROMAN[i]}`} eyebrow={`${t.practice.title_t} ${ROMAN[i]}`} title={it.t} lede={it.d} image={IMG.practice[i].replace("w=700", "w=1800")}>
        <TLink to="/practica" className="back-link ph-in"><Arrow /> {t.detail.back}</TLink>
      </PageHeader>

      <section className="sec">
        <div className="wrap detail-grid">
          <div>
            <p className="mono mark">{t.detail.approach}</p>
            <p className="detail-lead rv">{it.f}</p>
            <div className="inc">
              <p className="mono mark">{t.detail.includes}</p>
              <ul>{it.l.map((x, k) => <li key={k}><span>{ROMAN[i]}.{k + 1}</span>{x}</li>)}</ul>
            </div>
          </div>
          <aside className="lead-card rv">
            <div className="frame reveal-img"><Img src={IMG.team[lead]} alt={PEOPLE[lead]} /></div>
            <span className="mono">{t.detail.lead}</span>
            <b>{lead % 2 ? "Dra." : "Dr."} {PEOPLE[lead]}</b>
            <small>{t.team.items[lead].r} · {t.team.items[lead].s}</small>
            <TLink to="/contacto" className="btn btn-fill magnetic"><span>{t.detail.cta}</span><Arrow /></TLink>
          </aside>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head"><p className="mono mark">§ — {t.process.eyebrow}</p><div><Html as="h2" html={t.process.title} /></div></div>
          <div className="steps" id="steps">
            <svg className="path" preserveAspectRatio="none" viewBox="0 0 100 24" aria-hidden="true">
              <line className="base" x1="0" y1="12" x2="100" y2="12" vectorEffect="non-scaling-stroke" />
              <line id="stepLine" x1="0" y1="12" x2="100" y2="12" vectorEffect="non-scaling-stroke" />
            </svg>
            {t.process.items.map((s, k) => (
              <div className="step" key={k}><span className="dot" /><span className="mono">0{k + 1} / 04</span><h3>{s.t}</h3><p>{s.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <TLink to={`/practica/${SLUGS[n]}`} className="next-area" data-cursor={t.detail.next}>
        <span className="na-img" aria-hidden="true"><Img src={IMG.practice[n].replace("w=700", "w=1600")} /></span>
        <span className="wrap na-in">
          <span className="mono">{t.detail.next} — {ROMAN[n]}</span>
          <span className="na-title">{t.practice.items[n].t}<Diag /></span>
        </span>
      </TLink>
    </div>
  );
}
