const express = require('express');
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3002;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'tu-secret-aqui';
const DEPLOY_SCRIPT = path.join(__dirname, '..', 'deploy.sh');
const LOG_FILE = '/var/log/webhook-listener.log';

// Middleware
app.use(express.json());

// Función para logging
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage);
};

// Verificar firma del webhook (seguridad)
const verifyWebhookSignature = (req) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    log('No signature provided', 'warn');
    return false;
  }

  const payload = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  const expectedSignature = `sha256=${hash}`;
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  return isValid;
};

// Webhook endpoint
app.post('/webhook/deploy', (req, res) => {
  log('Webhook recibido');

  // Verificar firma
  if (!verifyWebhookSignature(req)) {
    log('Firma de webhook inválida', 'error');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verificar que sea de la rama main
  const ref = req.body.ref;
  if (ref !== 'refs/heads/main') {
    log(`Webhook de rama diferente: ${ref}. Ignorando.`, 'info');
    return res.status(200).json({ message: 'Not main branch, skipping deploy' });
  }

  log('Webhook válido para rama main. Iniciando deploy...', 'info');

  try {
    // Ejecutar el script de deploy
    const output = execSync(`bash ${DEPLOY_SCRIPT}`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
    });
    
    log('Deploy completado exitosamente', 'success');
    log(output, 'info');

    return res.status(200).json({
      success: true,
      message: 'Deploy completado exitosamente',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log(`Error durante el deploy: ${error.message}`, 'error');
    log(error.stdout || '', 'error');

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Status endpoint
app.get('/status', (req, res) => {
  try {
    const recentLogs = execSync(`tail -20 ${LOG_FILE}`, { encoding: 'utf-8' });
    res.json({
      status: 'running',
      port: PORT,
      recentLogs: recentLogs.split('\n'),
    });
  } catch (error) {
    res.json({ status: 'running', port: PORT, message: 'Sin logs aún' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  log(`Webhook listener iniciado en puerto ${PORT}`, 'info');
  log(`Endpoint: http://localhost:${PORT}/webhook/deploy`, 'info');
  log(`Health check: http://localhost:${PORT}/health`, 'info');
});
