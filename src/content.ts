export const ROMAN = ["I","II","III","IV","V","VI"];
export const ICONS = [
  '<path d="M24 6v34M10 12h28M10 12l-6 14h12zM38 12l-6 14h12zM16 40h16"/>',
  '<path d="M14 18l10-10 8 8-10 10zM19 13l8 8M22 22l14 14M8 40h20"/>',
  '<path d="M10 42V8h20v34M30 18h8v24M15 14h4M21 14h4M15 21h4M21 21h4M15 28h4M21 28h4M6 42h36"/>',
  '<circle cx="16" cy="14" r="5"/><circle cx="32" cy="16" r="4"/><path d="M6 40c0-7 4-13 10-13s10 6 10 13M24 40c0-6 3-11 8-11s8 5 8 11"/>',
  '<path d="M12 6h18l8 8v28H12zM30 6v8h8M18 22h14M18 28h14M18 34h9"/>',
  '<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c-6 6-6 28 0 34M24 7c6 6 6 28 0 34"/>'
];
const es = {
  nav:{tag:"Asuntos jurídicos",home:"Inicio",firm:"La Firma",practice:"Práctica",method:"Método",team:"Equipo",contact:"Contacto",cta:"Agendar consulta",theme:"Cambiar tema"},
  hero:{eyebrow:"Firma legal · Fundada en MMIV",title:'<span class="line"><span>Excelencia</span></span><span class="line"><span>jurídica al servicio</span></span><span class="line"><span>de <em>su patrimonio</em></span></span>',
    lede:"Más de dos décadas defendiendo los intereses de personas, empresas y familias con compromiso, precisión y resultados medibles en cada jurisdicción.",
    cta1:"Agendar consulta gratuita",cta2:"Áreas de práctica",t1:"Casos resueltos",t2:"Satisfacción",t3:"Atención a clientes",scroll:"Desplazar"},
  marquee:["Derecho Civil","Derecho Penal","Corporativo","Familia","Laboral","Internacional"],
  about:{eyebrow:"La Firma",big:"Fundada en 2004, Steliant Firma combina la rigurosidad académica con un profundo conocimiento práctico del derecho nacional e internacional. Cada caso recibe un equipo multidisciplinario y una estrategia diseñada a la medida.",
    v1k:"Art. 1 — Principio",v1t:"Integridad",v1d:"La ética profesional es el pilar de cada actuación, dentro y fuera del tribunal.",
    v2k:"Art. 2 — Principio",v2t:"Compromiso",v2d:"Dedicación absoluta a los intereses del cliente, con comunicación clara en cada etapa.",
    v3k:"Art. 3 — Principio",v3t:"Precisión",v3d:"Estrategias medibles, plazos claros y un expediente que siempre está al día.",
    g1:"Fig. 1 — Biblioteca de jurisprudencia",g2:"Fig. 2 — Iustitia",gk:"Archivo de la firma"},
  practice:{eyebrow:"Práctica",title:"Seis áreas, <em>un solo estándar</em>",sub:"Cobertura completa en las principales ramas del derecho, con especialistas dedicados a cada una. Seleccione un área para ver el detalle.",more:"Ver detalle",title_t:"Título",end:"¿Su caso no encaja en una sola área?",endcta:"Hablemos",
    items:[
     {t:"Derecho Civil",d:"Contratos, obligaciones, responsabilidad civil y reclamaciones patrimoniales.",f:"Especialistas en la protección de derechos patrimoniales y personales. Asesoría integral en la redacción, negociación e interpretación de contratos, y resolución de conflictos civiles por vía judicial y extrajudicial.",l:["Redacción y revisión de contratos civiles y mercantiles","Reclamaciones por daños y perjuicios","Cobro judicial y extrajudicial de deudas","Derecho inmobiliario y registral","Disputas sobre propiedad y posesión","Responsabilidad civil contractual y extracontractual"]},
     {t:"Derecho Penal",d:"Defensa técnica integral en todas las etapas del proceso penal.",f:"Defensa y representación de personas físicas y jurídicas ante la jurisdicción penal, desde la investigación hasta los recursos extraordinarios.",l:["Defensa en investigación y juicio oral","Recursos de apelación y casación","Delitos económicos y financieros","Delitos contra la propiedad","Asistencia en detenciones y medidas cautelares","Querella y acusación particular"]},
     {t:"Corporativo",d:"Estructuras societarias, fusiones, adquisiciones y gobierno corporativo.",f:"Acompañamos a empresas nacionales e internacionales en todo su ciclo de vida: de la constitución a operaciones complejas de fusión y adquisición, con cumplimiento normativo en cada paso.",l:["Constitución y disolución de sociedades","Fusiones, adquisiciones y reestructuraciones","Gobierno corporativo y compliance","Contratos comerciales y joint ventures","Due diligence legal","Asesoría a juntas directivas y accionistas"]},
     {t:"Familia",d:"Divorcios, custodia, pensiones alimenticias y sucesiones.",f:"Cada caso familiar se trata con sensibilidad y determinación, buscando soluciones que protejan a todas las partes, en especial a los menores.",l:["Divorcios contenciosos y de mutuo acuerdo","Custodia y régimen de visitas","Pensiones alimenticias y compensatorias","Liquidación de bienes gananciales","Adopciones y filiación","Testamentos, herencias y sucesiones"]},
     {t:"Laboral",d:"Relaciones laborales, contratos y litigios sociales.",f:"Representación integral para empleadores y trabajadores. Prevenimos conflictos y, cuando surgen, los resolvemos de forma eficiente.",l:["Despidos improcedentes y nulos","Contratos de trabajo","Acoso laboral y discriminación","Reclamaciones salariales y prestaciones","Seguridad social y accidentes laborales","Mediación y conciliación"]},
     {t:"Internacional",d:"Arbitraje comercial, contratos internacionales y disputas transfronterizas.",f:"Resolución de disputas comerciales transfronterizas y asesoría en comercio internacional, con experiencia ante tribunales arbitrales y una red de corresponsales.",l:["Arbitraje comercial internacional","Contratos de comercio exterior","Inversión extranjera y regulación","Tratados bilaterales de inversión","Disputas transfronterizas","Compliance internacional"]}
    ]},
  process:{eyebrow:"Método",title:"De la primera consulta <em>a la resolución</em>",items:[
     {t:"Consulta",d:"Escuchamos el caso completo y evaluamos su viabilidad sin costo."},
     {t:"Análisis",d:"Revisión documental, jurisprudencia aplicable y riesgos reales."},
     {t:"Estrategia",d:"Un plan con escenarios, plazos y honorarios por escrito."},
     {t:"Resolución",d:"Negociación o litigio, con reportes de avance en cada etapa."}]},
  fig:{a:"Casos con resultado favorable",b:"Clientes satisfechos",c:"Años de ejercicio",d:"Abogados especializados"},
  team:{eyebrow:"Equipo",title:"Socios que firman <em>cada estrategia</em>",sub:"Un equipo con formación en Santo Domingo, Salamanca y Barcelona, presente en cada audiencia.",view:"Perfil",
    items:[
      {r:"Socio fundador",s:"Penal y litigación",b:"Más de 25 años al frente de casos de alto perfil en tribunales nacionales e internacionales. Combina rigor académico con una lectura práctica del sistema judicial.",e:["Doctor en Derecho — UASD","Máster en Derecho Penal Internacional — Salamanca"]},
      {r:"Socia directora",s:"Civil y patrimonial",b:"Especialista en contratos complejos y protección patrimonial. Su capacidad negociadora resuelve disputas civiles de gran envergadura antes de llegar a juicio.",e:["Doctora en Derecho Civil — PUCMM","Especialización en Derecho Inmobiliario — UNIBE"]},
      {r:"Socio sénior",s:"Corporativo y M&A",b:"Ha acompañado a más de 50 empresas en fusiones, adquisiciones y reestructuraciones, con operaciones de proyección internacional.",e:["Doctor en Derecho Empresarial — UNIBE","MBA — Barna Business School"]},
      {r:"Directora de área",s:"Familia y sucesiones",b:"Acompaña procesos familiares delicados con sensibilidad y firmeza, priorizando acuerdos que protejan a los menores y al patrimonio familiar.",e:["Licenciada en Derecho — PUCMM","Máster en Derecho de Familia — Barcelona"]}]},
  quotes:{eyebrow:"Testimonios",sample:"Contenido de ejemplo",prev:"Anterior",next:"Siguiente",items:[
     {q:"Manejaron nuestro caso corporativo con una precisión excepcional. Nos guiaron en cada paso y el resultado superó lo que esperábamos.",r:"Directora general, grupo inversor"},
     {q:"Frente a una disputa compleja demostraron una capacidad estratégica impresionante. Los recomiendo sin reservas.",r:"Director ejecutivo, holding financiero"},
     {q:"En un proceso familiar delicado actuaron con sensibilidad y firmeza. Su asesoría fue clave para un acuerdo justo.",r:"Arquitecta y empresaria"}]},
  contact:{eyebrow:"Contacto",title:"Hablemos de <em>su caso</em>",name:"Nombre completo",phone:"Teléfono",email:"Correo electrónico",area:"Área de interés",msg:"Describa brevemente su situación",send:"Solicitar consulta",
    intro:"Cada situación legal es única. Un miembro del equipo le contactará en menos de 24 horas para una evaluación inicial sin compromiso.",
    l1:"Teléfono",l2:"Correo",l3:"Oficina",l4:"Horario",addr:"Torre Empresarial, piso 12 · Santo Domingo",hours:"Lun – Vie · 8:30 – 18:00",copy:"Copiar",other:"Otro",
    ok:"Esta es una demostración: el formulario no envía mensajes.",err:"Complete nombre, correo y área para continuar.",copied:"Copiado al portapapeles"},
  pages:{
    firm:{eyebrow:"La Firma",title:"Tradición jurídica <em>con visión moderna</em>",lede:"Dos décadas construyendo una práctica legal rigurosa, cercana y medible."},
    practice:{eyebrow:"Práctica",title:"Seis áreas, <em>un solo estándar</em>",lede:"Especialistas dedicados en cada rama del derecho. Elija un área para conocer cómo trabajamos."},
    team:{eyebrow:"Equipo",title:"Socios que firman <em>cada estrategia</em>",lede:"Abogados con formación internacional, presentes en cada audiencia y cada negociación."},
    contact:{eyebrow:"Contacto",title:"Hablemos de <em>su caso</em>",lede:"Primera evaluación sin compromiso. Respuesta en menos de 24 horas."}
  },
  home:{aboutMore:"Conocer la firma",practiceAll:"Ver todas las áreas",teamMore:"Conocer al equipo",ctaTitle:"¿Listo para proteger <em>lo que ha construido</em>?",ctaText:"Agende una consulta inicial gratuita con un socio de la firma.",ctaBtn:"Agendar consulta"},
  detail:{back:"Todas las áreas",includes:"Qué incluye",approach:"Cómo lo abordamos",next:"Siguiente área",cta:"Consultar sobre esta área",lead:"Socio a cargo"},
  teamPage:{edu:"Formación",spec:"Especialidad",write:"Escribir"},
  foot:{tag:"Excelencia jurídica · Desde MMIV",top:"Volver arriba ↑",credit:"Plantilla diseñada por Steliant"},
  modal:{close:"Cerrar",cta:"Consultar sobre esta área"}
 };

