const http = require('http');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ── CONFIGURACIÓN DEL SERVIDOR MOCK ──────────────────────────────────────────
const PORT = 4000;
let mockServer;

let mockUsers = [
  {
    usuario_id: 1,
    nombre: 'Administrador Test',
    correo: 'admin@gmail.com',
    nombre_rol: 'Administrador',
    rol_id: 1,
    cliente_id: null,
    veterinario_id: null,
    fecha_registro: new Date().toISOString()
  }
];

let mockClientes = [
  {
    cliente_id: 1,
    nombre: 'Juan Pérez',
    correo: 'juan@gmail.com',
    telefono: '3001234567',
    direccion: 'Calle 123',
    fecha_nacimiento: '1990-01-01T00:00:00.000Z',
    documento_id: '123456',
    total_animales: '1'
  }
];

let mockAnimales = [
  {
    animal_id: 1,
    nombre: 'Max',
    cliente_id: 1,
    cliente_nombre: 'Juan Pérez',
    raza_id: 1,
    nombre_raza: 'Labrador',
    nombre_especie: 'Perro',
    especie_id: 1,
    edad: 3,
    fecha_nacimiento: '2023-01-01',
    peso: 15.5,
    sexo: 'Macho',
    descripcion: 'Juguetón',
    numero_chip: 'CHIP123',
    estado: 'Activo',
    created_at: '2023-01-01'
  }
];

const mockEspecies = [
  { especie_id: 1, nombre_especie: 'Perro', nombre: 'Perro' }
];

const mockRazas = [
  { raza_id: 1, nombre_raza: 'Labrador', nombre: 'Labrador', especie_id: 1 }
];

