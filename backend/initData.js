const { getDB } = require('./db');

const initDatabase = async () => {
  try {
    const db = await getDB();
    console.log('🔗 Conexión a la base de datos obtenida. Inicializando tablas...');

    // Tabla de Servicios
    await db.query(`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        fullDescription TEXT NOT NULL,
        details JSON NOT NULL
      )
    `);

    // Tabla de Equipo
    await db.query(`
      CREATE TABLE IF NOT EXISTS team (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        specialty VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        bio TEXT NOT NULL,
        linkedin VARCHAR(255),
        email VARCHAR(255),
        education JSON NOT NULL,
        achievements JSON NOT NULL
      )
    `);

    // Tabla de Mensajes del Contact Form
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        area VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        date DATETIME NOT NULL,
        is_read BOOLEAN DEFAULT FALSE
      )
    `);

    // Tabla de Citas
    await db.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(50) PRIMARY KEY,
        clientName VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        date DATE NOT NULL,
        time VARCHAR(50) NOT NULL,
        purpose VARCHAR(255) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        lawyerId VARCHAR(50),
        notes TEXT,
        source VARCHAR(50),
        format VARCHAR(50),
        confirmationPreference VARCHAR(50),
        createdAt DATETIME NULL,
        updatedAt DATETIME NULL
      )
    `);

    // Tabla de Clientes
    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NULL,
        caseTopic VARCHAR(255),
        notes TEXT,
        tags LONGTEXT,
        assets LONGTEXT
      )
    `);

    // Tabla de Casos Legales
    await db.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id VARCHAR(50) PRIMARY KEY,
        client_id VARCHAR(50) NOT NULL,
        lawyer_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        cedula VARCHAR(50) NOT NULL,
        description TEXT,
        status ENUM('Evaluación', 'En Proceso', 'En Corte', 'Cerrado') DEFAULT 'Evaluación',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NULL,
        witnesses LONGTEXT,
        assets LONGTEXT
      )
    `);

    // Tabla de Carpetas de Documentos
    await db.query(`
      CREATE TABLE IF NOT EXISTS document_folders (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de Documentos
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        client_id VARCHAR(50),
        folder_id VARCHAR(50),
        type VARCHAR(100) NOT NULL,
        url TEXT,
        uploadDate DATETIME NOT NULL,
        updatedAt DATETIME NULL,
        note TEXT,
        tags LONGTEXT,
        assets LONGTEXT,
        history LONGTEXT
      )
    `);

    // Migrar tabla anterior de documentos si existía
    try {
      await db.query('ALTER TABLE documents ADD COLUMN client_id VARCHAR(50)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE documents ADD COLUMN folder_id VARCHAR(50)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE documents ADD COLUMN updatedAt DATETIME NULL');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE documents ADD COLUMN note TEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE documents ADD COLUMN tags LONGTEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE documents ADD COLUMN assets LONGTEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE documents ADD COLUMN history LONGTEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN email VARCHAR(255)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN phone VARCHAR(50)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN lawyerId VARCHAR(50)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN notes TEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN source VARCHAR(50)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN format VARCHAR(50)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN confirmationPreference VARCHAR(50)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN createdAt DATETIME NULL');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE appointments ADD COLUMN updatedAt DATETIME NULL');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE clients ADD COLUMN updatedAt DATETIME NULL');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE clients ADD COLUMN caseTopic VARCHAR(255)');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE clients ADD COLUMN notes TEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE clients ADD COLUMN tags LONGTEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE clients ADD COLUMN assets LONGTEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }

    try {
      await db.query('ALTER TABLE cases ADD COLUMN cedula VARCHAR(50) NULL');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE cases ADD COLUMN updatedAt DATETIME NULL');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE cases ADD COLUMN witnesses LONGTEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }
    try {
      await db.query('ALTER TABLE cases ADD COLUMN assets LONGTEXT');
    } catch (e) {
      // Ignorar error si la columna ya existe
    }

    console.log('✅ Tablas inicializadas exitosamente en el esquema.');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  }
};

initDatabase().then(() => {
  console.log('✅ Proceso de inicialización finalizado. (Puedes salir presionando Ctrl+C)');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
