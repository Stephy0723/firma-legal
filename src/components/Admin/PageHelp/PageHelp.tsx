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
    <div className="page-help-container">
      <button 
        className={`help-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="¿Cómo usar esta página?"
      >
        {isOpen ? <FaTimes /> : <FaInfoCircle />}
      </button>

      {isOpen && (
        <div className="help-bubble">
          <h4>{title}</h4>
          <p>{description}</p>
          <h5>Funcionalidades Clave:</h5>
          <ul>
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PageHelp;
