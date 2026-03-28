import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import eleineKarysRosaGilPhoto from "../assets/FTS-JRLinversiones/eleine_karys_rosa_gil.jpg";
import juanFranciscoRosaCabralPhoto from "../assets/FTS-JRLinversiones/lic._juan_francisco_rosa_cabral.jpg";
import juanCarlosPerezPhoto from "../assets/FTS-JRLinversiones/juan_carlos_pérez.jpg";
import merlinFranciscaFamiliaPhoto from "../assets/FTS-JRLinversiones/Merlín Francisca Familia.jpg";
import luzMilagrosRamirezPhoto from "../assets/FTS-JRLinversiones/Luz Milagros Ramírez.jpeg";
import nelsonRafaelAcostaBritoPhoto from "../assets/FTS-JRLinversiones/Nelson Rafael Acosta Brito.jpg";
import irisYeseniaTejadaPhoto from "../assets/FTS-JRLinversiones/Iris Yesenia Tejada.jpg";

// Interfaces
export interface ServiceData {
  id: string;
  icon: string;
  title: string;
  description: string;
  fullDescription: string;
  details: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: string;
  bio: string;
  linkedin: string;
  email: string;
  education: string[];
  achievements: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  lawyerId?: string;
  notes?: string;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
}

export interface LegalCase {
  id: string;
  client_id: string;
  lawyer_id: string;
  title: string;
  description: string;
  status: 'Evaluación' | 'En Proceso' | 'En Corte' | 'Cerrado';
  created_at?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  created_at?: string;
}

export interface DocumentInfo {
  id: string;
  title: string;
  clientName?: string;
  client_id?: string;
  folder_id?: string;
  uploadDate: string;
  type: string;
  url: string;
}

