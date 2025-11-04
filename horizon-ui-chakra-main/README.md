# SMD VITAL - Sistema Médico Digital

![version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

## 🏥 Descripción

SMD VITAL es un sistema médico digital completo desarrollado con React y Chakra UI, diseñado para gestionar citas médicas, historiales clínicos, pagos y notificaciones en tiempo real.

## ✨ Características Principales

### 🔐 Autenticación
- Login con email y contraseña
- Autenticación con Google OAuth
- Gestión de sesiones seguras
- Protección de rutas

### 👥 Gestión de Usuarios
- Perfiles de pacientes y doctores
- Información médica completa
- Historial de actividad
- Logs de seguridad
- Preferencias personalizables

### 📅 Sistema de Citas
- Calendario interactivo
- Reserva de citas médicas
- Gestión de disponibilidad
- Recordatorios automáticos

### 🏥 Registros Médicos
- Historial clínico digital
- Prescripciones médicas
- Signos vitales
- Alergias y medicamentos

### 💳 Sistema de Pagos
- Procesamiento de pagos
- Facturación digital
- Historial de transacciones
- Múltiples métodos de pago

### 🔔 Notificaciones
- Notificaciones en tiempo real
- Recordatorios de citas
- Alertas médicas
- Configuración personalizada

### 🤖 IA Médica
- Consultas inteligentes
- Análisis de síntomas
- Recomendaciones médicas
- Chat médico asistido por IA

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión LTS)
- npm o yarn
- Docker y Docker Compose

### Instalación

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd smd-vital-frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

4. **Configurar el archivo .env:**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

5. **Iniciar el servidor de desarrollo:**
```bash
npm start
```

## 🏗️ Arquitectura

### Frontend
- **React 18** - Biblioteca principal
- **Chakra UI** - Sistema de diseño
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Context API** - Gestión de estado

### Backend (Microservicios)
- **Auth Service** - Autenticación y autorización
- **User Service** - Gestión de usuarios y perfiles
- **Appointment Service** - Sistema de citas
- **Medical Records Service** - Registros médicos
- **Payment Service** - Procesamiento de pagos
- **Notification Service** - Notificaciones
- **AI Service** - Inteligencia artificial médica

### Infraestructura
- **Docker** - Contenedores
- **Nginx** - API Gateway
- **PostgreSQL** - Base de datos
- **Redis** - Cache y sesiones

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── appointments/    # Componentes de citas
│   ├── calendar/        # Componentes de calendario
│   ├── charts/          # Gráficos y estadísticas
│   ├── forms/           # Formularios
│   └── ui/              # Componentes de interfaz
├── views/               # Páginas principales
│   ├── admin/           # Panel de administración
│   ├── auth/            # Páginas de autenticación
│   └── medical/         # Módulos médicos
├── services/            # Servicios de API
├── contexts/            # Contextos de React
├── hooks/               # Hooks personalizados
├── utils/               # Utilidades
└── theme/               # Configuración de tema
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start                 # Inicia el servidor de desarrollo
npm run build            # Construye la aplicación para producción
npm test                 # Ejecuta las pruebas

# Docker
docker-compose up        # Inicia todos los servicios
docker-compose down      # Detiene todos los servicios
```

## 🌐 URLs de Desarrollo

- **Frontend:** http://localhost:3001
- **API Gateway:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

## 📱 Módulos Principales

### Dashboard
- Resumen de estadísticas
- Gráficos de rendimiento
- Accesos rápidos

### Gestión de Citas
- Calendario de citas
- Reserva de citas
- Historial de citas

### Registros Médicos
- Historial clínico
- Prescripciones
- Signos vitales

### Pagos
- Procesamiento de pagos
- Facturación
- Historial de transacciones

### Administración
- Gestión de usuarios
- Configuración del sistema
- Logs de auditoría

## 🔒 Seguridad

- Autenticación JWT
- Cifrado de datos sensibles
- Validación de entrada
- Protección CSRF
- Headers de seguridad

## 🚀 Despliegue

### Desarrollo
```bash
npm start
```

### Producción
```bash
npm run build
docker-compose -f docker-compose.prod.yml up
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.

---

**SMD VITAL** - Transformando la atención médica digital 🏥✨