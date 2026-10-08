import { useEffect } from "react";
import { T, ROMAN, ICONS, PEOPLE, CLIENTS, IMG } from "./content";
import { initExperience } from "./experience";

const es = T.es;
const Arrow = () => (
  <svg className="arr" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2 8h12M9 3l5 5-5 5" /></svg>
);
const Close = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
const Img = ({ src, alt = "" }: { src: string; alt?: string }) => (
  <img className="ph" src={src} alt={alt} loading="lazy" decoding="async" />
);

export default function App() {
  useEffect(() => initExperience(), []);

  return (
    <>
      <div id="loader" aria-hidden="true">
        <div className="ld-inner">
          <div className="ld-word"><span>Steliant</span></div>
          <div className="ld-bar"><i /></div>
          <div className="mono ld-count">000</div>
        </div>
      </div>

      <div className="cursor" aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" />

      <header className="nav" id="nav">
        <div className="wrap nav-in">
          <a href="#top" className="brand" data-scroll aria-label="Steliant Firma">
            <svg className="brand-seal" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" style={{ color: "var(--brass)" }}>
              <circle cx="20" cy="20" r="19" /><circle cx="20" cy="20" r="15.5" strokeDasharray="1 2" />
              <path d="M20 9v20M12 14h16M12 14l-3.5 8h7zM28 14l-3.5 8h7zM15 29h10" />
            </svg>
            <span><b>Steliant Firma</b><small data-i18n="nav.tag">{es.nav.tag}</small></span>
          </a>
          <ul className="nav-links">
            <li><a href="#firma" data-scroll data-i18n="nav.firm">{es.nav.firm}</a></li>
            <li><a href="#practica" data-scroll data-i18n="nav.practice">{es.nav.practice}</a></li>
            <li><a href="#metodo" data-scroll data-i18n="nav.method">{es.nav.method}</a></li>
            <li><a href="#equipo" data-scroll data-i18n="nav.team">{es.nav.team}</a></li>
            <li><a href="#contacto" data-scroll data-i18n="nav.contact">{es.nav.contact}</a></li>
          </ul>
          <div className="nav-tools">
            <div className="seg" role="group" aria-label="Idioma / Language">
              <span className="pill" />
              <button type="button" data-lang="es" aria-pressed="true">ES</button>
              <button type="button" data-lang="en" aria-pressed="false">EN</button>
            </div>
            <button type="button" className="icon-btn theme-btn" id="themeBtn" data-i18n-aria="nav.theme" aria-label={es.nav.theme}>
              <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" /></svg>
              <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
            </button>
            <a href="#contacto" data-scroll className="btn btn-fill nav-cta magnetic"><span data-i18n="nav.cta">{es.nav.cta}</span></a>
            <button type="button" className="icon-btn burger" id="burger" aria-label="Menú" aria-expanded="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 8h16M4 16h16" /></svg>
            </button>
          </div>
        </div>
      </header>

      <nav className="menu" id="menu" aria-label="Menú">
        <button type="button" className="icon-btn menu-close" id="menuClose" aria-label="Cerrar"><Close /></button>
        <ol>
          {(["firm", "practice", "method", "team", "contact"] as const).map((k, i) => (
            <li key={k}>
              <a href={["#firma", "#practica", "#metodo", "#equipo", "#contacto"][i]} data-scroll>
                <span>§ {ROMAN[i]}</span><b data-i18n={`nav.${k}`}>{es.nav[k]}</b>
              </a>
            </li>
          ))}
        </ol>
        <div className="menu-foot mono"><span>+1 (809) 555-0100</span><span>contacto@steliantfirma.com</span></div>
      </nav>

      <main id="top">
        {/* HERO */}
        <section className="hero" aria-labelledby="h1">
          <canvas id="scene" aria-hidden="true" />
          <div className="wrap hero-grid">
            <div>
              <p className="mono mark hero-in" data-i18n="hero.eyebrow">{es.hero.eyebrow}</p>
              <h1 id="h1" data-i18n-html="hero.title" dangerouslySetInnerHTML={{ __html: es.hero.title }} />
              <p className="hero-lede hero-in" data-i18n="hero.lede">{es.hero.lede}</p>
              <div className="hero-actions hero-in">
                <a href="#contacto" data-scroll className="btn btn-fill magnetic"><span data-i18n="hero.cta1">{es.hero.cta1}</span><Arrow /></a>
                <a href="#practica" data-scroll className="btn btn-ghost magnetic"><span data-i18n="hero.cta2">{es.hero.cta2}</span></a>
              </div>
              <div className="hero-trust hero-in">
                <div><strong data-count="500" data-prefix="+">+500</strong><span data-i18n="hero.t1">{es.hero.t1}</span></div>
                <div><strong data-count="98" data-suffix="%">98%</strong><span data-i18n="hero.t2">{es.hero.t2}</span></div>
                <div><strong>24/7</strong><span data-i18n="hero.t3">{es.hero.t3}</span></div>
              </div>
            </div>
            <div className="hero-side hero-in">
              <div className="scroll-hint mono"><span data-i18n="hero.scroll">{es.hero.scroll}</span><i /></div>
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true"><div className="marquee-track" id="marquee" /></div>

        {/* ABOUT */}
        <section className="sec" id="firma" aria-labelledby="about-h">
          <div className="wrap">
            <div className="about-grid">
              <p className="mono mark" id="about-h">§ I — <span data-i18n="about.eyebrow">{es.about.eyebrow}</span></p>
              <div>
                <p className="about-big" id="aboutBig" data-i18n="about.big">{es.about.big}</p>
                <div className="about-cols">
                  {([1, 2, 3] as const).map((n) => (
                    <div className="value rv" key={n}>
                      <span className="mono" data-i18n={`about.v${n}k`}>{es.about[`v${n}k`]}</span>
                      <h3 data-i18n={`about.v${n}t`}>{es.about[`v${n}t`]}</h3>
                      <p data-i18n={`about.v${n}d`}>{es.about[`v${n}d`]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="gallery">
              <figure>
                <div className="frame reveal-img"><Img src={IMG.library} alt="" /></div>
                <figcaption className="mono"><span data-i18n="about.g1">{es.about.g1}</span><span data-i18n="about.gk">{es.about.gk}</span></figcaption>
              </figure>
              <figure>
                <div className="frame reveal-img"><Img src={IMG.justice} alt="" /></div>
                <figcaption className="mono"><span data-i18n="about.g2">{es.about.g2}</span><span>MMIV</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* PRACTICE */}
        <section className="practice" id="practica" aria-labelledby="pr-h">
          <div className="practice-pin" id="practicePin">
            <div className="wrap sec-head">
              <p className="mono mark">§ II — <span data-i18n="practice.eyebrow">{es.practice.eyebrow}</span></p>
              <div>
                <h2 id="pr-h" data-i18n-html="practice.title" dangerouslySetInnerHTML={{ __html: es.practice.title }} />
                <p className="sub" data-i18n="practice.sub">{es.practice.sub}</p>
              </div>
            </div>
            <div className="track" id="track">
              {es.practice.items.map((it, i) => (
                <button type="button" className="card" data-i={i} data-cursor="view" key={i}>
                  <span className="shot"><Img src={IMG.practice[i]} /><span className="num">{ROMAN[i]}</span></span>
                  <svg className="ico" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[i] }} />
                  <h3 data-i18n={`practice.items.${i}.t`}>{it.t}</h3>
                  <p data-i18n={`practice.items.${i}.d`}>{it.d}</p>
                  <span className="more"><span data-i18n="practice.more">{es.practice.more}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 19L19 5M8 5h11v11" /></svg></span>
                </button>
              ))}
              <div className="track-end">
                <p data-i18n="practice.end">{es.practice.end}</p>
                <a href="#contacto" data-scroll className="btn btn-fill magnetic" style={{ justifySelf: "start", width: "max-content" }}><span data-i18n="practice.endcta">{es.practice.endcta}</span></a>
              </div>
            </div>
            <div className="progress"><i id="trackProg" /></div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="sec" id="metodo" aria-labelledby="pc-h">
          <div className="wrap">
            <div className="sec-head">
              <p className="mono mark">§ III — <span data-i18n="process.eyebrow">{es.process.eyebrow}</span></p>
              <div><h2 id="pc-h" data-i18n-html="process.title" dangerouslySetInnerHTML={{ __html: es.process.title }} /></div>
            </div>
            <div className="steps" id="steps">
              <svg className="path" preserveAspectRatio="none" viewBox="0 0 100 24" aria-hidden="true">
                <line className="base" x1="0" y1="12" x2="100" y2="12" vectorEffect="non-scaling-stroke" />
                <line id="stepLine" x1="0" y1="12" x2="100" y2="12" vectorEffect="non-scaling-stroke" />
              </svg>
              {es.process.items.map((it, i) => (
                <div className="step" key={i}>
                  <span className="dot" /><span className="mono">0{i + 1} / 04</span>
                  <h3 data-i18n={`process.items.${i}.t`}>{it.t}</h3>
                  <p data-i18n={`process.items.${i}.d`}>{it.d}</p>
                </div>
              ))}
            </div>
            <div className="figures" style={{ marginTop: "clamp(4rem,9vw,7rem)" }}>
              <div className="fig"><strong data-count="500" data-prefix="+">+500</strong><span data-i18n="fig.a">{es.fig.a}</span></div>
              <div className="fig"><strong data-count="98" data-suffix="%">98%</strong><span data-i18n="fig.b">{es.fig.b}</span></div>
              <div className="fig"><strong data-count="20">20</strong><span data-i18n="fig.c">{es.fig.c}</span></div>
              <div className="fig"><strong data-count="15">15</strong><span data-i18n="fig.d">{es.fig.d}</span></div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="sec" id="equipo" aria-labelledby="tm-h" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <p className="mono mark">§ IV — <span data-i18n="team.eyebrow">{es.team.eyebrow}</span></p>
              <div>
                <h2 id="tm-h" data-i18n-html="team.title" dangerouslySetInnerHTML={{ __html: es.team.title }} />
                <p className="sub" data-i18n="team.sub">{es.team.sub}</p>
              </div>
            </div>
            <div className="team" id="team">
              {PEOPLE.map((n, i) => (
                <article className="member" tabIndex={0} data-cursor="view" key={n}>
                  <div className="medal">
                    <Img src={IMG.team[i]} alt={n} />
                    <canvas data-seed={i} />
                    <div className="tag"><span data-i18n={`team.items.${i}.s`}>{es.team.items[i].s}</span></div>
                  </div>
                  <div>
                    <p className="role" data-i18n={`team.items.${i}.r`}>{es.team.items[i].r}</p>
                    <h3>{i % 2 ? "Dra." : "Dr."} {n}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sec quotes" aria-labelledby="qt-h">
          <div className="q-bg" aria-hidden="true"><Img src={IMG.statue} /></div>
          <div className="wrap q-stage">
            <div>
              <p className="mono mark" id="qt-h"><span data-i18n="quotes.eyebrow">{es.quotes.eyebrow}</span></p>
              <span className="mono sample" data-i18n="quotes.sample">{es.quotes.sample}</span>
              <div className="q-glyph" aria-hidden="true">“</div>
            </div>
            <div>
              <div className="q-list" id="qList" aria-live="polite">
                {CLIENTS.map((n, i) => (
                  <figure className={`q-item${i === 0 ? " is-active" : ""}`} style={{ margin: 0 }} key={n}>
                    <blockquote data-i18n={`quotes.items.${i}.q`}>{es.quotes.items[i].q}</blockquote>
                    <figcaption className="q-who">
                      <span className="av">{n.replace(/[^A-Z]/g, "").slice(0, 2)}</span>
                      <span><b>{n}</b><small data-i18n={`quotes.items.${i}.r`}>{es.quotes.items[i].r}</small></span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="q-nav">
                <button type="button" className="icon-btn" id="qPrev" data-i18n-aria="quotes.prev" aria-label={es.quotes.prev}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M15 6l-6 6 6 6" /></svg></button>
                <button type="button" className="icon-btn" id="qNext" data-i18n-aria="quotes.next" aria-label={es.quotes.next}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 6l6 6-6 6" /></svg></button>
                <div className="q-bars" id="qBars">{CLIENTS.map((n) => <i key={n}><b /></i>)}</div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="sec contact" id="contacto" aria-labelledby="ct-h">
          <div className="wrap contact-grid">
            <div>
              <p className="mono mark">§ V — <span data-i18n="contact.eyebrow">{es.contact.eyebrow}</span></p>
              <h2 id="ct-h" style={{ marginTop: "1.4rem" }} data-i18n-html="contact.title" dangerouslySetInnerHTML={{ __html: es.contact.title }} />
              <form className="form" id="form" noValidate>
                <div className="row2">
                  <div className="field"><input id="f-name" name="name" placeholder=" " required autoComplete="name" /><label htmlFor="f-name" data-i18n="contact.name">{es.contact.name}</label></div>
                  <div className="field"><input id="f-phone" name="phone" type="tel" placeholder=" " autoComplete="tel" /><label htmlFor="f-phone" data-i18n="contact.phone">{es.contact.phone}</label></div>
                </div>
                <div className="field"><input id="f-email" name="email" type="email" placeholder=" " required autoComplete="email" /><label htmlFor="f-email" data-i18n="contact.email">{es.contact.email}</label></div>
                <div className="field"><select id="f-area" name="area" required defaultValue="" /><label htmlFor="f-area" data-i18n="contact.area">{es.contact.area}</label></div>
                <div className="field"><textarea id="f-msg" name="msg" placeholder=" " rows={4} /><label htmlFor="f-msg" data-i18n="contact.msg">{es.contact.msg}</label></div>
                <div><button type="submit" className="btn btn-fill magnetic"><span data-i18n="contact.send">{es.contact.send}</span><Arrow /></button></div>
              </form>
            </div>
            <aside>
              <div className="contact-photo reveal-img"><Img src={IMG.office} alt="" /></div>
              <p className="sub" style={{ color: "var(--muted)", maxWidth: "44ch", marginBottom: "2rem" }} data-i18n="contact.intro">{es.contact.intro}</p>
              <div className="info">
                <div className="info-row"><span className="mono" data-i18n="contact.l1">{es.contact.l1}</span><div><span>+1 (809) 555-0100</span><br /><button type="button" className="copy" data-copy="+1 (809) 555-0100" data-i18n="contact.copy">{es.contact.copy}</button></div></div>
                <div className="info-row"><span className="mono" data-i18n="contact.l2">{es.contact.l2}</span><div><span>contacto@steliantfirma.com</span><br /><button type="button" className="copy" data-copy="contacto@steliantfirma.com" data-i18n="contact.copy">{es.contact.copy}</button></div></div>
                <div className="info-row"><span className="mono" data-i18n="contact.l3">{es.contact.l3}</span><div data-i18n="contact.addr">{es.contact.addr}</div></div>
                <div className="info-row"><span className="mono" data-i18n="contact.l4">{es.contact.l4}</span><div data-i18n="contact.hours">{es.contact.hours}</div></div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-top">
            <p className="mono" data-i18n="foot.tag">{es.foot.tag}</p>
            <nav className="foot-links" aria-label="Footer">
              <a href="#firma" data-scroll data-i18n="nav.firm">{es.nav.firm}</a>
              <a href="#practica" data-scroll data-i18n="nav.practice">{es.nav.practice}</a>
              <a href="#equipo" data-scroll data-i18n="nav.team">{es.nav.team}</a>
              <a href="#contacto" data-scroll data-i18n="nav.contact">{es.nav.contact}</a>
              <a href="#top" data-scroll data-i18n="foot.top">{es.foot.top}</a>
            </nav>
          </div>
          <div className="giant" id="giant" aria-hidden="true">Steliant</div>
          <div className="foot-bottom mono"><span>© 2026 Steliant Firma</span><span data-i18n="foot.credit">{es.foot.credit}</span></div>
        </div>
      </footer>

      <div className="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <div className="modal-bg" data-close />
        <div className="sheet">
          <button type="button" className="icon-btn sheet-close" data-close data-i18n-aria="modal.close" aria-label={es.modal.close}><Close /></button>
          <p className="mono mark" id="mKicker" />
          <h3 id="mTitle" />
          <div className="sheet-grid"><p id="mDesc" /><ul id="mList" /></div>
          <div style={{ marginTop: "2.4rem" }}>
            <a href="#contacto" className="btn btn-fill" data-scroll data-close><span data-i18n="modal.cta">{es.modal.cta}</span><Arrow /></a>
          </div>
        </div>
      </div>

      <div className="toast" id="toast" role="status" />
    </>
  );
}
