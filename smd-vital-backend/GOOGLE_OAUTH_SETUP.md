# Configuración de Google OAuth para SMD VITAL

## Pasos para configurar Google OAuth

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra tu proyecto: "SMD VITAL"

### 2. Habilitar Google+ API

1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google+ API" y habilítala
3. También habilita "Google Identity" si está disponible

### 3. Crear credenciales OAuth 2.0

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente de OAuth"
3. Selecciona "Aplicación web"
4. Configura los siguientes campos:

**Nombre del cliente:**
```
SMD VITAL
```

**Orígenes autorizados de JavaScript:**
```
http://localhost:3001
```

**URIs de redireccionamiento autorizados:**
```
http://localhost:3001/
```

### 4. Configurar variables de entorno

1. Copia el Client ID que te proporciona Google
2. Abre el archivo `.env.local` en la raíz del proyecto frontend
3. Reemplaza `tu_client_id_aqui` con tu Client ID real:

```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:8000
```

### 5. Actualizar la base de datos

Ejecuta el script SQL para agregar las columnas de Google OAuth:

```bash
# Conectarse a la base de datos PostgreSQL
psql -h localhost -U smdvital -d smdvital_users

# Ejecutar el script
\i update_users_table_google.sql
```

### 6. Reiniciar los servicios

```bash
# Reiniciar el backend
cd smd-vital-backend
docker-compose restart auth-service

# Reiniciar el frontend
cd horizon-ui-chakra-main
npm start
```

### 7. Probar la autenticación

1. Ve a `http://localhost:3001/auth/sign-in`
2. Haz clic en "Continuar con Google"
3. Completa el proceso de autenticación con Google
4. Deberías ser redirigido al dashboard

## Estructura de datos de Google OAuth

El sistema maneja los siguientes datos de Google:

- `googleId`: ID único del usuario en Google
- `email`: Email del usuario
- `name`: Nombre completo
- `given_name`: Nombre de pila
- `family_name`: Apellido
- `picture`: URL de la foto de perfil
- `email_verified`: Si el email está verificado

## Notas importantes

- El Client ID debe mantenerse seguro y no debe ser expuesto en el código
- Los dominios autorizados deben coincidir exactamente con tu aplicación
- La configuración puede tardar hasta 5 minutos en aplicarse
- Para producción, necesitarás configurar dominios adicionales

## Solución de problemas

### Error: "This app isn't verified"
- Es normal en desarrollo
- Haz clic en "Advanced" > "Go to SMD VITAL (unsafe)"

### Error: "redirect_uri_mismatch"
- Verifica que la URI de redirección coincida exactamente
- Incluye la barra final en `http://localhost:3001/`

### Error: "invalid_client"
- Verifica que el Client ID sea correcto
- Asegúrate de que el proyecto esté habilitado

