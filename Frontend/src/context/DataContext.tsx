import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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
  email?: string;
  phone?: string;
  date: string;
  time: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  lawyerId?: string;
  notes?: string;
  source?: 'website' | 'admin' | 'walkin' | 'phone' | 'whatsapp';
  format?: 'presencial' | 'virtual' | 'telefonica';
  confirmationPreference?: 'email' | 'whatsapp' | 'call';
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
  updatedAt?: string;
  caseTopic?: string;
  notes?: string;
  tags?: string[];
  assets?: DocumentAsset[];
}

export interface CaseWitness {
  id: string;
  name: string;
  cedula: string;
  phone?: string;
  note?: string;
}

export interface LegalCase {
  id: string;
  client_id: string;
  lawyer_id: string;
  title: string;
  cedula: string;
  description: string;
  status: 'Evaluación' | 'En Proceso' | 'En Corte' | 'Cerrado';
  created_at?: string;
  updatedAt?: string;
  witnesses?: CaseWitness[];
  assets?: DocumentAsset[];
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  lawyer_id?: string;
  client_id?: string;
  created_at?: string;
}

export interface DocumentAsset {
  id: string;
  name: string;
  kind: 'image' | 'file';
  type: string;
  url: string;
}

export interface DocumentHistoryEntry {
  id: string;
  action: string;
  details: string;
  actor: string;
  date: string;
}

export interface DocumentUpdateMeta {
  action?: string;
  details?: string;
  actor?: string;
}

