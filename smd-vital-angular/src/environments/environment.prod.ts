export const environment = {
  production: true,
  apiUrl: 'https://api.smdvital.com',
  googleClientId: '719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com',
  appName: 'SMD VITAL',
  appVersion: '1.0.0',
  features: {
    aiChat: true,
    notifications: true,
    payments: true,
    analytics: true
  },
  apiEndpoints: {
    auth: {
      login: '/login',
      register: '/register',
      google: '/google',
      logout: '/logout',
      me: '/me'
    },
    users: {
      list: '/users',
      profile: '/profile',
      update: '/users/update'
    },
    appointments: {
      list: '/appointments',
      create: '/appointments',
      update: '/appointments',
      delete: '/appointments'
    },
    medicalRecords: {
      list: '/medical-records',
      create: '/medical-records',
      update: '/medical-records',
      prescriptions: '/prescriptions',
      vitalSigns: '/vital-signs',
      allergies: '/allergies'
    },
    payments: {
      list: '/payments',
      create: '/payments',
      process: '/payments/process'
    },
    notifications: {
      list: '/notifications',
      markRead: '/notifications/mark-read'
    },
    ai: {
      chat: '/ai/chat',
      sessions: '/ai/sessions'
    },
    admin: {
      users: '/admin/users',
      roles: '/admin/roles',
      stats: '/admin/system-stats',
      logs: '/admin/audit-logs'
    }
  }
};
