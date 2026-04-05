import React, { useEffect, useRef, useState } from 'react';
import { FaMinus, FaRobot, FaTimes, FaTrash } from 'react-icons/fa';
import {
  callOpenAIAPI,
  type LegalAssistantHistoryMessage,
} from '../../services/claudeLegalAssistant';
import './LegalAssistantBot.scss';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const BOT_NAME = 'Alaya';
const BOT_ROLE = 'Asistente legal';
const STORAGE_KEY = 'alaya_legal_history';

const createWelcomeMessage = (): Message => ({
  id: 'alaya-welcome',
  role: 'assistant',
  content:
    'Hola, soy Alaya. Solo respondo dentro del marco legal: orientacion juridica, contratos, procesos, derechos, expedientes, documentos y asesorias legales generales. Si tu consulta no es legal, te pedire reformularla desde su enfoque juridico.',
  timestamp: new Date(),
});

const loadStoredMessages = (): Message[] => {
  if (typeof window === 'undefined') {
    return [createWelcomeMessage()];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [createWelcomeMessage()];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || !parsed.length) {
      return [createWelcomeMessage()];
    }

    const normalized = parsed
      .map((item) => {
        const role: Message['role'] = item?.role === 'user' ? 'user' : 'assistant';

        return {
          id:
            typeof item?.id === 'string'
              ? item.id
              : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role,
          content: typeof item?.content === 'string' ? item.content : '',
          timestamp: item?.timestamp ? new Date(item.timestamp) : new Date(),
        };
      })
      .filter((item) => item.content.trim());

    return normalized.length ? normalized : [createWelcomeMessage()];
  } catch {
    return [createWelcomeMessage()];
  }
};

export const LegalAssistantBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => loadStoredMessages());
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  const handleToggle = () => {
    setIsOpen((current) => !current);
    setIsMinimized(false);
  };

  const handleResetConversation = () => {
    const nextMessages = [createWelcomeMessage()];
    setMessages(nextMessages);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextMessages));
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history: LegalAssistantHistoryMessage[] = messages
        .slice(-12)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const response = await callOpenAIAPI(inputValue, history);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `No pude procesar tu consulta. ${error instanceof Error ? error.message : 'Intenta de nuevo en un momento.'}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`legal-assistant-bot ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className="legal-assistant-bot__toggle"
        onClick={handleToggle}
        title={`Abrir ${BOT_NAME}`}
      >
        <span className="legal-assistant-bot__toggle-orb">
          <FaRobot />
        </span>
        <span className="legal-assistant-bot__toggle-copy">
          <strong>{BOT_NAME}</strong>
          <small>{BOT_ROLE}</small>
        </span>
        {!isOpen ? <span className="legal-assistant-bot__badge">IA</span> : null}
      </button>

      {isOpen && (
        <div className={`legal-assistant-bot__window ${isMinimized ? 'minimized' : ''}`}>
          <div className="legal-assistant-bot__header">
            <div className="legal-assistant-bot__header-brand">
              <span className="legal-assistant-bot__header-orb">
                <FaRobot />
              </span>
              <div className="legal-assistant-bot__header-copy">
                <strong>{BOT_NAME}</strong>
                <span>{BOT_ROLE}</span>
              </div>
            </div>

            <div className="legal-assistant-bot__header-actions">
              <button
                type="button"
                className="legal-assistant-bot__header-btn"
                onClick={handleResetConversation}
                title="Limpiar historial"
              >
                <FaTrash />
              </button>
              <button
                type="button"
                className="legal-assistant-bot__header-btn"
                onClick={() => setIsMinimized((current) => !current)}
                title="Minimizar"
              >
                <FaMinus />
              </button>
              <button
                type="button"
                className="legal-assistant-bot__header-btn close"
                onClick={() => setIsOpen(false)}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="legal-assistant-bot__messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`legal-assistant-bot__message ${message.role === 'user' ? 'user' : 'assistant'}`}
                  >
                    <div className="legal-assistant-bot__message-content">
                      <p>{message.content}</p>
                      <span className="legal-assistant-bot__message-time">
                        {message.timestamp.toLocaleTimeString('es-DO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="legal-assistant-bot__message assistant">
                    <div className="legal-assistant-bot__message-content">
                      <div className="legal-assistant-bot__loading">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="legal-assistant-bot__form">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Escribe tu consulta legal..."
                  disabled={isLoading}
                  className="legal-assistant-bot__input"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="legal-assistant-bot__send-btn"
                >
                  Enviar
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LegalAssistantBot;