const staticMockData = {
  '/api/modulos/mis-modulos': {
    success: true,
    data: [
      { nombre: 'Dashboard', ruta: '/dashboard' },
      { nombre: 'Clientes', ruta: '/clientes' },
      { nombre: 'Mascotas', ruta: '/animales' },
      { nombre: 'Citas', ruta: '/citas' },
      { nombre: 'Veterinarios', ruta: '/veterinarios' },
      { nombre: 'Historial Clínico', ruta: '/historial-medico' },
      { nombre: 'Vacunación', ruta: '/historial-vacunacion' },
      { nombre: 'Campañas', ruta: '/campanas' },
      { nombre: 'Donaciones', ruta: '/donaciones' },
      { nombre: 'Adopciones', ruta: '/solicitudes-adopcion' },
      { nombre: 'Reportes', ruta: '/reportes' }
    ]
  },
  '/api/catalogos/roles': {
    success: true,
    data: [
      { rol_id: 1, nombre_rol: 'Administrador' }
    ]
  },
  '/api/catalogos/estado-citas': {
    success: true,
    data: [
      { estado_id: 1, nombre: 'Pendiente' },
      { estado_id: 2, nombre: 'Completada' },
      { estado_id: 3, nombre: 'Cancelada' }
    ]
  },
  '/api/catalogos/tipo-consulta': {
    success: true,
    data: [
      { tipo_consulta_id: 1, nombre: 'Consulta General' }
    ]
  },
  '/api/solicitudes-adopcion': {
    success: true,
    data: [
      {
        solicitud_id: 1,
        animal_id: 1,
        animal_nombre: 'Max',
        animal_edad: 3,
        nombre_raza: 'Labrador',
        nombre_especie: 'Perro',
        nombre_solicitante: 'María López',
        correo_solicitante: 'maria@gmail.com',
        telefono_solicitante: '3009876543',
        direccion_solicitante: 'Calle 456',
        experiencia_animales: 'Sí',
        motivo: 'Compañía',
        fecha_solicitud: '2026-06-26',
        fecha_respuesta: null,
        observacion_respuesta: null,
        respondido_por_nombre: null,
        estado_id: 1,
        estado_nombre: 'Pendiente'
      }
    ]
  },
  '/api/animales/adopcion': {
    success: true,
    data: [
      {
        animal_id: 1,
        nombre: 'Max',
        edad: 3,
        nombre_raza: 'Labrador',
        nombre_especie: 'Perro',
        estado: 'En adopcion'
      }
    ]
  },
  '/api/catalogos/estados-adopcion': {
    success: true,
    data: [
      { estado_id: 1, nombre: 'Pendiente' }
    ]
  },
  '/api/historial-medico': {
    success: true,
    data: [
      {
        historial_id: 1,
        animal_id: 1,
        animal_nombre: 'Max',
        nombre_raza: 'Labrador',
        diagnostico: 'Sano',
        tratamiento: 'Ninguno',
        veterinario_id: 1,
        veterinario_nombre: 'Dr. Carlos Gómez',
        especialidad: 'Cirugía',
        tipo_consulta_id: 1,
        tipo_consulta_nombre: 'Consulta General',
        fecha_consulta: '2026-06-26',
        sintomas: 'Ninguno',
        observaciones: 'Buen estado general',
        examenes_realizados: 'Ninguno',
        medicamentos: 'Ninguno',
        proxima_cita: '2026-12-26',
        peso: '15.5',
        temperatura: '38.5',
        frecuencia_cardiaca: '80',
        frecuencia_respiratoria: '20'
      }
    ]
  },
  '/api/campanas': {
    success: true,
    data: [
      {
        campana_id: 1,
        nombre: 'Campaña Esterilización 2026',
        descripcion: 'Ayuda a esterilizar mascotas de la calle',
        meta_monto: 5000000,
        recaudado: 1500000,
        fecha_inicio: '2026-06-01',
        fecha_fin: '2026-12-31'
      }
    ]
  },
  '/api/donaciones': {
    success: true,
    data: [
      {
        donacion_id: 1,
        anonimo: false,
        nombre_donante: 'Donante Generoso',
        correo_donante: 'donante@gmail.com',
        telefono_donante: '3004445555',
        monto: '100000',
        fecha_donacion: '2026-06-26T12:00:00.000Z',
        metodo_pago: 'PSE',
        numero_transaccion: 'TX12345',
        observaciones: 'Donación mensual',
        campana_id: 1,
        campanas: { nombre: 'Campaña Esterilización 2026' }
      }
    ]
  },
  '/api/historial-vacunacion': {
    success: true,
    data: [
      {
        historial_vacunacion_id: 1,
        animal_id: 1,
        animal_nombre: 'Max',
        vacuna_id: 1,
        nombre_vacuna: 'Rabia',
        veterinario_id: 1,
        veterinario_nombre: 'Dr. Carlos Gómez',
        fecha_vacunacion: '2026-06-26',
        lote_vacuna: 'LOTE999',
        proxima_vacuna: '2027-06-26',
        observaciones: 'Ninguna'
      }
    ]
  },
  '/api/vacunas': {
    success: true,
    data: [
      { vacuna_id: 1, nombre_vacuna: 'Rabia', nombre: 'Rabia', especie_id: 1 }
    ]
  },
  '/api/notificaciones': {
    success: true,
    data: [
      {
        notificacion_id: 1,
        mensaje: 'Nueva cita programada para Max',
        fecha_creacion: '2026-06-26T12:00:00.000Z',
        es_leida: false
      }
    ]
  }
};

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve(null);
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        resolve(null);
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function getQueryParameter(req, name) {
  const url = new URL(req.url, 'http://localhost');
  return url.searchParams.get(name);
}

