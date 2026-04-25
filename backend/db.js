const mysql = require('mysql2/promise');
const { Client } = require('ssh2');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'servicioslegales',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'servicioslegales',
};

const sshConfig = {
  host: process.env.SSH_HOST,
  port: parseInt(process.env.SSH_PORT || '22', 10),
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
};

const useSshTunnel = Boolean(sshConfig.host && sshConfig.username && sshConfig.password);
const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10);

const retryableErrorCodes = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  'PROTOCOL_ENQUEUE_AFTER_QUIT',
]);

let dbHandle = null;
let dbInitPromise = null;
let sshClient = null;

const isRetryableDbError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    retryableErrorCodes.has(error?.code) ||
    message.includes('closed state') ||
    message.includes('connection is closed') ||
    message.includes('pool is closed')
  );
};

const invalidateHandle = () => {
  dbHandle = null;
  dbInitPromise = null;
};

const cleanupDbResources = async () => {
  const currentHandle = dbHandle;
  const currentSshClient = sshClient;

  dbHandle = null;
  dbInitPromise = null;
  sshClient = null;

  if (currentHandle) {
    try {
      await currentHandle.end();
    } catch (_error) {
      // Ignore cleanup errors during reconnection.
    }
  }

  if (currentSshClient) {
    try {
      currentSshClient.end();
    } catch (_error) {
      // Ignore cleanup errors during reconnection.
    }
  }
};

const createDirectPool = async () => {
  console.log('[db] Connecting to MySQL directly...');

  const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

  await pool.query('SELECT 1');
  console.log('[db] MySQL pool ready.');

  return pool;
};

const createSshConnection = async () => {
  console.log('[db] Starting SSH tunnel...');

  return new Promise((resolve, reject) => {
    const client = new Client();

    client
      .on('ready', () => {
        console.log('[db] SSH tunnel ready. Connecting to MySQL...');

        client.forwardOut('127.0.0.1', 0, dbConfig.host, dbConfig.port, async (error, stream) => {
          if (error) {
            client.end();
            reject(error);
            return;
          }

          try {
            const connection = await mysql.createConnection({
              ...dbConfig,
              stream,
              enableKeepAlive: true,
              keepAliveInitialDelay: 0,
            });

            sshClient = client;

            client.on('close', invalidateHandle);
            client.on('error', (sshError) => {
              console.error('[db] SSH error:', sshError.message);
              invalidateHandle();
            });

            if (connection.connection?.stream) {
              connection.connection.stream.on('close', invalidateHandle);
              connection.connection.stream.on('error', invalidateHandle);
            }

            await connection.query('SELECT 1');
            console.log('[db] MySQL connection over SSH ready.');
            resolve(connection);
          } catch (mysqlError) {
            client.end();
            reject(mysqlError);
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      })
      .connect(sshConfig);
  });
};

const createDbHandle = async () => {
  if (useSshTunnel) {
    return createSshConnection();
  }

  return createDirectPool();
};

const ensureDbHandle = async () => {
  if (dbHandle) {
    return dbHandle;
  }

  if (!dbInitPromise) {
    dbInitPromise = createDbHandle()
      .then((handle) => {
        dbHandle = handle;
        return handle;
      })
      .catch((error) => {
        invalidateHandle();
        throw error;
      });
  }

  return dbInitPromise;
};

const runWithReconnect = async (method, args) => {
  let handle = await ensureDbHandle();

  try {
    return await handle[method](...args);
  } catch (error) {
    if (!isRetryableDbError(error)) {
      throw error;
    }

    console.warn(`[db] ${method} failed (${error.code || error.message}). Reconnecting and retrying once...`);

    await cleanupDbResources();
    handle = await ensureDbHandle();
    return handle[method](...args);
  }
};

const dbFacade = {
  query: (...args) => runWithReconnect('query', args),
  execute: (...args) => runWithReconnect('execute', args),
};

const getDB = async () => {
  await ensureDbHandle();
  return dbFacade;
};

module.exports = { getDB };