const en: typeof es = {
  nav:{tag:"Legal affairs",home:"Home",firm:"The Firm",practice:"Practice",method:"Method",team:"Team",contact:"Contact",cta:"Book a consultation",theme:"Toggle theme"},
  hero:{eyebrow:"Law firm · Founded MMIV",title:'<span class="line"><span>Legal excellence</span></span><span class="line"><span>in service of</span></span><span class="line"><span>what <em>you’ve built</em></span></span>',
    lede:"Over two decades defending the interests of individuals, companies and families with commitment, precision and measurable results in every jurisdiction.",
    cta1:"Book a free consultation",cta2:"Practice areas",t1:"Cases resolved",t2:"Satisfaction",t3:"Client support",scroll:"Scroll"},
  marquee:["Civil Law","Criminal Law","Corporate","Family","Employment","International"],
  about:{eyebrow:"The Firm",big:"Founded in 2004, Steliant Firma pairs academic rigor with deep practical knowledge of domestic and international law. Every case gets a multidisciplinary team and a strategy built to measure.",
    v1k:"Art. 1 — Principle",v1t:"Integrity",v1d:"Professional ethics underpin every action, in and out of the courtroom.",
    v2k:"Art. 2 — Principle",v2t:"Commitment",v2d:"Full dedication to the client’s interests, with clear communication at every stage.",
    v3k:"Art. 3 — Principle",v3t:"Precision",v3d:"Measurable strategies, clear timelines and a case file that is always up to date.",
    g1:"Fig. 1 — Case-law library",g2:"Fig. 2 — Iustitia",gk:"Firm archive"},
  practice:{eyebrow:"Practice",title:"Six areas, <em>one standard</em>",sub:"Full coverage across the main branches of law, with dedicated specialists in each. Select an area to see the details.",more:"View details",title_t:"Title",end:"Does your case span more than one area?",endcta:"Let’s talk",
    items:[
     {t:"Civil Law",d:"Contracts, obligations, civil liability and property claims.",f:"Specialists in protecting property and personal rights. Full counsel on drafting, negotiating and interpreting contracts, and resolving civil disputes in and out of court.",l:["Drafting and review of civil and commercial contracts","Damages claims","Judicial and out-of-court debt collection","Real estate and registry law","Property and possession disputes","Contractual and tort liability"]},
     {t:"Criminal Law",d:"Full technical defense at every stage of criminal proceedings.",f:"Defense and representation of individuals and companies in criminal courts, from investigation through extraordinary appeals.",l:["Defense during investigation and trial","Appeals and cassation","Economic and financial crimes","Property crimes","Assistance with arrests and precautionary measures","Private prosecution"]},
     {t:"Corporate",d:"Corporate structures, mergers, acquisitions and governance.",f:"We support domestic and international companies through their whole life cycle, from incorporation to complex M&A, with regulatory compliance at every step.",l:["Incorporation and dissolution","Mergers, acquisitions and restructuring","Corporate governance and compliance","Commercial contracts and joint ventures","Legal due diligence","Board and shareholder advisory"]},
     {t:"Family",d:"Divorce, custody, support and succession.",f:"Every family matter is handled with sensitivity and resolve, seeking outcomes that protect everyone involved, especially children.",l:["Contested and uncontested divorce","Custody and visitation","Child and spousal support","Division of marital property","Adoption and parentage","Wills, estates and succession"]},
     {t:"Employment",d:"Labor relations, contracts and employment litigation.",f:"Full representation for employers and employees. We prevent disputes and, when they arise, resolve them efficiently.",l:["Wrongful and void dismissals","Employment contracts","Workplace harassment and discrimination","Wage and benefit claims","Social security and workplace accidents","Mediation and conciliation"]},
     {t:"International",d:"Commercial arbitration, international contracts and cross-border disputes.",f:"Cross-border commercial dispute resolution and international trade counsel, with experience before arbitral tribunals and a network of correspondents.",l:["International commercial arbitration","Foreign trade contracts","Foreign investment and regulation","Bilateral investment treaties","Cross-border disputes","International compliance"]}
    ]},
  process:{eyebrow:"Method",title:"From first consultation <em>to resolution</em>",items:[
     {t:"Consultation",d:"We hear the full case and assess its viability at no cost."},
     {t:"Analysis",d:"Document review, applicable case law and the real risks."},
     {t:"Strategy",d:"A written plan with scenarios, timelines and fees."},
     {t:"Resolution",d:"Negotiation or litigation, with progress reports at every stage."}]},
  fig:{a:"Cases with a favorable outcome",b:"Satisfied clients",c:"Years in practice",d:"Specialized attorneys"},
  team:{eyebrow:"Team",title:"Partners who sign <em>every strategy</em>",sub:"A team trained in Santo Domingo, Salamanca and Barcelona, present at every hearing.",view:"Profile",
    items:[
      {r:"Founding partner",s:"Criminal & litigation",b:"Over 25 years leading high-profile cases in domestic and international courts. Pairs academic rigor with a practical read of the judicial system.",e:["Doctor of Law — UASD","Master’s in International Criminal Law — Salamanca"]},
      {r:"Managing partner",s:"Civil & property",b:"Specialist in complex contracts and asset protection. Her negotiating skill settles major civil disputes before they reach trial.",e:["Doctor of Civil Law — PUCMM","Specialization in Real Estate Law — UNIBE"]},
      {r:"Senior partner",s:"Corporate & M&A",b:"Has guided more than 50 companies through mergers, acquisitions and restructurings, including cross-border deals.",e:["Doctor of Business Law — UNIBE","MBA — Barna Business School"]},
      {r:"Practice director",s:"Family & estates",b:"Guides delicate family matters with sensitivity and firmness, favoring agreements that protect children and family assets.",e:["Law degree — PUCMM","Master’s in Family Law — Barcelona"]}]},
  quotes:{eyebrow:"Testimonials",sample:"Sample content",prev:"Previous",next:"Next",items:[
     {q:"They handled our corporate case with exceptional precision. They guided us through every step and the outcome beat our expectations.",r:"Managing director, investment group"},
     {q:"Facing a complex dispute, they showed impressive strategic ability. I recommend them without reservation.",r:"CEO, financial holding"},
     {q:"In a delicate family matter they acted with sensitivity and firmness. Their counsel was key to a fair agreement.",r:"Architect and entrepreneur"}]},
  contact:{eyebrow:"Contact",title:"Let’s discuss <em>your case</em>",name:"Full name",phone:"Phone",email:"Email",area:"Area of interest",msg:"Briefly describe your situation",send:"Request a consultation",
    intro:"Every legal situation is unique. A team member will contact you within 24 hours for an initial, no-obligation assessment.",
    l1:"Phone",l2:"Email",l3:"Office",l4:"Hours",addr:"Torre Empresarial, 12th floor · Santo Domingo",hours:"Mon – Fri · 8:30 – 18:00",copy:"Copy",other:"Other",
    ok:"This is a demo: the form doesn’t send messages.",err:"Enter your name, email and area to continue.",copied:"Copied to clipboard"},
  pages:{
    firm:{eyebrow:"The Firm",title:"Legal tradition <em>with a modern view</em>",lede:"Two decades building a rigorous, approachable and measurable legal practice."},
    practice:{eyebrow:"Practice",title:"Six areas, <em>one standard</em>",lede:"Dedicated specialists in every branch of law. Choose an area to see how we work."},
    team:{eyebrow:"Team",title:"Partners who sign <em>every strategy</em>",lede:"Internationally trained attorneys, present at every hearing and every negotiation."},
    contact:{eyebrow:"Contact",title:"Let’s discuss <em>your case</em>",lede:"A no-obligation first assessment. Reply within 24 hours."}
  },
  home:{aboutMore:"About the firm",practiceAll:"See all areas",teamMore:"Meet the team",ctaTitle:"Ready to protect <em>what you’ve built</em>?",ctaText:"Book a free initial consultation with a partner of the firm.",ctaBtn:"Book a consultation"},
  detail:{back:"All areas",includes:"What it covers",approach:"How we approach it",next:"Next area",cta:"Ask about this area",lead:"Partner in charge"},
  teamPage:{edu:"Education",spec:"Specialty",write:"Email"},
  foot:{tag:"Legal excellence · Since MMIV",top:"Back to top ↑",credit:"Template designed by Steliant"},
  modal:{close:"Close",cta:"Ask about this area"}
 };

