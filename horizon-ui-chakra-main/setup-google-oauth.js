#!/usr/bin/env node
/**
 * SMD VITAL - Configuración de Google OAuth
 * =========================================
 * 
 * Script para configurar automáticamente Google OAuth
 * y diagnosticar problemas de configuración.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const GOOGLE_CLIENT_ID = '719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com';

const envContent = `# SMD VITAL - Configuración de Entorno
# ====================================

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Environment
NODE_ENV=development

# Google OAuth Scopes
REACT_APP_GOOGLE_SCOPES=openid email profile

# Debug Mode
REACT_APP_DEBUG_GOOGLE=true
`;

const setupInstructions = `
# 🔧 Configuración de Google OAuth - SMD VITAL

## Pasos para Resolver el Error de Token:

### 1. Configurar Google Cloud Console
- Ve a: https://console.cloud.google.com/
- Busca el proyecto con Client ID: ${GOOGLE_CLIENT_ID}
- Ve a: APIs y servicios → Credenciales
- Edita el Client ID

### 2. Agregar Orígenes Autorizados
En "Orígenes autorizados de JavaScript", agrega:
- http://localhost:3001
- http://localhost:3000
- http://127.0.0.1:3001
- http://127.0.0.1:3000

### 3. Agregar URIs de Redirección
En "URIs de redirección autorizados", agrega:
- http://localhost:3001/
- http://localhost:3000/
- http://127.0.0.1:3001/
- http://127.0.0.1:3000/

### 4. Verificar Configuración
- Guarda los cambios en Google Cloud Console
- Espera 5-10 minutos para la propagación
- Reinicia el servidor de desarrollo

### 5. Probar OAuth
- Ve a: http://localhost:3001/auth/sign-in
- Haz clic en "Continuar con Google"
- Debería funcionar sin errores de token

## Diagnóstico de Problemas:

### Si persiste el error "Error retrieving a token":
1. Verifica que el Client ID esté correcto
2. Confirma que el dominio esté en orígenes autorizados
3. Revisa la consola del navegador para errores específicos
4. Usa el componente GoogleOAuthDiagnostic para diagnóstico detallado

### Errores Comunes:
- "The given origin is not allowed": Dominio no configurado
- "Error retrieving a token": Client ID incorrecto o CORS
- "Invalid client": Client ID no existe o está deshabilitado
`;

async function main() {
  console.log('🏥 SMD VITAL - Configuración de Google OAuth');
  console.log('=' .repeat(50));
  
  try {
    const envPath = path.join(__dirname, '.env');
    
    // Verificar si .env ya existe
    if (fs.existsSync(envPath)) {
      console.log('⚠️  El archivo .env ya existe');
      const overwrite = await question('¿Deseas sobrescribirlo? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Operación cancelada');
        process.exit(0);
      }
      
      // Crear backup
      const backupPath = path.join(__dirname, '.env.backup');
      fs.copyFileSync(envPath, backupPath);
      console.log(`📦 Backup creado en: ${backupPath}`);
    }

    // Crear archivo .env
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado exitosamente');
    console.log('📁 Ubicación:', envPath);
    
    // Crear archivo de instrucciones
    const instructionsPath = path.join(__dirname, 'GOOGLE_OAUTH_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, setupInstructions);
    console.log('📋 Instrucciones guardadas en:', instructionsPath);
    
    console.log('\n🔧 Próximos pasos:');
    console.log('1. Configurar Google Cloud Console (ver GOOGLE_OAUTH_INSTRUCTIONS.md)');
    console.log('2. Reiniciar el servidor: npm start');
    console.log('3. Probar OAuth en http://localhost:3001/auth/sign-in');
    console.log('4. Usar GoogleOAuthDiagnostic para diagnóstico detallado');
    
    console.log('\n📊 Información de configuración:');
    console.log(`Client ID: ${GOOGLE_CLIENT_ID}`);
    console.log(`API URL: http://localhost:8000`);
    console.log(`Frontend URL: http://localhost:3001`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { GOOGLE_CLIENT_ID, envContent, setupInstructions };
