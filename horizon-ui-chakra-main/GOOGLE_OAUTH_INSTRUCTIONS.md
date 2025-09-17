
# 🔧 Configuración de Google OAuth - SMD VITAL

## Pasos para Resolver el Error de Token:

### 1. Configurar Google Cloud Console
- Ve a: https://console.cloud.google.com/
- Busca el proyecto con Client ID: 719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com
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
