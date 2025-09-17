// ========================================
// CONFIGURACIÓN ESPECÍFICA SMD VITAL BOGOTÁ
// ========================================

export const smdVitalBogotaConfig = {
  // Información de la empresa
  company: {
    name: "SMD Vital Bogotá",
    fullName: "Sistema Médico Digital Vital Bogotá",
    slogan: "Cuidando tu salud con tecnología de vanguardia",
    description: "Centro médico especializado en atención integral con tecnología avanzada y personal altamente calificado en Bogotá, Colombia.",
    founded: "2020",
    location: "Bogotá, Colombia",
    address: "Carrera 15 #93-07, Bogotá, Colombia",
    phone: "+57 (1) 234-5678",
    email: "contacto@smdvitalbogota.com",
    website: "www.smdvitalbogota.com",
    nits: "900.123.456-7",
    rnt: "12345",
  },

  // Información de sedes
  locations: [
    {
      id: "principal",
      name: "Sede Principal",
      address: "Carrera 15 #93-07, Bogotá",
      phone: "+57 (1) 234-5678",
      email: "principal@smdvitalbogota.com",
      specialties: ["Medicina General", "Cardiología", "Neurología", "Pediatría"],
      services: ["Consultas", "Exámenes", "Procedimientos", "Urgencias"],
      hours: {
        monday: "7:00 AM - 7:00 PM",
        tuesday: "7:00 AM - 7:00 PM",
        wednesday: "7:00 AM - 7:00 PM",
        thursday: "7:00 AM - 7:00 PM",
        friday: "7:00 AM - 7:00 PM",
        saturday: "8:00 AM - 2:00 PM",
        sunday: "Cerrado"
      }
    },
    {
      id: "norte",
      name: "Sede Norte",
      address: "Calle 127 #15-20, Bogotá",
      phone: "+57 (1) 234-5679",
      email: "norte@smdvitalbogota.com",
      specialties: ["Medicina General", "Ginecología", "Oftalmología"],
      services: ["Consultas", "Exámenes"],
      hours: {
        monday: "8:00 AM - 6:00 PM",
        tuesday: "8:00 AM - 6:00 PM",
        wednesday: "8:00 AM - 6:00 PM",
        thursday: "8:00 AM - 6:00 PM",
        friday: "8:00 AM - 6:00 PM",
        saturday: "8:00 AM - 12:00 PM",
        sunday: "Cerrado"
      }
    }
  ],

  // Especialidades médicas
  specialties: [
    { id: "general", name: "Medicina General", icon: "local_hospital" },
    { id: "cardiology", name: "Cardiología", icon: "favorite" },
    { id: "neurology", name: "Neurología", icon: "psychology" },
    { id: "pediatrics", name: "Pediatría", icon: "child_care" },
    { id: "gynecology", name: "Ginecología", icon: "pregnant_woman" },
    { id: "ophthalmology", name: "Oftalmología", icon: "visibility" },
    { id: "dermatology", name: "Dermatología", icon: "face" },
    { id: "orthopedics", name: "Ortopedia", icon: "accessibility" },
    { id: "psychiatry", name: "Psiquiatría", icon: "psychology" },
    { id: "urology", name: "Urología", icon: "healing" }
  ],

  // Servicios médicos
  services: [
    { id: "consultation", name: "Consultas Médicas", description: "Atención médica especializada" },
    { id: "emergency", name: "Servicio de Urgencias", description: "Atención médica 24/7" },
    { id: "exams", name: "Exámenes de Laboratorio", description: "Análisis clínicos completos" },
    { id: "imaging", name: "Imágenes Diagnósticas", description: "Rayos X, ecografías, tomografías" },
    { id: "procedures", name: "Procedimientos Médicos", description: "Intervenciones ambulatorias" },
    { id: "vaccination", name: "Vacunación", description: "Programa de vacunación completo" },
    { id: "prevention", name: "Medicina Preventiva", description: "Chequeos y prevención" },
    { id: "telemedicine", name: "Telemedicina", description: "Consultas virtuales" }
  ],

  // Configuración de precios (en COP)
  pricing: {
    consultation: {
      general: 150000,
      specialist: 200000,
      emergency: 300000
    },
    exams: {
      basic: 50000,
      complete: 150000,
      specialized: 300000
    },
    procedures: {
      minor: 200000,
      major: 500000
    }
  },

  // Configuración del sistema
  system: {
    timezone: "America/Bogota",
    currency: "COP",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm",
    language: "es",
    country: "CO",
    region: "Bogotá"
  },

  // Configuración de notificaciones
  notifications: {
    email: {
      enabled: true,
      templates: {
        appointment: "confirmacion-cita",
        reminder: "recordatorio-cita",
        results: "resultados-examen"
      }
    },
    sms: {
      enabled: true,
      provider: "colombia-sms"
    },
    push: {
      enabled: true
    }
  },

  // Configuración de IA médica
  ai: {
    enabled: true,
    features: [
      "Diagnóstico asistido",
      "Análisis de síntomas",
      "Recomendaciones de tratamiento",
      "Predicción de riesgos",
      "Análisis de imágenes médicas"
    ],
    models: [
      "diagnosis-v1",
      "symptoms-analyzer",
      "risk-predictor",
      "image-analyzer"
    ]
  },

  // Configuración de integración
  integrations: {
    eps: [
      "Sura",
      "Sanitas",
      "Compensar",
      "Nueva EPS",
      "Famisanar",
      "Cafesalud"
    ],
    laboratories: [
      "Laboratorio Clínico SMD",
      "Laboratorio Colsanitas",
      "Laboratorio Clínico Colsubsidio"
    ],
    pharmacies: [
      "Farmacia SMD",
      "Farmacia Colsubsidio",
      "Farmacia Cruz Verde"
    ]
  },

  // Configuración de reportes
  reports: {
    formats: ["PDF", "Excel", "CSV"],
    schedules: ["diario", "semanal", "mensual"],
    recipients: ["admin@smdvitalbogota.com", "gerencia@smdvitalbogota.com"]
  },

  // Configuración de seguridad
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    sessionTimeout: 30, // minutos
    maxLoginAttempts: 3,
    twoFactorAuth: true
  }
};

export default smdVitalBogotaConfig;

