# SMD VITAL - Guía de Integración Frontend-Backend

## Resumen de Cambios Implementados

### 1. Servicios de Usuario Mejorados

#### userService.js
- Servicio especializado para gestión de usuarios y perfiles
- Métodos para obtener, actualizar y gestionar perfiles de usuario
- Transformación de datos para consistencia entre frontend y backend
- Validación de datos antes de enviar al backend

#### apiService.js (Actualizado)
- Endpoints corregidos para usar `/api/users/` en lugar de `/users/`
- Mejor manejo de tokens de autenticación
- Interceptores para manejo de errores y reintentos

### 2. Contexto de Autenticación Mejorado

#### AuthContext.js (Actualizado)
- Integración con el nuevo userService
- Manejo correcto de tokens de autenticación
- Obtención automática de datos de usuario después del login
- Sincronización de estado entre componentes

### 3. Componentes de Usuario Nuevos

#### UserProfileCard.js
- Componente para mostrar información completa del perfil
- Integración con datos del backend
- Diseño responsive y accesible
- Manejo de estados de carga y error

#### UserNotifications.js
- Componente para mostrar notificaciones del usuario
- Integración con el servicio de notificaciones del backend
- Marcado de notificaciones como leídas
- Interfaz intuitiva con contador de notificaciones no leídas

## Configuración Requerida

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto frontend:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_APP_NAME=SMD VITAL
REACT_APP_ENVIRONMENT=development
```

### Backend Endpoints Esperados

El frontend ahora consume los siguientes endpoints:

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/google` - Autenticación con Google
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/logout` - Cerrar sesión

#### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil del usuario
- `GET /api/users/notifications` - Obtener notificaciones
- `PUT /api/users/notifications/{id}/read` - Marcar notificación como leída
- `PUT /api/users/notifications/settings` - Actualizar configuración de notificaciones

## Uso de los Nuevos Componentes

### UserProfileCard

```jsx
import UserProfileCard from 'components/UserProfileCard';

// Uso básico
<UserProfileCard />

// Con acciones personalizadas
<UserProfileCard 
  onEdit={() => console.log('Editar perfil')}
  showActions={true}
/>
```

### UserNotifications

```jsx
import UserNotifications from 'components/UserNotifications';

// Uso básico
<UserNotifications />

// Con altura personalizada
<UserNotifications maxHeight="500px" />
```

## Flujo de Datos

### 1. Login
1. Usuario ingresa credenciales
2. AuthContext.login() llama a apiService.login()
3. Se obtiene el token de acceso
4. Se llama a userService.getUserProfile() para obtener datos completos
5. Se actualiza el estado global del usuario

### 2. Carga de Perfil
1. Componente llama a useUserProfile() o userService.getUserProfile()
2. Se hace petición a /api/users/profile
3. Los datos se transforman usando transformUserProfile()
4. Se actualiza el estado local del componente

### 3. Actualización de Perfil
1. Usuario modifica datos en el formulario
2. Se valida usando validateProfileData()
3. Se envía a /api/users/profile con método PUT
4. Se actualiza el estado local y global

## Consideraciones de Seguridad

### Tokens de Autenticación
- Almacenamiento seguro en localStorage
- Renovación automática de tokens
- Limpieza automática en logout

### Validación de Datos
- Validación en frontend antes de enviar
- Sanitización de datos de entrada
- Validación de tipos y formatos