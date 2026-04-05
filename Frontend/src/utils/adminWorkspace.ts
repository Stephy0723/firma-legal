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
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<AdminWorkspaceSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveAdminWorkspaceSettings = (settings: Partial<AdminWorkspaceSettings>) => {
  const merged = {
    ...loadAdminWorkspaceSettings(),
    ...settings,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
};
