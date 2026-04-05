export type AppointmentFormat = 'presencial' | 'virtual' | 'telefonica';
export type ConfirmationChannel = 'whatsapp' | 'email' | 'call';

export type AdminWorkspaceSettings = {
  defaultAppointmentFormat: AppointmentFormat;
  defaultConfirmationChannel: ConfirmationChannel;
  websiteAppointmentsEnabled: boolean;
  intakeEmail: string;
  intakeWhatsApp: string;
  officeHours: string;
};

const STORAGE_KEY = 'admin_workspace_settings';
const API = 'http://localhost:3001';

const DEFAULT_SETTINGS: AdminWorkspaceSettings = {
  defaultAppointmentFormat: 'presencial',
  defaultConfirmationChannel: 'whatsapp',
  websiteAppointmentsEnabled: true,
  intakeEmail: '',
  intakeWhatsApp: '',
  officeHours: 'Lun-Vie 8:00 AM - 6:00 PM',
};

export const loadAdminWorkspaceSettings = (): AdminWorkspaceSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AdminWorkspaceSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveAdminWorkspaceSettings = async (settings: Partial<AdminWorkspaceSettings>): Promise<AdminWorkspaceSettings> => {
  const merged = { ...loadAdminWorkspaceSettings(), ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  try {
    await fetch(`${API}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    });
  } catch {
    // silently ignore network errors — localStorage already updated
  }
  return merged;
};

export const syncAdminWorkspaceSettingsFromAPI = async (): Promise<void> => {
  try {
    const res = await fetch(`${API}/api/settings`);
    if (!res.ok) return;
    const data = await res.json() as Partial<AdminWorkspaceSettings>;
    const merged = { ...DEFAULT_SETTINGS, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // silently ignore — will use localStorage cache
  }
};
