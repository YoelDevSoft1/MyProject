# SMD VITAL - Deployment Guide

## 🚀 Deployment en RENDER

### Prerequisitos
- Cuenta en [Render.com](https://render.com)
- Repositorio en GitHub

### Pasos para deployment

#### 1. Backend (API)
1. Conecta tu repositorio de GitHub a Render
2. Crea un nuevo **Web Service**
3. Configuración:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn services.auth.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11

#### 2. Base de datos
1. Crea una **PostgreSQL Database**
2. Plan: Free
3. Copia la URL de conexión

#### 3. Frontend
1. Crea un nuevo **Static Site**
2. Configuración:
   - **Build Command**: `cd horizon-ui-chakra-main && npm install && npm run build`
   - **Publish Directory**: `horizon-ui-chakra-main/build`

### Variables de entorno

#### Backend
```
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://tu-frontend.onrender.com
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
JWT_SECRET_KEY=tu_jwt_secret
```

#### Frontend
```
REACT_APP_API_URL=https://tu-backend.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id
```

### URLs después del deployment
- **Frontend**: `https://smd-vital-frontend.onrender.com`
- **Backend**: `https://smd-vital-backend.onrender.com`
- **API Docs**: `https://smd-vital-backend.onrender.com/docs`

### Notas importantes
- El plan gratuito tiene limitaciones de tiempo de inactividad
- Las variables de entorno deben configurarse en Render Dashboard
- La base de datos se crea automáticamente con el primer deployment