export interface DocumentInfo {
  id: string;
  title: string;
  clientName?: string;
  client_id?: string;
  lawyer_id?: string;
  folder_id?: string;
  uploadDate: string;
  updatedAt?: string;
  type: string;
  url: string;
  note?: string;
  description?: string;
  tags?: string[];
  assets?: DocumentAsset[];
  history?: DocumentHistoryEntry[];
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
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<string>;
  updateTeamMember: (id: string, member: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => void;
  markMessageRead: (id: string) => void;
  updateMessage: (id: string, updated: Partial<ContactMessage>) => void;
  deleteMessage: (id: string) => void;
  addAppointment: (app: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  updateAppointment: (id: string, updated: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addDocument: (doc: Omit<DocumentInfo, 'id' | 'uploadDate' | 'updatedAt'>) => void;
  updateDocument: (id: string, updated: Partial<DocumentInfo>, meta?: DocumentUpdateMeta) => void;
  deleteDocument: (id: string) => void;

  clients: ClientData[];
  cases: LegalCase[];
  documentFolders: DocumentFolder[];
  addClient: (client: Omit<ClientData, 'id'>) => Promise<void>;
  updateClient: (id: string, updated: Partial<ClientData>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addCase: (caseData: Omit<LegalCase, 'id'>) => Promise<void>;
  updateCase: (id: string, updated: Partial<LegalCase>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  addFolder: (folder: Omit<DocumentFolder, 'id'>) => Promise<void>;
  updateFolder: (id: string, updated: Partial<DocumentFolder>) => void;
  deleteFolder: (id: string) => void;
}


const DataContext = createContext<DataContextType | undefined>(undefined);

const createDocumentHistoryEntry = (
  action: string,
  details: string,
  actor = 'Panel admin',
): DocumentHistoryEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  action,
  details,
  actor,
  date: new Date().toISOString(),
});

const parseStoredArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeAppointmentStatus = (value: unknown): Appointment['status'] => {
  if (value === 'confirmed' || value === 'confirmada') {
    return 'confirmed';
  }

  if (value === 'cancelled' || value === 'cancelada') {
    return 'cancelled';
  }

  return 'pending';
};

const normalizeAppointmentSource = (value: unknown): NonNullable<Appointment['source']> => {
  if (value === 'admin' || value === 'walkin' || value === 'phone' || value === 'whatsapp') {
    return value;
  }

  return 'website';
};

const normalizeAppointmentFormat = (value: unknown): NonNullable<Appointment['format']> => {
  if (value === 'virtual' || value === 'telefonica') {
    return value;
  }

  return 'presencial';
};

const normalizeAppointmentConfirmation = (
  value: unknown,
): NonNullable<Appointment['confirmationPreference']> => {
  if (value === 'email' || value === 'call') {
    return value;
  }

  return 'whatsapp';
};

const normalizeDocumentFolderId = (folderId: unknown): string | undefined => {
  if (typeof folderId !== 'string') {
    return undefined;
  }

  const normalized = folderId.trim();
  if (!normalized || normalized === '__general__') {
    return undefined;
  }

  return normalized;
};

const normalizeAppointment = (appointment: Partial<Appointment> & Record<string, unknown>): Appointment => ({
  id: String(appointment.id || Date.now().toString()),
  clientName: String(appointment.clientName || appointment.nombre || ''),
  email: typeof appointment.email === 'string' ? appointment.email : '',
  phone:
    typeof appointment.phone === 'string'
      ? appointment.phone
      : typeof appointment.telefono === 'string'
        ? appointment.telefono
        : '',
  date: String(appointment.date || appointment.fecha || '').slice(0, 10),
  time: String(appointment.time || appointment.hora || ''),
  purpose: String(appointment.purpose || appointment.area || ''),
  status: normalizeAppointmentStatus(appointment.status || appointment.estatus),
  lawyerId: typeof appointment.lawyerId === 'string' ? appointment.lawyerId : '',
  notes:
    typeof appointment.notes === 'string'
      ? appointment.notes
      : typeof appointment.mensaje === 'string'
        ? appointment.mensaje
        : '',
  source: normalizeAppointmentSource(appointment.source),
  format: normalizeAppointmentFormat(appointment.format),
  confirmationPreference: normalizeAppointmentConfirmation(
    appointment.confirmationPreference || appointment.confirmation,
  ),
  createdAt:
    typeof appointment.createdAt === 'string'
      ? appointment.createdAt
      : typeof appointment.date === 'string'
        ? `${appointment.date}T${String(appointment.time || '00:00')}`
        : new Date().toISOString(),
  updatedAt:
    typeof appointment.updatedAt === 'string'
      ? appointment.updatedAt
      : typeof appointment.createdAt === 'string'
        ? appointment.createdAt
        : new Date().toISOString(),
});

const normalizeDocument = (doc: DocumentInfo): DocumentInfo => ({
  ...doc,
  folder_id: normalizeDocumentFolderId(doc.folder_id),
  updatedAt: doc.updatedAt || doc.uploadDate,
  note: doc.note || '',
  tags: parseStoredArray<string>(doc.tags),
  assets: parseStoredArray<DocumentAsset>(doc.assets),
  history: parseStoredArray<DocumentHistoryEntry>(doc.history),
});

const normalizeClient = (client: ClientData): ClientData => ({
  ...client,
  updatedAt: client.updatedAt || client.created_at,
  caseTopic: client.caseTopic || '',
  notes: client.notes || '',
  tags: parseStoredArray<string>(client.tags),
  assets: parseStoredArray<DocumentAsset>(client.assets),
});

const normalizeCase = (caseItem: LegalCase): LegalCase => ({
  ...caseItem,
  cedula: caseItem.cedula || '',
  updatedAt: caseItem.updatedAt || caseItem.created_at,
  witnesses: parseStoredArray<CaseWitness>(caseItem.witnesses),
  assets: parseStoredArray<DocumentAsset>(caseItem.assets),
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [documentFolders, setDocumentFolders] = useState<DocumentFolder[]>([]);

  useEffect(() => {
    const fetchDB = async () => {
      try {
        const [servicesRes, teamRes, messagesRes, appointmentsRes, clientsRes, casesRes, foldersRes, docsRes] = await Promise.all([
          fetch('http://localhost:3001/api/services'),
          fetch('http://localhost:3001/api/team'),
          fetch('http://localhost:3001/api/messages'),
          fetch('http://localhost:3001/api/appointments'),
          fetch('http://localhost:3001/api/clients'),
          fetch('http://localhost:3001/api/cases'),
          fetch('http://localhost:3001/api/document_folders'),
          fetch('http://localhost:3001/api/documents')
        ]);
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          if (data.length) setServices(data);
        }
        if (teamRes.ok) {
          const data = await teamRes.json();
          if (data.length) setTeam(data);
        }
        if (messagesRes.ok) {
          const data = await messagesRes.json();
          if (data.length) setMessages(data);
        }
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          if (data.length) setAppointments(data.map(normalizeAppointment));
        }
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          if (data.length) setClients(data.map(normalizeClient));
        }
        if (casesRes.ok) {
          const data = await casesRes.json();
          if (data.length) setCases(data.map(normalizeCase));
        }
        if (foldersRes.ok) { const data = await foldersRes.json(); if (data.length) setDocumentFolders(data); }
        if (docsRes.ok) {
          const data = await docsRes.json();
          if (data.length) setDocuments(data.map(normalizeDocument));
        }
      } catch (e) {
        console.warn('Backend no disponible');
      }
    };
    fetchDB();
  }, []);

  const addService = async (service: Omit<ServiceData, 'id'>) => {
    const newService = { ...service, id: Date.now().toString() };
    setServices([...services, newService]);
    try {
      await fetch('http://localhost:3001/api/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newService)
      });
    } catch {}
  };

