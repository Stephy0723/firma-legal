const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getDB } = require('./db');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Servir imágenes legacy de FTS-JRLinversiones
app.use('/FTS-JRLinversiones', express.static(path.resolve(__dirname, '..', 'public', 'FTS-JRLinversiones')));

// Multer config para imágenes del equipo
const TEAM_UPLOADS = path.join(__dirname, 'public', 'uploads', 'team');
if (!fs.existsSync(TEAM_UPLOADS)) {
  fs.mkdirSync(TEAM_UPLOADS, { recursive: true });
}

const teamStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, TEAM_UPLOADS),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.params.id}_${Date.now()}${ext}`);
  },
});

const teamUpload = multer({
  storage: teamStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpe?g|png)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG o PNG'));
    }
  },
});

// Multer config para documentos
const DOCS_UPLOADS = path.join(__dirname, 'public', 'uploads', 'documents');
if (!fs.existsSync(DOCS_UPLOADS)) {
  fs.mkdirSync(DOCS_UPLOADS, { recursive: true });
}

const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DOCS_UPLOADS),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpe?g|png|gif|pdf|docx?|xlsx?|pptx?|txt|csv|odt|ods)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

// Logger: imprime cada petición
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const timestamp = new Date().toLocaleTimeString('es-DO', { hour12: false });
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// Helpers to format JSON arrays from MySQL
const parseJSON = (data, fields) => {
  return data.map(item => {
    const parsedItem = { ...item };
    fields.forEach(f => {
      try {
        if (typeof parsedItem[f] === 'string') {
          parsedItem[f] = JSON.parse(parsedItem[f]);
        }
      } catch (e) {
        // En caso de error, inicializar como array vacío
        parsedItem[f] = [];
      }
    });
    // Convert is_read to boolean
    if (parsedItem.hasOwnProperty('is_read')) {
      parsedItem.read = Boolean(parsedItem.is_read);
      delete parsedItem.is_read;
    }
    return parsedItem;
  });
};

const normalizeAppointmentStatus = (value) => {
  if (value === 'confirmed' || value === 'confirmada') return 'confirmed';
  if (value === 'cancelled' || value === 'cancelada') return 'cancelled';
  return 'pending';
};

const normalizeAppointmentSource = (value) => {
  if (['admin', 'walkin', 'phone', 'whatsapp'].includes(value)) return value;
  return 'website';
};

const normalizeAppointmentFormat = (value) => {
  if (value === 'virtual' || value === 'telefonica') return value;
  return 'presencial';
};

const normalizeAppointmentConfirmation = (value) => {
  if (value === 'email' || value === 'call') return value;
  return 'whatsapp';
};

const LEGAL_ASSISTANT_SYSTEM_PROMPT = `Eres Alaya, asistente legal virtual de JRL Inversiones.

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
"Solo puedo ayudar dentro del marco legal. Si deseas, reformula tu consulta desde su aspecto juridico y te ayudo."`;

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

const normalizeLegalText = (value) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const containsKeyword = (value, keywords) =>
  keywords.some((keyword) => value.includes(keyword));

const isLikelyLegalQuery = (value) => {
  const normalized = normalizeLegalText(value);

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


// ──────────────────────────────────────────────
// SERVICIOS (SERVICES)
// ──────────────────────────────────────────────
app.get('/api/services', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM services');
    res.json(parseJSON(rows, ['details']));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  const { id, title, icon, description, fullDescription, details } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO services (id, title, icon, description, fullDescription, details) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, icon, description, fullDescription, JSON.stringify(details)]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  const { title, icon, description, fullDescription, details } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE services SET title=?, icon=?, description=?, fullDescription=?, details=? WHERE id=?',
      [title, icon, description, fullDescription, JSON.stringify(details), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM messages WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM services WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM appointments WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// EQUIPO (TEAM)
// ──────────────────────────────────────────────
app.get('/api/team', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM team');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const parsed = parseJSON(rows, ['education', 'achievements']);
    // Normalizar rutas de imagen a URLs completas
    parsed.forEach(m => {
      if (m.image && !m.image.startsWith('http')) {
        m.image = baseUrl + m.image;
      }
    });
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/team', async (req, res) => {
  const { id, name, role, specialty, image, bio, linkedin, email, education, achievements } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO team (id, name, role, specialty, image, bio, linkedin, email, education, achievements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, role, specialty, image, bio, linkedin, email, JSON.stringify(education), JSON.stringify(achievements)]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/team/:id', async (req, res) => {
  try {
    const db = await getDB();
    const fields = req.body;
    const updates = [];
    const values = [];
    const allowed = ['name', 'role', 'specialty', 'image', 'bio', 'linkedin', 'email', 'education', 'achievements'];
    const jsonFields = ['education', 'achievements'];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key}=?`);
        values.push(jsonFields.includes(key) ? JSON.stringify(fields[key]) : fields[key]);
      }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    await db.query(`UPDATE team SET ${updates.join(', ')} WHERE id=?`, values);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/team/:id/upload', teamUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }
    const imagePath = `/uploads/team/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${imagePath}`;
    const db = await getDB();
    await db.query('UPDATE team SET image=? WHERE id=?', [fullUrl, req.params.id]);
    res.json({ success: true, image: fullUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/team/:id/image', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT image FROM team WHERE id=?', [req.params.id]);
    if (!rows.length || !rows[0].image) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    const imgPath = rows[0].image;
    // Si es una ruta local de uploads, servir el archivo
    if (imgPath.startsWith('/uploads/')) {
      return res.sendFile(path.join(__dirname, 'public', imgPath));
    }
    // Si es ruta legacy (FTS-JRLinversiones) o URL externa, redirigir
    return res.redirect(imgPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/team/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM team WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// MENSAJES (MESSAGES)
// ──────────────────────────────────────────────
app.get('/api/messages', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM messages ORDER BY date DESC');
    res.json(parseJSON(rows, []));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  const { id, name, email, phone, area, message, date, read } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO messages (id, name, email, phone, area, message, date, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, phone, area, message, new Date(date), read ? 1 : 0]
    );
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/messages/:id/read', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('UPDATE messages SET is_read=1 WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/messages/:id', async (req, res) => {
  const { name, email, phone, area, message, read } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE messages SET name=?, email=?, phone=?, area=?, message=?, is_read=? WHERE id=?',
      [name, email, phone, area, message, read ? 1 : 0, req.params.id],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// CITAS (APPOINTMENTS)
// ──────────────────────────────────────────────
app.get('/api/appointments', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM appointments ORDER BY date DESC, time DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  const {
    id,
    clientName,
    email,
    phone,
    date,
    time,
    purpose,
    status,
    lawyerId,
    notes,
    source,
    format,
    confirmationPreference,
    createdAt,
    updatedAt,
  } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO appointments (id, clientName, email, phone, date, time, purpose, status, lawyerId, notes, source, format, confirmationPreference, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        clientName,
        email || null,
        phone || null,
        date,
        time,
        purpose,
        normalizeAppointmentStatus(status),
        lawyerId || null,
        notes || null,
        normalizeAppointmentSource(source),
        normalizeAppointmentFormat(format),
        normalizeAppointmentConfirmation(confirmationPreference),
        createdAt ? new Date(createdAt) : new Date(),
        updatedAt ? new Date(updatedAt) : null,
      ]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  const {
    clientName,
    email,
    phone,
    date,
    time,
    purpose,
    status,
    lawyerId,
    notes,
    source,
    format,
    confirmationPreference,
    updatedAt,
  } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE appointments SET clientName=?, email=?, phone=?, date=?, time=?, purpose=?, status=?, lawyerId=?, notes=?, source=?, format=?, confirmationPreference=?, updatedAt=? WHERE id=?',
      [
        clientName,
        email || null,
        phone || null,
        date,
        time,
        purpose,
        normalizeAppointmentStatus(status),
        lawyerId || null,
        notes || null,
        normalizeAppointmentSource(source),
        normalizeAppointmentFormat(format),
        normalizeAppointmentConfirmation(confirmationPreference),
        updatedAt ? new Date(updatedAt) : new Date(),
        req.params.id,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  const { status, updatedAt } = req.body;
  try {
    const db = await getDB();
    await db.query('UPDATE appointments SET status=?, updatedAt=? WHERE id=?', [
      normalizeAppointmentStatus(status),
      updatedAt ? new Date(updatedAt) : new Date(),
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// CLIENTS
// ──────────────────────────────────────────────
app.get('/api/clients', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
    const parsed = parseJSON(rows, ['tags', 'assets']);
    res.json(parsed.map(r => {
      const { extra, ...rest } = r;
      const extraObj = typeof extra === 'string' ? (() => { try { return JSON.parse(extra); } catch { return {}; } })() : (extra || {});
      return { ...rest, ...extraObj };
    }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/document_folders/:id', async (req, res) => {
  const { name, description, color, lawyer_id, client_id } = req.body;
  try {
    const db = await getDB();
    await db.query('UPDATE document_folders SET name=?, description=?, color=?, lawyer_id=?, client_id=? WHERE id=?', [name, description || null, color || '#6366F1', lawyer_id || null, client_id || null, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/clients', async (req, res) => {
  const { id, name, email, phone, address, created_at, updatedAt, caseTopic, notes, tags, assets, ...extra } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO clients (id, name, email, phone, address, created_at, updatedAt, caseTopic, notes, tags, assets, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        name,
        email,
        phone,
        address,
        created_at ? new Date(created_at) : new Date(),
        updatedAt ? new Date(updatedAt) : null,
        caseTopic || null,
        notes || null,
        JSON.stringify(tags || []),
        JSON.stringify(assets || []),
        JSON.stringify(extra || {}),
      ]
    );
    res.status(201).json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/clients/:id', async (req, res) => {
  const { name, email, phone, address, updatedAt, caseTopic, notes, tags, assets, ...extra } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE clients SET name=?, email=?, phone=?, address=?, updatedAt=?, caseTopic=?, notes=?, tags=?, assets=?, extra=? WHERE id=?',
      [
        name,
        email,
        phone,
        address,
        updatedAt ? new Date(updatedAt) : new Date(),
        caseTopic || null,
        notes || null,
        JSON.stringify(tags || []),
        JSON.stringify(assets || []),
        JSON.stringify(extra || {}),
        req.params.id,
      ]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM clients WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────
// CASES (LITIS)
// ──────────────────────────────────────────────
app.get('/api/cases', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM cases ORDER BY created_at DESC');
    const parsed = parseJSON(rows, ['witnesses', 'assets', 'extra']);
    // Merge extra fields into top level
    const result = parsed.map(r => {
      const { extra, ...rest } = r;
      return { ...rest, ...(extra && typeof extra === 'object' ? extra : {}) };
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cases', async (req, res) => {
  const { id, client_id, lawyer_id, title, cedula, description, status, created_at, updatedAt, witnesses, assets, ...extra } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO cases (id, client_id, lawyer_id, title, cedula, description, status, created_at, updatedAt, witnesses, assets, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, client_id, lawyer_id, title, cedula || '', description || null, status || 'Evaluación', created_at ? new Date(created_at) : new Date(), updatedAt ? new Date(updatedAt) : null, JSON.stringify(witnesses || []), JSON.stringify(assets || []), JSON.stringify(extra || {})]
    );
    res.status(201).json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/cases/:id', async (req, res) => {
  const { client_id, lawyer_id, title, cedula, description, status, updatedAt, witnesses, assets, ...extra } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE cases SET client_id=?, lawyer_id=?, title=?, cedula=?, description=?, status=?, updatedAt=?, witnesses=?, assets=?, extra=? WHERE id=?',
      [client_id, lawyer_id, title, cedula || '', description || null, status, updatedAt ? new Date(updatedAt) : new Date(), JSON.stringify(witnesses || []), JSON.stringify(assets || []), JSON.stringify(extra || {}), req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/cases/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM cases WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────
// DOCUMENT FOLDERS
// ──────────────────────────────────────────────
app.get('/api/document_folders', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM document_folders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/document_folders', async (req, res) => {
  const { id, name, description, color, lawyer_id, client_id } = req.body;
  try {
    const db = await getDB();
    await db.query('INSERT INTO document_folders (id, name, description, color, lawyer_id, client_id) VALUES (?, ?, ?, ?, ?, ?)', [id, name, description || null, color || '#6366F1', lawyer_id || null, client_id || null]);
    res.status(201).json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/document_folders/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM document_folders WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ──────────────────────────────────────────────
// DOCUMENTS
// ──────────────────────────────────────────────
app.get('/api/documents', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM documents ORDER BY COALESCE(updatedAt, uploadDate) DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Subir archivo de documento
app.post('/api/documents/upload', docUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }
    const filePath = `/uploads/documents/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${filePath}`;
    res.json({ success: true, url: fullUrl, filename: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', async (req, res) => {
  const { id, title, client_id, lawyer_id, folder_id, type, url, uploadDate, updatedAt, note, description, tags, assets, history } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO documents (id, title, client_id, lawyer_id, folder_id, type, url, uploadDate, updatedAt, note, description, tags, assets, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        title,
        client_id || null,
        lawyer_id || null,
        folder_id || null,
        type,
        url,
        new Date(uploadDate),
        updatedAt ? new Date(updatedAt) : null,
        note || null,
        description || null,
        JSON.stringify(tags || []),
        JSON.stringify(assets || []),
        JSON.stringify(history || []),
      ]
    );
    res.status(201).json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/documents/:id', async (req, res) => {
  const { title, client_id, lawyer_id, folder_id, type, url, updatedAt, note, description, tags, assets, history } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE documents SET title=?, client_id=?, lawyer_id=?, folder_id=?, type=?, url=?, updatedAt=?, note=?, description=?, tags=?, assets=?, history=? WHERE id=?',
      [
        title,
        client_id || null,
        lawyer_id || null,
        folder_id || null,
        type,
        url,
        updatedAt ? new Date(updatedAt) : new Date(),
        note || null,
        description || null,
        JSON.stringify(tags || []),
        JSON.stringify(assets || []),
        JSON.stringify(history || []),
        req.params.id,
      ]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM documents WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/legal-assistant', async (req, res) => {
  const { message, history } = req.body || {};
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedMessage) {
    return res.status(400).json({ error: 'Debes enviar una consulta legal.' });
  }

  if (!isLikelyLegalQuery(trimmedMessage)) {
    return res.json({ answer: LEGAL_ONLY_REPLY });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY no esta configurada en el backend.',
    });
  }

  try {
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item
              && (item.role === 'user' || item.role === 'assistant')
              && typeof item.content === 'string'
              && item.content.trim(),
          )
          .slice(-12)
          .map((item) => ({
            role: item.role,
            content: item.content.trim(),
          }))
      : [];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: LEGAL_ASSISTANT_SYSTEM_PROMPT,
          },
          ...safeHistory,
          {
            role: 'user',
            content: trimmedMessage,
          },
        ],
        temperature: 0.35,
        max_tokens: 1024,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status || 500).json({
        error: data.error?.message || 'No se pudo conectar con OpenAI.',
      });
    }

    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        error: 'OpenAI no devolvio contenido para esta consulta.',
      });
    }

    return res.json({ answer });
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'No se pudo procesar la consulta legal.',
    });
  }
});

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos.' });
  }
  try {
    const db = await getDB();
    const [existing] = await db.query('SELECT id FROM usuario WHERE correo_electronico = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }
    const hash = await bcrypt.hash(password, 12);
    await db.query('INSERT INTO usuario (name, correo_electronico, contrasena) VALUES (?, ?, ?)', [name, email, hash]);
    res.json({ success: true, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
  }
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT id, name, correo_electronico, contrasena FROM usuario WHERE correo_electronico = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.contrasena);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    res.json({ success: true, name: user.name || '', email: user.correo_electronico });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// SETTINGS
// ──────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  defaultAppointmentFormat: 'presencial',
  defaultConfirmationChannel: 'whatsapp',
  websiteAppointmentsEnabled: true,
  intakeEmail: '',
  intakeWhatsApp: '',
  officeHours: 'Lun-Vie 8:00 AM - 6:00 PM',
};

app.get('/api/settings', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT data FROM settings WHERE id = 1');
    if (rows.length === 0) return res.json(DEFAULT_SETTINGS);
    res.json({ ...DEFAULT_SETTINGS, ...rows[0].data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const db = await getDB();
    const data = { ...DEFAULT_SETTINGS, ...req.body };
    await db.query(
      'INSERT INTO settings (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
      [JSON.stringify(data)]
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running' });
});

// ──────────────────────────────────────────────
// BUSQUEDA GLOBAL
// ──────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const db = await getDB();
    const searchTerm = `%${q}%`;
    const results = [];

    const [clients] = await db.query('SELECT id, name AS title, "Cliente" AS type FROM clients WHERE name LIKE ? OR email LIKE ? LIMIT 5', [searchTerm, searchTerm]);
    results.push(...clients.map(c => ({ title: c.title, type: c.type, path: '/admin/clients' })));

    const [cases] = await db.query('SELECT id, title, "Expediente" AS type FROM cases WHERE title LIKE ? OR description LIKE ? OR cedula LIKE ? LIMIT 5', [searchTerm, searchTerm, searchTerm]);
    results.push(...cases.map(c => ({ title: c.title, type: c.type, path: '/admin/cases' })));

    const [docs] = await db.query('SELECT id, title, "Documento" AS type FROM documents WHERE title LIKE ? LIMIT 5', [searchTerm]);
    results.push(...docs.map(c => ({ title: c.title, type: c.type, path: '/admin/documents' })));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor CRM Backend corriendo en http://localhost:${port}`);
  console.log('Esperando peticiones TLS/SSH según configuración en db.js...');
});
