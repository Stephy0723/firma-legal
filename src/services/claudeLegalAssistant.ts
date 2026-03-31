/**
 * LEGAL AI ASSISTANT - PROMPT SYSTEM
 * Prompt base para un asistente limitado estrictamente al marco legal.
 */

export const LEGAL_ASSISTANT_SYSTEM_PROMPT = `Eres Alaya, asistente legal virtual de JRL Inversiones.

Tu alcance esta limitado exclusivamente al marco legal. Solo puedes responder preguntas relacionadas con:
- asesorias legales generales
- orientacion juridica informativa
- derechos, obligaciones y responsabilidades legales
- contratos, demandas, expedientes, pruebas y documentos legales
- tramites, plazos, procesos judiciales y administrativos
- cumplimiento normativo y regulatorio
- implicaciones legales de una situacion

Reglas obligatorias:
1. Responde siempre en espanol.
2. Si la consulta NO es legal o no tiene un angulo juridico claro, debes rechazarla con amabilidad.
3. No des consejos de salud, finanzas personales, relaciones, tecnologia general, marketing, ventas, productividad ni temas personales si no existe una pregunta legal concreta.
4. Si el usuario mezcla temas, responde solo la parte legal y aclara que tu alcance termina ahi.
5. No inventes leyes, articulos, tribunales, plazos ni autoridades. Si falta jurisdiccion o contexto, dilo claramente.
6. No sustituyas a un abogado. Para decisiones sensibles, recomienda consulta profesional.
7. No redactes fraudes, amenazas, encubrimientos, evasiones ni conductas ilegales.
8. Si la consulta es de alto riesgo, indica que la respuesta es informativa y que debe revisarla un profesional del area.

Formato de respuesta:
- breve, claro y profesional
- enfocado en la implicacion legal real
- usa listas solo cuando ayuden
- si aplica, pide jurisdiccion o documento para afinar el analisis

Si la consulta esta fuera del marco legal, responde en esencia:
"Solo puedo ayudar dentro del marco legal. Si deseas, reformula tu consulta desde su aspecto juridico y te ayudo."
`;

export const LEGAL_ASSISTANT_QUESTIONS: Record<string, string> = {
  procedimientos: 'Orientacion sobre tramites, etapas procesales y diligencias.',
  contratos: 'Orientacion sobre contratos, clausulas, obligaciones y riesgos legales.',
  plazos: 'Orientacion sobre terminos, vencimientos y tiempos procesales.',
  derechos: 'Orientacion sobre derechos, deberes y posibles implicaciones legales.',
  normativas: 'Orientacion sobre cumplimiento, regulacion y obligaciones legales.',
  expedientes: 'Apoyo general con gestion documental y contexto juridico de expedientes.',
};

export const LEGAL_KNOWLEDGE_BASE = [
  {
    category: 'Procedimientos legales',
    items: [
      {
        title: 'Cuales son los plazos comunes en procesos judiciales?',
        answer: `Los plazos dependen de la jurisdiccion y del tipo de proceso. Como regla general, conviene revisar:
- plazo para responder una demanda
- plazo para apelar o recurrir
- dias habiles aplicables
- fechas de citacion, audiencia o deposito`,
      },
      {
        title: 'Que es una diligencia procesal?',
        answer: `Es una actuacion dentro de un proceso para impulsar o ejecutar un tramite. Puede incluir:
- citaciones
- notificaciones
- recepcion de pruebas
- actuaciones del tribunal o secretaria`,
      },
    ],
  },
  {
    category: 'Documentacion legal',
    items: [
      {
        title: 'Que documentos suelen pedirse para constituir una empresa?',
        answer: `Depende del pais y del tipo societario, pero suelen pedirse:
1. documento de identidad de los socios
2. estatutos o acta constitutiva
3. domicilio social
4. poderes o autorizaciones
5. registros fiscales o mercantiles correspondientes`,
      },
    ],
  },
  {
    category: 'Derechos y obligaciones',
    items: [
      {
        title: 'Como orientar una duda sobre derechos laborales?',
        answer: `Lo correcto es revisar:
- contrato o relacion laboral existente
- salario, jornada y prestaciones
- terminacion o sanciones aplicadas
- normas laborales vigentes en la jurisdiccion
- vias de reclamacion administrativa o judicial`,
      },
    ],
  },
];

export interface LegalQuery {
  question: string;
  context?: string;
  category?: string;
}

