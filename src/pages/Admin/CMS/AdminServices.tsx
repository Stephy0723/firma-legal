import React, { useState, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import type { ServiceData } from '../../../context/DataContext';
import {
  FaBalanceScale,
  FaBuilding,
  FaCar,
  FaEdit,
  FaFileSignature,
  FaLayerGroup,
  FaPassport,
  FaPlus,
  FaSearch,
  FaSuitcase,
  FaTimes,
  FaTrash,
  FaUsers,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import PageHelp from '../../../components/Admin/PageHelp/PageHelp';
import './AdminServices.scss';

const ICON_MAP: Record<string, IconType> = {
  FaBalanceScale,
  FaPassport,
  FaUsers,
  FaBuilding,
  FaCar,
  FaFileSignature,
  FaSearch,
  FaSuitcase,
};

const AVAILABLE_ICONS = [
  { id: 'FaBalanceScale', label: 'Balanza — Judicial' },
  { id: 'FaPassport', label: 'Pasaporte — Migratorio' },
  { id: 'FaUsers', label: 'Personas — Familia' },
  { id: 'FaBuilding', label: 'Edificio — Inmobiliario' },
  { id: 'FaCar', label: 'Auto — Vehículos' },
  { id: 'FaFileSignature', label: 'Firma — Notarial' },
  { id: 'FaSearch', label: 'Lupa — Investigación' },
  { id: 'FaSuitcase', label: 'Maletín — Corporativo' },
];

const createEmpty = (): Omit<ServiceData, 'id'> => ({
  icon: 'FaBalanceScale',
  title: '',
  description: '',
  fullDescription: '',
  details: [''],
});

const AdminServices = () => {
  const { services, addService, updateService, deleteService } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ServiceData, 'id'>>(createEmpty());

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [services, searchQuery]);

  const handleOpen = (service?: ServiceData) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        icon: service.icon,
        title: service.title,
        description: service.description,
        fullDescription: service.fullDescription,
        details: service.details.length ? [...service.details] : [''],
      });
    } else {
      setEditingId(null);
      setFormData(createEmpty());
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(createEmpty());
  };

  const handleDetailChange = (index: number, value: string) => {
    const next = [...formData.details];
    next[index] = value;
    setFormData({ ...formData, details: next });
  };

  const addDetail = () => setFormData({ ...formData, details: [...formData.details, ''] });

  const removeDetail = (index: number) =>
    setFormData({ ...formData, details: formData.details.filter((_, i) => i !== index) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      details: formData.details.map((d) => d.trim()).filter(Boolean),
    };
    if (editingId) {
      updateService(editingId, payload);
    } else {
      addService(payload);
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este servicio? Se eliminará también del sitio público.')) {
      deleteService(id);
    }
  };

  return (
    <div className="services-studio">
      <PageHelp
        title="Gestión de servicios"
        description="Administra los servicios legales que aparecen en el sitio público. Los cambios se reflejan en tiempo real."
        features={[
          'Agrega, edita y elimina servicios directamente desde aquí.',
          'Cada servicio incluye descripción corta, descripción completa y lista de características.',
          'El ícono se muestra en la tarjeta pública del servicio.',
        ]}
      />

      {/* Header */}
      <div className="services-header">
        <div className="services-header__copy">
          <span className="services-header__eyebrow">CMS / Servicios</span>
          <h2>Servicios del despacho</h2>
          <p>Gestiona el catálogo de servicios legales que se muestra en el sitio público.</p>
        </div>

        <div className="services-header__controls">
          <label className="services-search" aria-label="Buscar servicios">
            <FaSearch />
            <input
              type="search"
              placeholder="Buscar servicio…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
          <button type="button" className="services-cta" onClick={() => handleOpen()}>
            <FaPlus />
            Nuevo servicio
          </button>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="services-metrics">
        <div className="services-metric">
          <FaLayerGroup />
          <div>
            <span>Total servicios</span>
            <strong>{services.length}</strong>
          </div>
        </div>
        <div className="services-metric">
          <FaBalanceScale />
          <div>
            <span>Promedio características</span>
            <strong>
              {services.length
                ? Math.round(services.reduce((s, v) => s + v.details.length, 0) / services.length)
                : 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length > 0 ? (
        <div className="services-grid">
          {filtered.map((service) => {
            const ServiceIcon = ICON_MAP[service.icon] ?? FaBalanceScale;
            return (
              <article key={service.id} className="service-card">
                <div className="service-card__top">
                  <div className="service-card__icon">
                    <ServiceIcon />
                  </div>
                  <div className="service-card__actions">
                    <button
                      type="button"
                      onClick={() => handleOpen(service)}
                      aria-label={`Editar ${service.title}`}
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(service.id)}
                      aria-label={`Eliminar ${service.title}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="service-card__body">
                  <h3>{service.title}</h3>
                  <p className="service-card__desc">{service.description}</p>
                </div>

                {service.details.length > 0 && (
                  <ul className="service-card__details">
                    {service.details.slice(0, 4).map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                    {service.details.length > 4 && (
                      <li className="service-card__details-more">
                        +{service.details.length - 4} más
                      </li>
                    )}
                  </ul>
                )}

                <div className="service-card__footer">
                  <span>{service.details.length} características</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="services-empty">
          {searchQuery ? (
            <>
              <h4>Sin resultados para «{searchQuery}»</h4>
              <p>Intenta con otro término o limpia la búsqueda.</p>
            </>
          ) : (
            <>
              <h4>Sin servicios todavía</h4>
              <p>Agrega el primer servicio con el botón de arriba.</p>
              <button type="button" className="services-cta" onClick={() => handleOpen()}>
                <FaPlus /> Nuevo servicio
              </button>
            </>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--services">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Editar servicio' : 'Nuevo servicio'}</h3>
              <button className="admin-modal__close" onClick={handleClose} aria-label="Cerrar">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__body services-form">
              {/* Ícono preview */}
              <div className="services-form__icon-row">
                {(() => {
                  const Preview = ICON_MAP[formData.icon] ?? FaBalanceScale;
                  return (
                    <div className="services-form__icon-preview">
                      <Preview />
                    </div>
                  );
                })()}
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ícono</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon.id} value={icon.id}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group form-group--full">
                <label>Título del servicio</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Derecho Civil y Litigio"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group form-group--full">
                <label>Descripción corta (tarjeta pública)</label>
                <input
                  required
                  type="text"
                  placeholder="Una línea descriptiva del servicio"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group form-group--full">
                <label>Descripción completa (página de detalle)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explicación detallada del servicio…"
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                />
              </div>

              <div className="form-group form-group--full">
                <label>Características / Detalles</label>
                <div className="services-form__details">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="services-form__detail-row">
                      <input
                        type="text"
                        value={detail}
                        onChange={(e) => handleDetailChange(index, e.target.value)}
                        placeholder={`Característica ${index + 1}`}
                      />
                      {formData.details.length > 1 && (
                        <button
                          type="button"
                          className="services-form__detail-remove"
                          onClick={() => removeDetail(index)}
                          aria-label="Eliminar"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="services-form__add-detail" onClick={addDetail}>
                    <FaPlus /> Añadir característica
                  </button>
                </div>
              </div>

              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-outline" onClick={handleClose}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingId ? 'Guardar cambios' : 'Crear servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
