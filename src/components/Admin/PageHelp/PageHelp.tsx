import React, { useState } from 'react';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';
import './PageHelp.scss';

interface PageHelpProps {
  title: string;
  description: string;
  features: string[];
}

const PageHelp: React.FC<PageHelpProps> = ({ title, description, features }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`page-help-container ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className={`help-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((current) => !current)}
        title="Mas informacion de esta pagina"
      >
        {isOpen ? <FaTimes /> : <FaInfoCircle />}
        <span>Ayuda</span>
      </button>

      {isOpen && (
        <div className="help-bubble" role="dialog" aria-label={`Ayuda de ${title}`}>
          <h4>{title}</h4>
          <p>{description}</p>
          <h5>Lo mas importante</h5>
          <ul>
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PageHelp;