export interface LegalResponse {
  answer: string;
  sources?: string[];
  disclaimer?: string;
  recommendedAction?: string;
}

export interface LegalAssistantHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

const LEGAL_ONLY_REPLY =
  'Solo puedo ayudar dentro del marco legal. Si deseas, reformula tu consulta desde su aspecto juridico y con gusto te ayudo.';

const LEGAL_KEYWORDS = [
  'abogado',
  'abogada',
  'acto juridico',
  'apelacion',
  'audiencia',
  'caso',
  'cedula',
  'citacion',
  'cliente',
  'codigo',
  'comparecencia',
  'compliance',
  'contrato',
  'custodia',
  'damnificado',
  'demanda',
  'denuncia',
  'derecho',
  'desalojo',
  'despido',
  'divorcio',
  'documento legal',
  'embargo',
  'escritura',
  'estatuto',
  'evidencia',
  'expediente',
  'firma',
  'fiscalia',
  'herencia',
  'impuesto',
  'incumplimiento',
  'indemnizacion',
  'juridic',
  'juez',
  'juicio',
  'laboral',
  'ley',
  'legal',
  'litigio',
  'matrimonio',
  'mediacion',
  'multa',
  'norma',
  'normativa',
  'notificacion',
  'penal',
  'permiso',
  'plazo',
  'poder notarial',
  'prueba',
  'proceso',
  'propiedad',
  'reglamento',
  'regulacion',
  'representacion',
  'recurso',
  'resolucion',
  'sentencia',
  'sucesion',
  'testamento',
  'testigo',
  'tribunal',
  'visita familiar',
];

const OUT_OF_SCOPE_KEYWORDS = [
  'calorias',
  'dieta',
  'ejercicio',
  'entrenamiento',
  'marketing',
  'publicidad',
  'seo',
  'programacion',
  'codigo fuente',
  'css',
  'html',
  'javascript',
  'react',
  'ventas',
  'novia',
  'novio',
  'amor',
  'pareja',
  'depresion',
  'ansiedad',
  'medicina',
  'medico',
  'tratamiento',
  'receta',
  'horoscopo',
  'viaje',
  'restaurante',
  'musica',
  'pelicula',
  'videojuego',
];

const normalizeValue = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const containsKeyword = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.includes(keyword));

export const isLikelyLegalQuery = (value: string) => {
  const normalized = normalizeValue(value);

  if (containsKeyword(normalized, LEGAL_KEYWORDS)) {
    return true;
  }

  if (containsKeyword(normalized, OUT_OF_SCOPE_KEYWORDS)) {
    return false;
  }

  return (
    normalized.includes('puedo demandar')
    || normalized.includes('me pueden demandar')
    || normalized.includes('es legal')
    || normalized.includes('es ilegal')
    || normalized.includes('que hago si')
    || normalized.includes('que procede')
    || normalized.includes('que puedo reclamar')
    || normalized.includes('que derechos tengo')
  );
};

// Helper function to format legal responses
export const formatLegalResponse = (response: string): string => {
  return `
<div class="legal-response">
  <div class="response-content">
    ${response}
  </div>
  <div class="legal-disclaimer">
    <strong>Aviso:</strong> Esta informacion es orientativa y no sustituye la revision de un abogado.
  </div>
</div>
  `;
};

// OpenAI API Function
export const callOpenAIAPI = async (
  userMessage: string,
  history: LegalAssistantHistoryMessage[] = [],
): Promise<string> => {
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  if (!isLikelyLegalQuery(userMessage)) {
    return LEGAL_ONLY_REPLY;
  }

  try {
    const response = await fetch(`${backendBaseUrl}/api/legal-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        history,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Legal assistant API error:', data);
      return `Error: ${data.error || 'No se pudo conectar con el asistente legal'}`;
    }

    const content = data.answer;

    if (content) {
      return content;
    }

    return 'No se pudo procesar la respuesta del asistente legal.';
  } catch (error) {
    console.error('Error calling legal assistant API:', error);
    if (error instanceof TypeError) {
      return `No pude conectar con el backend de Alaya. Verifica que el servidor este corriendo en ${backendBaseUrl} y que tu OPENAI_API_KEY este configurada en backend/.env.`;
    }

    return `Error de conexion: ${error instanceof Error ? error.message : 'Error desconocido'}`;
  }
};
