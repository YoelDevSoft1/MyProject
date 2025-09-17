# SMD VITAL - Blueprint Deployment Guide

## 🚀 Deployment con RENDER Blueprint

### Prerequisitos
- Cuenta en [Render.com](https://render.com)
- Repositorio en GitHub

### Pasos para deployment con Blueprint

#### 1. Conectar repositorio
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"Blueprint"**
3. Conecta tu repositorio de GitHub
4. Selecciona el archivo `render.yaml`

#### 2. Configuración automática
Blueprint detectará automáticamente:
- ✅ Backend (Python/FastAPI)
- ✅ Frontend (React)
- ✅ Base de datos (PostgreSQL)

#### 3. Variables de entorno
Blueprint configurará automáticamente:
- `DATABASE_URL` - Conexión a PostgreSQL
- `JWT_SECRET` - Generado automáticamente
- `CORS_ORIGINS` - Configurado para el frontend
- `REACT_APP_API_URL` - URL del backend

#### 4. URLs después del deployment
- **Frontend**: `https://smd-vital-frontend.onrender.com`
- **Backend**: `https://smd-vital-backend.onrender.com`
- **API Docs**: `https://smd-vital-backend.onrender.com/docs`

### Configuración manual adicional

#### Google OAuth (opcional)
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto y habilita Google OAuth
3. En RENDER Dashboard, ve a tu servicio frontend
4. Añade estas variables de entorno:
   - `REACT_APP_GOOGLE_CLIENT_ID`: Tu Google Client ID
   - `REACT_APP_GOOGLE_REDIRECT_URI`: `https://smd-vital-frontend.onrender.com/auth/callback`

#### Backend (opcional)
1. Ve a tu servicio backend en RENDER
2. Añade estas variables de entorno:
   - `GOOGLE_CLIENT_ID`: Tu Google Client ID
   - `GOOGLE_CLIENT_SECRET`: Tu Google Client Secret
   - `GOOGLE_REDIRECT_URI`: `https://smd-vital-backend.onrender.com/auth/google/callback`

### Verificación del deployment

#### Backend
- Visita: `https://smd-vital-backend.onrender.com/docs`
- Deberías ver la documentación de la API

#### Frontend
- Visita: `https://smd-vital-frontend.onrender.com`
- Deberías ver la aplicación React

#### Base de datos
- La base de datos se crea automáticamente
- Las tablas se crean con el primer inicio del backend

### Troubleshooting

#### Si el backend falla:
1. Verifica los logs en RENDER Dashboard
2. Asegúrate de que `requirements-simple.txt` esté en la raíz
3. Verifica que `main.py` esté en la raíz del backend

#### Si el frontend falla:
1. Verifica los logs en RENDER Dashboard
2. Asegúrate de que `package.json` esté en `horizon-ui-chakra-main/`
3. Verifica que el build genere la carpeta `build/`

### Notas importantes
- El plan gratuito tiene limitaciones de tiempo de inactividad
- Los servicios se "duermen" después de 15 minutos de inactividad
- El primer acceso después del sleep puede tardar unos segundos
- Para producción, considera actualizar a un plan pagado
