# 🔐 **GOOGLE LOGIN - INSTRUCCIONES PARA BACKEND**

## **🚨 ENDPOINT FALTANTE**

El frontend está intentando hacer login con Google pero el backend necesita implementar el endpoint:

### **📍 Endpoint Requerido:**
```
POST /api/v1/auth/google
```

---

## **📥 DATOS QUE RECIBE EL BACKEND**

El frontend envía estos datos al endpoint:

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...", // JWT token de Google
  "email": "yoeldevsoft@gmail.com",
  "name": "yoel pinto", 
  "picture": "https://lh3.googleusercontent.com/a/...",
  "googleId": "116497489609000761516"
}
```

### **🔍 Detalles de los campos:**
- **`token`** - JWT token firmado por Google (necesario para verificación)
- **`email`** - Email del usuario de Google
- **`name`** - Nombre completo del usuario
- **`picture`** - URL de la foto de perfil
- **`googleId`** - ID único de Google del usuario

---

## **📤 RESPUESTA ESPERADA**

El frontend espera esta respuesta del backend:

### **✅ Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "access_token": "tu-jwt-token-del-backend",
    "token_type": "bearer",
    "user": {
      "id": "user-id-en-tu-db",
      "email": "yoeldevsoft@gmail.com",
      "name": "yoel pinto",
      "picture": "https://lh3.googleusercontent.com/a/..."
    }
  }
}
```

### **❌ Respuesta de Error:**
```json
{
  "success": false,
  "error": "Invalid Google token",
  "message": "Token verification failed"
}
```

---

## **🔧 IMPLEMENTACIÓN SUGERIDA**

### **1. Instalar dependencias:**
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### **2. Código del endpoint:**
```python
from fastapi import APIRouter, HTTPException, Depends
from google.auth.transport import requests
from google.oauth2 import id_token
import os

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# Tu Google Client ID
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com")

@router.post("/google")
async def google_login(google_data: dict):
    """
    Login con Google OAuth
    """
    try:
        # Extraer el token JWT de Google
        google_token = google_data.get("token")
        if not google_token:
            raise HTTPException(status_code=400, detail="Google token is required")
        
        # Verificar el token con Google
        try:
            # Verificar el token JWT con Google
            idinfo = id_token.verify_oauth2_token(
                google_token, 
                requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            
            # Verificar que el token es válido
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
                
        except ValueError as e:
            raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
        
        # Extraer información del usuario
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name', '')
        picture = idinfo.get('picture', '')
        
        # Buscar o crear usuario en tu base de datos
        user = await get_or_create_user_by_google_id(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture
        )
        
        # Generar JWT token de tu aplicación
        access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
        
        return {
            "success": True,
            "data": {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "picture": user.picture
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google login failed: {str(e)}")

async def get_or_create_user_by_google_id(google_id: str, email: str, name: str, picture: str):
    """
    Buscar usuario por Google ID o crear uno nuevo
    """
    # Buscar usuario existente por Google ID
    user = await User.filter(google_id=google_id).first()
    
    if user:
        # Actualizar información si es necesario
        user.name = name
        user.picture = picture
        await user.save()
        return user
    
    # Buscar por email si no existe por Google ID
    user = await User.filter(email=email).first()
    
    if user:
        # Vincular cuenta existente con Google
        user.google_id = google_id
        user.picture = picture
        await user.save()
        return user
    
    # Crear nuevo usuario
    user = await User.create(
        google_id=google_id,
        email=email,
        name=name,
        picture=picture,
        is_verified=True,  # Los usuarios de Google ya están verificados
        auth_provider="google"
    )
    
    return user
```

### **3. Variables de entorno:**
```bash
# .env
GOOGLE_CLIENT_ID=719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com
```

### **4. Modelo de usuario (si usas SQLAlchemy/Tortoise):**
```python
class User(Model):
    id = fields.UUIDField(pk=True, default=uuid.uuid4)
    email = fields.CharField(max_length=255, unique=True)
    name = fields.CharField(max_length=255)
    picture = fields.TextField(null=True)
    google_id = fields.CharField(max_length=255, null=True, unique=True)  # ⭐ Agregar este campo
    auth_provider = fields.CharField(max_length=50, default="email")      # ⭐ Agregar este campo
    is_verified = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
```

---

## **🧪 TESTING**

### **Probar el endpoint:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/google" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJSUzI1NiIs...",
    "email": "test@gmail.com",
    "name": "Test User",
    "picture": "https://lh3.googleusercontent.com/...",
    "googleId": "123456789"
  }'
```

### **Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "user": {
      "id": "uuid-here",
      "email": "test@gmail.com",
      "name": "Test User"
    }
  }
}
```

---

## **🔍 VERIFICACIÓN**

Una vez implementado el endpoint:

1. **Reiniciar el backend**
2. **Probar login con Google** en el frontend
3. **Verificar que no hay errores** `loginWithGoogle is not a function`
4. **Confirmar que el token** se guarda correctamente
5. **Verificar que el usuario** puede acceder al dashboard

---

## **📋 CHECKLIST**

- [ ] ✅ Endpoint `POST /api/v1/auth/google` implementado
- [ ] ✅ Verificación de token JWT de Google
- [ ] ✅ Creación/búsqueda de usuario en BD
- [ ] ✅ Generación de JWT token propio
- [ ] ✅ Respuesta en formato correcto
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Campo `google_id` en modelo User
- [ ] ✅ Testing del endpoint

**¡Una vez implementado esto, el login con Google funcionará perfectamente!** 🎉