function startMockServer() {
  return new Promise((resolve) => {
    mockServer = http.createServer(async (req, res) => {
      // Configurar cabeceras CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      console.log(`[API Mock] ${req.method} ${req.url}`);
      const parsedUrl = req.url.split('?')[0];
      const body = await parseJsonBody(req);

      if (req.method === 'POST' && parsedUrl === '/api/auth/login') {
        const correo = body?.correo || '';
        const contrasena = body?.contrasena || '';
        const validAdmin = correo === 'admin@gmail.com' && contrasena === 'admin';
        if (!validAdmin) {
          return sendJson(res, 401, { success: false, error: 'Credenciales inválidas' });
        }

        return sendJson(res, 200, {
          success: true,
          data: {
            token: 'mock-jwt-token-12345',
            user: mockUsers[0]
          }
        });
      }

      if (req.method === 'GET' && parsedUrl === '/api/usuarios') {
        return sendJson(res, 200, { success: true, data: mockUsers });
      }

      if (req.method === 'DELETE' && parsedUrl.startsWith('/api/usuarios/')) {
        const id = Number(parsedUrl.split('/').pop());
        mockUsers = mockUsers.filter((u) => u.usuario_id !== id);
        return sendJson(res, 200, { success: true, data: null });
      }

      if (req.method === 'GET' && parsedUrl === '/api/clientes') {
        return sendJson(res, 200, { success: true, data: mockClientes });
      }

      if (req.method === 'GET' && parsedUrl === '/api/animales') {
        return sendJson(res, 200, { success: true, data: mockAnimales });
      }

      if (req.method === 'POST' && parsedUrl === '/api/animales') {
        const newAnimal = {
          animal_id: mockAnimales.length ? Math.max(...mockAnimales.map((a) => a.animal_id)) + 1 : 2,
          nombre: body?.nombre || 'Animal E2E',
          cliente_id: Number(body?.cliente_id) || 1,
          cliente_nombre: mockClientes.find((c) => c.cliente_id === Number(body?.cliente_id))?.nombre || 'Juan Pérez',
          raza_id: Number(body?.raza_id) || 1,
          nombre_raza: mockRazas.find((r) => r.raza_id === Number(body?.raza_id))?.nombre_raza || 'Labrador',
          nombre_especie: mockEspecies.find((e) => e.especie_id === Number(body?.especie_id))?.nombre_especie || 'Perro',
          especie_id: Number(body?.especie_id) || 1,
          edad: Number(body?.edad) || 1,
          fecha_nacimiento: body?.fecha_nacimiento || '2024-01-01',
          peso: Number(body?.peso) || 1.0,
          sexo: body?.sexo || 'Macho',
          descripcion: body?.descripcion || 'Mascota creada por prueba E2E',
          numero_chip: body?.numero_chip || 'E2E-CHIP-001',
          estado: body?.estado || 'Activo',
          created_at: new Date().toISOString()
        };
        mockAnimales.push(newAnimal);
        return sendJson(res, 201, { success: true, data: newAnimal });
      }

      if (req.method === 'DELETE' && parsedUrl.startsWith('/api/animales/')) {
        const id = Number(parsedUrl.split('/').pop());
        mockAnimales = mockAnimales.filter((a) => a.animal_id !== id);
        return sendJson(res, 200, { success: true, data: null });
      }

      if (req.method === 'GET' && parsedUrl === '/api/especies') {
        return sendJson(res, 200, { success: true, data: mockEspecies });
      }

      if (req.method === 'GET' && parsedUrl.startsWith('/api/razas')) {
        const especieId = Number(getQueryParameter(req, 'especie_id')) || null;
        const filteredRazas = especieId
          ? mockRazas.filter((r) => r.especie_id === especieId)
          : mockRazas;
        return sendJson(res, 200, { success: true, data: filteredRazas });
      }

      if (req.method === 'GET' && parsedUrl === '/api/notificaciones/contador') {
        return sendJson(res, 200, { success: true, data: { count: 1 } });
      }

      if (staticMockData[parsedUrl]) {
        return sendJson(res, 200, staticMockData[parsedUrl]);
      }

      console.warn(`[API Mock] Ruta no manejada: ${req.url}`);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Not Found' }));
    });

    mockServer.listen(PORT, () => {
      console.log(`✅ Servidor API Mock escuchando en http://localhost:${PORT}`);
      resolve();
    });
  });
}

const net = require('net');

function checkFrontendReady(port = 3000, host = 'localhost') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(2000);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

