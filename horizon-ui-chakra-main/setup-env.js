#!/usr/bin/env node
/**
 * SMD VITAL - Script de Configuración de Entorno
 * ==============================================
 * 
 * Script para configurar automáticamente las variables de entorno
 * necesarias para Google OAuth.
 */

const fs = require('fs');
const path = require('path');

const envContent = `# SMD VITAL - Configuración de Entorno
# ====================================

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com

# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Environment
NODE_ENV=development

# Google OAuth Scopes
REACT_APP_GOOGLE_SCOPES=openid email profile

# Debug Mode
REACT_APP_DEBUG_GOOGLE=true
`;

const envPath = path.join(__dirname, '.env');

try {
  // Verificar si el archivo .env ya existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo .env ya existe');
    console.log('📝 Contenido actual:');
    console.log(fs.readFileSync(envPath, 'utf8'));
    console.log('\n¿Deseas sobrescribirlo? (y/N)');
    
    // En un entorno interactivo, podrías usar readline
    // Por ahora, creamos un backup
    const backupPath = path.join(__dirname, '.env.backup');
    fs.copyFileSync(envPath, backupPath);
    console.log(`📦 Backup creado en: ${backupPath}`);
  }

  // Crear/sobrescribir el archivo .env
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado exitosamente');
  console.log('📁 Ubicación:', envPath);
  
  console.log('\n🔧 Próximos pasos:');
  console.log('1. Configurar Google Cloud Console (ver GOOGLE_OAUTH_SETUP.md)');
  console.log('2. Reiniciar el servidor de desarrollo');
  console.log('3. Probar OAuth en http://localhost:3001/auth/sign-in');
  
} catch (error) {
  console.error('❌ Error al crear archivo .env:', error.message);
  process.exit(1);
}