export const T = { es, en };
export type Lang = keyof typeof T;

export const PEOPLE = ["Alejandro Vidal","Isabel Montero","Tomás Ferrer","Camila Rivas"];
export const CLIENTS = ["M. E. Rosario","R. Almonte","A. G. Tavárez"];


const U = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
export const IMG = {
  practice: [U("1450101499163-c8848c66ca85", 700), U("1589391886645-d51941baf7fb", 700), U("1436450412740-6b988f486c6b", 700),
             U("1562564055-71e051d33c19", 700), U("1423592707957-3b212afa6733", 700), U("1505547828843-176834e42154", 700)],
  team: [U("1652471943570-f3590a4e52ed", 700), U("1573497019940-1c28c88b4f3e", 700), U("1576558656222-ba66febe3dec", 700), U("1701096374092-bb70915fdc5c", 700)],
  library: U("1479142506502-19b3a3b7ff33", 1400),
  justice: U("1589994965851-a8f479c573a9", 900),
  statue: U("1589829545856-d10d557cf95f", 1000),
  office: U("1505664194779-8beaceb93744", 1800),
  gavel: U("1618771623063-6c3faa854a61", 1800),
  stairs: U("1507679799987-c73779587ccf", 1800),
  building: U("1436450412740-6b988f486c6b", 1800),
};

export const SLUGS = ["civil", "penal", "corporativo", "familia", "laboral", "internacional"];
/** Partner in charge of each practice area (index into PEOPLE). */
export const LEAD = [1, 0, 2, 3, 2, 0];
