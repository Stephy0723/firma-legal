const mysql = require('mysql2/promise');
const { Client } = require('ssh2');
require('dotenv').config();

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

let db = null;

const createConnection = () => {
  return new Promise((resolve, reject) => {
    if (!sshConfig.host || !sshConfig.password) {
      console.log('⚡ Conectando a MySQL directamente (sin túnel SSH)...');
      mysql.createConnection(dbConfig).then(conn => {
        db = conn;
        console.log('✅ Conexión directa a MySQL establecida.');
        resolve(conn);
      }).catch(reject);
      return;
    }

    console.log('🔐 Iniciando Túnel SSH hacia', sshConfig.host, '...');
    const sshClient = new Client();

    sshClient.on('ready', () => {
      console.log('✅ Túnel SSH establecido. Conectando a MySQL...');
      sshClient.forwardOut(
        '127.0.0.1',
        0,
        dbConfig.host,
        dbConfig.port,
        (err, stream) => {
          if (err) {
            console.error('❌ Error en forwardOut:', err);
            sshClient.end();
            return reject(err);
          }

          mysql.createConnection({
            ...dbConfig,
            stream,
          }).then(conn => {
            db = conn;
            console.log('✅ Conexión MySQL sobre SSH establecida.');
            resolve(conn);
          }).catch(e => {
            console.error('❌ Error MySQL sobre SSH:', e);
            sshClient.end();
            reject(e);
          });
        }
      );
    }).on('error', (err) => {
      console.error('❌ Error SSH:', err.message);
      reject(err);
    }).connect(sshConfig);
  });
};

const getDB = async () => {
  if (!db) {
    await createConnection();
  }
  return db;
};

module.exports = { getDB };
