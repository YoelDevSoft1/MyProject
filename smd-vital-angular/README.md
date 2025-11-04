# SMD VITAL - Frontend Angular

Sistema Médico Digital Frontend desarrollado con Angular 20 y Docker.

## 🚀 Características

- **Angular 20** con Standalone Components y las últimas características
- **Angular Material** para UI components
- **Docker** para desarrollo y producción
- **TypeScript** estricto
- **SCSS** para estilos
- **PWA Ready** para aplicaciones móviles
- **Responsive Design** para todos los dispositivos

## 🏗️ Arquitectura

```
src/
├── app/
│   ├── core/                 # Servicios core, guards, interceptors
│   ├── features/             # Módulos de funcionalidades
│   │   ├── auth/            # Autenticación
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── appointments/    # Gestión de citas
│   │   ├── patients/        # Gestión de pacientes
│   │   ├── medical-records/ # Registros médicos
│   │   ├── payments/        # Sistema de pagos
│   │   ├── notifications/   # Notificaciones
│   │   ├── ai-chat/         # Chat con IA
│   │   ├── profile/         # Perfil de usuario
│   │   └── admin/           # Panel de administración
│   └── shared/              # Componentes compartidos
├── assets/                  # Recursos estáticos
└── environments/            # Configuraciones de entorno
```

## 🐳 Desarrollo con Docker

### Desarrollo
```bash
# Construir y ejecutar en modo desarrollo
docker-compose up --build

# Solo ejecutar (si ya está construido)
docker-compose up
```

### Producción
```bash
# Construir y ejecutar en modo producción
docker-compose --profile production up --build
```

## 🛠️ Desarrollo Local

### Prerrequisitos
- Node.js 20+
- npm 8+

### Instalación
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build:prod
```

## 📱 Funcionalidades

### 🔐 Autenticación
- Login con email/contraseña
- Autenticación con Google OAuth
- Gestión de sesiones
- Protección de rutas

### 📊 Dashboard
- Estadísticas en tiempo real
- Gráficos interactivos
- Accesos rápidos
- Notificaciones

### 📅 Citas Médicas
- Calendario interactivo
- Reserva de citas
- Gestión de disponibilidad
- Recordatorios

### 👥 Gestión de Pacientes
- Lista de pacientes
- Perfiles detallados
- Historial médico
- Búsqueda avanzada

### 🏥 Registros Médicos
- Historial clínico
- Prescripciones
- Signos vitales
- Alergias

### 💳 Sistema de Pagos
- Procesamiento de pagos
- Facturación
- Historial de transacciones

### 🔔 Notificaciones
- Notificaciones en tiempo real
- Configuración personalizada
- Historial de notificaciones

### 🤖 IA Médica
- Chat inteligente
- Consultas médicas
- Análisis de síntomas

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start                 # Servidor de desarrollo
npm run build            # Construir para desarrollo
npm run build:prod       # Construir para producción
npm run serve:prod       # Servir build de producción

# Testing
npm test                 # Ejecutar tests unitarios
npm run test:ci          # Tests en modo CI
npm run e2e              # Tests end-to-end

# Linting
npm run lint             # Ejecutar linter
```

## 🌐 URLs

- **Desarrollo:** http://localhost:4200
- **Producción:** http://localhost:80
- **API Backend:** http://localhost:8000

## 🔗 Integración con Backend

El frontend se conecta al backend a través del API Gateway en el puerto 8000:

- **Autenticación:** `/login`, `/register`, `/google`
- **Usuarios:** `/users`, `/profile`
- **Citas:** `/appointments`
- **Registros Médicos:** `/medical-records`
- **Pagos:** `/payments`
- **Notificaciones:** `/notifications`
- **IA:** `/ai/chat`, `/ai/sessions`
- **Admin:** `/admin/*`

## 🚀 Despliegue

### Docker
```bash
# Construir imagen
docker build -t smd-vital-angular .

# Ejecutar contenedor
docker run -p 80:80 smd-vital-angular
```

### Docker Compose
```bash
# Desarrollo
docker-compose up

# Producción
docker-compose --profile production up
```

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

**SMD VITAL Frontend** - Desarrollado con Angular y Docker 🏥✨