  const updateService = async (id: string, updated: Partial<ServiceData>) => {
    setServices(services.map(s => s.id === id ? { ...s, ...updated } : s));
    try {
      await fetch(`http://localhost:3001/api/services/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated)
      });
    } catch {}
  };

  const deleteService = async (id: string) => {
    setServices(services.filter(s => s.id !== id));
    try {
      await fetch(`http://localhost:3001/api/services/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<string> => {
    const newMember = { ...member, id: Date.now().toString() };
    setTeam([...team, newMember]);
    try {
      await fetch('http://localhost:3001/api/team', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMember)
      });
    } catch {}
    return newMember.id;
  };

  const updateTeamMember = async (id: string, updated: Partial<TeamMember>) => {
    setTeam(team.map(m => m.id === id ? { ...m, ...updated } : m));
    try {
      await fetch(`http://localhost:3001/api/team/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated)
      });
    } catch {}
  };

  const deleteTeamMember = async (id: string) => {
    setTeam(team.filter(m => m.id !== id));
    try {
      await fetch(`http://localhost:3001/api/team/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const addMessage = async (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false,
    };
    setMessages([newMsg, ...messages]);
    try {
      await fetch('http://localhost:3001/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMsg)
      });
    } catch {}
  };

  const markMessageRead = async (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
    try {
      await fetch(`http://localhost:3001/api/messages/${id}/read`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }
      });
    } catch {}
  };

  const deleteMessage = async (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
    try {
      await fetch(`http://localhost:3001/api/messages/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const updateMessage = async (id: string, updated: Partial<ContactMessage>) => {
    const current = messages.find((message) => message.id === id);
    if (!current) {
      return;
    }

    const next = { ...current, ...updated };
    setMessages((prev) => prev.map((message) => (message.id === id ? next : message)));

    try {
      await fetch(`http://localhost:3001/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } catch {}
  };

  const addAppointment = async (app: Omit<Appointment, 'id'>) => {
    const timestamp = new Date().toISOString();
    const newAppointment = normalizeAppointment({
      ...app,
      id: Date.now().toString(),
      createdAt: app.createdAt || timestamp,
      updatedAt: app.updatedAt || timestamp,
    });

    setAppointments((prev) => [newAppointment, ...prev]);

    try {
      await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      });
    } catch {}
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const timestamp = new Date().toISOString();
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id ? normalizeAppointment({ ...appointment, status, updatedAt: timestamp }) : appointment,
      ),
    );

    try {
      await fetch(`http://localhost:3001/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedAt: timestamp }),
      });
    } catch {}
  };

  const updateAppointment = async (id: string, updated: Partial<Appointment>) => {
    const currentAppointment = appointments.find((appointment) => appointment.id === id);
    if (!currentAppointment) {
      return;
    }

    const nextAppointment = normalizeAppointment({
      ...currentAppointment,
      ...updated,
      updatedAt: new Date().toISOString(),
    });

    setAppointments((prev) =>
      prev.map((appointment) => (appointment.id === id ? nextAppointment : appointment)),
    );

    try {
      await fetch(`http://localhost:3001/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextAppointment),
      });
    } catch {}
  };

  const deleteAppointment = async (id: string) => {
    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
    try {
      await fetch(`http://localhost:3001/api/appointments/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const addDocument = async (doc: Omit<DocumentInfo, 'id' | 'uploadDate' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const folderId = normalizeDocumentFolderId(doc.folder_id);
    const folderName =
      folderId && documentFolders.find((folder) => folder.id === folderId)?.name
        ? (documentFolders.find((folder) => folder.id === folderId)?.name as string)
        : 'archivo central';

    const newDoc = normalizeDocument({
      ...doc,
      folder_id: folderId,
      id: Date.now().toString(),
      uploadDate: timestamp,
      updatedAt: timestamp,
      history: [
        createDocumentHistoryEntry(
          'Creado',
          `Documento registrado en ${folderName}.`,
          'Panel admin',
        ),
        ...(doc.history || []),
      ],
    });

    try {
      await fetch('http://localhost:3001/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      });
    } catch {}

    setDocuments((prev) => [newDoc, ...prev]);
  };

  const updateDocument = async (
    id: string,
    updated: Partial<DocumentInfo>,
    meta?: DocumentUpdateMeta,
  ) => {
    const timestamp = new Date().toISOString();
    const currentDocument = documents.find((doc) => doc.id === id);
    const normalizedUpdated: Partial<DocumentInfo> = {
      ...updated,
      ...(updated.folder_id !== undefined ? { folder_id: normalizeDocumentFolderId(updated.folder_id) } : {}),
    };
    const nextHistoryEntry =
      currentDocument
        ? createDocumentHistoryEntry(
            meta?.action || 'Actualizado',
            meta?.details ||
              [
                normalizedUpdated.title && normalizedUpdated.title !== currentDocument.title ? `renombrado a ${normalizedUpdated.title}` : null,
                normalizedUpdated.note !== undefined && normalizedUpdated.note !== currentDocument.note ? 'nota actualizada' : null,
                normalizedUpdated.tags ? 'tags actualizados' : null,
                normalizedUpdated.assets ? 'imagenes ajustadas' : null,
                normalizedUpdated.folder_id !== undefined && normalizedUpdated.folder_id !== currentDocument.folder_id
                  ? 'folder actualizado'
                  : null,
              ]
                .filter(Boolean)
                .join(', ') ||
              'Se actualizo la ficha del documento.',
            meta?.actor,
          )
        : null;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== id) {
          return doc;
        }

        const nextDoc = normalizeDocument({
          ...doc,
          ...normalizedUpdated,
          updatedAt: timestamp,
        });

        const details =
          meta?.details ||
          [
            normalizedUpdated.title && normalizedUpdated.title !== doc.title ? `renombrado a ${normalizedUpdated.title}` : null,
            normalizedUpdated.note !== undefined && normalizedUpdated.note !== doc.note ? 'nota actualizada' : null,
            normalizedUpdated.tags ? 'tags actualizados' : null,
            normalizedUpdated.assets ? 'imagenes ajustadas' : null,
            normalizedUpdated.folder_id !== undefined && normalizedUpdated.folder_id !== doc.folder_id
              ? 'folder actualizado'
              : null,
          ]
            .filter(Boolean)
            .join(', ') ||
          'Se actualizo la ficha del documento.';

        return {
          ...nextDoc,
          history: [
            createDocumentHistoryEntry(meta?.action || 'Actualizado', details, meta?.actor),
            ...(doc.history || []),
          ],
        };
      }),
    );

    try {
      await fetch(`http://localhost:3001/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...normalizedUpdated,
          updatedAt: timestamp,
          history: currentDocument
            ? [nextHistoryEntry, ...(currentDocument.history || [])].filter(Boolean)
            : undefined,
        }),
      });
    } catch {}
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    try {
      await fetch(`http://localhost:3001/api/documents/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const addClient = async (client: Omit<ClientData, 'id'>) => {
    const dbId = Date.now().toString();
    const newClient = normalizeClient({
      ...client,
      created_at: client.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: dbId,
    });
    try {
      const res = await fetch('http://localhost:3001/api/clients', {
        method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newClient)
      });
      if(res.ok) setClients((prev) => [newClient, ...prev]);
      else setClients((prev) => [newClient, ...prev]);
    } catch { setClients((prev) => [newClient, ...prev]); }
  };

  const updateClient = async (id: string, updated: Partial<ClientData>) => {
    const nextClient = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    try { await fetch(`http://localhost:3001/api/clients/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(nextClient) }); } catch {}
    setClients((prev) =>
      prev.map((client) => (client.id === id ? normalizeClient({ ...client, ...nextClient }) : client)),
    );
  };

  const deleteClient = async (id: string) => {
    setClients((prev) => prev.filter(c => c.id !== id));
    try { await fetch(`http://localhost:3001/api/clients/${id}`, { method: 'DELETE' }); } catch {}
  };

  const addCase = async (caseData: Omit<LegalCase, 'id'>) => {
    const dbId = Date.now().toString();
    const timestamp = new Date().toISOString();
    const newCase = normalizeCase({
      ...caseData,
      created_at: caseData.created_at || timestamp,
      updatedAt: caseData.updatedAt || timestamp,
      id: dbId,
    });
    try {
      const res = await fetch('http://localhost:3001/api/cases', {
        method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newCase)
      });
      if(res.ok) setCases((prev) => [newCase, ...prev]);
      else setCases((prev) => [newCase, ...prev]);
    } catch { setCases((prev) => [newCase, ...prev]); }
  };

  const updateCase = async (id: string, updated: Partial<LegalCase>) => {
    const currentCase = cases.find((caseItem) => caseItem.id === id);
    if (!currentCase) {
      return;
    }

    const nextCase = normalizeCase({
      ...currentCase,
      ...updated,
      updatedAt: new Date().toISOString(),
    });

    try {
      await fetch(`http://localhost:3001/api/cases/${id}`, {
        method: 'PUT',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(nextCase),
      });
    } catch {}

    setCases((prev) => prev.map((caseItem) => (caseItem.id === id ? nextCase : caseItem)));
  };

  const deleteCase = async (id: string) => {
    setCases((prev) => prev.filter(c => c.id !== id));
    try { await fetch(`http://localhost:3001/api/cases/${id}`, { method: 'DELETE' }); } catch {}
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

  const updateFolder = async (id: string, updated: Partial<DocumentFolder>) => {
    setDocumentFolders((prev) => prev.map((folder) => (folder.id === id ? { ...folder, ...updated } : folder)));
    try {
      await fetch(`http://localhost:3001/api/document_folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {}
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
      addMessage, markMessageRead, updateMessage, deleteMessage,
      addAppointment,
      updateAppointmentStatus,
      updateAppointment,
      deleteAppointment,
      addDocument, updateDocument, deleteDocument,
      clients, cases, documentFolders,
      addClient, updateClient, deleteClient,
      addCase, updateCase, deleteCase,
      addFolder, updateFolder, deleteFolder
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
