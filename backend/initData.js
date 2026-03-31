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

    // ── SEED: Servicios ──────────────────────────────────────────────
    console.log('🌱 Insertando datos de servicios...');
    const services = [
      {
        id: '1', icon: 'FaBalanceScale',
        title: 'Asesoramiento en Litis Judiciales',
        description: 'Representación y estrategia legal en procesos judiciales civiles, penales y contencioso-administrativos. Acompañamiento integral desde la evaluación inicial hasta la resolución del caso.',
        fullDescription: 'Brindamos asesoría legal integral para litis judiciales, acompañando cada etapa del proceso con enfoque técnico, estrategia procesal y defensa rigurosa de sus derechos. Nuestro equipo evalúa cada caso de forma minuciosa para diseñar la mejor estrategia de litigio, ya sea en jurisdicción civil, penal, comercial o administrativa. Contamos con amplia experiencia en audiencias, redacción de escritos judiciales y gestión de recursos ante tribunales superiores.',
        details: ['Evaluación y estrategia personalizada del caso', 'Representación en audiencias y tribunales de todas las instancias', 'Preparación de escritos, demandas y recursos judiciales', 'Seguimiento completo del proceso hasta sentencia firme', 'Mediación y arbitraje como vías alternativas de resolución', 'Ejecución de sentencias y cobros judiciales'],
      },
      {
        id: '2', icon: 'FaPassport',
        title: 'Procesos Migratorios',
        description: 'Visados, permisos de viaje para menores, regularización migratoria y trámites consulares. Gestión completa con acompañamiento personalizado para garantizar cumplimiento legal.',
        fullDescription: 'Gestionamos procesos migratorios con acompañamiento personalizado y profundo conocimiento de la normativa vigente. Nuestro equipo se especializa en la obtención y renovación de visados, permisos de viaje para menores, regularización de estatus migratorio y asesoría en requisitos consulares. Trabajamos directamente con las autoridades competentes para asegurar agilidad y cumplimiento en cada trámite, minimizando tiempos de espera y riesgo de rechazo.',
        details: ['Solicitud y renovación de visados de trabajo, estudio y residencia', 'Permisos de viaje para menores de edad', 'Regularización y documentación migratoria completa', 'Asesoría en requisitos y preparación de expedientes', 'Recursos y apelaciones ante denegaciones migratorias', 'Trámites consulares y legalizaciones internacionales'],
      },
      {
        id: '3', icon: 'FaUsers',
        title: 'Derecho de Familia',
        description: 'Divorcios de mutuo acuerdo y contenciosos, manutención, pensión alimentaria, custodia de menores y régimen de visitas. Soluciones con sensibilidad humana y firmeza jurídica.',
        fullDescription: 'Atendemos asuntos familiares con sensibilidad humana y firmeza jurídica, buscando siempre soluciones que protejan los intereses de nuestros clientes y, especialmente, el bienestar de los menores involucrados. Nuestro equipo cuenta con experiencia en divorcios consensuales y contenciosos, demandas de pensión alimentaria, procesos de custodia, reconocimiento de paternidad y acuerdos prematrimoniales. Priorizamos la mediación familiar cuando es posible, reservando el litigio para cuando sea estrictamente necesario.',
        details: ['Divorcios de mutuo acuerdo y contenciosos', 'Manutención y pensión alimentaria', 'Custodia compartida y régimen de visitas', 'Reconocimiento de paternidad y filiación', 'Acuerdos prematrimoniales y postmatrimoniales', 'Mediación familiar y resolución alternativa de conflictos'],
      },
      {
        id: '4', icon: 'FaBuilding',
        title: 'Servicios Inmobiliarios',
        description: 'Tasación profesional de inmuebles, transferencia y registro de propiedad, revisión de títulos y due diligence inmobiliario. Transacciones seguras y conformes a derecho.',
        fullDescription: 'Ofrecemos asesoría y gestión completa en operaciones inmobiliarias para garantizar transacciones seguras, bien documentadas y conformes a la legislación vigente. Nuestros servicios incluyen tasación profesional de inmuebles, transferencias de propiedad, revisión exhaustiva de títulos y cargas, due diligence inmobiliario y acompañamiento legal en compraventas, arrendamientos y desarrollos urbanísticos. Protegemos la inversión de nuestros clientes en cada etapa de la operación inmobiliaria.',
        details: ['Tasación profesional de inmuebles residenciales y comerciales', 'Transferencia y registro de propiedad ante la Jurisdicción Inmobiliaria', 'Revisión de títulos, cargas y gravámenes', 'Due diligence inmobiliario completo', 'Contratos de compraventa, arrendamiento y opción de compra', 'Asesoría legal en desarrollos urbanísticos y condominios'],
      },
      {
        id: '5', icon: 'FaCar',
        title: 'Traspaso de Matrícula de Vehículo',
        description: 'Gestión legal integral para traspasos vehiculares: verificación documental, preparación de expedientes, gestión de firmas y seguimiento hasta el cierre del trámite.',
        fullDescription: 'Realizamos el proceso de traspaso de matrícula de vehículo de forma segura, ordenada y eficiente, verificando minuciosamente cada requisito y documento necesario. Nos encargamos de toda la gestión desde la revisión de la documentación del vehículo, preparación del expediente de traspaso, coordinación de firmas y legalizaciones, hasta el seguimiento completo del trámite ante las autoridades de tránsito. Nuestro objetivo es que la operación se complete sin contratiempos ni riesgos para las partes involucradas.',
        details: ['Revisión exhaustiva de documentación del vehículo', 'Verificación de estado legal y gravámenes pendientes', 'Preparación completa del expediente de traspaso', 'Gestión de firmas, legalizaciones y autenticaciones', 'Registro ante las autoridades de tránsito', 'Seguimiento del trámite hasta su cierre definitivo'],
      },
      {
        id: '6', icon: 'FaFileSignature',
        title: 'Actos Notariales y Contratos',
        description: 'Redacción y formalización de actos notariales, contratos civiles y comerciales, poderes, declaraciones juradas y auténticas de firmas. Precisión jurídica adaptada a cada necesidad.',
        fullDescription: 'Redactamos y formalizamos actos notariales y contratos con la máxima precisión jurídica, adaptados a las necesidades personales, familiares, comerciales e inmobiliarias de cada cliente. Nuestro equipo domina la redacción de contratos civiles y comerciales, elaboración de poderes generales y especiales, declaraciones juradas, auténticas de firmas, actas de asamblea y todo tipo de instrumentos notariales que requieran validez legal. Garantizamos documentos claros, completos y ejecutables ante cualquier instancia.',
        details: ['Contratos civiles, comerciales y de prestación de servicios', 'Poderes generales, especiales y de representación', 'Declaraciones juradas y auténticas de firmas', 'Actas de asamblea y documentos societarios', 'Actos notariales diversos con fe pública', 'Revisión legal, certificación y formalización documental'],
      },
      {
        id: '7', icon: 'FaSearch',
        title: 'Perito Gráfico',
        description: 'Análisis forense especializado de documentos, firmas y escrituras. Detección de alteraciones documentales, falsificaciones y autenticación grafológica con más de 15 años de experiencia.',
        fullDescription: 'Ofrecemos servicios especializados de peritaje gráfico y documentoscopia, con análisis forense riguroso y científico de documentos, firmas, sellos y elementos indubitativos. Nuestro equipo, liderado por peritos con más de 15 años de experiencia y certificaciones internacionales, utiliza técnicas avanzadas de análisis grafológico, detección de alteraciones documentales, evaluación de procesos de impresión y autenticación forense. Emitimos dictámenes periciales con validez legal para su uso en procesos judiciales y administrativos.',
        details: ['Análisis e investigación forense de documentos', 'Peritaje especializado de firmas y escrituras manuscritas', 'Detección de alteraciones, tachaduras y falsificaciones documentales', 'Autenticación documental y evaluación de procesos de impresión', 'Elaboración de dictámenes periciales con validez judicial', 'Asesoría técnica como perito en procesos judiciales'],
      },
    ];

    for (const s of services) {
      await db.query(
        'INSERT IGNORE INTO services (id, title, icon, description, fullDescription, details) VALUES (?, ?, ?, ?, ?, ?)',
        [s.id, s.title, s.icon, s.description, s.fullDescription, JSON.stringify(s.details)]
      );
    }
    console.log(`✅ ${services.length} servicios insertados (o ya existían).`);

    // ── SEED: Equipo ─────────────────────────────────────────────────
    console.log('🌱 Insertando datos del equipo...');
    const team = [
      {
        id: '1',
        name: 'Lic. Luz Milagros Ramírez', role: 'Abogada',
        specialty: 'Derecho Civil, Migratorio, Laboral y de Familia',
        image: '/FTS-JRLinversiones/Luz Milagros Ramírez.jpeg',
        bio: 'Abogada dominicana, egresada de UTESA (2018). También es licenciada en Psicología Laboral (UTESA, 2011) y cuenta con habilitación docente (2018).',
        linkedin: '#', email: 'jrylinversiones@gmail.com',
        education: ['Licenciatura en Derecho - UTESA (2018)', 'Licenciatura en Psicología Laboral - UTESA (2011)', 'Habilitación docente (2018)'],
        achievements: ['Alto porcentaje de éxito en cobros compulsivos', 'Más del 90% de casos migratorios resueltos', 'Experiencia en gestión humana y negociación'],
      },
      {
        id: '2',
        name: 'Lic. Juan Francisco Rosa Cabral', role: 'Especialista',
        specialty: 'Derecho Penal',
        image: '/FTS-JRLinversiones/lic._juan_francisco_rosa_cabral.jpg',
        bio: 'Nacido en Constanza, República Dominicana, el 29 de junio de 1974. Egresado de la Universidad Autónoma de Santo Domingo en el año 2000.',
        linkedin: '#', email: 'jrylinversiones@gmail.com',
        education: ['Egresado de la Universidad Autónoma de Santo Domingo (2000)', 'Formación especializada en Derecho Penal'],
        achievements: ['Alto porcentaje de casos penales resueltos', 'Experiencia consolidada en litigación penal', 'Trayectoria destacada en el buffet jurídico'],
      },
      {
        id: '3',
        name: 'Dr. Nelson Rafael Acosta Brito', role: 'Abogado',
        specialty: 'Derecho de Familia, Inmobiliario y Demandas Judiciales',
        image: '/FTS-JRLinversiones/Nelson Rafael Acosta Brito.jpg',
        bio: 'Nacido el 1 de marzo de 1959 en Laguna Salada, Valverde. Inició sus estudios en la Universidad Central del Este en 1979, obteniendo el título de Doctor en Derecho en 1986.',
        linkedin: '#', email: 'jrylinversiones@gmail.com',
        education: ['Doctor en Derecho - Universidad Central del Este (1986)', 'Estudios iniciados en la UCE en 1979'],
        achievements: ['Experiencia en derecho penal, tránsito, civil e inmobiliario', 'Participación en casos de alto perfil jurídico', 'Sentencias favorables en litigios internacionales'],
      },
      {
        id: '4',
        name: 'Merlín Francisca Familia', role: 'Abogada',
        specialty: 'Derecho Procesal Civil, Administrativo, Laboral y Ley 155-17',
        image: '/FTS-JRLinversiones/Merlín Francisca Familia.jpg',
        bio: 'Abogada dominicana, egresada de UAPA (2020). Experta en Derecho Civil, contratos, embargos, divorcios, reconocimiento de paternidad y cobros judiciales.',
        linkedin: '#', email: 'jrylinversiones@gmail.com',
        education: ['Egresada de UAPA (2020)', 'Formación en Derecho Procesal Civil y Administrativo', 'Formación en Derecho Laboral y Ley 155-17'],
        achievements: ['Coordinación de departamentos legales en instituciones privadas', 'Experiencia en cobros judiciales y procesos civiles', 'Fortalezas en liderazgo y negociación'],
      },
      {
        id: '5',
        name: 'Eleine Karys Rosa Gil', role: 'Abogada',
        specialty: 'Derecho',
        image: '/FTS-JRLinversiones/eleine_karys_rosa_gil.jpg',
        bio: 'A lo largo de su formación y experiencia, ha complementado su perfil profesional como Abogada JR con diversos cursos y diplomados que fortalecen sus conocimientos y le permiten tener una visión integral en diferentes áreas.',
        linkedin: '#', email: 'jrylinversiones@gmail.com',
        education: ['Negocios móviles', 'Regulación de la interacción digital', 'Diálogo', 'Fideicomiso de planificación sucesoral en la República Dominicana', 'Alquileres inmobiliarios y administración de propiedades', 'Diplomado en bienes raíces', 'Asesor consular Estados Unidos'],
        achievements: ['Visión integral para diferentes áreas jurídicas', 'Competencias para el desarrollo de soluciones innovadoras', 'Aporte de valor en el ámbito jurídico y profesional'],
      },
      {
        id: '6',
        name: 'Juan Carlos Pérez', role: 'Encargado',
        specialty: 'Departamento de Correspondencia',
        image: '/FTS-JRLinversiones/juan_carlos_pérez.jpg',
        bio: 'Nacido en Santo Domingo el 22 de enero de 1982. Responsable de transportar, visitar, recibir y entregar documentos, paquetes y noticias en la institución.',
        linkedin: '#', email: 'jrylinversiones@gmail.com',
        education: ['Gestión de diligencias documentales', 'Manejo de correspondencia institucional'],
        achievements: ['Puntualidad y eficiencia en diligencias', 'Seguridad y confidencialidad en entregas', 'Apoyo clave para la operación legal'],
      },
      {
        id: '7',
        name: 'Iris Yesenia Tejada', role: 'Perito Gráfico',
        specialty: 'Documentoscopia y Análisis Forense',
        image: '/FTS-JRLinversiones/Iris Yesenia Tejada.jpg',
        bio: 'La Perito en Documentoscopia Iris Yesenia Tejada es una especialista forense con más de 15 años de experiencia en el análisis e investigación de documentos, firmas y elementos indubitativos relacionados con procesos legales y judiciales.',
        linkedin: '#', email: 'jrylinversiones@gmail.com',
        education: ['Técnico Profesional en Criminalística - Bogotá, Colombia (2006)', 'Analista Forense, mención Documentoscopia - INACIF (2012)', 'Reconocimiento Documentos Fraudulentos & Examen de Documentos de Viaje Avanzado - Office of Antiterrorism Assistance, Diplomatic Security USA (2015)', 'Técnicas de autenticación documental y análisis de firmas', 'Detección de alteraciones y evaluación de procesos de impresión'],
        achievements: ['Más de 15 años de experiencia en análisis forense documental', 'Perito Forense del Instituto Nacional de Ciencias Forenses (INACIF)', 'Práctica privada como perito asesor independiente', 'Referente en documentoscopia y peritaje gráfico'],
      },
    ];

    for (const m of team) {
      await db.query(
        'INSERT IGNORE INTO team (id, name, role, specialty, image, bio, linkedin, email, education, achievements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [m.id, m.name, m.role, m.specialty, m.image, m.bio, m.linkedin, m.email, JSON.stringify(m.education), JSON.stringify(m.achievements)]
      );
    }
    console.log(`✅ ${team.length} miembros del equipo insertados (o ya existían).`);

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
