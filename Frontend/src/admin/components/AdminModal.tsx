import type { ReactNode } from 'react';
import { FaTimes } from 'react-icons/fa';

type AdminModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDanger?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  hideFooter?: boolean;
};

const AdminModal = ({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel = 'Guardar',
  submitDanger = false,
  loading = false,
  size = 'md',
  children,
  hideFooter = false,
}: AdminModalProps) => {
  if (!open) return null;

  const sizeClass = size === 'lg' ? 'a-modal--lg' : size === 'sm' ? 'a-modal--sm' : '';

  return (
    <div
      className="a-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`a-modal ${sizeClass}`} role="dialog" aria-modal="true">
        <div className="a-modal__header">
          <div>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="a-btn a-btn--ghost a-btn--icon" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="a-modal__body">
          {children}
        </div>

        {!hideFooter && (
          <div className="a-modal__footer">
            <button type="button" className="a-btn" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            {onSubmit && (
              <button
                type="button"
                className={`a-btn ${submitDanger ? 'a-btn--danger' : 'a-btn--primary'}`}
                onClick={onSubmit}
                disabled={loading}
              >
                {loading ? 'Guardando...' : submitLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;
