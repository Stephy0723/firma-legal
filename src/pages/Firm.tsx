import { useRef } from "react";
import { useLang, Words, Html } from "../i18n";
import { IMG } from "../content";
import PageHeader from "../components/PageHeader";
import { usePageMotion } from "../components/usePageMotion";
import { TLink } from "../components/transition";
import { Arrow, Img } from "../components/ui";

export default function Firm() {
  const { t, lang } = useLang();
  const page = useRef<HTMLDivElement>(null);
  usePageMotion(page, [lang]);
  const p = t.pages.firm;

  return (
    <div ref={page} className="i18n-fade">
      <PageHeader num="I" eyebrow={p.eyebrow} title={p.title} lede={p.lede} image={IMG.office} />

      <section className="sec">
        <div className="wrap about-grid">
          <p className="mono mark">MMIV — MMXXVI</p>
          <div>
            <p className="about-big scrub-words"><Words text={t.about.big} /></p>
            <div className="about-cols rv-group">
              {([1, 2, 3] as const).map((n) => (
                <div className="value" key={n}>
                  <span className="mono">{t.about[`v${n}k`]}</span>
                  <h3>{t.about[`v${n}t`]}</h3>
                  <p>{t.about[`v${n}d`]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="wrap">
          <div className="gallery">
            <figure>
              <div className="frame reveal-img"><Img src={IMG.library} /></div>
              <figcaption className="mono"><span>{t.about.g1}</span><span>{t.about.gk}</span></figcaption>
            </figure>
            <figure>
              <div className="frame reveal-img"><Img src={IMG.justice} /></div>
              <figcaption className="mono"><span>{t.about.g2}</span><span>MMIV</span></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <p className="mono mark">§ — {t.process.eyebrow}</p>
            <div><Html as="h2" html={t.process.title} /></div>
          </div>
          <div className="steps" id="steps">
            <svg className="path" preserveAspectRatio="none" viewBox="0 0 100 24" aria-hidden="true">
              <line className="base" x1="0" y1="12" x2="100" y2="12" vectorEffect="non-scaling-stroke" />
              <line id="stepLine" x1="0" y1="12" x2="100" y2="12" vectorEffect="non-scaling-stroke" />
            </svg>
            {t.process.items.map((it, i) => (
              <div className="step" key={i}>
                <span className="dot" /><span className="mono">0{i + 1} / 04</span>
                <h3>{it.t}</h3><p>{it.d}</p>
              </div>
            ))}
          </div>
          <div className="figures" style={{ marginTop: "clamp(4rem,9vw,7rem)" }}>
            <div className="fig"><strong data-count="500" data-prefix="+">+500</strong><span>{t.fig.a}</span></div>
            <div className="fig"><strong data-count="98" data-suffix="%">98%</strong><span>{t.fig.b}</span></div>
            <div className="fig"><strong data-count="20">20</strong><span>{t.fig.c}</span></div>
            <div className="fig"><strong data-count="15">15</strong><span>{t.fig.d}</span></div>
          </div>
          <div className="next-row rv">
            <TLink to="/equipo" className="btn btn-fill magnetic"><span>{t.home.teamMore}</span><Arrow /></TLink>
            <TLink to="/practica" className="btn btn-ghost magnetic"><span>{t.home.practiceAll}</span></TLink>
          </div>
        </div>
      </section>
    </div>
  );
}
