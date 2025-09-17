# 🔧 Configuración de Google OAuth - SMD VITAL

## ❌ Problema Actual
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
GET https://accounts.google.com/gsi/status 403 (Forbidden)
```

## ✅ Solución Paso a Paso

### 1. Acceder a Google Cloud Console
- **URL**: https://console.cloud.google.com/
- **Proyecto**: Buscar el proyecto que contiene el Client ID `719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com`

### 2. Navegar a Credenciales OAuth
- **Menú**: APIs y servicios → Credenciales
- **Buscar**: Client ID `719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com`
- **Acción**: Hacer clic en el ícono de editar (✏️)

### 3. Configurar Orígenes Autorizados
En la sección **"Orígenes autorizados de JavaScript"**, agregar EXACTAMENTE:

```
http://localhost:3001
http://localhost:3000
http://127.0.0.1:3001
http://127.0.0.1:3000
https://smdvitalbogota.com
https://app.smdvitalbogota.com
```

### 4. Configurar URIs de Redirección
En la sección **"URIs de redirección autorizados"**, agregar EXACTAMENTE:

```
http://localhost:3001/
http://localhost:3000/
http://127.0.0.1:3001/
http://127.0.0.1:3000/
https://smdvitalbogota.com/
https://app.smdvitalbogota.com/
```

### 5. Configuración Adicional
- **Tipo de aplicación**: Aplicación web
- **Restricciones de aplicación**: Ninguna (o Lista de hosts)
- **Habilitar FedCM**: ✅ (Recomendado)

### 6. Guardar y Esperar
- **Guardar**: Hacer clic en "Guardar" 💾
- **Tiempo de propagación**: 5-10 minutos
- **Verificar**: Probar en http://localhost:3001

## 🧪 Verificación de la Configuración

### 1. Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```env
REACT_APP_GOOGLE_CLIENT_ID=719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DEBUG_GOOGLE=true
```

### 2. Reiniciar el Servidor
```bash
# Detener el servidor actual
Ctrl + C

# Limpiar caché
npm run build

# Reiniciar
npm start
```

### 3. Probar OAuth
- **URL**: http://localhost:3001/auth/sign-in
- **Acción**: Hacer clic en "Continuar con Google"
- **Resultado esperado**: Popup de Google sin error 403

## 🔍 Diagnóstico de Problemas

### Si persiste el error 403:
1. **Verificar dominios**: Asegurar que no haya espacios extra
2. **Verificar formato**: URLs sin `/` en orígenes, con `/` en redirección
3. **Esperar propagación**: Los cambios pueden tardar hasta 10 minutos
4. **Limpiar caché**: Borrar caché del navegador

### Si aparece advertencia FedCM:
- **Normal**: Es solo una advertencia de migración futura
- **Solución**: El componente ya está preparado para FedCM
- **Acción**: No requiere intervención inmediata

### Verificar en Consola del Navegador:
```javascript
// Debería mostrar:
Environment check: {
  NODE_ENV: 'development',
  REACT_APP_GOOGLE_CLIENT_ID: '719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com',
  currentOrigin: 'http://localhost:3001',
  isOriginValid: true,
  fedcmSupported: true/false
}
```

## 📋 Checklist de Verificación

- [ ] Google Cloud Console configurado
- [ ] Orígenes autorizados agregados
- [ ] URIs de redirección agregados
- [ ] Archivo `.env` creado
- [ ] Servidor reiniciado
- [ ] Caché limpiado
- [ ] OAuth probado exitosamente
- [ ] Sin errores 403 en consola
- [ ] Popup de Google funciona correctamente

## 🚀 Configuración de Producción

Para producción, agregar también:
- Dominio de producción en orígenes autorizados
- URI de producción en redirección
- Configurar variables de entorno de producción
- Habilitar HTTPS obligatorio
