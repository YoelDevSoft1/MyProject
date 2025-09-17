// Script para actualizar variables de entorno en el build
const fs = require('fs');
const path = require('path');

const buildPath = path.join(__dirname, 'horizon-ui-chakra-main', 'build');
const indexPath = path.join(buildPath, 'index.html');

if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Reemplazar variables de entorno para producción
    content = content.replace(
        /REACT_APP_API_URL/g, 
        'https://smd-vital-backend.onrender.com'
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ Variables de entorno actualizadas en el build');
} else {
    console.log('❌ No se encontró index.html en el build');
}
