const express = require('express');
const cors = require('cors');
const { getDB } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

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

app.delete('/api/services/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM services WHERE id=?', [req.params.id]);
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
    res.json(parseJSON(rows, ['education', 'achievements']));
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
  const { name, role, specialty, image, bio, linkedin, email, education, achievements } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE team SET name=?, role=?, specialty=?, image=?, bio=?, linkedin=?, email=?, education=?, achievements=? WHERE id=?',
      [name, role, specialty, image, bio, linkedin, email, JSON.stringify(education), JSON.stringify(achievements), req.params.id]
    );
    res.json({ success: true });
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

// ──────────────────────────────────────────────
// CITAS (APPOINTMENTS)
// ──────────────────────────────────────────────
app.get('/api/appointments', async (req, res) => {
  try {
    const db = await getDB();
    const [rows] = await db.query('SELECT * FROM appointments ORDER BY fecha DESC, hora DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { nombre, email, telefono, area, fecha, hora, mensaje, estatus } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO appointments (nombre, email, telefono, area, fecha, hora, mensaje, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, email, telefono, area, fecha, hora, mensaje || '', estatus || 'pendiente']
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  const { estatus } = req.body;
  try {
    const db = await getDB();
    await db.query('UPDATE appointments SET estatus=? WHERE id=?', [estatus, req.params.id]);
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
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/clients', async (req, res) => {
  const { id, name, email, phone, address } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO clients (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, phone, address]
    );
    res.status(201).json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/clients/:id', async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE clients SET name=?, email=?, phone=?, address=? WHERE id=?',
      [name, email, phone, address, req.params.id]
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
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cases', async (req, res) => {
  const { id, client_id, lawyer_id, title, description, status } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO cases (id, client_id, lawyer_id, title, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, client_id, lawyer_id, title, description, status || 'Evaluación']
    );
    res.status(201).json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/cases/:id', async (req, res) => {
  const { client_id, lawyer_id, title, description, status } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'UPDATE cases SET client_id=?, lawyer_id=?, title=?, description=?, status=? WHERE id=?',
      [client_id, lawyer_id, title, description, status, req.params.id]
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
  const { id, name } = req.body;
  try {
    const db = await getDB();
    await db.query('INSERT INTO document_folders (id, name) VALUES (?, ?)', [id, name]);
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
    const [rows] = await db.query('SELECT * FROM documents ORDER BY uploadDate DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/documents', async (req, res) => {
  const { id, title, client_id, folder_id, type, url, uploadDate } = req.body;
  try {
    const db = await getDB();
    await db.query(
      'INSERT INTO documents (id, title, client_id, folder_id, type, url, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, client_id || null, folder_id || null, type, url, new Date(uploadDate)]
    );
    res.status(201).json({ success: true, id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.query('DELETE FROM documents WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
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

    const [cases] = await db.query('SELECT id, title, "Expediente" AS type FROM cases WHERE title LIKE ? OR description LIKE ? LIMIT 5', [searchTerm, searchTerm]);
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
