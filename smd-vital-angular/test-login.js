#!/usr/bin/env node

/**
 * Script de prueba para verificar la integración del login
 * Ejecutar con: node test-login.js
 */

const https = require('https');
const http = require('http');

// Configuración
const BACKEND_URL = 'http://localhost:8000';
const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  me: '/api/auth/me',
  health: '/api/health'
};

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testBackendHealth() {
  log('\n🔍 Verificando salud del backend...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}${AUTH_ENDPOINTS.health}`);
    
    if (response.status === 200) {
      log('✅ Backend está funcionando correctamente', 'green');
      return true;
    } else {
      log(`❌ Backend respondió con status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error conectando al backend: ${error.message}`, 'red');
    log('💡 Asegúrate de que el backend esté ejecutándose en http://localhost:8000', 'yellow');
    return false;
  }
}

async function testLoginEndpoint() {
  log('\n🔐 Probando endpoint de login...', 'blue');
  
  const testCredentials = {
    email: 'test@example.com',
    password: 'testpassword123'
  };

  try {
    const response = await makeRequest(`${BACKEND_URL}${AUTH_ENDPOINTS.login}`, {
      method: 'POST',
      body: testCredentials
    });

    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.status === 200) {
      log('✅ Endpoint de login está funcionando', 'green');
      log(`📊 Respuesta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
    } else if (response.status === 401) {
      log('⚠️  Login falló (esperado con credenciales de prueba)', 'yellow');
      log('✅ Endpoint está funcionando correctamente', 'green');
    } else {
      log(`❌ Error inesperado: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }
  } catch (error) {
    log(`❌ Error probando login: ${error.message}`, 'red');
  }
}

async function testRegisterEndpoint() {
  log('\n📝 Probando endpoint de registro...', 'blue');
  
  const testUser = {
    email: 'testuser@example.com',
    password: 'testpassword123',
    first_name: 'Test',
    last_name: 'User',
    role: 'patient'
  };

  try {
    const response = await makeRequest(`${BACKEND_URL}${AUTH_ENDPOINTS.register}`, {
      method: 'POST',
      body: testUser
    });

    log(`Status: ${response.status}`, response.status === 201 ? 'green' : 'yellow');
    
    if (response.status === 201) {
      log('✅ Usuario registrado exitosamente', 'green');
      log(`📊 Respuesta: ${JSON.stringify(response.data, null, 2)}`, 'blue');
    } else if (response.status === 409) {
      log('⚠️  Usuario ya existe (esperado)', 'yellow');
      log('✅ Endpoint está funcionando correctamente', 'green');
    } else {
      log(`❌ Error inesperado: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }
  } catch (error) {
    log(`❌ Error probando registro: ${error.message}`, 'red');
  }
}

async function testAngularProxy() {
  log('\n🌐 Probando proxy de Angular...', 'blue');
  
  try {
    const response = await makeRequest('http://localhost:3001/api/health');
    
    if (response.status === 200) {
      log('✅ Proxy de Angular está funcionando correctamente', 'green');
      return true;
    } else {
      log(`❌ Proxy respondió con status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error conectando al proxy de Angular: ${error.message}`, 'red');
    log('💡 Asegúrate de que Angular esté ejecutándose en http://localhost:3001', 'yellow');
    return false;
  }
}

async function main() {
  log('🚀 Iniciando pruebas de integración del login SMD VITAL', 'bold');
  log('=' .repeat(60), 'blue');

  // Verificar backend
  const backendHealthy = await testBackendHealth();
  
  if (backendHealthy) {
    await testLoginEndpoint();
    await testRegisterEndpoint();
  }

  // Verificar proxy de Angular
  await testAngularProxy();

  log('\n' + '=' .repeat(60), 'blue');
  log('✨ Pruebas completadas', 'bold');
  
  log('\n📋 Resumen de configuración:', 'blue');
  log(`• Backend URL: ${BACKEND_URL}`, 'blue');
  log(`• Angular URL: http://localhost:3001`, 'blue');
  log(`• Proxy configurado: /api → ${BACKEND_URL}`, 'blue');
  
  log('\n🔧 Para probar manualmente:', 'yellow');
  log('1. Ejecuta el backend: cd smd-vital-backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000', 'yellow');
  log('2. Ejecuta Angular: cd smd-vital-angular && ng serve', 'yellow');
  log('3. Visita: http://localhost:3001/login', 'yellow');
}

// Ejecutar las pruebas
main().catch(console.error);
