export type WorkspaceAppointmentFormat = 'presencial' | 'virtual' | 'telefonica';
export type WorkspaceConfirmationChannel = 'email' | 'whatsapp' | 'call';

export interface AdminProfileConfig {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  image: string;
  specialty: string;
  bio: string;
  signature: string;
}

export interface AdminWorkspaceSettings {
  firmName: string;
  intakeEmail: string;
  intakePhone: string;
  intakeWhatsApp: string;
  officeHours: string;
  timezone: string;
  websiteAppointmentsEnabled: boolean;
  walkInAppointmentsEnabled: boolean;
  automaticInboxOpening: boolean;
  emailNotificationsEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  defaultAppointmentFormat: WorkspaceAppointmentFormat;
  defaultConfirmationChannel: WorkspaceConfirmationChannel;
}

const ADMIN_PROFILE_STORAGE_KEY = 'crm_admin_profile';
const ADMIN_SETTINGS_STORAGE_KEY = 'crm_admin_settings';

export const defaultAdminProfileConfig: AdminProfileConfig = {
  name: 'Lic. Javier Ruiz',
  role: 'Socio Fundador',
  email: 'jrylinversiones@gmail.com',
  phone: '+1 829 344 7586',
  location: 'Sede Principal, Santo Domingo',
  image:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  specialty: 'Direccion estrategica, litigio y supervision operativa',
  bio: 'Perfil ejecutivo para centralizar la operacion del despacho, seguimiento de expedientes y control comercial.',
  signature: 'Lic. Javier Ruiz, Socio Fundador',
};

export const defaultAdminWorkspaceSettings: AdminWorkspaceSettings = {
  firmName: 'JR&L Inversiones',
  intakeEmail: 'jrylinversiones@gmail.com',
  intakePhone: '+1 829 344 7586',
  intakeWhatsApp: '+1 829 344 7586',
  officeHours: 'Lunes a viernes, 8:00 AM a 6:00 PM',
  timezone: 'America/Santo_Domingo',
  websiteAppointmentsEnabled: true,
  walkInAppointmentsEnabled: true,
  automaticInboxOpening: true,
  emailNotificationsEnabled: true,
  desktopNotificationsEnabled: false,
  defaultAppointmentFormat: 'presencial',
  defaultConfirmationChannel: 'whatsapp',
};

const readStoredObject = <T extends object>(key: string, defaults: T): T => {
  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return defaults;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
      return defaults;
    }

    return { ...defaults, ...(parsedValue as Partial<T>) } as T;
  } catch {
    return defaults;
  }
};

const saveStoredObject = <T extends object>(key: string, value: T, defaults: T) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify({ ...defaults, ...value }));
};

export const loadAdminProfileConfig = (): AdminProfileConfig =>
  readStoredObject(ADMIN_PROFILE_STORAGE_KEY, defaultAdminProfileConfig);

export const saveAdminProfileConfig = (value: AdminProfileConfig) => {
  saveStoredObject(ADMIN_PROFILE_STORAGE_KEY, value, defaultAdminProfileConfig);
};

export const resetAdminProfileConfig = () => {
  saveAdminProfileConfig(defaultAdminProfileConfig);
};

export const loadAdminWorkspaceSettings = (): AdminWorkspaceSettings =>
  readStoredObject(ADMIN_SETTINGS_STORAGE_KEY, defaultAdminWorkspaceSettings);

export const saveAdminWorkspaceSettings = (value: AdminWorkspaceSettings) => {
  saveStoredObject(ADMIN_SETTINGS_STORAGE_KEY, value, defaultAdminWorkspaceSettings);
};

export const resetAdminWorkspaceSettings = () => {
  saveAdminWorkspaceSettings(defaultAdminWorkspaceSettings);
};