interface DataContextType {
  services: ServiceData[];
  team: TeamMember[];
  messages: ContactMessage[];
  appointments: Appointment[];
  documents: DocumentInfo[];
  addService: (service: Omit<ServiceData, 'id'>) => void;
  updateService: (id: string, service: Partial<ServiceData>) => void;
  deleteService: (id: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => void;
  markMessageRead: (id: string) => void;
  addAppointment: (app: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateAppointment: (id: string, updated: Partial<Appointment>) => void;
  addDocument: (doc: Omit<DocumentInfo, 'id' | 'uploadDate'>) => void;
  deleteDocument: (id: string) => void;

  clients: ClientData[];
  cases: LegalCase[];
  documentFolders: DocumentFolder[];
  addClient: (client: Omit<ClientData, 'id'>) => void;
  updateClient: (id: string, updated: Partial<ClientData>) => void;
  deleteClient: (id: string) => void;
  addCase: (caseData: Omit<LegalCase, 'id'>) => void;
  updateCase: (id: string, updated: Partial<LegalCase>) => void;
  deleteCase: (id: string) => void;
  addFolder: (folder: Omit<DocumentFolder, 'id'>) => void;
  deleteFolder: (id: string) => void;
}

// Initial Hardcoded Data
const initialServices: ServiceData[] = [
  {
    id: '1',
    icon: 'FaBalanceScale',
    title: "Asesoramiento en Litis Judiciales",
    description: "Representación y estrategia legal en procesos judiciales civiles, penales y contencioso-administrativos. Acompañamiento integral desde la evaluación inicial hasta la resolución del caso.",
    fullDescription: "Brindamos asesoría legal integral para litis judiciales, acompañando cada etapa del proceso con enfoque técnico, estrategia procesal y defensa rigurosa de sus derechos. Nuestro equipo evalúa cada caso de forma minuciosa para diseñar la mejor estrategia de litigio, ya sea en jurisdicción civil, penal, comercial o administrativa. Contamos con amplia experiencia en audiencias, redacción de escritos judiciales y gestión de recursos ante tribunales superiores.",
    details: ["Evaluación y estrategia personalizada del caso", "Representación en audiencias y tribunales de todas las instancias", "Preparación de escritos, demandas y recursos judiciales", "Seguimiento completo del proceso hasta sentencia firme", "Mediación y arbitraje como vías alternativas de resolución", "Ejecución de sentencias y cobros judiciales"],
  },
  {
    id: '2',
    icon: 'FaPassport',
    title: "Procesos Migratorios",
    description: "Visados, permisos de viaje para menores, regularización migratoria y trámites consulares. Gestión completa con acompañamiento personalizado para garantizar cumplimiento legal.",
    fullDescription: "Gestionamos procesos migratorios con acompañamiento personalizado y profundo conocimiento de la normativa vigente. Nuestro equipo se especializa en la obtención y renovación de visados, permisos de viaje para menores, regularización de estatus migratorio y asesoría en requisitos consulares. Trabajamos directamente con las autoridades competentes para asegurar agilidad y cumplimiento en cada trámite, minimizando tiempos de espera y riesgo de rechazo.",
    details: ["Solicitud y renovación de visados de trabajo, estudio y residencia", "Permisos de viaje para menores de edad", "Regularización y documentación migratoria completa", "Asesoría en requisitos y preparación de expedientes", "Recursos y apelaciones ante denegaciones migratorias", "Trámites consulares y legalizaciones internacionales"],
  },
  {
    id: '3',
    icon: 'FaUsers',
    title: "Derecho de Familia",
    description: "Divorcios de mutuo acuerdo y contenciosos, manutención, pensión alimentaria, custodia de menores y régimen de visitas. Soluciones con sensibilidad humana y firmeza jurídica.",
    fullDescription: "Atendemos asuntos familiares con sensibilidad humana y firmeza jurídica, buscando siempre soluciones que protejan los intereses de nuestros clientes y, especialmente, el bienestar de los menores involucrados. Nuestro equipo cuenta con experiencia en divorcios consensuales y contenciosos, demandas de pensión alimentaria, procesos de custodia, reconocimiento de paternidad y acuerdos prematrimoniales. Priorizamos la mediación familiar cuando es posible, reservando el litigio para cuando sea estrictamente necesario.",
    details: ["Divorcios de mutuo acuerdo y contenciosos", "Manutención y pensión alimentaria", "Custodia compartida y régimen de visitas", "Reconocimiento de paternidad y filiación", "Acuerdos prematrimoniales y postmatrimoniales", "Mediación familiar y resolución alternativa de conflictos"],
  },
  {
    id: '4',
    icon: 'FaBuilding',
    title: "Servicios Inmobiliarios",
    description: "Tasación profesional de inmuebles, transferencia y registro de propiedad, revisión de títulos y due diligence inmobiliario. Transacciones seguras y conformes a derecho.",
    fullDescription: "Ofrecemos asesoría y gestión completa en operaciones inmobiliarias para garantizar transacciones seguras, bien documentadas y conformes a la legislación vigente. Nuestros servicios incluyen tasación profesional de inmuebles, transferencias de propiedad, revisión exhaustiva de títulos y cargas, due diligence inmobiliario y acompañamiento legal en compraventas, arrendamientos y desarrollos urbanísticos. Protegemos la inversión de nuestros clientes en cada etapa de la operación inmobiliaria.",
    details: ["Tasación profesional de inmuebles residenciales y comerciales", "Transferencia y registro de propiedad ante la Jurisdicción Inmobiliaria", "Revisión de títulos, cargas y gravámenes", "Due diligence inmobiliario completo", "Contratos de compraventa, arrendamiento y opción de compra", "Asesoría legal en desarrollos urbanísticos y condominios"],
  },
  {
    id: '5',
    icon: 'FaCar',
    title: "Traspaso de Matrícula de Vehículo",
    description: "Gestión legal integral para traspasos vehiculares: verificación documental, preparación de expedientes, gestión de firmas y seguimiento hasta el cierre del trámite.",
    fullDescription: "Realizamos el proceso de traspaso de matrícula de vehículo de forma segura, ordenada y eficiente, verificando minuciosamente cada requisito y documento necesario. Nos encargamos de toda la gestión desde la revisión de la documentación del vehículo, preparación del expediente de traspaso, coordinación de firmas y legalizaciones, hasta el seguimiento completo del trámite ante las autoridades de tránsito. Nuestro objetivo es que la operación se complete sin contratiempos ni riesgos para las partes involucradas.",
    details: ["Revisión exhaustiva de documentación del vehículo", "Verificación de estado legal y gravámenes pendientes", "Preparación completa del expediente de traspaso", "Gestión de firmas, legalizaciones y autenticaciones", "Registro ante las autoridades de tránsito", "Seguimiento del trámite hasta su cierre definitivo"],
  },
  {
    id: '6',
    icon: 'FaFileSignature',
    title: "Actos Notariales y Contratos",
    description: "Redacción y formalización de actos notariales, contratos civiles y comerciales, poderes, declaraciones juradas y auténticas de firmas. Precisión jurídica adaptada a cada necesidad.",
    fullDescription: "Redactamos y formalizamos actos notariales y contratos con la máxima precisión jurídica, adaptados a las necesidades personales, familiares, comerciales e inmobiliarias de cada cliente. Nuestro equipo domina la redacción de contratos civiles y comerciales, elaboración de poderes generales y especiales, declaraciones juradas, auténticas de firmas, actas de asamblea y todo tipo de instrumentos notariales que requieran validez legal. Garantizamos documentos claros, completos y ejecutables ante cualquier instancia.",
    details: ["Contratos civiles, comerciales y de prestación de servicios", "Poderes generales, especiales y de representación", "Declaraciones juradas y auténticas de firmas", "Actas de asamblea y documentos societarios", "Actos notariales diversos con fe pública", "Revisión legal, certificación y formalización documental"],
  },
  {
    id: '7',
    icon: 'FaSearch',
    title: "Perito Gráfico",
    description: "Análisis forense especializado de documentos, firmas y escrituras. Detección de alteraciones documentales, falsificaciones y autenticación grafológica con más de 15 años de experiencia.",
    fullDescription: "Ofrecemos servicios especializados de peritaje gráfico y documentoscopia, con análisis forense riguroso y científico de documentos, firmas, sellos y elementos indubitativos. Nuestro equipo, liderado por peritos con más de 15 años de experiencia y certificaciones internacionales, utiliza técnicas avanzadas de análisis grafológico, detección de alteraciones documentales, evaluación de procesos de impresión y autenticación forense. Emitimos dictámenes periciales con validez legal para su uso en procesos judiciales y administrativos.",
    details: ["Análisis e investigación forense de documentos", "Peritaje especializado de firmas y escrituras manuscritas", "Detección de alteraciones, tachaduras y falsificaciones documentales", "Autenticación documental y evaluación de procesos de impresión", "Elaboración de dictámenes periciales con validez judicial", "Asesoría técnica como perito en procesos judiciales"],
  },
];

const initialTeam: TeamMember[] = [
  {
    id: '1',
    name: "Lic. Luz Milagros Ramírez",
    role: "Abogada",
    specialty: "Derecho Civil, Migratorio, Laboral y de Familia",
    image: luzMilagrosRamirezPhoto,
    bio: "Abogada dominicana, egresada de UTESA (2018). También es licenciada en Psicología Laboral (UTESA, 2011) y cuenta con habilitación docente (2018).",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: ["Licenciatura en Derecho - UTESA (2018)", "Licenciatura en Psicología Laboral - UTESA (2011)", "Habilitación docente (2018)"],
    achievements: ["Alto porcentaje de éxito en cobros compulsivos", "Más del 90% de casos migratorios resueltos", "Experiencia en gestión humana y negociación"],
  },
  {
    id: '2',
    name: "Lic. Juan Francisco Rosa Cabral",
    role: "Especialista",
    specialty: "Derecho Penal",
    image: juanFranciscoRosaCabralPhoto,
    bio: "Nacido en Constanza, República Dominicana, el 29 de junio de 1974. Egresado de la Universidad Autónoma de Santo Domingo en el año 2000.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: ["Egresado de la Universidad Autónoma de Santo Domingo (2000)", "Formación especializada en Derecho Penal"],
    achievements: ["Alto porcentaje de casos penales resueltos", "Experiencia consolidada en litigación penal", "Trayectoria destacada en el buffet jurídico"],
  },
  {
    id: '3',
    name: "Dr. Nelson Rafael Acosta Brito",
    role: "Abogado",
    specialty: "Derecho de Familia, Inmobiliario y Demandas Judiciales",
    image: nelsonRafaelAcostaBritoPhoto,
    bio: "Nacido el 1 de marzo de 1959 en Laguna Salada, Valverde. Inició sus estudios en la Universidad Central del Este en 1979, obteniendo el título de Doctor en Derecho en 1986.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: ["Doctor en Derecho - Universidad Central del Este (1986)", "Estudios iniciados en la UCE en 1979"],
    achievements: ["Experiencia en derecho penal, tránsito, civil e inmobiliario", "Participación en casos de alto perfil jurídico", "Sentencias favorables en litigios internacionales"],
  },
  {
    id: '4',
    name: "Merlín Francisca Familia",
    role: "Abogada",
    specialty: "Derecho Procesal Civil, Administrativo, Laboral y Ley 155-17",
    image: merlinFranciscaFamiliaPhoto,
    bio: "Abogada dominicana, egresada de UAPA (2020). Experta en Derecho Civil, contratos, embargos, divorcios, reconocimiento de paternidad y cobros judiciales.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: ["Egresada de UAPA (2020)", "Formación en Derecho Procesal Civil y Administrativo", "Formación en Derecho Laboral y Ley 155-17"],
    achievements: ["Coordinación de departamentos legales en instituciones privadas", "Experiencia en cobros judiciales y procesos civiles", "Fortalezas en liderazgo y negociación"],
  },
  {
    id: '5',
    name: "Eleine Karys Rosa Gil",
    role: "Abogada",
    specialty: "Derecho",
    image: eleineKarysRosaGilPhoto,
    bio: "A lo largo de su formación y experiencia, ha complementado su perfil profesional como Abogada JR con diversos cursos y diplomados que fortalecen sus conocimientos y le permiten tener una visión integral en diferentes áreas.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: ["Negocios móviles", "Regulación de la interacción digital", "Diálogo", "Fideicomiso de planificación sucesoral en la República Dominicana", "Alquileres inmobiliarios y administración de propiedades", "Diplomado en bienes raíces", "Asesor consular Estados Unidos"],
    achievements: ["Visión integral para diferentes áreas jurídicas", "Competencias para el desarrollo de soluciones innovadoras", "Aporte de valor en el ámbito jurídico y profesional"],
  },
  {
    id: '6',
    name: "Juan Carlos Pérez",
    role: "Encargado",
    specialty: "Departamento de Correspondencia",
    image: juanCarlosPerezPhoto,
    bio: "Nacido en Santo Domingo el 22 de enero de 1982. Responsable de transportar, visitar, recibir y entregar documentos, paquetes y noticias en la institución. Su compromiso con la puntualidad, la seguridad y la confidencialidad garantiza eficiencia en los procesos legales.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: ["Gestión de diligencias documentales", "Manejo de correspondencia institucional"],
    achievements: ["Puntualidad y eficiencia en diligencias", "Seguridad y confidencialidad en entregas", "Apoyo clave para la operación legal"],
  },
  {
    id: '7',
    name: "Iris Yesenia Tejada",
    role: "Perito Gráfico",
    specialty: "Documentoscopia y Análisis Forense",
    image: irisYeseniaTejadaPhoto,
    bio: "La Perito en Documentoscopia Iris Yesenia Tejada es una especialista forense con más de 15 años de experiencia en el análisis e investigación de documentos, firmas y elementos indubitativos relacionados con procesos legales y judiciales.",
    linkedin: "#",
    email: "jrylinversiones@gmail.com",
    education: [
      "Técnico Profesional en Criminalística - Bogotá, Colombia (2006)",
      "Analista Forense, mención Documentoscopia - INACIF (2012)",
      "Reconocimiento Documentos Fraudulentos & Examen de Documentos de Viaje Avanzado - Office of Antiterrorism Assistance, Diplomatic Security USA (2015)",
      "Técnicas de autenticación documental y análisis de firmas",
      "Detección de alteraciones y evaluación de procesos de impresión",
    ],
    achievements: [
      "Más de 15 años de experiencia en análisis forense documental",
      "Perito Forense del Instituto Nacional de Ciencias Forenses (INACIF)",
      "Práctica privada como perito asesor independiente",
      "Referente en documentoscopia y peritaje gráfico",
    ],
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const loadInitialData = (key: string, defaultData: any) => {
    const saved = localStorage.getItem(`crm_${key}`);
    return saved ? JSON.parse(saved) : defaultData;
  };

  const [services, setServices] = useState<ServiceData[]>(() => loadInitialData('services', initialServices));
  const [team, setTeam] = useState<TeamMember[]>(() => loadInitialData('team', initialTeam));
  const [messages, setMessages] = useState<ContactMessage[]>(() => loadInitialData('messages', []));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadInitialData('appointments', []));
  const [documents, setDocuments] = useState<DocumentInfo[]>(() => loadInitialData('documents', []));

  const [clients, setClients] = useState<ClientData[]>(() => loadInitialData('clients', []));
  const [cases, setCases] = useState<LegalCase[]>(() => loadInitialData('cases', []));
  const [documentFolders, setDocumentFolders] = useState<DocumentFolder[]>(() => loadInitialData('document_folders', []));

  useEffect(() => {
    const fetchDB = async () => {
      try {
        const [clientsRes, casesRes, foldersRes, docsRes] = await Promise.all([
          fetch('http://localhost:3001/api/clients'),
          fetch('http://localhost:3001/api/cases'),
          fetch('http://localhost:3001/api/document_folders'),
          fetch('http://localhost:3001/api/documents')
        ]);
        if (clientsRes.ok) { const data = await clientsRes.json(); if (data.length) setClients(data); }
        if (casesRes.ok) { const data = await casesRes.json(); if (data.length) setCases(data); }
        if (foldersRes.ok) { const data = await foldersRes.json(); if (data.length) setDocumentFolders(data); }
        if (docsRes.ok) { const data = await docsRes.json(); if (data.length) setDocuments(data); }
      } catch (e) {
        console.warn('Backend no disponible, usando localStorage fallback');
      }
    };
    fetchDB();
  }, []);

  useEffect(() => {
    localStorage.setItem('crm_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('crm_team', JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem('crm_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('crm_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('crm_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => { localStorage.setItem('crm_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('crm_cases', JSON.stringify(cases)); }, [cases]);
  useEffect(() => { localStorage.setItem('crm_document_folders', JSON.stringify(documentFolders)); }, [documentFolders]);

  const addService = (service: Omit<ServiceData, 'id'>) => {
    setServices([...services, { ...service, id: Date.now().toString() }]);
  };

  const updateService = (id: string, updated: Partial<ServiceData>) => {
    setServices(services.map(s => s.id === id ? { ...s, ...updated } : s));
  };

  const deleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    setTeam([...team, { ...member, id: Date.now().toString() }]);
  };

  const updateTeamMember = (id: string, updated: Partial<TeamMember>) => {
    setTeam(team.map(m => m.id === id ? { ...m, ...updated } : m));
  };

  const deleteTeamMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
  };

  const addMessage = (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false,
    };
    setMessages([newMsg, ...messages]);
  };

  const markMessageRead = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const addAppointment = (app: Omit<Appointment, 'id'>) => {
    setAppointments([...appointments, { ...app, id: Date.now().toString() }]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateAppointment = (id: string, updated: Partial<Appointment>) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const addDocument = async (doc: Omit<DocumentInfo, 'id' | 'uploadDate'>) => {
    const newDoc = { ...doc, id: Date.now().toString(), uploadDate: new Date().toISOString() };
    try {
      const res = await fetch('http://localhost:3001/api/documents', {
        method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newDoc)
      });
      if(res.ok) setDocuments([newDoc, ...documents]);
      else setDocuments([newDoc, ...documents]);
    } catch { setDocuments([newDoc, ...documents]); }
  };

  const deleteDocument = async (id: string) => {
    try { await fetch(`http://localhost:3001/api/documents/${id}`, { method: 'DELETE' }); } catch {}
    setDocuments(documents.filter(d => d.id !== id));
  };

  const addClient = async (client: Omit<ClientData, 'id'>) => {
    const dbId = Date.now().toString();
    const newClient = { ...client, id: dbId };
    try {
      const res = await fetch('http://localhost:3001/api/clients', {
        method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newClient)
      });
      if(res.ok) setClients([newClient, ...clients]);
      else setClients([newClient, ...clients]);
    } catch { setClients([newClient, ...clients]); }
  };

  const updateClient = async (id: string, updated: Partial<ClientData>) => {
    try { await fetch(`http://localhost:3001/api/clients/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(updated) }); } catch {}
    setClients(clients.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteClient = async (id: string) => {
    try { await fetch(`http://localhost:3001/api/clients/${id}`, { method: 'DELETE' }); } catch {}
    setClients(clients.filter(c => c.id !== id));
  };

  const addCase = async (caseData: Omit<LegalCase, 'id'>) => {
    const dbId = Date.now().toString();
    const newCase = { ...caseData, id: dbId };
    try {
      const res = await fetch('http://localhost:3001/api/cases', {
        method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newCase)
      });
      if(res.ok) setCases([newCase, ...cases]);
      else setCases([newCase, ...cases]);
    } catch { setCases([newCase, ...cases]); }
  };

  const updateCase = async (id: string, updated: Partial<LegalCase>) => {
    try { await fetch(`http://localhost:3001/api/cases/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(updated) }); } catch {}
    setCases(cases.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteCase = async (id: string) => {
    try { await fetch(`http://localhost:3001/api/cases/${id}`, { method: 'DELETE' }); } catch {}
    setCases(cases.filter(c => c.id !== id));
  };

  const addFolder = async (folder: Omit<DocumentFolder, 'id'>) => {
    const dbId = Date.now().toString();
    const newFolder = { ...folder, id: dbId };
    try {
      const res = await fetch('http://localhost:3001/api/document_folders', {
        method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newFolder)
      });
      if(res.ok) setDocumentFolders([newFolder, ...documentFolders]);
      else setDocumentFolders([newFolder, ...documentFolders]);
    } catch { setDocumentFolders([newFolder, ...documentFolders]); }
  };

  const deleteFolder = async (id: string) => {
    try { await fetch(`http://localhost:3001/api/document_folders/${id}`, { method: 'DELETE' }); } catch {}
    setDocumentFolders(documentFolders.filter(f => f.id !== id));
  };

  return (
    <DataContext.Provider value={{
      services, team, messages, appointments, documents,
      addService, updateService, deleteService,
      addTeamMember, updateTeamMember, deleteTeamMember,
      addMessage, markMessageRead,
      addAppointment,
      updateAppointmentStatus,
      updateAppointment,
      addDocument, deleteDocument,
      clients, cases, documentFolders,
      addClient, updateClient, deleteClient,
      addCase, updateCase, deleteCase,
      addFolder, deleteFolder
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