// ── EJECUCIÓN DE PRUEBAS CON SELENIUM ────────────────────────────────────────
async function runTests() {
  const isFrontendReady = await checkFrontendReady(3000);
  if (!isFrontendReady) {
    console.error('\n❌ ERROR: La aplicación frontend no está activa en http://localhost:3000.');
    console.error('👉 Asegúrate de ejecutar "npm start" en otra terminal antes de correr las pruebas E2E.\n');
    process.exit(1);
  }

  await startMockServer();

  let driver;
  try {
    console.log('🚀 Iniciando Selenium WebDriver (Chrome en modo headless)...');
    
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    const logging = require('selenium-webdriver/lib/logging');
    const prefs = new logging.Preferences();
    prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setLoggingPrefs(prefs)
      .build();

    // Establecer tamaño de ventana de escritorio para evitar que se oculten botones por diseño responsivo
    await driver.manage().window().setRect({ width: 1280, height: 1024 });

    console.log('🌍 Cargando la aplicación en http://localhost:3000...');
    await driver.get('http://localhost:3000');

    // Sobrescribir alert/confirm de JS en el navegador para evitar bloqueos
    await driver.executeScript(`
      window.alert = function(msg) { console.log("Alert interceptada: " + msg); };
      window.confirm = function(msg) { console.log("Confirm interceptada: " + msg); return true; };
    `);

    // Esperar a que cargue la landing page
    await driver.wait(until.elementLocated(By.className('logo')), 10000);
    console.log('✅ Landing page cargada correctamente.');

    // ── VISTA 1: HOME ────────────────────────────────────────────────────────
    console.log('🔍 Probando Vista: Home');
    let welcomeText = await driver.findElement(By.className('logo')).getText();
    if (!welcomeText.includes('Vetasoft')) {
      throw new Error('El logo no contiene "Vetasoft"');
    }
    console.log('✅ Vista Home verificada con éxito.');

    // Ir al Login
    console.log('👉 Navegando al Login...');
    const loginBtn = await driver.findElement(By.xpath("//button[contains(., 'Ingresar')]"));
    await loginBtn.click();

    // ── VISTA 2: AUTH / LOGIN ────────────────────────────────────────────────
    console.log('🔍 Probando Vista: Auth (Login)');
    // Esperar a que carguen los campos
    const emailInput = await driver.wait(until.elementLocated(By.id('email')), 5000);
    const passwordInput = await driver.findElement(By.id('password'));
    const submitBtn = await driver.findElement(By.xpath("//main//button[contains(., 'Ingresar') or contains(., 'Procesando')]"));

    // Rellenar formulario
    await emailInput.sendKeys('admin@gmail.com');
    await passwordInput.sendKeys('admin');
    console.log('✍️ Credenciales escritas.');

    // Click submit
    await submitBtn.click();
    console.log('👉 Enviando login...');

    // Esperar a que el navbar de logueado esté presente (lo cual indica login exitoso)
    await driver.wait(until.elementLocated(By.className('nav-buttons')), 10000);
    console.log('🔓 Sesión iniciada con éxito. Redirigido a Dashboard.');

    // ── VISTA: Mascotas ──────────────────────────────────────────────────────
    console.log('👉 Navegando a Mascotas...');
    const mascotasBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Mascotas')]")), 10000);
    await driver.executeScript('arguments[0].scrollIntoView(true);', mascotasBtn);
    await mascotasBtn.click();

    await driver.wait(until.elementLocated(By.xpath("//h2[contains(., 'Mascotas') or contains(., 'Gestión de Mascotas') or contains(., 'Mis Mascotas')]")), 10000);
    console.log('✅ Sección Mascotas abierta.');

    console.log('➕ Abriendo formulario para registrar una nueva mascota...');
    const registrarMascotaBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Registrar Mascota') or contains(., 'Registrar Nueva Mascota') or contains(., '➕ Registrar Mascota')]")), 10000);
    await registrarMascotaBtn.click();

    await driver.wait(until.elementLocated(By.css('.modal-title')), 10000);
    console.log('✅ Modal de registro de mascota abierto.');

    const nombreMascota = await driver.findElement(By.name('nombre'));
    const clienteSelect = await driver.findElement(By.name('clienteId'));
    const especieSelect = await driver.findElement(By.name('especieId'));
    const razaSelect = await driver.findElement(By.name('razaId'));
    const edadInput = await driver.findElement(By.name('edad'));
    const pesoInput = await driver.findElement(By.name('peso'));
    const sexoSelect = await driver.findElement(By.name('sexo'));
    const estadoSelect = await driver.findElement(By.name('estado'));
    const descripcionTextarea = await driver.findElement(By.name('descripcion'));
    const numeroChipInput = await driver.findElement(By.name('numeroChip'));

    await nombreMascota.sendKeys('E2E Test Animal');
    await clienteSelect.click();
    const clienteOption = await driver.findElement(By.xpath("//select[@name='clienteId']/option[contains(., 'Juan Pérez') or contains(., 'juan@gmail.com')][1]"));
    await clienteOption.click();

    await especieSelect.click();
    const especieOption = await driver.findElement(By.xpath("//select[@name='especieId']/option[contains(., 'Perro')][1]"));
    await especieOption.click();

    await driver.wait(until.elementLocated(By.xpath("//select[@name='razaId']/option[contains(., 'Labrador')][1]")), 5000);
    await razaSelect.click();
    const razaOption = await driver.findElement(By.xpath("//select[@name='razaId']/option[contains(., 'Labrador')][1]"));
    await razaOption.click();

    await edadInput.clear();
    await edadInput.sendKeys('2');
    await pesoInput.clear();
    await pesoInput.sendKeys('12.5');
    await sexoSelect.click();
    const sexoOption = await driver.findElement(By.xpath("//select[@name='sexo']/option[contains(., 'Macho')][1]"));
    await sexoOption.click();
    await estadoSelect.click();
    const estadoOption = await driver.findElement(By.xpath("//select[@name='estado']/option[contains(., 'Activo')][1]"));
    await estadoOption.click();
    await numeroChipInput.sendKeys('E2E-CHIP-001');
    await descripcionTextarea.sendKeys('Mascota creada por prueba de Selenium E2E');

    const submitMascotaBtn = await driver.findElement(By.xpath("//div[contains(@class, 'modal-content')]//button[@type='submit' and (contains(., 'Registrar') or contains(., '✅ Registrar') or contains(., 'Guardar'))]"));
    await submitMascotaBtn.click();
    console.log('✅ Formulario de mascota enviado.');

    await driver.wait(until.elementLocated(By.xpath("//table//td[contains(., 'E2E Test Animal')]")), 10000);
    console.log('✅ Mascota creada y visible en la tabla.');

    // ── VISTA: Dashboard y eliminación de usuario ───────────────────────────
    console.log('👉 Navegando a Dashboard...');
    const dashboardBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Dashboard')]")), 10000);
    await dashboardBtn.click();

    await driver.wait(until.elementLocated(By.xpath("//h2[contains(., 'Dashboard Administrativo')]")), 10000);
    console.log('✅ Dashboard abierto.');

    const usuarioEliminarBtn = await driver.wait(until.elementLocated(By.xpath("//tr[td[contains(., 'admin@gmail.com')]]//button[contains(., 'Eliminar') or contains(., '🗑️')]")), 10000);
    await usuarioEliminarBtn.click();
    console.log('🗑️ Botón eliminar usuario clickeado.');

    await driver.wait(async () => {
      const rows = await driver.findElements(By.xpath("//tr[td[contains(., 'admin@gmail.com')]]"));
      return rows.length === 0;
    }, 10000);
    console.log('✅ Usuario admin@gmail.com eliminado de la tabla.');

    console.log('\n🎉 Flujo E2E completado: login, creación de mascota y eliminación de usuario. 🎉');

  } catch (error) {
    console.error('❌ Error durante la ejecución de las pruebas E2E:', error);
    if (driver) {
      try {
        console.log('\n--- BROWSER CONSOLE LOGS ---');
        const logs = await driver.manage().logs().get('browser');
        for (const entry of logs) {
          console.log(`[Browser ${entry.level.name}] ${entry.message}`);
        }
        console.log('----------------------------\n');
      } catch (err) {
        console.error('No se pudieron obtener los logs del navegador:', err);
      }
    }
    process.exitCode = 1;
  } finally {
    if (driver) {
      console.log('🔌 Cerrando navegador...');
      await driver.quit();
    }
    if (mockServer) {
      console.log('🔌 Deteniendo servidor API Mock...');
      mockServer.close();
    }
    console.log('🏁 Proceso finalizado.');
  }
}

runTests();
