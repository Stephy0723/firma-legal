import { useRef, type FormEvent } from "react";
import { useLang } from "../i18n";
import { IMG } from "../content";
import PageHeader from "../components/PageHeader";
import { usePageMotion } from "../components/usePageMotion";
import { Arrow, Img } from "../components/ui";
import { toast } from "../motion";

export default function Contact() {
  const { t, lang } = useLang();
  const page = useRef<HTMLDivElement>(null);
  usePageMotion(page, [lang]);
  const p = t.pages.contact, c = t.contact;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget, v = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value.trim();
    if (!v("name") || !/\S+@\S+\.\S+/.test(v("email")) || !v("area")) { toast(c.err); return; }
    toast(c.ok); f.reset();
  };
  const copy = (v: string) => {
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(v).then(() => toast(c.copied)).catch(() => toast(v));
    else toast(v);
  };

  return (
    <div ref={page} className="i18n-fade">
      <PageHeader num="IV" eyebrow={p.eyebrow} title={p.title} lede={p.lede} image={IMG.building} />
      <section className="sec contact">
        <div className="wrap contact-grid">
          <div>
            <p className="contact-intro">{c.intro}</p>
            <form className="form rv-group" onSubmit={submit} noValidate>
              <div className="row2">
                <div className="field"><input id="f-name" name="name" placeholder=" " required autoComplete="name" /><label htmlFor="f-name">{c.name}</label></div>
                <div className="field"><input id="f-phone" name="phone" type="tel" placeholder=" " autoComplete="tel" /><label htmlFor="f-phone">{c.phone}</label></div>
              </div>
              <div className="field"><input id="f-email" name="email" type="email" placeholder=" " required autoComplete="email" /><label htmlFor="f-email">{c.email}</label></div>
              <div className="field">
                <select id="f-area" name="area" required defaultValue="">
                  <option value="" disabled hidden />
                  {t.practice.items.map((it, i) => <option value={i} key={i}>{it.t}</option>)}
                  <option value="other">{c.other}</option>
                </select>
                <label htmlFor="f-area">{c.area}</label>
              </div>
              <div className="field"><textarea id="f-msg" name="msg" placeholder=" " rows={4} /><label htmlFor="f-msg">{c.msg}</label></div>
              <div><button type="submit" className="btn btn-fill magnetic"><span>{c.send}</span><Arrow /></button></div>
            </form>
          </div>
          <aside>
            <div className="contact-photo reveal-img"><Img src={IMG.office} /></div>
            <div className="info rv-group">
              <div className="info-row"><span className="mono">{c.l1}</span><div><span>+1 (809) 555-0100</span><br /><button type="button" className="copy" onClick={() => copy("+1 (809) 555-0100")}>{c.copy}</button></div></div>
              <div className="info-row"><span className="mono">{c.l2}</span><div><span>contacto@steliantfirma.com</span><br /><button type="button" className="copy" onClick={() => copy("contacto@steliantfirma.com")}>{c.copy}</button></div></div>
              <div className="info-row"><span className="mono">{c.l3}</span><div>{c.addr}</div></div>
              <div className="info-row"><span className="mono">{c.l4}</span><div>{c.hours}</div></div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
