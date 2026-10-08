import { Img } from "./ui";

type Props = { num: string; eyebrow: string; title: string; lede?: string; image: string; children?: React.ReactNode };

/** Full-bleed photographic page opener. Title lines split on <br>. */
export default function PageHeader({ num, eyebrow, title, lede, image, children }: Props) {
  // Split "A <em>B</em>" into two lines: plain part and emphasized part.
  const parts = title.split(/(?=<em>)/);
  return (
    <section className="page-head">
      <div className="ph-bg" aria-hidden="true"><Img src={image} eager /></div>
      <div className="wrap ph-content i18n-fade">
        <p className="mono mark ph-in">§ {num} — {eyebrow}</p>
        <h1>{parts.map((p, i) => <span className="ph-line" key={i}><span dangerouslySetInnerHTML={{ __html: p }} /></span>)}</h1>
        {lede && <p className="ph-lede ph-in">{lede}</p>}
        {children}
      </div>
    </section>
  );
}
